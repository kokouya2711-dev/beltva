import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PostCard from "@/components/PostCard";
import SuggestedUsers from "@/components/SuggestedUsers";
import { Plus, Loader2, MessageSquare } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTimelineFilter } from "@/lib/timelineFilterContext";
import { saveTimelineCache, getTimelineCache, getTimelineScrollY } from "@/lib/timelineScrollCache";
import { getDemoPosts } from "@/lib/demoUsers";

function parseLangs(s) {
  try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; }
}

// おすすめ順：人気（いいね＋コメント）を主軸、新しさでタイブレーク
function recommendedSort(posts) {
  const now = Date.now();
  const scored = posts.map((p) => {
    const ageHours = (now - new Date(p.created_date).getTime()) / 3600000;
    const recency = Math.max(0, 168 - ageHours); // 7日窓で線形減衰
    const popularity = (p.likes || 0) + (p.comments_count || 0) * 2;
    return { p, score: popularity * 10 + recency };
  });
  scored.sort((a, b) => b.score - a.score);
  // 同一投稿者が連続しないようインターリーブ
  const remaining = [...scored];
  const result = [];
  let lastAuthor = null;
  while (remaining.length) {
    let idx = remaining.findIndex((s) => s.p.created_by_id !== lastAuthor);
    if (idx === -1) idx = 0;
    const [picked] = remaining.splice(idx, 1);
    result.push(picked.p);
    lastAuthor = picked.p.created_by_id;
  }
  return result;
}

