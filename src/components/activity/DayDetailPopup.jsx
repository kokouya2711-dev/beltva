import React, { useState, useRef, useMemo } from "react";
import { X } from "lucide-react";
import { formatDuration } from "@/lib/activityHelpers";

const PARTS = ["胸", "背中", "脚", "肩", "腕", "腹"];

export default function DayDetailPopup({ recordedDays, initialDay, onClose, onEdit, onAdd }) {
  const startIndex = useMemo(
    () => recordedDays.findIndex((d) => d.key === initialDay.key),
    [recordedDays, initialDay.key]
  );
  const hasRecords = startIndex >= 0;
  const [index, setIndex] = useState(hasRecords ? startIndex : -1);
  const touchStartX = useRef(null);

  const current = hasRecords ? recordedDays[index] : initialDay;
  const records = current.records;
  const diffDays = current.diffDays;
  const dateLabel = current.dateLabel;
  const dateKey = current.key;

  const editable = diffDays >= 0 && diffDays <= 2;
  const pastReadOnly = diffDays > 2;

  const uniqueParts = [...new Set(records.filter((r) => PARTS.includes(r.workout_type)).map((r) => r.workout_type))];
  const cardioRec = records.find((r) => r.workout_type === "有酸素運動");
  const cardioSec = cardioRec ? Number(cardioRec.duration_sec) || 0 : 0;
  const memo = records.map((r) => r.notes).find(Boolean) || "";
  const hasAny = uniqueParts.length > 0 || cardioSec > 0 || Boolean(memo);

  const count = recordedDays.length;

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null || !hasRecords) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) setIndex((i) => Math.max(0, i - 1));      // 左 → より古い記録日
    else setIndex((i) => Math.min(count - 1, i + 1));     // 右 → より新しい記録日
  };

  // ページドット（最大5個のスライド窓）
  const showDots = hasRecords && count > 1;
  const windowSize = Math.min(count, 5);
  const winStart = showDots
    ? Math.max(0, Math.min(index - Math.floor(windowSize / 2), count - windowSize))
    : 0;
  const dots = showDots
    ? Array.from({ length: windowSize }, (_, i) => winStart + i)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose} onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-xs bg-card rounded-2xl border border-border p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground" aria-label="閉じる">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center text-base font-bold text-foreground mb-4 pr-6">{dateLabel}</div>

        <div className="space-y-3 mb-5">
          {uniqueParts.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1.5">部位</div>
              <div className="flex flex-wrap gap-1.5">
                {uniqueParts.map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-sm font-bold">{p}</span>
                ))}
              </div>
            </div>
          )}
          {cardioSec > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1.5">有酸素運動</div>
              <div className="text-sm font-bold text-foreground">{formatDuration(cardioSec)}</div>
            </div>
          )}
          {memo && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1.5">メモ</div>
              <div className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{memo}</div>
            </div>
          )}
          {!hasAny && (
            <div className="text-center text-sm text-muted-foreground py-2">この日のワークアウト記録はありません</div>
          )}
        </div>

        {editable && hasAny && (
          <button onClick={() => onEdit(dateKey)} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl active:scale-[0.98] transition">
            記録を修正する
          </button>
        )}
        {editable && !hasAny && (
          <button onClick={() => onAdd(dateKey)} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl active:scale-[0.98] transition">
            記録を追加する
          </button>
        )}
        {!editable && pastReadOnly && hasAny && (
          <div className="text-center text-xs text-muted-foreground">3日前以前の記録は編集できません</div>
        )}
        {!editable && pastReadOnly && !hasAny && (
          <div className="text-center text-xs text-muted-foreground">3日前以前の記録は追加できません</div>
        )}

        {showDots && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {dots.map((di) => (
              <span
                key={di}
                className={`h-1.5 rounded-full transition-all ${di === index ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}