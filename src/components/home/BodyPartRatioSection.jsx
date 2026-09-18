import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n, useT } from "@/lib/i18n";
import { getWorkoutDate, getMonthNav, workoutTypeLabel } from "@/lib/activityHelpers";

const PARTS = ["胸", "背中", "脚", "肩", "二頭筋", "三頭筋", "腹"];

export default function BodyPartRatioSection({ me: meProp, records: recordsProp }) {
  const { lang } = useI18n();
  const t = useT();
  const [records, setRecords] = useState(recordsProp || []);
  const [me, setMe] = useState(meProp || null);
  const [loading, setLoading] = useState(!meProp);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const touchStartX = useRef(null);

  useEffect(() => {
    if (meProp) { setMe(meProp); setRecords(recordsProp || []); return; }
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setMe(user);
          const recs = await base44.entities.WorkoutRecord.filter(
            { created_by_id: user.id },
            "-created_date",
            500
          );
          setRecords(recs);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [meProp, recordsProp]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const appStart = useMemo(() => {
    let earliest = null;
    if (me?.login_days) {
      try {
        JSON.parse(me.login_days).forEach((d) => {
          const dt = new Date(d);
          if (!isNaN(dt) && (!earliest || dt < earliest)) earliest = dt;
        });
      } catch { /* ignore */ }
    }
    records.forEach((r) => {
      const dt = getWorkoutDate(r);
      if (!isNaN(dt) && (!earliest || dt < earliest)) earliest = dt;
    });
    return earliest;
  }, [me, records]);

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

  const { counts, total } = useMemo(() => {
    const c = {};
    PARTS.forEach((p) => (c[p] = 0));
    let t = 0;
    records.forEach((r) => {
      if (!PARTS.includes(r.workout_type)) return;
      const d = getWorkoutDate(r);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        c[r.workout_type] += 1;
        t += 1;
      }
    });
    return { counts: c, total: t };
  }, [records, viewYear, viewMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const monthLabel = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : lang === "zh-TW" ? "zh-TW" : lang, { month: "long" }).format(new Date(viewYear, viewMonth, 1));
  const activeDot = nav.activeIndex(viewYear, viewMonth);

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl font-extrabold text-foreground tracking-tight">{t("activity.byBodyPartTitle")}</span>
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

      <div className="flex flex-col gap-4">
        {PARTS.map((p) => {
          const count = counts[p];
          const ratio = total > 0 ? (count / total) * 100 : 0;
          const pct = Math.round(ratio);
          return (
            <div key={p}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-semibold text-foreground/80">{workoutTypeLabel(p, t)}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-extrabold leading-none ${count > 0 ? "text-primary" : "text-foreground"}`}>{pct}<span className="text-base font-bold ml-0.5">%</span></span>
                  <span className="text-sm font-semibold text-muted-foreground">{count}{t("activity.countSuffix")}</span>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => {
                  const segFill = Math.min(1, Math.max(0, ratio / 10 - i));
                  return (
                    <div key={i} className="flex-1 h-2 rounded-sm bg-secondary/70 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${segFill * 100}%` }} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {total === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-1">{t("activity.noRecordsThisMonth")}</p>
        )}
      </div>

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