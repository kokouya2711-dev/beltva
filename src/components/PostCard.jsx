import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import { CATEGORY_STYLE } from "@/lib/community";
import UserLink from "@/components/UserLink";
import { timeAgo, formatNumber } from "@/lib/workouts";
import { notify } from "@/lib/dm";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadedComments, setLoadedComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [meId, setMeId] = useState(null);

  useEffect(() => { base44.auth.me().then((u) => setMeId(u?.id)).catch(() => {}); }, []);

  const style = CATEGORY_STYLE[post.category] || CATEGORY_STYLE["シェア"];

  async function like() {
    if (liked) return;
    setLiked(true);
    setLikes((l) => l + 1);
    base44.entities.Post.update(post.id, { likes: likes + 1 }).catch(() => {});
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
        <button onClick={like} className={`flex items-center gap-1.5 transition ${liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {formatNumber(likes)}
        </button>
        <button onClick={toggleComments} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition">
          <MessageCircle className="w-4 h-4" /> {formatNumber(commentsCount)}
        </button>
      </div>

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