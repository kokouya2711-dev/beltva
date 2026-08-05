import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Plus, Check } from "lucide-react";
import {
  HOBBY_CATEGORIES,
  HOBBY_LABELS,
  LANG_ORDER,
  makePresetHobby,
  makeCustomHobby,
  isPresetHobby,
  hobbyKey,
  hobbyLabel,
  hobbyCategoryLabel,
  searchHobbyKeys
} from "@/lib/hobbies";
import { useT, useI18n } from "@/lib/i18n";

export default function HobbyEditor({ value = [], onChange, max = 10 }) {
  const t = useT();
  const { lang } = useI18n();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const selected = value;
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Search results across all languages
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchHobbyKeys(query, lang).filter((key) => !selectedSet.has(makePresetHobby(key)));
  }, [query, lang, selectedSet]);

  // Check if the query matches any preset exactly (to avoid offering duplicate custom)
  const exactMatch = useMemo(() => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return searchHobbyKeys(query, lang).some((key) =>
      (HOBBY_LABELS[key] || []).some((l) => l.toLowerCase() === q)
    );
  }, [query, lang]);

  const canAddCustom = query.trim().length > 0 && !exactMatch && !selectedSet.has(makeCustomHobby(query));

  function addPreset(key) {
    if (selected.length >= max || selectedSet.has(makePresetHobby(key))) return;
    onChange([...selected, makePresetHobby(key)]);
  }
  function addCustom() {
    const text = query.trim();
    if (!text || selected.length >= max || selectedSet.has(makeCustomHobby(text))) return;
    onChange([...selected, makeCustomHobby(text)]);
    setQuery("");
  }
  function remove(h) {
    onChange(selected.filter((x) => x !== h));
  }

  return (
    <div className="space-y-3">
      {/* Selected hobbies */}
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {selected.length === 0 && <span className="text-xs text-muted-foreground">{t("hobby.noneSelected")}</span>}
        {selected.map((h) => (
          <span key={h} className="flex items-center gap-1 text-xs bg-primary/15 text-primary border border-primary/30 rounded-full px-2.5 py-1">
            {hobbyLabel(h, lang)}
            <button type="button" onClick={() => remove(h)} className="hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {selected.length >= max && (
          <span className="text-[10px] text-muted-foreground self-center">{t("hobby.maxReached").replace("{n}", max)}</span>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("hobby.searchPlaceholder")}
          className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {query.trim() ? (
        /* Search results mode */
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {searchResults.length === 0 && !canAddCustom && (
              <span className="text-xs text-muted-foreground">{t("hobby.noResults")}</span>
            )}
            {searchResults.slice(0, 30).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => addPreset(key)}
                disabled={selected.length >= max}
                className="text-xs bg-secondary/60 border border-border rounded-full px-2.5 py-1 hover:border-primary disabled:opacity-40 transition"
              >
                {hobbyLabel(makePresetHobby(key), lang)}
              </button>
            ))}
          </div>
          {canAddCustom && (
            <button
              type="button"
              onClick={addCustom}
              disabled={selected.length >= max}
              className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/30 rounded-full px-2.5 py-1 hover:bg-primary/20 disabled:opacity-40 transition"
            >
              <Plus className="w-3 h-3" /> {t("hobby.addCustom").replace("{text}", query.trim())}
            </button>
          )}
        </div>
      ) : (
        /* Category browse mode */
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 no-scrollbar">
          {HOBBY_CATEGORIES.map((cat) => {
            const available = cat.items.filter((key) => !selectedSet.has(makePresetHobby(key)));
            if (available.length === 0) return null;
            return (
              <div key={cat.key}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{hobbyCategoryLabel(cat.key, lang)}</div>
                <div className="flex flex-wrap gap-1.5">
                  {available.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => addPreset(key)}
                      disabled={selected.length >= max}
                      className="text-xs bg-secondary/60 border border-border rounded-full px-2.5 py-1 hover:border-primary disabled:opacity-40 transition"
                    >
                      {hobbyLabel(makePresetHobby(key), lang)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}