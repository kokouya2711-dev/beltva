import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, UserCheck } from "lucide-react";
import { notify } from "@/lib/dm";
import { useT } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";

export default function FollowButton({ targetId, meId, onChange, size = "md" }) {
  const t = useT();
  const { toast } = useToast();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);

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
    if (inFlight.current || loading) return;
    inFlight.current = true;
    const prev = following;
    setFollowing(!prev); // Optimistic UI update — no intermediate state
    try {
      if (prev) {
        const existing = await base44.entities.Follow.filter({ follower_id: meId, followee_id: targetId });
        for (const f of existing) await base44.entities.Follow.delete(f.id);
      } else {
        await base44.entities.Follow.create({ follower_id: meId, followee_id: targetId });
        notify(targetId, meId, "follow", t("notif.followed"), meId).catch(() => {});
      }
      onChange && onChange();
    } catch (err) {
      setFollowing(prev); // Revert only on failure
      toast({ description: "通信エラーが発生しました" });
    } finally {
      inFlight.current = false;
    }
  }

  if (!meId || !targetId || meId === targetId) return null;

  if (size === "compact") {
    return (
      <button
        onClick={toggle}
        className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition ${
          following
            ? "bg-secondary/40 border-border text-muted-foreground"
            : "bg-primary text-primary-foreground border-primary"
        }`}
      >
        {following ? t("common.following") : t("common.follow")}
      </button>
    );
  }

  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  return (
    <button
      onClick={toggle}
      className={`flex items-center justify-center gap-1.5 font-semibold rounded-xl border transition ${pad} ${
        following
          ? "bg-secondary/60 border-border text-muted-foreground"
          : "bg-primary text-primary-foreground border-primary"
      }`}
    >
      {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      {following ? t("common.following") : t("common.follow")}
    </button>
  );
}