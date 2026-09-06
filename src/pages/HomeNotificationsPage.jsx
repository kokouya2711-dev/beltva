import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bell, CheckCheck, Loader2 } from "lucide-react";
import { fetchUser } from "@/lib/profile";
import NotifItem from "@/components/NotifItem";

// Home notifications: follows + BELTVA announcements only.
// Feed reactions (likes/comments/replies), DMs, and old weekly-report notifications are excluded.
const HOME_TYPES = new Set(["follow", "admin", "announcement"]);
const isHomeNotif = (n) => HOME_TYPES.has(n.type);

export default function HomeNotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [actors, setActors] = useState({});
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me?.id) { setLoading(false); return; }
      const ns = await base44.entities.Notification.filter({ user_id: me.id }, "-created_date", 100).catch(() => []);
      const home = ns.filter(isHomeNotif);
      setItems(home);
      const ids = [...new Set(home.map((n) => n.actor_id).filter(Boolean))];
      if (ids.length) {
        const us = await Promise.all(ids.map((id) => fetchUser(id).catch(() => null)));
        const m = {};
        us.forEach((u) => { if (u) m[u.id] = u; });
        setActors(m);
      }
      // mark home notifications as read on view
      const unread = home.filter((n) => !n.read);
      if (unread.length) {
        await base44.entities.Notification.bulkUpdate(unread.map((n) => ({ id: n.id, read: true }))).catch(() => {});
        window.dispatchEvent(new CustomEvent("notifications-changed"));
      }
      setLoading(false);
    })();
  }, []);

  const unread = items.filter((n) => !n.read).length;

  function openNotif(n) {
    if (!n.read) {
      base44.entities.Notification.update(n.id, { read: true }).catch(() => {});
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      window.dispatchEvent(new CustomEvent("notifications-changed"));
    }
    if (n.type === "follow" && n.actor_id) navigate(`/profile/${n.actor_id}`);
    // weekly_report / admin announcements: stay on page (already marked read)
  }

  async function markAll() {
    const unreadItems = items.filter((n) => !n.read);
    if (!unreadItems.length || marking) return;
    setMarking(true);
    await base44.entities.Notification.bulkUpdate(unreadItems.map((n) => ({ id: n.id, read: true }))).catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarking(false);
    window.dispatchEvent(new CustomEvent("notifications-changed"));
  }

  return (
    <div className="min-h-screen bg-background">
    <div className="max-w-2xl mx-auto" style={{ paddingTop: "calc(3rem + env(safe-area-inset-top))" }}>
      <div
        className="fixed top-0 left-0 right-0 z-30 bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between px-3 py-2.5">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h1 className="font-bold text-base">お知らせ</h1>
            {unread > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">{unread}</span>
            )}
          </div>
          {unread > 0 ? (
            <button
              onClick={markAll}
              disabled={marking}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          ) : <div className="w-9" />}
        </div>
      </div>

      <div className="px-1">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary/60 flex items-center justify-center">
              <Bell className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium">まだ通知はありません</div>
            <div className="text-xs text-muted-foreground">新しいお知らせがあるとここに表示されます</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((n) => (
              <NotifItem key={n.id} n={n} actor={actors[n.actor_id]} onOpen={openNotif} />
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}