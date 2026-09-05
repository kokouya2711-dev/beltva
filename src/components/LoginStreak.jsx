import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeStreak(dates) {
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (set.has(dateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function LoginStreak({ me }) {
  const [activeDays, setActiveDays] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!me?.id) return;
    let parsed = [];
    try {
      parsed = JSON.parse(me.login_days || "[]");
    } catch {
      parsed = [];
    }
    const today = dateStr(new Date());
    if (!parsed.includes(today)) {
      parsed = [...parsed, today];
      base44.auth.updateMe({ login_days: JSON.stringify(parsed) }).catch(() => {});
    }
    setActiveDays(new Set(parsed).size);
    setStreak(computeStreak(parsed));
  }, [me?.id, me?.login_days]);

  return (
    <div className="flex items-stretch justify-center gap-10 px-4 py-3">
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-muted-foreground tracking-wider uppercase mb-0.5">アクティブDAY</span>
        <span className="text-3xl font-bold text-foreground leading-none">{activeDays}</span>
      </div>
      <div className="w-px bg-border/30 self-center" style={{ minHeight: "2.5rem" }} />
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-muted-foreground tracking-wider uppercase mb-0.5">連続日数</span>
        <span className="text-3xl font-bold text-foreground leading-none">{streak}</span>
      </div>
    </div>
  );
}