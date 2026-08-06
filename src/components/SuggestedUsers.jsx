import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import UserLink from "@/components/UserLink";
import FollowButton from "@/components/FollowButton";
import { UserPlus } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function SuggestedUsers({ meId }) {
  const t = useT();
  const [users, setUsers] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    (async () => {
      if (!meId) return;
      const [posts, recs, lives, follows] = await Promise.all([
        base44.entities.Post.list("-created_date", 50).catch(() => []),
        base44.entities.WorkoutRecord.list("-created_date", 50).catch(() => []),
        base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 50).catch(() => []),
        base44.entities.Follow.filter({ follower_id: meId })
      ]);
      const followingIds = new Set(follows.map((f) => f.followee_id));
      const map = {};
      [...posts, ...recs, ...lives].forEach((r) => {
        const u = r.created_by;
        if (u && u.id && u.id !== meId && !followingIds.has(u.id)) map[u.id] = u;
      });
      setUsers(Object.values(map).slice(0, 5));
    })();
  }, [meId, tick]);

  if (!meId || users.length === 0) return null;
  return (
    <div className="glass rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-sm">{t("suggested.title")}</h3>
      </div>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <UserLink user={u} size="md" className="flex-1" />
            <FollowButton targetId={u.id} meId={meId} size="sm" onChange={() => setTick((tk) => tk + 1)} />
          </div>
        ))}
      </div>
    </div>
  );
}