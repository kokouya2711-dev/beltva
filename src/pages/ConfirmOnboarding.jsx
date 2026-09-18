import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import ConfirmStep from "@/components/auth/ConfirmStep";
import { safeReturnTo } from "@/lib/authReturnTo";

// 新規登録後の「登録内容を確認」画面
// 全ステップ完了後の最終確認。同意後にホームへ遷移。
export default function ConfirmOnboarding() {
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
        // 既存ユーザー(新規登録でない)が直接アクセスした場合はホームへ
        if (!fresh) {
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

  async function handleComplete() {
    setSaving(true);
    try {
      sessionStorage.removeItem("beltva_fresh_register");
      window.location.href = returnTo;
    } catch (err) {
      setSaving(false);
      alert(err.message || "エラーが発生しました");
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
    <ConfirmStep
      me={me}
      returnTo={returnTo}
      onBack={() => navigate("/onboarding/level" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true })}
      onComplete={handleComplete}
      saving={saving}
    />
  );
}