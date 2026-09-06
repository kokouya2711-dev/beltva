import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import WheelPicker from "@/components/workout/WheelPicker";

const PARTS = ["胸", "背中", "脚", "肩", "腕", "腹"];
const PART_GRID = ["胸", "背中", "脚", "肩", "腕", "腹"];

export default function RecordWorkout() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => new Set());
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (p) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });
  };

  const allSelected = PARTS.every((p) => selected.has(p));
  const toggleAll = () => {
    setSelected((prev) => (PARTS.every((p) => prev.has(p)) ? new Set() : new Set(PARTS)));
  };

  const cardio = hours * 60 + minutes;
  const canSave = selected.size > 0 || cardio > 0;

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    const parts = new Set(selected);
    const records = [];
    parts.forEach((p) => {
      records.push({ workout_type: p, sets: 1, reps: 1, weight: 0, duration_sec: 0, volume: 0, notes: memo || undefined });
    });
    if (cardio > 0) {
      records.push({ workout_type: "有酸素運動", sets: 0, reps: 0, weight: 0, duration_sec: cardio * 60, volume: 0, notes: memo || undefined });
    }
    try {
      if (records.length > 0) await base44.entities.WorkoutRecord.bulkCreate(records);
      setSaving(false);
      setDone(true);
      setTimeout(() => navigate("/"), 850);
    } catch (e) {
      setSaving(false);
      alert("保存に失敗しました。もう一度お試しください。");
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 11 }}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40"
          >
            <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg font-bold text-foreground"
          >
            記録しました
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-background flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="w-9" />
        <h1 className="text-lg font-bold text-foreground">ワークアウトを記録</h1>
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 -mr-1 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-4 py-6 space-y-8 max-w-md mx-auto w-full pb-32">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">部位</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {PART_GRID.map((p) => (
              <button
                key={p}
                onClick={() => toggle(p)}
                className={`py-4 rounded-xl font-bold text-base transition active:scale-[0.98] ${
                  selected.has(p) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={toggleAll}
            className={`mt-2.5 w-full py-4 rounded-xl font-bold text-base transition active:scale-[0.98] ${
              allSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            全身
          </button>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">有酸素運動</h2>
          <div className="bg-secondary/40 rounded-2xl p-3">
            <div className="flex items-end justify-center gap-8">
              <div className="flex flex-col items-center">
                <WheelPicker values={Array.from({ length: 24 }, (_, i) => i)} value={hours} onChange={setHours} />
                <span className="text-xs font-semibold text-muted-foreground mt-2">時間</span>
              </div>
              <div className="flex flex-col items-center">
                <WheelPicker values={Array.from({ length: 60 }, (_, i) => i)} value={minutes} onChange={setMinutes} />
                <span className="text-xs font-semibold text-muted-foreground mt-2">分</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">メモ（任意）</h2>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="今日のメモを自由に入力"
            className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
        </section>
      </div>

      <div
        className="fixed bottom-0 inset-x-0 bg-background/85 backdrop-blur-md border-t border-border px-4 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <div className="max-w-md mx-auto">
          <button
            onClick={save}
            disabled={!canSave || saving}
            className="w-full bg-primary text-primary-foreground font-bold text-base py-4 rounded-2xl disabled:opacity-40 transition active:scale-[0.98]"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "完了"}
          </button>
        </div>
      </div>
    </div>
  );
}