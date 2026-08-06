import React from "react";
import { Link } from "react-router-dom";
import { useT } from "@/lib/i18n";
import { useTWorkout, useTimeAgo } from "@/lib/i18nHelpers";
import { isCardio, formatDuration } from "@/lib/activityHelpers";
import { ChevronRight } from "lucide-react";

export default function RecentRecords({ records }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const timeAgo = useTimeAgo();
  const recent = records.slice(0, 3);

  return (
    <div className="glass rounded-2xl border border-border p-4">
      <h3 className="font-semibold text-sm mb-3">{t("activity.recentRecords")}</h3>
      {recent.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">{t("activity.noRecords")}</div>
      ) : (
        <div className="space-y-1">
          {recent.map((r) => {
            const cardio = isCardio(r.workout_type);
            return (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{tWorkout(r.workout_type) || r.workout_type}</div>
                  <div className="text-[10px] text-muted-foreground">{timeAgo(r.created_date)}</div>
                </div>
                <div className="text-xs text-muted-foreground text-right shrink-0 ml-2">
                  {cardio
                    ? `${r.distance > 0 ? `${r.distance}km ` : ""}${formatDuration(r.duration_sec, t)}`
                    : `${r.sets}×${r.reps}${r.weight > 0 ? ` @${r.weight}kg` : ""}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Link to="/workout-history" className="mt-3 flex items-center justify-center gap-1 text-xs text-primary hover:underline">
        {t("activity.viewAll")} <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}