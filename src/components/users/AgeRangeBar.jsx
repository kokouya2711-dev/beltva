import React, { useRef } from "react";

// 2ハンドルの年齢レンジバー
// 選択中範囲＝ネオンライム、未選択＝ダークグレー
export default function AgeRangeBar({ min, max, valueMin, valueMax, onChange }) {
  const trackRef = useRef(null);
  const dragging = useRef(null);

  const pct = (v) => ((v - min) / (max - min)) * 100;
  const leftPct = pct(valueMin);
  const rightPct = pct(valueMax);

  const valFromX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    let r = (clientX - rect.left) / rect.width;
    r = Math.max(0, Math.min(1, r));
    return Math.round(min + r * (max - min));
  };

  const startDrag = (which) => (e) => {
    e.preventDefault();
    dragging.current = which;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const v = valFromX(e.clientX);
    if (dragging.current === "min") onChange(Math.min(v, valueMax), valueMax);
    else onChange(valueMin, Math.max(v, valueMin));
  };
  const endDrag = () => { dragging.current = null; };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <span className="text-sm font-bold text-primary">{valueMin}–{valueMax}歳</span>
      </div>
      <div ref={trackRef} className="relative h-2 rounded-full bg-secondary/70 touch-none">
        <div
          className="absolute h-2 rounded-full bg-primary"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        <div
          onPointerDown={startDrag("min")}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="absolute w-5 h-5 rounded-full bg-primary border-2 border-card shadow -ml-2.5 -top-1.5 cursor-grab touch-none"
          style={{ left: `${leftPct}%` }}
          role="slider"
          aria-label="最低年齢"
        />
        <div
          onPointerDown={startDrag("max")}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="absolute w-5 h-5 rounded-full bg-primary border-2 border-card shadow -ml-2.5 -top-1.5 cursor-grab touch-none"
          style={{ left: `${rightPct}%` }}
          role="slider"
          aria-label="最高年齢"
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[11px] font-semibold text-muted-foreground">
        <span>{min}歳</span>
        <span>{max}歳</span>
      </div>
    </div>
  );
}