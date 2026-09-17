import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import UsernameStep from "@/components/auth/UsernameStep";

// 新規登録後のユーザー名(表示名)オンボーディング
export default function UsernameOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (cancelled) return;
        if (me?.display_name) {
          navigate("/onboarding/userid", { replace: true });
          return;
        }
      } catch {
        // ProtectedRoute で処理
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  async function handleContinue(name) {
    setSaving(true);
    try {
      await base44.auth.updateMe({ display_name: name });
      navigate("/onboarding/userid", { replace: true });
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
    <UsernameStep
      onBack={() => navigate("/onboarding/birthdate", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
    />
  );
}