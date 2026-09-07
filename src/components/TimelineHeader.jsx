import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ChevronDown, Plus, Check } from "lucide-react";
import { useTimelineFilter } from "@/lib/timelineFilterContext";
import NotificationsBell from "@/components/NotificationsBell";

const ROOMS = [
  { key: "all", label: "すべて" },
  { key: "mylang", label: "自分の言語ルーム" },
];

const DISPLAYS = [
  { key: "recommended", label: "おすすめ" },
  { key: "latest", label: "最新" },
];

function Dropdown({ title, options, value, onChange, withGlobe }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const current = options.find((o) => o.key === value) || options[0];
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-white font-medium leading-none">{title}</span>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-primary text-primary text-xs font-bold whitespace-nowrap"
        >
          {withGlobe && <Globe className="w-3 h-3" />}
          <span>{current.label}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-2xl py-1 min-w-[150px]">
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => { onChange(o.key); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-secondary/60 flex items-center justify-between ${value === o.key ? "text-primary font-bold" : "text-foreground"}`}
              >
                {o.label}
                {value === o.key && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimelineHeader({ meId }) {
  const navigate = useNavigate();
  const { room, setRoom, display, setDisplay } = useTimelineFilter();
  return (
    <div className="flex items-center justify-between px-4 py-2 gap-2">
      <div className="flex items-center gap-3">
        <Dropdown title="ルーム" options={ROOMS} value={room} onChange={setRoom} withGlobe />
        <Dropdown title="表示" options={DISPLAYS} value={display} onChange={setDisplay} />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsBell meId={meId} className="p-1.5" iconClassName="w-5 h-5 text-primary" to="/notifications" />
        <button
          onClick={() => navigate("/create-post")}
          className="w-9 h-9 rounded-xl border border-primary flex items-center justify-center text-primary"
          aria-label="投稿"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}