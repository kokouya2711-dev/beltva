import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Bell, Heart, UserPlus, Send, MessageSquare, BarChart3,
  CheckCheck, X, Inbox, Zap
} from "lucide-react";
import { displayName, fetchUser } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { useTimeAgo } from "@/lib/i18nHelpers";
import { Image } from "@/components/ui/image";

const TYPE_CONFIG = {
  like:          { icon: Heart,        bg: "bg-rose-500/20",    fg: "text-rose-400" },
  reaction:      { icon: Zap,          bg: "bg-amber-500/20",   fg: "text-amber-400" },
  follow:        { icon: UserPlus,     bg: "bg-primary/20",     fg: "text-primary" },
  dm:            { icon: Send,        bg: "bg-sky-500/20",      fg: "text-sky-400" },
  comment:       { icon: MessageSquare,bg: "bg-violet-500/20",  fg: "text-violet-400" },
  weekly_report:{ icon: BarChart3,    bg: "bg-accent/20",       fg: "text-accent" },
  default:       { icon: Bell,         bg: "bg-secondary",       fg: "text-muted-foreground" },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.default;
}

export default function NotificationsBell({ meId }) {
  const t = useT();
  const timeAgo = useTimeAgo();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [actors, setActors] = useState({});
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();

  async function load() {
    if (!meId) return;
    const ns = await base44.entities.Notification.filter({ user_id: meId }, "-created_date", 30).catch(() => []);
    setItems(ns);
    const ids = [...new Set(ns.map((n) => n.actor_id).filter(Boolean))];
    if (!ids.length) return;
    const us = await Promise.all(ids.map((id) => fetchUser(id)));
    const m = {}; us.forEach((u) => { if (u) m[u.id] = u; });
    setActors(m);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [meId]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const unread = items.filter((n) => !n.read).length;
  const unreadItems = items.filter((n) => !n.read);
  const readItems = items.filter((n) => n.read);

  async function markAll() {
    if (!unreadItems.length || marking) return;
    setMarking(true);
    await base44.entities.Notification.bulkUpdate(unreadItems.map((n) => ({ id: n.id, read: true }))).catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarking(false);
  }

  function openNotif(n) {
    if (n.type === "dm" && n.target_id) navigate(`/messages/${n.target_id}`);
    else if (n.type === "like" || n.type === "comment") navigate(`/posts/${n.target_id}`);
    else if (n.actor_id) navigate(`/profile/${n.actor_id}`);
    setOpen(false);
  }

  function renderText(n) {
    const a = actors[n.actor_id];
    const name = a ? displayName(a) : "";
    // text is either a translation key (notif.followed / notif.liked) or raw content
    const txt = n.text || "";
    if (txt.startsWith("notif.")) {
      return <><span className="font-semibold">{name}</span> {t(txt)}</>;
    }
    return <><span className="font-semibold">{name}</span> {txt}</>;
  }

  function NotifItem({ n }) {
    const a = actors[n.actor_id];
    const cfg = getTypeConfig(n.type);
    const Icon = cfg.icon;
    return (
      <button
        onClick={() => openNotif(n)}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40 ${!n.read ? "bg-primary/5" : ""}`}
      >
        <div className="relative shrink-0">
          {a?.avatar_url ? (
            <Image src={a.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" fittingType="fill" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
              {a ? displayName(a).slice(0, 2).toUpperCase() : "?"}
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${cfg.bg} flex items-center justify-center ring-2 ring-card`}>
            <Icon className={`w-3 h-3 ${cfg.fg}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-sm leading-snug line-clamp-2">{renderText(n)}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.created_date)}</div>
        </div>
        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label={t("notif.title")}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm md:bg-black/30"
            onClick={() => setOpen(false)}
          />
          {/* Slide-in panel from right */}
          <div className="fixed top-0 right-0 bottom-0 z-[71] w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-sm">{t("notif.title")}</h2>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    disabled={marking}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-secondary/60 flex items-center justify-center">
                    <Inbox className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground">{t("notif.empty")}</div>
                </div>
              ) : (
                <>
                  {unreadItems.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("notif.inApp")} · {unreadItems.length}
                      </div>
                      {unreadItems.map((n) => <NotifItem key={n.id} n={n} />)}
                    </div>
                  )}
                  {readItems.length > 0 && (
                    <div>
                      {unreadItems.length > 0 && (
                        <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {t("common.more")}
                        </div>
                      )}
                      {readItems.map((n) => <NotifItem key={n.id} n={n} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}