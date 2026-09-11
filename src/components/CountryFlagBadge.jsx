import React from "react";

// 全画面共通の国旗バッジ（仲間・チャット・フィード・プロフィールで同一）
// 18×18pxの小さな正方形、白い1px外枠、内側paddingなし、幅高さ固定。
// 親要素が `relative` であること。画像右下へ15〜20%だけ重なるよう絶対配置。
export default function CountryFlagBadge({ country, className = "" }) {
  if (!country || String(country).length !== 2) return null;
  const cc = String(country).toLowerCase();
  return (
    <span
      className={`absolute block overflow-hidden rounded-[3px] ring-1 ring-white z-10 ${className}`}
      style={{ width: 18, height: 18, minWidth: 18, minHeight: 18, bottom: -3, right: -3 }}
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