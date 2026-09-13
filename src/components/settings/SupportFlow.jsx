import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import {
  ArrowLeft, ChevronRight, Mail, FileText, Shield,
  Lightbulb, AlertTriangle, HelpCircle, Send, Loader2
} from "lucide-react";

const ICON_CLS = "w-6 h-6 text-muted-foreground shrink-0";

export default function SupportFlow({ sub, type, onBack, navigate }) {
  if (!sub) return <SupportRoot onBack={onBack} navigate={navigate} />;
  if (sub === "contact" && !type) return <ContactMenu onBack={onBack} navigate={navigate} />;
  if (sub === "contact" && type) return <ContactForm type={type} onBack={onBack} />;
  if (sub === "terms") return <SimpleScreen titleKey="support.terms" onBack={onBack} />;
  if (sub === "privacy") return <SimpleScreen titleKey="support.privacy" onBack={onBack} />;
  return null;
}

function ScreenHeader({ title, onBack, right }) {
  return (
    <div className="relative flex items-center mb-5">
      <button onClick={onBack} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{title}</h2>
      {right != null && <div className="ml-auto">{right}</div>}
    </div>
  );
}

function ListRow({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 py-4 text-base hover:bg-secondary/40 text-left">
      <Icon className={ICON_CLS} />
      <span className="flex-1">{label}</span>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}

function SupportRoot({ onBack, navigate }) {
  const t = useT();
  const go = (p) => navigate(`/settings?section=support${p}`);
  return (
    <div>
      <ScreenHeader title={t("support.title")} onBack={onBack} />
      <div className="divide-y divide-border">
        <ListRow icon={Mail} label={t("support.contact")} onClick={() => go("&sub=contact")} />
        <ListRow icon={FileText} label={t("support.terms")} onClick={() => go("&sub=terms")} />
        <ListRow icon={Shield} label={t("support.privacy")} onClick={() => go("&sub=privacy")} />
      </div>
    </div>
  );
}

function ContactMenu({ onBack, navigate }) {
  const t = useT();
  const go = (tp) => navigate(`/settings?section=support&sub=contact&type=${tp}`);
  return (
    <div>
      <ScreenHeader title={t("support.contact")} onBack={onBack} />
      <div className="divide-y divide-border">
        <ListRow icon={Lightbulb} label={t("support.request")} onClick={() => go("request")} />
        <ListRow icon={AlertTriangle} label={t("support.bug")} onClick={() => go("bug")} />
        <ListRow icon={HelpCircle} label={t("support.help")} onClick={() => go("help")} />
      </div>
    </div>
  );
}

const FORM_CONFIG = {
  request: { titleKey: "support.request", placeholderKey: "support.requestPlaceholder" },
  bug: { titleKey: "support.bug", placeholderKey: "support.bugPlaceholder" },
  help: { titleKey: "support.help", placeholderKey: "support.helpPlaceholder" },
};

function ContactForm({ type, onBack }) {
  const t = useT();
  const cfg = FORM_CONFIG[type];
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!body.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await base44.functions.invoke("sendSupportEmail", { type, body });
      if (res?.data?.error) throw new Error(res.data.error);
      setSent(true);
      setTimeout(() => onBack(), 1200);
    } catch (e) {
      setError(t("support.send") === "Send" ? "Failed to send" : "送信に失敗しました");
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg font-semibold text-primary">{t("support.sent")}</div>
      </div>
    );
  }

  const canSend = body.trim().length > 0 && !sending;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={t(cfg.titleKey)}
        onBack={onBack}
        right={
          <button
            onClick={submit}
            disabled={!canSend}
            className="px-1 py-1.5 text-base font-semibold text-primary disabled:opacity-40 flex items-center gap-1.5"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("support.send")}
          </button>
        }
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t(cfg.placeholderKey)}
        autoFocus
        className="w-full flex-1 resize-none bg-transparent outline-none text-base leading-relaxed min-h-[50vh] py-1"
      />
      {error && <div className="text-sm text-destructive pt-2">{error}</div>}
    </div>
  );
}

function SimpleScreen({ titleKey, onBack }) {
  const t = useT();
  return (
    <div>
      <ScreenHeader title={t(titleKey)} onBack={onBack} />
      {/* 本文は今後作成 */}
    </div>
  );
}