import React, { useState } from "react";
import { useT } from "@/lib/i18n";
import {
  ArrowLeft, ChevronRight, Mail, FileText, Shield,
  Lightbulb, AlertTriangle, HelpCircle
} from "lucide-react";

const ICON_CLS = "w-6 h-6 text-muted-foreground shrink-0";
const SUPPORT_EMAIL = "beltva.support@gmail.com";

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

  function openMail() {
    if (!body.trim()) return;
    const subject = `[BELTVA] ${t(cfg.titleKey)}`;
    const encodedBody = encodeURIComponent(body).replace(/%0A/g, "%0D%0A");
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;
    window.location.href = mailto;
  }

  const canOpen = body.trim().length > 0;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={t(cfg.titleKey)}
        onBack={onBack}
        right={
          <button
            onClick={openMail}
            disabled={!canOpen}
            className="px-1 py-1.5 text-base font-semibold text-primary disabled:opacity-40"
          >
            {t("support.openMail")}
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