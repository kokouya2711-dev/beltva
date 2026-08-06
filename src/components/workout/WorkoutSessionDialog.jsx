import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, ArrowLeft, Plus, Clock, Timer, Loader2, Check, ClipboardList, Zap, Save } from "lucide-react";
import { useTraining } from "@/lib/trainingContext";
import { useT } from "@/lib/i18n";
import ExerciseCard from "./ExerciseCard";
import ExerciseSearch from "./ExerciseSearch";
import RestTimer from "./RestTimer";
import TemplateSelector from "./TemplateSelector";

export default function WorkoutSessionDialog({ onClose }) {
  const t = useT();
  const training = useTraining();
  const [step, setStep] = useState(training.isActive ? "session" : "templateChoice");
  const [showSearch, setShowSearch] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [prevRecords, setPrevRecords] = useState({});

  useEffect(() => {
    base44.entities.WorkoutRecord.list("-created_date", 200).then(records => {
      const map = {};
      records.forEach(r => { if (!map[r.workout_type]) map[r.workout_type] = r; });
      setPrevRecords(map);
    }).catch(() => {});
  }, []);

  function loadTemplate(tpl) {
    const data = JSON.parse(tpl.exercises || "[]");
    training.startTraining(data.map(e => ({ workout_type: e.workout_type, sets: e.sets.map(s => ({ weight: s.weight || 0, reps: s.reps || 0 })) })));
    setShowTemplates(false);
    setStep("session");
  }

  function loadAllTemplates(tpls) {
    const allExercises = tpls.flatMap(tpl => {
      const data = JSON.parse(tpl.exercises || "[]");
      return data.map(e => ({ workout_type: e.workout_type, sets: e.sets.map(s => ({ weight: s.weight || 0, reps: s.reps || 0 })) }));
    });
    training.startTraining(allExercises);
    setShowTemplates(false);
    setStep("session");
  }

  function startNew() {
    training.startTraining([]);
    setStep("session");
  }

  function addExercise(type) {
    training.addExercise(type, prevRecords[type]);
    setShowSearch(false);
  }

  function completeSet(ei, si) {
    training.completeSet();
    setShowRest(true);
  }

  function copyPrev(ei, w, r) {
    training.copyPrevToExercise(ei, w, r);
  }

  async function finish(saveTemplate) {
    setSubmitting(true);
    await base44.entities.WorkoutRecord.bulkCreate(
      training.exercises.map(ex => {
        const vol = ex.sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        return {
          workout_type: ex.workout_type, sets: ex.sets.length,
          reps: ex.sets[0]?.reps || 0, weight: ex.sets[0]?.weight || 0,
          duration_sec: training.elapsedSec, volume: Math.round(vol * 100) / 100,
          set_details: JSON.stringify(ex.sets)
        };
      })
    ).catch(() => {});
    if (saveTemplate && templateName.trim()) {
      await base44.entities.WorkoutTemplate.create({
        name: templateName.trim(),
        category: templateCategory.trim(),
        exercises: JSON.stringify(training.exercises.map(e => ({ workout_type: e.workout_type, sets: e.sets })))
      }).catch(() => {});
    }
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
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-7 h-7 text-primary" /></div>
          <div className="font-semibold text-lg">{t("workout.recorded")}</div>
        </div>
      </Overlay>
    );
  }

  if (step === "templateChoice") {
    return (
      <Overlay onClose={onClose}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{t("workout.recordTitle")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <ChoiceCard icon={ClipboardList} title={t("workout.templateStart")} desc={t("workout.templateStartDesc")} onClick={() => setShowTemplates(true)} />
          <ChoiceCard icon={Zap} title={t("workout.newWorkout")} desc={t("workout.newWorkoutDesc")} onClick={startNew} />
        </div>
        {showTemplates && <TemplateSelector onSelect={loadTemplate} onSelectAll={loadAllTemplates} onClose={() => setShowTemplates(false)} />}
      </Overlay>
    );
  }

  if (step === "savePrompt") {
    return (
      <Overlay onClose={onClose}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("session")} className="p-1.5 rounded-lg hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
            <h2 className="font-bold text-lg">{t("workout.complete")}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div className="text-sm">{t("workout.saveTemplatePrompt")}</div>
          <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder={t("workout.templateNamePlaceholder")} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          <input value={templateCategory} onChange={e => setTemplateCategory(e.target.value)} placeholder={t("tpl.categoryPlaceholder")} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          <div className="space-y-2">
            <button onClick={() => finish(true)} disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("workout.saveAndFinish")}
            </button>
            <button onClick={() => finish(false)} disabled={submitting} className="w-full py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground">{t("workout.finishWithoutSave")}</button>
          </div>
        </div>
      </Overlay>
    );
  }

  // session step
  return (
    <Overlay onClose={onClose} noScroll>
      <div className="flex flex-col h-[88vh] md:h-[82vh]">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
            <div className="flex items-center gap-1.5 text-sm font-bold"><Clock className="w-4 h-4 text-primary" /> {mm}:{ss}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {training.exercises.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">{t("workout.addExercisePrompt")}</div>
          ) : (
            <div className="space-y-3">
              {training.exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={ex} index={i} prev={prevRecords[ex.workout_type]}
                  onUpdateSet={training.updateSet} onAddSet={training.addSet} onRemoveSet={training.removeSet}
                  onRemoveExercise={training.removeExercise} onCompleteSet={completeSet} onCopyPrev={copyPrev} />
              ))}
            </div>
          )}
          <button onClick={() => setShowSearch(true)} className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary mt-3">
            <Plus className="w-4 h-4" /> {t("workout.addExercise")}
          </button>
          <button onClick={() => setShowRest(v => !v)} className="w-full flex items-center justify-center gap-1.5 text-sm px-3 py-2.5 rounded-xl bg-secondary/60 border border-border mt-2">
            <Timer className="w-4 h-4 text-primary" /> {t("workout.restTimer")}
          </button>
        </div>
        <div className="shrink-0 pt-3 border-t border-border">
          <button onClick={() => training.exercises.length > 0 && setStep("savePrompt")} disabled={training.exercises.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-50">
            <Check className="w-4 h-4" /> {t("workout.complete")}
          </button>
        </div>
      </div>
      {showSearch && <ExerciseSearch onSelect={addExercise} onClose={() => setShowSearch(false)} exclude={training.exercises.map(e => e.workout_type)} />}
      {showRest && <RestTimer onClose={() => setShowRest(false)} />}
    </Overlay>
  );
}

function Overlay({ children, onClose, noScroll }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className={`w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl ${noScroll ? "" : "max-h-[90vh] overflow-y-auto"}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ChoiceCard({ icon: Icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-left">
      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
      <div><div className="font-semibold text-sm">{title}</div><div className="text-xs text-muted-foreground mt-0.5">{desc}</div></div>
    </button>
  );
}