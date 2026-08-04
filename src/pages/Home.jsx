import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Radio, Globe, Flame, Newspaper, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import LiveSessionCard from "@/components/LiveSessionCard";
import TrainingGlobe from "@/components/TrainingGlobe";
import PostCard from "@/components/PostCard";
import { useT } from "@/lib/i18n";

export default function Home() {
  const t = useT();
  const [liveSessions, setLiveSessions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [live, topPosts] = await Promise.all([
        base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 50),
        base44.entities.Post.list("-likes", 30)
      ]);
      setLiveSessions(live);
      setPosts(topPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const points = liveSessions
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({ lat: s.lat, lng: s.lng, label: s.workout_type }));

  async function hype(session) {
    await base44.entities.LiveSession.update(session.id, { hype_count: (session.hype_count || 0) + 1 });
    setLiveSessions((arr) => arr.map((s) => s.id === session.id ? { ...s, hype_count: (s.hype_count || 0) + 1 } : s));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10">
      {/* 🌍 World Globe — main hero */}
      <section>
        <SectionTitle icon={Globe} title={t("home.globe")} accent="text-primary" />
        <p className="text-sm text-muted-foreground mb-3">{t("home.globeSub")}</p>
        <div className="relative rounded-2xl overflow-hidden border border-border">
          <TrainingGlobe points={points} />
          <div className="absolute top-3 right-3 z-[400] glass rounded-lg px-3 py-2 text-xs flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            {liveSessions.length} {t("home.trainingCount")}
          </div>
        </div>
      </section>

      {/* 🔥 Now training */}
      <section>
        <SectionTitle icon={Flame} title={t("home.liveNow")} accent="text-red-500" />
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : liveSessions.length === 0 ? (
          <EmptyState icon={Flame} text={t("home.noLive")} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSessions.map((s) => (
              <LiveSessionCard key={s.id} session={s} onHype={hype} />
            ))}
          </div>
        )}
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