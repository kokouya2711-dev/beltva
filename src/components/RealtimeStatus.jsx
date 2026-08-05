import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Flame } from "lucide-react";
import { useT } from "@/lib/i18n";

const ONLINE_WINDOW = 120000;

export default function RealtimeStatus() {
  const t = useT();
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
    <div className="flex items-center gap-1.5 mb-2 text-xs flex-wrap">
      <span className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-dot" />
        {t("realtime.online")} <span className="font-bold text-primary">{online}</span>{t("realtime.onlineUnit")}
      </span>
      <span className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
        <Flame className="w-3 h-3 text-red-500" />
        {t("realtime.training")} <span className="font-bold text-red-400">{training}</span>{t("realtime.trainingUnit")}
      </span>
    </div>
  );
}