import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { POST_WORKOUT_CATEGORIES, ALL_POST_WORKOUTS } from "@/lib/postWorkouts";

export default function WorkoutSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? POST_WORKOUT_CATEGORIES.map((c) => ({
        ...c,
        items: c.items.filter((it) => it.toLowerCase().includes(q))
      })).filter((c) => c.items.length > 0)
    : POST_WORKOUT_CATEGORIES;

  const isCustom = value && !ALL_POST_WORKOUTS.includes(value);

  function pick(item) {
    onChange(item);
    setQuery("");
    setOpen(false);
  }

  function clear(e) {
    e.stopPropagation();
    onChange("");
    setQuery("");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 outline-none focus:border-primary"
      >
        <span className={value ? "text-foreground truncate" : "text-muted-foreground"}>
          {value || "なし"}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value ? (
            <span onClick={clear} className="p-0.5 rounded hover:bg-secondary">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </span>
          ) : null}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-xl shadow-2xl max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="種目を検索・自由入力"
                className="w-full bg-secondary/60 border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {isCustom && !q && (
              <button
                type="button"
                onClick={() => pick(value)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5 text-primary" /> {value}（カスタム）
              </button>
            )}
            {q && !ALL_POST_WORKOUTS.some((it) => it.toLowerCase() === q) && (
              <button
                type="button"
                onClick={() => pick(query.trim())}
                className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 flex items-center gap-2 border-b border-border"
              >
                <span className="text-xs">「{query.trim()}」を追加</span>
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">該当なし</div>
            ) : (
              filtered.map((c) => (
                <div key={c.label}>
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  {c.items.map((it) => (
                    <button
                      key={it}
                      type="button"
                      onClick={() => pick(it)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-secondary/60 flex items-center justify-between ${value === it ? "text-primary" : ""}`}
                    >
                      {it}
                      {value === it && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}