export default function TimelinePage() {
  const t = useT();
  const { room, display } = useTimelineFilter();
  const cached = getTimelineCache();
  const [posts, setPosts] = useState(cached?.posts || []);
  const [loading, setLoading] = useState(!cached);
  const navigate = useNavigate();
  const [me, setMe] = useState(cached?.me || null);
  const [likesByPost, setLikesByPost] = useState(cached?.likesByPost || {});
  const [mutedIds, setMutedIds] = useState(cached?.mutedIds || null);
  const [blockedIds, setBlockedIds] = useState(cached?.blockedIds || null);
  const [hiddenPostIds, setHiddenPostIds] = useState(cached?.hiddenPostIds || null);
  const [favMap, setFavMap] = useState(cached?.favMap || {});
  const [userLangMap, setUserLangMap] = useState(cached?.userLangMap || {});
  const [userMap, setUserMap] = useState(cached?.userMap || {});
  const [commentsByPost, setCommentsByPost] = useState(cached?.commentsByPost || {});
  const [myLang, setMyLang] = useState(cached?.myLang || "");

  // Keep latest state in a ref so the unmount cleanup always saves current data
  const stateRef = useRef({ posts, me, likesByPost, mutedIds, blockedIds, hiddenPostIds, favMap, userLangMap, userMap, commentsByPost, myLang });
  stateRef.current = { posts, me, likesByPost, mutedIds, blockedIds, hiddenPostIds, favMap, userLangMap, userMap, commentsByPost, myLang };

  async function load() {
    const [ps, meUser, allLikes, allComments] = await Promise.all([
      base44.entities.Post.list("-created_date", 50),
      base44.auth.me().catch(() => null),
      base44.entities.Like.list("-created_date", 200).catch(() => []),
      base44.entities.Comment.list("-created_date", 200).catch(() => []),
    ]);
    const merged = [...getDemoPosts(), ...ps].sort(
      (a, b) => new Date(b.created_date) - new Date(a.created_date)
    );
    setPosts(merged);
    setMe(meUser);
    const lMap = {};
    allLikes.forEach((l) => { (lMap[l.post_id] = lMap[l.post_id] || []).push(l); });
    setLikesByPost(lMap);

    // Group comments by post_id (latest 3 per post) — replaces per-PostCard fetches
    const cByPost = {};
    allComments.forEach((c) => {
      if (!c.post_id) return;
      (cByPost[c.post_id] = cByPost[c.post_id] || []).push(c);
    });
    Object.keys(cByPost).forEach((pid) => { cByPost[pid] = cByPost[pid].slice(0, 3); });
    setCommentsByPost(cByPost);

    if (meUser) {
      setMyLang(meUser.main_language || meUser.language || localStorage.getItem("beltva_lang") || "ja");
      const [mutes, blocksByMe, blocksOnMe, hiddenPosts, myFavs, users] = await Promise.all([
        base44.entities.Mute.filter({ muter_id: meUser.id }).catch(() => []),
        base44.entities.Block.filter({ blocker_id: meUser.id }).catch(() => []),
        base44.entities.Block.filter({ blocked_id: meUser.id }).catch(() => []),
        base44.entities.HiddenPost.filter({ created_by_id: meUser.id }).catch(() => []),
        base44.entities.Favorite.filter({ created_by_id: meUser.id }).catch(() => []),
        base44.entities.User.list("-created_date", 100).catch(() => []),
      ]);
      setMutedIds(new Set(mutes.map((m) => m.muted_id)));
      setBlockedIds(new Set([...blocksByMe.map((b) => b.blocked_id), ...blocksOnMe.map((b) => b.blocker_id)]));
      setHiddenPostIds(new Set(hiddenPosts.map((h) => h.post_id)));
      const fMap = {};
      myFavs.forEach((f) => { fMap[f.post_id] = f.id; });
      setFavMap(fMap);
      const langMap = {};
      const uMap = {};
      users.forEach((u) => {
        langMap[u.id] = u.main_language || u.language || "ja";
        uMap[u.id] = u;
      });
      setUserLangMap(langMap);
      setUserMap(uMap);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (cached) {
      // Restore scroll position after render
      requestAnimationFrame(() => window.scrollTo(0, getTimelineScrollY()));
    } else {
      load();
    }
    // Save state + scroll position on unmount (navigating to post detail, profile, etc.)
    return () => saveTimelineCache(stateRef.current);
  }, []);

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe((event) => {
      if (event.type === "create") {
        setPosts((prev) => prev.some((p) => p.id === event.data.id) ? prev : [event.data, ...prev]);
      } else if (event.type === "update") {
        setPosts((prev) => prev.map((p) => p.id === event.data.id ? { ...p, ...event.data } : p));
      }
    });
    return unsub;
  }, []);

  let filtered = posts;

  // Filter out muted, blocked, and hidden posts
  if (mutedIds) filtered = filtered.filter((p) => !mutedIds.has(p.created_by_id));
  if (blockedIds) filtered = filtered.filter((p) => !blockedIds.has(p.created_by_id));
  if (hiddenPostIds) filtered = filtered.filter((p) => !hiddenPostIds.has(p.id));

  // 言語ルーム：投稿の languageCode が自分のメイン言語と同じ投稿のみ
  if (room === "mylang" && myLang) {
    filtered = filtered.filter((p) => p.languageCode === myLang);
  }

  // 表示：おすすめ＝新しさ＋反応＋多様性、最新＝新着順（リスト既定）
  if (display === "recommended") {
    filtered = recommendedSort(filtered);
  }

  return (
    <div className="px-3.5 md:px-4 max-w-2xl mx-auto">
      <div className="hidden md:flex justify-end mb-3">
        <button onClick={() => navigate("/create-post")} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> {t("post.create")}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-10 h-10 opacity-40" />
              <div className="text-sm">{t("post.emptyPrompt")}</div>
            </div>
          ) : (
            <div>
              {filtered.map((p, i) => (
                <React.Fragment key={p.id}>
                  <PostCard
                    post={p}
                    meId={me?.id}
                    initialLikers={likesByPost[p.id] || []}
                    initialFavorited={favMap[p.id] !== undefined}
                    initialFavId={favMap[p.id] ?? null}
                    batchedAuthor={userMap[p.created_by_id] || null}
                    batchedComments={commentsByPost[p.id] || []}
                    batchedUserMap={userMap}
                  />
                  {i < filtered.length - 1 && <div className="-mx-3.5 md:-mx-4 h-[6px] bg-separator" />}
                </React.Fragment>
              ))}
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
    </div>
  );
}