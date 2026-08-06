import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import UserLink from "@/components/UserLink";
import FollowButton from "@/components/FollowButton";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchUser } from "@/lib/profile";
import { useT } from "@/lib/i18n";

export default function FollowList({ type }) {
  const { id } = useParams();
  const t = useT();
  const [meId, setMeId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const me = await base44.auth.me().catch(() => null);
        setMeId(me?.id);
        const key = type === "followers" ? "followee_id" : "follower_id";
        const otherKey = type === "followers" ? "follower_id" : "followee_id";
        const follows = await base44.entities.Follow.filter({ [key]: id }, "-created_date", 200);
        const us = await Promise.all(follows.map((f) => fetchUser(f[otherKey])));
        setUsers(us.filter(Boolean));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type]);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-4">
      <Link to={`/profile/${id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> {t("followList.backToProfile")}</Link>
      <h1 className="text-2xl font-bold">{type === "followers" ? t("profile.followers") : t("profile.following")}</h1>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : users.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-10 text-center text-sm text-muted-foreground">{t("followList.empty")}</div>
      ) : (
        <div className="glass rounded-2xl border border-border divide-y divide-border">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <UserLink user={u} size="md" className="flex-1" />
              {meId && meId !== u.id && <FollowButton targetId={u.id} meId={meId} size="sm" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}