import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Camera, Check } from "lucide-react";
import { COUNTRIES, flagEmoji } from "@/lib/profile";

const inputCls = "w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      setForm({
        display_name: u.display_name || "",
        bio: u.bio || "",
        country: u.country || "",
        fitness_goal: u.fitness_goal || "",
        training_history: u.training_history || "",
        height_cm: u.height_cm || "",
        weight_kg: u.weight_kg || "",
        height_public: !!u.height_public,
        weight_public: !!u.weight_public,
        specialty: u.specialty || "",
        avatar_url: u.avatar_url || ""
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

  async function save() {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        display_name: form.display_name,
        bio: form.bio,
        country: form.country,
        fitness_goal: form.fitness_goal,
        training_history: form.training_history,
        height_cm: Number(form.height_cm) || 0,
        weight_kg: Number(form.weight_kg) || 0,
        height_public: !!form.height_public,
        weight_public: !!form.weight_public,
        specialty: form.specialty,
        avatar_url: form.avatar_url
      });
      navigate(`/profile/${me.id}`);
    } finally { setSaving(false); }
  }

  if (!me) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> 戻る</button>
      <h1 className="text-2xl font-bold">プロフィール編集</h1>

      <div className="glass rounded-2xl border border-border p-4 flex items-center gap-4">
        {form.avatar_url ? (
          <img src={form.avatar_url} alt="avatar" className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-xs text-muted-foreground">なし</div>
        )}
        <label className="flex items-center gap-1.5 text-sm bg-secondary/60 border border-border px-3 py-2 rounded-lg cursor-pointer hover:border-primary">
          <Camera className="w-4 h-4" /> 画像を変更
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        </label>
      </div>

      <Field label="表示名（ユーザー名）"><input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} className={inputCls} placeholder="PULSE太郎" /></Field>
      <Field label="自己紹介"><textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} className={inputCls} placeholder="筋トレ歴3年。ベンチ100kg目指中！" /></Field>
      <Field label="国">
        <select value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls}>
          <option value="">選択してください</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{flagEmoji(c.code)} {c.name}</option>)}
        </select>
      </Field>
      <Field label="Fitness Goal"><input value={form.fitness_goal} onChange={(e) => set("fitness_goal", e.target.value)} className={inputCls} placeholder="ベンチプレス100kg" /></Field>
      <Field label="トレーニング歴"><input value={form.training_history} onChange={(e) => set("training_history", e.target.value)} className={inputCls} placeholder="3年" /></Field>
      <Field label="得意種目"><input value={form.specialty} onChange={(e) => set("specialty", e.target.value)} className={inputCls} placeholder="スクワット" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="身長(cm)"><input type="number" value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} className={inputCls} /></Field>
        <Field label="体重(kg)"><input type="number" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.height_public} onChange={(e) => set("height_public", e.target.checked)} className="accent-primary" /> 身長を公開</label>
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.weight_public} onChange={(e) => set("weight_public", e.target.checked)} className="accent-primary" /> 体重を公開</label>
      </div>

      <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 保存
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label><div className="mt-1.5">{children}</div></div>;
}