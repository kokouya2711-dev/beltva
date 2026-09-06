import React, { useRef, useEffect, useCallback } from "react";

export default function WheelPicker({ values, value, onChange, itemHeight = 44, visibleCount = 5 }) {
  const ref = useRef(null);
  const snapTimer = useRef(null);
  const height = itemHeight * visibleCount;
  const pad = (height - itemHeight) / 2;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = values.indexOf(value);
    if (idx >= 0 && Math.abs(el.scrollTop - idx * itemHeight) > 1) {
      el.scrollTop = idx * itemHeight;
    }
  }, [value, values, itemHeight]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const idx = Math.max(0, Math.min(values.length - 1, Math.round(el.scrollTop / itemHeight)));
    if (values[idx] !== value) onChange(values[idx]);
  }, [itemHeight, values, value, onChange]);

  const onScroll = () => {
    handleScroll();
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.max(0, Math.min(values.length - 1, Math.round(el.scrollTop / itemHeight)));
      if (Math.abs(el.scrollTop - idx * itemHeight) > 1) {
        el.scrollTo({ top: idx * itemHeight, behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="h-full overflow-y-auto no-scrollbar"
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: pad,
          paddingBottom: pad,
          maskImage: "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
        }}
      >
        {values.map((v) => (
          <div key={v} style={{ height: itemHeight, scrollSnapAlign: "center" }} className="flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground tabular-nums">{String(v).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: pad, height: itemHeight, borderTop: "1px solid hsl(240 5% 24%)", borderBottom: "1px solid hsl(240 5% 24%)" }} />
    </div>
  );
}