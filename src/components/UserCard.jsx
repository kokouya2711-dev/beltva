import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { displayName } from "@/lib/profile";
import { parseHobbies, hobbyLabel } from "@/lib/hobbies";
import { useT, useI18n } from "@/lib/i18n";
import { purposeLabel } from "@/lib/i18nPurposeFilter";
import { getOrCreateConversation, blockExists, checkDmScope } from "@/lib/dm";
import { MessageCircleMore, Flame } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// 性別＋年齢バッジ（男性=ネオンイエロー、女性=ピンク）
// 年齢非公開の場合は性別マークのみ表示
function GenderAgePill({ gender, age, agePublic }) {
  if (!gender || gender === "undisclosed") return null;
  const isMale = gender === "male";
  const showAge = agePublic && age != null;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isMale ? "bg-primary text-primary-foreground" : "bg-[#FF6699] text-white"}`}>
      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {isMale ? (
          <>
            <circle cx="10" cy="14" r="6" />
            <path d="M14 10 L20 4 M20 4 L15.5 4 M20 4 L20 8.5" />
          </>
        ) : (
          <>
            <circle cx="12" cy="9" r="6" />
            <line x1="12" y1="15" x2="12" y2="22" />
            <line x1="9" y1="19" x2="15" y2="19" />
          </>
        )}
      </svg>
      {showAge && <span className="leading-none">{age}</span>}
    </span>
  );
}

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

  const purposeLbl = user.training_purpose ? purposeLabel(lang, user.training_purpose) : "";

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
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 overflow-hidden ring-2 ring-background rounded-[3px]">
            <img src={`https://flagcdn.com/w40/${user.country.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w80/${user.country.toLowerCase()}.png 2x`} alt="" className="w-full h-full object-cover" loading="lazy" draggable={false} />
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link to={`/profile/${user.id}`} className="font-semibold truncate hover:text-primary">{name}</Link>
          <GenderAgePill gender={user.gender} age={user.age} agePublic={user.age_public} />
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
          {reason && reason.length > 0 && (
            <span className="text-[10px] text-muted-foreground">· {reason.join(" · ")}</span>
          )}
        </div>
        {purposeLbl && (
          <span className="inline-block mt-1.5 text-[10px] font-semibold rounded-full px-2 py-0.5 bg-secondary text-primary">
            {purposeLbl}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center shrink-0">
        <button
          onClick={startDm}
          aria-label={t("nav.messages")}
          className="flex items-center justify-center gap-1 text-xs font-bold px-2.5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <MessageCircleMore className="w-[18px] h-[18px]" /> {t("nav.messages")}
        </button>
      </div>
    </div>
  );
}