import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

export default function DeleteAccountFlow({ email, onClose }) {
  const t = useT();
  const [step, setStep] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      // プロフィールを非表示化 + 削除申請フラグを設定
      await base44.auth.updateMe({
        deletion_requested: true,
        timeline_visibility: "private",
        searchable_by: "none",
        show_online_status: false,
        share_country: false,
      });
      // 全端末からログアウト → ログイン画面へ
      await base44.auth.logout("/login");
    } catch {
      setSubmitting(false);
      setError(t("del.emailMismatch"));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-5" onClick={(e) => e.stopPropagation()}>
        {step === 1 && (
          <>
            <h3 className="text-lg font-bold mb-1">{t("del.step1Title")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("del.step1Desc")}</p>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />{t("del.dataPosts")}</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />{t("del.dataRecords")}</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />{t("del.dataFollows")}</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />{t("del.dataProfile")}</li>
            </ul>
            <p className="text-sm text-destructive font-semibold mb-4">{t("del.step1Note")}</p>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("settings.cancel")}</button>
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">{t("del.next")}</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-lg font-bold mb-1">{t("del.step2Title")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("del.step2Desc")}</p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setError(""); }}
              placeholder={email || t("del.emailPlaceholder")}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm mb-2"
            />
            {error && <p className="text-sm text-destructive mb-2">{error}</p>}
            <div className="flex gap-2 mt-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("settings.cancel")}</button>
              <button
                onClick={() => {
                  if (emailInput.trim().toLowerCase() === (email || "").toLowerCase()) { setStep(3); setError(""); }
                  else setError(t("del.emailMismatch"));
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >{t("del.next")}</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-lg font-bold mb-1">{t("del.step3Title")}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t("del.step3Desc")}</p>
            <div className="bg-secondary/60 rounded-xl p-3 mb-4">
              <div className="text-sm font-medium">{email}</div>
            </div>
            <p className="text-sm text-destructive font-semibold mb-4">{t("del.finalConfirm")}</p>
            <div className="flex gap-2">
              <button onClick={onClose} disabled={submitting} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold disabled:opacity-50">{t("settings.cancel")}</button>
              <button onClick={submit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("del.processing")}</> : t("del.submit")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}