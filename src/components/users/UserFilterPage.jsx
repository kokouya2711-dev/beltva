import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import AgeRangeBar from "./AgeRangeBar";
import { PURPOSES, LEVELS } from "@/lib/userFilters";
import { LANGS } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";

// 詳細検索の全画面ページ（ボトムシートではなく専用ページ）
// 年齢 / 目的 / 言語 / レベル — すべて任意（選択中項目を再タップで解除）
export default function UserFilterPage({ open, allowedMin, allowedMax, initial, onClose, onApply }) {
  const { lang } = useI18n();
  const [ageMin, setAgeMin] = useState(allowedMin);
  const [ageMax, setAgeMax] = useState(allowedMax);
  const [purpose, setPurpose] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setAgeMin(initial?.ageMin ?? allowedMin);
      setAgeMax(initial?.ageMax ?? allowedMax);
      setPurpose(initial?.purpose ?? "");
      setLanguage(initial?.language ?? "");
      setLevel(initial?.level ?? "");
      setLangOpen(false);
    }
  }, [open, allowedMin, allowedMax, initial]);

  if (!open) return null;

  const reset = () => {
    setAgeMin(allowedMin);
    setAgeMax(allowedMax);
    setPurpose("");
    setLanguage("");
    setLevel("");
    setLangOpen(false);
  };

  const locale = lang === "zh-TW" ? "zh-TW" : lang;
  const langLabel = (code) => {
    try {
      const dn = new Intl.DisplayNames([locale], { type: "language" });
      return dn.of(code) || code;
    } catch { return code; }
  };
  const selectedLangLabel = language ? langLabel(language) : "未選択";

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      {/* 上部バー：戻る / 検索 / リセット */}
      <header className="flex items-center justify-between px-4 py-3">
        <button onClick={onClose} className="p-2 -ml-2 text-foreground" aria-label="戻る">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-extrabold text-foreground">検索</span>
        <button onClick={reset} className="px-3 py-1.5 -mr-1 text-sm font-bold text-primary">
          リセット
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-32">
        {/* 年齢 */}
        <section className="rounded-2xl bg-secondary/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">年齢</h2>
            <span className="text-base font-bold text-primary">{ageMin}〜{ageMax}</span>
          </div>
          <AgeRangeBar
            min={allowedMin}
            max={allowedMax}
            valueMin={ageMin}
            valueMax={ageMax}
            onChange={(mn, mx) => { setAgeMin(mn); setAgeMax(mx); }}
          />
        </section>

        {/* 目的 */}
        <section className="rounded-2xl bg-secondary/50 p-4">
          <h2 className="text-base font-bold text-foreground mb-3">目的</h2>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map((p) => (
              <button
                key={p.key}
                onClick={() => setPurpose(purpose === p.key ? "" : p.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition ${purpose === p.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* 言語：タップで16言語一覧を開く */}
        <section className="rounded-2xl bg-secondary/50 overflow-hidden">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4"
          >
            <h2 className="text-base font-bold text-foreground">言語</h2>
            <div className="flex items-center gap-1.5">
              <span className={`text-base font-bold ${language ? "text-primary" : "text-muted-foreground"}`}>{selectedLangLabel}</span>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${langOpen ? "rotate-90" : ""}`} />
            </div>
          </button>
          {langOpen && (
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(language === l.code ? "" : l.code)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-bold border transition ${language === l.code ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
                >
                  <span className="mr-1.5">{l.flag}</span>{langLabel(l.code)}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* レベル */}
        <section className="rounded-2xl bg-secondary/50 p-4">
          <h2 className="text-base font-bold text-foreground mb-3">レベル</h2>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                onClick={() => setLevel(level === l.key ? "" : l.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition ${level === l.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* 最下部：横幅いっぱいの検索ボタン（下部ナビより前面） */}
      <div
        className="fixed bottom-0 inset-x-0 bg-background/90 backdrop-blur-md border-t border-border px-4 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <button
          onClick={() => onApply({ ageMin, ageMax, purpose, language, level })}
          className="w-full bg-primary text-primary-foreground font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition"
        >
          検索
        </button>
      </div>
    </div>
  );
}