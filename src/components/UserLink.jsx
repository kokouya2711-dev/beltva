import React from "react";
import { Link } from "react-router-dom";
import { displayName } from "@/lib/profile";
import { useT } from "@/lib/i18n";

// 投稿者プロフィール画像右下の小さな正方形国旗バッジ（フラット・真っ直ぐ・角丸）
function CountryFlagBadge({ code, sizeCls }) {
  if (!code || String(code).length !== 2) return null;
  const cc = String(code).toLowerCase();
  const badge = sizeCls === "w-12 h-12" ? "w-4 h-4" : sizeCls === "w-10 h-10" ? "w-3.5 h-3.5" : "w-3 h-3";
  return (
    <span className={`absolute -bottom-0.5 -right-0.5 ${badge} overflow-hidden ring-1 ring-background`}>
      <img
        src={`https://flagcdn.com/w40/${cc}.png`}
        srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
    </span>
  );
}

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
        <CountryFlagBadge code={user.country} sizeCls={sizeCls} />
      </Link>
      {showName && (
        <Link to={`/profile/${user.id}`} className={`font-medium ${textCls} truncate group-hover:text-primary transition`}>{name}</Link>
      )}
    </div>
  );
}