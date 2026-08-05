import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Save } from "lucide-react";
import { POST_CATEGORIES, CATEGORY_STYLE } from "@/lib/community";
import WorkoutSelect from "@/components/WorkoutSelect";
import { useT } from "@/lib/i18n";
import { useTCategory } from "@/lib/i18nHelpers";

export default function EditPostDialog({ post, onClose, onSaved }) {
  const t = useT();
  const tCat = useTCategory();
  const [content, setContent] = useState(post.content || "");
  const [category, setCategory] = useState(post.category || "シェア");
  const [workoutType, setWorkoutType] = useState(post.workout_type || "");
  const [submitting, setSubmitting] = useState(false);

  async function save() {
    if (!content.trim()) return;
    setSubmitting(true);
    const updated = await base44.entities.Post.update(post.id, {
      content: content.trim(),
      category,
      workout_type: workoutType || undefined
    });
    setSubmitting(false);
    if (onSaved) onSaved(updated);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{t("post.editTitle")}</h2>
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
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("post.bodyPart")}</label>
            <div className="mt-1.5">
              <WorkoutSelect value={workoutType} onChange={setWorkoutType} />
            </div>
          </div>
          <button onClick={save} disabled={submitting || !content.trim()} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("post.save")}
          </button>
        </div>
      </div>
    </div>
  );
}