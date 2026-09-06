import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import WorkoutCalendar from "./WorkoutCalendar";
import ActivitySection from "./ActivitySection";
import ProgressChart from "./ProgressChart";
import RecentRecords from "./RecentRecords";

export default function MyActivity() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WorkoutCalendar allRecords={records} appStart={appStart} currentYear={currentYear} currentMonth={currentMonth} />
      <ActivitySection allRecords={records} appStart={appStart} currentYear={currentYear} currentMonth={currentMonth} />
      <ProgressChart records={records.filter((r) => {
        const d = new Date(r.created_date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })} />
      <RecentRecords records={records} />
    </div>
  );
}