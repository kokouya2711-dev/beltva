import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { HOBBY_CATEGORIES, ALL_HOBBIES } from "@/lib/hobbies";
import { useT } from "@/lib/i18n";

export default function HobbyEditor({ value = [], onChange, max = 5 }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const selected = value;
  const filtered = query ? ALL_HOBBIES.filter((h) => h.toLowerCase().includes(query.toLowerCase()) && !selected.includes(h)) : [];
  function add(h) { if (selected.length >= max || selected.includes(h)) return; onChange([...selected, h]); }
  function remove(h) { onChange(selected.filter((x) => x !== h)); }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {selected.length === 0 && <span className="text-xs text-muted-foreground">未選択</span>}
        {selected.map((h) => (
          <span key={h} className="flex items-center gap-1 text-xs bg-primary/15 text-primary border border-primary/30 rounded-full px-2.5 py-1">{h}<button type="button" onClick={() => remove(h)}><X className="w-3 h-3" /></button></span>
        ))}
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("common.search")} className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
      </div>
      {query ? (
        <div className="flex flex-wrap gap-1.5">
          {filtered.length === 0 ? <span className="text-xs text-muted-foreground">見つかりません</span> :
            filtered.map((h) => <button key={h} type="button" onClick={() => { add(h); setQuery(""); }} className="text-xs bg-secondary/60 border border-border rounded-full px-2.5 py-1 hover:border-primary">{h}</button>)}
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {HOBBY_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("hobby_cat_" + cat.key)}</div>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((h) => selected.includes(h) ? null : <button key={h} type="button" onClick={() => add(h)} className="text-xs bg-secondary/60 border border-border rounded-full px-2.5 py-1 hover:border-primary">{h}</button>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}