import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import BirthdateStep from "@/components/auth/BirthdateStep";
import { safeReturnTo } from "@/lib/authReturnTo";

function calcAge(bd) {
  const b = new Date(bd);
  const today = new Date();
  let a = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) a--;
  return a;
}

// 新規登録後の生年月日オンボーディング
// 未設定の場合のみ表示し、設定済みはホームへ転送
export default function BirthdateOnboarding() {
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
        if (me?.birthdate) {
          navigate(returnTo, { replace: true });
          return;
        }
      } catch {
        // 未認証等は ProtectedRoute で処理
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate, returnTo]);

  async function handleContinue(dateStr) {
    setSaving(true);
    try {
      const age = calcAge(dateStr);
      await base44.auth.updateMe({
        birthdate: dateStr,
        registered_birthdate: dateStr,
        birthdate_change_count: 0,
        age,
      });
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
    <BirthdateStep
      onBack={() => navigate("/register", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
    />
  );
}