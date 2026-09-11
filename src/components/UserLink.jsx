import React from "react";
import { Link } from "react-router-dom";
import { displayName } from "@/lib/profile";
import { useT } from "@/lib/i18n";

import CountryFlagBadge from "@/components/CountryFlagBadge";

export default function UserLink({ user, size = "sm", showName = true, className = "" }) {
  const t = useT();
  if (!user) return <span className="text-muted-foreground">{t("common.anonymous")}</span>;
  const name = displayName(user);
  const initials = name.slice(0, 2).toUpperCase();
  const sizeCls = size === "lg" ? "w-12 h-12" : size === "md" ? "w-10 h-10" : "w-8 h-8";
  const textCls = size === "lg" ? "text-base" : "text-sm";
  return (
    <div className={`flex items-center gap-2 min-w-0 group ${className}`}>
      <Link to={`/profile/${user.id}`} className="relative shrink-0">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={name} className={`${sizeCls} rounded-full object-cover`} />
        ) : (
          <div className={`${sizeCls} rounded-full bg-secondary flex items-center justify-center font-bold text-xs`}>{initials}</div>
        )}
        <CountryFlagBadge country={user.country} size={12} />
      </Link>
      {showName && (
        <Link to={`/profile/${user.id}`} className={`font-medium ${textCls} truncate group-hover:text-primary transition`}>{name}</Link>
      )}
    </div>
  );
}