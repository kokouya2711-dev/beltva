import React from "react";

// 全画面共通の国旗バッジ（仲間・チャット・フィード・プロフィールで同一スタイル）
// 正方形・黒い1px枠のみ・白背景/paddingなし・幅高さ固定・右下へ3px重ねる。
// size: 仲間一覧=14, チャット一覧/タイムライン=12
export default function CountryFlagBadge({ country, size = 14, className = "" }) {
  if (!country || String(country).length !== 2) return null;
  const cc = String(country).toLowerCase();
  return (
    <span
      className={`absolute block overflow-hidden rounded-[2px] ring-1 ring-black z-10 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, bottom: -3, right: -3 }}
    >
      <img
        src={`https://flagcdn.com/w40/${cc}.png`}
        srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
        alt=""
        className="block w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
    </span>
  );
}