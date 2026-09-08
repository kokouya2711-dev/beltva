import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

// レベル選択専用フルスクリーンページ
// 説明文（変更頻度）をタイトル下・選択肢上に常時表示
export default function LevelSelectPage({ title, items, selected, lockedUntil, onClose, onConfirm }) {
  const [val, setVal] = useState(selected || "");

  const locked = !!lockedUntil;
  const dateStr = locked
    ? `${lockedUntil.getFullYear()}年${lockedUntil.getMonth() + 1}月${lockedUntil.getDate()}日`
    : null;

  return (
    <div className="fixed inset-0 z-[70] bg-background flex flex-col overflow-hidden overscroll-none">
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-foreground" aria-label="戻る">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-extrabold text-foreground">{title}</span>
        <button onClick={() => onConfirm(val)} className="px-3 py-1.5 -mr-1 text-base font-bold text-primary">
          完了
        </button>
      </header>

      {/* 説明文エリア — タイトル下・選択肢上 */}
      <div className="px-4 pt-1 pb-3 shrink-0">
        <p className="text-xs text-muted-foreground leading-snug">レベルは1年に1回変更できます</p>
        {locked ? (
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            次回変更可能：<span className="text-primary font-medium">{dateStr}</span>
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/70 leading-snug mt-0.5">変更後は365日間、再変更できません</p>
        )}
      </div>

      {/* 選択肢 — 区切り線付き、1画面内 */}
      <div className="shrink-0">
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