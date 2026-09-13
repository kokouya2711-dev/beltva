import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, RotateCcw } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function RestoreAccount() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      setLoading(false);
      // 削除申請がない、または30日超過の場合は通常ホームへ
      if (u && !u.deletion_requested) {
        navigate("/", { replace: true });
      }
    }).catch(() => setLoading(false));
  }, []);

  const daysLeft = React.useMemo(() => {
    if (!me?.deletion_requested_at) return 30;
    const requested = new Date(me.deletion_requested_at);
    const deadline = new Date(requested.getTime() + 30 * 24 * 60 * 60 * 1000);
    const remaining = Math.ceil((deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, remaining);
  }, [me]);

  async function restore() {
    setRestoring(true);
    try {
      await base44.auth.updateMe({
        deletion_requested: false,
        deletion_requested_at: null,
        timeline_visibility: "everyone",
        searchable_by: "everyone",
        show_online_status: true,
        share_country: true,
      });
      navigate("/", { replace: true });
    } catch {
      setRestoring(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex-1 px-5 pt-12 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <RotateCcw className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-xl font-bold mb-3 text-center">{t("del.restoreTitle")}</h1>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-2 max-w-xs">{t("del.restoreDesc")}</p>
        <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs">{t("del.daysLeft").replace("{n}", daysLeft)}</p>
      </div>

      <div className="px-5 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        <button
          onClick={restore}
          disabled={restoring}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {restoring ? <Loader2 className="w-5 h-5 animate-spin" /> : t("del.restoreButton")}
        </button>
      </div>
    </div>
  );
}