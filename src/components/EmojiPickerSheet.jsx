import React, { useState, useRef, useMemo, useEffect } from "react";
import { Search, X, Clock, Smile, Leaf, Coffee, Trophy, Plane, Lightbulb, Hash, Flag } from "lucide-react";
import { EMOJI_CATEGORIES, EMOJIS, getFrequent, addFrequent } from "@/lib/emojiData";
import { useI18n } from "@/lib/i18n";

const CAT_ICONS = { Clock, Smile, Leaf, Coffee, Trophy, Plane, Lightbulb, Hash, Flag };

const CAT_TABS = [
  { id: "home", icon: "Clock", label: { ja: "よく使う", en: "Frequent" } },
  ...EMOJI_CATEGORIES,
];

export default function EmojiPickerSheet({ onPick, onClose }) {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("home");
  const [dragY, setDragY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [frequent, setFrequent] = useState(() => getFrequent(28));
  const touchStart = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return EMOJIS.filter(
      (e) => e.n.toLowerCase().includes(q) || e.kw.toLowerCase().includes(q) || e.c.includes(q)
    );
  }, [query]);

  function handlePick(emoji) {
    addFrequent(emoji);
    onPick(emoji);
  }

  function onTouchStart(e) {
    const tch = e.touches[0];
    touchStart.current = { y: tch.clientY };
  }
  function onTouchMove(e) {
    if (!touchStart.current) return;
    const tch = e.touches[0];
    const dy = tch.clientY - touchStart.current.y;
    if (dy > 0) setDragY(Math.min(dy, 400));
  }
  function onTouchEnd() {
    if (dragY > 90) {
      onClose();
    }
    setDragY(0);
    touchStart.current = null;
  }

  const labelFor = (cat) => cat.label[lang] || cat.label.en;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl mx-auto bg-card border-t border-border rounded-t-2xl flex flex-col h-[62vh] overflow-hidden"
        style={{
          transform: `translateY(${mounted ? dragY : 100}%)`,
          transition: dragY ? "none" : "transform 280ms ease-out",
        }}
      >
        {/* top region: drag handle + search (swipe target) */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="shrink-0"
        >
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/40" />
          </div>
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 bg-secondary/60 rounded-full px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.search")}
                inputMode="search"
                enterKeyHint="search"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-0.5 shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* scroll area */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 no-scrollbar">
          {filtered ? (
            filtered.length ? (
              <EmojiGrid emojis={filtered.map((e) => e.c)} onPick={handlePick} />
            ) : (
              <div className="text-center text-sm text-muted-foreground py-10">{t("common.noResults") || "—"}</div>
            )
          ) : activeCat === "home" ? (
            <>
              <Section title={CAT_TABS[0].label[lang] || CAT_TABS[0].label.en} />
              <EmojiGrid emojis={frequent} onPick={handlePick} />
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.id} id={`cat-${cat.id}`}>
                  <Section title={labelFor(cat)} />
                  <EmojiGrid
                    emojis={EMOJIS.filter((e) => e.cat === cat.id).map((e) => e.c)}
                    onPick={handlePick}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <Section title={labelFor(EMOJI_CATEGORIES.find((c) => c.id === activeCat))} />
              <EmojiGrid
                emojis={EMOJIS.filter((e) => e.cat === activeCat).map((e) => e.c)}
                onPick={handlePick}
              />
            </>
          )}
        </div>

        {/* category bar */}
        <div className="shrink-0 border-t border-border flex items-center justify-around py-1.5 px-1 bg-card">
          {CAT_TABS.map((cat) => {
            const Icon = CAT_ICONS[cat.icon];
            const active = activeCat === cat.id && !query;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCat(cat.id);
                  setQuery("");
                  inputRef.current?.blur();
                }}
                className={`p-2 rounded-lg transition ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Section({ title }) {
  return <div className="text-xs font-semibold text-muted-foreground mt-3 mb-1 px-1">{title}</div>;
}

function EmojiGrid({ emojis, onPick }) {
  return (
    <div className="grid grid-cols-7 gap-0.5">
      {emojis.map((e, i) => (
        <button
          key={e + i}
          type="button"
          onClick={() => onPick(e)}
          className="h-11 flex items-center justify-center rounded-lg hover:bg-secondary/60 active:scale-90 transition text-2xl leading-none"
        >
          {e}
        </button>
      ))}
    </div>
  );
}