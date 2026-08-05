import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { displayName, fetchUser } from "@/lib/profile";
import { timeAgo } from "@/lib/workouts";
import { MessageCircle, Loader2, Inbox } from "lucide-react";

export default function Messages() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [convs, setConvs] = useState([]);
  const [others, setOthers] = useState({});
  const [presence, setPresence] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const meUser = await base44.auth.me().catch(() => null);
      setMe(meUser);
      const [asA, asB] = await Promise.all([
        base44.entities.Conversation.filter({ a_id: meUser.id }, "-last_message_at", 200),
        base44.entities.Conversation.filter({ b_id: meUser.id }, "-last_message_at", 200)
      ]);
      const map = {};
      [...asA, ...asB].forEach((c) => { map[c.id] = c; });
      const all = Object.values(map).sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
      setConvs(all);
      const otherIds = [...new Set(all.map((c) => (c.a_id === meUser.id ? c.b_id : c.a_id)))];
      const [users, pres] = await Promise.all([
        Promise.all(otherIds.map((id) => fetchUser(id))),
        base44.entities.Presence.list("-last_seen", 200).catch(() => [])
      ]);
      const om = {}; users.forEach((u) => { if (u) om[u.id] = u; }); setOthers(om);
      const pm = {}; pres.forEach((p) => { pm[p.created_by_id] = p.last_seen; }); setPresence(pm);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold">メッセージ</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : convs.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <Inbox className="w-10 h-10 opacity-40" />
          <div className="text-sm">まだメッセージはありません。仲間のプロフィールからメッセージを送ってみましょう。</div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-border divide-y divide-border">
          {convs.map((c) => {
            const otherId = c.a_id === me.id ? c.b_id : c.a_id;
            const o = others[otherId];
            const isOnline = presence[otherId] && Date.now() - new Date(presence[otherId]).getTime() < 120000;
            const myRead = c[c.a_id === me.id ? "a_read_at" : "b_read_at"];
            const unread = c.last_sender_id !== me.id && c.last_message_at && (!myRead || new Date(c.last_message_at).getTime() > new Date(myRead).getTime());
            return (
              <button key={c.id} onClick={() => navigate(`/messages/${c.id}`)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 text-left">
                <div className="relative shrink-0">
                  {o?.avatar_url ? <img src={o.avatar_url} className="w-11 h-11 rounded-full object-cover" /> : <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{displayName(o).slice(0, 2).toUpperCase()}</div>}
                  {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{displayName(o)}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{c.last_message_at ? timeAgo(c.last_message_at) : ""}</span>
                  </div>
                  <div className={`text-sm truncate ${unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>{c.last_message || "チャットを始める"}</div>
                </div>
                {unread && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}