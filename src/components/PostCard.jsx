import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import { CATEGORY_STYLE } from "@/lib/community";
import UserLink from "@/components/UserLink";
import { timeAgo, formatNumber } from "@/lib/workouts";
import { displayName, fetchUser } from "@/lib/profile";
import { notify } from "@/lib/dm";

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [likers, setLikers] = useState([]);
  const [myLikeId, setMyLikeId] = useState(null);
  const [showLikers, setShowLikers] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadedComments, setLoadedComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [meId, setMeId] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setMeId(me?.id);
      const ls = await base44.entities.Like.filter({ post_id: post.id }, "-created_date", 200).catch(() => []);
      setLikers(ls);
      const mine = ls.find((l) => l.created_by_id === me?.id);
      setMyLikeId(mine?.id || null);
    })();
  }, [post.id]);

  const style = CATEGORY_STYLE[post.category] || CATEGORY_STYLE["シェア"];
  const liked = !!myLikeId;

  async function toggleLike() {
    if (!meId) return;
    if (myLikeId) {
      setMyLikeId(null);
      setLikes((l) => Math.max(0, l - 1));
      setLikers((arr) => arr.filter((l) => l.id !== myLikeId));
      base44.entities.Like.delete(myLikeId).catch(() => {});
      base44.entities.Post.update(post.id, { likes: Math.max(0, likes - 1) }).catch(() => {});
    } else {
      const rec = await base44.entities.Like.create({ post_id: post.id });
      setMyLikeId(rec.id);
      setLikes((l) => l + 1);
      setLikers((arr) => [rec, ...arr]);
      base44.entities.Post.update(post.id, { likes: likes + 1 }).catch(() => {});
      if (post.created_by_id && post.created_by_id !== meId && !post.is_anonymous) {
        notify(post.created_by_id, meId, "like", "あなたの投稿にいいねしました", post.id).catch(() => {});
      }
    }
  }

  async function loadComments() {
    const cs = await base44.entities.Comment.filter({ post_id: post.id }, "-created_date", 100);
    setComments(cs);
    setLoadedComments(true);
  }

  function toggleComments() {
    if (!showComments && !loadedComments) loadComments();
    setShowComments((v) => !v);
  }

  async function addComment() {
    if (!draft.trim()) return;
    setPosting(true);
    const c = await base44.entities.Comment.create({ post_id: post.id, content: draft.trim(), likes: 0 });
    setComments((cs) => [c, ...cs]);
    setCommentsCount((n) => n + 1);
    setDraft("");
    setPosting(false);
    base44.entities.Post.update(post.id, { comments_count: commentsCount + 1 }).catch(() => {});
    if (post.created_by_id && post.created_by_id !== meId) notify(post.created_by_id, meId, "comment", `コメント: ${draft.trim().slice(0, 30)}`, post.id);
  }

  return (
    <div className="glass rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        {post.is_anonymous ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">匿</div>
            <span className="text-sm font-medium">匿名</span>
          </div>
        ) : (
          <UserLink user={post.created_by} size="md" className="flex-1" />
        )}
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.bg} ${style.color} shrink-0`}>{post.category}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-3">{timeAgo(post.created_date)}{post.workout_type ? ` · ${post.workout_type}` : ""}</div>

      <div className="text-sm whitespace-pre-wrap break-words mb-3">{post.content}</div>

      <div className="flex items-center gap-4 text-sm">
        <button onClick={toggleLike} className={`flex items-center gap-1.5 transition ${liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {formatNumber(likes)}
        </button>
        <button onClick={toggleComments} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition">
          <MessageCircle className="w-4 h-4" /> {formatNumber(commentsCount)}
        </button>
      </div>

      {likes > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex -space-x-2">
            {likers.slice(0, 5).map((l) => (
              <LikerAvatar key={l.id} userId={l.created_by_id} />
            ))}
          </div>
          <button onClick={() => setShowLikers((v) => !v)} className="text-xs text-muted-foreground hover:text-foreground transition">
            {showLikers ? "閉じる" : `${formatNumber(likes)}人がいいねしました`}
          </button>
        </div>
      )}

      {showLikers && (
        <LikersList likers={likers} />
      )}

      {showComments && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="コメントを書く…" className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" onKeyDown={(e) => e.key === "Enter" && addComment()} />
            <button onClick={addComment} disabled={posting || !draft.trim()} className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground disabled:opacity-40">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {!loadedComments ? (
            <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-2">まだコメントがありません</div>
          ) : (
            comments.map((c) => {
              const ca = c.created_by?.full_name || c.created_by?.email?.split("@")[0] || "匿名";
              return (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0">{ca.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs"><span className="font-medium">{ca}</span> <span className="text-muted-foreground ml-1">{timeAgo(c.created_date)}</span></div>
                    <div className="text-sm">{c.content}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
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