import React from "react";

// 全画面共通の国旗バッジ（仲間・チャット・フィード・プロフィールで同一スタイル）
// 正方形・黒い1px枠のみ・白背景/paddingなし・幅高さ固定・右下へ3px重ねる。
// size: 仲間一覧=14, チャット一覧/タイムライン=12
export default function CountryFlagBadge({ country, size = 14, inset, className = "" }) {
  if (!country || String(country).length !== 2) return null;
  const cc = String(country).toLowerCase();
  // inset: 右下からの内側オフセット(px)。未指定時は枠外に3pxはみ出す(チャット/フィード)。
  // 正の値=画像内側へ、25%程度の重なりにする。
  const pos = inset != null ? inset : -3;
  return (
    <span
      className={`absolute block overflow-hidden rounded-[2px] ring-1 ring-black z-10 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, bottom: pos, right: pos }}
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