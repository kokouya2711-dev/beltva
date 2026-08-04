import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { base44 } from "@/api/base44Client";
import { Map as MapIcon, Radio, MapPin, Locate, Flame } from "lucide-react";
import { DEFAULT_CENTER, getGeolocation } from "@/lib/workouts";

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const [sessions, setSessions] = useState([]);
  const [me, setMe] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [live, user] = await Promise.all([
          base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 200),
          base44.auth.me().catch(() => null)
        ]);
        setSessions(live);
        setMe(user);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function locateMe() {
    const c = await getGeolocation();
    if (c) setCenter(c);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">トレーナーマップ</h1>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">NEARBY</span>
        </div>
        <button
          onClick={locateMe}
          className="flex items-center gap-1.5 bg-secondary/60 border border-border px-3 py-2 rounded-lg text-sm hover:border-primary"
        >
          <Locate className="w-4 h-4" /> 現在地
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-border h-[60vh]">
        <MapContainer center={center} zoom={11} className="w-full h-full" zoomControl={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          <Recenter center={center} />
          {sessions.map((s) => (
            <CircleMarker
              key={s.id}
              center={[s.lat || DEFAULT_CENTER.lat, s.lng || DEFAULT_CENTER.lng]}
              radius={14}
              pathOptions={{ color: "#A3E635", fillColor: "#A3E635", fillOpacity: 0.5 }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {s.workout_type}
                  </div>
                  <div className="text-xs mt-1">{s.location_name || "不明"}</div>
                  <div className="text-xs mt-1">🔥 {s.hype_count || 0} · 👁 {s.viewers_count || 0}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {/* My location */}
          <CircleMarker
            center={[center.lat, center.lng]}
            radius={8}
            pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.8 }}
          >
            <Popup><div className="text-sm font-bold">📍 あなたの現在地</div></Popup>
          </CircleMarker>
        </MapContainer>

        {/* overlay count */}
        <div className="absolute top-3 right-3 z-[400] glass rounded-lg px-3 py-2 text-xs flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-red-500" />
          {sessions.length} 件 配信中
        </div>
      </div>

      {/* list under map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sessions.length === 0 && !loading && (
          <div className="col-span-full glass rounded-2xl border border-border py-12 flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="w-8 h-8 opacity-50" />
            <div className="text-sm">近くに配信中のトレーナーはいません</div>
          </div>
        )}
        {sessions.map((s) => (
          <div key={s.id} className="glass rounded-xl border border-border p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{s.workout_type} · {s.location_name || "不明"}</div>
              <div className="text-xs text-muted-foreground">🔥 {s.hype_count || 0} · 👁 {s.viewers_count || 0}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-red-500 live-dot" />
          </div>
        ))}
      </div>
    </div>
  );
}