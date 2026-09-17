import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/useScrollLock";

// 登録フロー内の性別選択ステップ
// 選択肢は男性/女性。プログレスバーは3番目(index 2)をハイライト
const OPTIONS = [
  { key: "male", labelKey: "common.genderMale", symbol: "♂", color: "#60a5fa" },
  { key: "female", labelKey: "common.genderFemale", symbol: "♀", color: "#f472b6" }
];

export default function GenderStep({ onBack, onContinue, loading }) {
  const t = useT();
  useScrollLock();
  const [val, setVal] = useState("");
  const canContinue = !!val && !loading;

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      <header className="flex items-center gap-3 px-4 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col px-6 pt-10">
        <h2 className="text-center text-xl font-bold text-foreground">{t("auth.genderTitle")}</h2>
        <p className="text-center text-sm text-muted-foreground mt-2">{t("auth.genderSubtitle")}</p>

        <div className="mt-10 grid grid-cols-2 gap-4">
          {OPTIONS.map((o) => {
            const active = val === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setVal(o.key)}
                className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-colors ${active ? "border-primary" : "border-border"} bg-card`}
              >
                {active && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                  </span>
                )}
                <span
                  className="text-5xl leading-none"
                  style={{ color: o.color, textShadow: `0 0 18px ${o.color}80` }}
                >
                  {o.symbol}
                </span>
                <span className="text-base font-bold text-foreground">{t(o.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => canContinue && onContinue(val)}
          disabled={!canContinue}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-40"
        >
          {t("auth.continue")}
        </button>
      </div>
    </div>
  );
}