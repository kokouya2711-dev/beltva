import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { displayName, fetchUser } from "@/lib/profile";
import { useT, useI18n } from "@/lib/i18n";
import { purposeLabel } from "@/lib/i18nPurposeFilter";
import FollowButton from "@/components/FollowButton";
import UserMenu from "@/components/UserMenu";
import PostCard from "@/components/PostCard";
import AvatarViewer from "@/components/AvatarViewer";
import { getOrCreateConversation, blockExists, checkDmScope } from "@/lib/dm";
import { subscribeFollowChanges } from "@/lib/followStore";
import { getDemoUser } from "@/lib/demoUsers";
import { Mail, Loader2, ArrowLeft, Copy, Target, BarChart3, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// 性別＋年齢ピル（デザイン参照）
function GenderAgePill({ gender, age, agePublic }) {
  if (!gender || gender === "undisclosed") return null;
  const isMale = gender === "male";
  const showAge = agePublic && age != null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${isMale ? "bg-primary text-primary-foreground" : "bg-[#FF6699] text-white"}`}>
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {isMale ? (
          <>
            <circle cx="10" cy="14" r="6" />
            <path d="M14 10 L20 4 M20 4 L15.5 4 M20 4 L20 8.5" />
          </>
        ) : (
          <>
            <circle cx="12" cy="9" r="6" />
            <line x1="12" y1="15" x2="12" y2="22" />
            <line x1="9" y1="19" x2="15" y2="19" />
          </>
        )}
      </svg>
      {showAge && <span className="leading-none">{age}</span>}
    </span>
  );
}

import CountryFlagBadge from "@/components/CountryFlagBadge";
import CountryNamePopup from "@/components/CountryNamePopup";

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
  const [viewingAvatar, setViewingAvatar] = useState(false);
  const [bioClamped, setBioClamped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const bioRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!bioRef.current || bioExpanded) { setBioClamped(false); return; }
    setBioClamped(bioRef.current.scrollHeight > bioRef.current.clientHeight + 2);
  }, [user?.bio, bioExpanded, loading]);

  // Re-fetch counts when any follow/unfollow happens (affects this profile's stats)
  useEffect(() => {
    if (!id || getDemoUser(id)) return;
    const unsub = subscribeFollowChanges(() => {
      base44.entities.Follow.filter({ followee_id: id }).then(fols => setFollowers(fols.length)).catch(() => {});
      base44.entities.Follow.filter({ follower_id: id }).then(fols2 => setFollowing(fols2.length)).catch(() => {});
    });
    return unsub;
  }, [id]);

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
          setFollowers(demo.followers_count || 0);
          setFollowing(demo.following_count || 0);
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
  const postsCount = posts.length;

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
      <header className="flex items-center justify-between pt-5 pb-2">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-secondary transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        {isMe ? (
          <button
            onClick={() => navigate("/profile/edit")}
            className="flex items-center justify-center w-11 h-11 -mr-1.5 rounded-full hover:bg-secondary transition"
            aria-label={t("profile.editTitle")}
          >
            <Pencil className="w-5 h-5" />
          </button>
        ) : (
          <UserMenu meId={me?.id} targetId={id} />
        )}
      </header>

      {/* Identity: avatar + name/gender-age + handle */}
      <div className="flex items-start gap-4 mt-1">
        <div className="relative shrink-0">
          <button type="button" onClick={() => user.avatar_url && setViewingAvatar(true)} className="block">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold">{name.slice(0, 2).toUpperCase()}</div>
            )}
          </button>
          <CountryFlagBadge
            country={user.country}
            size={18}
            inset={5}
            className="cursor-pointer"
            onClick={() => user.country && setShowCountry(true)}
          />
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold truncate">{name}</h1>
            <GenderAgePill gender={user.gender} age={user.age} agePublic={user.age_public} />
          </div>
          {handle && (
            <button onClick={copyHandle} className="flex items-center gap-1 mt-1 text-sm text-foreground/55 font-medium">
              <span className="truncate">{handle}</span>
              <Copy className="w-3.5 h-3.5 shrink-0" />
              {copied && <span className="text-primary text-xs">✓</span>}
            </button>
          )}
        </div>
      </div>

      {/* Bio — full width, max 4 lines + more */}
      {user.bio && (
        <div className="mt-3 text-[15px] text-foreground/90 leading-relaxed font-medium">
          <p ref={bioRef} className={`whitespace-pre-wrap ${bioExpanded ? "" : "line-clamp-4"}`}>{user.bio}</p>
          {(bioClamped || bioExpanded) && (
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
            <div className="flex items-center gap-1.5 text-xs text-foreground/55 font-medium">
              <Target className="w-3.5 h-3.5 text-primary" />
              {t("common.purpose")}
            </div>
            <div className="text-sm font-bold mt-1">{purposeLbl}</div>
          </div>
        )}
        {levelLabel && (
          <div className="flex-1 bg-secondary/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-foreground/55 font-medium">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              {t("profile.level")}
            </div>
            <div className="text-sm font-bold mt-1">{levelLabel}</div>
          </div>
        )}
      </div>

      {/* Stats: posts / following / followers — 3 equal columns with dividers */}
      <div className="grid grid-cols-3 mt-5 py-2">
        <div className="flex flex-col items-center">
          <div className="font-bold text-lg">{postsCount}</div>
          <div className="text-xs text-foreground/55 font-medium">{t("common.post")}</div>
        </div>
        <button onClick={isMe ? () => navigate(`/users/${id}/follows/following`) : undefined} disabled={!isMe} className={`flex flex-col items-center border-x border-border ${isMe ? "hover:opacity-70 transition" : "cursor-default"}`}>
          <div className="font-bold text-lg">{following}</div>
          <div className="text-xs text-foreground/55 font-medium">{t("profile.following")}</div>
        </button>
        <button onClick={isMe ? () => navigate(`/users/${id}/follows/followers`) : undefined} disabled={!isMe} className={`flex flex-col items-center ${isMe ? "hover:opacity-70 transition" : "cursor-default"}`}>
          <div className="font-bold text-lg">{followers}</div>
          <div className="text-xs text-foreground/55 font-medium">{t("profile.followers")}</div>
        </button>
      </div>

      {/* Action bar — only for others, equal width with center divider */}
      {!isMe && (
        <div className="grid grid-cols-2 mt-4">
          <div className="pr-2 [&>button]:w-full">
            <FollowButton targetId={id} meId={me?.id} />
          </div>
          <div className="pl-2 border-l border-border">
            <button onClick={startDm} disabled={blocked} className="w-full flex items-center justify-center gap-1.5 bg-secondary text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              <Mail className="w-4 h-4" /> {t("nav.messages")}
            </button>
          </div>
        </div>
      )}

      {/* Posts header — centered */}
      <h2 className="text-center text-base font-bold mt-5 mb-1">{t("common.post")}</h2>

      {/* Posts — no card, separated by full-width divider */}
      {posts.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">{t("profile.noPosts")}</div>
      ) : (
        <div className="divide-y divide-border">{posts.map((p) => <PostCard key={p.id} post={p} meId={me?.id} initialFavorited={favMap[p.id] !== undefined} initialFavId={favMap[p.id] ?? null} />)}</div>
      )}

      {viewingAvatar && user?.avatar_url && (
        <AvatarViewer url={user.avatar_url} name={name} onClose={() => setViewingAvatar(false)} />
      )}

      {showCountry && (
        <CountryNamePopup countryCode={user.country} lang={lang} onClose={() => setShowCountry(false)} />
      )}
    </div>
  );
}