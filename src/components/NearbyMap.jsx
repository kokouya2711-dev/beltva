import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { base44 } from "@/api/base44Client";
import { getGeolocation, DEFAULT_CENTER } from "@/lib/workouts";
import { useNavigate } from "react-router-dom";
import { Loader2, Globe, LocateFixed, Satellite, Map as MapIcon, Radio, Flame, Info } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";

const ONLINE_WINDOW = 120000;
const TRAINING_WINDOW = 300000; // 5 min — training users may not touch phone between sets
const NORMAL_TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
// Esri World Imagery — high quality worldwide satellite imagery
const SAT_TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const FILTERS = ["all", "online", "training", "following", "nearby"];

// Child component that uses useMap() to reliably access the map instance.
// Permanently overrides _animateZoom so the zoom parameter is clamped to
// maxZoom on EVERY call — including intermediate pinch-zoom frames.
// This prevents the temporary visual over-zoom during pinch gestures.
function MapZoomLimiter() {
  const map = useMap();
  React.useEffect(() => {
    const MAX = 13;
    map.setMaxZoom(MAX);
    map.on("zoomend", () => {
      if (map.getZoom() > MAX) map.setZoom(MAX);
    });
    // Prevent iOS Safari native pinch-to-zoom on the map container
    const container = map.getContainer();
    const preventGesture = (e) => e.preventDefault();
    container.addEventListener("gesturestart", preventGesture);
    container.addEventListener("gesturechange", preventGesture);
    return () => {
      container.removeEventListener("gesturestart", preventGesture);
      container.removeEventListener("gesturechange", preventGesture);
    };
  }, [map]);
  return null;
}

