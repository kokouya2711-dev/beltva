import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import GenderStep from "@/components/auth/GenderStep";
import { isEditMode, confirmUrl } from "@/lib/onboardingNav";

// 新規登録後の性別選択オンボーディング
// 編集モード(from=confirm)の場合はスキップせず表示し、保存後確認画面へ戻る
export default function GenderOnboarding() {
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
        if (!editMode && me?.gender && me.gender !== "undisclosed" && !fresh) {
          navigate("/onboarding/username", { replace: true });
          return;
        }
      } catch {
        // 未認証等は ProtectedRoute で処理
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate, editMode]);

  async function handleContinue(gender) {
    setSaving(true);
    try {
      await base44.auth.updateMe({ gender, gender_change_count: 0 });
      if (editMode) {
        navigate(confirmUrl("/"), { replace: true });
      } else {
        navigate("/onboarding/username", { replace: true });
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
    <GenderStep
      onBack={() => editMode ? navigate(confirmUrl("/"), { replace: true }) : navigate("/onboarding/birthdate", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
      initialValue={me?.gender && me.gender !== "undisclosed" ? me.gender : ""}
    />
  );
}