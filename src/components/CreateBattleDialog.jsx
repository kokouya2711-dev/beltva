import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Trophy, Plus, Loader2 } from "lucide-react";
import { WORKOUT_TYPES } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { useTWorkout, useTMetric } from "@/lib/i18nHelpers";

const METRIC_KEYS = ["volume", "reps", "duration"];

export default function CreateBattleDialog({ onClose, onCreated }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const tMetric = useTMetric();
  const [title, setTitle] = useState("");
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0]);
  const [metric, setMetric] = useState("volume");
  const [days, setDays] = useState(7);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fmtDate(d) {
    return d.toISOString().slice(0, 10);
  }

  async function create() {
    setSubmitting(true);
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + Number(days) || 7);
    await base44.entities.Battle.create({
      title: title || t("battle.defaultName").replace("{w}", tWorkout(workoutType)),
      workout_type: workoutType,
      metric,
      status: "active",
      start_date: fmtDate(start),
      end_date: fmtDate(end),
      description
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
            <Trophy className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="font-bold text-lg">{t("battle.create")}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("battle.title")}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("battle.titlePlaceholder")}
            className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("battle.workoutType")}</label>
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
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("battle.duration")}</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("battle.metric")}</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {METRIC_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={`text-xs px-2 py-2 rounded-lg border transition ${
                  metric === k
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {tMetric(k)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("battle.description")}</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("battle.descPlaceholder")}
            className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={create}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {t("battle.start")}
        </button>
      </div>
    </Overlay>
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