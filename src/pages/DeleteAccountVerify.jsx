import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useT } from "@/lib/i18n";

function maskEmail(email) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(2, name.length - 2))}@${domain}`;
}

export default function DeleteAccountVerify() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  async function sendCode() {
    setSending(true);
    setError("");
    try {
      const res = await base44.functions.invoke("deletionVerification", { action: "send_code" });
      if (res.data?.ok) {
        setCodeSent(true);
      } else {
        setError(res.data?.message || "エラーが発生しました");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setSending(false);
    }
  }

  async function verifyCode() {
    if (!code.trim()) return;
    setVerifying(true);
    setError("");
    try {
      const res = await base44.functions.invoke("deletionVerification", { action: "verify_code", code: code.trim() });
      if (res.data?.verified) {
        navigate("/delete-account/final");
      } else {
        setError(res.data?.message || t("del.codeWrong"));
      }
    } catch (err) {
      setError(err.response?.data?.message || "エラーが発生しました");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="flex items-center px-3 py-3">
        <button onClick={() => navigate(-1)} className="p-2.5 -ml-1 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-5 pt-4">
        <h1 className="text-xl font-bold mb-3">{t("del.verifyTitle")}</h1>

        <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-medium truncate">{maskEmail(me?.email)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("del.verifyDesc")}</div>
          </div>
        </div>

        {!codeSent ? (
          <button
            onClick={sendCode}
            disabled={sending}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("del.sendCode")}
          </button>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">{t("del.codeSent")}</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
              placeholder={t("del.codePlaceholder")}
              className="w-full px-4 py-3.5 rounded-xl bg-secondary border border-border text-center text-2xl font-bold tracking-[0.5em] mb-3"
            />
            <button
              onClick={verifyCode}
              disabled={verifying || code.length < 6}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : t("del.verifyCode")}
            </button>
            <button
              onClick={sendCode}
              disabled={sending}
              className="w-full py-2.5 mt-3 text-sm text-muted-foreground hover:text-foreground"
            >
              {t("del.resendCode")}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
      </div>

      <div className="px-5 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3.5 rounded-xl border border-border text-base font-semibold"
        >
          {t("settings.cancel")}
        </button>
      </div>
    </div>
  );
}