import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Camera, Check } from "lucide-react";
import { COUNTRIES, flagEmoji } from "@/lib/profile";
import { TRAINING_PURPOSES, parseHobbies } from "@/lib/hobbies";
import { useT, useI18n, LANGS } from "@/lib/i18n";
import HobbyEditor from "@/components/HobbyEditor";

const inputCls = "w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary";

export default function ProfileEdit() {
  const t = useT();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({});
  const [hobbies, setHobbies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      setForm({
        display_name: u.display_name || "",
        bio: u.bio || "",
        country: u.country || "",
        region: u.region || "",
        training_purpose: u.training_purpose || "",
        avatar_url: u.avatar_url || "",
        gender: u.gender || "",
        gender_public: u.gender_public === true,
        languages: parseLanguages(u.languages),
        age: u.age != null ? String(u.age) : ""
      });
      setHobbies(parseHobbies(u.hobbies));
    }).catch(() => navigate("/"));
  }, [navigate]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function parseLanguages(s) { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } }
  function toggleLang(code) {
    setForm((f) => {
      const has = (f.languages || []).includes(code);
      return { ...f, languages: has ? f.languages.filter((c) => c !== code) : [...(f.languages || []), code] };
    });
  }

  async function uploadAvatar(file) {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("avatar_url", file_url);
    } finally { setUploading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        display_name: form.display_name,
        bio: form.bio,
        country: form.country,
        region: form.region,
        training_purpose: form.training_purpose,
        avatar_url: form.avatar_url,
        hobbies: JSON.stringify(hobbies),
        gender: form.gender || undefined,
        gender_public: form.gender_public,
        languages: JSON.stringify(form.languages || []),
        age: form.age ? Number(form.age) : undefined
      });
      navigate(`/profile/${me.id}`);
    } finally { setSaving(false); }
  }

  if (!me) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-secondary/40"><ArrowLeft className="w-5 h-5" /></button>
      <h1 className="text-2xl font-bold">{t("profile.editTitle")}</h1>

      <div className="glass rounded-2xl border border-border p-4 flex items-center gap-4">
        {form.avatar_url ? (
          <img src={form.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">{t("profile.noAvatar")}</div>
        )}
        <label className="flex items-center gap-1.5 text-sm bg-secondary/60 border border-border px-3 py-2 rounded-lg cursor-pointer hover:border-primary">
          <Camera className="w-4 h-4" /> {t("profile.editAvatar")}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        </label>
      </div>

      <Field label={t("common.displayName")}><input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} className={inputCls} placeholder={t("profile.namePlaceholder")} /></Field>
      <Field label={t("common.bio")}><textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} className={inputCls} placeholder={t("profile.bioPlaceholder")} /></Field>
      <Field label={t("common.country")}>
        <select value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls}>
          <option value="">{t("common.selectCountry")}</option>
          {COUNTRIES.map((c) => {
            let name = c.name;
            try { name = new Intl.DisplayNames([lang], { type: "region" }).of(c.code) || c.name; } catch {}
            return <option key={c.code} value={c.code}>{flagEmoji(c.code)} {name}</option>;
          })}
        </select>
      </Field>
      <Field label={t("common.regionOptional")}>
        <input value={form.region} onChange={(e) => set("region", e.target.value)} className={inputCls} placeholder={t("common.regionPlaceholder")} />
      </Field>
      <Field label={t("common.purpose")}>
        <select value={form.training_purpose} onChange={(e) => set("training_purpose", e.target.value)} className={inputCls}>
          <option value="">{t("profile.purposePlaceholder")}</option>
          {TRAINING_PURPOSES.map((p) => <option key={p.key} value={p.key}>{t("purpose." + p.key)}</option>)}
        </select>
      </Field>
      <Field label={t("common.gender")}>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls + " flex-1 min-w-[140px]"}>
            <option value="">{t("common.genderUndisclosed")}</option>
            <option value="male">{t("common.genderMale")}</option>
            <option value="female">{t("common.genderFemale")}</option>
            <option value="undisclosed">{t("common.genderUndisclosed")}</option>
          </select>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={form.gender_public} onChange={(e) => set("gender_public", e.target.checked)} className="accent-primary" />
            {t("common.genderPublic")}
          </label>
        </div>
      </Field>

      <Field label={t("common.languages")}>
        <div className="flex flex-wrap gap-1.5">
          {LANGS.map((l) => {
            const active = (form.languages || []).includes(l.code);
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => toggleLang(l.code)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label={t("common.ageOptional")}>
        <input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} className={inputCls} placeholder={t("profile.agePlaceholder")} min="13" max="120" />
      </Field>

      <div className="glass rounded-2xl border border-border p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{t("profile.hobbiesMax10")}</div>
        <HobbyEditor value={hobbies} onChange={setHobbies} max={10} />
      </div>

      <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {t("common.save")}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label><div className="mt-1.5">{children}</div></div>;
}