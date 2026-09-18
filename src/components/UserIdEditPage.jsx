import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, AtSign, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useT } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";

// プロフィール編集画面用のユーザーID変更フルスクリーンオーバーレイ
// 入力中にバックエンド関数で重複/フォーマットを検証する
const RE = /^[a-z0-9_]{3,20}$/;

export default function UserIdEditPage({ selected, onClose, onConfirm, saving }) {
  const t = useT();
  useScrollLock();
  const [raw, setRaw] = useState(selected || "");
  const [status, setStatus] = useState("idle"); // idle | checking | ok | taken | invalid
  const timer = useRef(null);
  const reqId = useRef(0);

  const value = raw.trim().toLowerCase();
  const validFormat = RE.test(value) && !/^[0-9_]/.test(value);

  // 入力変更でデバウンス検証
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!value) { setStatus("idle"); return; }
    // 現在のIDと同じならOK扱い
    if (value === (selected || "").toLowerCase()) { setStatus("ok"); return; }
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
  }, [value, validFormat, selected]);

  const canConfirm = status === "ok" && !saving;

  let hint = t("auth.userIdUniqueNote");
  let hintColor = "text-muted-foreground";
  if (status === "checking") { hint = t("auth.userIdChecking"); hintColor = "text-muted-foreground"; }
  else if (status === "ok") { hint = t("auth.userIdAvailable"); hintColor = "text-accent"; }
  else if (status === "taken") { hint = t("auth.userIdTaken"); hintColor = "text-destructive"; }
  else if (status === "invalid" && value) { hint = t("auth.userIdInvalid"); hintColor = "text-destructive"; }

  function handleConfirm() {
    if (!canConfirm) return;
    if (value === (selected || "").toLowerCase()) { onClose(); return; }
    onConfirm(value);
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-background flex flex-col overflow-hidden overscroll-none">
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-extrabold text-foreground">{t("auth.confirmUserId")}</span>
        <button onClick={handleConfirm} disabled={!canConfirm} className="px-3 py-1.5 -mr-1 text-base font-bold text-primary disabled:opacity-40">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : t("common.done")}
        </button>
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
    </div>,
    document.body
  );
}