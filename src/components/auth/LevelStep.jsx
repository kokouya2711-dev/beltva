import React, { useState } from "react";
import { ArrowLeft, BookOpen, BarChart3, Crown } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/useScrollLock";

// 登録フロー内のトレーニングレベル選択ステップ
// プログレスバーは8番目(index 7)をハイライト
const OPTIONS = [
  { key: "beginner", Icon: BookOpen, labelKey: "auth.levelBeginner", subKey: "auth.levelBeginnerSub" },
  { key: "intermediate", Icon: BarChart3, labelKey: "auth.levelIntermediate", subKey: "auth.levelIntermediateSub" },
  { key: "advanced", Icon: Crown, labelKey: "auth.levelAdvanced", subKey: "auth.levelAdvancedSub" },
];

export default function LevelStep({ onBack, onContinue, loading, initialValue = "" }) {
  const t = useT();
  useScrollLock();
  const [val, setVal] = useState(initialValue);
  const canContinue = !!val && !loading;

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      <header className="flex items-center gap-3 px-4 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 7 ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col px-6 pt-10">
        <h2 className="text-center text-xl font-bold text-foreground">{t("auth.levelTitle")}</h2>

        <div className="mt-8 flex flex-col gap-3">
          {OPTIONS.map(({ key, Icon, labelKey, subKey }) => {
            const active = val === key;
            return (
              <button
                key={key}
                onClick={() => setVal(key)}
                className={`w-full flex items-center gap-4 rounded-xl border-2 bg-card px-4 py-4 transition-colors ${active ? "border-primary" : "border-border"}`}
              >
                <Icon className="w-6 h-6 text-primary shrink-0" />
                <span className="flex-1 text-left">
                  <span className="block text-base font-semibold text-foreground">{t(labelKey)}</span>
                  <span className="block text-sm text-muted-foreground mt-0.5">{t(subKey)}</span>
                </span>
                <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${active ? "border-primary" : "border-muted-foreground/40"}`}>
                  {active && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => canContinue && onContinue(val)}
          disabled={!canContinue}
          className={`w-full h-12 rounded-full font-bold transition-colors ${canContinue ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}
        >
          {t("auth.continue")}
        </button>
      </div>
    </div>
  );
}