import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import WorkoutCalendar from "./WorkoutCalendar";
import MonthlySummary from "./MonthlySummary";
import ProgressChart from "./ProgressChart";
import RecentRecords from "./RecentRecords";

export default function MyActivity() {
  const t = useT();
  const [records, setRecords] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setMe(user);
          const recs = await base44.entities.WorkoutRecord.filter({ created_by_id: user.id }, "-created_date", 200);
          setRecords(recs);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);

  // App usage start month (earliest of login_days and records)
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
      const dt = new Date(r.created_date);
      if (!isNaN(dt) && (!earliest || dt < earliest)) earliest = dt;
    });
    return earliest;
  }, [me, records]);

  // Lower bound = max(appStart month, 3 months ago). Upper bound = current month.
  const { canPrev, canNext } = useMemo(() => {
    const threeAgo = new Date(currentYear, currentMonth - 3, 1);
    let lowerY = threeAgo.getFullYear();
    let lowerM = threeAgo.getMonth();
    if (appStart) {
      const startY = appStart.getFullYear();
      const startM = appStart.getMonth();
      if (startY > lowerY || (startY === lowerY && startM > lowerM)) {
        lowerY = startY;
        lowerM = startM;
      }
    }
    const prev = viewYear > lowerY || (viewYear === lowerY && viewMonth > lowerM);
    const next = viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth);
    return { canPrev: prev, canNext: next };
  }, [appStart, viewYear, viewMonth, currentYear, currentMonth]);

  const handlePrev = () => {
    if (!canPrev) return;
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const handleNext = () => {
    if (!canNext) return;
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const monthRecords = useMemo(
    () => records.filter((r) => {
      const d = new Date(r.created_date);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    }),
    [records, viewYear, viewMonth]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <WorkoutCalendar records={monthRecords} year={viewYear} month={viewMonth} onPrevMonth={handlePrev} onNextMonth={handleNext} canPrev={canPrev} canNext={canNext} />
        <MonthlySummary records={monthRecords} />
        <ProgressChart records={monthRecords} />
        <RecentRecords records={records} />
      </div>
    </div>
  );
}