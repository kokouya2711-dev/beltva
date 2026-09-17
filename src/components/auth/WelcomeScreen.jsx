import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useI18n, useT, LANGS } from "@/lib/i18n";
import Flag from "@/components/Flag";
import LanguageSelectOverlay from "@/components/auth/LanguageSelectOverlay";

// 新規登録ウェルカム画面(1枚目)
// 右上:言語ボタン / 中央:BELTVAロゴ+タグライン / 下:新規登録+ログイン
export default function WelcomeScreen({ onRegister, onLogin }) {
  const { lang, setLang } = useI18n();
  const t = useT();
  const [langOpen, setLangOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* 背景グラデーション */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* 右上 言語ボタン */}
      <div className="relative flex justify-end px-4 pt-4">
        <button
          onClick={() => setLangOpen(true)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm"
        >
          <Flag code={current.code} className="w-4 h-3 rounded-[2px]" />
          <span className="font-medium">{current.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* 中央 ロゴ+タグライン */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="flex items-end text-5xl font-extrabold tracking-tight">
          <span className="text-foreground">BELTV</span>
          <ChevronUp className="w-9 h-9 text-primary -mt-0.5" strokeWidth={3} />
        </h1>
        <p className="mt-4 text-center text-base text-foreground/80 leading-relaxed whitespace-pre-line">
          {t("auth.tagline")}
        </p>
      </div>

      {/* 下 アクション */}
      <div className="relative px-6 pb-10 flex flex-col items-center gap-4">
        <button
          onClick={onRegister}
          className="w-full max-w-sm py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-base"
        >
          {t("auth.newRegistration")}
        </button>
        <p className="text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <button onClick={onLogin} className="text-primary font-semibold">
            {t("auth.login")}
          </button>
        </p>
      </div>

      {langOpen && (
        <LanguageSelectOverlay
          onClose={() => setLangOpen(false)}
          onConfirm={(code) => {
            setLang(code);
            setLangOpen(false);
          }}
        />
      )}
    </div>
  );
}