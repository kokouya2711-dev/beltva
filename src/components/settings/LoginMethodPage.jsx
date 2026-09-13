import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Mail, Chrome, Check } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function LoginMethodPage() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => { setMe(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" /></div>;

  // 実装済みの認証方法のみ表示（Email/Password と Google）
  const methods = [
    { key: "email", icon: Mail, label: "Email / Password", value: me?.email || "", connected: !!me?.email },
    { key: "google", icon: Chrome, label: "Google", value: "", connected: false },
  ].filter((m) => m.key === "email" || m.key === "google");

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="relative flex items-center mb-5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{t("settings.loginMethod")}</h2>
      </div>

      <div className="divide-y divide-border">
        {methods.map((m) => (
          <div key={m.key} className="flex items-center gap-4 py-4">
            <m.icon className="w-6 h-6 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium">{m.label}</div>
              {m.value && <div className="text-sm text-muted-foreground truncate mt-0.5">{m.value}</div>}
            </div>
            {m.connected ? (
              <span className="flex items-center gap-1 text-sm text-primary font-semibold shrink-0">
                <Check className="w-4 h-4" />
              </span>
            ) : (
              <span className="text-sm text-muted-foreground shrink-0">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}