import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle } from "lucide-react";
import EditPostDialog from "@/components/EditPostDialog";
import PostMenu from "@/components/PostMenu";
import UserLink from "@/components/UserLink";
import FollowButton from "@/components/FollowButton";
import MediaGrid from "@/components/MediaGrid";
import MediaViewer from "@/components/MediaViewer";
import { useT } from "@/lib/i18n";
import { useTWorkout, useFormatNumber } from "@/lib/i18nHelpers";
import { formatPostListTime } from "@/lib/timeFormat";
import { fetchUser, displayName } from "@/lib/profile";
import { notify } from "@/lib/dm";
import { getMediaUrls } from "@/lib/media";
import { haptic } from "@/lib/haptics";
import { getCommentCountUpdate, clearCommentCountUpdate } from "@/lib/commentCountStore";

export default function PostCard({ post, meId, initialLikers = [], initialFavorited, initialFavId, batchedAuthor, batchedComments, batchedUserMap, hideAuthor = false }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const fmtNum = useFormatNumber();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || 0);
  const [likers, setLikers] = useState(initialLikers);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showEdit, setShowEdit] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [author, setAuthor] = useState(batchedAuthor || post.created_by || null);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [isFavorited, setIsFavorited] = useState(initialFavorited ?? false);
  const [favId, setFavId] = useState(initialFavId ?? null);
  const [bounceKey, setBounceKey] = useState(0);
  const [previewComments, setPreviewComments] = useState(batchedComments ? batchedComments.slice(0, 2) : []);
  const [commentUsers, setCommentUsers] = useState(batchedUserMap || {});
  const [hasMoreComments, setHasMoreComments] = useState(batchedComments ? batchedComments.length >= 3 : false);
  const mediaUrls = getMediaUrls(currentPost);

  useEffect(() => {
    if (batchedAuthor) { setAuthor(batchedAuthor); return; }
    if (currentPost.is_anonymous || currentPost.created_by) return;
    if (!currentPost.created_by_id) return;
    fetchUser(currentPost.created_by_id).then(setAuthor).catch(() => {});
  }, [currentPost.created_by_id, currentPost.is_anonymous, currentPost.created_by, batchedAuthor]);

  // Only fetch favorite status individually if not provided by parent (batch-fetched)
  useEffect(() => {
    if (currentPost.isDummy) return;
    if (initialFavorited !== undefined) return;
    if (!meId || !currentPost.id) return;
    base44.entities.Favorite.filter({ post_id: currentPost.id, created_by_id: meId }).then((fs) => {
      if (fs.length) { setIsFavorited(true); setFavId(fs[0].id); }
    }).catch(() => {});
  }, [meId, currentPost.id, initialFavorited]);

  // Apply pending comment count update from PostDetail (covers remount after navigation)
  useEffect(() => {
    if (!currentPost.id) return;
    const updated = getCommentCountUpdate(currentPost.id);
    if (updated !== null) {
      setCommentsCount(updated);
      clearCommentCountUpdate(currentPost.id);
    }
  }, [currentPost.id]);

  // Fetch latest comments for preview (skip if batched data provided by parent)
  useEffect(() => {
    if (currentPost.isDummy) return;
    if (batchedComments || !currentPost.id) return;
    base44.entities.Comment.filter({ post_id: currentPost.id }, "-created_date", 3).then(async (cs) => {
      setPreviewComments(cs.slice(0, 2));
      setHasMoreComments(cs.length >= 3);
      const uids = [...new Set(cs.slice(0, 2).map(c => c.created_by_id).filter(Boolean))];
      if (uids.length) {
        const us = await Promise.all(uids.map(uid => fetchUser(uid).catch(() => null)));
        const m = {};
        us.forEach(u => { if (u) m[u.id] = u; });
        setCommentUsers(m);
      }
    }).catch(() => {});
  }, [currentPost.id, batchedComments]);

  // Sync comment count via Post subscription
  useEffect(() => {
    if (currentPost.isDummy || !currentPost.id) return;
    const unsub = base44.entities.Post.subscribe((event) => {
      if (event.data?.id === currentPost.id && event.type === "update" && event.data.comments_count !== undefined) {
        setCommentsCount(event.data.comments_count);
      }
    });
    return unsub;
  }, [currentPost.id]);

  const myLikeId = useMemo(() => likers.find((l) => l.created_by_id === meId)?.id || null, [likers, meId]);

  const liked = !!myLikeId;
  const isOwner = meId && currentPost.created_by_id === meId && !currentPost.is_anonymous;

  async function deletePost() {
    if (!isOwner) return;
    if (!window.confirm(t("post.deleteConfirm"))) return;
    await base44.entities.Post.delete(currentPost.id).catch(() => {});
    window.location.reload();
  }

  async function toggleFavorite() {
    if (!meId) return;
    if (isFavorited && favId) {
      await base44.entities.Favorite.delete(favId).catch(() => {});
      setIsFavorited(false);
      setFavId(null);
    } else {
      const rec = await base44.entities.Favorite.create({ post_id: currentPost.id });
      setIsFavorited(true);
      setFavId(rec.id);
    }
  }

  async function toggleLike(e) {
    e.stopPropagation();
    if (!meId) return;
    if (currentPost.isDummy) {
      if (myLikeId) {
        setLikes((l) => Math.max(0, l - 1));
        setLikers((arr) => arr.filter((l) => l.id !== myLikeId));
      } else {
        setLikes((l) => l + 1);
        setLikers((arr) => [...arr, { id: "demo-like-" + Date.now(), created_by_id: meId }]);
      }
      return;
    }
    if (myLikeId) {
      setLikes((l) => Math.max(0, l - 1));
      setLikers((arr) => arr.filter((l) => l.id !== myLikeId));
      base44.entities.Like.delete(myLikeId).catch(() => {});
      base44.entities.Post.update(post.id, { likes: Math.max(0, likes - 1) }).catch(() => {});
    } else {
      const vibrated = haptic(30);
      if (!vibrated) setBounceKey((k) => k + 1);
      const rec = await base44.entities.Like.create({ post_id: post.id });
      setLikes((l) => l + 1);
      setLikers((arr) => [rec, ...arr]);
      base44.entities.Post.update(post.id, { likes: likes + 1 }).catch(() => {});
      if (post.created_by_id && post.created_by_id !== meId && !post.is_anonymous) {
        notify(post.created_by_id, meId, "like", "notif.liked", post.id).catch(() => {});
      }
    }
  }

  return (
    <div className={`pt-5 pb-5 ${currentPost.isDummy ? "" : "cursor-pointer"}`} onClick={() => { if (!currentPost.isDummy) navigate(`/posts/${post.id}`); }}>
      {hideAuthor ? (
        <div className="flex items-center justify-between mb-2" onClick={(e) => e.stopPropagation()}>
          <div className="text-xs text-muted-foreground">{formatPostListTime(currentPost.created_date)}{currentPost.workout_type ? ` ${tWorkout(currentPost.workout_type)}` : ""}</div>
          <PostMenu
            post={currentPost}
            meId={meId}
            isOwner={isOwner}
            onEdit={() => setShowEdit(true)}
            onDelete={deletePost}
            onFavoriteToggle={toggleFavorite}
            isFavorited={isFavorited}
            onHidden={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-2" onClick={(e) => e.stopPropagation()}>
            {currentPost.is_anonymous ? (
              <div className="flex items-center gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">匿</div>
                <span className="text-sm font-medium">{t("post.anonymousLabel")}</span>
              </div>
            ) : (
              <>
                <UserLink user={author} size="lg" />
                <div className="flex-1" />
                {!isOwner && author?.id && (
                  <FollowButton targetId={author.id} meId={meId} size="compact" />
                )}
              </>
            )}
            <span className="w-1 shrink-0" />
            <PostMenu
              post={currentPost}
              meId={meId}
              isOwner={isOwner}
              onEdit={() => setShowEdit(true)}
              onDelete={deletePost}
              onFavoriteToggle={toggleFavorite}
              isFavorited={isFavorited}
              onHidden={() => window.location.reload()}
            />
          </div>
          <div className="text-xs text-muted-foreground mb-2">{formatPostListTime(currentPost.created_date)}{currentPost.workout_type ? ` ${tWorkout(currentPost.workout_type)}` : ""}</div>
        </>
      )}

      <div className="text-base font-medium leading-relaxed whitespace-pre-wrap break-words mb-3">{currentPost.content}</div>

      {mediaUrls.length > 0 && (
        <MediaGrid mediaUrls={mediaUrls} onTap={(i) => setViewerIndex(i)} />
      )}
      {viewerIndex !== null && (
        <MediaViewer mediaUrls={mediaUrls} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4 text-sm">
          <button onClick={toggleLike} className={`flex items-center gap-1.5 transition ${liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
            <span key={bounceKey} className={bounceKey > 0 ? "heart-bounce" : "inline-flex"}>
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            </span> {fmtNum(likes)}
          </button>
          <button onClick={(e) => { e.stopPropagation(); !currentPost.isDummy && navigate(`/posts/${post.id}?scroll=comments`); }} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition">
            <MessageCircle className="w-5 h-5" /> {fmtNum(commentsCount)}
          </button>
        </div>

        {previewComments.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {previewComments.map(c => {
              const u = commentUsers[c.created_by_id];
              const name = u ? displayName(u) : "...";
              const initials = name.slice(0, 2).toUpperCase();
              return (
                <div key={c.id} className="flex items-start gap-2.5 text-[15px] leading-snug">
                  <Link
                    to={u ? `/profile/${u.id}` : "#"}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  >
                    {u?.avatar_url ? (
                      <img src={u.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{initials}</div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={u ? `/profile/${u.id}` : "#"}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold mr-1.5 hover:text-primary transition"
                    >
                      {name}
                    </Link>
                    <span
                      className="text-foreground/90 text-[15px] whitespace-pre-wrap break-words cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); !currentPost.isDummy && navigate(`/posts/${post.id}?scroll=comments`); }}
                    >
                      {c.content}
                    </span>
                  </div>
                </div>
              );
            })}
            {hasMoreComments && (
              <button
                onClick={(e) => { e.stopPropagation(); !currentPost.isDummy && navigate(`/posts/${post.id}?scroll=comments`); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("post.viewAllComments")}
              </button>
            )}
          </div>
        )}
      </div>

      {showEdit && (
        <EditPostDialog
          post={currentPost}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setCurrentPost(updated)}
        />
      )}
    </div>
  );
}