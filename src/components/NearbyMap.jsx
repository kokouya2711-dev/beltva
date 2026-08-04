import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { getGeolocation, DEFAULT_CENTER } from "@/lib/workouts";
import { Link } from "react-router-dom";
import { Loader2, MapPin, Radio } from "lucide-react";
import { useT } from "@/lib/i18n";

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, Math.max(map.getZoom(), 12), { animate: true });
  }, [center?.[0], center?.[1]]);
  return null;
}

export default function NearbyMap() {
  const t = useT();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [meUser, us, live] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.User.list("-created_date", 200),
          base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 200)
        ]);
        setMe(meUser);
        setUsers(us.filter((u) => u.id !== meUser?.id && u.lat != null));
        setSessions(live.filter((s) => s.lat != null));

        // decide center: precise geolocation > me.lat > default
        let c = null;
        if (meUser?.lat != null) c = [meUser.lat, meUser.lng];
        const geo = await getGeolocation();
        if (geo) c = [geo.lat, geo.lng];
        if (!c) c = [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
        setCenter(c);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const liveByUser = useMemo(() => {
    const m = {};
    sessions.forEach((s) => { if (s.created_by_id) m[s.created_by_id] = s; });
    return m;
  }, [sessions]);

  const nearbyUsers = useMemo(() => {
    if (!center) return [];
    return users
      .map((u) => ({ ...u, _d: Math.hypot(u.lat - center[0], u.lng - center[1]) }))
      .sort((a, b) => a._d - b._d)
      .slice(0, 40);
  }, [users, center]);

  if (loading || !center) {
    return (
      <div className="h-[380px] md:h-[460px] rounded-2xl border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        zoomControl={false}
        className="w-full h-[380px] md:h-[460px]"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Recenter center={center} />

        {/* current user */}
        <CircleMarker center={center} radius={9} pathOptions={{ color: "#ccff00", fillColor: "#ccff00", fillOpacity: 0.9, weight: 2 }}>
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>{t("home.you")}</Tooltip>
        </CircleMarker>

        {/* nearby users */}
        {nearbyUsers.map((u) => {
          const live = liveByUser[u.id];
          const isLive = !!live;
          return (
            <CircleMarker
              key={u.id}
              center={[u.lat, u.lng]}
              radius={isLive ? 7 : 5}
              pathOptions={isLive
                ? { color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.85, weight: 2 }
                : { color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.6, weight: 1.5 }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="text-xs">
                  <div className="font-medium">{u.display_name || u.email?.split("@")[0]}</div>
                  {isLive && <div className="text-red-400 flex items-center gap-1"><Radio className="w-3 h-3" /> {live.workout_type}</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* legend overlay */}
      <div className="absolute bottom-3 left-3 z-[400] glass rounded-lg px-3 py-2 text-[11px] space-y-1">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" /> {t("home.you")}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> {t("home.nearbyUser")}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> {t("home.trainingLive")}</div>
      </div>
      <div className="absolute top-3 right-3 z-[400] glass rounded-lg px-3 py-2 text-xs flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        {nearbyUsers.length} {t("home.nearbyCount")}
      </div>
    </div>
  );
}