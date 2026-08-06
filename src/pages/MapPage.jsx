import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Globe, Radio, MapPin, Flame } from "lucide-react";
import TrainingGlobe from "@/components/TrainingGlobe";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function MapPage() {
  const t = useT();
  const tWorkout = useTWorkout();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const live = await base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 200);
        setSessions(live);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const points = sessions
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({ lat: s.lat, lng: s.lng, label: tWorkout(s.workout_type) }));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold">{t("home.globe")}</h1>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">{t("map.subtitle")}</span>
      </div>

      <p className="text-sm text-muted-foreground -mt-2">{t("home.globeSub")}</p>

      <div className="relative rounded-2xl overflow-hidden border border-border">
        <TrainingGlobe points={points} />
        <div className="absolute top-3 right-3 z-[400] glass rounded-lg px-3 py-2 text-xs flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-red-500" />
          {sessions.length} {t("home.trainingCount")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sessions.length === 0 && !loading && (
          <div className="col-span-full glass rounded-2xl border border-border py-12 flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="w-8 h-8 opacity-50" />
            <div className="text-sm">{t("home.noLive")}</div>
          </div>
        )}
        {sessions.map((s) => (
          <div key={s.id} className="glass rounded-xl border border-border p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{tWorkout(s.workout_type)} · {s.location_name || t("common.nearby")}</div>
              <div className="text-xs text-muted-foreground">🔥 {s.hype_count || 0}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-red-500 live-dot" />
          </div>
        ))}
      </div>
    </div>
  );
}