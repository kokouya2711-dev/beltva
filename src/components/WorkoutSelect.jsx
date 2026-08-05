import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { POST_BODY_PARTS } from "@/lib/postWorkouts";

export default function WorkoutSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function clear(e) {
    e.stopPropagation();
    onChange("");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 outline-none focus:border-primary"
      >
        <span className={value ? "text-foreground truncate" : "text-muted-foreground"}>
          {value || "なし"}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value ? (
            <span onClick={clear} className="p-0.5 rounded hover:bg-secondary">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </span>
          ) : null}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-xl shadow-2xl max-h-72 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 flex items-center justify-between ${!value ? "text-primary" : ""}`}
          >
            なし
            {!value && <Check className="w-3.5 h-3.5" />}
          </button>
          {POST_BODY_PARTS.map((it) => (
            <button
              key={it}
              type="button"
              onClick={() => { onChange(it); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 flex items-center justify-between ${value === it ? "text-primary" : ""}`}
            >
              {it}
              {value === it && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}