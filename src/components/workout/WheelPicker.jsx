import React, { useRef, useEffect, useMemo, useCallback } from "react";

const COPIES = 7;
const START_COPY = 3;

export default function WheelPicker({ values, value, onChange, itemHeight = 36, visibleCount = 3 }) {
  const ref = useRef(null);
  const snapTimer = useRef(null);
  const height = itemHeight * visibleCount;
  const pad = (height - itemHeight) / 2;
  const len = values.length;

  const fullValues = useMemo(
    () => Array.from({ length: COPIES * len }, (_, i) => values[i % len]),
    [values, len]
  );

  // Sync scroll when value changes externally (find nearest copy to current position)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = values.indexOf(value);
    if (idx < 0) return;
    const current = el.scrollTop / itemHeight;
    const base = Math.round(current / len) * len + idx;
    let target = base;
    if (target - current > len / 2) target -= len;
    else if (current - target > len / 2) target += len;
    if (Math.abs(el.scrollTop - target * itemHeight) > 1) {
      el.scrollTop = target * itemHeight;
    }
  }, [value, values, itemHeight, len]);

  // Initialize to middle copy on mount
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = values.indexOf(value);
    el.scrollTop = (START_COPY * len + (idx >= 0 ? idx : 0)) * itemHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const raw = Math.round(el.scrollTop / itemHeight);
    const idx = ((raw % len) + len) % len;
    if (values[idx] !== value) onChange(values[idx]);

    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      const el2 = ref.current;
      if (!el2) return;
      const target = Math.round(el2.scrollTop / itemHeight) * itemHeight;
      if (Math.abs(el2.scrollTop - target) > 1) {
        el2.scrollTo({ top: target, behavior: "smooth" });
      }
    }, 110);
  }, [itemHeight, len, values, value, onChange]);

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="h-full overflow-y-auto no-scrollbar overscroll-contain"
        style={{
          paddingTop: pad,
          paddingBottom: pad,
          maskImage: "linear-gradient(to bottom, transparent, black 28%, black 72%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 28%, black 72%, transparent)",
          scrollSnapType: "y proximity",
        }}
      >
        {fullValues.map((v, i) => (
          <div key={i} style={{ height: itemHeight }} className="flex items-center justify-center">
            <span className="text-xl font-bold text-foreground tabular-nums leading-none">{String(v)}</span>
          </div>
        ))}
      </div>
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: pad, height: itemHeight, borderTop: "1px solid hsl(240 5% 24%)", borderBottom: "1px solid hsl(240 5% 24%)" }} />
    </div>
  );
}