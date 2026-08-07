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
    const pres = await base44.entities.Presence.list("-last_seen", 200).catch(() => []);
    const now = Date.now();
    const active = pres.filter((p) => p.last_seen && now - new Date(p.last_seen).getTime() < ONLINE_WINDOW);
    setOnline(active.length);
    setTraining(active.filter((p) => p.is_training).length);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 45000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex items-center gap-1.5 mb-2 text-xs flex-wrap">
      <span className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-dot" />
        {t("realtime.online")} <span className="font-bold text-primary">{online}</span>{t("realtime.onlineUnit")}
      </span>
      {training > 0 ? (
        <span className="flex items-center gap-1 rounded-full px-2.5 py-1 bg-red-500/20 border border-red-500/40">
          <Flame className="w-3 h-3 text-red-400 live-dot" />
          <span className="font-bold text-red-400">{t("realtime.training")}</span>
          <span className="font-bold text-red-300">{training}</span>{t("realtime.trainingUnit")}
        </span>
      ) : (
        <span className="flex items-center gap-1 glass rounded-full px-2.5 py-1 text-muted-foreground">
          <Flame className="w-3 h-3" />
          {t("realtime.training")} <span className="font-bold">0</span>{t("realtime.trainingUnit")}
        </span>
      )}
    </div>
  );
}