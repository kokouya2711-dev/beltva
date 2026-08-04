import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Radio, MapPin, Flame, Eye, Heart, Trophy, ArrowUp } from "lucide-react";
import { liveDuration } from "@/lib/workouts";

export default function LiveSessionCard({ session, onView, onHype, isOwner, onEnd }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (session.status !== "live") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [session.status]);

  const live = session.status === "live";

  return (
    <div className="relative glass rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition group">
      {/* top gradient banner */}
      <div className="relative h-28 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 30% 20%, hsl(75 90% 55% / 0.4), transparent 50%)" }} />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {live ? (
            <span className="flex items-center gap-1.5 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" /> トレ中
            </span>
          ) : (
            <span className="bg-secondary text-muted-foreground text-[11px] font-bold px-2 py-1 rounded-md">終了</span>
          )}
          {live && (
            <span className="bg-black/40 text-white text-[11px] font-mono px-2 py-1 rounded-md">
              {liveDuration(session.started_at)}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur text-white text-[11px] px-2 py-1 rounded-md">
          {session.workout_type}
        </div>
        <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="px-4 pt-7 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3.5 h-3.5" />
          {session.location_name || "不明な場所"}
          {session.lat && (
            <span className="text-muted-foreground/60">· {session.lat.toFixed(2)}, {session.lng.toFixed(2)}</span>
          )}
        </div>

        {session.message && (
          <p className="text-sm mb-3 line-clamp-2">{session.message}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="w-4 h-4" /> {session.viewers_count || 0}
          </span>
          <span className="flex items-center gap-1.5 text-primary">
            <Flame className="w-4 h-4" /> {session.hype_count || 0}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {live && (
            <button
              onClick={() => onHype && onHype(session)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary/15 text-primary border border-primary/30 text-sm font-semibold py-2 rounded-lg hover:bg-primary/25 transition"
            >
              <Heart className="w-4 h-4" /> 応援する
            </button>
          )}
          {isOwner && live ? (
            <button
              onClick={() => onEnd && onEnd(session)}
              className="flex-1 bg-red-500/90 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-500"
            >
              終了
            </button>
          ) : (
            <button
              onClick={() => onView && onView(session)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-secondary border border-border text-sm font-semibold py-2 rounded-lg hover:border-primary/40"
            >
              <Radio className="w-4 h-4" /> 見る
            </button>
          )}
        </div>
      </div>
    </div>
  );
}