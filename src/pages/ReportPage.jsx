import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { ArrowLeft, Loader2 } from "lucide-react";
import { showReportSuccess } from "@/lib/reportSuccessStore";
import { fetchUser, displayName } from "@/lib/profile";

const REASONS = [
  { code: "spam_scam", key: "report.reasonSpamScam" },
  { code: "harassment", key: "report.reasonHarassment" },
  { code: "discrimination", key: "report.reasonDiscrimination" },
  { code: "inappropriate_content", key: "report.reasonInappropriateContent" },
  { code: "violence_danger", key: "report.reasonViolenceDanger" },
  { code: "impersonation", key: "report.reasonImpersonation" },
  { code: "solicitation_advertising", key: "report.reasonSolicitation" },
  { code: "other", key: "report.reasonOther" },
];

export default function ReportPage() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = location.state || {};
  const [meId, setMeId] = useState(null);
  const [reason, setReason] = useState(null);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [targetName, setTargetName] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => setMeId(u?.id || null)).catch(() => {});
  }, []);

  useEffect(() => {
    if (ctx.reported_id && (ctx.target_type === "user" || ctx.target_type === "conversation")) {
      fetchUser(ctx.reported_id).then((u) => setTargetName(displayName(u))).catch(() => {});
    }
  }, [ctx.reported_id, ctx.target_type]);

  const targetType = ctx.target_type || "user";
  const subtitle = targetType === "user" ? t("report.subtitleUser").replace("{name}", targetName)
    : targetType === "post" ? t("report.subtitlePost")
    : targetType === "comment" ? t("report.subtitleComment")
    : targetType === "conversation" ? t("report.subtitleConversation").replace("{name}", targetName)
    : "";

  const isOther = reason === "other";
  const otherInvalid = isOther && !detail.trim();
  const canSubmit = !!reason && !otherInvalid && !submitting && !!ctx.reported_id;

  async function submit() {
    if (!canSubmit || !meId) return;
    setSubmitting(true);
    setError(false);
    try {
      await base44.entities.Report.create({
        reporter_id: meId,
        reported_id: ctx.reported_id,
        reason_code: reason,
        reason: reason,
        other_detail: isOther ? detail.trim() : "",
        target_type: ctx.target_type || "user",
        target_id: ctx.target_id || ctx.reported_id || "",
        target_content: (ctx.target_content || "").slice(0, 500),
        status: "pending",
      });
      showReportSuccess();
      navigate(-1);
    } catch (e) {
      setError(true);
      setSubmitting(false);
    }
  }

  function back() {
    if (submitting) return;
    navigate(-1);
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="flex items-center justify-between px-3 h-14 shrink-0 border-b border-border">
        <button onClick={back} disabled={submitting} className="p-2 -ml-2 rounded-full hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">{t("report.title")}</h1>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="px-1 py-2 text-base font-semibold text-primary disabled:opacity-40 flex items-center gap-1"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("common.send")}
        </button>
      </header>

      {subtitle && (
        <div className="px-4 py-2 text-center text-sm text-muted-foreground border-b border-border">
          {subtitle}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="divide-y divide-border">
          {REASONS.map((r) => (
            <button
              key={r.code}
              onClick={() => setReason(r.code)}
              className="w-full flex items-center gap-3 py-4 text-left active:bg-secondary/40 transition"
            >
              <span className="flex-1 text-base">{t(r.key)}</span>
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                  reason === r.code ? "border-primary" : "border-muted-foreground/40"
                }`}
              >
                {reason === r.code && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </span>
            </button>
          ))}
        </div>

        {isOther && (
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value.slice(0, 500))}
            placeholder={t("report.otherPlaceholder")}
            autoFocus
            maxLength={500}
            className="w-full mt-4 bg-secondary/60 border border-border rounded-xl p-3 text-base outline-none focus:border-primary resize-none min-h-[120px]"
          />
        )}

        {error && (
          <div className="mt-4 text-sm text-destructive text-center">{t("report.error")}</div>
        )}
      </div>
    </div>
  );
}