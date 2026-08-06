import React, { useState, useEffect } from "react";
import { Search, X, Plus, UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { EXERCISES_BY_BODY_PART, BODY_PARTS } from "@/lib/exercises";

export default function ExerciseSearch({ onSelect, onClose, exclude = [] }) {
  const [q, setQ] = useState("");
  const [bodyPart, setBodyPart] = useState(BODY_PARTS[0]);
  const [customExercises, setCustomExercises] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPart, setNewPart] = useState(BODY_PARTS[0]);

  useEffect(() => {
    base44.entities.CustomExercise.list("-created_date", 200).then(setCustomExercises).catch(() => {});
  }, []);

  const allInPart = [...new Set([
    ...(EXERCISES_BY_BODY_PART[bodyPart] || []),
    ...customExercises.filter(e => e.body_part === bodyPart).map(e => e.name),
  ])];
  const allExercises = [...new Set([...Object.values(EXERCISES_BY_BODY_PART).flat(), ...customExercises.map(e => e.name)])];
  const filtered = q
    ? allExercises.filter(w => !exclude.includes(w) && w.toLowerCase().includes(q.toLowerCase()))
    : allInPart.filter(w => !exclude.includes(w));

  async function addCustom() {
    if (!newName.trim()) return;
    const rec = await base44.entities.CustomExercise.create({ name: newName.trim(), body_part: newPart }).catch(() => null);
    if (rec) {
      setCustomExercises(prev => [rec, ...prev]);
      setBodyPart(newPart);
    }
    setNewName("");
    setShowAdd(false);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">種目を検索</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="種目名で検索" className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" autoFocus />
        </div>
        {!q && (
          <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
            {BODY_PARTS.map(bp => (
              <button key={bp} onClick={() => setBodyPart(bp)} className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${bodyPart === bp ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>{bp}</button>
            ))}
          </div>
        )}
        <div className="space-y-1 mb-3">
          {filtered.map(w => (
            <button key={w} onClick={() => onSelect(w)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary text-sm">
              {w} <Plus className="w-4 h-4 text-primary" />
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-4">該当する種目がありません</div>}
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="w-full flex items-center justify-center gap-1.5 text-sm text-primary border border-dashed border-primary/30 rounded-lg py-2.5 hover:bg-primary/5">
          <UserPlus className="w-4 h-4" /> 独自の種目を追加
        </button>
        {showAdd && (
          <div className="mt-2 p-3 rounded-lg border border-border space-y-2">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="種目名" className="w-full bg-secondary/60 border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
            <select value={newPart} onChange={e => setNewPart(e.target.value)} className="w-full bg-secondary/60 border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary">
              {BODY_PARTS.map(bp => <option key={bp} value={bp}>{bp}</option>)}
            </select>
            <button onClick={addCustom} className="w-full bg-primary text-primary-foreground text-sm font-semibold py-2 rounded-lg">追加</button>
          </div>
        )}
      </div>
    </div>
  );
}