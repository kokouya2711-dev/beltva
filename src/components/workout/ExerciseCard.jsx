import React from "react";
import { Trash2, Plus, X, History } from "lucide-react";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function ExerciseCard({ exercise, index, prev, onUpdateSet, onAddSet, onRemoveSet, onRemoveExercise }) {
  const tWorkout = useTWorkout();
  const prevW = prev?.weight || 0;
  const prevR = prev?.reps || 0;

  return (
    <div className="glass rounded-xl border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-muted-foreground shrink-0">#{index + 1}</span>
          <span className="font-semibold text-sm truncate">{tWorkout(exercise.workout_type)}</span>
        </div>
        <button onClick={() => onRemoveExercise(index)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {prevW > 0 && (
        <div className="text-[10px] text-accent mb-2 flex items-center gap-1">
          <History className="w-3 h-3" /> 前回 {prevW}kg × {prevR}回
        </div>
      )}
      <div className="space-y-1.5">
        {exercise.sets.map((set, si) => (
          <div key={si} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-5 shrink-0">{si + 1}</span>
            <input type="number" inputMode="decimal" value={set.weight} onChange={e => onUpdateSet(index, si, "weight", e.target.value)} placeholder="kg" className="w-16 bg-secondary/60 border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary" />
            <span className="text-xs text-muted-foreground">kg ×</span>
            <input type="number" inputMode="decimal" value={set.reps} onChange={e => onUpdateSet(index, si, "reps", e.target.value)} placeholder="回" className="w-14 bg-secondary/60 border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary" />
            <span className="text-xs text-muted-foreground">回</span>
            <button onClick={() => onRemoveSet(index, si)} className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onAddSet(index)} className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
        <Plus className="w-3 h-3" /> セット追加
      </button>
    </div>
  );
}