import React, { useState, useMemo } from "react";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";
import { useI18n, useT, LANGS } from "@/lib/i18n";
import Flag from "@/components/Flag";
import { useScrollLock } from "@/hooks/useScrollLock";

// 登録フロー内のメイン言語(フィード言語)選択ステップ
// プログレスバーは6番目(index 5)をハイライト
// 一度決めたら変更不可。アプリ表示言語とは別データ。
export default function LanguageStep({ onBack, onContinue, loading, initialValue = "" }) {
  const t = useT();
  const { lang } = useI18n();
  useScrollLock();
  const [val, setVal] = useState(initialValue);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const locale = lang === "zh-TW" ? "zh-TW" : lang;
  const displayLabel = useMemo(() => {
    try {
      const dn = new Intl.DisplayNames([locale], { type: "language" });
      return (code) => dn.of(code) || code;
    } catch {
      return (code) => code;
    }
  }, [locale]);

  const selectedLang = useMemo(() => LANGS.find((l) => l.code === val) || null, [val]);

  function openPicker() {
    setDraft(val);
    setPickerOpen(true);
  }
  function confirmPicker() {
    setVal(draft);
    setPickerOpen(false);
  }

  const canContinue = !!val && !loading;

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* ヘッダー: 戻る + 6セグメントプログレスバー(6番目ハイライト) */}
      <header className="flex items-center gap-3 px-4 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 4 ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      {/* メイン */}
      <div className="flex-1 flex flex-col px-6 pt-10">
        <h2 className="text-center text-xl font-bold text-foreground">{t("auth.mainLanguageTitle")}</h2>
        <p className="text-center text-sm text-muted-foreground mt-2 px-2">{t("auth.mainLanguageSubtitle")}</p>

        <button
          onClick={openPicker}
          className="mt-8 w-full h-14 rounded-xl bg-card border border-border px-4 flex items-center gap-3 text-left"
        >
          {selectedLang ? (
            <>
              <Flag code={selectedLang.code} className="w-7 h-5 object-cover rounded-[3px] shrink-0" />
              <span className="flex-1 text-base text-foreground">{displayLabel(selectedLang.code)}</span>
            </>
          ) : (
            <span className="flex-1 text-base text-muted-foreground">{t("auth.mainLanguageSelect")}</span>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* 続けるボタン */}
      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => canContinue && onContinue(val)}
          disabled={!canContinue}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-40"
        >
          {t("auth.continue")}
        </button>
      </div>

      {/* 全画面 言語選択リスト */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[90] bg-background flex flex-col overflow-hidden overscroll-none animate-[slideUp_0.25s_ease-out]">
          <header className="flex items-center justify-between px-4 py-3 shrink-0">
            <button
              onClick={() => setPickerOpen(false)}
              className="p-2 -ml-2 text-foreground"
              aria-label={t("auth.back")}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-base font-bold text-foreground">{t("auth.mainLanguageSelectHeader")}</span>
            <button
              onClick={confirmPicker}
              disabled={!draft}
              className="px-4 py-1.5 -mr-1 text-sm font-bold text-primary-foreground bg-primary rounded-full disabled:opacity-40"
            >
              {t("auth.ok")}
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <ul>
              {LANGS.map((l) => {
                const active = draft === l.code;
                return (
                  <li key={l.code} className="relative">
                    {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary" />}
                    <button
                      onClick={() => setDraft(l.code)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <Flag code={l.code} className="w-7 h-5 object-cover rounded-[3px] shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className={`block text-base font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>
                          {displayLabel(l.code)}
                        </span>
                        <span className="block text-sm text-muted-foreground leading-tight mt-0.5">
                          {l.label}
                        </span>
                      </span>
                      {active && <Check className="w-5 h-5 text-primary shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}