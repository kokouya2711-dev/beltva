import React, { useMemo } from "react";
import { isCardio, getDateKey } from "@/lib/activityHelpers";

export default function MonthlySummary({ records }) {
  const { trainingDays, cardioMinutes } = useMemo(() => {
    const days = new Set();
    let cardioSec = 0;
    records.forEach((r) => {
      days.add(getDateKey(r.created_date));
      if (isCardio(r.workout_type)) cardioSec += Number(r.duration_sec) || 0;
    });
    return { trainingDays: days.size, cardioMinutes: Math.round(cardioSec / 60) };
  }, [records]);

  const h = Math.floor(cardioMinutes / 60);
  const m = cardioMinutes % 60;
  const cardioLabel = h > 0 ? `${h}時間${m}分` : `${m}分`;

  return (
    <div className="px-1">
      <h3 className="text-base font-bold text-foreground mb-4">今月のアクティビティ</h3>
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">トレーニング日数</div>
          <div className="text-4xl font-extrabold text-foreground leading-none tracking-tight">
            {trainingDays}<span className="text-xl font-bold text-muted-foreground ml-1">日</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">有酸素 合計時間</div>
          <div className="text-4xl font-extrabold leading-none tracking-tight">
            <span className="text-primary">{h > 0 ? h : m}</span>
            <span className="text-xl font-bold text-muted-foreground ml-1">{h > 0 ? "時間" : "分"}</span>
            {h > 0 && (
              <>
                <span className="text-primary">{m}</span>
                <span className="text-xl font-bold text-muted-foreground ml-1">分</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}