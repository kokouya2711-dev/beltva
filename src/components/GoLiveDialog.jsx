import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Radio, Check, Zap, ClipboardList, Layers } from "lucide-react";
import { getGeolocation, DEFAULT_CENTER, fuzzCoords } from "@/lib/workouts";
import { useT } from "@/lib/i18n";

export default function GoLiveDialog({ onClose, onDetailedSelect, onQuickStart, onQuickStartCategory, onSimpleSelect }) {
  const t = useT();
  const [done, setDone] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    base44.entities.WorkoutTemplate.list("-created_date", 50).then(setTemplates).catch(() => {});
  }, []);

  const grouped = {};
  templates.forEach(tpl => {
    const cat = tpl.category?.trim();
    if (!cat) return;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tpl);
  });
  const categories = Object.keys(grouped);

  if (done) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-7 h-7 text-primary" /></div>
          <div className="font-semibold text-lg">{t("goLive.started")}</div>
          <div className="text-sm text-muted-foreground">{t("goLive.startedDesc")}</div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Radio className="w-4 h-4 text-primary-foreground" /></div>
          <h2 className="font-bold text-lg">{t("goLive.recordChoiceTitle")}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("goLive.recordChoiceDesc")}</p>
      {templates.length > 0 && onQuickStart && (
        <div className="mb-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" /> {t("goLive.quickStart")}
          </div>
          {categories.length > 0 && onQuickStartCategory && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => onQuickStartCategory(grouped[cat])}
                  className="shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition">
                  <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-sm font-semibold whitespace-nowrap">{cat}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {templates.map(tpl => (
              <button key={tpl.id} onClick={() => onQuickStart(tpl)}
                className="shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-sm font-semibold whitespace-nowrap">{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        <button onClick={() => onDetailedSelect ? onDetailedSelect() : onClose()} className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-left">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0"><ClipboardList className="w-5 h-5 text-primary" /></div>
          <div><div className="font-semibold text-sm">📝 {t("goLive.detailedRecord")}</div><div className="text-xs text-muted-foreground mt-0.5">{t("goLive.detailedRecordDesc")}</div></div>
        </button>
        <button onClick={onSimpleSelect} className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition text-left">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0"><Zap className="w-5 h-5 text-accent" /></div>
          <div><div className="font-semibold text-sm">⚡ {t("goLive.simpleRecord")}</div><div className="text-xs text-muted-foreground mt-0.5">{t("goLive.simpleRecordDesc")}</div></div>
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="w-full md:max-w-md bg-card border border-border rounded-t-2xl md:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}