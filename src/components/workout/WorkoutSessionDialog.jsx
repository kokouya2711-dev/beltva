import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, ArrowLeft, Plus, Clock, Timer, Loader2, Check, ClipboardList, Zap, Save, ChevronDown } from "lucide-react";
import { DEFAULT_CENTER, fuzzCoords } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";
import ExerciseCard from "./ExerciseCard";
import ExerciseSearch from "./ExerciseSearch";
import RestTimer from "./RestTimer";
import TemplateSelector from "./TemplateSelector";

export default function WorkoutSessionDialog({ onClose }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const [step, setStep] = useState("templateChoice");
  const [exercises, setExercises] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [message, setMessage] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [prevRecords, setPrevRecords] = useState({});
  const startRef = useRef(null);

  useEffect(() => {
    base44.entities.WorkoutRecord.list("-created_date", 200).then(records => {
      const map = {};
      records.forEach(r => { if (!map[r.workout_type]) map[r.workout_type] = r; });
      setPrevRecords(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== "session") return;
    if (!startRef.current) startRef.current = Date.now();
    const i = setInterval(() => setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(i);
  }, [step]);

  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const ss = String(elapsedSec % 60).padStart(2, "0");

  function addExercise(type) {
    const prev = prevRecords[type];
    setExercises(prev2 => [...prev2, { workout_type: type, sets: [{ weight: prev?.weight || 0, reps: prev?.reps || 0 }] }]);
    setShowSearch(false);
  }
  function updateSet(ei, si, field, val) {
    setExercises(p => p.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.map((s, j) => j === si ? { ...s, [field]: Number(val) || 0 } : s) } : ex));
  }
  function addSet(ei) {
    setExercises(p => p.map((ex, i) => i === ei ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 0 }] } : ex));
  }
  function removeSet(ei, si) {
    setExercises(p => p.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.filter((_, j) => j !== si) } : ex));
  }
  function removeExercise(ei) {
    setExercises(p => p.filter((_, i) => i !== ei));
  }
  function loadTemplate(tpl) {
    const data = JSON.parse(tpl.exercises || "[]");
    setExercises(data.map(e => ({ workout_type: e.workout_type, sets: e.sets.map(s => ({ weight: s.weight || 0, reps: s.reps || 0 })) })));
    setShowTemplates(false);
    setStep("session");
  }

  async function finish(saveTemplate) {
    setSubmitting(true);
    const nowIso = new Date().toISOString();
    const c = fuzzCoords(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    await base44.entities.LiveSession.create({
      status: "live", workout_type: exercises[0]?.workout_type || "ベンチプレス",
      location_name: locationName || t("goLive.defaultGym"), lat: c.lat, lng: c.lng,
      viewers_count: 0, hype_count: 0, started_at: nowIso, message
    }).catch(() => {});
    await base44.entities.WorkoutRecord.bulkCreate(
      exercises.map(ex => {
        const vol = ex.sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        return {
          workout_type: ex.workout_type, sets: ex.sets.length,
          reps: ex.sets[0]?.reps || 0, weight: ex.sets[0]?.weight || 0,
          duration_sec: elapsedSec, volume: Math.round(vol * 100) / 100,
          notes: message || "", set_details: JSON.stringify(ex.sets)
        };
      })
    ).catch(() => {});
    if (saveTemplate && templateName.trim()) {
      await base44.entities.WorkoutTemplate.create({
        name: templateName.trim(),
        exercises: JSON.stringify(exercises.map(e => ({ workout_type: e.workout_type, sets: e.sets })))
      }).catch(() => {});
    }
    setSubmitting(false);
    setDone(true);
    setTimeout(() => onClose(), 1000);
  }

  if (done) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-7 h-7 text-primary" /></div>
          <div className="font-semibold text-lg">トレーニングを記録しました！💪</div>
        </div>
      </Overlay>
    );
  }

  if (step === "templateChoice") {
    return (
      <Overlay onClose={onClose}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">トレーニング記録</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <button onClick={() => setShowTemplates(true)} className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-left">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0"><ClipboardList className="w-5 h-5 text-primary" /></div>
            <div><div className="font-semibold text-sm">📝 テンプレートから開始</div><div className="text-xs text-muted-foreground mt-0.5">保存したテンプレートを選択</div></div>
          </button>
          <button onClick={() => setStep("session")} className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-left">
            <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0"><Zap className="w-5 h-5 text-accent" /></div>
            <div><div className="font-semibold text-sm">⚡ 新しく作成</div><div className="text-xs text-muted-foreground mt-0.5">種目を自由に組み合わせ</div></div>
          </button>
        </div>
        {showTemplates && <TemplateSelector onSelect={loadTemplate} onClose={() => setShowTemplates(false)} />}
      </Overlay>
    );
  }

  if (step === "savePrompt") {
    return (
      <Overlay onClose={onClose}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("session")} className="p-1.5 rounded-lg hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
            <h2 className="font-bold text-lg">完了</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div className="text-sm">このメニューをテンプレートとして保存しますか？</div>
          <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="例: Push Day" className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          <div className="space-y-2">
            <button onClick={() => finish(true)} disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存して終了
            </button>
            <button onClick={() => finish(false)} disabled={submitting} className="w-full py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground">保存せずに終了</button>
          </div>
        </div>
      </Overlay>
    );
  }

  // session step
  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setStep("templateChoice")} className="p-1.5 rounded-lg hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-1.5 text-sm font-bold"><Clock className="w-4 h-4 text-primary" /> {mm}:{ss}</div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      {exercises.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">種目を追加してください</div>
      ) : (
        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <ExerciseCard key={i} exercise={ex} index={i} prev={prevRecords[ex.workout_type]}
              onUpdateSet={updateSet} onAddSet={addSet} onRemoveSet={removeSet} onRemoveExercise={removeExercise} />
          ))}
        </div>
      )}
      <button onClick={() => setShowSearch(true)} className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary mt-3">
        <Plus className="w-4 h-4" /> 種目追加
      </button>
      <div className="flex gap-2 mt-3">
        <button onClick={() => setShowRest(v => !v)} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-secondary/60 border border-border">
          <Timer className="w-4 h-4 text-primary" /> レストタイマー
        </button>
        <button onClick={() => setShowLive(v => !v)} className="flex items-center gap-1 text-xs px-2 py-2 text-muted-foreground">
          <ChevronDown className="w-3 h-3" /> ライブ配信
        </button>
      </div>
      {showLive && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder={t("goLive.locationPlaceholder")} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder={t("goLive.messagePlaceholder")} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
      )}
      <button onClick={() => exercises.length > 0 && setStep("savePrompt")} disabled={exercises.length === 0} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl mt-3 disabled:opacity-50">
        <Check className="w-4 h-4" /> 完了
      </button>
      {showSearch && <ExerciseSearch onSelect={addExercise} onClose={() => setShowSearch(false)} exclude={exercises.map(e => e.workout_type)} />}
      {showRest && <RestTimer onClose={() => setShowRest(false)} />}
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}