import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import LevelStep from "@/components/auth/LevelStep";
import { safeReturnTo } from "@/lib/authReturnTo";
import { isEditMode, confirmUrl } from "@/lib/onboardingNav";

// 新規登録後のトレーニングレベル選択オンボーディング
// 初期フローでは確認画面へ遷移。編集モード(from=confirm)の場合は保存後確認画面へ戻る。
// freshフラグは確認画面の「登録を完了する」でのみ解除。
export default function LevelOnboarding() {
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
        if (!editMode && user?.level && !fresh) {
          sessionStorage.removeItem("beltva_fresh_register");
          window.location.href = returnTo;
          return;
        }
      } catch {
        // ProtectedRoute で処理
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [returnTo, editMode]);

  async function handleContinue(level) {
    setSaving(true);
    try {
      await base44.auth.updateMe({ level, level_updated_at: new Date().toISOString() });
      // 確認画面へ(freshフラグは確認画面で解除)
      navigate(confirmUrl(returnTo), { replace: true });
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
    <LevelStep
      onBack={() => editMode ? navigate(confirmUrl(returnTo), { replace: true }) : navigate("/onboarding/purpose" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true })}
      onContinue={handleContinue}
      loading={saving}
      initialValue={me?.level || ""}
    />
  );
}