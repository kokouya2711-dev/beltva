import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import AgeRangeBar from "./AgeRangeBar";
import { PURPOSES, LEVELS } from "@/lib/userFilters";

// 詳細フィルターのボトムシート
// 年齢（2ハンドルレンジ）/ 目的 / トレ歴レベル — すべて任意
export default function DetailFilterSheet({ open, allowedMin, allowedMax, initial, onClose, onApply }) {
  const [ageMin, setAgeMin] = useState(allowedMin);
  const [ageMax, setAgeMax] = useState(allowedMax);
  const [purpose, setPurpose] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    if (open) {
      setAgeMin(initial?.ageMin ?? allowedMin);
      setAgeMax(initial?.ageMax ?? allowedMax);
      setPurpose(initial?.purpose ?? "");
      setLevel(initial?.level ?? "");
    }
  }, [open, allowedMin, allowedMax, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full bg-card rounded-t-2xl border-t border-border p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-foreground">詳細フィルター</span>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground" aria-label="閉じる">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-3">年齢</div>
            <AgeRangeBar
              min={allowedMin}
              max={allowedMax}
              valueMin={ageMin}
              valueMax={ageMax}
              onChange={(mn, mx) => { setAgeMin(mn); setAgeMax(mx); }}
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">目的</div>
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPurpose(purpose === p.key ? "" : p.key)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${purpose === p.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">トレ歴レベル</div>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setLevel(level === l.key ? "" : l.key)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${level === l.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onApply({ ageMin, ageMax, purpose, level })}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl mt-6 active:scale-[0.98] transition"
        >
          適用
        </button>
      </div>
    </div>
  );
}