import React from "react";
import { Users, Lock, Headphones } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function VoiceRoomCard({ room, onJoin }) {
  const t = useT();
  const full = (room.members_count || 0) >= room.capacity;
  const live = (room.members_count || 0) > 0;
  return (
    <div className="glass rounded-2xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {live && <span className="w-2 h-2 rounded-full bg-red-500 live-dot shrink-0" />}
          <h3 className="font-bold truncate">{room.name}</h3>
        </div>
        {room.is_private && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </div>
      {room.topic && <div className="text-xs text-primary">{room.topic}</div>}
      {room.description && <div className="text-sm text-muted-foreground line-clamp-2">{room.description}</div>}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className={full ? "text-destructive" : ""}>{room.members_count || 0} / {room.capacity}</span>
        </div>
        <button
          onClick={() => onJoin(room)}
          disabled={full}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          <Headphones className="w-4 h-4" /> {full ? t("voice.full") : t("voice.join")}
        </button>
      </div>
    </div>
  );
}