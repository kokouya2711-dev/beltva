import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PostCard from "@/components/PostCard";
import SuggestedUsers from "@/components/SuggestedUsers";
import { Plus, Loader2, MessageSquare } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTimelineFilter } from "@/lib/timelineFilterContext";
import { saveTimelineCache, getTimelineCache, getTimelineScrollY } from "@/lib/timelineScrollCache";

export default function TimelinePage() {
  const t = useT();
  const { filter, setFilter, workoutFilter } = useTimelineFilter();
  const cached = getTimelineCache();
  const [posts, setPosts] = useState(cached?.posts || []);
  const [loading, setLoading] = useState(!cached);
  const navigate = useNavigate();
  const [me, setMe] = useState(cached?.me || null);
  const [followIds, setFollowIds] = useState(cached?.followIds || null);
  const [likesByPost, setLikesByPost] = useState(cached?.likesByPost || {});
  const [mutedIds, setMutedIds] = useState(cached?.mutedIds || null);
  const [blockedIds, setBlockedIds] = useState(cached?.blockedIds || null);
  const [hiddenPostIds, setHiddenPostIds] = useState(cached?.hiddenPostIds || null);
  const [favMap, setFavMap] = useState(cached?.favMap || {});

  // Keep latest state in a ref so the unmount cleanup always saves current data
  const stateRef = useRef({ posts, me, likesByPost, mutedIds, blockedIds, hiddenPostIds, favMap, followIds });
  stateRef.current = { posts, me, likesByPost, mutedIds, blockedIds, hiddenPostIds, favMap, followIds };

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

    if (meUser) {
      const [mutes, blocksByMe, blocksOnMe, hiddenPosts, myFavs] = await Promise.all([
        base44.entities.Mute.filter({ muter_id: meUser.id }).catch(() => []),
        base44.entities.Block.filter({ blocker_id: meUser.id }).catch(() => []),
        base44.entities.Block.filter({ blocked_id: meUser.id }).catch(() => []),
        base44.entities.HiddenPost.filter({ created_by_id: meUser.id }).catch(() => []),
        base44.entities.Favorite.filter({ created_by_id: meUser.id }).catch(() => []),
      ]);
      setMutedIds(new Set(mutes.map((m) => m.muted_id)));
      setBlockedIds(new Set([...blocksByMe.map((b) => b.blocked_id), ...blocksOnMe.map((b) => b.blocker_id)]));
      setHiddenPostIds(new Set(hiddenPosts.map((h) => h.post_id)));
      const fMap = {};
      myFavs.forEach((f) => { fMap[f.post_id] = f.id; });
      setFavMap(fMap);
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

  // Filter out muted, blocked, and hidden posts
  if (mutedIds) filtered = filtered.filter((p) => !mutedIds.has(p.created_by_id));
  if (blockedIds) filtered = filtered.filter((p) => !blockedIds.has(p.created_by_id));
  if (hiddenPostIds) filtered = filtered.filter((p) => !hiddenPostIds.has(p.id));

  if (filter === "following") {
    if (me && followIds) filtered = filtered.filter((p) => followIds.has(p.created_by_id) || p.created_by_id === me.id);
  } else if (!SPECIAL_FILTERS.includes(filter)) {
    filtered = filtered.filter((p) => p.category === filter);
  }
  if (workoutFilter) {
    filtered = filtered.filter((p) => p.workout_type === workoutFilter);
  }
  if (filter === "popular") {
    filtered = [...filtered].sort((a, b) => ((b.likes || 0) + (b.comments_count || 0)) - ((a.likes || 0) + (a.comments_count || 0)));
  }

  return (
    <div className="px-2 md:px-4 max-w-2xl mx-auto">
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
              <div className="text-sm">{filter === "following" ? t("post.noFollowingPosts") : t("post.emptyPrompt")}</div>
            </div>
          ) : (
            <div>
              {filtered.map((p, i) => (
                <React.Fragment key={p.id}>
                  <PostCard post={p} meId={me?.id} initialLikers={likesByPost[p.id] || []} initialFavorited={favMap[p.id] !== undefined} initialFavId={favMap[p.id] ?? null} />
                  {i < filtered.length - 1 && <div className="-mx-2 md:-mx-4 h-[10px] bg-separator" />}
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