import React, { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/useScrollLock";

// 登録フロー内のユーザー名(表示名)ステップ
// プログレスバーは3番目(index 2)をハイライト
export default function UsernameStep({ onBack, onContinue, loading, initialValue = "" }) {
  const t = useT();
  useScrollLock();
  const [name, setName] = useState(initialValue);
  const trimmed = name.trim();
  const canContinue = trimmed.length > 0 && !loading;

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      <header className="flex items-center gap-3 px-4 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 2 ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col px-6 pt-10">
        <h2 className="text-center text-xl font-bold text-foreground">{t("auth.usernameTitle")}</h2>
        <p className="text-center text-sm text-muted-foreground mt-2">{t("auth.usernameSubtitle")}</p>

        <div className="mt-8 w-full h-14 rounded-xl bg-card border border-border px-4 flex items-center gap-3">
          <User className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth.usernamePlaceholder")}
            maxLength={30}
            className="flex-1 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => canContinue && onContinue(trimmed)}
          disabled={!canContinue}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-40"
        >
          {t("auth.continue")}
        </button>
      </div>
    </div>
  );
}