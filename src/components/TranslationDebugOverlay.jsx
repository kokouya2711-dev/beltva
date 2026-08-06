import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bug, X, RefreshCw, ChevronDown, ChevronRight, Eye, EyeOff, Languages, Key, AlertTriangle, CheckCircle } from "lucide-react";
import { useI18n, LANGS } from "@/lib/i18n";

// Dev-only: entire component renders nothing in production
const IS_DEV = import.meta.env && (import.meta.env.DEV || import.meta.env.MODE === "development");

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
  return /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_.]*$/i.test(trimmed);
}

// Detect script of a string
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
      const tag = parent.tagName;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(tag)) return NodeFilter.FILTER_REJECT;
      // Skip our own debug overlay
      if (parent.closest("[data-debug-overlay]")) return NodeFilter.FILTER_REJECT;
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

  for (const { text, path, el } of nodes) {
    if (looksLikeKey(text)) {
      issues.push({ type: "raw_key", text, path, severity: "high", el });
      continue;
    }
    const script = detectScript(text);
    if (script === "mixed") {
      issues.push({ type: "mixed_script", text, path, severity: "high", el });
      continue;
    }
    if (expected === "ja") {
      if (script === "latin") {
        const words = extractWords(text);
        if (words.length > 0) {
          issues.push({ type: "latin_in_ja", text, path, severity: "medium", words, el });
        }
      }
    } else if (expected === "latin") {
      if (script === "ja" || script === "ko" || script === "th" || script === "ar" || script === "ru") {
        issues.push({ type: `cjk_in_${lang}`, text, path, severity: "high", el });
      }
    } else {
      if (script !== "other" && script !== expected && script !== "latin") {
        if (script !== "latin") {
          issues.push({ type: `wrong_script_${script}_in_${lang}`, text, path, severity: "high", el });
        }
      }
    }
  }
  return issues;
}

