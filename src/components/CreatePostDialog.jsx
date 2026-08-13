import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import { Image } from "@/components/ui/image";
import { POST_CATEGORIES, CATEGORY_STYLE } from "@/lib/community";
import WorkoutSelect from "@/components/WorkoutSelect";
import { useT } from "@/lib/i18n";
import { useTCategory } from "@/lib/i18nHelpers";

const POST_MODE_KEY = "beltva:post_mode";

export default function CreatePostDialog({ onClose, onSaved }) {
  const t = useT();
  const tCat = useTCategory();
  const fileRef = useRef(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("シェア");
  const [workoutType, setWorkoutType] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(() => localStorage.getItem(POST_MODE_KEY) === "anonymous");
  const [submitting, setSubmitting] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMediaUrl(file_url);
    } catch {}
    setUploading(false);
  }

  function selectMode(anon) {
    setIsAnonymous(anon);
    try { localStorage.setItem(POST_MODE_KEY, anon ? "anonymous" : "public"); } catch {}
  }

  async function save() {
    if (!content.trim()) return;
    setSubmitting(true);
    await base44.entities.Post.create({
      content: content.trim(),
      category,
      workout_type: workoutType || undefined,
      is_anonymous: isAnonymous,
      media_url: mediaUrl || undefined,
      likes: 0,
      comments_count: 0
    });
    setSubmitting(false);
    if (onSaved) onSaved();
    onClose();
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="font-bold text-lg">{t("post.createTitle")}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.category")}</label>
          <div className="grid grid-cols-4 gap-2 mt-1.5">
            {POST_CATEGORIES.map((c) => {
              const s = CATEGORY_STYLE[c];
              return (
                <button key={c} onClick={() => setCategory(c)} className={`text-xs px-2 py-2 rounded-lg border transition ${category === c ? `${s.bg} ${s.color} ${s.border}` : "border-border text-muted-foreground"}`}>{tCat(c)}</button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.body")}</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder={t("post.bodyPlaceholder")} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.media")}</label>
          {mediaUrl ? (
            <div className="relative mt-1.5 rounded-lg overflow-hidden">
              {mediaUrl.match(/\.(mp4|mov|webm|avi)$/i) ? (
                <video src={mediaUrl} controls className="w-full max-h-48 object-cover" />
              ) : (
                <Image src={mediaUrl} className="w-full max-h-48" fittingType="fill" />
              )}
              <button onClick={() => setMediaUrl("")} className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-1.5 w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              {uploading ? t("post.uploading") : t("post.addMedia")}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.bodyPart")}</label>
          <div className="mt-1.5">
            <WorkoutSelect value={workoutType} onChange={setWorkoutType} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.postMode")}</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <button type="button" onClick={() => selectMode(false)} className={`text-xs px-2 py-2 rounded-lg border transition ${!isAnonymous ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground"}`}>{t("post.public")}</button>
            <button type="button" onClick={() => selectMode(true)} className={`text-xs px-2 py-2 rounded-lg border transition ${isAnonymous ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground"}`}>{t("post.anonymous")}</button>
          </div>
        </div>
        <button onClick={save} disabled={submitting || !content.trim()} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {t("post.submit")}
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 h-[100dvh]" onClick={onClose}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 shadow-2xl max-h-[70dvh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}