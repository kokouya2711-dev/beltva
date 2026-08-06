import React, { useState } from "react";
import { X, Timer, Plus } from "lucide-react";
import { useTraining } from "@/lib/trainingContext";

export default function RestTimer({ onClose }) {
  const { restRemaining, restRunning, presets, customPresets, startRest, stopRest, pauseRest, addPreset, removePreset } = useTraining();
  const [showAdd, setShowAdd] = useState(false);
  const [newMin, setNewMin] = useState("");
  const [newSec, setNewSec] = useState("");

  const mm = String(Math.floor(restRemaining / 60)).padStart(2, "0");
  const ss = String(restRemaining % 60).padStart(2, "0");

  function fmtPreset(s) {
    if (s >= 60 && s % 60 === 0) return `${s / 60}分`;
    if (s >= 60) return `${Math.floor(s / 60)}分${s % 60}秒`;
    return `${s}秒`;
  }

  function addCustom() {
    const sec = Number(newMin) * 60 + Number(newSec);
    if (!sec || sec < 1) return;
    addPreset(sec);
    setNewMin(""); setNewSec(""); setShowAdd(false);
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[65] glass border border-primary/30 rounded-2xl p-4 shadow-2xl min-w-[300px] max-w-[360px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Timer className="w-4 h-4 text-primary" /><span className="font-bold text-sm">レストタイマー</span></div>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-3.5 h-3.5" /></button>
      </div>
      {restRemaining > 0 ? (
        <div className="text-center">
          <div className={`text-4xl font-bold ${restRemaining <= 10 ? "text-destructive" : "text-primary"}`}>{mm}:{ss}</div>
          <div className="flex gap-2 mt-2 justify-center">
            <button onClick={() => restRunning ? pauseRest() : startRest(restRemaining)} className="text-xs px-3 py-1 rounded-lg bg-secondary border border-border">{restRunning ? "一時停止" : "再開"}</button>
            <button onClick={stopRest} className="text-xs px-3 py-1 rounded-lg bg-secondary border border-border">リセット</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {presets.map(s => (
              <div key={s} className="relative">
                <button onClick={() => startRest(s)} className="text-sm px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary">{fmtPreset(s)}</button>
                {customPresets.includes(s) && (
                  <button onClick={() => removePreset(s)} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center text-[9px] leading-none">×</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setShowAdd(v => !v)} className="w-full flex items-center justify-center gap-1 text-xs text-primary hover:underline">
            <Plus className="w-3 h-3" /> カスタム時間を追加
          </button>
          {showAdd && (
            <div className="flex gap-1.5 items-center">
              <input type="number" value={newMin} onChange={e => setNewMin(e.target.value)} placeholder="分" className="w-16 bg-secondary/60 border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary" />
              <span className="text-xs text-muted-foreground">分</span>
              <input type="number" value={newSec} onChange={e => setNewSec(e.target.value)} placeholder="秒" className="w-16 bg-secondary/60 border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary" />
              <span className="text-xs text-muted-foreground">秒</span>
              <button onClick={addCustom} className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-lg">追加</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}