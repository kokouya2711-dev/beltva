import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Headphones, Plus, Loader2 } from "lucide-react";
import { WORKOUT_TYPES } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function CreateVoiceRoomDialog({ onClose, onCreated }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function create() {
    setSubmitting(true);
    await base44.entities.VoiceRoom.create({
      name: name.trim() || t("voice.defaultName"),
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
          <h2 className="font-bold text-lg">{t("voice.createTitle")}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("voice.roomName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("voice.roomNamePlaceholder")} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("voice.topic")}</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary">
              <option value="">{t("voice.free")}</option>
              {WORKOUT_TYPES.map((w) => <option key={w} value={w}>{tWorkout(w)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("voice.capacity")}</label>
            <input type="number" min={2} max={20} value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("voice.description")}</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("voice.descriptionPlaceholder")} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
        </div>
        <button onClick={create} disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {t("voice.createButton")}
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