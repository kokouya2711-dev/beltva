import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { getGeolocation, DEFAULT_CENTER, fuzzCoords } from "@/lib/workouts";
import { useNavigate } from "react-router-dom";
import { Loader2, Globe, LocateFixed, Satellite, Map as MapIcon, Radio, Flame } from "lucide-react";
import { useT } from "@/lib/i18n";

const ONLINE_WINDOW = 120000; // 2 min — matches UsersPage online definition
const NORMAL_TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
// Esri World Imagery — high quality worldwide satellite imagery
const SAT_TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const FILTERS = ["all", "online", "training", "following", "nearby"];

export default function NearbyMap() {
  const t = useT();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});
  const [sessions, setSessions] = useState([]);
  const [followIds, setFollowIds] = useState(new Set());
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [satellite, setSatellite] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const [meUser, us, pres, live, follows] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.User.list("-created_date", 300),
          base44.entities.Presence.list("-last_seen", 300).catch(() => []),
          base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 300),
          base44.entities.Follow.list("-created_date", 500).catch(() => [])
        ]);
        setMe(meUser);
        setUsers(us.filter((u) => u.id !== meUser?.id && u.lat != null));
        const pm = {};
        pres.forEach((p) => { pm[p.created_by_id] = p.last_seen; });
        setPresence(pm);
        setSessions(live.filter((s) => s.lat != null));
        setFollowIds(new Set(follows.filter((f) => f.follower_id === meUser?.id).map((f) => f.followee_id)));

        let c = null;
        if (meUser?.lat != null) c = [meUser.lat, meUser.lng];
        const geo = await getGeolocation();
        if (geo) c = [geo.lat, geo.lng];
        if (!c) c = [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
        // Privacy: blur own location to ~5km grid before displaying
        const fuzzed = fuzzCoords(c[0], c[1]);
        setCenter([fuzzed.lat, fuzzed.lng]);
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

  const isOnline = (uid) => !!(presence[uid] && Date.now() - new Date(presence[uid]).getTime() < ONLINE_WINDOW);

  const filtered = useMemo(() => {
    let arr = users;
    if (filter === "online") arr = arr.filter((u) => isOnline(u.id));
    else if (filter === "training") arr = arr.filter((u) => liveByUser[u.id]);
    else if (filter === "following") arr = arr.filter((u) => followIds.has(u.id));
    else if (filter === "nearby") {
      if (!center) return [];
      arr = [...arr]
        .map((u) => ({ ...u, _d: Math.hypot(u.lat - center[0], u.lng - center[1]) }))
        .sort((a, b) => a._d - b._d)
        .slice(0, 40);
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, filter, presence, liveByUser, followIds, center]);

  function flyToCurrent() {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo(center, 14, { duration: 0.8 });
  }
  function flyToWorld() {
    if (!mapRef.current) return;
    mapRef.current.flyTo([20, 0], 1, { duration: 0.9 });
  }

  if (loading || !center) {
    return (
      <div className="h-[500px] md:h-[640px] rounded-2xl border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={14}
        minZoom={1}
        maxZoom={18}
        scrollWheelZoom
        touchZoom
        zoomControl={false}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        className="w-full h-[500px] md:h-[640px]"
        attributionControl={false}
      >
        <TileLayer
          url={satellite ? SAT_TILE : NORMAL_TILE}
          className={satellite ? "sat-tiles" : "dark-tiles"}
          maxZoom={satellite ? 19 : 19}
        />

        {/* current user */}
        <CircleMarker
          center={center}
          radius={9}
          pathOptions={{ color: "#ccff00", fillColor: "#ccff00", fillOpacity: 0.9, weight: 2 }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>{t("home.you")}</Tooltip>
        </CircleMarker>

        {/* users */}
        {filtered.map((u) => {
          const live = liveByUser[u.id];
          const online = isOnline(u.id);
          const isTraining = !!live;
          const color = isTraining ? "#ef4444" : online ? "#22c55e" : "#64748b";
          const name = u.display_name || u.email?.split("@")[0] || "user";
          return (
            <CircleMarker
              key={u.id}
              center={[u.lat, u.lng]}
              radius={isTraining ? 8 : 6}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isTraining ? 0.9 : online ? 0.8 : 0.45,
                weight: 2
              }}
              eventHandlers={{ click: () => navigate(`/profile/${u.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="text-xs">
                  <div className="font-medium">{name}</div>
                  {isTraining ? (
                    <div className="text-red-400 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {live.workout_type}
                    </div>
                  ) : online ? (
                    <div className="text-green-400 flex items-center gap-1">
                      <Radio className="w-3 h-3" /> {t("home.online")}
                    </div>
                  ) : (
                    <div className="text-slate-400">{t("home.offline")}</div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* top-right controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          onClick={flyToWorld}
          className="glass rounded-lg px-3 py-2 text-xs flex items-center gap-1.5 hover:bg-secondary transition"
        >
          <Globe className="w-4 h-4 text-primary" /> {t("home.worldView")}
        </button>
        <button
          onClick={flyToCurrent}
          className="glass rounded-lg p-2 flex items-center justify-center hover:bg-secondary transition"
          title={t("home.locateMe")}
        >
          <LocateFixed className="w-4 h-4 text-primary" />
        </button>
        <button
          onClick={() => setSatellite((v) => !v)}
          className="glass rounded-lg p-2 flex items-center justify-center hover:bg-secondary transition"
          title={satellite ? t("home.normalMap") : t("home.satellite")}
        >
          {satellite ? <MapIcon className="w-4 h-4 text-primary" /> : <Satellite className="w-4 h-4 text-primary" />}
        </button>
      </div>

      {/* filter chips */}
      <div className="absolute top-3 left-3 z-[400] flex gap-1.5 overflow-x-auto no-scrollbar max-w-[58%]">
        {FILTERS.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition ${
              filter === k
                ? "border-primary bg-primary/15 text-primary"
                : "border-border glass text-foreground/80"
            }`}
          >
            {t(`home.filter_${k}`)}
          </button>
        ))}
      </div>

      {/* legend */}
      <div className="absolute bottom-3 left-3 z-[400] glass rounded-lg px-3 py-2 text-[11px] space-y-1">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" /> {t("home.you")}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> {t("home.online")}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> {t("home.trainingLive")}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /> {t("home.offline")}</div>
      </div>
    </div>
  );
}