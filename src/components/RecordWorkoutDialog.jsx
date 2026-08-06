import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Check, Plus } from "lucide-react";
import { WORKOUT_TYPES, computeVolume } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function RecordWorkoutDialog({ onClose, onSaved }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(60);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const volume = computeVolume({ sets, reps, weight });

  async function save() {
    setSubmitting(true);
    await base44.entities.WorkoutRecord.create({
      workout_type: workoutType,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
      duration_sec: Number(duration),
      volume,
      notes
    });
    setSubmitting(false);
    setDone(true);
    if (onSaved) setTimeout(() => onSaved(), 600);
  }

  if (done) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <div className="font-semibold text-lg">{t("workout.recorded")}</div>
          <div className="text-sm text-muted-foreground">{t("workout.volumeRecorded").replace("{n}", volume.toLocaleString())}</div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="font-bold text-lg">{t("workout.recordTitle")}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("goLive.workoutType")}</label>
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary"
          >
            {WORKOUT_TYPES.map((w) => (
              <option key={w} value={w}>{tWorkout(w)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label={t("goLive.sets")} value={sets} onChange={setSets} />
          <Field label={t("goLive.reps")} value={reps} onChange={setReps} />
          <Field label={t("goLive.weight")} value={weight} onChange={setWeight} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("goLive.duration")}</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("goLive.notes")}</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("goLive.notesPlaceholder")}
            className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <span className="text-sm text-muted-foreground">{t("goLive.totalVolume")}</span>
          <span className="font-bold text-xl text-primary">{volume.toLocaleString()} {t("common.kg")}</span>
        </div>

        <button
          onClick={save}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {t("workout.recordBtn")}
        </button>
      </div>
    </Overlay>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary"
      />
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}