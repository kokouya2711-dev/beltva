import React, { useState } from "react";
import { useI18n, LANGS } from "@/lib/i18n";
import { Globe, ChevronDown } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4 relative">
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-card/60 hover:border-primary/40">
            <Globe className="w-3.5 h-3.5" /> {current.label} <ChevronDown className="w-3 h-3" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 glass rounded-xl border border-border py-1 max-h-72 overflow-y-auto w-40">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/60 ${lang === l.code ? "text-primary" : ""}`}>{l.label}</button>
                ))}
              </div>
            </>
          )}
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