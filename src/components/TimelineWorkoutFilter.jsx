import React, { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTBodyPart } from "@/lib/i18nHelpers";
import { useTimelineFilter } from "@/lib/timelineFilterContext";

const OPTIONS = ["胸", "背中", "肩", "腕", "脚", "腹", "有酸素", "その他"];

export default function TimelineWorkoutFilter() {
  const t = useT();
  const tBody = useTBodyPart();
  const { workoutFilter, setWorkoutFilter } = useTimelineFilter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30" style={{ touchAction: "none", WebkitTouchCallout: "none" }} />
      )}
      <div className="absolute right-0 top-0 bottom-0 z-40 flex items-center pl-3 pr-2 bg-background" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`p-1.5 rounded-lg hover:bg-secondary transition ${workoutFilter ? "text-primary" : "text-muted-foreground"}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        {open && (
          <div
            className="absolute right-2 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-2xl py-1 min-w-[150px] max-h-[60vh] overflow-y-auto overscroll-contain"
          >
            <button
              onClick={() => { setWorkoutFilter(""); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 flex items-center justify-between ${!workoutFilter ? "text-primary" : ""}`}
            >
              {t("workout.allTypes")}
              {!workoutFilter && <Check className="w-3.5 h-3.5" />}
            </button>
            {OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { setWorkoutFilter(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 flex items-center justify-between ${workoutFilter === opt ? "text-primary" : ""}`}
              >
                {tBody(opt)}
                {workoutFilter === opt && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}