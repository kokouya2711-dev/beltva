import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { base44 } from "@/api/base44Client";
import { getGeolocation, DEFAULT_CENTER } from "@/lib/workouts";
import { useNavigate } from "react-router-dom";
import { Loader2, Globe, LocateFixed, Satellite, Map as MapIcon, Flame, Info } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";
import MiniProfile from "@/components/map/MiniProfile";
import ReactionPicker from "@/components/map/ReactionPicker";
import { notify } from "@/lib/dm";
import { useToast } from "@/components/ui/use-toast";

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
function MapZoomLimiter({ onZoomChange }) {
  const map = useMap();
  React.useEffect(() => {
    const MAX = 12.5;
    map.setMaxZoom(MAX);
    map.on("zoomend", () => {
      const z = map.getZoom();
      if (z > MAX) map.setZoom(MAX);
      onZoomChange(z);
    });
    onZoomChange(map.getZoom());
    // Prevent iOS Safari native pinch-to-zoom on the map container
    const container = map.getContainer();
    const preventGesture = (e) => e.preventDefault();
    container.addEventListener("gesturestart", preventGesture);
    container.addEventListener("gesturechange", preventGesture);
    return () => {
      container.removeEventListener("gesturestart", preventGesture);
      container.removeEventListener("gesturechange", preventGesture);
    };
  }, [map, onZoomChange]);
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
  const [mapZoom, setMapZoom] = useState(13);
  const { toast } = useToast();
  const pressTimer = useRef(null);
  const longPressActiveRef = useRef(false);
  const [longPressUserId, setLongPressUserId] = useState(null);
  const [reactionTarget, setReactionTarget] = useState(null);

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
  // no zoom method (wheel, pinch, double-click) can exceed zoom 12.5 (~1.5x wider than before)
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMaxZoom(12.5);
    }
  }, [center]);

  const liveByUser = useMemo(() => {
    const m = {};
    sessions.forEach((s) => { if (s.created_by_id) m[s.created_by_id] = s; });
    return m;
  }, [sessions]);

  const isOnline = (uid) => !!(presence[uid]?.last_seen && Date.now() - new Date(presence[uid].last_seen).getTime() < ONLINE_WINDOW);
  const isTraining = (uid) => !!presence[uid]?.is_training;

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

  function startPress(u) {
    if (u.id === me?.id) return;
    longPressActiveRef.current = false;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      longPressActiveRef.current = true;
      setLongPressUserId(u.id);
      const map = mapRef.current;
      if (map) {
        const pt = map.latLngToContainerPoint([u.lat, u.lng]);
        setReactionTarget({ user: u, x: pt.x, y: pt.y });
      }
    }, 500);
  }
  function endPress() {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  }
  function handleMarkerClick() {
    if (longPressActiveRef.current) {
      longPressActiveRef.current = false;
      if (mapRef.current) mapRef.current.closePopup();
    }
  }
  async function sendReaction(emoji) {
    const target = reactionTarget;
    if (!target || !me) return;
    setReactionTarget(null);
    setLongPressUserId(null);
    if (target.user.id === me.id) return;
    notify(target.user.id, me.id, "reaction", emoji, target.user.id);
    toast({ description: `${emoji} ${t("home.reactionSent")}` });
  }
  function closeReactionPicker() {
    setReactionTarget(null);
    setLongPressUserId(null);
  }

  function flyToCurrent() {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo(center, 12.5, { duration: 0.8 });
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
        zoom={12.5}
        minZoom={1}
        maxZoom={12.5}
        zoomSnap={0.5}
        zoomDelta={0.5}
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
        <MapZoomLimiter onZoomChange={setMapZoom} />
        <TileLayer
          url={satellite ? SAT_TILE : NORMAL_TILE}
          className={satellite ? "sat-tiles" : "dark-tiles"}
          maxZoom={12.5}
        />

        {/* users — profile icons with colored rings; online=green, training=orange-red */}
        {filtered.map((u) => {
          const live = liveByUser[u.id];
          const training = isTraining(u.id);
          const isMe = u.id === me?.id;
          const color = training ? "#f97316" : "#22c55e";
          const isDot = mapZoom <= 7;
          const name = u.display_name || u.email?.split("@")[0] || "user";
          const initials = (name || "?").slice(0, 2).toUpperCase();
          let iconHtml, size;
          if (isDot) {
            size = training ? 5 : 4;
            iconHtml = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 2px ${color}aa;border:1px solid rgba(0,0,0,0.3);"></div>`;
          } else {
            const zoomScale = 0.6 + 0.4 * (mapZoom - 8) / 5;
            size = Math.round((training ? 42 : 36) * zoomScale);
            const imgSize = Math.max(8, size - Math.round(6 * zoomScale));
            const borderW = Math.max(1.5, 2.5 * zoomScale).toFixed(1);
            const fontSize = Math.max(8, Math.round(12 * zoomScale));
            const inner = u.avatar_url
              ? `<img src="${u.avatar_url}" style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;object-fit:cover;display:block;" />`
              : `<div style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;background:hsl(240 5% 20%);display:flex;align-items:center;justify-content:center;color:hsl(0 0% 70%);font-size:${fontSize}px;font-weight:700;">${initials}</div>`;
            iconHtml = `<div style="width:${size}px;height:${size}px;border-radius:50%;border:${borderW}px solid ${color};box-shadow:0 0 6px ${color}88,0 1px 3px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;background:hsl(240 6% 12%);">${inner}</div>`;
          }
          const icon = L.divIcon({
            className: "profile-marker",
            html: iconHtml,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
          const popupScale = Math.min(1, Math.max(0.45, 0.45 + (mapZoom - 1) * 0.06));
          return (
            <Marker
              key={u.id}
              position={[u.lat, u.lng]}
              icon={icon}
              eventHandlers={{
                mousedown: () => startPress(u),
                mouseup: endPress,
                mouseout: endPress,
                click: handleMarkerClick,
              }}
            >
              {longPressUserId !== u.id && (
              <Popup
                closeButton={false}
                autoPan={false}
                className="mini-profile-popup"
                offset={[0, -size / 2 - 6]}
              >
                <MiniProfile
                  user={u}
                  isMe={isMe}
                  live={live}
                  training={training}
                  onView={() => navigate(`/profile/${u.id}`)}
                  scale={popupScale}
                />
              </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {reactionTarget && (
        <ReactionPicker
          position={{ x: reactionTarget.x, y: reactionTarget.y }}
          onSelect={sendReaction}
          onClose={closeReactionPicker}
        />
      )}

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