export default function NearbyMap() {
  const t = useT();
  const tWorkout = useTWorkout();
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
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [meUser, us, pres, live, follows] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.User.list("-created_date", 100),
          base44.entities.Presence.list("-last_seen", 100).catch(() => []),
          base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 100),
          base44.entities.Follow.list("-created_date", 200).catch(() => [])
        ]);
        setMe(meUser);
        setUsers(us.filter((u) => u.lat != null && u.share_location !== false));
        const pm = {};
        pres.forEach((p) => { pm[p.created_by_id] = { last_seen: p.last_seen, is_training: p.is_training }; });
        setPresence(pm);
        setSessions(live.filter((s) => s.lat != null));
        setFollowIds(new Set(follows.filter((f) => f.follower_id === meUser?.id).map((f) => f.followee_id)));

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

  useEffect(() => {
    let timeout;
    const unsubscribe = base44.entities.Presence.subscribe(() => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const pres = await base44.entities.Presence.list("-last_seen", 100).catch(() => []);
        const pm = {};
        pres.forEach((p) => { pm[p.created_by_id] = { last_seen: p.last_seen, is_training: p.is_training }; });
        setPresence(pm);
      }, 300);
    });
    return () => { clearTimeout(timeout); if (unsubscribe) unsubscribe(); };
  }, []);

  // Enforce maxZoom on the map instance — belt-and-suspenders to ensure
  // no zoom method (wheel, pinch, double-click) can exceed zoom 14 (~2-3km)
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMaxZoom(13);
    }
  }, [center]);

  const liveByUser = useMemo(() => {
    const m = {};
    sessions.forEach((s) => { if (s.created_by_id) m[s.created_by_id] = s; });
    return m;
  }, [sessions]);

  const isOnline = (uid) => !!(presence[uid]?.last_seen && Date.now() - new Date(presence[uid].last_seen).getTime() < ONLINE_WINDOW);
  const isTraining = (uid) => !!(presence[uid]?.is_training && presence[uid]?.last_seen && Date.now() - new Date(presence[uid].last_seen).getTime() < TRAINING_WINDOW);

  const filtered = useMemo(() => {
    // show online (green) and training (orange-red) users; offline users are excluded
    let arr = users.filter((u) => isOnline(u.id) || isTraining(u.id));
    if (filter === "online") arr = arr.filter((u) => isOnline(u.id) && !isTraining(u.id));
    else if (filter === "training") arr = arr.filter((u) => isTraining(u.id));
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
  }, [users, filter, presence, followIds, center]);

  function flyToCurrent() {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo(center, 13, { duration: 0.8 });
  }
  function flyToWorld() {
    if (!mapRef.current) return;
    mapRef.current.flyTo([20, 0], 1, { duration: 0.9 });
  }

  if (loading || !center) {
    return (
      <div className="h-[58svh] max-h-[calc(100svh-160px)] md:h-[640px] md:max-h-[calc(100svh-200px)] rounded-2xl border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative z-0 rounded-2xl overflow-hidden border border-border h-[58svh] max-h-[calc(100svh-160px)] md:h-[640px] md:max-h-[calc(100svh-200px)]" style={{ touchAction: "none" }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={13}
        minZoom={1}
        maxZoom={13}
        zoomSnap={1}
        zoomDelta={1}
        scrollWheelZoom
        touchZoom
        doubleClickZoom={false}
        bounceAtZoomLimits={false}
        zoomControl={false}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        className="w-full h-full"
        attributionControl={false}
      >
        <MapZoomLimiter />
        <TileLayer
          url={satellite ? SAT_TILE : NORMAL_TILE}
          className={satellite ? "sat-tiles" : "dark-tiles"}
          maxZoom={13}
        />

        {/* users — profile icons with colored rings; online=green, training=orange-red */}
        {filtered.map((u) => {
          const live = liveByUser[u.id];
          const training = isTraining(u.id);
          const isMe = u.id === me?.id;
          const color = training ? "#f97316" : "#22c55e";
          const size = training ? 42 : 36;
          const imgSize = size - 6;
          const name = u.display_name || u.email?.split("@")[0] || "user";
          const initials = (name || "?").slice(0, 2).toUpperCase();
          const inner = u.avatar_url
            ? `<img src="${u.avatar_url}" style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;object-fit:cover;display:block;" />`
            : `<div style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;background:hsl(240 5% 20%);display:flex;align-items:center;justify-content:center;color:hsl(0 0% 70%);font-size:12px;font-weight:700;">${initials}</div>`;
          const icon = L.divIcon({
            className: "profile-marker",
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;border:2.5px solid ${color};box-shadow:0 0 6px ${color}88,0 1px 3px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;background:hsl(240 6% 12%);">${inner}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
          return (
            <Marker
              key={u.id}
              position={[u.lat, u.lng]}
              icon={icon}
              eventHandlers={{ click: () => navigate(`/profile/${u.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -size / 2 - 4]} opacity={1}>
                <div className="text-xs">
                  <div className="font-medium">{isMe ? t("home.you") : name}</div>
                  {training ? (
                    <div className="text-orange-400 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {live ? tWorkout(live.workout_type) : t("home.trainingLive")}
                    </div>
                  ) : (
                    <div className="text-green-400 flex items-center gap-1">
                      <Radio className="w-3 h-3" /> {t("home.online")}
                    </div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* top-right controls */}
      <div className="absolute top-11 right-2 z-[400] flex flex-col gap-1.5">
        <button
          onClick={flyToWorld}
          className="glass rounded-md px-2 py-1 text-[10px] flex items-center gap-1 hover:bg-secondary transition"
        >
          <Globe className="w-3 h-3 text-primary" /> {t("home.worldView")}
        </button>
        <button
          onClick={flyToCurrent}
          className="glass rounded-md p-1.5 flex items-center justify-center hover:bg-secondary transition"
          title={t("home.locateMe")}
        >
          <LocateFixed className="w-3.5 h-3.5 text-primary" />
        </button>
        <button
          onClick={() => setSatellite((v) => !v)}
          className="glass rounded-md p-1.5 flex items-center justify-center hover:bg-secondary transition"
          title={satellite ? t("home.normalMap") : t("home.satellite")}
        >
          {satellite ? <MapIcon className="w-3.5 h-3.5 text-primary" /> : <Satellite className="w-3.5 h-3.5 text-primary" />}
        </button>
        <button
          onClick={() => setShowLegend((v) => !v)}
          className={`glass rounded-md p-1.5 flex items-center justify-center hover:bg-secondary transition ${showLegend ? "bg-primary/20" : ""}`}
          title={t("home.legend")}
        >
          <Info className="w-3.5 h-3.5 text-primary" />
        </button>
      </div>

      {/* filter chips */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] flex gap-1 overflow-x-auto no-scrollbar">
        {FILTERS.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border transition ${
              filter === k
                ? "border-primary bg-primary/15 text-primary"
                : "border-border glass text-foreground/80"
            }`}
          >
            {t(`home.filter_${k}`)}
          </button>
        ))}
      </div>

      {/* legend — toggle via info button */}
      {showLegend && (
        <div className="absolute bottom-2 left-2 z-[400] glass rounded-md px-2.5 py-1.5 text-[10px] space-y-0.5">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> {t("home.online")}</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316]" /> {t("home.trainingLive")}</div>
        </div>
      )}
    </div>
  );
}