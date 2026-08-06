import React, { useState, useMemo } from "react";
import { useT, useI18n } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";
import { getDateKey, isCardio, formatDuration } from "@/lib/activityHelpers";

export default function WorkoutCalendar({ records, year, month }) {
  const t = useT();
  const { lang } = useI18n();
  const tWorkout = useTWorkout();
  const [selectedDay, setSelectedDay] = useState(null);

  const locale = lang === "zh" ? "zh-CN" : lang === "zh-TW" ? "zh-TW" : lang;
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i)));
  }, [locale]);
  const monthYear = useMemo(() => {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(new Date(year, month, 1));
  }, [locale, year, month]);

  const recordsByDate = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key = getDateKey(r.created_date);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [records]);

  const startWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, key, hasRecords: !!recordsByDate[key], records: recordsByDate[key] || [] });
  }

  return (
    <div className="glass rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{t("activity.calendar")}</h3>
        <span className="text-xs text-muted-foreground">{monthYear}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[10px] text-muted-foreground py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => (
          cell === null ? <div key={i} /> : (
            <button
              key={i}
              onClick={() => cell.hasRecords ? setSelectedDay(selectedDay?.day === cell.day ? null : cell) : null}
              className={`aspect-square rounded-lg text-xs flex items-center justify-center transition ${
                cell.hasRecords
                  ? "bg-primary/20 text-primary font-bold hover:bg-primary/30"
                  : "text-muted-foreground"
              } ${isToday(cell.day) ? "ring-1 ring-primary" : ""}`}
            >
              {cell.day}
            </button>
          )
        ))}
      </div>
      {selectedDay && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">
            {new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }).format(new Date(year, month, selectedDay.day))}
          </div>
          <div className="space-y-1.5">
            {selectedDay.records.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span className="font-medium">{tWorkout(r.workout_type) || r.workout_type}</span>
                <span className="text-muted-foreground">
                  {isCardio(r.workout_type)
                    ? `${r.distance > 0 ? `${r.distance}${t("common.kg") === "kg" ? "km" : "km"} ` : ""}${formatDuration(r.duration_sec, t)}`
                    : `${r.sets} ${t("goLive.sets")} × ${r.reps} ${t("goLive.reps")}${r.weight > 0 ? ` @${r.weight}${t("common.kg")}` : ""}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}