import React, { useState, useEffect, useCallback } from "react";
import { Bug, X, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useI18n, LANGS } from "@/lib/i18n";

// Words that are intentionally English/brand in all languages
const ALLOWED_EN = new Set([
  "BELTVA", "TRAINING", "NOW", "PR", "DM", "ID", "URL", "API", "GPS", "WiFi",
  "Push", "Live", "Online", "Offline", "Cardio", "Set", "Sets", "Reps", "Rep",
  "kg", "km", "cm", "m", "h", "min", "sec", "Push", "Day", "Push Day"
]);

function hasJapanese(s) { return /[\u3040-\u30ff\u4e00-\u9fff\u3400-\u4dbf]/.test(s); }
function hasKorean(s) { return /[\uac00-\ud7af]/.test(s); }
function hasThai(s) { return /[\u0e00-\u0e7f]/.test(s); }
function hasArabic(s) { return /[\u0600-\u06ff]/.test(s); }
function hasCyrillic(s) { return /[\u0400-\u04ff]/.test(s); }
function hasLatin(s) { return /[A-Za-z]/.test(s); }

// Looks like a raw i18n key (e.g. "nav.home", "common.save")
function looksLikeKey(s) {
  const trimmed = s.trim();
  if (trimmed.length < 3 || trimmed.length > 60) return false;
  // contains a dot and only lowercase/underscore words
  return /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_.]*$/i.test(trimmed);
}

// Detect script of a string, returns 'ja'|'ko'|'th'|'ar'|'ru'|'zh'|'latin'|'mixed'
function detectScript(s) {
  const ja = hasJapanese(s);
  const ko = hasKorean(s);
  const th = hasThai(s);
  const ar = hasArabic(s);
  const ru = hasCyrillic(s);
  const lat = hasLatin(s);
  const scripts = [ja, ko, th, ar, ru, lat].filter(Boolean).length;
  if (scripts > 1) return "mixed";
  if (ja) return "ja";
  if (ko) return "ko";
  if (th) return "th";
  if (ar) return "ar";
  if (ru) return "ru";
  if (lat) return "latin";
  return "other";
}

// Expected script for a language code
function expectedScript(lang) {
  if (lang === "ja") return "ja";
  if (lang === "ko") return "ko";
  if (lang === "th") return "th";
  if (lang === "ar") return "ar";
  if (lang === "ru") return "ru";
  if (lang === "zh" || lang === "zh-TW") return "zh";
  return "latin";
}

// Extract meaningful words from text (length >= 2, alpha only)
function extractWords(s) {
  return (s.match(/[A-Za-z]{2,}/g) || []).filter(w => !ALLOWED_EN.has(w));
}

function collectTextNodes(root) {
  const results = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      // Skip script/style/code
      const tag = parent.tagName;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(tag)) return NodeFilter.FILTER_REJECT;
      // Skip elements not visible
      const style = window.getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return NodeFilter.FILTER_REJECT;
      const text = node.nodeValue;
      if (!text || !text.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.nodeValue.trim();
    if (!text) continue;
    // Get a short xpath-like locator
    let el = node.parentElement;
    let path = "";
    let cur = el;
    let depth = 0;
    while (cur && cur !== root && depth < 4) {
      let part = cur.tagName.toLowerCase();
      if (cur.id) part += `#${cur.id}`;
      const cls = cur.className && typeof cur.className === "string" ? cur.className.split(" ").filter(Boolean).slice(0, 2).join(".") : "";
      if (cls) part += `.${cls}`;
      path = path ? `${part} > ${path}` : part;
      cur = cur.parentElement;
      depth++;
    }
    results.push({ text, path, el });
  }
  return results;
}

