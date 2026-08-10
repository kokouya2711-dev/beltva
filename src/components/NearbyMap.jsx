import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { base44 } from "@/api/base44Client";
import { getGeolocation, DEFAULT_CENTER } from "@/lib/workouts";
import { Loader2, LocateFixed, Plus, Minus, Maximize2, X } from "lucide-react";
import { useT } from "@/lib/i18n";

const ONLINE_WINDOW = 120000;
const TRAINING_WINDOW = 300000;
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const MAX_ZOOM = 14;
// Snap user positions to a city/region-level grid for privacy.
// 0.1° ≈ 11km — groups users in the same city to one representative point.
const GRID_SIZE = 0.1;
function snapToGrid(lat, lng) {
  return [
    Math.floor(lat / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2,
    Math.floor(lng / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2,
  ];
}

// Reverse geocoding cache (module-level, persists across renders)
const geocodeCache = new Map();

async function reverseGeocode(lat, lng) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key);
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ja`
    );
    const data = await res.json();
    const name = data.city || data.locality || data.principalSubdivision || "";
    geocodeCache.set(key, name);
    return name;
  } catch {
    geocodeCache.set(key, "");
    return "";
  }
}

const FILTERS = ["all", "online", "training", "following", "nearby"];

// Child component that uses useMap() to reliably access the map instance.
function MapController({ onZoomChange }) {
  const map = useMap();
  React.useEffect(() => {
    map.setMaxZoom(MAX_ZOOM);
    const handleZoomEnd = () => {
      const z = map.getZoom();
      if (z > MAX_ZOOM) map.setZoom(MAX_ZOOM);
      onZoomChange(z);
    };
    map.on("zoomend", handleZoomEnd);
    onZoomChange(map.getZoom());
    // Prevent iOS Safari native pinch-to-zoom on the map container
    const container = map.getContainer();
    const preventGesture = (e) => e.preventDefault();
    container.addEventListener("gesturestart", preventGesture);
    container.addEventListener("gesturechange", preventGesture);
    return () => {
      map.off("zoomend", handleZoomEnd);
      container.removeEventListener("gesturestart", preventGesture);
      container.removeEventListener("gesturechange", preventGesture);
    };
  }, [map, onZoomChange]);
  return null;
}

export default function NearbyMap() {
  const t = useT();
  const mapRef = useRef(null);
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});
  const [followIds, setFollowIds] = useState(new Set());
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [mapZoom, setMapZoom] = useState(13);
  const [cityClusters, setCityClusters] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [meUser, us, pres, follows] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.User.list("-created_date", 100),
          base44.entities.Presence.list("-last_seen", 100).catch(() => []),
          base44.entities.Follow.list("-created_date", 200).catch(() => [])
        ]);
        setMe(meUser);
        setUsers(us.filter((u) => u.lat != null && u.share_location !== false));
        const pm = {};
        pres.forEach((p) => { pm[p.created_by_id] = { last_seen: p.last_seen, is_training: p.is_training }; });
        setPresence(pm);
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

  const isOnline = (uid) => {
    const u = users.find((x) => x.id === uid);
    if (!u || u.show_online_status === false) return false;
    return !!(presence[uid]?.last_seen && Date.now() - new Date(presence[uid].last_seen).getTime() < ONLINE_WINDOW);
  };
  const isTraining = (uid) => !!presence[uid]?.is_training;

  const filtered = useMemo(() => {
    let arr = users.filter((u) => isOnline(u.id) || isTraining(u.id));
    if (filter === "online") arr = arr.filter((u) => isOnline(u.id) && !isTraining(u.id));
    else if (filter === "training") arr = arr.filter((u) => isTraining(u.id));
    else if (filter === "following") arr = arr.filter((u) => followIds.has(u.id));
    else if (filter === "nearby") {
      if (!center) return [];
      arr = [...arr]
        .map((u) => {
          const [slat, slng] = snapToGrid(u.lat, u.lng);
          return { ...u, _d: Math.hypot(slat - center[0], slng - center[1]) };
        })
        .sort((a, b) => a._d - b._d)
        .slice(0, 40);
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, filter, presence, followIds, center]);

  // Build city clusters from filtered users via reverse geocoding
  useEffect(() => {
    if (filtered.length === 0) {
      setCityClusters([]);
      return;
    }
    let cancelled = false;
    (async () => {
      // Group by grid cell
      const gridMap = new Map();
      for (const u of filtered) {
        const [slat, slng] = snapToGrid(u.lat, u.lng);
        const key = `${slat.toFixed(3)},${slng.toFixed(3)}`;
        if (!gridMap.has(key)) gridMap.set(key, { lat: slat, lng: slng, users: [] });
        gridMap.get(key).users.push(u);
      }
      // Reverse geocode each unique grid cell
      const gridEntries = Array.from(gridMap.values());
      const cityNames = await Promise.all(
        gridEntries.map((g) => reverseGeocode(g.lat, g.lng))
      );
      // Group by city name — merge grid cells in the same city
      const cityMap = new Map();
      gridEntries.forEach((g, i) => {
        const cityName = cityNames[i] || `${g.lat.toFixed(1)}, ${g.lng.toFixed(1)}`;
        if (!cityMap.has(cityName)) {
          cityMap.set(cityName, { city: cityName, lat: g.lat, lng: g.lng, users: [], count: 0, maxCellCount: 0 });
        }
        const c = cityMap.get(cityName);
        c.users.push(...g.users);
        c.count += g.users.length;
        // Use the most populated grid cell's position as the marker position
        if (g.users.length > c.maxCellCount) {
          c.maxCellCount = g.users.length;
          c.lat = g.lat;
          c.lng = g.lng;
        }
      });
      if (!cancelled) {
        setCityClusters(Array.from(cityMap.values()));
      }
    })();
    return () => { cancelled = true; };
  }, [filtered]);

  function flyToCurrent() {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo(center, MAX_ZOOM, { duration: 0.8 });
  }
  function zoomIn() {
    if (mapRef.current) mapRef.current.zoomIn(1);
  }
  function zoomOut() {
    if (mapRef.current) mapRef.current.zoomOut(1);
  }

  if (loading || !center) {
    return (
      <div className="h-[58svh] max-h-[calc(100svh-160px)] md:h-[640px] md:max-h-[calc(100svh-200px)] rounded-2xl border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const containerClass = fullscreen
    ? "fixed inset-0 z-[1000] bg-background"
    : "relative z-0 rounded-2xl overflow-hidden border border-border h-[58svh] max-h-[calc(100svh-160px)] md:h-[640px] md:max-h-[calc(100svh-200px)]";

  return (
    <div className={containerClass} style={{ touchAction: "none" }}>
      <MapContainer
        key={fullscreen ? "fs" : "home"}
        ref={mapRef}
        center={center}
        zoom={13}
        minZoom={1}
        maxZoom={MAX_ZOOM}
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
        <MapController onZoomChange={setMapZoom} />
        <TileLayer
          url={TILE_URL}
          className="voyager-tiles"
          maxZoom={MAX_ZOOM}
          maxNativeZoom={19}
          detectRetina={true}
        />

        {/* city cluster markers — one per city with count badge */}
        {cityClusters.map((cluster) => {
          const isDot = mapZoom <= 7;
          const count = cluster.count;
          const firstUser = cluster.users[0];
          const anyTraining = cluster.users.some((u) => isTraining(u.id));
          const color = anyTraining ? "#f97316" : "#a3e635";
          const name = firstUser?.display_name || firstUser?.email?.split("@")[0] || "user";
          const initials = (name || "?").slice(0, 2).toUpperCase();

          let iconHtml, size, badgeSize;
          if (isDot) {
            size = 6;
            badgeSize = 10;
            iconHtml = `
              <div style="position:relative;width:${size}px;height:${size}px;">
                <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:1px solid rgba(0,0,0,0.3);"></div>
                <div style="position:absolute;top:-3px;right:-5px;background:white;color:black;font-size:7px;font-weight:bold;border-radius:5px;padding:0 2px;min-width:${badgeSize - 2}px;height:${badgeSize - 2}px;display:flex;align-items:center;justify-content:center;border:1px solid #ccc;line-height:1;">${count}</div>
              </div>`;
          } else {
            const zoomScale = Math.min(1, 0.6 + 0.4 * (mapZoom - 8) / 6);
            size = Math.round(44 * zoomScale);
            const imgSize = Math.max(8, size - Math.round(6 * zoomScale));
            const borderW = Math.max(1.5, 2.5 * zoomScale).toFixed(1);
            const fontSize = Math.max(8, Math.round(12 * zoomScale));
            badgeSize = Math.max(16, Math.round(20 * zoomScale));
            const badgeFontSize = Math.max(9, Math.round(11 * zoomScale));
            const inner = firstUser?.avatar_url
              ? `<img src="${firstUser.avatar_url}" style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;object-fit:cover;display:block;" />`
              : `<div style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;background:hsl(240 5% 20%);display:flex;align-items:center;justify-content:center;color:hsl(0 0% 70%);font-size:${fontSize}px;font-weight:700;">${initials}</div>`;
            iconHtml = `
              <div style="position:relative;width:${size}px;height:${size}px;">
                <div style="width:${size}px;height:${size}px;border-radius:50%;border:${borderW}px solid ${color};box-shadow:0 0 6px ${color}aa,0 1px 3px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;background:hsl(240 6% 12%);">${inner}</div>
                <div style="position:absolute;top:-${Math.round(badgeSize * 0.25)}px;right:-${Math.round(badgeSize * 0.3)}px;background:white;color:black;font-size:${badgeFontSize}px;font-weight:bold;border-radius:${badgeSize / 2}px;padding:0 ${Math.round(badgeSize * 0.2)}px;min-width:${badgeSize}px;height:${badgeSize}px;display:flex;align-items:center;justify-content:center;border:1px solid #d4d4d4;box-shadow:0 1px 2px rgba(0,0,0,0.3);line-height:1;">${count}</div>
              </div>`;
          }

          const icon = L.divIcon({
            className: "city-marker",
            html: iconHtml,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          return (
            <Marker
              key={cluster.city}
              position={[cluster.lat, cluster.lng]}
              icon={icon}
            >
              <Popup
                closeButton={false}
                autoPan={false}
                className="mini-profile-popup"
                offset={[0, -size / 2 - 6]}
              >
                <div style={{ padding: "4px 10px", textAlign: "center", minWidth: "80px" }}>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>{cluster.city}</div>
                  <div style={{ fontSize: "11px", color: "hsl(240 5% 60%)", marginTop: "2px" }}>
                    {count}人
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* bottom-right controls */}
      <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-3">
        {fullscreen ? (
          <button
            onClick={() => setFullscreen(false)}
            className="glass rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
            title={t("common.close")}
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        ) : (
          <button
            onClick={() => setFullscreen(true)}
            className="glass rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
            title={t("home.expandMap")}
          >
            <Maximize2 className="w-5 h-5 text-primary" />
          </button>
        )}
        <button
          onClick={zoomIn}
          className="glass rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
          title={t("home.zoomIn")}
        >
          <Plus className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={zoomOut}
          className="glass rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
          title={t("home.zoomOut")}
        >
          <Minus className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={flyToCurrent}
          className="glass rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
          title={t("home.locateMe")}
        >
          <LocateFixed className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* filter chips */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] flex gap-1 overflow-x-auto no-scrollbar">
        {FILTERS.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 text-[13px] font-semibold px-3 py-1.5 rounded-full border transition ${
              filter === k
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border glass text-foreground/80"
            }`}
          >
            {t(`home.filter_${k}`)}
          </button>
        ))}
      </div>

    </div>
  );
}