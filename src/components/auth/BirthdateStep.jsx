import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/useScrollLock";
import WheelPicker from "@/components/workout/WheelPicker";

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate(); // m is 1-based
}

// 登録フロー内の生年月日選択ステップ
// ルール: 13歳以上。当日から13年前までのみ選択可能(毎日更新)。
// それより新しい(13歳未満)日付はリストに含めず選択不可。
export default function BirthdateStep({ onBack, onContinue, loading }) {
  const t = useT();
  useScrollLock();

  // 当日基準で13年前を上限とする(毎日更新)
  const today = useMemo(() => new Date(), []);
  const maxDate = useMemo(
    () => new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()),
    [today]
  );
  const minYear = 1900;

  const [year, setYear] = useState(maxDate.getFullYear());
  const [month, setMonth] = useState(maxDate.getMonth() + 1);
  const [day, setDay] = useState(maxDate.getDate());
  const [pickerOpen, setPickerOpen] = useState(false);

  const years = useMemo(() => {
    const arr = [];
    for (let y = minYear; y <= maxDate.getFullYear(); y++) arr.push(y);
    return arr;
  }, [maxDate]);

  const months = useMemo(() => {
    const maxM = year === maxDate.getFullYear() ? maxDate.getMonth() + 1 : 12;
    const arr = [];
    for (let m = 1; m <= maxM; m++) arr.push(m);
    return arr;
  }, [year, maxDate]);

  const days = useMemo(() => {
    let maxD = daysInMonth(year, month);
    if (year === maxDate.getFullYear() && month === maxDate.getMonth() + 1) {
      maxD = Math.min(maxD, maxDate.getDate());
    }
    const arr = [];
    for (let d = 1; d <= maxD; d++) arr.push(d);
    return arr;
  }, [year, month, maxDate]);

  // 年/月変更時にはみ出した値をクランプ
  useEffect(() => {
    if (months.length && !months.includes(month)) {
      setMonth(month < months[0] ? months[0] : months[months.length - 1]);
    }
  }, [months, month]);
  useEffect(() => {
    if (days.length && !days.includes(day)) {
      setDay(day < days[0] ? days[0] : days[days.length - 1]);
    }
  }, [days, day]);

  const sy = years.includes(year) ? year : years[years.length - 1];
  const sm = months.includes(month) ? month : months[months.length - 1];
  const sd = days.includes(day) ? day : days[days.length - 1];

  const dateStr = `${sy}-${String(sm).padStart(2, "0")}-${String(sd).padStart(2, "0")}`;
  const display = `${sy}${t("auth.year")}${sm}${t("auth.month")}${sd}${t("auth.day")}`;

  // ピッカー内のドラフト状態(完了で確定)
  const [draftY, setDraftY] = useState(sy);
  const [draftM, setDraftM] = useState(sm);
  const [draftD, setDraftD] = useState(sd);

  function openPicker() {
    setDraftY(sy); setDraftM(sm); setDraftD(sd);
    setPickerOpen(true);
  }
  function confirmPicker() {
    setYear(draftY); setMonth(draftM); setDay(draftD);
    setPickerOpen(false);
  }

  // ドラフト側も同じ上限でクランプ
  const draftMonths = useMemo(() => {
    const maxM = draftY === maxDate.getFullYear() ? maxDate.getMonth() + 1 : 12;
    const arr = [];
    for (let m = 1; m <= maxM; m++) arr.push(m);
    return arr;
  }, [draftY, maxDate]);
  const draftDays = useMemo(() => {
    let maxD = daysInMonth(draftY, draftM);
    if (draftY === maxDate.getFullYear() && draftM === maxDate.getMonth() + 1) {
      maxD = Math.min(maxD, maxDate.getDate());
    }
    const arr = [];
    for (let d = 1; d <= maxD; d++) arr.push(d);
    return arr;
  }, [draftY, draftM, maxDate]);
  useEffect(() => {
    if (draftMonths.length && !draftMonths.includes(draftM)) {
      setDraftM(draftM < draftMonths[0] ? draftMonths[0] : draftMonths[draftMonths.length - 1]);
    }
  }, [draftMonths, draftM]);
  useEffect(() => {
    if (draftDays.length && !draftDays.includes(draftD)) {
      setDraftD(draftD < draftDays[0] ? draftDays[0] : draftDays[draftDays.length - 1]);
    }
  }, [draftDays, draftD]);

  const dsy = draftMonths.length && draftMonths.includes(draftY) ? draftY : years[years.length - 1];
  const dsm = draftMonths.includes(draftM) ? draftM : draftMonths[draftMonths.length - 1];
  const dsd = draftDays.includes(draftD) ? draftD : draftDays[draftDays.length - 1];

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* ヘッダー: 戻る + 4セグメントプログレスバー(2番目ハイライト) */}
      <header className="flex items-center gap-3 px-4 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      {/* メイン */}
      <div className="flex-1 flex flex-col px-6 pt-10">
        <h2 className="text-center text-xl font-bold text-foreground">{t("auth.birthdateTitle")}</h2>
        <p className="text-center text-sm text-muted-foreground mt-2">{t("auth.birthdateSubtitle")}</p>

        <button
          onClick={openPicker}
          className="mt-8 w-full h-14 rounded-xl bg-card border border-border px-4 text-left text-base text-foreground flex items-center"
        >
          {display}
        </button>
      </div>

      {/* 続けるボタン */}
      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => onContinue(dateStr)}
          disabled={loading}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50"
        >
          {t("auth.continue")}
        </button>
      </div>

      {/* ボトムシート ピッカー */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPickerOpen(false)} />
          <div className="relative bg-card border-t border-border rounded-t-2xl pb-[env(safe-area-inset-bottom)] animate-[slideUp_0.25s_ease-out]">
            {/* ツールバー */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <button onClick={() => setPickerOpen(false)} className="text-sm text-muted-foreground">
                {t("common.cancel")}
              </button>
              <button onClick={confirmPicker} className="text-sm font-bold text-primary">
                {t("common.done")}
              </button>
            </div>
            {/* 列ラベル */}
            <div className="flex gap-2 px-4 pt-2">
              <div className="flex-1 text-center text-xs text-muted-foreground">{t("auth.year")}</div>
              <div className="flex-1 text-center text-xs text-muted-foreground">{t("auth.month")}</div>
              <div className="flex-1 text-center text-xs text-muted-foreground">{t("auth.day")}</div>
            </div>
            {/* ホイール */}
            <div className="flex gap-2 px-4 py-2">
              <div className="flex-1"><WheelPicker values={years} value={dsy} onChange={setDraftY} itemHeight={40} visibleCount={5} /></div>
              <div className="flex-1"><WheelPicker values={draftMonths} value={dsm} onChange={setDraftM} itemHeight={40} visibleCount={5} /></div>
              <div className="flex-1"><WheelPicker values={draftDays} value={dsd} onChange={setDraftD} itemHeight={40} visibleCount={5} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}