import React, { useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { WORKOUT_TYPES } from "@/lib/workouts";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function ExerciseSearch({ onSelect, onClose, exclude = [] }) {
  const tWorkout = useTWorkout();
  const [q, setQ] = useState("");
  const filtered = WORKOUT_TYPES.filter(w => !exclude.includes(w) && tWorkout(w).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">種目を検索</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="種目名" className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" autoFocus />
        </div>
        <div className="space-y-1">
          {filtered.map(w => (
            <button key={w} onClick={() => onSelect(w)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary text-sm">
              {tWorkout(w)} <Plus className="w-4 h-4 text-primary" />
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-4">該当する種目がありません</div>}
        </div>
      </div>
    </div>
  );
}