import React from "react";
import { Image } from "@/components/ui/image";
import { Flame, Radio } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTWorkout } from "@/lib/i18nHelpers";

export default function MiniProfile({ user, isMe, live, training, onView }) {
  const t = useT();
  const tWorkout = useTWorkout();
  const name = user.display_name || user.email?.split("@")[0] || "user";
  const genderLabel = user.gender === "male" ? "男" : user.gender === "female" ? "女" : "";
  const showGender = user.gender_public && genderLabel;
  const ageGender = [user.age, showGender].filter(v => v != null && v !== "").join("/");

  return (
    <div className="flex flex-col items-center gap-2 w-[180px] pt-1">
      <div className="relative">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center">
          {user.avatar_url ? (
            <Image src={user.avatar_url} alt={name} className="w-full h-full" fittingType="fill" />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {(name || "?").slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {training && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#f97316] flex items-center justify-center border-2 border-card">
            <Flame className="w-3 h-3 text-white" />
          </div>
        )}
        {!training && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center border-2 border-card">
            <Radio className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      <div className="text-center">
        <div className="font-semibold text-sm leading-tight">{isMe ? t("home.you") : name}</div>
        {ageGender && <div className="text-xs text-muted-foreground mt-0.5">{ageGender}</div>}
        {training && (
          <div className="text-[11px] text-orange-400 mt-0.5">
            {live ? tWorkout(live.workout_type) : t("home.trainingLive")}
          </div>
        )}
      </div>

      <button
        onClick={onView}
        className="w-full bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded-lg hover:opacity-90 transition"
      >
        {t("home.viewProfile")}
      </button>
    </div>
  );
}