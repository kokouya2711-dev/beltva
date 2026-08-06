import React from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "@/lib/i18n";
import { ChevronRight, HelpCircle, Mail, Star, FileText, Shield } from "lucide-react";

export default function SupportPage() {
  const t = useT();
  const navigate = useNavigate();

  function rateApp() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isAndroid) {
      window.open("https://play.google.com/store/apps/details?id=com.beltva.app", "_blank");
    } else {
      window.open("https://apps.apple.com/app/beltva", "_blank");
    }
  }

  const items = [
    { icon: HelpCircle, label: t("support.help"), onClick: () => navigate("/contact") },
    { icon: Mail, label: t("support.contact"), onClick: () => navigate("/contact") },
    { icon: Star, label: t("support.rate"), onClick: rateApp },
    { icon: FileText, label: t("support.terms"), onClick: () => navigate("/terms") },
    { icon: Shield, label: t("support.privacy"), onClick: () => navigate("/privacy") },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5">
      <h1 className="text-2xl font-bold">{t("support.title")}</h1>
      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        {items.map((item, i) => (
          <button key={i} onClick={item.onClick} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary/40 text-left">
            <item.icon className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}