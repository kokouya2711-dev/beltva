import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import WorkoutCalendar from "./WorkoutCalendar";
import ActivitySection from "./ActivitySection";
import { getWorkoutDate } from "@/lib/activityHelpers";

export default function MyActivity({ me: meProp, records: recordsProp }) {
  const [records, setRecords] = useState(recordsProp || []);
  const [me, setMe] = useState(meProp || null);
  const [loading, setLoading] = useState(!meProp);

  useEffect(() => {
    if (meProp) { setMe(meProp); setRecords(recordsProp || []); return; }
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
  }, [meProp, recordsProp]);

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
      const dt = getWorkoutDate(r);
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
    <div>
      <WorkoutCalendar allRecords={records} appStart={appStart} currentYear={currentYear} currentMonth={currentMonth} />
      <div className="h-px bg-border/70 my-5" />
      <ActivitySection allRecords={records} appStart={appStart} currentYear={currentYear} currentMonth={currentMonth} />
    </div>
  );
}