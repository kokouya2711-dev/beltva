import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Newspaper, Loader2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import NearbyMap from "@/components/NearbyMap";
import PostCard from "@/components/PostCard";
import { useT } from "@/lib/i18n";

export default function Home() {
  const t = useT();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const topPosts = await base44.entities.Post.list("-likes", 30);
      setPosts(topPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10">
      {/* 📍 World map — main hero */}
      <section>
        <SectionTitle icon={MapPin} title={t("home.nearbyMap")} accent="text-primary" />
        <p className="text-sm text-muted-foreground mb-3">{t("home.nearbyMapSub")}</p>
        <NearbyMap />
      </section>

      {/* 📰 Popular posts */}
      <section>
        <SectionTitle icon={Newspaper} title={t("home.popularPosts")} accent="text-accent" link="/timeline" />
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : posts.length === 0 ? (
          <EmptyState icon={Newspaper} text={t("home.noPosts")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.slice(0, 6).map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, accent, link }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className={accent} style={{ width: 20, height: 20 }} />
        <h2 className="font-bold text-xl">{title}</h2>
      </div>
      {link && <Link to={link} className="text-xs text-primary hover:underline">もっと見る →</Link>}
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="glass rounded-2xl border border-border py-12 flex flex-col items-center gap-2 text-muted-foreground">
      <Icon className="w-8 h-8 opacity-50" />
      <div className="text-sm">{text}</div>
    </div>
  );
}