import React, { useState } from "react";
import { X, Flag, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

const REASON_KEYS = ["report.spam", "report.inappropriate", "report.harassment", "report.violent", "report.other"];

export default function ReportDialog({ onClose, onSubmit }) {
  const t = useT();
  const [reason, setReason] = useState(REASON_KEYS[0]);
  const [submitting, setSubmitting] = useState(false);
  async function submit() {
    setSubmitting(true);
    try { await onSubmit(t(reason)); } finally { setSubmitting(false); }
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Flag className="w-4 h-4 text-red-500" /><h2 className="font-bold">{t("report.title")}</h2></div>
          <button onClick={onClose} className="p-1"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-2 mb-4">
          {REASON_KEYS.map((r) => (
            <button key={r} onClick={() => setReason(r)} className={`w-full text-left text-sm px-3 py-2 rounded-lg border ${reason === r ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{t(r)}</button>
          ))}
        </div>
        <button onClick={submit} disabled={submitting} className="w-full bg-red-500 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />} {t("report.submit")}
        </button>
      </div>
    </div>
  );
}