import React, { useEffect, useRef } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

// Bottom-nav tab roots — switching between these is instant (no slide).
const TAB_ROOTS = new Set(["/", "/users", "/messages", "/timeline", "/me"]);
const isTabRoot = (p) => TAB_ROOTS.has(p);

// Full-screen routes that previously lived outside the layout (no sidebar / no bottom nav).
// Used by AppLayout to keep their appearance unchanged (no chrome) while still sliding.
const FULLSCREEN_PREFIXES = [
  "/report",
  "/privacy-policy",
  "/record-workout",
  "/delete-account",
  "/restore-account",
  "/logout",
  "/change-email",
];
export const isFullscreenRoute = (p) =>
  FULLSCREEN_PREFIXES.some((pre) => p === pre || p.startsWith(pre + "/"));

// --- Scroll memory: remember per-path scroll so back can restore it ---
const scrollMemory = new Map();
let activePath = null;
let scrollSaveInstalled = false;
function installScrollSave() {
  if (scrollSaveInstalled || typeof window === "undefined") return;
  scrollSaveInstalled = true;
  const save = () => {
    if (activePath != null) scrollMemory.set(activePath, Math.round(window.scrollY || 0));
  };
  window.addEventListener("scroll", save, { passive: true });
  window.addEventListener("pagehide", save);
}

export default function AnimatedOutlet() {
  const location = useLocation();
  const navType = useNavigationType();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  const firstRender = useRef(true);
  const prevPathRef = useRef(location.pathname);

  installScrollSave();

  const fromTab = isTabRoot(prevPathRef.current);
  const toTab = isTabRoot(location.pathname);
  const isTabSwitch = fromTab && toTab && prevPathRef.current !== location.pathname;
  const isBack = navType === "POP";

  useEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  // Scroll handling: restore on back, top on forward, hash scroll.
  useEffect(() => {
    activePath = location.pathname;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (isBack) {
      const y = scrollMemory.get(location.pathname);
      if (y != null) {
        const restore = () => window.scrollTo({ top: y, left: 0, behavior: "instant" });
        restore();
        requestAnimationFrame(restore);
        const t1 = setTimeout(restore, 80);
        const t2 = setTimeout(restore, 320);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
      return () => clearTimeout(t);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash, isBack]);

  // No AnimatePresence: the old screen unmounts instantly on route change.
  // Only the NEW screen gets a short enter animation.
  //   - Tab switch: instant (no movement, no fade flash).
  //   - Hierarchical forward: translateX(24px) -> 0, opacity 0.95 -> 1, 180ms ease-out.
  //   - Hierarchical back: translateX(-24px) -> 0, opacity 0.95 -> 1, 180ms ease-out.
  const animateEnter = !isTabSwitch && !firstRender.current && !reduced;
  const initial = animateEnter
    ? isBack
      ? { x: -24, opacity: 0.95 }
      : { x: 24, opacity: 0.95 }
    : false;

  return (
    <div className="relative bg-background" style={{ overflowX: "clip" }}>
      <motion.div
        key={location.pathname}
        initial={initial}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{ position: "relative", width: "100%", willChange: animateEnter ? "transform, opacity" : "auto" }}
      >
        {outlet}
      </motion.div>
    </div>
  );
}