function scanForIssues(lang) {
  const root = document.body;
  const nodes = collectTextNodes(root);
  const issues = [];
  const expected = expectedScript(lang);

  for (const { text, path } of nodes) {
    // 1. Raw key leak
    if (looksLikeKey(text)) {
      issues.push({ type: "raw_key", text, path, severity: "high" });
      continue;
    }
    // 2. Script mismatch
    const script = detectScript(text);
    if (script === "mixed") {
      issues.push({ type: "mixed_script", text, path, severity: "high" });
      continue;
    }
    if (expected === "ja") {
      // In Japanese, Latin words (except allowed) are suspicious
      if (script === "latin") {
        const words = extractWords(text);
        if (words.length > 0) {
          issues.push({ type: "latin_in_ja", text, path, severity: "medium", words });
        }
      }
    } else if (expected === "latin") {
      // In Latin languages, Japanese/Korean/Thai/Arabic/Cyrillic chars are suspicious
      if (script === "ja" || script === "ko" || script === "th" || script === "ar" || script === "ru") {
        issues.push({ type: `cjk_in_${lang}`, text, path, severity: "high" });
      }
    } else {
      // For zh, ko, th, ar, ru — check for unexpected scripts
      if (script !== "other" && script !== expected && script !== "latin") {
        // Latin is OK as loan words in most, but pure CJK in non-CJK lang is bad
        if (script !== "latin") {
          issues.push({ type: `wrong_script_${script}_in_${lang}`, text, path, severity: "high" });
        }
      }
    }
  }
  return issues;
}

export default function TranslationDebugOverlay() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState({});

  // Toggle via keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    function handler(e) {
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setOpen(v => !v);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const runScan = useCallback(() => {
    setScanning(true);
    // Defer to allow UI update
    setTimeout(() => {
      const found = scanForIssues(lang);
      setIssues(found);
      setScanning(false);
      setPanelOpen(true);
    }, 50);
  }, [lang]);

  // Auto-scan when language changes and overlay is open
  useEffect(() => {
    if (open && panelOpen) runScan();
  }, [lang, open, panelOpen, runScan]);

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setPanelOpen(true); runScan(); }}
        className="fixed bottom-20 right-3 z-[200] w-10 h-10 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg md:bottom-4"
        title="翻訳デバッグ (Ctrl+Shift+D)"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  const byType = {};
  issues.forEach(i => { byType[i.type] = (byType[i.type] || 0) + 1; });

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setPanelOpen(v => !v)}
        className="fixed bottom-20 right-3 z-[200] w-10 h-10 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg md:bottom-4"
        title="翻訳デバッグ"
      >
        <Bug className="w-5 h-5" />
      </button>

      {panelOpen && (
        <div className="fixed bottom-32 right-3 z-[200] w-[92vw] max-w-md max-h-[70vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl md:bottom-14 md:right-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-destructive" />
              <span className="font-bold text-sm">翻訳デバッグ</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{lang}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={runScan} disabled={scanning} className="p-1.5 rounded-lg hover:bg-secondary">
                <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-4 py-2 border-b border-border shrink-0 text-xs text-muted-foreground">
            検出: {issues.length}件
            {Object.keys(byType).length > 0 && (
              <span className="ml-2">
                {Object.entries(byType).map(([t, c]) => (
                  <span key={t} className="ml-1.5 px-1.5 py-0.5 rounded bg-secondary/60">{t}: {c}</span>
                ))}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {issues.length === 0 && !scanning && (
              <div className="text-center text-sm text-muted-foreground py-8">問題なし ✅</div>
            )}
            {scanning && (
              <div className="text-center text-sm text-muted-foreground py-8">スキャン中…</div>
            )}
            {issues.map((issue, i) => {
              const key = `${issue.path}-${i}`;
              const expanded = expandedPaths[key];
              return (
                <div key={i} className="rounded-lg border border-border p-2 text-xs">
                  <button
                    onClick={() => setExpandedPaths(p => ({ ...p, [key]: !p[key] }))}
                    className="flex items-start gap-1.5 w-full text-left"
                  >
                    {expanded ? <ChevronDown className="w-3 h-3 mt-0.5 shrink-0" /> : <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          issue.severity === "high" ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-500"
                        }`}>{issue.type}</span>
                      </div>
                      <div className="font-medium truncate" title={issue.text}>{issue.text}</div>
                    </div>
                  </button>
                  {expanded && (
                    <div className="mt-1.5 pl-4 text-muted-foreground break-all">
                      <div className="text-[10px] font-mono">{issue.path}</div>
                      {issue.words && <div className="mt-1">英単語: {issue.words.join(", ")}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 border-t border-border shrink-0 text-[10px] text-muted-foreground">
            言語切替で自動スキャン。Ctrl+Shift+D で開閉。
          </div>
        </div>
      )}
    </>
  );
}