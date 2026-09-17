import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import GenderStep from "@/components/auth/GenderStep";

// 新規登録後の性別選択オンボーディング
// 未設定の場合のみ表示し、設定済みはユーザー名ステップへ転送
export default function GenderOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (cancelled) return;
        const fresh = sessionStorage.getItem("beltva_fresh_register") === "1";
        if (me?.gender && me.gender !== "undisclosed" && !fresh) {
          navigate("/onboarding/username", { replace: true });
          return;
        }
      } catch {
        // 未認証等は ProtectedRoute で処理
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  async function handleContinue(gender) {
    setSaving(true);
    try {
      await base44.auth.updateMe({ gender, gender_change_count: 0 });
      navigate("/onboarding/username", { replace: true });
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
    <GenderStep
      onBack={() => navigate("/onboarding/birthdate", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
    />
  );
}