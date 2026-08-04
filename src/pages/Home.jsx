import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Flame, Radio, Trophy, Plus, Eye, MapPin, TrendingUp, Zap } from "lucide-react";
import LiveSessionCard from "@/components/LiveSessionCard";
import RecordWorkoutDialog from "@/components/RecordWorkoutDialog";
import { formatNumber, timeAgo, computeVolume, metricValue } from "@/lib/workouts";

export default function Home() {
  const [me, setMe] = useState(null);
  const [liveSessions, setLiveSessions] = useState([]);
  const [records, setRecords] = useState([]);
  const [showRecord, setShowRecord] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [live, recs, user] = await Promise.all([
        base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 50),
        base44.entities.WorkoutRecord.list("-created_date", 100),
        base44.auth.me().catch(() => null)
      ]);
      setLiveSessions(live);
      setRecords(recs);
      setMe(user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // leaderboard aggregation
  const leaderboard = React.useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const uid = r.created_by_id;
      if (!uid) return;
      if (!map[uid]) map[uid] = { uid, name: r.created_by?.full_name || r.created_by?.email || `ユーザー${uid.slice(-4)}`, volume: 0, reps: 0, duration: 0, count: 0 };
      map[uid].volume += Number(r.volume) || 0;
      map[uid].reps += Number(r.reps) || 0;
      map[uid].duration += Number(r.duration_sec) || 0;
      map[uid].count += 1;
    });
    return Object.values(map).sort((a, b) => b.volume - a.volume).slice(0, 5);
  }, [records]);

  async function hype(session) {
    await base44.entities.LiveSession.update(session.id, { hype_count: (session.hype_count || 0) + 1 });
    setLiveSessions((arr) => arr.map((s) => s.id === session.id ? { ...s, hype_count: (s.hype_count || 0) + 1 } : s));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border glass p-6 md:p-10">
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-3">
            <Zap className="w-3.5 h-3.5" /> PULSE — みんなで燃やそう
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            {me ? `おかえり、@${me.email?.split("@")[0]} 👋` : "トレーニングを始めよう"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg">
            ライブ配信で仲間と繋がり、位置情報を共有し、ランキング対決で本気を出す。
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setShowRecord(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> トレーニング記録
            </button>
            <a
              href="/live"
              className="flex items-center gap-2 bg-secondary/60 border border-border px-5 py-3 rounded-xl hover:border-primary/40 transition"
            >
              <Radio className="w-4 h-4" /> ライブを見る
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Radio} label="配信中" value={liveSessions.length} color="text-red-500" />
        <Stat icon={TrendingUp} label="今週の記録" value={records.length} color="text-primary" />
        <Stat icon={Flame} label="参加者" value={leaderboard.length} color="text-accent" />
        <Stat icon={Trophy} label="総ボリューム" value={records.reduce((s, r) => s + (Number(r.volume) || 0), 0)} suffix="kg" color="text-chart-3" />
      </section>

      {/* Live now */}
      <section>
        <SectionHeader icon={Radio} title="いま配信中" sub="LIVE NOW" accent="text-red-500" />
        {loading ? (
          <LoadingGrid />
        ) : liveSessions.length === 0 ? (
          <EmptyState icon={Radio} text="配信中のセッションはありません。最初にライブ配信を始めよう！" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSessions.map((s) => (
              <LiveSessionCard key={s.id} session={s} onHype={hype} isOwner={me && s.created_by_id === me.id} />
            ))}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <section>
          <SectionHeader icon={Trophy} title="トップランカー" sub="LEADERBOARD" accent="text-primary" link="/rankings" />
          <div className="glass rounded-2xl border border-border divide-y divide-border">
            {leaderboard.length === 0 ? (
              <EmptyState icon={Trophy} text="まだ記録がありません" />
            ) : (
              leaderboard.map((u, i) => (
                <div key={u.uid} className="flex items-center gap-3 px-4 py-3">
                  <RankBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.count}セッション</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{formatNumber(u.volume)} kg</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <SectionHeader icon={TrendingUp} title="みんなの記録" sub="RECENT" accent="text-accent" />
          <div className="glass rounded-2xl border border-border divide-y divide-border">
            {records.slice(0, 6).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Flame className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {r.workout_type} · {r.sets}×{r.reps}{r.weight ? ` @${r.weight}kg` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.created_by?.full_name || r.created_by?.email || "匿名"} · {timeAgo(r.created_date)}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-bold text-primary">{formatNumber(r.volume)}</div>
                  <div className="text-[10px] text-muted-foreground">kg</div>
                </div>
              </div>
            ))}
            {records.length === 0 && <EmptyState icon={TrendingUp} text="まだ記録がありません" />}
          </div>
        </section>
      </div>

      {showRecord && <RecordWorkoutDialog onClose={() => setShowRecord(false)} onSaved={() => { setShowRecord(false); load(); }} />}
    </div>
  );
}

function Stat({ icon: Icon, label, value, suffix, color }) {
  return (
    <div className="glass rounded-2xl border border-border p-4">
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="mt-3 text-2xl font-bold">{formatNumber(value)}{suffix}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub, accent, link }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4.5 h-4.5 ${accent}`} style={{ width: 18, height: 18 }} />
        <h2 className="font-bold text-lg">{title}</h2>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{sub}</span>
      </div>
      {link && <a href={link} className="text-xs text-primary hover:underline">もっと見る →</a>}
    </div>
  );
}

function RankBadge({ rank }) {
  const styles = {
    1: "bg-yellow-400 text-black",
    2: "bg-slate-300 text-black",
    3: "bg-orange-700 text-white"
  };
  const cls = styles[rank] || "bg-secondary text-muted-foreground";
  return <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${cls}`}>{rank}</div>;
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass rounded-2xl h-56 animate-pulse" />
      ))}
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