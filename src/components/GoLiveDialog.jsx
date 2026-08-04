import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Radio, MapPin, Loader2, Check } from "lucide-react";
import { WORKOUT_TYPES, getGeolocation, DEFAULT_CENTER } from "@/lib/workouts";

export default function GoLiveDialog({ onClose }) {
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [locationName, setLocationName] = useState("");
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function detectLocation() {
    setLocating(true);
    const c = await getGeolocation();
    setLocating(false);
    setCoords(c || DEFAULT_CENTER);
    if (!c) setLocationName((v) => v || "東京");
  }

  async function startLive() {
    setSubmitting(true);
    const now = new Date().toISOString();
    const c = coords || DEFAULT_CENTER;
    await base44.entities.LiveSession.create({
      status: "live",
      workout_type: workoutType,
      location_name: locationName || "秘密のジム",
      lat: c.lat,
      lng: c.lng,
      viewers_count: 0,
      hype_count: 0,
      started_at: now,
      message
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => onClose(), 900);
  }

  if (done) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <div className="font-semibold text-lg">ライブ配信を開始しました！</div>
          <div className="text-sm text-muted-foreground">みんなが応募に来るのを待とう🔥</div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Radio className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="font-bold text-lg">ライブ配信を開始</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">種目</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {WORKOUT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setWorkoutType(t)}
                className={`text-sm px-3 py-2 rounded-lg border transition ${
                  workoutType === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">場所</label>
          <div className="flex gap-2 mt-1.5">
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="ジム名・エリア"
              className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={detectLocation}
              disabled={locating}
              className="flex items-center gap-1.5 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm hover:border-primary"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              現在地
            </button>
          </div>
          {coords && (
            <div className="text-[11px] text-accent mt-1">📍 位置を取得しました ({coords.lat.toFixed(3)}, {coords.lng.toFixed(3)})</div>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">実況メッセージ</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="今日はベンチPR狙う！🔥"
            className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary mt-1.5"
          />
        </div>

        <button
          onClick={startLive}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
          配信開始
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}