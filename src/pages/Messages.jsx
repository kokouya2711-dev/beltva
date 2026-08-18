import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { fetchUser, displayName } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { Search, Loader2 } from "lucide-react";
import SwipeableConversationRow from "@/components/messages/SwipeableConversationRow";

export default function Messages() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [convs, setConvs] = useState([]);
  const [others, setOthers] = useState({});
  const [presence, setPresence] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const loadData = useCallback(async () => {
    const meUser = await base44.auth.me().catch(() => null);
    if (!meUser) { setLoading(false); return; }
    setMe(meUser);
    const [asA, asB] = await Promise.all([
      base44.entities.Conversation.filter({ a_id: meUser.id }, "-last_message_at", 200),
      base44.entities.Conversation.filter({ b_id: meUser.id }, "-last_message_at", 200)
    ]);
    const map = {};
    [...asA, ...asB].forEach((c) => { map[c.id] = c; });
    const all = Object.values(map).sort((a, b) => {
      const aPinned = (a.a_id === meUser.id ? a.a_pinned : a.b_pinned) ? 1 : 0;
      const bPinned = (b.a_id === meUser.id ? b.b_pinned : b.b_pinned) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0);
    });
    setConvs(all);
    const otherIds = [...new Set(all.map((c) => (c.a_id === meUser.id ? c.b_id : c.a_id)))];
    const [users, pres] = await Promise.all([
      Promise.all(otherIds.map((id) => fetchUser(id))),
      base44.entities.Presence.list("-last_seen", 200).catch(() => [])
    ]);
    const om = {}; users.forEach((u) => { if (u) om[u.id] = u; }); setOthers(om);
    const pm = {}; pres.forEach((p) => { pm[p.created_by_id] = p.last_seen; }); setPresence(pm);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    if (!query.trim()) return convs;
    const q = query.toLowerCase();
    return convs.filter((c) => {
      const otherId = c.a_id === me?.id ? c.b_id : c.a_id;
      const o = others[otherId];
      return displayName(o).toLowerCase().includes(q);
    });
  }, [convs, query, me, others]);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 pt-4 md:pt-6 pb-4">
      {/* Search bar — wide, no extra buttons */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("messages.searchPlaceholder")}
          className="w-full bg-secondary/60 border border-border rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : convs.length === 0 ? (
        /* Empty state — no card, centered directly on screen */
        <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "60vh" }}>
          <h2 className="text-xl font-bold text-foreground">{t("messages.emptyTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-2">{t("messages.emptySub")}</p>
          <button
            onClick={() => navigate("/users")}
            className="mt-6 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition"
          >
            {t("users.title")}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">{t("messages.noResults")}</div>
      ) : (
        <div className="glass rounded-2xl border border-border overflow-hidden">
          {filtered.map((c) => {
            const otherId = c.a_id === me.id ? c.b_id : c.a_id;
            const o = others[otherId];
            const isOnline = o?.show_online_status !== false && presence[otherId] && Date.now() - new Date(presence[otherId]).getTime() < 60000;
            const myRead = c[c.a_id === me.id ? "a_read_at" : "b_read_at"];
            const unread = c.last_sender_id !== me.id && c.last_message_at && (!myRead || new Date(c.last_message_at).getTime() > new Date(myRead).getTime());
            return (
              <SwipeableConversationRow
                key={c.id}
                conv={c}
                me={me}
                other={o}
                isOnline={isOnline}
                unread={unread}
                onNavigate={() => navigate(`/messages/${c.id}`)}
                onDeleted={loadData}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}