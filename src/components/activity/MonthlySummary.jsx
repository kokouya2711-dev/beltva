import React from "react";
import { useT } from "@/lib/i18n";
import { formatDuration } from "@/lib/activityHelpers";
import { Dumbbell, Clock } from "lucide-react";

export default function MonthlySummary({ records }) {
  const t = useT();
  const sessions = records.length;
  const totalSec = records.reduce((sum, r) => sum + (Number(r.duration_sec) || 0), 0);

  return (
    <div className="glass rounded-2xl border border-border p-4">
      <h3 className="font-semibold text-sm mb-3">{t("activity.summary")}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/40 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold leading-tight">{sessions}<span className="text-xs font-normal text-muted-foreground ml-1">{t("activity.sessions")}</span></div>
          </div>
        </div>
        <div className="bg-secondary/40 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold leading-tight truncate">{formatDuration(totalSec)}</div>
            <div className="text-[10px] text-muted-foreground">{t("activity.totalTime")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}