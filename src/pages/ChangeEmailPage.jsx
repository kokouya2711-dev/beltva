import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Mail, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";

export default function ChangeEmailPage() {
  const t = useT();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  async function sendCode() {
    if (!newEmail.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await base44.functions.invoke("changeEmailVerification", { action: "send_code", new_email: newEmail.trim() });
      if (res.data?.ok) {
        setCodeSent(true);
      } else {
        setError(res.data?.message || "エラーが発生しました");
      }
    } catch (err) {
      setError(err.response?.data?.message || "エラーが発生しました");
    } finally {
      setSending(false);
    }
  }

  async function verifyAndChange() {
    if (!code.trim()) return;
    setVerifying(true);
    setError("");
    try {
      const res = await base44.functions.invoke("changeEmailVerification", { action: "verify_and_change", code: code.trim() });
      if (res.data?.ok) {
        setDone(true);
        toast({ description: t("changeEmail.success") });
        setTimeout(() => navigate(-1), 1500);
      } else {
        setError(res.data?.message || "エラーが発生しました");
      }
    } catch (err) {
      setError(err.response?.data?.message || "エラーが発生しました");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="relative flex items-center px-3 py-3">
        <button onClick={() => navigate(-1)} className="p-2.5 -ml-1 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{t("changeEmail.title")}</h1>
      </header>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <p className="text-base text-center">{t("changeEmail.success")}</p>
        </div>
      ) : (
        <div className="flex-1 px-5 pt-4">
          {/* 現在のメールアドレス */}
          <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{t("changeEmail.current")}</div>
              <div className="text-base font-medium truncate">{me?.email || ""}</div>
            </div>
          </div>

          {!codeSent ? (
            <div>
              <label className="text-sm font-medium block mb-2">{t("changeEmail.new")}</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setError(""); }}
                placeholder={t("changeEmail.newPlaceholder")}
                className="w-full px-4 py-3.5 rounded-xl bg-secondary border border-border text-base mb-4"
              />
              <button
                onClick={sendCode}
                disabled={sending || !newEmail.trim()}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("changeEmail.sendCode")}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{t("changeEmail.codeSent")}</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                placeholder={t("changeEmail.codePlaceholder")}
                className="w-full px-4 py-3.5 rounded-xl bg-secondary border border-border text-center text-2xl font-bold tracking-[0.5em] mb-3"
              />
              <button
                onClick={verifyAndChange}
                disabled={verifying || code.length < 6}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : t("changeEmail.verify")}
              </button>
              <button
                onClick={sendCode}
                disabled={sending}
                className="w-full py-2.5 mt-3 text-sm text-muted-foreground hover:text-foreground"
              >
                {t("changeEmail.resendCode")}
              </button>
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
        </div>
      )}

      {!done && (
        <div className="px-5 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 rounded-xl border border-border text-base font-semibold"
          >
            {t("settings.cancel")}
          </button>
        </div>
      )}
    </div>
  );
}