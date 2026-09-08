import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Camera, ChevronRight, Loader2 } from "lucide-react";
import { TRAINING_PURPOSES } from "@/lib/hobbies";
import { useT, useI18n } from "@/lib/i18n";
import { purposeLabel } from "@/lib/i18nPurposeFilter";
import OptionSelectPage from "@/components/OptionSelectPage";
import LevelSelectPage from "@/components/LevelSelectPage";
import GenderSelectPage from "@/components/GenderSelectPage";
import BirthdateSelectPage from "@/components/BirthdateSelectPage";

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
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showPurposeSelect, setShowPurposeSelect] = useState(false);
  const [showGenderSelect, setShowGenderSelect] = useState(false);
  const [showBirthdateSelect, setShowBirthdateSelect] = useState(false);
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
        gender_change_count: u.gender_change_count || 0,
        birthdate: u.birthdate || "",
        birthdate_change_count: u.birthdate_change_count || 0,
        registered_birthdate: u.registered_birthdate || "",
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

  function genderLabel(v) { return v === "male" ? t("common.genderMale") : v === "female" ? t("common.genderFemale") : ""; }
  function birthdateLabel(v) {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d)) return v;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  async function applyGender(val) {
    const newCount = (form.gender_change_count || 0) + 1;
    set("gender", val);
    set("gender_change_count", newCount);
    setShowGenderSelect(false);
    await base44.auth.updateMe({ gender: val, gender_change_count: newCount });
  }

  async function applyBirthdate(val) {
    const newCount = (form.birthdate_change_count || 0) + 1;
    const regBd = form.registered_birthdate || form.birthdate || "";
    set("birthdate", val);
    set("birthdate_change_count", newCount);
    set("registered_birthdate", regBd);
    setShowBirthdateSelect(false);
    const age = calcAge(val);
    await base44.auth.updateMe({
      birthdate: val,
      birthdate_change_count: newCount,
      registered_birthdate: regBd,
      ...(age != null ? { age } : {}),
    });
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
        gender_change_count: form.gender_change_count,
        birthdate_change_count: form.birthdate_change_count,
        registered_birthdate: form.registered_birthdate,
        ...(age != null ? { age } : {}),
      });
      navigate(-1);
    } finally { setSaving(false); }
  }

  if (!me) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  const levelLabel = (key) => key ? t("level." + key) : "";
  const purposeLbl = (key) => key ? purposeLabel(lang, key) : "";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar — 帯なし、テキスト・ボタンのみ */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-lg font-extrabold text-foreground">{t("profile.editTitle")}</span>
        <button onClick={save} disabled={saving} className="text-base font-bold text-primary disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : t("common.done")}
        </button>
      </header>

      {/* Avatar */}
      <div className="flex justify-center py-8">
        <label className="relative cursor-pointer">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="avatar" className="w-28 h-28 rounded-full object-cover" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold">
              {(form.display_name || "?").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          {uploading && <span className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></span>}
        </label>
      </div>

      {/* Profile section */}
      <div className="px-4">
        {/* 名前 */}
        <div className="py-4 border-b border-border">
          <label className="text-sm text-muted-foreground">{t("profile.name")}</label>
          <input
            value={form.display_name}
            onChange={(e) => set("display_name", e.target.value)}
            className="w-full bg-transparent text-base mt-1.5 outline-none"
            placeholder={t("profile.namePlaceholder")}
          />
        </div>
        {/* 自己紹介 */}
        <div className="py-4 border-b border-border">
          <label className="text-sm text-muted-foreground">{t("common.bio")}</label>
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            className="w-full bg-transparent text-base mt-1.5 outline-none resize-none"
            placeholder={t("profile.bioPlaceholder")}
          />
        </div>
        {/* 目的 */}
        <button onClick={() => setShowPurposeSelect(true)} className="w-full flex items-center justify-between py-4 border-b border-border">
          <span className="text-base">{t("common.purpose")}</span>
          <span className="flex items-center gap-1.5 text-base text-muted-foreground">
            {form.training_purpose ? purposeLbl(form.training_purpose) : ""}
            <ChevronRight className="w-5 h-5" />
          </span>
        </button>
        {/* レベル */}
        <button
          onClick={() => setShowLevelSelect(true)}
          className="w-full flex items-center justify-between py-4 border-b border-border"
        >
          <span className="text-base">{t("profile.level")}</span>
          <span className="flex items-center gap-1.5 text-base text-muted-foreground">
            {form.level ? levelLabel(form.level) : ""}
            <ChevronRight className="w-5 h-5" />
          </span>
        </button>
      </div>

      {/* Basic info section */}
      <div className="px-4 mt-8">
        <div className="text-[13px] text-muted-foreground/80 uppercase tracking-wider mb-3">{t("profile.basicInfo")}</div>
        {/* 性別 */}
        <button
          type="button"
          onClick={() => { if ((form.gender_change_count || 0) < 1) { setGenderError(false); setShowGenderSelect(true); } }}
          className={`w-full flex items-center justify-between py-4 border-b border-border ${(form.gender_change_count || 0) >= 1 ? "opacity-60" : ""}`}
        >
          <span className="text-base">{t("common.gender")} *</span>
          <span className="flex items-center gap-1.5 text-base text-muted-foreground">
            {genderLabel(form.gender)}
            {(form.gender_change_count || 0) < 1 && <ChevronRight className="w-5 h-5" />}
          </span>
        </button>
        {genderError && <p className="text-xs text-destructive mt-1">{t("profile.genderRequired")}</p>}
        {/* 生年月日 */}
        <button
          type="button"
          onClick={() => { if ((form.birthdate_change_count || 0) < 1) setShowBirthdateSelect(true); }}
          className={`w-full flex items-center justify-between py-4 border-b border-border ${(form.birthdate_change_count || 0) >= 1 ? "opacity-60" : ""}`}
        >
          <span className="text-base">{t("profile.birthdate")}</span>
          <span className="flex items-center gap-1.5 text-base text-muted-foreground">
            {birthdateLabel(form.birthdate)}
            {(form.birthdate_change_count || 0) < 1 && <ChevronRight className="w-5 h-5" />}
          </span>
        </button>
      </div>

      {/* Overlays */}
      {showGenderSelect && (
        <GenderSelectPage
          selected={form.gender}
          onClose={() => setShowGenderSelect(false)}
          onConfirm={applyGender}
        />
      )}
      {showBirthdateSelect && (
        <BirthdateSelectPage
          selected={form.birthdate}
          registeredBirthdate={form.registered_birthdate}
          onClose={() => setShowBirthdateSelect(false)}
          onConfirm={applyBirthdate}
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