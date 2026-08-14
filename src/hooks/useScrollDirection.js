import { useState, useEffect } from "react";

/**
 * Tracks scroll direction and returns whether the top nav should be hidden.
 * - Scrolling down → hidden = true
 * - Scrolling up → hidden = false (regardless of position)
 * - Near top → hidden = false
 * Resets on dependency change (e.g. route navigation).
 */
export function useScrollDirection(deps = []) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const diff = y - lastScrollY;
      if (y < 10) {
        setHidden(false);
      } else if (diff > 4) {
        setHidden(true);
      } else if (diff < -4) {
        setHidden(false);
      }
      lastScrollY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return hidden;
}