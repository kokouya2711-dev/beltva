import React, { useEffect } from "react";

// 国旗タップ時に画面中央へ表示する国名ポップアップ。
// - 国名のみ（各ユーザー言語に合わせる）
// - 横幅約180px / 高さ約90px の角丸長方形
// - 背景は完全に不透明な濃いグレー、控えめなグレー枠、影あり
// - 国名は中央揃え・ネオンイエロー・20px程度・太め
// - 背景を黒30%で暗化。外側タップで閉じる。スクロール位置は変えない。
export default function CountryNamePopup({ countryCode, lang, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Intl.DisplayNames で各国コードからローカライズ国名を取得
  let name = "";
  if (countryCode) {
    try {
      const locale = lang === "zh-TW" ? "zh-Hant" : lang || "en";
      const dn = new Intl.DisplayNames([locale], { type: "region" });
      name = dn.of(String(countryCode).toUpperCase()) || "";
    } catch {
      name = "";
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center text-center"
        style={{
          width: 180,
          height: 90,
          borderRadius: 14,
          background: "hsl(240 6% 10%)",
          border: "1px solid hsl(240 5% 22%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <span
          className="font-bold leading-tight px-2"
          style={{ color: "hsl(75 90% 55%)", fontSize: 20 }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}