import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Loader2 } from "lucide-react";
import { POST_CATEGORIES, CATEGORY_STYLE } from "@/lib/community";
import { WORKOUT_TYPES } from "@/lib/workouts";

export default function CreatePostDialog({ onClose, onSaved }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("シェア");
  const [workoutType, setWorkoutType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function save() {
    if (!content.trim()) return;
    setSubmitting(true);
    await base44.entities.Post.create({
      content: content.trim(),
      category,
      workout_type: workoutType || undefined,
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
          <h2 className="font-bold text-lg">タイムラインに投稿</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">カテゴリ</label>
          <div className="grid grid-cols-4 gap-2 mt-1.5">
            {POST_CATEGORIES.map((c) => {
              const s = CATEGORY_STYLE[c];
              return (
                <button key={c} onClick={() => setCategory(c)} className={`text-xs px-2 py-2 rounded-lg border transition ${category === c ? `${s.bg} ${s.color} ${s.border}` : "border-border text-muted-foreground"}`}>{c}</button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">本文</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="ベンチのフォームで悩んでます…アドバイスください！" className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">関連種目（任意）</label>
          <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm mt-1.5 outline-none focus:border-primary">
            <option value="">なし</option>
            {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={save} disabled={submitting || !content.trim()} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 投稿する
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}