import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Flame } from "lucide-react";

const ONLINE_WINDOW = 120000;

export default function RealtimeStatus() {
  const [online, setOnline] = useState(0);
  const [training, setTraining] = useState(0);

  async function load() {
    const [pres, live] = await Promise.all([
      base44.entities.Presence.list("-last_seen", 500).catch(() => []),
      base44.entities.LiveSession.filter({ status: "live" }).catch(() => [])
    ]);
    const now = Date.now();
    setOnline(pres.filter((p) => p.last_seen && now - new Date(p.last_seen).getTime() < ONLINE_WINDOW).length);
    setTraining(live.length);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex items-center gap-2 mb-3 text-sm flex-wrap">
      <span className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 live-dot" />
        現在オンライン <span className="font-bold text-primary">{online}</span>人
      </span>
      <span className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
        <Flame className="w-3.5 h-3.5 text-red-500" />
        現在トレーニング中 <span className="font-bold text-red-400">{training}</span>人
      </span>
    </div>
  );
}