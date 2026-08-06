import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { groupByDay, formatDuration, formatPace, formatDateJP, formatTime } from "@/lib/activityHelpers";
import { Loader2, ChevronRight, Dumbbell, Heart, Calendar, ArrowLeft } from "lucide-react";

export default function WorkoutHistoryPage() {
  const t = useT();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const recs = await base44.entities.WorkoutRecord.filter({ created_by_id: user.id }, "-created_date", 200);
          setDays(groupByDay(recs));
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 md:py-8">
      <Link to="/activity" className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary/40 mb-3">
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <h1 className="font-bold text-xl mb-4">{t("activity.history")}</h1>
      {days.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-12 flex flex-col items-center gap-2 text-muted-foreground">
          <Calendar className="w-8 h-8 opacity-40" />
          <div className="text-sm">{t("activity.historyEmpty")}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day) => (
            <Link key={day.key} to={`/workout-history/${day.key}`} className="block">
              <div className="glass rounded-2xl border border-border p-4 hover:border-primary transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">{formatDateJP(day.date)}</div>
                  <div className="flex items-center gap-1">
                    {day.hasStrength && <Dumbbell className="w-3.5 h-3.5 text-primary" />}
                    {day.hasCardio && <Heart className="w-3.5 h-3.5 text-accent" />}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <div className="text-muted-foreground">{t("activity.startTime")}: <span className="text-foreground">{formatTime(day.start)}</span></div>
                  <div className="text-muted-foreground">{t("activity.endTime")}: <span className="text-foreground">{formatTime(day.end)}</span></div>
                  <div className="text-muted-foreground">{t("activity.trainingTime")}: <span className="text-foreground">{formatDuration(day.totalDuration)}</span></div>
                  <div className="text-muted-foreground">{t("activity.setType")}: <span className="text-foreground">{day.hasCardio && day.hasStrength ? `${t("activity.strength")}+${t("activity.cardio")}` : day.hasCardio ? t("activity.cardio") : t("activity.strength")}</span></div>
                </div>
                {day.hasStrength && day.totalVolume > 0 && (
                  <div className="mt-2 text-xs"><span className="text-muted-foreground">{t("activity.totalVolume")}: </span><span className="text-primary font-medium">{day.totalVolume.toLocaleString()} kg</span></div>
                )}
                {day.hasCardio && day.totalDistance > 0 && (
                  <div className="mt-1 text-xs"><span className="text-muted-foreground">{t("activity.distance")} / {t("activity.duration")} / {t("activity.pace")}: </span><span className="text-accent font-medium">{day.totalDistance.toFixed(1)}km / {formatDuration(day.totalDuration)} / {formatPace(day.totalDistance, day.totalDuration)}</span></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}