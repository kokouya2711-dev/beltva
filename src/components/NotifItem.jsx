import React from "react";
import {
  Bell, Heart, UserPlus, Send, MessageSquare, BarChart3, Zap
} from "lucide-react";
import { displayName } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { useTimeAgo } from "@/lib/i18nHelpers";
import { Image } from "@/components/ui/image";

const TYPE_CONFIG = {
  like:           { icon: Heart,         bg: "bg-rose-500/20",   fg: "text-rose-400" },
  reaction:       { icon: Zap,           bg: "bg-amber-500/20",  fg: "text-amber-400" },
  follow:         { icon: UserPlus,      bg: "bg-primary/20",    fg: "text-primary" },
  dm:             { icon: Send,          bg: "bg-sky-500/20",    fg: "text-sky-400" },
  comment:        { icon: MessageSquare, bg: "bg-violet-500/20", fg: "text-violet-400" },
  comment_reply:  { icon: MessageSquare, bg: "bg-violet-500/20", fg: "text-violet-400" },
  comment_like:   { icon: Heart,         bg: "bg-rose-500/20",   fg: "text-rose-400" },
  weekly_report:  { icon: BarChart3,     bg: "bg-accent/20",     fg: "text-accent" },
  default:        { icon: Bell,          bg: "bg-secondary",      fg: "text-muted-foreground" },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.default;
}

export default function NotifItem({ n, actor, onOpen }) {
  const t = useT();
  const timeAgo = useTimeAgo();
  const cfg = getTypeConfig(n.type);
  const Icon = cfg.icon;
  const name = actor ? displayName(actor) : "";
  const txt = n.text || "";
  const rendered = txt.startsWith("notif.")
    ? <><span className="font-semibold">{name}</span> {t(txt)}</>
    : <><span className="font-semibold">{name}</span> {txt}</>;

  return (
    <button
      onClick={() => onOpen(n)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40 ${!n.read ? "bg-primary/5" : ""}`}
    >
      <div className="relative shrink-0">
        {actor?.avatar_url ? (
          <Image src={actor.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" fittingType="fill" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
            {actor ? name.slice(0, 2).toUpperCase() : "?"}
          </div>
        )}
        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${cfg.bg} flex items-center justify-center ring-2 ring-card`}>
          <Icon className={`w-3 h-3 ${cfg.fg}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-sm leading-snug line-clamp-2">{rendered}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.created_date)}</div>
      </div>
      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
    </button>
  );
}