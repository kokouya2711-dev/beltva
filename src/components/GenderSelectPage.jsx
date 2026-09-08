import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useT } from "@/lib/i18n";

// 性別選択の全画面専用ページ
// 選択肢は男性/女性のみ。変更は1回まで。
const OPTIONS = [
  { key: "male", labelKey: "common.genderMale" },
  { key: "female", labelKey: "common.genderFemale" }
];

export default function GenderSelectPage({ selected, onClose, onConfirm }) {
  const t = useT();
  const [val, setVal] = useState(selected || "");
  const [confirming, setConfirming] = useState(false);
  useScrollLock();

  function handleConfirm() {
    if (!val) return;
    if (val === selected) { onClose(); return; }
    setConfirming(true);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col overflow-hidden overscroll-none">
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-foreground" aria-label="戻る">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-extrabold text-foreground">{t("common.gender")}</span>
        <button onClick={handleConfirm} disabled={!val} className="px-3 py-1.5 -mr-1 text-base font-bold text-primary disabled:opacity-40">
          完了
        </button>
      </header>

      <div className="px-4 pt-1 pb-3 shrink-0">
        <p className="text-xs text-destructive leading-snug">性別の変更は1回までです</p>
      </div>

      <div className="shrink-0">
        <ul>
          {OPTIONS.map((o, i) => {
            const active = val === o.key;
            return (
              <li key={o.key}>
                <button onClick={() => setVal(o.key)} className="w-full flex items-center px-4 py-3.5">
                  <span className={`flex-1 text-left text-base font-semibold ${active ? "text-primary" : "text-foreground"}`}>{t(o.labelKey)}</span>
                  {active && <Check className="w-5 h-5 text-primary" />}
                </button>
                {i < OPTIONS.length - 1 && <div className="mx-4 h-px bg-border" />}
              </li>
            );
          })}
        </ul>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center px-8" onClick={() => setConfirming(false)}>
          <div className="bg-card rounded-xl p-5 text-center max-w-xs" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-foreground leading-relaxed">性別の変更は1回までです。<br />変更しますか？</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirming(false)} className="flex-1 py-2 text-sm font-bold text-muted-foreground rounded-lg bg-secondary">キャンセル</button>
              <button onClick={() => onConfirm(val)} className="flex-1 py-2 text-sm font-bold text-primary-foreground rounded-lg bg-primary">変更する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}