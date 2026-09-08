import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Camera, ChevronRight, Loader2 } from "lucide-react";
import { TRAINING_PURPOSES } from "@/lib/hobbies";
import { useT, useI18n, LANGS } from "@/lib/i18n";
import { purposeLabel } from "@/lib/i18nPurposeFilter";
import LanguageSelectPage from "@/components/users/LanguageSelectPage";
import OptionSelectPage from "@/components/OptionSelectPage";
import LevelSelectPage from "@/components/LevelSelectPage";

const LEVELS = [
  { key: "beginner" },
  { key: "intermediate" },
  { key: "advanced" }
];

const LEVEL_COOLDOWN_DAYS = 365;

function calcAge(birthdate) {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function ProfileEdit() {
  const t = useT();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLangSelect, setShowLangSelect] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showPurposeSelect, setShowPurposeSelect] = useState(false);
  const [levelLocked, setLevelLocked] = useState(false);
  const [genderError, setGenderError] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      setForm({
        display_name: u.display_name || "",
        bio: u.bio || "",
        training_purpose: u.training_purpose || "",
        level: u.level || "",
        level_updated_at: u.level_updated_at || "",
        main_language: u.main_language || "",
        avatar_url: u.avatar_url || "",
        gender: u.gender || "",
        birthdate: u.birthdate || "",
      });
    }).catch(() => navigate("/"));
  }, [navigate]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function uploadAvatar(file) {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("avatar_url", file_url);
    } finally { setUploading(false); }
  }

  function checkLevelLocked() {
    if (!form.level_updated_at) return false;
    const last = new Date(form.level_updated_at);
    if (isNaN(last.getTime())) return false;
    const days = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    return days < LEVEL_COOLDOWN_DAYS;
  }

  function getLevelUnlockDate() {
    if (!form.level_updated_at) return null;
    const last = new Date(form.level_updated_at);
    if (isNaN(last.getTime())) return null;
    return new Date(last.getTime() + LEVEL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  }

  async function save() {
    if (!form.gender) { setGenderError(true); return; }
    setGenderError(false);
    setSaving(true);
    try {
      const age = calcAge(form.birthdate);
      await base44.auth.updateMe({
        display_name: form.display_name,
        bio: form.bio,
        training_purpose: form.training_purpose,
        level: form.level,
        level_updated_at: form.level_updated_at || "",
        avatar_url: form.avatar_url,
        gender: form.gender,
        birthdate: form.birthdate,
        main_language: form.main_language,
        ...(age != null ? { age } : {}),
      });
      navigate(-1);
    } finally { setSaving(false); }
  }

  if (!me) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  const levelLabel = (key) => key ? t("level." + key) : "";
  const purposeLbl = (key) => key ? purposeLabel(lang, key) : "";
  const langLabel = (code) => {
    const l = LANGS.find((x) => x.code === code);
    return l ? l.label : code;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar — 帯なし、テキスト・ボタンのみ */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-foreground">{t("profile.editTitle")}</span>
        <button onClick={save} disabled={saving} className="text-base font-bold text-primary disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : t("common.done")}
        </button>
      </header>

      {/* Avatar */}
      <div className="flex justify-center py-6">
        <label className="relative cursor-pointer">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold">
              {(form.display_name || "?").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          {uploading && <span className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></span>}
        </label>
      </div>

      {/* Profile section */}
      <div className="px-4">
        {/* 名前 */}
        <div className="py-3 border-b border-border">
          <label className="text-xs text-muted-foreground">{t("profile.name")}</label>
          <input
            value={form.display_name}
            onChange={(e) => set("display_name", e.target.value)}
            className="w-full bg-transparent text-sm mt-1 outline-none"
            placeholder={t("profile.namePlaceholder")}
          />
        </div>
        {/* 自己紹介 */}
        <div className="py-3 border-b border-border">
          <label className="text-xs text-muted-foreground">{t("common.bio")}</label>
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            className="w-full bg-transparent text-sm mt-1 outline-none resize-none"
            placeholder={t("profile.bioPlaceholder")}
          />
        </div>
        {/* 目的 */}
        <button onClick={() => setShowPurposeSelect(true)} className="w-full flex items-center justify-between py-3.5 border-b border-border">
          <span className="text-sm">{t("common.purpose")}</span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {form.training_purpose ? purposeLbl(form.training_purpose) : ""}
            <ChevronRight className="w-4 h-4" />
          </span>
        </button>
        {/* レベル */}
        <button
          onClick={() => setShowLevelSelect(true)}
          className="w-full flex items-center justify-between py-3.5 border-b border-border"
        >
          <span className="text-sm">{t("profile.level")}</span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {form.level ? levelLabel(form.level) : ""}
            <ChevronRight className="w-4 h-4" />
          </span>
        </button>
        {/* メイン言語 */}
        <button onClick={() => setShowLangSelect(true)} className="w-full flex items-center justify-between py-3.5 border-b border-border">
          <span className="text-sm">{t("profile.mainLanguage")}</span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {form.main_language ? langLabel(form.main_language) : ""}
            <ChevronRight className="w-4 h-4" />
          </span>
        </button>
      </div>

      {/* Basic info section */}
      <div className="px-4 mt-6">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t("profile.basicInfo")}</div>
        {/* 性別 */}
        <div className="py-3 border-b border-border">
          <label className="text-xs text-muted-foreground">{t("common.gender")} *</label>
          <select
            value={form.gender}
            onChange={(e) => { set("gender", e.target.value); setGenderError(false); }}
            className="w-full bg-transparent text-sm mt-1 outline-none"
          >
            <option value="">{t("common.genderUndisclosed")}</option>
            <option value="male">{t("common.genderMale")}</option>
            <option value="female">{t("common.genderFemale")}</option>
            <option value="undisclosed">{t("common.genderUndisclosed")}</option>
          </select>
          {genderError && <p className="text-xs text-destructive mt-1">{t("profile.genderRequired")}</p>}
        </div>
        {/* 生年月日 */}
        <div className="py-3 border-b border-border">
          <label className="text-xs text-muted-foreground">{t("profile.birthdate")}</label>
          <input
            type="date"
            value={form.birthdate}
            onChange={(e) => set("birthdate", e.target.value)}
            className="w-full bg-transparent text-sm mt-1 outline-none"
          />
        </div>
      </div>

      {/* Overlays */}
      {showLangSelect && (
        <LanguageSelectPage
          selected={form.main_language}
          onClose={() => setShowLangSelect(false)}
          onConfirm={(code) => { if (code) set("main_language", code); setShowLangSelect(false); }}
        />
      )}
      {showLevelSelect && (
        <LevelSelectPage
          title={t("profile.level")}
          items={LEVELS.map((l) => ({ key: l.key, label: t("level." + l.key) }))}
          selected={form.level}
          lockedUntil={checkLevelLocked() ? getLevelUnlockDate() : null}
          onClose={() => setShowLevelSelect(false)}
          onConfirm={(key) => {
            if (checkLevelLocked()) { setLevelLocked(true); return; }
            if (key) {
              set("level", key);
              set("level_updated_at", new Date().toISOString());
            }
            setShowLevelSelect(false);
          }}
        />
      )}
      {showPurposeSelect && (
        <OptionSelectPage
          title={t("common.purpose")}
          items={TRAINING_PURPOSES.map((p) => ({ key: p.key, label: purposeLabel(lang, p.key) }))}
          selected={form.training_purpose}
          onClose={() => setShowPurposeSelect(false)}
          onConfirm={(key) => { if (key) set("training_purpose", key); setShowPurposeSelect(false); }}
        />
      )}
      {levelLocked && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center px-8" onClick={() => setLevelLocked(false)}>
          <div className="bg-card rounded-xl p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-foreground">{t("profile.levelLocked")}</p>
            <button onClick={() => setLevelLocked(false)} className="mt-4 text-sm font-bold text-primary">{t("common.close")}</button>
          </div>
        </div>
      )}
    </div>
  );
}