import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import PurposeStep from "@/components/auth/PurposeStep";
import { safeReturnTo } from "@/lib/authReturnTo";

// 新規登録後の目的選択オンボーディング
// 国・地域選択の次のステップ。
export default function PurposeOnboarding() {
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
        if (user?.training_purpose && !fresh) {
          if (!user?.level) {
            navigate("/onboarding/level" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true });
          } else {
            sessionStorage.removeItem("beltva_fresh_register");
            window.location.href = returnTo;
          }
          return;
        }
      } catch {
        // ProtectedRoute で処理
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [returnTo, navigate]);

  async function handleContinue(purpose) {
    setSaving(true);
    try {
      await base44.auth.updateMe({ training_purpose: purpose });
      navigate("/onboarding/level" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true });
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
    <PurposeStep
      onBack={() => navigate("/onboarding/country" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true })}
      onContinue={handleContinue}
      loading={saving}
      initialValue={me?.training_purpose || ""}
    />
  );
}