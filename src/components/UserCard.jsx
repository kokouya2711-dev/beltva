import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { displayName } from "@/lib/profile";
import { parseHobbies, hobbyLabel } from "@/lib/hobbies";
import { useT, useI18n } from "@/lib/i18n";
import { getOrCreateConversation, blockExists, checkDmScope } from "@/lib/dm";
import { Mail, Flame } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import FollowButton from "@/components/FollowButton";

export default function UserCard({ user, me, isOnline, isTraining, reason, commonHobbies }) {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useI18n();
  const { toast } = useToast();
  const name = displayName(user);
  const hobbies = parseHobbies(user.hobbies);
  const commonSet = new Set(commonHobbies || []);
  // prioritize common hobbies, then others, max 3
  const ordered = [...hobbies].sort((a, b) => (commonSet.has(b) ? 1 : 0) - (commonSet.has(a) ? 1 : 0));
  const tags = ordered.slice(0, 3);

  const ringClass = isTraining
    ? "ring-2 ring-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.5)]"
    : isOnline
    ? "ring-2 ring-green-500"
    : "";

  async function startDm() {
    if (!me || !user) return;
    const blocked = await blockExists(me.id, user.id);
    if (blocked) return;
    const { ok, message } = await checkDmScope(me.id, user);
    if (!ok) { toast({ description: t(message) }); return; }
    const conv = await getOrCreateConversation(me.id, user.id);
    navigate(`/messages/${conv.id}`);
  }

  return (
    <div className="flex gap-3 py-3 px-4">
      <Link to={`/profile/${user.id}`} className="shrink-0 relative">
        <div className={`w-14 h-14 rounded-full p-0.5 ${ringClass}`}>
          {user.avatar_url ? (
            <img src={user.avatar_url} className="w-full h-full rounded-full object-cover border-2 border-card" />
          ) : (
            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-sm font-bold border-2 border-card">
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        {user.country && user.share_country !== false && (
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 overflow-hidden ring-2 ring-background">
            <img src={`https://flagcdn.com/w40/${user.country.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w80/${user.country.toLowerCase()}.png 2x`} alt="" className="w-full h-full object-cover" loading="lazy" draggable={false} />
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link to={`/profile/${user.id}`} className="font-semibold truncate hover:text-primary">{name}</Link>
          {user.region && <span className="text-[10px] text-muted-foreground truncate">· {user.region}</span>}
        </div>
        {user.bio && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{user.bio}</p>}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {tags.map((h) => (
            <span
              key={h}
              className={`text-[10px] border rounded-full px-2 py-0.5 ${
                commonSet.has(h) ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/60 border-border"
              }`}
            >
              {hobbyLabel(h, lang)}
            </span>
          ))}
          {hobbies.length > 3 && <span className="text-[10px] text-muted-foreground">+{hobbies.length - 3}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {isTraining && (
            <span className="text-[10px] text-[#ccff00] flex items-center gap-1"><Flame className="w-3 h-3" /> {t("common.trainingNow")}</span>
          )}
          {!isTraining && isOnline && (
            <span className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> {t("common.online")}</span>
          )}
          {user.training_purpose && <span className="text-[10px] text-primary">· {t("purpose." + user.training_purpose)}</span>}
          {reason && reason.length > 0 && (
            <span className="text-[10px] text-muted-foreground">· {reason.join(" · ")}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 justify-center shrink-0">
        <FollowButton targetId={user.id} meId={me?.id} size="sm" />
        <button
          onClick={startDm}
          className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-border bg-secondary/60 hover:border-primary transition"
        >
          <Mail className="w-3.5 h-3.5" /> {t("common.message")}
        </button>
      </div>
    </div>
  );
}