import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/PostCard";
import CreatePostDialog from "@/components/CreatePostDialog";
import { Plus, Loader2, MessageSquare } from "lucide-react";
import { POST_CATEGORIES, CATEGORY_STYLE } from "@/lib/community";

export default function TimelinePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("すべて");

  async function load() {
    const ps = await base44.entities.Post.list("-created_date", 100);
    setPosts(ps);
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

  const filtered = filter === "すべて" ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">タイムライン</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> 投稿
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
          <div className="text-sm">投稿がありません。最初の相談・質問を投稿しよう！</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {showCreate && <CreatePostDialog onClose={() => setShowCreate(false)} onSaved={load} />}
    </div>
  );
}