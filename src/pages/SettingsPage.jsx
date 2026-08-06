import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT, useI18n, LANGS } from "@/lib/i18n";
import {
  ChevronRight, ArrowLeft, User, Bell, Globe, LogOut, Shield,
  ShieldCheck, Ban, Dumbbell, Search, Check, Timer
} from "lucide-react";
import { useTraining } from "@/lib/trainingContext";

const DM_SCOPE_KEYS = [
  { key: "everyone", labelKey: "settings.dmEveryone" },
  { key: "followings", labelKey: "settings.dmFollowings" },
  { key: "none", labelKey: "settings.dmNone" }
];

const NOTIF_TYPES = [
  { key: "dm", labelKey: "notif.dm" },
  { key: "follow", labelKey: "notif.follow" },
  { key: "like", labelKey: "notif.like" },
  { key: "comment", labelKey: "notif.comment" },
  { key: "trainingStart", labelKey: "notif.trainingStart" },
  { key: "prUpdate", labelKey: "notif.prUpdate" },
];

const DEFAULT_NOTIF_PREFS = {
  inApp: { dm: true, follow: true, like: true, comment: true, trainingStart: true, prUpdate: true },
  push: { dm: true, follow: true, like: false, comment: true, trainingStart: true, prUpdate: false }
};

export default function SettingsPage() {
  const t = useT();
  const [section, setSection] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {section ? (
        <div>
          <button onClick={() => setSection(null)} className="p-2 -ml-2 rounded-lg hover:bg-secondary/40 mb-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {section === "account" && <AccountSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "language" && <LanguageSection />}
          {section === "training" && <TrainingSection />}
          {section === "privacy" && <PrivacySection />}
        </div>
      ) : (
        <div className="space-y-5">
          <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
          <CategoryList onSelect={setSection} />
        </div>
      )}
    </div>
  );
}

function CategoryList({ onSelect }) {
  const t = useT();
  const items = [
    { key: "account", icon: User, label: t("settings.account") },
    { key: "notifications", icon: Bell, label: t("settings.notifications") },
    { key: "language", icon: Globe, label: t("settings.language") },
    { key: "training", icon: Dumbbell, label: t("settings.training") },
    { key: "privacy", icon: Shield, label: t("settings.privacy") },
  ];
  return (
    <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
      {items.map((item) => (
        <button key={item.key} onClick={() => onSelect(item.key)} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary/40 text-left">
          <item.icon className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1">{item.label}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

function AccountSection() {
  const t = useT();
  const [dmScope, setDmScope] = useState("everyone");

  useEffect(() => {
    base44.auth.me().then((u) => { if (u.dm_scope) setDmScope(u.dm_scope); }).catch(() => {});
  }, []);

  async function changeDmScope(scope) {
    setDmScope(scope);
    try { await base44.auth.updateMe({ dm_scope: scope }); } catch {}
  }

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">{t("settings.account")}</h2>
      <div className="glass rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 text-sm mb-2"><Shield className="w-4 h-4" /> {t("settings.dmScopeDesc")}</div>
        <div className="flex gap-2 flex-wrap">
          {DM_SCOPE_KEYS.map((s) => (
            <button key={s.key} onClick={() => changeDmScope(s.key)} className={`text-sm px-3 py-1.5 rounded-full border ${dmScope === s.key ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{t(s.labelKey)}</button>
          ))}
        </div>
      </div>
      <button onClick={() => base44.auth.logout("/login")} className="w-full flex items-center justify-center gap-2 bg-secondary/60 border border-border py-3 rounded-xl text-sm font-semibold hover:border-red-500/40">
        <LogOut className="w-4 h-4" /> {t("settings.logout")}
      </button>
    </div>
  );
}

function NotificationsSection() {
  const t = useT();
  const [prefs, setPrefs] = useState(DEFAULT_NOTIF_PREFS);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.notif_prefs) {
        try {
          const parsed = JSON.parse(u.notif_prefs);
          if (parsed.inApp && parsed.push) setPrefs(parsed);
        } catch {}
      }
    }).catch(() => {});
  }, []);

  async function togglePref(category, key) {
    const next = { ...prefs, [category]: { ...prefs[category], [key]: !prefs[category][key] } };
    setPrefs(next);
    try { await base44.auth.updateMe({ notif_prefs: JSON.stringify(next) }); } catch {}
  }

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">{t("settings.notifications")}</h2>
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("notif.inApp")}</div>
        <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {NOTIF_TYPES.map((n) => (
            <ToggleRow key={n.key} label={t(n.labelKey)} checked={prefs.inApp[n.key]} onChange={() => togglePref("inApp", n.key)} />
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("notif.push")}</div>
        <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {NOTIF_TYPES.map((n) => (
            <ToggleRow key={n.key} label={t(n.labelKey)} checked={prefs.push[n.key]} onChange={() => togglePref("push", n.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LanguageSection() {
  const t = useT();
  const { lang, setLang } = useI18n();
  const [search, setSearch] = useState("");

  const filtered = LANGS.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.code.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">{t("settings.language")}</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("language.search")}
          className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        {filtered.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/40 text-left"
          >
            <span className="text-xl">{l.flag}</span>
            <span className="flex-1">{l.label}</span>
            {lang === l.code && <Check className="w-4 h-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrainingSection() {
  const t = useT();
  const { defaultRest, setDefaultRest } = useTraining();
  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">{t("settings.training")}</h2>
      <div className="glass rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 text-sm mb-2"><Timer className="w-4 h-4" /> {t("settings.defaultRest")}</div>
        <div className="flex gap-2 flex-wrap">
          {[30, 45, 60, 90, 120, 180, 300].map((s) => (
            <button key={s} onClick={() => setDefaultRest(s)} className={`text-sm px-3 py-1.5 rounded-full border ${defaultRest === s ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
              {s >= 60 ? `${s / 60}${t("common.min")}` : `${s}${t("common.sec")}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrivacySection() {
  const t = useT();
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">{t("settings.privacy")}</h2>
      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <Row icon={ShieldCheck} label={t("settings.privacy")} onClick={() => navigate("/privacy")} />
        <Row icon={Ban} label={t("settings.blockedUsers")} onClick={() => navigate("/blocked-users")} />
      </div>
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