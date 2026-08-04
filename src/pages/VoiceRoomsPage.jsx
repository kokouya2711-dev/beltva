import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import VoiceRoomCard from "@/components/VoiceRoomCard";
import CreateVoiceRoomDialog from "@/components/CreateVoiceRoomDialog";
import VoiceRoomView from "@/components/VoiceRoomView";
import { Plus, Loader2, Headphones } from "lucide-react";

export default function VoiceRoomsPage() {
  const [me, setMe] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  async function load() {
    const [u, rs] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.VoiceRoom.filter({ status: { $in: ["open", "live"] } }, "-members_count", 50)
    ]);
    setMe(u);
    setRooms(rs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsub = base44.entities.VoiceRoom.subscribe((event) => {
      if (event.type === "create") {
        setRooms((prev) => prev.some((r) => r.id === event.data.id) ? prev : [event.data, ...prev]);
      } else if (event.type === "update") {
        setRooms((prev) => prev.map((r) => (r.id === event.data.id ? event.data : r)));
      }
    });
    return unsub;
  }, []);

  function join(room) {
    if ((room.members_count || 0) >= room.capacity) return;
    setActiveRoom(room);
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Headphones className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">ボイスルーム</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> 作成
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <Headphones className="w-10 h-10 opacity-40" />
          <div className="text-sm">まだルームがありません。最初の部屋を作ろう！</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => <VoiceRoomCard key={r.id} room={r} onJoin={join} />)}
        </div>
      )}

      {showCreate && <CreateVoiceRoomDialog onClose={() => setShowCreate(false)} onCreated={load} />}
      {activeRoom && me && <VoiceRoomView room={activeRoom} me={me} onLeave={() => { setActiveRoom(null); load(); }} />}
    </div>
  );
}