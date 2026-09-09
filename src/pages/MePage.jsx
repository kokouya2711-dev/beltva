import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { Pencil, Settings as SettingsIcon, Loader2, FileText, Bookmark } from "lucide-react";
import PostCard from "@/components/PostCard";
import { displayName } from "@/lib/profile";

export default function MePage() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [favPosts, setFavPosts] = useState([]);
  const [favMap, setFavMap] = useState({});
  const [likesByPost, setLikesByPost] = useState({});
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const meUser = await base44.auth.me();
        setMe(meUser);
        if (!meUser) return;

        const [myPosts, myFavs, fols, fols2, allLikes] = await Promise.all([
          base44.entities.Post.filter({ created_by_id: meUser.id }, "-created_date", 100).catch(() => []),
          base44.entities.Favorite.filter({ created_by_id: meUser.id }).catch(() => []),
          base44.entities.Follow.filter({ followee_id: meUser.id }).catch(() => []),
          base44.entities.Follow.filter({ follower_id: meUser.id }).catch(() => []),
          base44.entities.Like.list("-created_date", 200).catch(() => []),
        ]);

        setPosts(myPosts);
        setFollowers(fols.length);
        setFollowing(fols2.length);

        const fMap = {};
        myFavs.forEach((f) => { fMap[f.post_id] = f.id; });
        setFavMap(fMap);

        const lMap = {};
        allLikes.forEach((l) => { (lMap[l.post_id] = lMap[l.post_id] || []).push(l); });
        setLikesByPost(lMap);

        // Fetch favorite posts
        if (myFavs.length) {
          const favPostIds = myFavs.map((f) => f.post_id);
          const allPosts = await base44.entities.Post.list("-created_date", 200).catch(() => []);
          setFavPosts(allPosts.filter((p) => favPostIds.includes(p.id)));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>;
  }
  if (!me) return null;

  const name = displayName(me);
  const list = tab === "posts" ? posts : favPosts;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar: small screen title left, edit + settings right */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <h1 className="text-base font-semibold text-muted-foreground">{t("home.you")}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/profile/edit")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-foreground bg-secondary hover:bg-secondary/70 transition"
            aria-label={t("me.editProfile")}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-foreground bg-secondary hover:bg-secondary/70 transition"
            aria-label={t("me.settings")}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Compact horizontal profile header — avatar left, name + stats right */}
      <div className="px-4 pt-1 pb-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/profile/edit")} className="shrink-0">
            {me.avatar_url ? (
              <img src={me.avatar_url} alt={name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-xl font-bold">{name.slice(0, 2).toUpperCase()}</div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={() => navigate("/profile/edit")} className="block text-left w-full">
              <h1 className="text-lg font-bold truncate leading-tight">{name}</h1>
            </button>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">{t("common.post")}</div>
                <div className="font-bold text-foreground text-sm">{posts.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">{t("profile.following")}</div>
                <div className="font-bold text-foreground text-sm">{following}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">{t("profile.followers")}</div>
                <div className="font-bold text-foreground text-sm">{followers}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — equal width, text only, selected in lime */}
      <div className="flex">
        <button
          onClick={() => setTab("posts")}
          className={`flex-1 py-2.5 text-sm font-semibold text-center transition ${tab === "posts" ? "text-primary" : "text-muted-foreground"}`}
        >
          <span className={`inline-block pb-1 border-b-2 ${tab === "posts" ? "border-primary" : "border-transparent"}`}>{t("common.post")}</span>
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 py-2.5 text-sm font-semibold text-center transition ${tab === "favorites" ? "text-primary" : "text-muted-foreground"}`}
        >
          <span className={`inline-block pb-1 border-b-2 ${tab === "favorites" ? "border-primary" : "border-transparent"}`}>{t("me.favorites")}</span>
        </button>
      </div>

      {/* Tab content */}
      <div className="px-3.5 md:px-4 pt-4">
        {list.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
            {tab === "posts" ? <FileText className="w-9 h-9 opacity-30" /> : <Bookmark className="w-9 h-9 opacity-30" />}
            <div className="text-sm">{tab === "posts" ? t("profile.noPosts") : t("favorites.empty")}</div>
          </div>
        ) : (
          <div>
            {list.map((p, i) => (
              <React.Fragment key={p.id}>
                <PostCard
                  post={p}
                  meId={me.id}
                  initialLikers={likesByPost[p.id] || []}
                  initialFavorited={favMap[p.id] !== undefined}
                  initialFavId={favMap[p.id] ?? null}
                  batchedAuthor={me}
                  hideAuthor={tab === "posts"}
                />
                {i < list.length - 1 && <div className="-mx-3.5 md:-mx-4 h-[6px] bg-separator" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}