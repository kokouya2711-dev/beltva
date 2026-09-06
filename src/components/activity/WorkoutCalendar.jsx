import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useI18n, useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";
import { getDateKey, isCardio, formatDuration, getMonthNav } from "@/lib/activityHelpers";

export default function WorkoutCalendar({ allRecords, appStart, currentYear, currentMonth }) {
  const t = useT();
  const { lang } = useI18n();
  const tWorkout = useTWorkout();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(null);
  const touchStartX = React.useRef(null);

  const nav = useMemo(
    () => getMonthNav(appStart, currentYear, currentMonth),
    [appStart, currentYear, currentMonth]
  );

  const handlePrev = () => {
    if (!nav.canPrev(viewYear, viewMonth)) return;
    setSelectedDay(null);
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const handleNext = () => {
    if (!nav.canNext(viewYear, viewMonth)) return;
    setSelectedDay(null);
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) handleNext();
    else handlePrev();
  };

  const locale = lang === "zh" ? "zh-CN" : lang === "zh-TW" ? "zh-TW" : lang;
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i)));
  }, [locale]);
  const monthYear = useMemo(() => {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(new Date(viewYear, viewMonth, 1));
  }, [locale, viewYear, viewMonth]);

  const monthRecords = useMemo(
    () => allRecords.filter((r) => {
      const d = new Date(r.created_date);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    }),
    [allRecords, viewYear, viewMonth]
  );

  const recordsByDate = useMemo(() => {
    const map = {};
    monthRecords.forEach((r) => {
      const key = getDateKey(r.created_date);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [monthRecords]);

  const startWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const trainingDays = Object.keys(recordsByDate).length;
  const today = new Date();
  const isToday = (d) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, key, hasRecords: !!recordsByDate[key], records: recordsByDate[key] || [] });
  }

  const activeDot = nav.activeIndex(viewYear, viewMonth);

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={!nav.canPrev(viewYear, viewMonth)}
            className={`p-1.5 -ml-1.5 transition-colors ${nav.canPrev(viewYear, viewMonth) ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
            aria-label="前の月"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <span className="text-xl font-extrabold text-foreground tracking-tight">{monthYear}</span>
          <button
            onClick={handleNext}
            disabled={!nav.canNext(viewYear, viewMonth)}
            className={`p-1.5 -mr-1.5 transition-colors ${nav.canNext(viewYear, viewMonth) ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
            aria-label="次の月"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[17px] font-extrabold text-foreground mr-2">
          {trainingDays > 0 && <Flame className="w-5 h-5 text-primary" fill="currentColor" strokeWidth={0} />}
          <span>{trainingDays}/{totalDays}日</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-xs font-semibold text-muted-foreground py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => (
          cell === null ? <div key={i} /> : (
            <button
              key={i}
              onClick={() => cell.hasRecords ? setSelectedDay(selectedDay?.day === cell.day ? null : cell) : null}
              className={`aspect-square rounded-lg flex items-center justify-center transition relative text-sm ${
                cell.hasRecords
                  ? "bg-primary text-primary-foreground font-extrabold hover:opacity-90"
                  : "text-muted-foreground hover:bg-secondary/60 font-semibold"
              } ${isToday(cell.day) && !cell.hasRecords ? "ring-2 ring-primary text-primary font-bold" : ""} ${isToday(cell.day) && cell.hasRecords ? "ring-2 ring-foreground" : ""} ${selectedDay?.day === cell.day ? "font-black" : ""}`}
            >
              {cell.day}
            </button>
          )
        ))}
      </div>

      {/* page dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: nav.dotsCount }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === activeDot ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
          />
        ))}
      </div>

      {selectedDay && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">
            {new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }).format(new Date(viewYear, viewMonth, selectedDay.day))}
          </div>
          <div className="space-y-1.5">
            {selectedDay.records.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span className="font-medium">{tWorkout(r.workout_type) || r.workout_type}</span>
                <span className="text-muted-foreground">
                  {isCardio(r.workout_type)
                    ? `${r.distance > 0 ? `${r.distance}km ` : ""}${formatDuration(r.duration_sec, t)}`
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