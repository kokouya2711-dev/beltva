import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useT } from "@/lib/i18n";
import WheelPicker from "@/components/workout/WheelPicker";

// 生年月日選択の全画面専用ページ
// 年/月/日のドラムロール式。13歳以上かつ未成年/成人区分をまたがない。

function ageAt(date, today = new Date()) {
  let a = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) a--;
  return a;
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate(); // m is 1-based
}

export default function BirthdateSelectPage({ selected, registeredBirthdate, onClose, onConfirm }) {
  const t = useT();
  useScrollLock();
  const today = useMemo(() => new Date(), []);

  // 登録時生年月日(未成年/成人区分判定用)。未設定なら現在値を基準にする。
  const regBd = registeredBirthdate || selected;
  const regMinor = regBd ? ageAt(new Date(regBd), today) < 18 : true;

  // 選択可能な日付の下限/上限
  // 13歳以上: maxDate = 今日-13年
  // 未成年維持: minDate = 今日-18年+1日(年齢17), maxDate = 今日-13年
  // 成人維持: minDate = 今日-130年, maxDate = 今日-18年
  let minDate, maxDate;
  if (regMinor) {
    minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1);
    maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
  } else {
    minDate = new Date(today.getFullYear() - 130, 0, 1);
    maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  }

  const initial = selected ? new Date(selected) : null;
  const initOk = initial && !isNaN(initial) && initial >= minDate && initial <= maxDate;
  const midYear = Math.floor((minDate.getFullYear() + maxDate.getFullYear()) / 2);

  const [year, setYear] = useState(initOk ? initial.getFullYear() : midYear);
  const [month, setMonth] = useState(initOk ? initial.getMonth() + 1 : (minDate.getMonth() + 1));
  const [day, setDay] = useState(initOk ? initial.getDate() : minDate.getDate());
  const [confirming, setConfirming] = useState(false);

  const years = useMemo(() => {
    const arr = [];
    for (let y = minDate.getFullYear(); y <= maxDate.getFullYear(); y++) arr.push(y);
    return arr;
  }, [minDate, maxDate]);

  const months = useMemo(() => {
    const minM = year === minDate.getFullYear() ? minDate.getMonth() + 1 : 1;
    const maxM = year === maxDate.getFullYear() ? maxDate.getMonth() + 1 : 12;
    const arr = [];
    for (let m = minM; m <= maxM; m++) arr.push(m);
    return arr;
  }, [year, minDate, maxDate]);

  const days = useMemo(() => {
    const minD = (year === minDate.getFullYear() && month === minDate.getMonth() + 1) ? minDate.getDate() : 1;
    const maxD = (year === maxDate.getFullYear() && month === maxDate.getMonth() + 1) ? maxDate.getDate() : daysInMonth(year, month);
    const arr = [];
    for (let d = minD; d <= maxD; d++) arr.push(d);
    return arr;
  }, [year, month, minDate, maxDate]);

  // 年/月変更時にはみ出した月/日をクランプ
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

  // WheelPickerに渡す安全な値
  const sy = years.includes(year) ? year : years[years.length - 1];
  const sm = months.includes(month) ? month : months[months.length - 1];
  const sd = days.includes(day) ? day : days[days.length - 1];

  const newStr = `${sy}-${String(sm).padStart(2, "0")}-${String(sd).padStart(2, "0")}`;

  function handleConfirm() {
    if (newStr === selected) { onClose(); return; }
    setConfirming(true);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col overflow-hidden overscroll-none">
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-foreground" aria-label="戻る">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-extrabold text-foreground">{t("profile.birthdate")}</span>
        <button onClick={handleConfirm} className="px-3 py-1.5 -mr-1 text-base font-bold text-primary">
          完了
        </button>
      </header>

      <div className="px-4 pt-1 pb-3 shrink-0">
        <p className="text-xs text-destructive leading-snug">生年月日の変更は1回までです</p>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 px-4 min-h-0">
        <div className="flex-1"><WheelPicker values={years} value={sy} onChange={setYear} itemHeight={40} visibleCount={5} /></div>
        <div className="flex-1"><WheelPicker values={months} value={sm} onChange={setMonth} itemHeight={40} visibleCount={5} /></div>
        <div className="flex-1"><WheelPicker values={days} value={sd} onChange={setDay} itemHeight={40} visibleCount={5} /></div>
      </div>

      <div className="flex justify-center pb-6 shrink-0">
        <span className="text-sm text-muted-foreground tabular-nums">{sy}年{sm}月{sd}日</span>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center px-8" onClick={() => setConfirming(false)}>
          <div className="bg-card rounded-xl p-5 text-center max-w-xs" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-foreground leading-relaxed">この変更を確定すると、生年月日の変更回数を1回消費します（残り0回になります）。変更しますか？</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirming(false)} className="flex-1 py-2 text-sm font-bold text-muted-foreground rounded-lg bg-secondary">キャンセル</button>
              <button onClick={() => onConfirm(newStr)} className="flex-1 py-2 text-sm font-bold text-primary-foreground rounded-lg bg-primary">変更する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}