import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Headphones, Plus, Loader2 } from "lucide-react";
import { WORKOUT_TYPES } from "@/lib/workouts";

export default function CreateVoiceRoomDialog({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function create() {
    setSubmitting(true);
    await base44.entities.VoiceRoom.create({
      name: name.trim() || "もくもくボイス",
      topic: topic.trim() || undefined,
      capacity: Number(capacity) || 8,
      status: "open",
      members_count: 0,
      is_private: false,
      description: description.trim() || undefined
    });
    setSubmitting(false);
    if (onCreated) onCreated();
    onClose();
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Headphones className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="font-bold text-lg">ボイスルームを作成</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">ルーム名</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ベンチ仲間の雑談部屋" className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">トピック</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary">
              <option value="">フリー</option>
              {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">定員</label>
            <input type="number" min={2} max={20} value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">説明</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="初心者歓迎・質問OKなど" className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
        </div>
        <button onClick={create} disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} ルームを作成
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}