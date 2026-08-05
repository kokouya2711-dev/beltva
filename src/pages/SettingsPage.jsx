import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT, useI18n, LANGS } from "@/lib/i18n";
import {
  ChevronRight, User, Bell, Globe, LogOut, Shield,
  ShieldCheck, Ban, FileText, Mail, Pencil, Heart, Target
} from "lucide-react";

const DM_SCOPE_KEYS = [
  { key: "everyone", labelKey: "settings.dmEveryone" },
  { key: "followings", labelKey: "settings.dmFollowings" },
  { key: "none", labelKey: "settings.dmNone" }
];

export default function SettingsPage() {
  const t = useT();
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [prefs, setPrefs] = useState({ dm: true, follow: true, comment: true });
  const [dmScope, setDmScope] = useState("everyone");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      if (u.notif_prefs) { try { setPrefs(JSON.parse(u.notif_prefs)); } catch {} }
      if (u.dm_scope) setDmScope(u.dm_scope);
    }).catch(() => {});
  }, []);

  async function togglePref(key) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try { await base44.auth.updateMe({ notif_prefs: JSON.stringify(next) }); } catch {}
  }

  async function changeDmScope(scope) {
    setDmScope(scope);
    try { await base44.auth.updateMe({ dm_scope: scope }); } catch {}
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      {/* プロフィール */}
      <Section title={t("settings.profile")}>
        <Row icon={User} label={t("settings.profile")} onClick={() => me && navigate(`/profile/${me.id}`)} />
        <Row icon={Pencil} label={t("settings.editProfile")} onClick={() => navigate("/profile/edit")} />
        <Row icon={Heart} label={t("settings.editHobbies")} onClick={() => navigate("/profile/edit")} />
        <Row icon={Target} label={t("settings.editPurpose")} onClick={() => navigate("/profile/edit")} />
      </Section>

      {/* 言語設定 */}
      <Section title={t("settings.languageSettings")}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 text-sm mb-2"><Globe className="w-4 h-4" /> {t("settings.language")}</div>
          <div className="flex gap-2 flex-wrap">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`text-sm px-3 py-1.5 rounded-full border ${lang === l.code ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{l.label}</button>
            ))}
          </div>
        </div>
      </Section>

      {/* 通知設定 */}
      <Section title={t("settings.notifications")}>
        <ToggleRow label={t("messages.title")} checked={prefs.dm} onChange={() => togglePref("dm")} />
        <ToggleRow label={t("common.follow")} checked={prefs.follow} onChange={() => togglePref("follow")} />
        <ToggleRow label={t("notifications.title")} checked={prefs.comment} onChange={() => togglePref("comment")} />
      </Section>

      {/* DM設定 */}
      <Section title={t("settings.dmSettings")}>
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-sm mb-1"><Shield className="w-4 h-4" /> {t("settings.dmScopeDesc")}</div>
          <div className="flex gap-2 flex-wrap">
            {DM_SCOPE_KEYS.map((s) => (
              <button key={s.key} onClick={() => changeDmScope(s.key)} className={`text-sm px-3 py-1.5 rounded-full border ${dmScope === s.key ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{t(s.labelKey)}</button>
            ))}
          </div>
        </div>
      </Section>

      {/* プライバシー・ブロック */}
      <Section title={t("settings.privacy")}>
        <Row icon={ShieldCheck} label={t("settings.privacy")} onClick={() => navigate("/privacy")} />
        <Row icon={Ban} label={t("settings.blockedUsers")} onClick={() => navigate("/blocked-users")} />
      </Section>

      {/* その他 */}
      <Section title={t("settings.other")}>
        <Row icon={FileText} label={t("settings.terms")} onClick={() => navigate("/terms")} />
        <Row icon={Mail} label={t("settings.contact")} onClick={() => navigate("/contact")} />
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
function Row({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/40 text-left">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
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