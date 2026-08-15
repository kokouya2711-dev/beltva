import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Loader2, Heart } from "lucide-react";
import { CATEGORY_STYLE } from "@/lib/community";
import MediaGrid from "@/components/MediaGrid";
import MediaViewer from "@/components/MediaViewer";
import PostMenu from "@/components/PostMenu";
import { getMediaUrls } from "@/lib/media";
import UserLink from "@/components/UserLink";
import { useT } from "@/lib/i18n";
import { useTCategory, useTWorkout, useFormatNumber } from "@/lib/i18nHelpers";
import { formatAbsoluteTime } from "@/lib/timeFormat";
import { displayName, fetchUser } from "@/lib/profile";
import { notify } from "@/lib/dm";

export default function PostDetail() {
  const t = useT();
  const tCat = useTCategory();
  const tWorkout = useTWorkout();
  const fmtNum = useFormatNumber();
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [meId, setMeId] = useState(null);
  const [users, setUsers] = useState({});
  const [likers, setLikers] = useState([]);
  const [likes, setLikes] = useState(0);
  const [author, setAuthor] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favId, setFavId] = useState(null);
  const inputBarRef = useRef(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setMeId(me?.id);
      const p = await base44.entities.Post.get(id).catch(() => null);
      setPost(p);
      setLikes(p?.likes || 0);
      const cs = await base44.entities.Comment.filter({ post_id: id }, "-created_date", 500).catch(() => []);
      setComments(cs);
      const ls = await base44.entities.Like.filter({ post_id: id }, "-created_date", 100).catch(() => []);
      setLikers(ls);
      const ids = new Set([
        ...cs.map((c) => c.created_by_id).filter(Boolean),
        ...ls.map((l) => l.created_by_id).filter(Boolean),
        p?.created_by_id
      ]);
      const us = await Promise.all([...ids].map((uid) => fetchUser(uid).catch(() => null)));
      const m = {};
      us.forEach((u) => { if (u) m[u.id] = u; });
      setUsers(m);
      if (p?.created_by_id && !p.is_anonymous) setAuthor(m[p.created_by_id] || null);
      if (me?.id && p?.id) {
        const fs = await base44.entities.Favorite.filter({ post_id: p.id, created_by_id: me.id }).catch(() => []);
        if (fs.length) { setIsFavorited(true); setFavId(fs[0].id); }
      }
      setLoading(false);
    })();
  }, [id]);

  // Keep input bar above keyboard via visualViewport
  useEffect(() => {
    const bar = inputBarRef.current;
    if (!bar || !window.visualViewport) return;
    const onResize = () => {
      const keyboardHeight = window.innerHeight - window.visualViewport.height;
      bar.style.transform = keyboardHeight > 10 ? `translateY(${-keyboardHeight}px)` : "";
    };
    window.visualViewport.addEventListener("resize", onResize);
    window.visualViewport.addEventListener("scroll", onResize);
    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
      window.visualViewport.removeEventListener("scroll", onResize);
    };
  }, []);

  const myLikeId = useMemo(() => likers.find((l) => l.created_by_id === meId)?.id || null, [likers, meId]);
  const mediaUrls = post ? getMediaUrls(post) : [];
  const liked = !!myLikeId;
  const style = CATEGORY_STYLE[post?.category] || CATEGORY_STYLE["シェア"];

  async function toggleLike() {
    if (!meId || !post) return;
    if (myLikeId) {
      setLikes((l) => Math.max(0, l - 1));
      setLikers((arr) => arr.filter((l) => l.id !== myLikeId));
      base44.entities.Like.delete(myLikeId).catch(() => {});
      base44.entities.Post.update(post.id, { likes: Math.max(0, likes - 1) }).catch(() => {});
    } else {
      navigator.vibrate?.(30);
      const rec = await base44.entities.Like.create({ post_id: post.id });
      setLikes((l) => l + 1);
      setLikers((arr) => [rec, ...arr]);
      base44.entities.Post.update(post.id, { likes: likes + 1 }).catch(() => {});
      if (post.created_by_id && post.created_by_id !== meId && !post.is_anonymous) {
        notify(post.created_by_id, meId, "like", t("notif.liked"), post.id).catch(() => {});
      }
    }
  }

  async function addComment() {
    if (!draft.trim() || !post) return;
    setPosting(true);
    const c = await base44.entities.Comment.create({ post_id: id, content: draft.trim(), likes: 0 });
    setComments((cs) => [c, ...cs]);
    setPost((p) => p ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p);
    setDraft("");
    setPosting(false);
    base44.entities.Post.update(id, { comments_count: (post.comments_count || 0) + 1 }).catch(() => {});
    if (post.created_by_id && post.created_by_id !== meId) notify(post.created_by_id, meId, "comment", `${t("post.commentPlaceholder")}: ${draft.trim().slice(0, 30)}`, id).catch(() => {});
  }

  async function toggleFavorite() {
    if (!meId || !post) return;
    if (isFavorited && favId) {
      await base44.entities.Favorite.delete(favId).catch(() => {});
      setIsFavorited(false);
      setFavId(null);
    } else {
      const rec = await base44.entities.Favorite.create({ post_id: post.id });
      setIsFavorited(true);
      setFavId(rec.id);
    }
  }

  async function deletePost() {
    if (!window.confirm(t("post.deleteConfirm"))) return;
    await base44.entities.Post.delete(post.id).catch(() => {});
    navigate(-1);
  }

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
  );
  if (!post) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center text-muted-foreground">
      {t("post.notFound")}
      <div className="mt-4"><button onClick={() => navigate(-1)} className="text-primary hover:underline">{t("common.back")}</button></div>
    </div>
  );

  return (
    <div>
      {/* Floating back button — round, no header bar */}
      <button
        onClick={() => navigate(-1)}
        className="fixed left-3 z-30 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-secondary transition"
        style={{ top: 'calc(0.5rem + env(safe-area-inset-top))' }}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top))', paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}>
        {/* Poster info */}
        <div className="flex items-center justify-between mb-3">
          {post.is_anonymous ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">匿</div>
              <span className="text-sm font-medium">{t("post.anonymousLabel")}</span>
            </div>
          ) : (
            <UserLink user={author} size="lg" />
          )}
          <span className="text-xs text-muted-foreground">{formatAbsoluteTime(post.created_date)}</span>
          <PostMenu
            post={post}
            meId={meId}
            isOwner={meId && post.created_by_id === meId && !post.is_anonymous}
            onEdit={() => navigate(`/timeline`)}
            onDelete={deletePost}
            onFavoriteToggle={toggleFavorite}
            isFavorited={isFavorited}
          />
        </div>

        {/* Category + workout type */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}>{tCat(post.category)}</span>
          {post.workout_type && <span className="text-xs text-muted-foreground">{tWorkout(post.workout_type)}</span>}
        </div>

        {/* Body */}
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-3">{post.content}</div>

        {/* Media */}
        {mediaUrls.length > 0 && (
          <MediaGrid mediaUrls={mediaUrls} onTap={(i) => setViewerIndex(i)} />
        )}
        {viewerIndex !== null && (
          <MediaViewer mediaUrls={mediaUrls} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
        )}

        {/* Likes & comments count */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center gap-4">
            <button onClick={toggleLike} className={`flex items-center gap-1.5 text-sm transition ${liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {fmtNum(likes)}
            </button>
            <span className="text-sm text-muted-foreground">{t("post.commentCount").replace("{n}", fmtNum(comments.length))}</span>
            </div>
            </div>

        {/* Likers preview — BELTVA original */}
        {likers.length > 0 && (
          <button onClick={() => navigate(`/posts/${id}/likers`)} className="w-full flex items-center gap-2 py-3 border-b border-border hover:opacity-80 transition text-left">
            <div className="flex -space-x-2">
              {likers.slice(0, 6).map((l) => {
                const u = users[l.created_by_id];
                return (
                  <div key={l.id} className="w-6 h-6 rounded-full bg-secondary overflow-hidden ring-2 ring-background flex items-center justify-center text-[8px] font-bold">
                    {u?.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : (u ? displayName(u).slice(0, 2).toUpperCase() : "?")}
                  </div>
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground">{t("post.likersCount").replace("{n}", likes)}</span>
          </button>
        )}

        {/* Comments */}
        <div className="pt-3">
          {comments.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">{t("post.noComments")}</div>
          ) : (
            <div className="divide-y divide-border">
              {comments.map((c) => {
                const u = users[c.created_by_id];
                const name = displayName(u);
                return (
                  <div key={c.id} className="py-3 flex gap-2.5">
                    <Link to={u ? `/profile/${u.id}` : "#"} className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0">
                      {u?.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs">
                        <Link to={u ? `/profile/${u.id}` : "#"} className="font-medium hover:text-primary">{name}</Link>
                        <span className="text-muted-foreground ml-1.5">{formatAbsoluteTime(c.created_date)}</span>
                      </div>
                      <div className="text-sm mt-0.5 whitespace-pre-wrap break-words">{c.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed comment input */}
      <div
        ref={inputBarRef}
        className="fixed left-0 right-0 z-30 glass border-t border-border px-3 py-2.5"
        style={{
          bottom: inputFocused ? "0" : "calc(56px + env(safe-area-inset-bottom))",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 0.625rem)",
          transition: "bottom 0.15s ease-out",
        }}
      >
        <div className="flex gap-2 max-w-2xl mx-auto items-end">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("post.commentPlaceholder")}
            className="flex-1 bg-secondary/80 border border-border rounded-full px-4 py-2 text-sm outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && addComment()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          <button onClick={addComment} disabled={posting || !draft.trim()} className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground disabled:opacity-40 shrink-0">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>


    </div>
  );
}