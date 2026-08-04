import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { notify } from "@/lib/dm";

export default function FollowButton({ targetId, meId, onChange, size = "md" }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!meId || !targetId || meId === targetId) { setLoading(false); return; }
      const f = await base44.entities.Follow.filter({ follower_id: meId, followee_id: targetId });
      if (active) { setFollowing(f.length > 0); setLoading(false); }
    })();
    return () => { active = false; };
  }, [meId, targetId]);

  async function toggle() {
    if (pending || loading) return;
    setPending(true);
    try {
      if (following) {
        const existing = await base44.entities.Follow.filter({ follower_id: meId, followee_id: targetId });
        for (const f of existing) await base44.entities.Follow.delete(f.id);
        setFollowing(false);
      } else {
        await base44.entities.Follow.create({ follower_id: meId, followee_id: targetId });
        setFollowing(true);
        notify(targetId, meId, "follow", "あなたをフォローしました", meId).catch(() => {});
      }
      onChange && onChange();
    } finally {
      setPending(false);
    }
  }

  if (!meId || !targetId || meId === targetId) return null;
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      onClick={toggle}
      disabled={loading || pending}
      className={`flex items-center gap-1.5 font-semibold rounded-xl border transition disabled:opacity-50 ${pad} ${
        following
          ? "bg-secondary/60 border-border text-muted-foreground hover:border-red-500/40 hover:text-red-400"
          : "bg-primary text-primary-foreground border-primary hover:opacity-90"
      }`}
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      {following ? "フォロー中" : "フォロー"}
    </button>
  );
}