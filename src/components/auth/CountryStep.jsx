import React, { useState, useMemo, useRef, useCallback } from "react";
import { ArrowLeft, ChevronRight, Check, Search } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/useScrollLock";
import { COUNTRY_CODES } from "@/lib/countries";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function CountryFlag({ code, className }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
      alt=""
      className={className}
      loading="lazy"
      draggable={false}
    />
  );
}

// 登録フロー内の国・地域選択ステップ
// プログレスバーは2セグメント(1番目ハイライト)
// 英語名のアルファベット順で全ての国・地域を表示
export default function CountryStep({ onBack, onContinue, loading, initialCountry = "", userLang = "ja" }) {
  const t = useT();
  useScrollLock();
  const [val, setVal] = useState(initialCountry);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState(initialCountry);
  const [query, setQuery] = useState("");
  const listRef = useRef(null);
  const sectionRefs = useRef({});

  // ユーザーのメイン言語での国名
  const nameInUserLang = useMemo(() => {
    try {
      const locale = userLang === "zh-TW" ? "zh-TW" : userLang;
      const dn = new Intl.DisplayNames([locale], { type: "region" });
      return (code) => dn.of(code) || code;
    } catch {
      return (code) => code;
    }
  }, [userLang]);

  // 英語名(ソート用 + サブ表示)
  const nameInEn = useMemo(() => {
    try {
      const dn = new Intl.DisplayNames(["en"], { type: "region" });
      return (code) => dn.of(code) || code;
    } catch {
      return (code) => code;
    }
  }, []);

  const sortedCountries = useMemo(() => {
    return COUNTRY_CODES.map((code) => ({
      code,
      name: nameInUserLang(code),
      enName: nameInEn(code),
    })).sort((a, b) => a.enName.localeCompare(b.enName));
  }, [nameInUserLang, nameInEn]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sortedCountries;
    const q = query.toLowerCase();
    return sortedCountries.filter(
      (c) => c.enName.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [sortedCountries, query]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const c of filtered) {
      const letter = c.enName[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    }
    return Object.keys(groups).sort().map((letter) => ({ letter, items: groups[letter] }));
  }, [filtered]);

  const lettersWithEntries = useMemo(() => new Set(grouped.map((g) => g.letter)), [grouped]);

  const scrollToLetter = useCallback((letter) => {
    const ref = sectionRefs.current[letter];
    if (ref && listRef.current) {
      const top = ref.getBoundingClientRect().top - listRef.current.getBoundingClientRect().top + listRef.current.scrollTop;
      listRef.current.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  function openPicker() {
    setDraft(val);
    setQuery("");
    setPickerOpen(true);
  }
  function confirmPicker() {
    setVal(draft);
    try { sessionStorage.setItem("beltva_country_draft", draft); } catch {}
    setPickerOpen(false);
  }

  const selectedCountry = useMemo(() => {
    if (!val) return null;
    return sortedCountries.find((c) => c.code === val) || null;
  }, [val, sortedCountries]);

  const canContinue = !!val && !loading;

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* ヘッダー: 戻る + 2セグメントプログレスバー(1番目ハイライト) */}
      <header className="flex items-center gap-3 px-4 pt-4 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 5 ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      {/* メイン */}
      <div className="flex-1 flex flex-col px-6 pt-10">
        <h2 className="text-xl font-bold text-foreground text-left">{t("auth.countryTitle")}</h2>

        <button
          onClick={openPicker}
          className="mt-8 w-full h-14 rounded-xl bg-card border border-border px-4 flex items-center gap-3 text-left"
        >
          {selectedCountry ? (
            <>
              <CountryFlag code={selectedCountry.code} className="w-7 h-5 object-cover rounded-[3px] shrink-0" />
              <span className="flex-1 text-base text-foreground">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="flex-1 text-base text-muted-foreground">{t("auth.countrySelect")}</span>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* 続けるボタン */}
      <div className="px-6 pb-10 pt-4 shrink-0">
        <button
          onClick={() => canContinue && onContinue(val)}
          disabled={!canContinue}
          className={`w-full h-12 rounded-full font-bold transition-colors ${
            canContinue ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
          }`}
        >
          {t("auth.continue")}
        </button>
      </div>

      {/* 全画面 国・地域選択リスト */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[90] bg-background flex flex-col overflow-hidden overscroll-none animate-[slideUp_0.25s_ease-out]">
          {/* ヘッダー */}
          <header className="flex items-center justify-between px-4 py-3 shrink-0">
            <button
              onClick={() => setPickerOpen(false)}
              className="p-2 -ml-2 text-foreground"
              aria-label={t("auth.back")}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-base font-bold text-foreground">{t("auth.countrySelectHeader")}</span>
            <button
              onClick={confirmPicker}
              disabled={!draft}
              className="px-4 py-1.5 -mr-1 text-sm font-bold text-primary-foreground bg-primary rounded-full disabled:opacity-40"
            >
              {t("auth.ok")}
            </button>
          </header>

          {/* 検索欄 */}
          <div className="px-4 pb-2 shrink-0">
            <div className="w-full h-10 rounded-full bg-card border border-border px-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("auth.countrySearch")}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* リスト + A-Z索引 */}
          <div className="flex-1 min-h-0 relative">
            <div ref={listRef} className="absolute inset-0 overflow-y-auto overscroll-contain pb-4">
              {grouped.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">—</div>
              ) : (
                <ul>
                  {grouped.map(({ letter, items }) => (
                    <li
                      key={letter}
                      ref={(el) => { sectionRefs.current[letter] = el; }}
                    >
                      <div className="pl-4 pr-10 py-1.5 text-xs font-bold text-muted-foreground">{letter}</div>
                      {items.map((c) => {
                        const active = draft === c.code;
                        return (
                          <button
                            key={c.code}
                            onClick={() => setDraft(c.code)}
                            className={`w-full flex items-center gap-3 pl-4 pr-10 py-2.5 text-left ${active ? "bg-primary/10" : ""}`}
                          >
                            <CountryFlag code={c.code} className="w-6 h-4 object-cover rounded-[2px] shrink-0" />
                            <span className="flex-1 min-w-0">
                              <span className={`block text-sm font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>
                                {c.name}
                              </span>
                              <span className="block text-xs text-muted-foreground leading-tight mt-0.5">
                                {c.enName}
                              </span>
                            </span>
                            {active && <Check className="w-5 h-5 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* A-Z索引 */}
            <div className="absolute right-1 top-0 bottom-0 flex flex-col items-center justify-center gap-px select-none z-10">
              {ALPHABET.map((l) => (
                <button
                  key={l}
                  onClick={() => scrollToLetter(l)}
                  className={`text-[9px] font-medium leading-none px-1 py-px ${
                    lettersWithEntries.has(l) ? "text-muted-foreground" : "text-muted-foreground/30"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}