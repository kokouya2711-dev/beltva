import React from "react";
import { Image } from "@/components/ui/image";
import { Flame } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";
import { flagEmoji } from "@/lib/profile";

export default function MiniProfile({ user, isMe, live, training, onView, scale = 1 }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const name = user.display_name || user.email?.split("@")[0] || "user";
  const genderLabel = user.gender === "male" ? "男" : user.gender === "female" ? "女" : "";
  const showGender = user.gender_public && genderLabel;
  const ageGender = [user.age, showGender].filter(v => v != null && v !== "").join("/");
  const flag = flagEmoji(user.country);

  // Base sizes at scale=1 (roughly 65% of original)
  const width = Math.round(120 * scale);
  const avatar = Math.round(40 * scale);
  const badge = Math.round(16 * scale);
  const nameSize = Math.max(8, Math.round(11 * scale));
  const subSize = Math.max(7, Math.round(10 * scale));
  const btnSize = Math.max(8, Math.round(10 * scale));
  const btnPad = Math.max(2, Math.round(4 * scale));
  const gap = Math.round(6 * scale);
  const badgeOffset = -Math.round(badge * 0.15);

  return (
    <div className="flex flex-col items-center" style={{ width, gap }}>
      <div className="relative">
        <div className="rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center" style={{ width: avatar, height: avatar }}>
          {user.avatar_url ? (
            <Image src={user.avatar_url} alt={name} className="w-full h-full" fittingType="fill" />
          ) : (
            <span className="font-bold text-muted-foreground" style={{ fontSize: Math.round(14 * scale) }}>
              {(name || "?").slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {training ? (
          <div className="absolute rounded-full bg-[#f97316] flex items-center justify-center border-2 border-card" style={{ width: badge, height: badge, bottom: badgeOffset, right: badgeOffset }}>
            <Flame className="text-white" style={{ width: Math.round(badge * 0.6), height: Math.round(badge * 0.6) }} />
          </div>
        ) : flag ? (
          <div className="absolute rounded-full bg-card border-2 border-card flex items-center justify-center leading-none overflow-hidden" style={{ width: badge, height: badge, bottom: badgeOffset, right: badgeOffset, fontSize: Math.round(badge * 0.72) }}>
            <span className="leading-none">{flag}</span>
          </div>
        ) : (
          <div className="absolute rounded-full bg-[#22c55e] flex items-center justify-center border-2 border-card" style={{ width: badge, height: badge, bottom: badgeOffset, right: badgeOffset }}>
            <div className="rounded-full bg-white" style={{ width: Math.round(badge * 0.4), height: Math.round(badge * 0.4) }} />
          </div>
        )}
      </div>

      <div className="text-center" style={{ marginTop: 2 }}>
        <div className="font-semibold leading-tight" style={{ fontSize: nameSize }}>{isMe ? t("home.you") : name}</div>
        {ageGender && <div className="text-muted-foreground" style={{ fontSize: subSize, marginTop: 1 }}>{ageGender}</div>}
        {training && (
          <div className="text-orange-400" style={{ fontSize: subSize, marginTop: 1 }}>
            {live ? tWorkout(live.workout_type) : t("home.trainingLive")}
          </div>
        )}
      </div>

      <button
        onClick={onView}
        className="w-full bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
        style={{ fontSize: btnSize, paddingTop: btnPad, paddingBottom: btnPad }}
      >
        {t("home.viewProfile")}
      </button>
    </div>
  );
}