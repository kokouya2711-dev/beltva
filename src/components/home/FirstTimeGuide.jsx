import React, { useState, useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  { target: "record", title: "トレーニングを記録しよう" },
  { target: "timeline", title: "投稿を見て、交流しよう" },
  { target: "users", title: "一緒に続ける仲間を探そう" },
];

// 初回限定ガイド: 登録直後のホーム画面で3ステップの操作ガイドを表示
// localStorage で一度のみ表示。スキップ・完了後は次回ログイン時に非表示
export default function FirstTimeGuide() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  const isHome = location.pathname === "/";

  // 初回判定
  useEffect(() => {
    if (!isHome) return;
    if (localStorage.getItem("beltva_guide_shown") === "1") return;
    if (localStorage.getItem("beltva_show_guide") !== "1") return;
    const timer = setTimeout(() => setActive(true), 600);
    return () => clearTimeout(timer);
  }, [isHome]);

  // ステップ変更時にターゲット要素の位置を取得
  useLayoutEffect(() => {
    if (!active || !isHome) return;

    let cancelled = false;

    function captureRect() {
      // 複数要素(モバイル+デスクトップ)に同じdata-guideがある場合、
      // 表示されている方(visible)を選択
      const els = document.querySelectorAll(`[data-guide="${STEPS[step].target}"]`);
      let el = null;
      for (const e of els) {
        const r = e.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) { el = e; break; }
      }
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (cancelled) return;
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom });
    }

    if (step === 0 && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(captureRect, reduceMotion ? 0 : 350);
    } else {
      captureRect();
    }

    function onResize() { captureRect(); }
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [active, step, isHome, reduceMotion]);

  // スクロールロック
  useEffect(() => {
    if (!active || !isHome) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [active, isHome]);

  function finish() {
    localStorage.setItem("beltva_guide_shown", "1");
    localStorage.removeItem("beltva_show_guide");
    setActive(false);
  }

  if (!active || !isHome || !rect) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const targetCenterY = rect.top + rect.height / 2;
  const tooltipBelow = targetCenterY < window.innerHeight / 2;

  return (
    <div className="fixed inset-0 z-[150]">
      {/* スポットライト: ターゲットを囲むリング + 外側を暗転 */}
      <motion.div
        initial={false}
        animate={reduceMotion ? {} : { scale: [1, 1.04, 1] }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="fixed pointer-events-none rounded-2xl ring-4 ring-primary"
        style={{
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
        }}
      />

      {/* ツールチップ */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-[88%] max-w-sm z-[160]"
        style={
          tooltipBelow
            ? { top: rect.bottom + 28 }
            : { bottom: window.innerHeight - rect.top + 28 }
        }
      >
        <div className="bg-card border border-border rounded-2xl p-5 shadow-2xl">
          {/* ステップインジケーター */}
          <div className="flex items-center gap-1.5 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
              />
            ))}
          </div>

          <h3 className="text-lg font-bold text-foreground mb-5">{current.title}</h3>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={finish}
              className="text-sm text-muted-foreground px-4 py-2.5 font-medium active:opacity-60"
            >
              スキップ
            </button>
            <button
              onClick={() => (isLast ? finish() : setStep(step + 1))}
              className="px-7 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform"
            >
              {isLast ? "始める" : "次へ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}