import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import MyActivity from "@/components/activity/MyActivity";
import BodyPartRatioSection from "@/components/home/BodyPartRatioSection";

export default function Home() {
  const [me, setMe] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8">
      {/* 📊 My Activity */}
      <section>
        <MyActivity me={me} records={records} />
      </section>
      <div className="h-px bg-border/70 my-6" />
      <section>
        <BodyPartRatioSection me={me} records={records} />
      </section>
    </div>
  );
}