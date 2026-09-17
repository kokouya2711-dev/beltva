import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n, useT, LANGS } from "@/lib/i18n";
import Flag from "@/components/Flag";
import LanguageSelectOverlay from "@/components/auth/LanguageSelectOverlay";
import BeltvaLogo from "@/components/auth/BeltvaLogo";

// 新規登録ウェルカム画面(1枚目)
// 右上:言語ボタン / 中央:BELTVAロゴ+タグライン / 下:新規登録+ログイン
export default function WelcomeScreen({ onRegister, onLogin }) {
  const { lang, setLang } = useI18n();
  const t = useT();
  const [langOpen, setLangOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* 背景: 左上から右下へのライム帯 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-1/4 -top-1/4 w-[150%] h-[60%] bg-primary/10 blur-2xl"
          style={{ transform: "rotate(22deg)", transformOrigin: "top left" }}
        />
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
      <div className="relative flex-1 flex flex-col justify-center px-6 pt-10">
        <BeltvaLogo className="text-5xl" />
        <p className="mt-4 text-base text-foreground/80 leading-relaxed whitespace-pre-line">
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