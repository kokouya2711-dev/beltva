import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { displayName } from "@/lib/profile";
import { parseHobbies } from "@/lib/hobbies";
import UserCard from "@/components/UserCard";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";

const ONLINE_WINDOW = 120000;

const CATEGORIES = [
  { key: "recommended", label: "おすすめ" },
  { key: "common-hobbies", label: "共通の趣味" },
  { key: "same-purpose", label: "同じ目的" },
  { key: "same-country", label: "同じ国" },
  { key: "nearby", label: "近くのユーザー" },
  { key: "online", label: "オンライン中" },
  { key: "training", label: "トレーニング中" },
  { key: "new", label: "新規ユーザー" },
  { key: "following", label: "フォロー中" }
];

const GENDERS = [
  { key: "male", label: "男性" },
  { key: "female", label: "女性" },
  { key: "undisclosed", label: "回答しない" }
];

export default function UsersPage() {
  const t = useT();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});
  const [trainingIds, setTrainingIds] = useState(new Set());
  const [followIds, setFollowIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("recommended");
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    (async () => {
      const meUser = await base44.auth.me().catch(() => null);
      const [us, pres, live, follows] = await Promise.all([
        base44.entities.User.list("-created_date", 200),
        base44.entities.Presence.list("-last_seen", 200).catch(() => []),
        base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 200),
        base44.entities.Follow.filter({ follower_id: meUser?.id || "___" }).catch(() => [])
      ]);
      setMe(meUser);
      setUsers(us.filter((u) => u.id !== meUser?.id));
      const pm = {};
      pres.forEach((p) => { pm[p.created_by_id] = p.last_seen; });
      setPresence(pm);
      setTrainingIds(new Set(live.map((s) => s.created_by_id)));
      setFollowIds(new Set(follows.map((f) => f.followee_id)));
      setLoading(false);
    })();
  }, []);

  const myHobbies = useMemo(() => parseHobbies(me?.hobbies), [me]);
  const myPurpose = me?.training_purpose;
  const myCountry = me?.country;

  function isOnline(u) {
    return !!(presence[u.id] && Date.now() - new Date(presence[u.id]).getTime() < ONLINE_WINDOW);
  }
  function isTraining(u) { return trainingIds.has(u.id); }
  function dist(u) {
    if (!me?.lat || !u.lat) return Infinity;
    return Math.hypot(u.lat - me.lat, u.lng - me.lng);
  }
  function commonHobbiesOf(u) {
    return parseHobbies(u.hobbies).filter((h) => myHobbies.includes(h));
  }

  function recommendInfo(u) {
    const common = commonHobbiesOf(u);
    let score = common.length * 3;
    const reasons = [];
    if (common.length > 0) reasons.push(`共通の趣味${common.length}件`);
    if (myPurpose && u.training_purpose === myPurpose) { score += 2; reasons.push("同じ目的"); }
    if (isOnline(u)) { score += 1; reasons.push("オンライン中"); }
    if (dist(u) < 5) { score += 1; if (reasons.length < 3) reasons.push("近くにいます"); }
    const last = presence[u.id] ? new Date(presence[u.id]).getTime() : 0;
    if (last && Date.now() - last < 3600000) { score += 1; if (reasons.length < 3) reasons.push("最近アクティブ"); }
    return { score, reasons: reasons.slice(0, 2), common };
  }

  const filtered = useMemo(() => {
    let arr = users;
    if (genderFilter) arr = arr.filter((u) => u.gender === genderFilter && u.gender_public === true);
    if (query) arr = arr.filter((u) => (displayName(u) || "").toLowerCase().includes(query.toLowerCase()));

    switch (category) {
      case "online":
        return arr.filter(isOnline).map((u) => ({ u, common: commonHobbiesOf(u) }));
      case "training":
        return arr.filter(isTraining).map((u) => ({ u, common: commonHobbiesOf(u) }));
      case "following":
        return arr.filter((u) => followIds.has(u.id)).map((u) => ({ u, common: commonHobbiesOf(u) }));
      case "same-country":
        return arr.filter((u) => myCountry && u.country === myCountry).map((u) => ({ u, common: commonHobbiesOf(u) }));
      case "same-purpose":
        return arr.filter((u) => myPurpose && u.training_purpose === myPurpose).map((u) => ({ u, common: commonHobbiesOf(u) }));
      case "common-hobbies":
        return arr
          .filter((u) => commonHobbiesOf(u).length > 0)
          .sort((a, b) => commonHobbiesOf(b).length - commonHobbiesOf(a).length)
          .map((u) => ({ u, common: commonHobbiesOf(u) }));
      case "nearby":
        return [...arr].sort((a, b) => dist(a) - dist(b)).map((u) => ({ u, common: commonHobbiesOf(u) }));
      case "new":
        return [...arr].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((u) => ({ u, common: commonHobbiesOf(u) }));
      case "recommended":
      default: {
        const scored = arr
          .map((u) => ({ u, ...recommendInfo(u) }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score);
        if (scored.length > 0) return scored.map((x) => ({ u: x.u, reason: x.reasons, common: x.common }));
        // fallback: show all, newest first, no reason
        return [...arr]
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .map((u) => ({ u, common: commonHobbiesOf(u) }));
      }
    }
  }, [users, category, query, genderFilter, presence, trainingIds, followIds, me, myHobbies, myPurpose, myCountry]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-4">
      <h1 className="text-2xl font-bold">{t("users.title")}</h1>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("users.searchPlaceholder")}
          className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
              category === c.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowFilter((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" /> 詳細フィルター
        {genderFilter && <span className="text-primary">· 性別で絞り込み中</span>}
      </button>
      {showFilter && (
        <div className="glass rounded-xl border border-border p-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">性別</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setGenderFilter("")}
              className={`text-xs px-2.5 py-1 rounded-full border ${genderFilter === "" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
            >
              指定しない
            </button>
            {GENDERS.map((g) => (
              <button
                key={g.key}
                onClick={() => setGenderFilter(g.key)}
                className={`text-xs px-2.5 py-1 rounded-full border ${genderFilter === g.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-12 text-center text-sm text-muted-foreground">
          {category === "recommended"
            ? "まだ他のユーザーがいません。友達を招待して、一緒にトレーニングを始めよう！"
            : t("users.noUsers")}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ u, reason, common }) => (
            <UserCard
              key={u.id}
              user={u}
              me={me}
              isOnline={isOnline(u)}
              isTraining={isTraining(u)}
              reason={reason}
              commonHobbies={common}
            />
          ))}
        </div>
      )}
    </div>
  );
}