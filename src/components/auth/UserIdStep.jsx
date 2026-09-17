import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, AtSign, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/useScrollLock";
import { base44 } from "@/api/base44Client";

// 登録フロー内のユーザーID(一意ハンドル)ステップ
// プログレスバーは4番目(index 3)をハイライト
// 入力中にバックエンド関数で重複/フォーマットを検証する
const RE = /^[a-z0-9_]{3,20}$/;

export default function UserIdStep({ onBack, onContinue, loading }) {
  const t = useT();
  useScrollLock();
  const [raw, setRaw] = useState("");
  const [status, setStatus] = useState("idle"); // idle | checking | ok | taken | invalid
  const timer = useRef(null);
  const reqId = useRef(0);

  const value = raw.trim().toLowerCase();
  const validFormat = RE.test(value) && !/^[0-9_]/.test(value);

  // 入力変更でデバウンス検証
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!value) { setStatus("idle"); return; }
    if (!validFormat) { setStatus("invalid"); return; }
    setStatus("checking");
    const myId = ++reqId.current;
    timer.current = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke("checkUsernameAvailable", { username: value });
        if (reqId.current !== myId) return;
        const data = res?.data || res;
        if (data?.available) setStatus("ok");
        else if (data?.reason === "taken") setStatus("taken");
        else setStatus("invalid");
      } catch {
        if (reqId.current === myId) setStatus("invalid");
      }
    }, 450);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, validFormat]);

  const canContinue = status === "ok" && !loading;

  let hint = t("auth.userIdUniqueNote");
  let hintColor = "text-muted-foreground";
  if (status === "checking") { hint = t("auth.userIdChecking"); hintColor = "text-muted-foreground"; }
  else if (status === "ok") { hint = t("auth.userIdAvailable"); hintColor = "text-accent"; }
  else if (status === "taken") { hint = t("auth.userIdTaken"); hintColor = "text-destructive"; }
  else if (status === "invalid" && value) { hint = t("auth.userIdInvalid"); hintColor = "text-destructive"; }

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      <header className="flex items-center gap-3 px-4 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 3 ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col px-6 pt-10">
        <h2 className="text-center text-xl font-bold text-foreground">{t("auth.userIdTitle")}</h2>
        <p className="text-center text-sm text-muted-foreground mt-2">{t("auth.userIdSubtitle")}</p>

        <div className="mt-8 w-full h-14 rounded-xl bg-card border border-border px-4 flex items-center gap-2">
          <AtSign className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={t("auth.userIdPlaceholder")}
            maxLength={20}
            className="flex-1 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground lowercase"
            autoFocus
          />
          {status === "checking" && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0" />}
          {status === "ok" && <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />}
          {status === "taken" && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
        </div>
        <p className={`mt-3 text-xs leading-snug ${hintColor}`}>{hint}</p>
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => canContinue && onContinue(value)}
          disabled={!canContinue}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-40"
        >
          {t("auth.continue")}
        </button>
      </div>
    </div>
  );
}