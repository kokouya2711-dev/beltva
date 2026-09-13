import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { VolumeX, Loader2, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import { fetchUser, displayName } from "@/lib/profile";
import { unmuteUser } from "@/lib/dm";

export default function MutedUsersPage() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [mutes, setMutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const meUser = await base44.auth.me().catch(() => null);
      if (!meUser) { setLoading(false); return; }
      setMe(meUser);
      const ms = await base44.entities.Mute.filter({ muter_id: meUser.id });
      setMutes(ms);
      setLoading(false);
    })();
  }, []);

  async function handleUnmute(muteId, otherId) {
    await unmuteUser(me.id, otherId);
    setMutes((prev) => prev.filter((m) => m.id !== muteId));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="relative flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{t("muted.title")}</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : mutes.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <VolumeX className="w-10 h-10 opacity-40" />
          <div className="text-base">{t("muted.empty")}</div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {mutes.map((m) => <MutedRow key={m.id} mute={m} onUnmute={() => handleUnmute(m.id, m.muted_id)} />)}
        </div>
      )}
    </div>
  );
}

function MutedRow({ mute, onUnmute }) {
  const t = useT();
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(mute.muted_id).then(setUser).catch(() => {}); }, [mute.muted_id]);
  const name = displayName(user);
  return (
    <div className="flex items-center gap-3 py-4">
      <Link to={user ? `/profile/${user.id}` : "#"} className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
        {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
      </Link>
      <Link to={user ? `/profile/${user.id}` : "#"} className="flex-1 min-w-0 text-base font-medium truncate hover:text-primary">{name}</Link>
      <button onClick={onUnmute} className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition">{t("common.unmute")}</button>
    </div>
  );
}