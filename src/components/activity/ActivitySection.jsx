import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n, useT } from "@/lib/i18n";
import { isCardio, getWorkoutDate, getWorkoutDateKey, getMonthNav } from "@/lib/activityHelpers";

export default function ActivitySection({ allRecords, appStart, currentYear, currentMonth }) {
  const { lang } = useI18n();
  const t = useT();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const touchStartX = React.useRef(null);

  const nav = useMemo(
    () => getMonthNav(appStart, currentYear, currentMonth),
    [appStart, currentYear, currentMonth]
  );

  const handlePrev = () => {
    if (!nav.canPrev(viewYear, viewMonth)) return;
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const handleNext = () => {
    if (!nav.canNext(viewYear, viewMonth)) return;
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

  const monthLabel = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : lang === "zh-TW" ? "zh-TW" : lang, { month: "long" }).format(new Date(viewYear, viewMonth, 1));

  const { trainingDays, cardioMinutes } = useMemo(() => {
    const days = new Set();
    let cardioSec = 0;
    allRecords.forEach((r) => {
      const d = getWorkoutDate(r);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        days.add(getWorkoutDateKey(r));
        if (isCardio(r.workout_type)) cardioSec += Number(r.duration_sec) || 0;
      }
    });
    return { trainingDays: days.size, cardioMinutes: Math.round(cardioSec / 60) };
  }, [allRecords, viewYear, viewMonth]);

  const h = Math.floor(cardioMinutes / 60);
  const m = cardioMinutes % 60;
  const cardioVal = h > 0 ? h : m;
  const cardioUnit = h > 0 ? t("activity.hourUnit") : t("activity.minUnit");

  const dayColor = trainingDays > 0 ? "text-primary" : "text-foreground";
  const cardioColor = cardioMinutes > 0 ? "text-primary" : "text-foreground";

  const activeDot = nav.activeIndex(viewYear, viewMonth);

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl font-extrabold text-foreground tracking-tight">{t("activity.title")}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={!nav.canPrev(viewYear, viewMonth)}
            className={`p-1 transition-colors ${nav.canPrev(viewYear, viewMonth) ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
            aria-label={t("common.prevMonth")}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <span className="text-[1.18rem] font-bold text-foreground min-w-[44px] text-center">{monthLabel}</span>
          <button
            onClick={handleNext}
            disabled={!nav.canNext(viewYear, viewMonth)}
            className={`p-1 transition-colors ${nav.canNext(viewYear, viewMonth) ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
            aria-label={t("common.nextMonth")}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground/70">{t("activity.trainingDays")}</span>
          <div className={`text-3xl font-extrabold leading-none tracking-tight flex items-baseline ${dayColor}`}>
            {trainingDays}<span className="text-base font-bold text-muted-foreground ml-0.5">{t("activity.daySuffix")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground/70">{t("activity.cardioTotalTime")}</span>
          <div className={`text-3xl font-extrabold leading-none tracking-tight flex items-baseline ${cardioColor}`}>
            {cardioVal}<span className="text-base font-bold text-muted-foreground ml-0.5">{cardioUnit}</span>
            {h > 0 && (
              <>
                <span className={cardioColor}>{m}</span>
                <span className="text-base font-bold text-muted-foreground ml-0.5">{t("activity.minUnit")}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* page dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {Array.from({ length: nav.dotsCount }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === activeDot ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
          />
        ))}
      </div>
    </div>
  );
}