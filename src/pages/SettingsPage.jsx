import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT, useI18n } from "@/lib/i18n";
import { ChevronRight, User, Heart, Target, Bell, Globe, Moon, LogOut } from "lucide-react";

const LANGS = [{ code: "ja", label: "日本語" }, { code: "en", label: "English" }, { code: "zh", label: "中文" }, { code: "ko", label: "한국어" }];

export default function SettingsPage() {
  const t = useT();
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ dm: true, follow: true, comment: true });

  useEffect(() => {
    base44.auth.me().then((u) => { if (u.notif_prefs) { try { setPrefs(JSON.parse(u.notif_prefs)); } catch {} } }).catch(() => {});
  }, []);

  async function togglePref(key) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try { await base44.auth.updateMe({ notif_prefs: JSON.stringify(next) }); } catch {}
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      <Section title={t("settings.account")}>
        <Row icon={User} label={t("settings.editProfile")} onClick={() => navigate("/profile/edit")} />
        <Row icon={Heart} label={t("settings.editHobbies")} onClick={() => navigate("/profile/edit")} />
        <Row icon={Target} label={t("settings.editPurpose")} onClick={() => navigate("/profile/edit")} />
      </Section>

      <Section title={t("settings.notifications")}>
        <ToggleRow label={t("messages.title")} checked={prefs.dm} onChange={() => togglePref("dm")} />
        <ToggleRow label={t("common.follow")} checked={prefs.follow} onChange={() => togglePref("follow")} />
        <ToggleRow label={t("notifications.title")} checked={prefs.comment} onChange={() => togglePref("comment")} />
      </Section>

      <Section title={t("settings.preferences")}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 text-sm mb-2"><Globe className="w-4 h-4" /> {t("settings.language")}</div>
          <div className="flex gap-2 flex-wrap">
            {LANGS.map((l) => <button key={l.code} onClick={() => setLang(l.code)} className={`text-sm px-3 py-1.5 rounded-full border ${lang === l.code ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{l.label}</button>)}
          </div>
        </div>
        <Row icon={Moon} label={t("settings.darkMode")} disabled />
      </Section>

      <button onClick={() => base44.auth.logout("/login")} className="w-full flex items-center justify-center gap-2 bg-secondary/60 border border-border py-3 rounded-xl text-sm font-semibold hover:border-red-500/40">
        <LogOut className="w-4 h-4" /> {t("settings.logout")}
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</div>
      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}
function Row({ icon: Icon, label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/40 disabled:opacity-50 text-left">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      {!disabled && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}
function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span>{label}</span>
      <button onClick={onChange} className={`w-11 h-6 rounded-full transition relative ${checked ? "bg-primary" : "bg-secondary border border-border"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}