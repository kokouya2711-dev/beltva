import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { Activity } from "lucide-react";
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
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthRecords = useMemo(
    () => records.filter((r) => {
      const d = new Date(r.created_date);
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [records, year, month]
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
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-xl">{t("activity.title")}</h2>
      </div>
      <div className="space-y-6">
        <WorkoutCalendar records={monthRecords} year={year} month={month} />
        <MonthlySummary records={monthRecords} />
        <ProgressChart records={monthRecords} />
        <RecentRecords records={records} />
      </div>
    </div>
  );
}