import React from "react";
import { Trash2, Plus, X, History, Check, Copy } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function ExerciseCard({ exercise, index, prev, onUpdateSet, onAddSet, onRemoveSet, onRemoveExercise, onCompleteSet, onCopyPrev }) {
  const t = useT();
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
        <div className="flex items-center gap-2 mb-2">
          <div className="text-[10px] text-accent flex items-center gap-1">
            <History className="w-3 h-3" /> {t("ex.prevRecord")} {prevW}{t("common.kg")} × {prevR}{t("common.reps")}
          </div>
          <button onClick={() => onCopyPrev(index, prevW, prevR)} className="text-[10px] text-primary flex items-center gap-0.5 hover:underline">
            <Copy className="w-2.5 h-2.5" /> {t("ex.apply")}
          </button>
        </div>
      )}
      <div className="space-y-1.5">
        {exercise.sets.map((set, si) => (
          <div key={si} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground w-5 shrink-0">{si + 1}</span>
            <input type="number" inputMode="decimal" value={set.weight} onChange={e => onUpdateSet(index, si, "weight", e.target.value)} placeholder={t("common.kg")} className="w-14 bg-secondary/60 border border-border rounded px-1.5 py-1 text-sm outline-none focus:border-primary" />
            <span className="text-[10px] text-muted-foreground">{t("common.kg")}×</span>
            <input type="number" inputMode="decimal" value={set.reps} onChange={e => onUpdateSet(index, si, "reps", e.target.value)} placeholder={t("common.reps")} className="w-12 bg-secondary/60 border border-border rounded px-1.5 py-1 text-sm outline-none focus:border-primary" />
            <span className="text-[10px] text-muted-foreground">{t("common.reps")}</span>
            <button onClick={() => onCompleteSet(index, si)} className="p-1 rounded hover:bg-primary/20 text-primary shrink-0">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onRemoveSet(index, si)} className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onAddSet(index)} className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
        <Plus className="w-3 h-3" /> {t("ex.addSet")}
      </button>
    </div>
  );
}