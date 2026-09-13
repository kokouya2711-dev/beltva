import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Dumbbell, Users, User } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function DeleteAccountConfirm() {
  const t = useT();
  const navigate = useNavigate();

  const items = [
    { icon: FileText, label: t("del.dataPosts") },
    { icon: Dumbbell, label: t("del.dataRecords") },
    { icon: Users, label: t("del.dataFollows") },
    { icon: User, label: t("del.dataProfile") },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="flex items-center px-3 py-3">
        <button onClick={() => navigate("/settings")} className="p-2.5 -ml-1 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-5 pt-4">
        <h1 className="text-xl font-bold mb-3">{t("del.confirmTitle")}</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t("del.confirmDesc")}</p>

        <div className="space-y-3 mb-8">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-base">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-secondary/50 rounded-xl p-4 mb-8">
          <p className="text-sm leading-relaxed">{t("del.restoreNote")}</p>
        </div>
      </div>

      <div className="px-5 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/settings")}
            className="flex-1 py-3.5 rounded-xl border border-border text-base font-semibold"
          >
            {t("settings.cancel")}
          </button>
          <button
            onClick={() => navigate("/delete-account/verify")}
            className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-semibold"
          >
            {t("del.toVerify")}
          </button>
        </div>
      </div>
    </div>
  );
}