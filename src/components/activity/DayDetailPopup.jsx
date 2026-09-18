import React, { useState, useRef, useMemo, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";
import { formatDuration, workoutTypeLabel } from "@/lib/activityHelpers";

// 新7部位＋旧「腕」（既存データの表示を残すため）
const PARTS = ["胸", "背中", "脚", "肩", "二頭筋", "三頭筋", "腹", "腕"];

export default function DayDetailPopup({ recordedDays, initialDay, onClose, onEdit, onAdd }) {
  const t = useT();
  const startIndex = useMemo(
    () => recordedDays.findIndex((d) => d.key === initialDay.key),
    [recordedDays, initialDay.key]
  );
  const hasRecords = startIndex >= 0;
  const [index, setIndex] = useState(hasRecords ? startIndex : -1);
  const [dir, setDir] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const horizontal = useRef(false);

  // ポップアップ表示中は背面のスクロール・操作を完全にロック
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

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
  const canPrev = hasRecords && index > 0;
  const canNext = hasRecords && index < count - 1;

  const goPrev = () => { if (canPrev) { setDir(-1); setIndex((i) => i - 1); } };
  const goNext = () => { if (canNext) { setDir(1); setIndex((i) => i + 1); } };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    horizontal.current = false;
  };
  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
      horizontal.current = true;
      e.preventDefault();
    }
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null || !hasRecords) { touchStartX.current = null; return; }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 18) return;
    if (dx > 0) goPrev();   // 左→右スワイプ：より古い記録日
    else goNext();          // 右→左スワイプ：より新しい記録日
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

  const body = (
    <>
      <div className="space-y-3 mb-5">
        {uniqueParts.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">{t("body.part")}</div>
            <div className="flex flex-wrap gap-1.5">
              {uniqueParts.map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-sm font-bold">{workoutTypeLabel(p, t)}</span>
              ))}
            </div>
          </div>
        )}
        {cardioSec > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">{t("workout.cardioTitle")}</div>
            <div className="text-sm font-bold text-foreground">{formatDuration(cardioSec, t)}</div>
          </div>
        )}
        {memo && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">{t("workout.memoLabel")}</div>
            <div className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{memo}</div>
          </div>
        )}
        {!hasAny && (
          <div className="text-center text-sm text-muted-foreground py-2">{t("activity.noRecordsDay")}</div>
        )}
      </div>
      {editable && hasAny && (
        <button onClick={() => onEdit(dateKey)} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl active:scale-[0.98] transition">
          {t("activity.editRecord")}
        </button>
      )}
      {editable && !hasAny && (
        <button onClick={() => onAdd(dateKey)} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl active:scale-[0.98] transition">
          {t("activity.addRecord")}
        </button>
      )}
      {!editable && pastReadOnly && hasAny && (
        <div className="text-center text-xs text-muted-foreground">{t("activity.editExpired")}</div>
      )}
      {!editable && pastReadOnly && !hasAny && (
        <div className="text-center text-xs text-muted-foreground">{t("activity.addExpired")}</div>
      )}
    </>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6 touch-none"
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => { e.stopPropagation(); e.preventDefault(); }}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-xs bg-card rounded-2xl border border-border p-5 shadow-2xl touch-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground" aria-label={t("common.close")}>
          <X className="w-5 h-5" />
        </button>

        <div className="text-center text-base font-bold text-foreground mb-2 pr-6">{dateLabel}</div>

        {hasRecords && count > 1 && (
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goPrev}
              disabled={!canPrev}
              className="p-3 -ml-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
              aria-label={t("activity.prevRecordDay")}
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
            </button>
            <button
              onClick={goNext}
              disabled={!canNext}
              className="p-3 -mr-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
              aria-label={t("activity.nextRecordDay")}
            >
              <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {hasRecords ? (
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={index}
              custom={dir}
              initial={{ x: dir > 0 ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir > 0 ? -50 : 50, opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {body}
            </motion.div>
          </AnimatePresence>
        ) : body}

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