import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import LevelStep from "@/components/auth/LevelStep";
import { safeReturnTo } from "@/lib/authReturnTo";

// 新規登録後のトレーニングレベル選択オンボーディング
// 目的選択の次のステップ。最終ステップでフラグを解除しホームへ遷移。
export default function LevelOnboarding() {
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
        if (user?.level && !fresh) {
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
  }, [returnTo]);

  async function handleContinue(level) {
    setSaving(true);
    try {
      await base44.auth.updateMe({ level, level_updated_at: new Date().toISOString() });
      sessionStorage.removeItem("beltva_fresh_register");
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

  return (
    <LevelStep
      onBack={() => navigate("/onboarding/purpose" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true })}
      onContinue={handleContinue}
      loading={saving}
      initialValue={me?.level || ""}
    />
  );
}