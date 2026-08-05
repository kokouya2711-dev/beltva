import React, { useEffect, useState, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Plus, Crown, Flame, Swords, Calendar, Filter } from "lucide-react";
import CreateBattleDialog from "@/components/CreateBattleDialog";
import { WORKOUT_TYPES } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { useTWorkout, useTMetric, useFormatNumber } from "@/lib/i18nHelpers";

export default function RankingsPage() {
  const t = useT();
  const tWorkout = useTWorkout();
  const tMetric = useTMetric();
  const fmtNum = useFormatNumber();
  const [records, setRecords] = useState([]);
  const [battles, setBattles] = useState([]);
  const [workoutFilter, setWorkoutFilter] = useState("all");
  const [metric, setMetric] = useState("volume");
  const [showCreate, setShowCreate] = useState(false);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, bts, user] = await Promise.all([
        base44.entities.WorkoutRecord.list("-created_date", 200),
        base44.entities.Battle.filter({ status: "active" }, "-start_date", 50),
        base44.auth.me().catch(() => null)
      ]);
      setRecords(recs);
      setBattles(bts);
      setMe(user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const leaderboard = useMemo(() => {
    let filtered = records;
    if (workoutFilter !== "all") filtered = records.filter((r) => r.workout_type === workoutFilter);
    const map = {};
    filtered.forEach((r) => {
      const uid = r.created_by_id;
      if (!uid) return;
      const name = r.created_by?.full_name || r.created_by?.email || t("rankings.userFallback").replace("{n}", uid.slice(-4));
      if (!map[uid]) map[uid] = { uid, name, value: 0, count: 0, sessions: 0 };
      map[uid].value += metricValue(r, metric);
      map[uid].count += 1;
      map[uid].sessions += Number(r.sets) || 0;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [records, workoutFilter, metric, t]);

  const max = leaderboard[0]?.value || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">{t("rankings.title")}</h1>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">RANKING</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          <Swords className="w-4 h-4" /> {t("rankings.create")}
        </button>
      </div>

      {/* Active battles */}
      <section>
        <SectionHeader icon={Swords} title={t("rankings.activeBattles")} sub="BATTLES" accent="text-red-500" />
        {battles.length === 0 ? (
          <div className="glass rounded-2xl border border-border py-10 flex flex-col items-center gap-2 text-muted-foreground">
            <Swords className="w-8 h-8 opacity-50" />
            <div className="text-sm">{t("rankings.noBattles")}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {battles.map((b) => {
              const standings = computeBattleStandings(records, b, t);
              const top = standings.slice(0, 3);
              return (
                <div key={b.id} className="glass rounded-2xl border border-border p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-lg">{b.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{tWorkout(b.workout_type)} · {tMetric(b.metric)}</div>
                    </div>
                    <span className="bg-red-500/20 text-red-400 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" /> {t("rankings.live")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Calendar className="w-3.5 h-3.5" /> {b.start_date} → {b.end_date}
                  </div>
                  <div className="mt-4 space-y-2">
                    {top.length === 0 && <div className="text-sm text-muted-foreground py-2">{t("rankings.noParticipants")}</div>}
                    {top.map((u, i) => (
                      <div key={u.uid} className="flex items-center gap-3">
                        <RankBadge rank={i + 1} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{u.name}</div>
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${(u.value / (standings[0]?.value || 1)) * 100}%` }} />
                          </div>
                        </div>
                        <div className="text-sm font-bold text-primary">{fmtNum(u.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Global leaderboard */}
      <section>
        <SectionHeader icon={Crown} title={t("rankings.global")} sub="ALL TIME" accent="text-primary" />

        {/* filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" /> {t("rankings.workoutType")}
          </div>
          <button
            onClick={() => setWorkoutFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-full border ${workoutFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            {t("rankings.allWorkouts")}
          </button>
          {WORKOUT_TYPES.map((w) => (
            <button
              key={w}
              onClick={() => setWorkoutFilter(w)}
              className={`text-xs px-3 py-1.5 rounded-full border ${workoutFilter === w ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            >
              {tWorkout(w)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">{t("rankings.metric")}</span>
          {["volume", "reps", "duration"].map((k) => (
            <button
              key={k}
              onClick={() => setMetric(k)}
              className={`text-xs px-3 py-1.5 rounded-full border ${metric === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            >
              {tMetric(k)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass rounded-2xl h-64 animate-pulse" />
        ) : leaderboard.length === 0 ? (
          <div className="glass rounded-2xl border border-border py-12 flex flex-col items-center gap-2 text-muted-foreground">
            <Trophy className="w-8 h-8 opacity-50" />
            <div className="text-sm">{t("rankings.noRecords")}</div>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {leaderboard.map((u, i) => (
              <div key={u.uid} className={`flex items-center gap-4 px-4 py-3.5 ${me && u.uid === me.id ? "bg-primary/5" : ""}`}>
                <RankBadge rank={i + 1} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate flex items-center gap-2">
                    {u.name}
                    {me && u.uid === me.id && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">YOU</span>}
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden mt-1.5">
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${(u.value / max) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{fmtNum(u.value)}</div>
                  <div className="text-[10px] text-muted-foreground">{u.count} {t("rankings.records")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showCreate && <CreateBattleDialog onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

function metricValue(record, metric) {
  if (metric === "reps") return Number(record.reps) || 0;
  if (metric === "duration") return Number(record.duration_sec) || 0;
  return Number(record.volume) || 0;
}

function computeBattleStandings(records, battle, t) {
  const start = new Date(battle.start_date).getTime();
  const end = new Date(battle.end_date).getTime() + 86400000;
  const map = {};
  records.forEach((r) => {
    if (r.workout_type !== battle.workout_type) return;
    const tm = new Date(r.created_date).getTime();
    if (tm < start || tm > end) return;
    const uid = r.created_by_id;
    if (!uid) return;
    const name = r.created_by?.full_name || r.created_by?.email || t("rankings.userFallback").replace("{n}", uid.slice(-4));
    if (!map[uid]) map[uid] = { uid, name, value: 0, count: 0 };
    map[uid].value += metricValue(r, battle.metric);
    map[uid].count += 1;
  });
  return Object.values(map).sort((a, b) => b.value - a.value);
}

function SectionHeader({ icon: Icon, title, sub, accent, link }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4.5 h-4.5 ${accent}`} style={{ width: 18, height: 18 }} />
        <h2 className="font-bold text-lg">{title}</h2>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{sub}</span>
      </div>
      {link && <a href={link} className="text-xs text-primary hover:underline">{/* common.more */}→</a>}
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
  return <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${cls}`}>{rank}</div>;
}