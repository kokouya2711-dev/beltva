import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { displayName, flagEmoji, computeStats, formatDuration, fetchUser } from "@/lib/profile";
import FollowButton from "@/components/FollowButton";
import UserMenu from "@/components/UserMenu";
import PostCard from "@/components/PostCard";
import { getOrCreateConversation, blockExists } from "@/lib/dm";
import { Pencil, Target, Dumbbell, Ruler, Weight, Trophy, Flame, Clock, Calendar, Users, Activity, Loader2, Mail } from "lucide-react";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null);
  const [records, setRecords] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [u, meUser, recs, ps, fols, fols2] = await Promise.all([
          fetchUser(id),
          base44.auth.me().catch(() => null),
          base44.entities.WorkoutRecord.filter({ created_by_id: id }, "-created_date", 500),
          base44.entities.Post.filter({ created_by_id: id }, "-created_date", 100),
          base44.entities.Follow.filter({ followee_id: id }),
          base44.entities.Follow.filter({ follower_id: id })
        ]);
        setUser(u);
        setMe(meUser);
        setRecords(recs);
        setPosts(ps);
        setFollowers(fols.length);
        setFollowing(fols2.length);
        if (meUser && meUser.id !== id) setBlocked(await blockExists(meUser.id, id));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <div className="text-center py-20 text-muted-foreground">ユーザーが見つかりません</div>;

  const stats = computeStats(records);
  const isMe = me && me.id === id;
  const name = displayName(user);

  async function startDm() {
    if (blocked) return;
    const conv = await getOrCreateConversation(me.id, id);
    navigate(`/messages/${conv.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
      <div className="glass rounded-3xl border border-border p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row gap-5">
          <div className="shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={name} className="w-24 h-24 rounded-2xl object-cover border border-border" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center text-2xl font-bold">{name.slice(0, 2).toUpperCase()}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{name}</h1>
              {user.country && <span className="text-2xl">{flagEmoji(user.country)}</span>}
            </div>
            {user.bio && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{user.bio}</p>}
            <div className="flex items-center gap-5 mt-4 text-sm">
              <Link to={`/profile/${id}/followers`} className="hover:text-primary"><b className="text-foreground">{followers}</b> <span className="text-muted-foreground">フォロワー</span></Link>
              <Link to={`/profile/${id}/following`} className="hover:text-primary"><b className="text-foreground">{following}</b> <span className="text-muted-foreground">フォロー中</span></Link>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {isMe ? (
              <button onClick={() => navigate(`/profile/edit`)} className="flex items-center gap-1.5 bg-secondary/60 border border-border px-4 py-2 rounded-xl text-sm font-semibold hover:border-primary">
                <Pencil className="w-4 h-4" /> 編集
              </button>
            ) : (
              <>
                <FollowButton targetId={id} meId={me?.id} />
                <button onClick={startDm} disabled={blocked} className="flex items-center gap-1.5 bg-secondary/60 border border-border px-3 py-2 rounded-xl text-sm font-semibold hover:border-primary disabled:opacity-50">
                  <Mail className="w-4 h-4" /> メッセージ
                </button>
                <UserMenu meId={me?.id} targetId={id} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {user.fitness_goal && <Info icon={Target} label="Fitness Goal" value={user.fitness_goal} />}
        {user.training_history && <Info icon={Calendar} label="トレーニング歴" value={user.training_history} />}
        {user.specialty && <Info icon={Dumbbell} label="得意種目" value={user.specialty} />}
        {user.height_public && user.height_cm && <Info icon={Ruler} label="身長" value={`${user.height_cm} cm`} />}
        {user.weight_public && user.weight_kg && <Info icon={Weight} label="体重" value={`${user.weight_kg} kg`} />}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Activity} label="総トレ回数" value={stats.sessions} />
        <Stat icon={Clock} label="合計時間" value={formatDuration(stats.totalSeconds)} />
        <Stat icon={Flame} label="ストリーク" value={`${stats.streak}日`} />
        <Stat icon={Trophy} label="PR種目数" value={stats.prs.length} />
      </div>

      {stats.prs.length > 0 && (
        <div>
          <SectionTitle icon={Trophy} title="PR一覧" />
          <div className="glass rounded-2xl border border-border divide-y divide-border">
            {stats.prs.map((pr) => (
              <div key={pr.workout_type} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{pr.workout_type}</span>
                <span className="font-bold text-primary">{pr.value} {pr.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle icon={Users} title="投稿一覧" />
        {posts.length === 0 ? (
          <div className="glass rounded-2xl border border-border py-10 text-center text-sm text-muted-foreground">まだ投稿がありません</div>
        ) : (
          <div className="space-y-4">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="glass rounded-2xl border border-border p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="w-3.5 h-3.5" /> {label}</div>
      <div className="text-sm font-medium mt-1.5">{value}</div>
    </div>
  );
}
function Stat({ icon: Icon, label, value }) {
  return (
    <div className="glass rounded-2xl border border-border p-4">
      <Icon className="w-5 h-5 text-primary" />
      <div className="mt-2 text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
function SectionTitle({ icon: Icon, title }) {
  return <div className="flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-primary" /><h2 className="font-bold text-lg">{title}</h2></div>;
}