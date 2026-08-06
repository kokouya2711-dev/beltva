import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Radio, Loader2, Check, Zap, ArrowLeft, ClipboardList } from "lucide-react";
import { WORKOUT_TYPES, getGeolocation, DEFAULT_CENTER, fuzzCoords } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";

function toLocalDateTimeString(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function GoLiveDialog({ onClose, onDetailedSelect }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const [step, setStep] = useState("choice");
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(toLocalDateTimeString(new Date()));
  const [endTime, setEndTime] = useState(toLocalDateTimeString(new Date(Date.now() + 3600000)));

  useEffect(() => {
    (async () => {
      const c = await getGeolocation();
      setCoords(c ? fuzzCoords(c.lat, c.lng) : fuzzCoords(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
    })();
  }, []);

  async function startLive() {
    setSubmitting(true);
    const nowIso = new Date().toISOString();
    const c = coords || fuzzCoords(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    await base44.entities.LiveSession.create({
      status: "live", workout_type: workoutType,
      location_name: t("goLive.defaultGym"),
      lat: c.lat, lng: c.lng, viewers_count: 0, hype_count: 0,
      started_at: nowIso, message: ""
    });
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durSec = Math.max(0, Math.floor((end - start) / 1000));
    await base44.entities.WorkoutRecord.create({
      workout_type: workoutType, sets: 1, reps: 0, weight: 0,
      duration_sec: durSec, volume: 0, notes: ""
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => onClose(), 900);
  }

  if (done) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-7 h-7 text-primary" /></div>
          <div className="font-semibold text-lg">{t("goLive.started")}</div>
          <div className="text-sm text-muted-foreground">{t("goLive.startedDesc")}</div>
        </div>
      </Overlay>
    );
  }

  if (step === "choice") {
    return (
      <Overlay onClose={onClose}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Radio className="w-4 h-4 text-primary-foreground" /></div>
            <h2 className="font-bold text-lg">{t("goLive.recordChoiceTitle")}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t("goLive.recordChoiceDesc")}</p>
        <div className="space-y-3">
          <button onClick={() => onDetailedSelect ? onDetailedSelect() : setStep("form")} className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-left">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0"><ClipboardList className="w-5 h-5 text-primary" /></div>
            <div><div className="font-semibold text-sm">📝 {t("goLive.detailedRecord")}</div><div className="text-xs text-muted-foreground mt-0.5">{t("goLive.detailedRecordDesc")}</div></div>
          </button>
          <button onClick={() => setStep("form")} className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-left">
            <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0"><Zap className="w-5 h-5 text-accent" /></div>
            <div><div className="font-semibold text-sm">⚡ {t("goLive.simpleRecord")}</div><div className="text-xs text-muted-foreground mt-0.5">{t("goLive.simpleRecordDesc")}</div></div>
          </button>
        </div>
      </Overlay>
    );
  }

  // simple form
  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setStep("choice")} className="p-1.5 rounded-lg hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
          <h2 className="font-bold text-lg">⚡ {t("goLive.simpleRecord")}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("goLive.workoutType")}</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {WORKOUT_TYPES.map((w) => (
              <button key={w} onClick={() => setWorkoutType(w)} className={`text-sm px-3 py-2 rounded-lg border transition ${workoutType === w ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{tWorkout(w)}</button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("goLive.startTime")}</label>
            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("goLive.endTime")}</label>
            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2">
            <Zap className="w-3.5 h-3.5 text-accent" /> {t("goLive.simpleNote")}
          </div>
        </div>
        <button onClick={startLive} disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />} {t("goLive.start")}
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}