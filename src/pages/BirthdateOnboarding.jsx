import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import BirthdateStep from "@/components/auth/BirthdateStep";
import { isEditMode, confirmUrl } from "@/lib/onboardingNav";

function calcAge(bd) {
  const b = new Date(bd);
  const today = new Date();
  let a = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) a--;
  return a;
}

// 新規登録後の生年月日オンボーディング
// 編集モード(from=confirm)の場合はスキップせず表示し、保存後確認画面へ戻る
export default function BirthdateOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const editMode = isEditMode();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (cancelled) return;
        setMe(user);
        const fresh = sessionStorage.getItem("beltva_fresh_register") === "1";
        if (!editMode && me?.birthdate && !fresh) {
          navigate("/onboarding/gender", { replace: true });
          return;
        }
      } catch {
        // 未認証等は ProtectedRoute で処理
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate, editMode]);

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
      if (editMode) {
        navigate(confirmUrl("/"), { replace: true });
      } else {
        navigate("/onboarding/gender", { replace: true });
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
    <BirthdateStep
      onBack={() => editMode ? navigate(confirmUrl("/"), { replace: true }) : navigate("/register", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
      initialValue={me?.birthdate || ""}
    />
  );
}