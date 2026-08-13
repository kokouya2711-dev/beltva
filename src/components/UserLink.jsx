import React from "react";
import { Link } from "react-router-dom";
import { displayName, flagEmoji } from "@/lib/profile";
import { useT } from "@/lib/i18n";

export default function UserLink({ user, size = "sm", showName = true, className = "" }) {
  const t = useT();
  if (!user) return <span className="text-muted-foreground">{t("common.anonymous")}</span>;
  const name = displayName(user);
  const initials = name.slice(0, 2).toUpperCase();
  const flag = flagEmoji(user.country);
  const sizeCls = size === "lg" ? "w-12 h-12" : size === "md" ? "w-10 h-10" : "w-8 h-8";
  const textCls = size === "lg" ? "text-base" : "text-sm";
  const flagCls = size === "lg" ? "w-4 h-4 text-[18px] rounded-[4px]" : size === "md" ? "w-3.5 h-3.5 text-[16px] rounded-[3px]" : "w-3 h-3 text-[14px] rounded-[3px]";
  return (
    <Link to={`/profile/${user.id}`} className={`flex items-center gap-2 min-w-0 group ${className}`}>
      <div className={`relative shrink-0`}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={name} className={`${sizeCls} rounded-full object-cover`} />
        ) : (
          <div className={`${sizeCls} rounded-full bg-secondary flex items-center justify-center font-bold text-xs`}>{initials}</div>
        )}
        {flag && (
          <span className={`absolute -bottom-0.5 -right-0.5 ${flagCls} flex items-center justify-center leading-none overflow-hidden shadow-md`}>
            <span className="leading-none">{flag}</span>
          </span>
        )}
      </div>
      {showName && <span className={`font-medium ${textCls} truncate group-hover:text-primary transition`}>{name}</span>}
    </Link>
  );
}