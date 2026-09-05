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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const recs = await base44.entities.WorkoutRecord.filter({ created_by_id: user.id }, "-created_date", 200);
          setRecords(recs);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const handlePrev = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const handleNext = () => {
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
        <WorkoutCalendar records={monthRecords} year={viewYear} month={viewMonth} onPrevMonth={handlePrev} onNextMonth={handleNext} />
        <MonthlySummary records={monthRecords} />
        <ProgressChart records={monthRecords} />
        <RecentRecords records={records} />
      </div>
    </div>
  );
}