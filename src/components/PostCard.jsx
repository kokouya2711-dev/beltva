import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { CATEGORY_STYLE } from "@/lib/community";
import EditPostDialog from "@/components/EditPostDialog";
import UserLink from "@/components/UserLink";
import { useT } from "@/lib/i18n";
import { useTCategory, useTWorkout, useTimeAgo, useFormatNumber } from "@/lib/i18nHelpers";
import { displayName, fetchUser, flagEmoji } from "@/lib/profile";
import { notify } from "@/lib/dm";

export default function PostCard({ post, meId, initialLikers = [], initialComments = [] }) {
  const t = useT();
  const tCat = useTCategory();
  const tWorkout = useTWorkout();
  const timeAgo = useTimeAgo();
  const fmtNum = useFormatNumber();
  const [likes, setLikes] = useState(post.likes || 0);
  const [likers, setLikers] = useState(initialLikers);
  const [showLikers, setShowLikers] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [previewComments, setPreviewComments] = useState(initialComments.slice(0, 2));
  const [showEdit, setShowEdit] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [author, setAuthor] = useState(post.created_by || null);

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

  async function toggleLike() {
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
    <div className="glass rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        {currentPost.is_anonymous ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">匿</div>
            <span className="text-sm font-medium">{t("post.anonymousLabel")}</span>
          </div>
        ) : (
          <UserLink user={author} size="md" className="flex-1" />
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
      <div className="text-xs text-muted-foreground mb-3">{timeAgo(currentPost.created_date)}{currentPost.workout_type ? ` · ${tWorkout(currentPost.workout_type)}` : ""}</div>

      <div className="text-sm whitespace-pre-wrap break-words mb-3">{currentPost.content}</div>

      <div className="flex items-center gap-4 text-sm">
        <button onClick={toggleLike} className={`flex items-center gap-1.5 transition ${liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {fmtNum(likes)}
        </button>
        <Link to={`/posts/${post.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition">
          <MessageCircle className="w-4 h-4" /> {fmtNum(commentsCount)}
        </Link>
      </div>

      {likes > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex -space-x-2">
            {likers.slice(0, 5).map((l) => (
              <LikerAvatar key={l.id} userId={l.created_by_id} />
            ))}
          </div>
          <button onClick={() => setShowLikers((v) => !v)} className="text-xs text-muted-foreground hover:text-foreground transition">
            {showLikers ? t("common.close") : t("post.likersCount").replace("{n}", fmtNum(likes))}
          </button>
        </div>
      )}

      {showLikers && (
        <LikersList likers={likers} />
      )}

      <div className="mt-3 pt-3 border-t border-border">
        {previewComments.length === 0 ? (
          <Link to={`/posts/${post.id}`} className="text-xs text-muted-foreground hover:text-primary transition">
            {t("post.firstComment")}
          </Link>
        ) : (
          <div className="space-y-2">
            {previewComments.map((c) => (
              <Link key={c.id} to={`/posts/${post.id}`} className="flex gap-2 group">
                <CommentAvatar userId={c.created_by_id} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs">
                    <CommentName userId={c.created_by_id} />
                    <span className="text-muted-foreground ml-1">{timeAgo(c.created_date)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition line-clamp-2">{c.content}</div>
                </div>
              </Link>
            ))}
            {commentsCount > previewComments.length && (
              <Link to={`/posts/${post.id}`} className="text-xs text-primary hover:underline">
                {t("post.moreComments").replace("{n}", commentsCount - previewComments.length)}
              </Link>
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

function CommentAvatar({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(userId).then(setUser).catch(() => {}); }, [userId]);
  const name = displayName(user);
  return (
    <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0">
      {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function CommentName({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(userId).then(setUser).catch(() => {}); }, [userId]);
  return <span className="font-medium">{displayName(user)}</span>;
}

function LikerAvatar({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(userId).then(setUser).catch(() => {}); }, [userId]);
  const name = displayName(user);
  return (
    <Link to={user ? `/profile/${user.id}` : "#"} className="w-6 h-6 rounded-full bg-secondary border-2 border-card overflow-hidden flex items-center justify-center text-[9px] font-bold shrink-0 hover:z-10 relative">
      {user?.avatar_url ? (
        <img src={user.avatar_url} className="w-full h-full object-cover" />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </Link>
  );
}

function LikersList({ likers }) {
  const timeAgo = useTimeAgo();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const ids = [...new Set(likers.map((l) => l.created_by_id))];
      const us = await Promise.all(ids.map((id) => fetchUser(id).catch(() => null)));
      const m = {};
      us.forEach((u) => { if (u) m[u.id] = u; });
      setUsers(m);
      setLoading(false);
    })();
  }, [likers]);
  if (loading) return <div className="mt-2 flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;
  return (
    <div className="mt-2 pt-2 border-t border-border space-y-2">
      {likers.map((l) => {
        const u = users[l.created_by_id];
        const name = displayName(u);
        return (
          <Link key={l.id} to={u ? `/profile/${u.id}` : "#"} className="flex items-center gap-2 hover:bg-secondary/40 rounded-lg px-1.5 py-1 transition">
            <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0">
              {u?.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm truncate">{name}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(l.created_date)}</span>
          </Link>
        );
      })}
    </div>
  );
}