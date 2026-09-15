import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Bottom-nav tab roots — switching between these uses a short fade, not a slide.
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

// Slide: forward = new enters from right, old exits left & dims.
// Back (POP) = previous enters from left (dimmed), current exits right.
const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? "100%" : "-20%", opacity: dir > 0 ? 1 : 0.6, zIndex: 20 }),
  animate: { x: 0, opacity: 1, zIndex: 20 },
  exit: (dir) => ({ x: dir > 0 ? "-20%" : "100%", opacity: dir > 0 ? 0.6 : 1, zIndex: 10 }),
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const SLIDE_EASE = [0.32, 0.72, 0, 1];

export default function AnimatedOutlet() {
  const location = useLocation();
  const navType = useNavigationType();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  const [isAnimating, setIsAnimating] = useState(false);
  const firstRender = useRef(true);
  const prevPathRef = useRef(location.pathname);

  installScrollSave();

  const fromTab = isTabRoot(prevPathRef.current);
  const toTab = isTabRoot(location.pathname);
  const isTabSwitch = fromTab && toTab && prevPathRef.current !== location.pathname;
  const useSlide = !isTabSwitch;
  const direction = navType === "POP" ? -1 : 1;

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
    if (navType === "POP") {
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
  }, [location.pathname, location.hash, navType]);

  // Animation in-progress flag (drives the pointer shield + duplicate-nav prevention).
  useEffect(() => {
    if (firstRender.current || reduced) return;
    setIsAnimating(true);
    const dur = useSlide ? 280 : 150;
    const t = setTimeout(() => setIsAnimating(false), dur);
    return () => clearTimeout(t);
  }, [location.pathname, reduced, useSlide]);

  if (reduced) {
    return (
      <div className="relative" style={{ overflowX: "clip" }}>
        <div key={location.pathname}>{outlet}</div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ overflowX: "clip" }}>
      <AnimatePresence
        mode="popLayout"
        custom={direction}
        initial={false}
        onExitComplete={() => setIsAnimating(false)}
      >
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={useSlide ? slideVariants : fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={useSlide ? { duration: 0.25, ease: SLIDE_EASE } : { duration: 0.12, ease: "easeOut" }}
          style={{ position: "relative", width: "100%", willChange: "transform, opacity" }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
      {isAnimating && (
        <div
          className="fixed inset-0 z-[60]"
          style={{ pointerEvents: "auto", touchAction: "none" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}