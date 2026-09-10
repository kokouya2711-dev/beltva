import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bookmark, Loader2, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import PostCard from "@/components/PostCard";
import { subscribeFavUpdates, getFavState, isFavStoreInitialized } from "@/lib/favStore";

export default function FavoritesPage() {
  const t = useT();
  const [me, setMe] = useState(null);
  const [favs, setFavs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setFavTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeFavUpdates(() => setFavTick(t => t + 1));
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      const meUser = await base44.auth.me().catch(() => null);
      if (!meUser) { setLoading(false); return; }
      setMe(meUser);
      const fs = await base44.entities.Favorite.filter({ created_by_id: meUser.id }, "-created_date", 200);
      setFavs(fs);
      const ps = await Promise.all(fs.map((f) => base44.entities.Post.get(f.post_id).catch(() => null)));
      setPosts(ps.filter(Boolean));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/me" className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">{t("favorites.title")}</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <Bookmark className="w-10 h-10 opacity-40" />
          <div className="text-sm">{t("favorites.empty")}</div>
        </div>
      ) : (
        <div>
          {posts.filter((p) => isFavStoreInitialized() ? getFavState(p.id) !== null : true).map((p, i, arr) => (
            <React.Fragment key={p.id}>
              <PostCard post={p} meId={me?.id} initialFavorited={true} initialFavId={favs.find((f) => f.post_id === p.id)?.id ?? null} />
              {i < arr.length - 1 && <div className="-mx-2 md:-mx-4 h-[10px] bg-separator" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}