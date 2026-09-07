import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { LANGS } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";

// 言語コード → 国コード（flagcdn用・真っ直ぐなフラット国旗）
const FLAG = {
  ja: "jp", en: "gb", fr: "fr", es: "es", pt: "pt", de: "de", it: "it",
  ru: "ru", ar: "sa", tr: "tr", ko: "kr", zh: "cn", "zh-TW": "tw",
  id: "id", th: "th", vi: "vn"
};

// 言語選択の全画面専用ページ
export default function LanguageSelectPage({ selected, onClose, onConfirm }) {
  const { lang } = useI18n();
  const [val, setVal] = useState(selected || "");
  const locale = lang === "zh-TW" ? "zh-TW" : lang;
  const langLabel = (code) => {
    try {
      return new Intl.DisplayNames([locale], { type: "language" }).of(code) || code;
    } catch { return code; }
  };
  const flagUrl = (code) => `https://flagcdn.com/w80/${FLAG[code] || code}.png`;

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <button onClick={onClose} className="p-2 -ml-2 text-foreground" aria-label="戻る">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-extrabold text-foreground">言語</span>
        <button onClick={() => onConfirm(val)} className="px-3 py-1.5 -mr-1 text-base font-bold text-primary">
          完了
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <ul>
          {LANGS.map((l) => {
            const active = val === l.code;
            return (
              <li key={l.code}>
                <button
                  onClick={() => setVal(active ? "" : l.code)}
                  className="w-full flex items-center gap-3 px-4 py-3.5"
                >
                  <img src={flagUrl(l.code)} alt="" className="w-7 h-5 object-cover rounded-[2px] shrink-0" />
                  <span className={`flex-1 text-left text-base font-semibold ${active ? "text-primary" : "text-foreground"}`}>{langLabel(l.code)}</span>
                  {active && <Check className="w-5 h-5 text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}