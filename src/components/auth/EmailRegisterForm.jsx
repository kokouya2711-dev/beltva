import React, { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

// メール登録フォーム(3枚目)
// 戻る + タイトル + メール/パスワード/確認 + 続ける
export default function EmailRegisterForm({ onBack, onSubmit, loading, error }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setLocalError("");
    if (password !== confirm) {
      setLocalError(t("auth.passwordsDoNotMatch"));
      return;
    }
    onSubmit({ email, password });
  };

  const Field = ({ label, icon: Icon, type, value, onChange, placeholder, toggle, toggled, onToggle, autoComplete }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full h-12 pl-10 pr-10 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary"
        />
        {toggle && (
          <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {toggled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-16 w-56 h-56 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <header className="relative flex items-center px-4 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <form onSubmit={submit} className="relative flex-1 flex flex-col px-6 pt-6 gap-5">
        <h2 className="text-xl font-bold text-foreground">{t("auth.registerWithEmail")}</h2>

        <Field
          label={t("auth.email")}
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("auth.emailPlaceholder")}
          autoComplete="email"
        />
        <Field
          label={t("auth.password")}
          icon={Lock}
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.passwordPlaceholder")}
          toggle
          toggled={showPw}
          onToggle={() => setShowPw((v) => !v)}
          autoComplete="new-password"
        />
        <Field
          label={t("auth.confirmPassword")}
          icon={Lock}
          type={showConfirm ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t("auth.confirmPlaceholder")}
          toggle
          toggled={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          autoComplete="new-password"
        />

        {(localError || error) && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {localError || error}
          </div>
        )}

        <div className="mt-auto pb-10 pt-4">
          <button
            type="submit"
            disabled={loading || !email || !password || !confirm}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-40 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("auth.creatingAccount")}
              </>
            ) : (
              t("auth.continue")
            )}
          </button>
        </div>
      </form>
    </div>
  );
}