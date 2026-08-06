import React, { useState, useEffect } from "react";
import { X, Timer } from "lucide-react";

const PRESETS = [30, 60, 90, 120];

export default function RestTimer({ onClose }) {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { setRunning(false); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [running]);

  const start = (sec) => { setRemaining(sec); setRunning(true); };
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[65] glass border border-primary/30 rounded-2xl p-4 shadow-2xl min-w-[260px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Timer className="w-4 h-4 text-primary" /><span className="font-bold text-sm">レストタイマー</span></div>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-3.5 h-3.5" /></button>
      </div>
      {remaining > 0 ? (
        <div className="text-center">
          <div className={`text-4xl font-bold ${remaining <= 10 ? "text-destructive" : "text-primary"}`}>{mm}:{ss}</div>
          <div className="flex gap-2 mt-2 justify-center">
            <button onClick={() => setRunning(r => !r)} className="text-xs px-3 py-1 rounded-lg bg-secondary border border-border">{running ? "一時停止" : "再開"}</button>
            <button onClick={() => { setRemaining(0); setRunning(false); }} className="text-xs px-3 py-1 rounded-lg bg-secondary border border-border">リセット</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 justify-center">
          {PRESETS.map(s => <button key={s} onClick={() => start(s)} className="text-sm px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary">{s}s</button>)}
        </div>
      )}
    </div>
  );
}