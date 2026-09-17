import React from "react";

// BELTVA ロゴ
// 最後の "A" のクロスバーをネオンライムの斜め線に置き換えた版
export default function BeltvaLogo({ className = "", accent = "hsl(var(--primary))" }) {
  return (
    <span className={`inline-flex items-end font-extrabold tracking-tight leading-none ${className}`}>
      <span className="text-foreground">BELTV</span>
      <svg
        viewBox="0 0 32 44"
        className="h-[0.92em] w-auto -ml-[0.04em] text-foreground"
        aria-hidden="true"
      >
        {/* 左脚 */}
        <line x1="3" y1="42" x2="16" y2="4" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
        {/* 右脚 */}
        <line x1="29" y1="42" x2="16" y2="4" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
        {/* 斜めクロスバー(ネオンライム) */}
        <line x1="8.5" y1="29.5" x2="23.5" y2="19" stroke={accent} strokeWidth="3.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}