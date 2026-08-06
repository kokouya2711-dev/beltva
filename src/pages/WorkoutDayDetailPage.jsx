import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";
import { isCardio, formatDuration, formatPace, getDateKey } from "@/lib/activityHelpers";
import { ArrowLeft, Loader2, Dumbbell, Heart } from "lucide-react";

export default function WorkoutDayDetailPage() {
  const { date } = useParams();
  const t = useT();
  const tWorkout = useTWorkout();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const recs = await base44.entities.WorkoutRecord.filter({ created_by_id: user.id }, "-created_date", 200);
          setRecords(recs.filter((r) => getDateKey(r.created_date) === date));
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [date]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const hasCardio = records.some((r) => isCardio(r.workout_type));
  const hasStrength = records.some((r) => !isCardio(r.workout_type));
  const totalVolume = records.reduce((s, r) => s + (Number(r.volume) || 0), 0);
  const totalDistance = records.reduce((s, r) => s + (Number(r.distance) || 0), 0);
  const totalDuration = Math.max(0, ...records.map((r) => Number(r.duration_sec) || 0));
  const [y, m, d] = (date || "").split("-");

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 md:py-8">
      <Link to="/workout-history" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-3">
        <ArrowLeft className="w-4 h-4" /> {t("common.back")}
      </Link>
      <h1 className="font-bold text-xl mb-1">{t("activity.dayDetail")}</h1>
      <div className="text-sm text-muted-foreground mb-4">{y}年{Number(m)}月{Number(d)}日</div>

      <div className="glass rounded-2xl border border-border p-4 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            {hasStrength && <Dumbbell className="w-4 h-4 text-primary" />}
            {hasCardio && <Heart className="w-4 h-4 text-accent" />}
            <span className="font-medium">{hasCardio && hasStrength ? `${t("activity.strength")}+${t("activity.cardio")}` : hasCardio ? t("activity.cardio") : t("activity.strength")}</span>
          </div>
          <div className="text-muted-foreground">{t("activity.trainingTime")}: <span className="text-foreground font-medium">{formatDuration(totalDuration)}</span></div>
          {hasStrength && totalVolume > 0 && (
            <div className="text-muted-foreground">{t("activity.totalVolume")}: <span className="text-primary font-medium">{totalVolume.toLocaleString()} kg</span></div>
          )}
          {hasCardio && totalDistance > 0 && (
            <div className="text-muted-foreground">{t("activity.distance")}: <span className="text-accent font-medium">{totalDistance.toFixed(1)} km</span></div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {records.map((r) => {
          const cardio = isCardio(r.workout_type);
          let setDetails = [];
          try { setDetails = JSON.parse(r.set_details || "[]"); } catch { /* ignore */ }
          return (
            <div key={r.id} className="glass rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                {cardio ? <Heart className="w-4 h-4 text-accent" /> : <Dumbbell className="w-4 h-4 text-primary" />}
                <h3 className="font-semibold text-sm">{tWorkout(r.workout_type) || r.workout_type}</h3>
              </div>
              {cardio ? (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Metric label={t("activity.distance")} value={r.distance > 0 ? `${r.distance} km` : "—"} />
                  <Metric label={t("activity.duration")} value={formatDuration(r.duration_sec)} />
                  <Metric label={t("activity.pace")} value={formatPace(r.distance, r.duration_sec)} />
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground mb-1.5 px-1">
                    <div>{t("activity.setCount")}</div>
                    <div>{t("activity.weight")}</div>
                    <div>{t("activity.reps")}</div>
                  </div>
                  {(setDetails.length > 0 ? setDetails : [{ weight: r.weight, reps: r.reps }]).map((s, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{i + 1}</div>
                      <div>{Number(s.weight) || 0} kg</div>
                      <div>{Number(s.reps) || 0}</div>
                    </div>
                  ))}
                  <div className="mt-2 text-xs text-muted-foreground">{t("activity.totalVolume")}: <span className="text-primary font-medium">{(Number(r.volume) || 0).toLocaleString()} kg</span></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-secondary/40 rounded-lg p-2 text-center">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}