import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import { subscribeReportSuccess, hideReportSuccess } from "@/lib/reportSuccessStore";

export default function ReportSuccessDialog() {
  const t = useT();
  const [show, setShow] = useState(false);

  useEffect(() => subscribeReportSuccess(setShow), []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/60">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-7 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-primary-foreground" strokeWidth={3} />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">{t("report.dialogTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t("report.dialogBody")}</p>
        <button
          onClick={hideReportSuccess}
          className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-base active:scale-[0.98] transition"
        >
          {t("report.dialogClose")}
        </button>
      </div>
    </div>
  );
}