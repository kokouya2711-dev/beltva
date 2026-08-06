import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell } from "lucide-react";
import { displayName, fetchUser } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { useTimeAgo } from "@/lib/i18nHelpers";

export default function NotificationsBell({ meId }) {
  const t = useT();
  const timeAgo = useTimeAgo();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [actors, setActors] = useState({});
  const ref = useRef(null);
  const navigate = useNavigate();

  async function load() {
    if (!meId) return;
    const ns = await base44.entities.Notification.filter({ user_id: meId }, "-created_date", 30).catch(() => []);
    setItems(ns);
    const ids = [...new Set(ns.map((n) => n.actor_id))];
    const us = await Promise.all(ids.map((id) => fetchUser(id)));
    const m = {}; us.forEach((u) => { if (u) m[u.id] = u; }); setActors(m);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [meId]);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  async function markAll() {
    const unreadItems = items.filter((n) => !n.read);
    if (!unreadItems.length) return;
    await base44.entities.Notification.bulkUpdate(unreadItems.map((n) => ({ id: n.id, read: true })));
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function openNotif(n) {
    if (n.type === "dm" && n.target_id) navigate(`/messages/${n.target_id}`);
    else if (n.actor_id) navigate(`/profile/${n.actor_id}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen((v) => !v); if (!open) markAll(); }} className="relative p-2 rounded-lg hover:bg-secondary">
        <Bell className="w-5 h-5" />
        {unread > 0 && <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 glass border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">{t("notif.title")}</div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? <div className="py-6 text-center text-sm text-muted-foreground">{t("notif.empty")}</div> :
              items.map((n) => {
                const a = actors[n.actor_id];
                return (
                  <button key={n.id} onClick={() => openNotif(n)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-secondary/40">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0">{a ? displayName(a).slice(0, 2).toUpperCase() : "?"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate"><span className="font-medium">{displayName(a)}</span> {n.text}</div>
                      <div className="text-[10px] text-muted-foreground">{timeAgo(n.created_date)}</div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}