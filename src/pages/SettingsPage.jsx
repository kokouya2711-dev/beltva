import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [section, setSection] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {section ? (
        <div>
          {section === "language" || section === "account" ? (
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
          {section === "privacy" && <PrivacySection />}
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  async function doLogout() {
    setLoggingOut(true);
    try { await base44.auth.logout("/login"); } catch { setLoggingOut(false); }
  }

  return (
    <div className="space-y-6">
      <div className="divide-y divide-border">
        <div className="flex items-center gap-4 py-4">
          <Mail className="w-6 h-6 text-muted-foreground shrink-0" />
          <span className="text-base flex-1">{t("settings.email")}</span>
          <span className="text-sm text-muted-foreground truncate max-w-[55%]">{me?.email || ""}</span>
        </div>
        <button onClick={() => navigate("/login-method")} className="w-full flex items-center gap-4 py-4 text-left hover:bg-secondary/40">
          <KeyRound className="w-6 h-6 text-muted-foreground shrink-0" />
          <span className="text-base flex-1">{t("settings.loginMethod")}</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <button
        onClick={() => setShowLogoutConfirm(true)}
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

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => !loggingOut && setShowLogoutConfirm(false)}>
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-5" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-medium text-center mb-5">{t("settings.logoutConfirm")}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} disabled={loggingOut} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold disabled:opacity-50">{t("settings.cancel")}</button>
              <button onClick={doLogout} disabled={loggingOut} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : t("settings.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
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

function PrivacySection() {
  const t = useT();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    share_country: true,
    show_online_status: true,
    age_public: false,
    searchable_by_id: true,
    searchable_by: "everyone",
    timeline_visibility: "everyone",
    timeline_gender_restriction: "none",
  });
  const [subPage, setSubPage] = useState(null);

  const searchableByOptions = [
    { key: "everyone", label: t("privacy.searchableByEveryone") },
    { key: "followings", label: t("privacy.searchableByFollowings") },
    { key: "none", label: t("privacy.searchableByNone") },
  ];
  const timelineVisibilityOptions = [
    { key: "everyone", label: t("privacy.timelineEveryone") },
    { key: "followers", label: t("privacy.timelineFollowers") },
    { key: "private", label: t("privacy.timelinePrivate") },
  ];
  const genderRestrictionOptions = [
    { key: "none", label: t("privacy.genderNone") },
    { key: "female_only", label: t("privacy.genderFemaleOnly") },
    { key: "male_only", label: t("privacy.genderMaleOnly") },
  ];

  useEffect(() => {
    base44.auth.me().then((u) => {
      setSettings((prev) => ({
        ...prev,
        share_country: u.share_country !== false,
        show_online_status: u.show_online_status !== false,
        age_public: u.age_public === true,
        searchable_by_id: u.searchable_by_id !== false,
        searchable_by: u.searchable_by || "everyone",
        timeline_visibility: u.timeline_visibility || "everyone",
        timeline_gender_restriction: u.timeline_gender_restriction || "none",
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

  const searchableByLabel = searchableByOptions.find((o) => o.key === settings.searchable_by)?.label || searchableByOptions[0].label;
  const timelineVisibilityLabel = timelineVisibilityOptions.find((o) => o.key === settings.timeline_visibility)?.label || timelineVisibilityOptions[0].label;
  const genderRestrictionLabel = genderRestrictionOptions.find((o) => o.key === settings.timeline_gender_restriction)?.label || genderRestrictionOptions[0].label;

  if (subPage === "searchableBy") {
    return (
      <div className="space-y-5">
        <button onClick={() => setSubPage(null)} className="p-2 -ml-2 rounded-lg hover:bg-secondary/40 mb-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg">{t("privacy.searchableBy")}</h2>
        <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {searchableByOptions.map((opt) => (
            <button key={opt.key} onClick={() => update("searchable_by", opt.key)} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary/40 text-left">
              <span className="flex-1">{opt.label}</span>
              {settings.searchable_by === opt.key && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (subPage === "timelineVisibility") {
    return (
      <div className="space-y-5">
        <button onClick={() => setSubPage(null)} className="p-2 -ml-2 rounded-lg hover:bg-secondary/40 mb-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg">{t("privacy.timelineVisibility")}</h2>
        <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {timelineVisibilityOptions.map((opt) => (
            <button key={opt.key} onClick={() => update("timeline_visibility", opt.key)} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary/40 text-left">
              <span className="flex-1">{opt.label}</span>
              {settings.timeline_visibility === opt.key && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (subPage === "genderRestriction") {
    return (
      <div className="space-y-5">
        <button onClick={() => setSubPage(null)} className="p-2 -ml-2 rounded-lg hover:bg-secondary/40 mb-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg">{t("privacy.timelineGenderRestriction")}</h2>
        <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {genderRestrictionOptions.map((opt) => (
            <button key={opt.key} onClick={() => update("timeline_gender_restriction", opt.key)} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary/40 text-left">
              <span className="flex-1">{opt.label}</span>
              {settings.timeline_gender_restriction === opt.key && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-lg">{t("settings.privacy")}</h2>

      {/* Country sharing toggle */}
      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <ToggleRow label={t("privacy.shareCountry")} checked={settings.share_country} onChange={() => update("share_country", !settings.share_country)} />
      </div>

      {/* Toggle settings */}
      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <ToggleRowWithDesc icon={Eye} label={t("privacy.showOnlineStatus")} desc={t("privacy.showOnlineStatusDesc")} checked={settings.show_online_status} onChange={() => update("show_online_status", !settings.show_online_status)} />
        <ToggleRowWithDesc icon={User} label={t("privacy.agePublic")} desc={t("privacy.agePublicDesc")} checked={settings.age_public} onChange={() => update("age_public", !settings.age_public)} />
        <ToggleRowWithDesc icon={UserSearch} label={t("privacy.searchableById")} desc={t("privacy.searchableByIdDesc")} checked={settings.searchable_by_id} onChange={() => update("searchable_by_id", !settings.searchable_by_id)} />
      </div>

      {/* Selector settings */}
      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <button onClick={() => setSubPage("searchableBy")} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary/40 text-left">
          <UserSearch className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="flex-1">{t("privacy.searchableBy")}</span>
          <span className="text-muted-foreground text-xs">{searchableByLabel}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={() => setSubPage("timelineVisibility")} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary/40 text-left">
          <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="flex-1">{t("privacy.timelineVisibility")}</span>
          <span className="text-muted-foreground text-xs">{timelineVisibilityLabel}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={() => setSubPage("genderRestriction")} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary/40 text-left">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="flex-1">{t("privacy.timelineGenderRestriction")}</span>
          <span className="text-muted-foreground text-xs">{genderRestrictionLabel}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Link rows */}
      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <Row icon={EyeOff} label={t("privacy.timelineHideTitle")} onClick={() => navigate("/timeline-hide")} />
        <Row icon={VolumeX} label={t("settings.mutedUsers")} onClick={() => navigate("/muted-users")} />
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