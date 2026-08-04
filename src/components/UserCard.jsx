import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { displayName, flagEmoji } from "@/lib/profile";
import { parseHobbies } from "@/lib/hobbies";
import { useT } from "@/lib/i18n";
import { getOrCreateConversation, blockExists } from "@/lib/dm";
import { Mail, Flame } from "lucide-react";

export default function UserCard({ user, me, isOnline, isTraining }) {
  const navigate = useNavigate();
  const t = useT();
  const name = displayName(user);
  const hobbies = parseHobbies(user.hobbies);

  async function startDm() {
    if (!me || !user) return;
    const blocked = await blockExists(me.id, user.id);
    if (blocked) return;
    const conv = await getOrCreateConversation(me.id, user.id);
    navigate(`/messages/${conv.id}`);
  }

  return (
    <div className="glass rounded-2xl border border-border p-4 flex gap-3">
      <Link to={`/profile/${user.id}`} className="relative shrink-0">
        {user.avatar_url ? <img src={user.avatar_url} className="w-14 h-14 rounded-full object-cover" /> : <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">{name.slice(0, 2).toUpperCase()}</div>}
        {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link to={`/profile/${user.id}`} className="font-semibold truncate hover:text-primary">{name}</Link>
          {user.country && <span>{flagEmoji(user.country)}</span>}
          {isTraining && <Flame className="w-4 h-4 text-orange-500" />}
        </div>
        {user.bio && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{user.bio}</p>}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {hobbies.slice(0, 3).map((h) => <span key={h} className="text-[10px] bg-secondary/60 border border-border rounded-full px-2 py-0.5">{h}</span>)}
          {hobbies.length > 3 && <span className="text-[10px] text-muted-foreground">+{hobbies.length - 3}</span>}
        </div>
        {user.training_purpose && <div className="text-[10px] text-primary mt-1">{t("purpose." + user.training_purpose)}</div>}
      </div>
      <button onClick={startDm} className="shrink-0 self-center p-2 rounded-lg bg-secondary/60 border border-border hover:border-primary"><Mail className="w-4 h-4" /></button>
    </div>
  );
}