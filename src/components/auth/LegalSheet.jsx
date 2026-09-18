import React from "react";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/useScrollLock";
import { TERMS, PRIVACY } from "@/lib/legalContent";

function Block({ block }) {
  switch (block.type) {
    case "h3":
      return <h3 className="text-[15px] font-semibold mt-5 mb-1.5 text-foreground">{block.text}</h3>;
    case "p":
      return <p className="text-[14px] leading-[1.65] mb-2.5 text-foreground/90">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc pl-5 mb-2.5 space-y-1">
          {block.items.map((it, i) => (
            <li key={i} className="text-[14px] leading-[1.65] text-foreground/90">{it}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

// 登録確認画面内で利用規約・プライバシーポリシーを表示する全画面オーバーレイ
export default function LegalSheet({ type, onClose }) {
  const t = useT();
  useScrollLock();
  const data = type === "privacy" ? PRIVACY : TERMS;
  const headerTitle = type === "privacy" ? t("auth.privacyPolicy") : t("auth.terms");

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-[slideUp_0.25s_ease-out]">
      <header className="flex items-center gap-2 px-4 pt-[env(safe-area-inset-top)] shrink-0 border-b border-border">
        <button onClick={onClose} className="p-2 -ml-1 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-foreground flex-1">{headerTitle}</span>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+3rem)]">
          <h2 className="text-xl font-bold tracking-tight mb-2">{data.title}</h2>
          <p className="text-[13px] leading-[1.6] text-muted-foreground">Effective date: {data.effective}</p>
          <p className="text-[13px] leading-[1.6] text-muted-foreground mb-4">Last updated: {data.updated}</p>

          {data.intro.map((b, i) => <Block key={i} block={b} />)}

          {data.sections.map((s, si) => (
            <section key={si}>
              <h2 className="text-[17px] font-bold tracking-tight mt-6 mb-2">{s.title}</h2>
              {s.blocks.map((b, bi) => <Block key={bi} block={b} />)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}