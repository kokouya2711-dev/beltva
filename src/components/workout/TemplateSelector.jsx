import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, FileText, Loader2, Trash2, Pencil, Layers } from "lucide-react";
import { useTWorkout } from "@/lib/i18nHelpers";
import { useT } from "@/lib/i18n";

export default function TemplateSelector({ onSelect, onSelectAll, onClose }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const items = await base44.entities.WorkoutTemplate.list("-created_date", 50).catch(() => []);
    setTemplates(items);
    setLoading(false);
  }

  async function deleteTemplate(id) {
    if (!confirm(t("tpl.deleteConfirm"))) return;
    await base44.entities.WorkoutTemplate.delete(id).catch(() => {});
    setTemplates(prev => prev.filter(tpl => tpl.id !== id));
  }

  async function renameTemplate(tpl) {
    const name = prompt(t("tpl.renamePrompt"), tpl.name);
    if (!name || name === tpl.name) return;
    await base44.entities.WorkoutTemplate.update(tpl.id, { name }).catch(() => {});
    setTemplates(prev => prev.map(item => item.id === tpl.id ? { ...item, name } : item));
  }

  const grouped = {};
  templates.forEach(tpl => {
    const cat = tpl.category?.trim() || t("tpl.uncategorized");
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tpl);
  });
  const groupedArray = Object.entries(grouped).map(([category, tpls]) => ({ category, templates: tpls }));

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">{t("tpl.select")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : templates.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">{t("tpl.empty")}</div>
        ) : (
          <div className="space-y-4">
            {groupedArray.map(({ category, templates: tpls }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{category}</div>
                  {tpls.length > 1 && onSelectAll && (
                    <button onClick={() => onSelectAll(tpls)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Layers className="w-3 h-3" /> {t("tpl.loadAll")}
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {tpls.map(tpl => {
                    const exs = JSON.parse(tpl.exercises || "[]");
                    return (
                      <div key={tpl.id} className="flex items-center gap-2">
                        <button onClick={() => onSelect(tpl)} className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{tpl.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{exs.map(e => tWorkout(e.workout_type)).join(" · ") || t("tpl.noExercises")}</div>
                          </div>
                        </button>
                        <button onClick={() => renameTemplate(tpl)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteTemplate(tpl.id)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}