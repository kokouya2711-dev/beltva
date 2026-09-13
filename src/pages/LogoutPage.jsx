import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function LogoutPage() {
  const t = useT();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function doLogout() {
    setLoggingOut(true);
    try { await base44.auth.logout("/login"); } catch { setLoggingOut(false); }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="relative flex items-center px-3 py-3">
        <button onClick={() => navigate(-1)} className="p-2.5 -ml-1 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{t("settings.logout")}</h1>
      </header>

      <div className="flex-1 px-5 pt-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <LogOut className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-base text-center leading-relaxed mb-8 max-w-xs">{t("settings.logoutConfirm")}</p>
      </div>

      <div className="px-5 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={loggingOut}
            className="flex-1 py-3.5 rounded-xl border border-border text-base font-semibold disabled:opacity-50"
          >
            {t("settings.cancel")}
          </button>
          <button
            onClick={doLogout}
            disabled={loggingOut}
            className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : t("settings.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}