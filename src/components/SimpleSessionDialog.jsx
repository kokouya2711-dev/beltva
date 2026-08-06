import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Clock, Check, Loader2 } from "lucide-react";
import { useTraining } from "@/lib/trainingContext";
import { useT } from "@/lib/i18n";

export default function SimpleSessionDialog({ onClose }) {
  const t = useT();
  const training = useTraining();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function finish() {
    setSubmitting(true);
    await base44.entities.WorkoutRecord.create({
      workout_type: t("goLive.simpleRecord"),
      sets: 1, reps: 0, weight: 0,
      duration_sec: training.elapsedSec, volume: 0, notes: ""
    }).catch(() => {});
    setSubmitting(false);
    setDone(true);
    training.stopTraining();
    setTimeout(() => onClose(), 1000);
  }

  const mm = String(Math.floor(training.elapsedSec / 60)).padStart(2, "0");
  const ss = String(training.elapsedSec % 60).padStart(2, "0");

  if (done) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <div className="font-semibold text-lg">{t("workout.recorded")}</div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-lg">⚡ {t("goLive.simpleRecord")}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" /> {t("activity.trainingTime")}
        </div>
        <div className="text-6xl font-bold tabular-nums tracking-tight">{mm}:{ss}</div>
        <div className="text-xs text-muted-foreground text-center max-w-xs">{t("goLive.simpleNote")}</div>
      </div>
      <button onClick={finish} disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-60 shadow-lg shadow-primary/20">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {t("workout.complete")}
      </button>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}