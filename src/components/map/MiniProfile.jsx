import React from "react";
import { Image } from "@/components/ui/image";
import { Flame, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";
import { flagEmoji } from "@/lib/profile";

export default function MiniProfile({ user, isMe, live, training, onView, scale = 1 }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const name = user.display_name || user.email?.split("@")[0] || "user";
  const genderLabel = user.gender === "male" ? "男" : user.gender === "female" ? "女" : "";
  const showGender = user.gender_public && genderLabel;
  const showAge = user.age_public === true ? user.age : null;
  const ageGender = [showAge, showGender].filter(v => v != null && v !== "").join("/");
  const flag = user.share_country !== false ? flagEmoji(user.country) : null;

  // Base sizes at scale=1 — horizontal: avatar left (2-row tall), right 2 rows
  const width = Math.round(180 * scale);
  const avatar = Math.round(52 * scale);
  const badge = Math.round(16 * scale);
  const nameSize = Math.max(9, Math.round(12 * scale));
  const subSize = Math.max(8, Math.round(10 * scale));
  const btnSize = Math.max(8, Math.round(10 * scale));
  const btnPadX = Math.max(6, Math.round(8 * scale));
  const btnPadY = Math.max(3, Math.round(4 * scale));
  const gap = Math.round(8 * scale);
  const rowGap = Math.round(4 * scale);
  const badgeOffset = -Math.round(badge * 0.15);

  return (
    <div className="flex items-stretch" style={{ width, gap }}>
      {/* Avatar — spans full height (2 rows), flag overlaps bottom-right */}
      <div className="relative shrink-0 self-center">
        <div className="rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center" style={{ width: avatar, height: avatar }}>
          {user.avatar_url ? (
            <Image src={user.avatar_url} alt={name} className="w-full h-full" fittingType="fill" />
          ) : (
            <span className="font-bold text-muted-foreground" style={{ fontSize: Math.round(16 * scale) }}>
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

      {/* Right side — 2 rows stacked */}
      <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ rowGap }}>
        {/* Top row: age/gender then username (same line) */}
        <div className="min-w-0 leading-tight">
          <div className="truncate" style={{ fontSize: nameSize }}>
            {ageGender && <span className="text-muted-foreground font-normal" style={{ fontSize: subSize, marginRight: 8 }}>{ageGender}</span>}
            <span className="font-semibold">{isMe ? t("home.you") : name}</span>
          </div>
          {training && (
            <div className="text-orange-400 flex items-center gap-0.5" style={{ fontSize: subSize, marginTop: 1 }}>
              <Flame className="shrink-0" style={{ width: Math.round(subSize), height: Math.round(subSize) }} />
              {live ? tWorkout(live.workout_type) : t("home.trainingLive")}
            </div>
          )}
        </div>
        {/* Bottom row: view profile button */}
        <button
          onClick={onView}
          className="w-full bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center"
          style={{ fontSize: btnSize, paddingLeft: btnPadX, paddingRight: btnPadX, paddingTop: btnPadY, paddingBottom: btnPadY }}
        >
          {t("home.viewProfile")}
          <ChevronRight style={{ width: Math.round(btnSize * 1.1), height: Math.round(btnSize * 1.1), marginLeft: 2 }} />
        </button>
      </div>
    </div>
  );
}