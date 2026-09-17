import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import LanguageStep from "@/components/auth/LanguageStep";
import { safeReturnTo } from "@/lib/authReturnTo";

// 新規登録後のメイン言語(フィード言語)オンボーディング
// 一度設定したら変更不可。最終ステップでフラグを解除しホームへ遷移。
export default function LanguageOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const returnTo = safeReturnTo();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (cancelled) return;
        const fresh = sessionStorage.getItem("beltva_fresh_register") === "1";
        if (me?.main_language && !fresh) {
          if (me?.country) {
            sessionStorage.removeItem("beltva_fresh_register");
            window.location.href = returnTo;
          } else {
            navigate("/onboarding/country" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true });
          }
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
      await base44.auth.updateMe({ main_language: code });
      navigate("/onboarding/country" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true });
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

  return (
    <LanguageStep
      onBack={() => navigate("/onboarding/userid", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
    />
  );
}