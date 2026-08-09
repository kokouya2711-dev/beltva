import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { fetchUser } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { MessageCircle, Loader2, Inbox } from "lucide-react";
import SwipeableConversationRow from "@/components/messages/SwipeableConversationRow";

export default function Messages() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [convs, setConvs] = useState([]);
  const [others, setOthers] = useState({});
  const [presence, setPresence] = useState({});
  const [loading, setLoading] = useState(true);

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
      // Pinned conversations first
      const aPinned = (a.a_id === meUser.id ? a.a_pinned : a.b_pinned) ? 1 : 0;
      const bPinned = (b.a_id === meUser.id ? b.a_pinned : b.b_pinned) ? 1 : 0;
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

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold">{t("messages.title")}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : convs.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <Inbox className="w-10 h-10 opacity-40" />
          <div className="text-sm">{t("messages.empty")}</div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-border overflow-hidden">
          {convs.map((c) => {
            const otherId = c.a_id === me.id ? c.b_id : c.a_id;
            const o = others[otherId];
            const isOnline = o?.show_online_status !== false && presence[otherId] && Date.now() - new Date(presence[otherId]).getTime() < 120000;
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