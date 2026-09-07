import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getWorkoutDate, getMonthNav } from "@/lib/activityHelpers";

const PARTS = ["胸", "背中", "脚", "肩", "二頭筋", "三頭筋", "腹"];

export default function BodyPartRatioSection() {
  const [records, setRecords] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const touchStartX = useRef(null);

  useEffect(() => {
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
  }, []);

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

  const monthLabel = `${viewMonth + 1}月`;
  const activeDot = nav.activeIndex(viewYear, viewMonth);

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl font-extrabold text-foreground tracking-tight">部位別トレーニング</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={!nav.canPrev(viewYear, viewMonth)}
            className={`p-1 transition-colors ${nav.canPrev(viewYear, viewMonth) ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
            aria-label="前の月"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <span className="text-[1.18rem] font-bold text-foreground min-w-[44px] text-center">{monthLabel}</span>
          <button
            onClick={handleNext}
            disabled={!nav.canNext(viewYear, viewMonth)}
            className={`p-1 transition-colors ${nav.canNext(viewYear, viewMonth) ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
            aria-label="次の月"
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
                <span className="text-sm font-semibold text-foreground/80">{p}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-extrabold leading-none ${count > 0 ? "text-primary" : "text-foreground"}`}>{pct}<span className="text-base font-bold ml-0.5">%</span></span>
                  <span className="text-sm font-semibold text-muted-foreground">{count}回</span>
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
          <p className="text-xs text-muted-foreground text-center mt-1">この月の記録はありません</p>
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