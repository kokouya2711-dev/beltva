import React from "react";
import { useI18n } from "@/lib/i18n";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { lang, setLang } = useI18n();
  const langs = [{ code: "ja", label: "日本語" }, { code: "en", label: "English" }, { code: "zh", label: "中文" }, { code: "ko", label: "한국어" }];
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end gap-1.5 mb-4">
          {langs.map((l) => <button key={l.code} onClick={() => setLang(l.code)} className={`text-xs px-2.5 py-1 rounded-full border ${lang === l.code ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{l.label}</button>)}
        </div>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}