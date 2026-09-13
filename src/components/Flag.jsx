import React from "react";

// 言語コード → 国旗(ISO 3166)の対応。真っ直ぐな矩形国旗を flagcdn から表示。
const LANG_TO_COUNTRY = {
  ja: "jp", en: "us", fr: "fr", es: "es", pt: "br", de: "de", it: "it",
  ru: "ru", ar: "sa", tr: "tr", ko: "kr", zh: "cn", "zh-TW": "tw",
  id: "id", th: "th", vi: "vn",
};

export default function Flag({ code, className = "w-5 h-3.5 rounded-[3px] object-cover" }) {
  const cc = LANG_TO_COUNTRY[code];
  if (!cc) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      alt=""
      className={className}
      loading="lazy"
      draggable={false}
    />
  );
}