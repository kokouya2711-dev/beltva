import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { displayName, fetchUser } from "@/lib/profile";
import UserLink from "@/components/UserLink";
import FollowButton from "@/components/FollowButton";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function FollowListPage() {
  const t = useT();
  const { id, type } = useParams(); // type: "following" | "followers"
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Only the profile owner can view their follow lists
        const meUser = await base44.auth.me().catch(() => null);
        if (!meUser || meUser.id !== id) { setDenied(true); return; }
        const follows = type === "followers"
          ? await base44.entities.Follow.filter({ followee_id: id }).catch(() => [])
          : await base44.entities.Follow.filter({ follower_id: id }).catch(() => []);
        const targetIds = follows.map((f) => (type === "followers" ? f.follower_id : f.followee_id)).filter(Boolean);
        if (!targetIds.length) { setUsers([]); return; }
        const us = await Promise.all(targetIds.map((uid) => fetchUser(uid).catch(() => null)));
        setUsers(us.filter(Boolean));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type, tick]);

  if (denied) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <header className="flex items-center gap-3 pt-5 pb-3">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-secondary transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">{title}</h1>
        </header>
        <div className="text-center py-20 text-sm text-muted-foreground">—</div>
      </div>
    );
  }

  const title = type === "followers" ? t("profile.followers") : t("profile.following");

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10">
      <header className="flex items-center gap-3 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-secondary transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{title}</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-sm text-muted-foreground">—</div>
      ) : (
        <div className="space-y-1">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2">
              <UserLink user={u} size="md" className="flex-1" />
              <FollowButton targetId={u.id} meId={id} size="sm" onChange={() => setTick((tk) => tk + 1)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}