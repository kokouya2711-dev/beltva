import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { displayName, flagEmoji, fetchUser } from "@/lib/profile";
import { parseHobbies, hobbyLabel } from "@/lib/hobbies";
import { useT, useI18n } from "@/lib/i18n";
import FollowButton from "@/components/FollowButton";
import UserMenu from "@/components/UserMenu";
import PostCard from "@/components/PostCard";
import { getOrCreateConversation, blockExists, checkDmScope } from "@/lib/dm";
import { Pencil, Mail, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const t = useT();
  const { lang } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favMap, setFavMap] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [u, meUser, ps, fols, fols2] = await Promise.all([
          fetchUser(id),
          base44.auth.me().catch(() => null),
          base44.entities.Post.filter({ created_by_id: id }, "-created_date", 100),
          base44.entities.Follow.filter({ followee_id: id }),
          base44.entities.Follow.filter({ follower_id: id })
        ]);
        setUser(u);
        setMe(meUser);
        setPosts(ps);
        setFollowers(fols.length);
        setFollowing(fols2.length);
        if (meUser && meUser.id !== id) setBlocked(await blockExists(meUser.id, id));
        if (meUser) {
          const myFavs = await base44.entities.Favorite.filter({ created_by_id: meUser.id }).catch(() => []);
          const fMap = {};
          myFavs.forEach((f) => { fMap[f.post_id] = f.id; });
          setFavMap(fMap);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <div className="text-center py-20 text-muted-foreground">{t("profile.notFound")}</div>;

  const isMe = me && me.id === id;
  const fromLikers = location.state?.from === "likers";
  const name = displayName(user);
  const hobbies = parseHobbies(user.hobbies);

  async function startDm() {
    if (blocked) return;
    const { ok, message } = await checkDmScope(me.id, user);
    if (!ok) { toast({ description: message }); return; }
    const conv = await getOrCreateConversation(me.id, id);
    navigate(`/messages/${conv.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5">
      {fromLikers && (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-secondary transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground">{t("common.back")}</span>
        </div>
      )}
      {/* Header card */}
      <div className="glass rounded-3xl border border-border p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={name} className="w-24 h-24 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold">{name.slice(0, 2).toUpperCase()}</div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <h1 className="text-xl font-bold">{name}</h1>
            {user.country && <span className="text-xl">{flagEmoji(user.country)}</span>}
          </div>
          {user.bio && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap max-w-md">{user.bio}</p>}

          <div className="flex items-center gap-6 mt-4 text-sm">
            <Link to={`/profile/${id}/followers`} className="hover:text-primary text-center">
              <div className="font-bold text-foreground">{followers}</div>
              <div className="text-xs text-muted-foreground">{t("profile.followers")}</div>
            </Link>
            <Link to={`/profile/${id}/following`} className="hover:text-primary text-center">
              <div className="font-bold text-foreground">{following}</div>
              <div className="text-xs text-muted-foreground">{t("profile.following")}</div>
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-5">
            {isMe ? (
              <button onClick={() => navigate("/profile/edit")} className="flex items-center gap-1.5 bg-secondary/60 border border-border px-4 py-2 rounded-xl text-sm font-semibold hover:border-primary">
                <Pencil className="w-4 h-4" /> {t("common.edit")}
              </button>
            ) : (
              <>
                <FollowButton targetId={id} meId={me?.id} />
                <button onClick={startDm} disabled={blocked} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                  <Mail className="w-4 h-4" /> {t("common.message")}
                </button>
                <UserMenu meId={me?.id} targetId={id} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hobbies */}
      {hobbies.length > 0 && (
        <div className="glass rounded-2xl border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t("common.hobbies")}</div>
          <div className="flex flex-wrap gap-1.5">
            {hobbies.map((h) => <span key={h} className="text-xs bg-secondary/60 border border-border rounded-full px-2.5 py-1">{hobbyLabel(h, lang)}</span>)}
          </div>
        </div>
      )}

      {/* Training purpose */}
      {user.training_purpose && (
        <div className="glass rounded-2xl border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("common.purpose")}</div>
          <div className="text-sm font-medium text-primary">{t("purpose." + user.training_purpose)}</div>
        </div>
      )}

      {/* Posts */}
      <div>
        <h2 className="font-bold text-lg mb-3">{t("profile.posts")}</h2>
        {posts.length === 0 ? (
          <div className="glass rounded-2xl border border-border py-10 text-center text-sm text-muted-foreground">{t("profile.noPosts")}</div>
        ) : (
          <div className="space-y-4">{posts.map((p) => <PostCard key={p.id} post={p} meId={me?.id} initialFavorited={favMap[p.id] !== undefined} initialFavId={favMap[p.id] ?? null} />)}</div>
        )}
      </div>
    </div>
  );
}