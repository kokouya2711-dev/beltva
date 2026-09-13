import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function DeleteAccountFinal() {
  const t = useT();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("deletionVerification", { action: "submit_deletion" });
      if (res.data?.ok) {
        await base44.auth.logout("/login");
      } else {
        setError(res.data?.message || "エラーが発生しました");
        setSubmitting(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "エラーが発生しました");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="flex items-center px-3 py-3">
        <button
          onClick={() => navigate(-1)}
          disabled={submitting}
          className="p-2.5 -ml-1 rounded-full bg-secondary/60 hover:bg-secondary transition disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-5 pt-4 flex flex-col">
        <h1 className="text-xl font-bold mb-6">{t("del.finalTitle")}</h1>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <p className="text-base text-center leading-relaxed mb-8">{t("del.finalDesc")}</p>

        {error && <p className="text-sm text-destructive mb-4 text-center">{error}</p>}
      </div>

      <div className="px-5 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-xl border border-border text-base font-semibold disabled:opacity-50"
          >
            {t("settings.cancel")}
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-xl bg-destructive text-destructive-foreground text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("del.submitDeletion")}
          </button>
        </div>
      </div>
    </div>
  );
}