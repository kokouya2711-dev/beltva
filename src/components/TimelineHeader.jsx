import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Check } from "lucide-react";
import { useTimelineFilter } from "@/lib/timelineFilterContext";
import NotificationsBell from "@/components/NotificationsBell";
import { useI18n } from "@/lib/i18n";
import Flag from "@/components/Flag";

function langDisplay(code, uiLang) {
  const locale = uiLang === "zh-TW" ? "zh-TW" : uiLang;
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(code) || code;
  } catch { return code; }
}

function Dropdown({ title, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const current = options.find((o) => o.key === value) || options[0];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/70 bg-primary/10 text-primary text-sm font-bold whitespace-nowrap min-h-[34px]"
      >
        {current?.icon != null && <span className="leading-none flex items-center">{current.icon}</span>}
        <span>{current?.label}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-popover border border-border rounded-xl shadow-2xl py-1 min-w-[180px]">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => { onChange(o.key); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 text-sm hover:bg-secondary/60 flex items-center gap-2 ${value === o.key ? "text-primary font-bold" : "text-foreground"}`}
            >
              {o.icon != null && <span className="leading-none flex items-center w-5 justify-center">{o.icon}</span>}
              <span className="flex-1">{o.label}</span>
              {value === o.key && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TimelineHeader({ me }) {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { room, setRoom, display, setDisplay } = useTimelineFilter();

  const myMainLang = me?.main_language || me?.language || localStorage.getItem("beltva_lang") || "ja";

  const roomOptions = useMemo(() => [
    { key: "all", icon: "🌏", label: "すべて" },
    {
      key: "mylang",
      icon: <Flag code={myMainLang} className="w-5 h-3.5 rounded-[3px] object-cover" />,
      label: langDisplay(myMainLang, lang),
    },
  ], [myMainLang, lang]);

  const displayOptions = [
    { key: "recommended", label: "おすすめ" },
    { key: "latest", label: "最新" },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-1.5">
      <Dropdown title="ルーム" options={roomOptions} value={room} onChange={setRoom} />
      <Dropdown title="表示" options={displayOptions} value={display} onChange={setDisplay} />
      <div className="flex-1" />
      <NotificationsBell meId={me?.id} className="p-2" iconClassName="w-6 h-6 text-white" to="/notifications" />
      <button
        onClick={() => navigate("/create-post")}
        className="w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center text-white active:scale-95 transition"
        aria-label="投稿"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}