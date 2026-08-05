import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import PostCard from "@/components/PostCard";
import { timeAgo } from "@/lib/workouts";
import { displayName, fetchUser } from "@/lib/profile";
import { notify } from "@/lib/dm";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [meId, setMeId] = useState(null);
  const [users, setUsers] = useState({});

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setMeId(me?.id);
      const p = await base44.entities.Post.get(id).catch(() => null);
      setPost(p);
      const cs = await base44.entities.Comment.filter({ post_id: id }, "-created_date", 500).catch(() => []);
      setComments(cs);
      const ids = [...new Set(cs.map((c) => c.created_by_id).filter(Boolean))];
      const us = await Promise.all(ids.map((uid) => fetchUser(uid).catch(() => null)));
      const m = {};
      us.forEach((u) => { if (u) m[u.id] = u; });
      setUsers(m);
      setLoading(false);
    })();
  }, [id]);

  async function addComment() {
    if (!draft.trim() || !post) return;
    setPosting(true);
    const c = await base44.entities.Comment.create({ post_id: id, content: draft.trim(), likes: 0 });
    setComments((cs) => [c, ...cs]);
    setPost((p) => p ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p);
    setDraft("");
    setPosting(false);
    base44.entities.Post.update(id, { comments_count: (post.comments_count || 0) + 1 }).catch(() => {});
    if (post.created_by_id && post.created_by_id !== meId) notify(post.created_by_id, meId, "comment", `コメント: ${draft.trim().slice(0, 30)}`, id).catch(() => {});
  }

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
  );
  if (!post) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center text-muted-foreground">
      投稿が見つかりませんでした
      <div className="mt-4"><button onClick={() => navigate(-1)} className="text-primary hover:underline">戻る</button></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" /> 戻る
      </button>

      <PostCard post={post} />

      <div className="glass rounded-2xl border border-border p-4">
        <h2 className="text-sm font-semibold mb-3">コメント {comments.length}件</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="コメントを書く…"
            className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && addComment()}
          />
          <button onClick={addComment} disabled={posting || !draft.trim()} className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground disabled:opacity-40">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {comments.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">まだコメントがありません</div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => {
              const u = users[c.created_by_id];
              const name = displayName(u);
              return (
                <div key={c.id} className="flex gap-2">
                  <Link to={u ? `/profile/${u.id}` : "#"} className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0">
                    {u?.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs">
                      <Link to={u ? `/profile/${u.id}` : "#"} className="font-medium hover:text-primary">{name}</Link>
                      <span className="text-muted-foreground ml-1">{timeAgo(c.created_date)}</span>
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
  );
}