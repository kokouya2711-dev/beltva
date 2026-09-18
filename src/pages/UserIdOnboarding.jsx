import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import UserIdStep from "@/components/auth/UserIdStep";
import { safeReturnTo } from "@/lib/authReturnTo";
import { isEditMode, confirmUrl } from "@/lib/onboardingNav";

// 新規登録後のユーザーID(一意ハンドル)オンボーディング
// 編集モード(from=confirm)の場合はスキップせず表示し、保存後確認画面へ戻る
export default function UserIdOnboarding() {
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
        if (!editMode && me?.username && !fresh) {
          if (!me?.main_language) {
            navigate("/onboarding/language" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true });
          } else if (!me?.country) {
            navigate("/onboarding/country" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true });
          } else {
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
  }, [returnTo, editMode, navigate]);

  async function handleContinue(username) {
    setSaving(true);
    try {
      // 保存直前に再度一意性を検証(競合回避)
      const res = await base44.functions.invoke("checkUsernameAvailable", { username });
      const data = res?.data || res;
      if (!data?.available) {
        setSaving(false);
        alert(data?.reason === "taken" ? "このIDはすでに使われています" : "このIDは使えません");
        return;
      }
      await base44.auth.updateMe({ username });
      if (editMode) {
        navigate(confirmUrl(returnTo), { replace: true });
      } else {
        // メイン言語選択へ(フラグは最終ステップで解除)
        navigate("/onboarding/language", { replace: true });
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
    <UserIdStep
      onBack={() => editMode ? navigate(confirmUrl(returnTo), { replace: true }) : navigate("/onboarding/username", { replace: true })}
      onContinue={handleContinue}
      loading={saving}
      initialValue={me?.username || ""}
    />
  );
}