export default function TranslationDebugOverlay() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState({});
  const [highlightMode, setHighlightMode] = useState(false);
  const [showLangSwitcher, setShowLangSwitcher] = useState(false);
  const prevHighlights = useRef([]);

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

  const clearHighlights = useCallback(() => {
    prevHighlights.current.forEach(({ el, outline, bg, label }) => {
      if (!el || !el.isConnected) return;
      el.style.outline = outline;
      el.style.background = bg;
      if (label && label.isConnected) label.remove();
    });
    prevHighlights.current = [];
  }, []);

  const applyHighlights = useCallback((issueList) => {
    clearHighlights();
    issueList.forEach((issue) => {
      if (!issue.el || !issue.el.isConnected) return;
      const prevOutline = issue.el.style.outline;
      const prevBg = issue.el.style.background;
      const color = issue.severity === "high" ? "2px solid hsl(0 84% 60%)" : "2px solid hsl(45 93% 47%)";
      issue.el.style.outline = color;
      issue.el.style.outlineOffset = "1px";
      issue.el.style.background = issue.severity === "high" ? "hsl(0 84% 60% / 0.12)" : "hsl(45 93% 47% / 0.12)";
      // Add a small label badge
      const label = document.createElement("div");
      label.setAttribute("data-debug-overlay", "true");
      label.style.cssText = `position:absolute;z-index:99999;font-size:9px;font-family:monospace;padding:1px 4px;border-radius:3px;pointer-events:none;color:white;background:${issue.severity === "high" ? "hsl(0 84% 60%)" : "hsl(45 93% 47%)"};white-space:nowrap;`;
      label.textContent = issue.type;
      const rect = issue.el.getBoundingClientRect();
      label.style.left = `${rect.left + window.scrollX}px`;
      label.style.top = `${rect.top + window.scrollY - 14}px`;
      document.body.appendChild(label);
      prevHighlights.current.push({ el: issue.el, outline: prevOutline, bg: prevBg, label });
    });
  }, [clearHighlights]);

  const runScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      const found = scanForIssues(lang);
      setIssues(found);
      setScanning(false);
      setPanelOpen(true);
      if (highlightMode) applyHighlights(found);
    }, 50);
  }, [lang, highlightMode, applyHighlights]);

  // Auto-scan when language changes and overlay is open
  useEffect(() => {
    if (open && panelOpen) runScan();
  }, [lang, open, panelOpen, runScan]);

  // Cleanup highlights on unmount or when highlight mode turns off
  useEffect(() => {
    if (!highlightMode) clearHighlights();
    return () => clearHighlights();
  }, [highlightMode, clearHighlights]);

  // Re-apply highlights when highlight mode toggles
  useEffect(() => {
    if (highlightMode && issues.length > 0) applyHighlights(issues);
    else if (!highlightMode) clearHighlights();
  }, [highlightMode, issues, applyHighlights, clearHighlights]);

  // Dev-only guard: render nothing in production (after all hooks)
  if (!IS_DEV) return null;

  if (!open) return null;

  const byType = {};
  issues.forEach(i => { byType[i.type] = (byType[i.type] || 0) + 1; });
  const highCount = issues.filter(i => i.severity === "high").length;
  const currentLangObj = LANGS.find(l => l.code === lang);

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setPanelOpen(v => !v)}
        className="fixed bottom-20 right-3 z-[9999] w-10 h-10 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg md:bottom-4 hover:scale-110 transition"
        title="翻訳デバッグ"
      >
        <Bug className="w-5 h-5" />
      </button>

      {panelOpen && (
        <div
          data-debug-overlay="true"
          className="fixed bottom-32 right-3 z-[9999] w-[92vw] max-w-md max-h-[75vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl md:bottom-14 md:right-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-destructive" />
              <span className="font-bold text-sm">翻訳デバッグ</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive font-mono">DEV</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={runScan} disabled={scanning} className="p-1.5 rounded-lg hover:bg-secondary" title="再スキャン">
                <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current language + switcher */}
          <div className="px-4 py-2.5 border-b border-border shrink-0">
            <button
              onClick={() => setShowLangSwitcher(v => !v)}
              className="flex items-center gap-2 w-full text-left"
            >
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold">現在の言語:</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono flex items-center gap-1">
                {currentLangObj?.flag} {lang}
              </span>
              {showLangSwitcher ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
            {showLangSwitcher && (
              <div className="mt-2 grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); }}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition ${lang === l.code ? "bg-primary text-primary-foreground" : "bg-secondary/60 hover:bg-secondary"}`}
                  >
                    <span>{l.flag}</span>
                    <span className="truncate">{l.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary + highlight toggle */}
          <div className="px-4 py-2 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                {issues.length === 0 && !scanning ? (
                  <><CheckCircle className="w-3.5 h-3.5 text-accent" /> 問題なし</>
                ) : (
                  <><AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> 検出: {issues.length}件 (高{highCount})</>
                )}
              </div>
              <button
                onClick={() => setHighlightMode(v => !v)}
                className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition ${highlightMode ? "bg-primary text-primary-foreground" : "bg-secondary/60 hover:bg-secondary"}`}
                title="画面上の問題箇所をハイライト"
              >
                {highlightMode ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {highlightMode ? "ハイライト中" : "ハイライト"}
              </button>
            </div>
            {Object.keys(byType).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(byType).map(([t, c]) => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/60 font-mono">{t}: {c}</span>
                ))}
              </div>
            )}
          </div>

          {/* Issue list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {issues.length === 0 && !scanning && (
              <div className="text-center text-sm text-muted-foreground py-8 flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-accent" />
                問題なし ✅
              </div>
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
                      <div className="text-[10px] font-mono flex items-start gap-1">
                        <Key className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                        <span>{issue.path}</span>
                      </div>
                      {issue.words && <div className="mt-1">英単語: {issue.words.join(", ")}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border shrink-0 text-[10px] text-muted-foreground">
            言語切替で自動スキャン · Ctrl+Shift+D で開閉 · 開発環境のみ表示
          </div>
        </div>
      )}
    </>
  );
}