import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/PostCard";
import { Loader2, MessageSquare } from "lucide-react";
import { POST_CATEGORIES, CATEGORY_STYLE } from "@/lib/community";
import { useT } from "@/lib/i18n";
import { useTCategory } from "@/lib/i18nHelpers";
import { getDemoPosts } from "@/lib/demoUsers";

const TABS = [
  { key: "recommended", labelKey: "post.tab_recommended" },
  { key: "popular", labelKey: "post.tab_popular" },
  { key: "latest", labelKey: "post.tab_latest" },
  { key: "following", labelKey: "post.tab_following" }
];

export default function HomeTimeline() {
  const t = useT();
  const tCat = useTCategory();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("recommended");
  const [tag, setTag] = useState("すべて");
  const [me, setMe] = useState(null);
  const [followIds, setFollowIds] = useState(null);


  async function load() {
    const [ps, meUser] = await Promise.all([
      base44.entities.Post.list("-created_date", 100),
      base44.auth.me().catch(() => null)
    ]);
    const merged = [...getDemoPosts(), ...ps].sort(
      (a, b) => new Date(b.created_date) - new Date(a.created_date)
    );
    setPosts(merged);
    setMe(meUser);
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

  // Lazy-load follow IDs only when "following" tab is selected
  useEffect(() => {
    if (tab !== "following" || !me || followIds) return;
    base44.entities.Follow.filter({ follower_id: me.id }).then((f) => setFollowIds(new Set(f.map((x) => x.followee_id))));
  }, [tab, me, followIds]);

  let filtered = posts;
  if (tag !== "すべて") filtered = filtered.filter((p) => p.category === tag);
  if (tab === "following" && me && followIds) {
    filtered = filtered.filter((p) => followIds.has(p.created_by_id) || p.created_by_id === me.id);
  } else if (tab === "popular") {
    filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (tab === "recommended") {
    filtered = [...filtered].sort(
      (a, b) => ((b.likes || 0) + (b.comments_count || 0) * 2) - ((a.likes || 0) + (a.comments_count || 0) * 2)
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-xl">{t("post.title")}</h2>
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`shrink-0 text-sm px-3 py-1.5 rounded-full border transition ${
              tab === tb.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            {t(tb.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {["すべて", ...POST_CATEGORIES].map((c) => {
          const active = tag === c;
          const s = CATEGORY_STYLE[c];
          return (
            <button
              key={c}
              onClick={() => setTag(c)}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition ${
                active ? (s ? `${s.bg} ${s.color} ${s.border}` : "bg-primary/10 text-primary border-primary/30") : "border-border text-muted-foreground"
              }`}
            >
              {c === "すべて" ? t("common.all") : tCat(c)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-12 flex flex-col items-center gap-2 text-muted-foreground">
          <MessageSquare className="w-8 h-8 opacity-40" />
          <div className="text-sm">{t("post.noPosts")}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.slice(0, 20).map((p) => (
            <PostCard key={p.id} post={p} meId={me?.id} />
          ))}
        </div>
      )}

    </div>
  );
}