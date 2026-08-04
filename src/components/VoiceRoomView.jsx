import React from "react";
import { X, Mic, MicOff, PhoneOff, Users, Loader2, AlertTriangle, Headphones } from "lucide-react";
import { useVoiceRoom } from "@/hooks/useVoiceRoom";

export default function VoiceRoomView({ room, me, onLeave }) {
  const { members, muted, micError, joined, toggleMute } = useVoiceRoom(room.id, me);

  const all = [
    { me: true, name: "あなた", muted },
    ...members.map((m) => ({
      me: false,
      name: m.created_by?.full_name || m.created_by?.email?.split("@")[0] || "ゲスト",
      muted: m.is_muted
    }))
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate">{room.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> {members.length + 1} / {room.capacity}
              {room.topic && <span className="ml-2 truncate">· {room.topic}</span>}
            </div>
          </div>
        </div>
        <button onClick={onLeave} className="p-2 rounded-lg hover:bg-secondary shrink-0">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        {micError && (
          <div className="mb-4 flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{micError}</span>
          </div>
        )}
        {!joined && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <Loader2 className="w-4 h-4 animate-spin" /> ルームに接続中…
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {all.map((p, i) => (
            <div key={i} className="glass rounded-2xl border border-border p-4 flex flex-col items-center gap-2">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${p.me ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-sm font-medium truncate max-w-full">{p.name}</div>
              <div className={`flex items-center gap-1 text-xs ${p.muted ? "text-muted-foreground" : "text-accent"}`}>
                {p.muted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                {p.muted ? "ミュート" : "発言中"}
              </div>
            </div>
          ))}
        </div>
        {room.description && (
          <div className="mt-6 text-sm text-muted-foreground">{room.description}</div>
        )}
      </div>

      <footer className="px-5 py-4 border-t border-border flex items-center justify-center gap-3">
        <button
          onClick={toggleMute}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${muted ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"}`}
        >
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {muted ? "ミュート解除" : "ミュート"}
        </button>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-destructive text-destructive-foreground hover:opacity-90 transition"
        >
          <PhoneOff className="w-5 h-5" /> 退室
        </button>
      </footer>
    </div>
  );
}