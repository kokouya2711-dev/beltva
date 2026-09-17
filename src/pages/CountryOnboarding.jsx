import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import CountryStep from "@/components/auth/CountryStep";
import { safeReturnTo } from "@/lib/authReturnTo";

// 新規登録後の国・地域オンボーディング
// メイン言語選択の次のステップ。最終ステップでフラグを解除しホームへ遷移。
export default function CountryOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const returnTo = safeReturnTo();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (cancelled) return;
        setMe(user);
        const fresh = sessionStorage.getItem("beltva_fresh_register") === "1";
        if (user?.country && !fresh) {
          sessionStorage.removeItem("beltva_fresh_register");
          try { sessionStorage.removeItem("beltva_country_draft"); } catch {}
          window.location.href = returnTo;
          return;
        }
      } catch {
        // ProtectedRoute で処理
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [returnTo]);

  async function handleContinue(code) {
    setSaving(true);
    try {
      const userLang = me?.main_language || "ja";
      let countryName = code;
      try {
        const locale = userLang === "zh-TW" ? "zh-TW" : userLang;
        const dn = new Intl.DisplayNames([locale], { type: "region" });
        countryName = dn.of(code) || code;
      } catch {}
      await base44.auth.updateMe({ country: code, country_name: countryName });
      sessionStorage.removeItem("beltva_fresh_register");
      try { sessionStorage.removeItem("beltva_country_draft"); } catch {}
      window.location.href = returnTo;
    } catch (err) {
      setSaving(false);
      alert(err.message || "保存に失敗しました");
    }
  }

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const draftFromStorage = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("beltva_country_draft") : "") || "";

  return (
    <CountryStep
      onBack={() => navigate("/onboarding/language", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
      initialCountry={me?.country || draftFromStorage || ""}
      userLang={me?.main_language || "ja"}
    />
  );
}