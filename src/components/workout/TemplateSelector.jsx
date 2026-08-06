import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, FileText, Loader2, Trash2, Pencil } from "lucide-react";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function TemplateSelector({ onSelect, onClose }) {
  const tWorkout = useTWorkout();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const t = await base44.entities.WorkoutTemplate.list("-created_date", 50).catch(() => []);
    setTemplates(t);
    setLoading(false);
  }

  async function deleteTemplate(id) {
    if (!confirm("このテンプレートを削除しますか？")) return;
    await base44.entities.WorkoutTemplate.delete(id).catch(() => {});
    setTemplates(prev => prev.filter(t => t.id !== id));
  }

  async function renameTemplate(tpl) {
    const name = prompt("テンプレート名", tpl.name);
    if (!name || name === tpl.name) return;
    await base44.entities.WorkoutTemplate.update(tpl.id, { name }).catch(() => {});
    setTemplates(prev => prev.map(t => t.id === tpl.id ? { ...t, name } : t));
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">テンプレートを選択</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : templates.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">テンプレートがありません</div>
        ) : (
          <div className="space-y-2">
            {templates.map(tpl => {
              const exs = JSON.parse(tpl.exercises || "[]");
              return (
                <div key={tpl.id} className="flex items-center gap-2">
                  <button onClick={() => onSelect(tpl)} className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{tpl.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{exs.map(e => tWorkout(e.workout_type)).join(" · ") || "種目なし"}</div>
                    </div>
                  </button>
                  <button onClick={() => renameTemplate(tpl)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteTemplate(tpl.id)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}