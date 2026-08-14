import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/PostCard";
import CreatePostDialog from "@/components/CreatePostDialog";
import SuggestedUsers from "@/components/SuggestedUsers";
import { Plus, Loader2, MessageSquare } from "lucide-react";
import { POST_CATEGORIES } from "@/lib/community";
import { useT } from "@/lib/i18n";
import { useTCategory } from "@/lib/i18nHelpers";

export default function TimelinePage() {
  const t = useT();
  const tCat = useTCategory();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [me, setMe] = useState(null);
  const [followIds, setFollowIds] = useState(null);
  const [likesByPost, setLikesByPost] = useState({});

  async function load() {
    const [ps, meUser, allLikes] = await Promise.all([
      base44.entities.Post.list("-created_date", 50),
      base44.auth.me().catch(() => null),
      base44.entities.Like.list("-created_date", 200).catch(() => [])
    ]);
    setPosts(ps);
    setMe(meUser);
    const lMap = {};
    allLikes.forEach((l) => { (lMap[l.post_id] = lMap[l.post_id] || []).push(l); });
    setLikesByPost(lMap);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handler = () => setShowCreate(true);
    window.addEventListener("timeline-create-post", handler);
    return () => window.removeEventListener("timeline-create-post", handler);
  }, []);

  useEffect(() => {
    if (filter !== "following" || !me || followIds) return;
    base44.entities.Follow.filter({ follower_id: me.id }).then((f) => setFollowIds(new Set(f.map((x) => x.followee_id))));
  }, [filter, me, followIds]);

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe((event) => {
      if (event.type === "create") {
        setPosts((prev) => prev.some((p) => p.id === event.data.id) ? prev : [event.data, ...prev]);
      }
    });
    return unsub;
  }, []);

  const SPECIAL_FILTERS = ["all", "latest", "popular", "following"];
  let filtered = posts;
  if (filter === "following") {
    if (me && followIds) filtered = filtered.filter((p) => followIds.has(p.created_by_id) || p.created_by_id === me.id);
  } else if (!SPECIAL_FILTERS.includes(filter)) {
    filtered = filtered.filter((p) => p.category === filter);
  }
  if (filter === "popular") {
    filtered = [...filtered].sort((a, b) => ((b.likes || 0) + (b.comments_count || 0)) - ((a.likes || 0) + (a.comments_count || 0)));
  }

  const FILTER_TABS = ["all", "latest", "popular", "following", ...POST_CATEGORIES];

  return (
    <div className="px-2 md:px-4 max-w-2xl mx-auto">
      <div className="hidden md:flex justify-end mb-3">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> {t("post.create")}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="min-w-0">
          <div className="flex gap-5 mb-1 overflow-x-auto no-scrollbar border-b border-border">
            {FILTER_TABS.map((c) => {
              const active = filter === c;
              const label = c === "all" ? t("common.all") : c === "latest" ? t("post.tab_latest") : c === "popular" ? t("post.tab_popular") : c === "following" ? t("post.tab_following") : tCat(c);
              return (
                <button key={c} onClick={() => setFilter(c)} className={`shrink-0 text-[17px] py-3 border-b-2 transition whitespace-nowrap ${active ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground font-medium"}`}>{label}</button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-10 h-10 opacity-40" />
              <div className="text-sm">{filter === "following" ? t("post.noFollowingPosts") : t("post.emptyPrompt")}</div>
            </div>
          ) : (
            <div>
              {filtered.map((p) => <PostCard key={p.id} post={p} meId={me?.id} initialLikers={likesByPost[p.id] || []} />)}
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