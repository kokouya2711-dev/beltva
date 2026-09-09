import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { displayName, fetchUser } from "@/lib/profile";
import { useT, useI18n } from "@/lib/i18n";
import { purposeLabel } from "@/lib/i18nPurposeFilter";
import FollowButton from "@/components/FollowButton";
import UserMenu from "@/components/UserMenu";
import PostCard from "@/components/PostCard";
import { getOrCreateConversation, blockExists, checkDmScope } from "@/lib/dm";
import { getDemoUser } from "@/lib/demoUsers";
import { Pencil, Mail, Loader2, ArrowLeft, Copy, Target, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// 性別＋年齢ピル（デザイン参照）
function GenderAgePill({ gender, age, agePublic }) {
  if (!gender || gender === "undisclosed") return null;
  const isMale = gender === "male";
  const showAge = agePublic && age != null;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${isMale ? "bg-primary text-primary-foreground" : "bg-[#FF6699] text-white"}`}>
      <span>{isMale ? "♂" : "♀"}</span>
      {showAge && <span>{age}</span>}
    </span>
  );
}

// 四角形の国旗（user.countryはISO 3166-1 alpha-2）
function SquareFlag({ country }) {
  if (!country || country.length !== 2) return null;
  const cc = country.toLowerCase();
  return (
    <span className="block w-6 h-4 rounded-[3px] overflow-hidden ring-2 ring-background">
      <img
        src={`https://flagcdn.com/w40/${cc}.png`}
        srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
    </span>
  );
}

export default function Profile() {
  const t = useT();
  const { lang } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favMap, setFavMap] = useState({});
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioClamped, setBioClamped] = useState(false);
  const [copied, setCopied] = useState(false);
  const bioRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!bioRef.current || bioExpanded) { setBioClamped(false); return; }
    setBioClamped(bioRef.current.scrollHeight > bioRef.current.clientHeight + 2);
  }, [user?.bio, bioExpanded, loading]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // デモユーザー（モック）の場合はAPIを呼ばずモックデータを使用
        const demo = getDemoUser(id);
        if (demo) {
          const meUser = await base44.auth.me().catch(() => null);
          setUser(demo);
          setMe(meUser);
          setPosts([]);
          setFollowers(0);
          setFollowing(0);
          return;
        }
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
  const name = displayName(user);
  const handle = user.email ? "@" + user.email.split("@")[0] : "";
  const levelLabel = user.level ? t("level." + user.level) : "";
  const purposeLbl = user.training_purpose ? purposeLabel(lang, user.training_purpose) : "";

  async function startDm() {
    if (blocked) return;
    const { ok, message } = await checkDmScope(me.id, user);
    if (!ok) { toast({ description: message }); return; }
    const conv = await getOrCreateConversation(me.id, id);
    navigate(`/messages/${conv.id}`);
  }

  function copyHandle() {
    if (!handle) return;
    try {
      navigator.clipboard?.writeText(handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10">
      {/* Header */}
      <header className="flex items-center justify-between py-3">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-secondary transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        {isMe ? (
          <button onClick={() => navigate("/profile/edit")} className="p-1.5 -mr-1.5 rounded-full hover:bg-secondary transition">
            <Pencil className="w-5 h-5" />
          </button>
        ) : (
          <UserMenu meId={me?.id} targetId={id} />
        )}
      </header>

      {/* Identity: avatar + name/gender-age + handle */}
      <div className="flex items-start gap-3 mt-1">
        <div className="relative shrink-0">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold">{name.slice(0, 2).toUpperCase()}</div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5">
            <SquareFlag country={user.country} />
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold truncate">{name}</h1>
            <GenderAgePill gender={user.gender} age={user.age} agePublic={user.age_public} />
          </div>
          {handle && (
            <button onClick={copyHandle} className="flex items-center gap-1 mt-0.5 text-sm text-muted-foreground">
              <span className="truncate">{handle}</span>
              <Copy className="w-3 h-3 shrink-0" />
              {copied && <span className="text-primary text-xs">✓</span>}
            </button>
          )}
        </div>
      </div>

      {/* Bio — max 4 lines + more */}
      {user.bio && (
        <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
          <p className={`whitespace-pre-wrap ${bioExpanded ? "" : "line-clamp-4"}`}>{user.bio}</p>
          {bioLong && (
            <button onClick={() => setBioExpanded(v => !v)} className="text-primary text-xs font-semibold mt-1">
              {bioExpanded ? t("common.close") : t("common.more")}
            </button>
          )}
        </div>
      )}

      {/* Tags: Goal + Level */}
      <div className="flex gap-2 mt-4">
        {purposeLbl && (
          <div className="flex-1 bg-secondary/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="w-3.5 h-3.5 text-primary" />
              {t("common.purpose")}
            </div>
            <div className="text-sm font-semibold mt-1">{purposeLbl}</div>
          </div>
        )}
        {levelLabel && (
          <div className="flex-1 bg-secondary/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              {t("profile.level")}
            </div>
            <div className="text-sm font-semibold mt-1">{levelLabel}</div>
          </div>
        )}
      </div>

      {/* Stats: posts / following / followers */}
      <div className="flex items-center justify-around mt-4 py-1">
        <div className="text-center">
          <div className="font-bold">{posts.length}</div>
          <div className="text-xs text-muted-foreground">{t("common.post")}</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <Link to={`/profile/${id}/following`} className="text-center">
          <div className="font-bold">{following}</div>
          <div className="text-xs text-muted-foreground">{t("profile.following")}</div>
        </Link>
        <div className="w-px h-8 bg-border" />
        <Link to={`/profile/${id}/followers`} className="text-center">
          <div className="font-bold">{followers}</div>
          <div className="text-xs text-muted-foreground">{t("profile.followers")}</div>
        </Link>
      </div>

      {/* Action bar — only for others */}
      {!isMe && (
        <div className="flex gap-2 mt-4">
          <div className="flex-1 [&>button]:w-full">
            <FollowButton targetId={id} meId={me?.id} />
          </div>
          <button onClick={startDm} disabled={blocked} className="flex-1 flex items-center justify-center gap-1.5 bg-secondary text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
            <Mail className="w-4 h-4" /> {t("common.message")}
          </button>
        </div>
      )}

      {/* Posts header — centered */}
      <h2 className="text-center text-base font-bold mt-8 mb-3">{t("common.post")}</h2>

      {/* Posts — directly on background, no card */}
      {posts.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">{t("profile.noPosts")}</div>
      ) : (
        <div className="space-y-4">{posts.map((p) => <PostCard key={p.id} post={p} meId={me?.id} initialFavorited={favMap[p.id] !== undefined} initialFavId={favMap[p.id] ?? null} />)}</div>
      )}
    </div>
  );
}