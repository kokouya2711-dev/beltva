import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Radio, Filter } from "lucide-react";
import LiveSessionCard from "@/components/LiveSessionCard";
import { WORKOUT_TYPES } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function LivePage() {
  const t = useT();
  const tWorkout = useTWorkout();
  const [me, setMe] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [ended, setEnded] = useState([]);
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("live");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [live, ended_, user] = await Promise.all([
        base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 100),
        base44.entities.LiveSession.filter({ status: "ended" }, "-ended_at", 30),
        base44.auth.me().catch(() => null)
      ]);
      setSessions(live);
      setEnded(ended_);
      setMe(user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function hype(session) {
    await base44.entities.LiveSession.update(session.id, { hype_count: (session.hype_count || 0) + 1 });
    setSessions((arr) => arr.map((s) => s.id === session.id ? { ...s, hype_count: (s.hype_count || 0) + 1 } : s));
  }

  async function view(session) {
    await base44.entities.LiveSession.update(session.id, { viewers_count: (session.viewers_count || 0) + 1 });
    setSessions((arr) => arr.map((s) => s.id === session.id ? { ...s, viewers_count: (s.viewers_count || 0) + 1 } : s));
  }

  async function end(session) {
    await base44.entities.LiveSession.update(session.id, { status: "ended", ended_at: new Date().toISOString() });
    setSessions((arr) => arr.filter((s) => s.id !== session.id));
    load();
  }

  const list = tab === "live" ? sessions : ended;
  const filtered = filter === "all" ? list : list.filter((s) => s.workout_type === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
      <div className="flex items-center gap-2">
        <Radio className="w-5 h-5 text-red-500" />
        <h1 className="text-2xl font-bold">{t("live.title")}</h1>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">{t("live.subtitle")}</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <div className="bg-secondary/60 border border-border rounded-xl p-1 flex">
          <button
            onClick={() => setTab("live")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${tab === "live" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t("live.training")}
          </button>
          <button
            onClick={() => setTab("ended")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${tab === "ended" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t("live.ended")}
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <button
          onClick={() => setFilter("all")}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${filter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
        >
          {t("common.all")}
        </button>
        {WORKOUT_TYPES.map((w) => (
          <button
            key={w}
            onClick={() => setFilter(w)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${filter === w ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            {tWorkout(w)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="glass rounded-2xl h-56 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <Radio className="w-8 h-8 opacity-50" />
          <div className="text-sm">{tab === "live" ? t("live.noLive") : t("live.noEnded")}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <LiveSessionCard
              key={s.id}
              session={s}
              onHype={hype}
              onView={view}
              isOwner={me && s.created_by_id === me.id}
              onEnd={end}
            />
          ))}
        </div>
      )}
    </div>
  );
}