import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { base44 } from "@/api/base44Client";
import { getGeolocation, DEFAULT_CENTER, forwardGeocodeCity } from "@/lib/workouts";
import { MAJOR_CITIES } from "@/lib/mapLabels";
import { Loader2, LocateFixed, Plus, Minus, Maximize2, X } from "lucide-react";
import { useT } from "@/lib/i18n";

const ONLINE_WINDOW = 120000;
const TRAINING_WINDOW = 300000;
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";
const MAX_ZOOM = 11;
const MIN_MARKER_ZOOM = 6;
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
  const [mapZoom, setMapZoom] = useState(11);
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
        setUsers(us.filter((u) => u.lat != null && u.city_name && u.share_city !== false));
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
        .map((u) => ({ ...u, _d: Math.hypot(u.lat - center[0], u.lng - center[1]) }))
        .sort((a, b) => a._d - b._d)
        .slice(0, 40);
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, filter, presence, followIds, center]);

  // Build city clusters from filtered users — grouped by stored city_name.
  // Forward geocode each city to place the marker at the city center,
  // aligned with the city name label on the map tiles.
  useEffect(() => {
    if (filtered.length === 0) {
      setCityClusters([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const cityMap = new Map();
      for (const u of filtered) {
        const cityName = u.city_name || "Unknown";
        if (!cityMap.has(cityName)) {
          cityMap.set(cityName, { city: cityName, lat: u.lat, lng: u.lng, users: [], count: 0 });
        }
        const c = cityMap.get(cityName);
        c.users.push(u);
        c.count += 1;
      }
      const clusters = Array.from(cityMap.values());
      const cityCenters = await Promise.all(
        clusters.map((c) => forwardGeocodeCity(c.city))
      );
      clusters.forEach((c, i) => {
        const center = cityCenters[i];
        if (center) {
          c.lat = center.lat;
          c.lng = center.lng;
        }
      });
      if (!cancelled) {
        setCityClusters(clusters);
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
        zoom={11}
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
          className="minimal-tiles"
          maxZoom={19}
          maxNativeZoom={19}
          detectRetina={true}
          subdomains="abcd"
        />

        {/* city cluster markers — consistent large size at all zoom levels */}
        {mapZoom >= MIN_MARKER_ZOOM && cityClusters.map((cluster) => {
          const count = cluster.count;
          const firstUser = cluster.users[0];
          const anyTraining = cluster.users.some((u) => isTraining(u.id));
          const color = anyTraining ? "#f97316" : "#a3e635";
          const name = firstUser?.display_name || firstUser?.email?.split("@")[0] || "user";
          const initials = (name || "?").slice(0, 2).toUpperCase();

          // Fixed size — always clearly visible regardless of zoom level
          const circleSize = 46;
          const imgSize = circleSize - 8;
          const borderW = 3;
          const fontSize = 14;
          const badgeSize = 22;
          const badgeFontSize = 12;
          const triW = Math.round(circleSize * 0.35);
          const triH = Math.round(circleSize * 0.3);
          const iconW = circleSize;
          const iconH = circleSize + triH;
          const anchorY = iconH;

          const inner = firstUser?.avatar_url
            ? `<img src="${firstUser.avatar_url}" style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;object-fit:cover;display:block;" />`
            : `<div style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;background:hsl(240 5% 20%);display:flex;align-items:center;justify-content:center;color:hsl(0 0% 70%);font-size:${fontSize}px;font-weight:700;">${initials}</div>`;
          const iconHtml = `
            <div style="position:relative;width:${iconW}px;display:flex;flex-direction:column;align-items:center;">
              <div style="position:relative;width:${circleSize}px;height:${circleSize}px;">
                <div style="width:${circleSize}px;height:${circleSize}px;border-radius:50%;border:${borderW}px solid ${color};box-shadow:0 0 8px ${color}aa,0 2px 4px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;overflow:hidden;background:hsl(240 6% 12%);">${inner}</div>
                <div style="position:absolute;top:-${Math.round(badgeSize * 0.25)}px;right:-${Math.round(badgeSize * 0.3)}px;background:white;color:black;font-size:${badgeFontSize}px;font-weight:bold;border-radius:${badgeSize / 2}px;padding:0 ${Math.round(badgeSize * 0.2)}px;min-width:${badgeSize}px;height:${badgeSize}px;display:flex;align-items:center;justify-content:center;border:1px solid #d4d4d4;box-shadow:0 1px 3px rgba(0,0,0,0.4);line-height:1;">${count}</div>
              </div>
              <div style="width:0;height:0;border-left:${triW}px solid transparent;border-right:${triW}px solid transparent;border-top:${triH}px solid ${color};margin-top:-1px;"></div>
            </div>`;

          const icon = L.divIcon({
            className: "city-marker",
            html: iconHtml,
            iconSize: [iconW, iconH],
            iconAnchor: [iconW / 2, anchorY],
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
                offset={[0, -iconH - 6]}
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

        {/* major city labels — prefecture capitals and major cities only */}
        {mapZoom >= 4 && MAJOR_CITIES.map((city) => {
          const fontSize = Math.max(10, Math.min(14, 8 + mapZoom * 0.5));
          const labelIcon = L.divIcon({
            className: "city-label-marker",
            html: `<span style="font-size:${fontSize}px">${city.name}</span>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          return (
            <Marker
              key={`label-${city.name}`}
              position={[city.lat, city.lng]}
              icon={labelIcon}
              interactive={false}
              zIndexOffset={-1000}
            />
          );
        })}
      </MapContainer>

      {/* bottom-right controls */}
      <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-3">
        {fullscreen ? (
          <button
            onClick={() => setFullscreen(false)}
            className="bg-card/95 border border-border shadow-lg rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
            title={t("common.close")}
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        ) : (
          <button
            onClick={() => setFullscreen(true)}
            className="bg-card/95 border border-border shadow-lg rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
            title={t("home.expandMap")}
          >
            <Maximize2 className="w-5 h-5 text-primary" />
          </button>
        )}
        <button
          onClick={zoomIn}
          className="bg-card/95 border border-border shadow-lg rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
          title={t("home.zoomIn")}
        >
          <Plus className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={zoomOut}
          className="bg-card/95 border border-border shadow-lg rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
          title={t("home.zoomOut")}
        >
          <Minus className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={flyToCurrent}
          className="bg-card/95 border border-border shadow-lg rounded-lg p-2.5 flex items-center justify-center hover:bg-secondary transition"
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
                : "border-border bg-card/80 text-foreground/80"
            }`}
          >
            {t(`home.filter_${k}`)}
          </button>
        ))}
      </div>

    </div>
  );
}