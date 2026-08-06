import React, { useState, useMemo } from "react";
import { useT } from "@/lib/i18n";
import { useTBodyPart } from "@/lib/i18nHelpers";
import { isCardio, getDateKey, formatDuration, formatPace, getBodyPart } from "@/lib/activityHelpers";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Dumbbell, Heart } from "lucide-react";

const CHART_STYLE = { background: "hsl(240 5% 10%)", border: "1px solid hsl(240 5% 16%)", borderRadius: 8, fontSize: 12 };
const AXIS_TICK = { fontSize: 10, fill: "hsl(240 5% 60%)" };
const CHART_COLORS = ["hsl(75 90% 55%)", "hsl(142 71% 45%)", "hsl(197 90% 60%)", "hsl(30 95% 60%)", "hsl(340 85% 60%)"];

export default function ProgressChart({ records }) {
  const t = useT();
  const tBodyPart = useTBodyPart();
  const [mode, setMode] = useState("strength");

  const filtered = useMemo(
    () => records.filter((r) => (mode === "strength" || mode === "bodyPart") ? !isCardio(r.workout_type) : isCardio(r.workout_type)),
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

  const byDateBodyPart = useMemo(() => {
    if (mode !== "bodyPart") return { data: [], parts: [] };
    const map = {};
    const parts = new Set();
    filtered.forEach((r) => {
      const key = getDateKey(r.created_date).slice(5);
      const part = getBodyPart(r.workout_type);
      parts.add(part);
      if (!map[key]) map[key] = { date: key };
      map[key][part] = (map[key][part] || 0) + (Number(r.volume) || 0);
    });
    return { data: Object.values(map).sort((a, b) => a.date.localeCompare(b.date)), parts: [...parts].sort() };
  }, [filtered, mode]);

  const totalDistance = byDate.reduce((s, d) => s + d.distance, 0);
  const totalDuration = byDate.reduce((s, d) => s + d.duration, 0);
  const noData = mode === "bodyPart" ? byDateBodyPart.data.length === 0 : filtered.length === 0;

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
          <button onClick={() => setMode("bodyPart")} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition ${mode === "bodyPart" ? "bg-primary text-primary-foreground" : "text-muted-foreground border border-border"}`}>
            <Dumbbell className="w-3 h-3" /> {t("activity.byBodyPart")}
          </button>
        </div>
      </div>

      {noData ? (
        <div className="text-center py-8 text-sm text-muted-foreground">{t("activity.noRecords")}</div>
      ) : mode === "strength" ? (
        <div className="space-y-4">
          <ChartBlock label={t("activity.totalVolume")} data={byDate} dataKey="volume" color="hsl(75 90% 55%)" type="bar" />
          <ChartBlock label={t("activity.weightProgress")} data={byDate} dataKey="maxWeight" color="hsl(142 71% 45%)" type="line" />
        </div>
      ) : mode === "bodyPart" ? (
        <div>
          <div className="text-xs text-muted-foreground mb-1">{t("activity.volumeGrowth")}</div>
          {byDateBodyPart.parts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {byDateBodyPart.parts.map((part, i) => (
                <div key={part} className="flex items-center gap-1 text-[10px]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  {tBodyPart(part)}
                </div>
              ))}
            </div>
          )}
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={byDateBodyPart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" />
              <XAxis dataKey="date" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} width={36} />
              <Tooltip contentStyle={CHART_STYLE} />
              {byDateBodyPart.parts.map((part, i) => (
                <Line key={part} type="monotone" dataKey={part} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
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