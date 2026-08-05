import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/PostCard";
import CreatePostDialog from "@/components/CreatePostDialog";
import SuggestedUsers from "@/components/SuggestedUsers";
import { Plus, Loader2, MessageSquare, Globe, Users } from "lucide-react";
import { POST_CATEGORIES, CATEGORY_STYLE } from "@/lib/community";

export default function TimelinePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("すべて");
  const [scope, setScope] = useState("all");
  const [me, setMe] = useState(null);
  const [followIds, setFollowIds] = useState(null);
  const [likesByPost, setLikesByPost] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});

  async function load() {
    const [ps, meUser, allLikes, allComments] = await Promise.all([
      base44.entities.Post.list("-created_date", 50),
      base44.auth.me().catch(() => null),
      base44.entities.Like.list("-created_date", 500).catch(() => []),
      base44.entities.Comment.list("-created_date", 200).catch(() => [])
    ]);
    setPosts(ps);
    setMe(meUser);
    const lMap = {};
    allLikes.forEach((l) => { (lMap[l.post_id] = lMap[l.post_id] || []).push(l); });
    setLikesByPost(lMap);
    const cMap = {};
    allComments.forEach((c) => { (cMap[c.post_id] = cMap[c.post_id] || []).push(c); });
    setCommentsByPost(cMap);
    if (meUser) {
      const f = await base44.entities.Follow.filter({ follower_id: meUser.id }).catch(() => []);
      setFollowIds(new Set(f.map((x) => x.followee_id)));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe((event) => {
      if (event.type === "create") {
        setPosts((prev) => prev.some((p) => p.id === event.data.id) ? prev : [event.data, ...prev]);
      }
    });
    return unsub;
  }, []);

  let filtered = filter === "すべて" ? posts : posts.filter((p) => p.category === filter);
  if (scope === "following" && me && followIds) {
    filtered = filtered.filter((p) => followIds.has(p.created_by_id) || p.created_by_id === me.id);
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">タイムライン</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> 投稿
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setScope("all")} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${scope === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
              <Globe className="w-3.5 h-3.5" /> 全体
            </button>
            <button onClick={() => setScope("following")} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${scope === "following" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
              <Users className="w-3.5 h-3.5" /> フォロー中
            </button>
          </div>

          <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
            {["すべて", ...POST_CATEGORIES].map((c) => {
              const active = filter === c;
              const s = CATEGORY_STYLE[c];
              return (
                <button key={c} onClick={() => setFilter(c)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${active ? (s ? `${s.bg} ${s.color} ${s.border}` : "bg-primary/10 text-primary border-primary/30") : "border-border text-muted-foreground"}`}>{c}</button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl border border-border py-16 flex flex-col items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-10 h-10 opacity-40" />
              <div className="text-sm">{scope === "following" ? "フォロー中のユーザーの投稿がありません" : "投稿がありません。最初の相談・質問を投稿しよう！"}</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((p) => <PostCard key={p.id} post={p} meId={me?.id} initialLikers={likesByPost[p.id] || []} initialComments={commentsByPost[p.id] || []} />)}
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-4">
            {me && <SuggestedUsers meId={me.id} />}
          </div>
        </aside>
      </div>

      <div className="lg:hidden mt-6">
        {me && <SuggestedUsers meId={me.id} />}
      </div>

      {showCreate && <CreatePostDialog onClose={() => setShowCreate(false)} onSaved={load} />}
    </div>
  );
}