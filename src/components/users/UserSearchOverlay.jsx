import React, { useState, useMemo } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { displayName } from "@/lib/profile";
import UserCard from "@/components/UserCard";
import { normalizeAscii, handleOf } from "@/lib/userFilters";

// 特定ユーザーを探す検索オーバーレイ
// ユーザー名＝部分一致、ユーザーID＝前方一致＋完全一致（完全一致を上位）
export default function UserSearchOverlay({ users, me, isOnline, isTraining, onClose }) {
  const [q, setQ] = useState("");
  const nq = normalizeAscii(q);

  const results = useMemo(() => {
    if (!nq) return [];
    return users
      .filter((u) => u.searchable_by_id !== false)
      .map((u) => {
        const name = normalizeAscii(displayName(u));
        const handle = normalizeAscii(handleOf(u));
        let score = -1;
        if (name === nq || handle === nq) score = 100;        // 完全一致（最優先）
        else if (handle.startsWith(nq)) score = 80;           // ID前方一致
        else if (name.startsWith(nq)) score = 60;            // 名前前方一致
        else if (name.includes(nq)) score = 40;              // 名前部分一致
        else if (handle.includes(nq)) score = 20;            // ID部分一致（補助）
        if (score < 0) return null;
        return { u, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map(({ u }) => u);
  }, [users, nq]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3">
        <button onClick={onClose} className="p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground" aria-label="戻る">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ユーザー名またはIDで検索"
            className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {nq && results.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">該当するユーザーが見つかりません</div>
        )}
        {results.map((u) => (
          <UserCard key={u.id} user={u} me={me} isOnline={isOnline(u)} isTraining={isTraining(u)} />
        ))}
      </div>
    </div>
  );
}