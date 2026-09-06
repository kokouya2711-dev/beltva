import React from "react";
import { X } from "lucide-react";
import { formatDuration } from "@/lib/activityHelpers";

const PARTS = ["胸", "背中", "脚", "肩", "腕", "腹"];

export default function DayDetailPopup({ dateLabel, records, diffDays, onClose, onEdit, onAdd }) {
  const editable = diffDays >= 0 && diffDays <= 2;
  const pastReadOnly = diffDays > 2;

  const uniqueParts = [...new Set(records.filter((r) => PARTS.includes(r.workout_type)).map((r) => r.workout_type))];
  const cardioRec = records.find((r) => r.workout_type === "有酸素運動");
  const cardioSec = cardioRec ? Number(cardioRec.duration_sec) || 0 : 0;
  const memo = records.map((r) => r.notes).find(Boolean) || "";
  const hasAny = uniqueParts.length > 0 || cardioSec > 0 || Boolean(memo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-xs bg-card rounded-2xl border border-border p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
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
          <button onClick={onEdit} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl active:scale-[0.98] transition">
            記録を修正する
          </button>
        )}
        {editable && !hasAny && (
          <button onClick={onAdd} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl active:scale-[0.98] transition">
            記録を追加する
          </button>
        )}
        {!editable && pastReadOnly && hasAny && (
          <div className="text-center text-xs text-muted-foreground">3日前以前の記録は編集できません</div>
        )}
        {!editable && pastReadOnly && !hasAny && (
          <div className="text-center text-xs text-muted-foreground">3日前以前の記録は追加できません</div>
        )}
      </div>
    </div>
  );
}