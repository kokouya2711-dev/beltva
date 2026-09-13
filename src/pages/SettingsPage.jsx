import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT, useI18n, LANGS } from "@/lib/i18n";
import {
  ChevronRight, ArrowLeft, User, Bell, Globe, LogOut, Shield,
  ShieldCheck, Ban, Search, Check,
  EyeOff, Eye, UserSearch, Lock, VolumeX, Mail, KeyRound, Loader2
} from "lucide-react";


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
  { key: "reaction", labelKey: "notif.reaction" },
  { key: "trainingStart", labelKey: "notif.trainingStart" },
  { key: "admin", labelKey: "notif.admin" },
];

const DEFAULT_NOTIF_PREFS = {
  dm: true, follow: true, like: false, comment: true, reaction: true, trainingStart: true, admin: true,
};

export default function SettingsPage() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [section, setSection] = useState(null);

  useEffect(() => {
    if (location.state?.section) {
      setSection(location.state.section);
    }
  }, [location.state]);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {section ? (
        <div>
          {section === "privacy" ? null : section === "language" || section === "account" ? (
            <div className="relative flex items-center mb-5">
              <button onClick={() => setSection(null)} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{section === "language" ? t("settings.language") : t("settings.account")}</h2>
            </div>
          ) : (
            <button onClick={() => setSection(null)} className="p-2 -ml-2 rounded-lg hover:bg-secondary/40 mb-4">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {section === "account" && <AccountSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "language" && <LanguageSection />}
          {section === "privacy" && <PrivacySection onBack={() => setSection(null)} />}
        </div>
      ) : (
        <div>
          <header className="flex items-center justify-between pt-2 pb-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{t("settings.title")}</h1>
            <span className="w-9" />
          </header>
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
    { key: "privacy", icon: Shield, label: t("settings.privacy") },
    { key: "notifications", icon: Bell, label: t("settings.notifications") },
    { key: "language", icon: Globe, label: t("settings.language") },
  ];
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <button key={item.key} onClick={() => onSelect(item.key)} className="w-full flex items-center gap-4 py-4 text-base hover:bg-secondary/40 text-left">
          <item.icon className="w-6 h-6 text-muted-foreground" />
          <span className="flex-1">{item.label}</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

function AccountSection() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="divide-y divide-border">
        <button onClick={() => navigate("/change-email")} className="w-full flex items-center gap-4 py-4 text-left hover:bg-secondary/40">
          <Mail className="w-6 h-6 text-muted-foreground shrink-0" />
          <span className="text-base flex-1">{t("settings.email")}</span>
          <span className="text-sm text-muted-foreground truncate max-w-[45%]">{me?.email || ""}</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </button>
        <button onClick={() => navigate("/login-method")} className="w-full flex items-center gap-4 py-4 text-left hover:bg-secondary/40">
          <KeyRound className="w-6 h-6 text-muted-foreground shrink-0" />
          <span className="text-base flex-1">{t("settings.loginMethod")}</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <button
        onClick={() => navigate("/logout")}
        className="w-full flex items-center justify-center gap-2 bg-secondary/60 border border-border py-3.5 rounded-xl text-base font-semibold hover:border-border"
      >
        <LogOut className="w-5 h-5" /> {t("settings.logout")}
      </button>

      <div className="pt-16" />
      <button
        onClick={() => navigate("/delete-account/confirm")}
        className="w-full py-3.5 text-base font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition"
      >
        {t("settings.deleteAccount")}
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
          if (parsed && typeof parsed === "object" && !parsed.inApp && !parsed.push) setPrefs({ ...DEFAULT_NOTIF_PREFS, ...parsed });
        } catch {}
      }
    }).catch(() => {});
  }, []);

  async function togglePref(key) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try { await base44.auth.updateMe({ notif_prefs: JSON.stringify(next) }); } catch {}
  }

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">{t("settings.notifications")}</h2>
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("notif.smartphone")}</div>
        <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {NOTIF_TYPES.map((n) => (
            <ToggleRow key={n.key} label={t(n.labelKey)} checked={prefs[n.key]} onChange={() => togglePref(n.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LanguageSection() {
  const { lang, setLang } = useI18n();
  return (
    <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
      {LANGS.map((l) => (
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
  );
}

function PrivacySection({ onBack }) {
  const t = useT();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    show_online_status: true,
    age_public: false,
    searchable: true,
    timeline_visibility: "everyone",
  });
  const [subPage, setSubPage] = useState(null);

  const timelineVisibilityOptions = [
    { key: "everyone", label: t("privacy.timelineEveryone") },
    { key: "followers", label: t("privacy.timelineFollowers") },
  ];

  useEffect(() => {
    base44.auth.me().then((u) => {
      setSettings((prev) => ({
        ...prev,
        show_online_status: u.show_online_status !== false,
        age_public: u.age_public === true,
        searchable: u.searchable_by !== "none" && u.searchable_by_id !== false,
        timeline_visibility: u.timeline_visibility === "private" ? "everyone" : (u.timeline_visibility || "everyone"),
      }));
    }).catch(() => {});
  }, []);

  async function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await base44.auth.updateMe({ [key]: value });
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !value }));
    }
  }

  async function updateSearchable(value) {
    setSettings((prev) => ({ ...prev, searchable: value }));
    try {
      await base44.auth.updateMe({
        searchable_by: value ? "everyone" : "none",
        searchable_by_id: value,
      });
    } catch {
      setSettings((prev) => ({ ...prev, searchable: !value }));
    }
  }

  const timelineVisibilityLabel = timelineVisibilityOptions.find((o) => o.key === settings.timeline_visibility)?.label || timelineVisibilityOptions[0].label;

  if (subPage === "timelineVisibility") {
    return (
      <div>
        <div className="relative flex items-center mb-5">
          <button onClick={() => setSubPage(null)} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{t("privacy.timelineVisibility")}</h2>
        </div>
        <div className="divide-y divide-border">
          {timelineVisibilityOptions.map((opt) => (
            <button key={opt.key} onClick={() => update("timeline_visibility", opt.key)} className="w-full flex items-center gap-3 py-4 text-base hover:bg-secondary/40 text-left">
              <span className="flex-1">{opt.label}</span>
              {settings.timeline_visibility === opt.key && <Check className="w-5 h-5 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative flex items-center mb-5">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{t("settings.privacy")}</h2>
      </div>

      {/* Group 1: プロフィールの公開 */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("privacy.profileVisibility")}</h3>
        <div className="divide-y divide-border">
          <PrivacyToggle label={t("privacy.showOnlineStatus")} checked={settings.show_online_status} onChange={() => update("show_online_status", !settings.show_online_status)} />
          <PrivacyToggle label={t("privacy.agePublic")} checked={settings.age_public} onChange={() => update("age_public", !settings.age_public)} />
        </div>
      </div>

      {/* Group 2: 検索・タイムライン */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("privacy.searchTimeline")}</h3>
        <div className="divide-y divide-border">
          <PrivacyToggle label={t("privacy.searchable")} checked={settings.searchable} onChange={() => updateSearchable(!settings.searchable)} />
          <button onClick={() => setSubPage("timelineVisibility")} className="w-full flex items-center gap-3 py-4 text-base hover:bg-secondary/40 text-left">
            <span className="flex-1">{t("privacy.timelineVisibility")}</span>
            <span className="text-muted-foreground text-sm">{timelineVisibilityLabel}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Group 3: ユーザー管理 */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("privacy.userManagement")}</h3>
        <div className="divide-y divide-border">
          <button onClick={() => navigate("/timeline-hide")} className="w-full flex items-center gap-3 py-4 text-base hover:bg-secondary/40 text-left">
            <EyeOff className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">{t("privacy.timelineHideTitle")}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate("/muted-users")} className="w-full flex items-center gap-3 py-4 text-base hover:bg-secondary/40 text-left">
            <VolumeX className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">{t("settings.mutedUsers")}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate("/blocked-users")} className="w-full flex items-center gap-3 py-4 text-base hover:bg-secondary/40 text-left">
            <Ban className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">{t("settings.blockedUsers")}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PrivacyToggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 text-base">
      <span>{label}</span>
      <button onClick={onChange} className={`w-11 h-6 rounded-full transition relative shrink-0 ${checked ? "bg-primary" : "bg-secondary border border-border"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
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

function ToggleRowWithDesc({ icon: Icon, label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-medium"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /> {label}</div>
        <div className="text-xs text-muted-foreground mt-1 pl-6">{desc}</div>
      </div>
      <button onClick={onChange} className={`w-11 h-6 rounded-full transition relative shrink-0 ${checked ? "bg-primary" : "bg-secondary border border-border"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function SelectorRow({ icon: Icon, label, value, options, onChange }) {
  return (
    <div className="px-4 py-3.5 text-sm">
      <div className="flex items-center gap-2 font-medium mb-2"><Icon className="w-4 h-4 text-muted-foreground shrink-0" /> {label}</div>
      <div className="flex gap-2 flex-wrap pl-6">
        {options.map((opt) => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`text-xs px-3 py-1.5 rounded-full border transition ${value === opt.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}