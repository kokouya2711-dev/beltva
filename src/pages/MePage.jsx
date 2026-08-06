import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { User, Activity, Settings as SettingsIcon, HelpCircle, ChevronRight, Pencil } from "lucide-react";

export default function MePage() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  const sections = [
    { icon: User, label: t("me.profile"), to: me ? `/profile/${me.id}` : "/" },
    { icon: Activity, label: t("me.activity"), to: "/" },
    { icon: SettingsIcon, label: t("me.settings"), to: "/settings" },
    { icon: HelpCircle, label: t("me.support"), to: "/support" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5">
      {me && (
        <div className="glass rounded-2xl border border-border p-5 flex items-center gap-4">
          {me.avatar_url ? (
            <img src={me.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground">
              {(me.display_name || me.email || "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg truncate">{me.display_name || me.email?.split("@")[0]}</div>
            <div className="text-sm text-muted-foreground truncate">@{me.email?.split("@")[0]}</div>
          </div>
          <button onClick={() => navigate("/profile/edit")} className="flex items-center gap-1.5 text-sm bg-secondary/60 border border-border px-3 py-2 rounded-lg hover:border-primary shrink-0">
            <Pencil className="w-3.5 h-3.5" /> {t("me.editProfile")}
          </button>
        </div>
      )}

      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        {sections.map((s, i) => (
          <button key={i} onClick={() => navigate(s.to)} className="w-full flex items-center gap-3 px-4 py-4 text-sm hover:bg-secondary/40 text-left">
            <s.icon className="w-5 h-5 text-primary" />
            <span className="flex-1 font-medium">{s.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}