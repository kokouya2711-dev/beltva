import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

// 汎用フルスクリーン選択ページ（目的などに使用）
// 区切り線付き・1画面内・スクロールなし
export default function OptionSelectPage({ title, items, selected, onClose, onConfirm }) {
  const [val, setVal] = useState(selected || "");

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-foreground" aria-label="戻る">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-extrabold text-foreground">{title}</span>
        <button onClick={() => onConfirm(val)} className="px-3 py-1.5 -mr-1 text-base font-bold text-primary">
          完了
        </button>
      </header>

      {/* 選択肢 — 区切り線付き、1画面内・スクロールなし */}
      <div className="flex-1 min-h-0">
        <ul>
          {items.map((item, i) => {
            const active = val === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => setVal(item.key)}
                  className="w-full flex items-center px-4 py-3.5"
                >
                  <span className={`flex-1 text-left text-base font-semibold ${active ? "text-primary" : "text-foreground"}`}>{item.label}</span>
                  {active && <Check className="w-5 h-5 text-primary" />}
                </button>
                {i < items.length - 1 && <div className="mx-4 h-px bg-border" />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}