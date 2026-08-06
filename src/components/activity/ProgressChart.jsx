import React, { useState, useMemo } from "react";
import { useT } from "@/lib/i18n";
import { isCardio, getDateKey, formatDuration, formatPace } from "@/lib/activityHelpers";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Dumbbell, Heart } from "lucide-react";

const CHART_STYLE = { background: "hsl(240 5% 10%)", border: "1px solid hsl(240 5% 16%)", borderRadius: 8, fontSize: 12 };
const AXIS_TICK = { fontSize: 10, fill: "hsl(240 5% 60%)" };

export default function ProgressChart({ records }) {
  const t = useT();
  const [mode, setMode] = useState("strength");

  const filtered = useMemo(
    () => records.filter((r) => mode === "strength" ? !isCardio(r.workout_type) : isCardio(r.workout_type)),
    [records, mode]
  );

  const byDate = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const key = getDateKey(r.created_date).slice(5);
      if (!map[key]) map[key] = { date: key, volume: 0, maxWeight: 0, distance: 0, duration: 0 };
      map[key].volume += Number(r.volume) || 0;
      map[key].maxWeight = Math.max(map[key].maxWeight, Number(r.weight) || 0);
      map[key].distance += Number(r.distance) || 0;
      map[key].duration += Number(r.duration_sec) || 0;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  const totalDistance = byDate.reduce((s, d) => s + d.distance, 0);
  const totalDuration = byDate.reduce((s, d) => s + d.duration, 0);

  return (
    <div className="glass rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{t("activity.progress")}</h3>
        <div className="flex gap-1">
          <button onClick={() => setMode("strength")} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition ${mode === "strength" ? "bg-primary text-primary-foreground" : "text-muted-foreground border border-border"}`}>
            <Dumbbell className="w-3 h-3" /> {t("activity.strength")}
          </button>
          <button onClick={() => setMode("cardio")} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition ${mode === "cardio" ? "bg-accent text-accent-foreground" : "text-muted-foreground border border-border"}`}>
            <Heart className="w-3 h-3" /> {t("activity.cardio")}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">{t("activity.noRecords")}</div>
      ) : mode === "strength" ? (
        <div className="space-y-4">
          <ChartBlock label={t("activity.totalVolume")} data={byDate} dataKey="volume" color="hsl(75 90% 55%)" type="bar" />
          <ChartBlock label={t("activity.weightProgress")} data={byDate} dataKey="maxWeight" color="hsl(142 71% 45%)" type="line" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <StatCard label={t("activity.distance")} value={`${totalDistance.toFixed(1)} km`} />
            <StatCard label={t("activity.duration")} value={formatDuration(totalDuration)} />
            <StatCard label={t("activity.pace")} value={formatPace(totalDistance, totalDuration)} />
          </div>
          <ChartBlock label={t("activity.distance")} data={byDate} dataKey="distance" color="hsl(142 71% 45%)" type="bar" />
        </div>
      )}
    </div>
  );
}

function ChartBlock({ label, data, dataKey, color, type }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <ResponsiveContainer width="100%" height={130}>
        {type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} width={36} />
            <Tooltip contentStyle={CHART_STYLE} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} width={36} />
            <Tooltip contentStyle={CHART_STYLE} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-secondary/40 rounded-xl p-2 text-center">
      <div className="text-sm font-bold truncate">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}