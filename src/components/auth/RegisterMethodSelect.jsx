import React from "react";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import { Mail } from "lucide-react";

// 登録方法選択画面(2枚目)
// 戻る + タイトル + Google/Apple/メールの3ボタン
export default function RegisterMethodSelect({ onBack, onGoogle, onApple, onEmail }) {
  const t = useT();

  const Row = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border bg-card/60 active:bg-secondary transition"
    >
      <span className="w-6 h-6 flex items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1 text-left text-base font-semibold text-foreground">{label}</span>
    </button>
  );

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -right-16 w-56 h-56 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <header className="relative flex items-center px-4 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <div className="relative flex-1 flex flex-col justify-center px-6 gap-4">
        <h2 className="text-xl font-bold text-center text-foreground mb-2">
          {t("auth.selectMethod")}
        </h2>
        <Row icon={<GoogleIcon className="w-5 h-5" />} label={t("auth.continueWithGoogle")} onClick={onGoogle} />
        <Row icon={<AppleIcon className="w-5 h-5 text-foreground" />} label={t("auth.continueWithApple")} onClick={onApple} />
        <Row icon={<Mail className="w-5 h-5 text-foreground" />} label={t("auth.registerWithEmail")} onClick={onEmail} />
      </div>
    </div>
  );
}