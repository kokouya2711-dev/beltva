import React from "react";
import { Link } from "react-router-dom";
import { displayName } from "@/lib/profile";

export default function UserLink({ user, size = "sm", showName = true, className = "" }) {
  if (!user) return <span className="text-muted-foreground">匿名</span>;
  const name = displayName(user);
  const initials = name.slice(0, 2).toUpperCase();
  const sizeCls = size === "lg" ? "w-12 h-12" : size === "md" ? "w-10 h-10" : "w-8 h-8";
  const textCls = size === "lg" ? "text-base" : "text-sm";
  return (
    <Link to={`/profile/${user.id}`} className={`flex items-center gap-2 min-w-0 group ${className}`}>
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={name} className={`${sizeCls} rounded-full object-cover shrink-0`} />
      ) : (
        <div className={`${sizeCls} rounded-full bg-secondary flex items-center justify-center font-bold text-xs shrink-0`}>{initials}</div>
      )}
      {showName && <span className={`font-medium ${textCls} truncate group-hover:text-primary transition`}>{name}</span>}
    </Link>
  );
}