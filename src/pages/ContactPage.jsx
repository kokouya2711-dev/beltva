import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function ContactPage() {
  const t = useT();
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">{t("contact.title")}</h1>
      </div>

      <div className="glass rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold mb-1">{t("contact.supportTitle")}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("contact.supportBody")}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t("contact.emailLabel")}</div>
          <div className="text-sm font-mono">support@beltva.app</div>
        </div>
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t("contact.responseTime")}</div>
          <p className="text-sm text-muted-foreground">{t("contact.responseTimeDesc")}</p>
        </div>
      </div>
    </div>
  );
}