import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import LanguageStep from "@/components/auth/LanguageStep";
import { safeReturnTo } from "@/lib/authReturnTo";
import { isEditMode, confirmUrl } from "@/lib/onboardingNav";

// 新規登録後のメイン言語(フィード言語)オンボーディング
// 一度設定したら変更不可。編集モード(from=confirm)の場合はスキップせず表示。
export default function LanguageOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const returnTo = safeReturnTo();
  const editMode = isEditMode();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (cancelled) return;
        setMe(user);
        const fresh = sessionStorage.getItem("beltva_fresh_register") === "1";
        if (!editMode && me?.main_language && !fresh) {
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
  }, [returnTo, editMode]);

  async function handleContinue(code) {
    setSaving(true);
    try {
      await base44.auth.updateMe({ main_language: code });
      if (editMode) {
        navigate(confirmUrl(returnTo), { replace: true });
      } else {
        navigate("/onboarding/country" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true });
      }
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
      onBack={() => editMode ? navigate(confirmUrl(returnTo), { replace: true }) : navigate("/onboarding/userid", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
      initialValue={me?.main_language || ""}
    />
  );
}