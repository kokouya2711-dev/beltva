import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check } from "lucide-react";
import { LANGS, useI18n, useT } from "@/lib/i18n";
import Flag from "@/components/Flag";
import { useScrollLock } from "@/hooks/useScrollLock";

// 全画面言語選択オーバーレイ
// 左上:戻る / 中央:アプリ言語を選択 / 右上:ネオン背景のOK
// 各項目:国旗 + 表示言語名(現在のロケール) + その下にネイティブ名
export default function LanguageSelectOverlay({ onClose, onConfirm }) {
  const { lang } = useI18n();
  const t = useT();
  const [val, setVal] = useState(lang);
  useScrollLock();

  const locale = lang === "zh-TW" ? "zh-TW" : lang;
  const displayLabel = (code) => {
    try {
      return new Intl.DisplayNames([locale], { type: "language" }).of(code) || code;
    } catch {
      return code;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] bg-background flex flex-col overflow-hidden overscroll-none">
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-foreground">{t("auth.appLanguageSelect")}</span>
        <button
          onClick={() => onConfirm(val)}
          className="px-4 py-1.5 -mr-1 text-sm font-bold text-primary-foreground bg-primary rounded-full"
        >
          {t("auth.ok")}
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <ul>
          {LANGS.map((l) => {
            const active = val === l.code;
            return (
              <li key={l.code}>
                <button
                  onClick={() => setVal(l.code)}
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
    </div>,
    document.body
  );
}