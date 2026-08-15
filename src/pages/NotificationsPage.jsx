import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bell, CheckCheck, Inbox, Loader2 } from "lucide-react";
import { fetchUser } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import NotifItem from "@/components/NotifItem";

const TABS = ["all", "like", "comment"];

// Only timeline reactions are shown on this screen
const TIMELINE_TYPES = new Set(["like", "comment", "comment_reply", "comment_like"]);

function matchesTab(n, tab) {
  if (tab === "all") return true;
  if (tab === "like") return n.type === "like" || n.type === "comment_like";
  if (tab === "comment") return n.type === "comment" || n.type === "comment_reply";
  return false;
}

export default function NotificationsPage() {
  const t = useT();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [actors, setActors] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me?.id) { setLoading(false); return; }
      const ns = await base44.entities.Notification.filter({ user_id: me.id }, "-created_date", 100).catch(() => []);
      setItems(ns);
      const ids = [...new Set(ns.map((n) => n.actor_id).filter(Boolean))];
      if (ids.length) {
        const us = await Promise.all(ids.map((id) => fetchUser(id).catch(() => null)));
        const m = {};
        us.forEach((u) => { if (u) m[u.id] = u; });
        setActors(m);
      }
      setLoading(false);
    })();
  }, []);

  const unread = items.filter((n) => !n.read).length;

  function openNotif(n) {
    if (!n.read) {
      base44.entities.Notification.update(n.id, { read: true }).catch(() => {});
      setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.type === "dm" && n.target_id) navigate(`/messages/${n.target_id}`);
    else if (n.type === "like" || n.type === "comment" || n.type === "comment_reply" || n.type === "comment_like") navigate(`/posts/${n.post_id || n.target_id}`);
    else if (n.actor_id) navigate(`/profile/${n.actor_id}`);
  }

  async function markAll() {
    const unreadItems = items.filter((n) => !n.read);
    if (!unreadItems.length || marking) return;
    setMarking(true);
    await base44.entities.Notification.bulkUpdate(unreadItems.map((n) => ({ id: n.id, read: true }))).catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarking(false);
  }

  const filtered = items.filter((n) => TIMELINE_TYPES.has(n.type) && matchesTab(n, tab));
  const tabLabel = (c) => c === "all" ? t("common.all") : c === "like" ? t("notif.like") : t("notif.comment");

  return (
    <div className="max-w-2xl mx-auto" style={{ paddingTop: "calc(3rem + env(safe-area-inset-top))" }}>
      {/* Fixed header */}
      <div
        className="fixed top-0 left-0 right-0 z-30 glass border-b border-border"
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
            <h1 className="font-bold text-base">{t("notif.title")}</h1>
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
        {/* Tabs */}
        <div className="max-w-2xl mx-auto flex border-t border-border">
          {TABS.map((c) => {
            const active = tab === c;
            return (
              <button
                key={c}
                onClick={() => setTab(c)}
                className={`flex-1 py-2.5 text-sm border-b-2 transition ${active ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground font-medium"}`}
              >
                {tabLabel(c)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-1">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary/60 flex items-center justify-center">
              <Inbox className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium">{t("notif.emptyReactions")}</div>
            <div className="text-xs text-muted-foreground">{t("notif.emptyReactionsPrompt")}</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((n) => (
              <NotifItem key={n.id} n={n} actor={actors[n.actor_id]} onOpen={openNotif} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}