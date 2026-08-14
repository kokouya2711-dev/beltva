import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { CATEGORY_STYLE } from "@/lib/community";
import EditPostDialog from "@/components/EditPostDialog";
import UserLink from "@/components/UserLink";
import MediaGrid from "@/components/MediaGrid";
import MediaViewer from "@/components/MediaViewer";
import { useT } from "@/lib/i18n";
import { useTCategory, useTWorkout, useFormatNumber } from "@/lib/i18nHelpers";
import { formatPostListTime } from "@/lib/timeFormat";
import { fetchUser } from "@/lib/profile";
import { notify } from "@/lib/dm";
import { getMediaUrls } from "@/lib/media";

export default function PostCard({ post, meId, initialLikers = [] }) {
  const t = useT();
  const tCat = useTCategory();
  const tWorkout = useTWorkout();
  const fmtNum = useFormatNumber();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || 0);
  const [likers, setLikers] = useState(initialLikers);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showEdit, setShowEdit] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [author, setAuthor] = useState(post.created_by || null);
  const [viewerIndex, setViewerIndex] = useState(null);
  const mediaUrls = getMediaUrls(currentPost);

  useEffect(() => {
    if (currentPost.is_anonymous || currentPost.created_by) return;
    if (!currentPost.created_by_id) return;
    fetchUser(currentPost.created_by_id).then(setAuthor).catch(() => {});
  }, [currentPost.created_by_id, currentPost.is_anonymous, currentPost.created_by]);

  const myLikeId = useMemo(() => likers.find((l) => l.created_by_id === meId)?.id || null, [likers, meId]);

  const style = CATEGORY_STYLE[currentPost.category] || CATEGORY_STYLE["シェア"];
  const liked = !!myLikeId;
  const isOwner = meId && currentPost.created_by_id === meId && !currentPost.is_anonymous;

  async function deletePost() {
    if (!isOwner) return;
    if (!window.confirm(t("post.deleteConfirm"))) return;
    await base44.entities.Post.delete(currentPost.id).catch(() => {});
    window.location.reload();
  }

  async function toggleLike(e) {
    e.stopPropagation();
    if (!meId) return;
    if (myLikeId) {
      setLikes((l) => Math.max(0, l - 1));
      setLikers((arr) => arr.filter((l) => l.id !== myLikeId));
      base44.entities.Like.delete(myLikeId).catch(() => {});
      base44.entities.Post.update(post.id, { likes: Math.max(0, likes - 1) }).catch(() => {});
    } else {
      const rec = await base44.entities.Like.create({ post_id: post.id });
      setLikes((l) => l + 1);
      setLikers((arr) => [rec, ...arr]);
      base44.entities.Post.update(post.id, { likes: likes + 1 }).catch(() => {});
      if (post.created_by_id && post.created_by_id !== meId && !post.is_anonymous) {
        notify(post.created_by_id, meId, "like", t("notif.liked"), post.id).catch(() => {});
      }
    }
  }

  return (
    <div className="pt-5 pb-5 cursor-pointer" onClick={() => navigate(`/posts/${post.id}`)}>
      <div className="flex items-center gap-3 mb-2" onClick={(e) => e.stopPropagation()}>
        {currentPost.is_anonymous ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">匿</div>
            <span className="text-sm font-medium">{t("post.anonymousLabel")}</span>
          </div>
        ) : (
          <UserLink user={author} size="lg" className="flex-1" />
        )}
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.bg} ${style.color} shrink-0`}>{tCat(currentPost.category)}</span>
        {isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setShowEdit(true)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition" title={t("common.edit")}>
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={deletePost} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition" title={t("common.delete")}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground mb-2">{formatPostListTime(currentPost.created_date)}{currentPost.workout_type ? ` · ${tWorkout(currentPost.workout_type)}` : ""}</div>

      <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-3">{currentPost.content}</div>

      {mediaUrls.length > 0 && (
        <MediaGrid mediaUrls={mediaUrls} onTap={(i) => setViewerIndex(i)} />
      )}
      {viewerIndex !== null && (
        <MediaViewer mediaUrls={mediaUrls} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}

      <div className="flex items-center gap-4 text-sm" onClick={(e) => e.stopPropagation()}>
        <button onClick={toggleLike} className={`flex items-center gap-1.5 transition ${liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {fmtNum(likes)}
        </button>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MessageCircle className="w-4 h-4" /> {fmtNum(commentsCount)}
        </span>
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