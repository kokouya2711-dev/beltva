import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useT, useI18n, LANGS } from "@/lib/i18n";
import { displayName, COUNTRIES, flagEmoji } from "@/lib/profile";
import { parseHobbies, ALL_HOBBIES, TRAINING_PURPOSES } from "@/lib/hobbies";
import UserCard from "@/components/UserCard";
import { Loader2, Search, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const ONLINE_WINDOW = 120000;

const CATEGORIES = [
  { key: "recommended", label: "おすすめ" },
  { key: "online", label: "オンライン中" },
  { key: "training", label: "トレーニング中" },
  { key: "nearby", label: "近く" },
  { key: "common-hobbies", label: "共通の趣味" },
  { key: "same-purpose", label: "同じ目的" },
  { key: "same-language", label: "同じ言語" },
  { key: "same-country", label: "同じ国" },
  { key: "new", label: "新規ユーザー" },
  { key: "following", label: "フォロー中" }
];

const GENDERS = [
  { key: "male", label: "男性" },
  { key: "female", label: "女性" },
  { key: "undisclosed", label: "回答しない" }
];

const inputCls = "w-full bg-secondary/60 border border-border rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-primary";

function parseLanguages(s) {
  try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; }
}

export default function UsersPage() {
  const t = useT();
  const { lang } = useI18n();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});
  const [trainingIds, setTrainingIds] = useState(new Set());
  const [followIds, setFollowIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("recommended");
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // detailed filters
  const [fCountry, setFCountry] = useState("");
  const [fLang, setFLang] = useState("");
  const [fAgeMin, setFAgeMin] = useState("");
  const [fAgeMax, setFAgeMax] = useState("");
  const [fGender, setFGender] = useState("");
  const [fHobby, setFHobby] = useState("");
  const [fPurpose, setFPurpose] = useState("");
  const [fOnlineOnly, setFOnlineOnly] = useState(false);

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
  const myLanguages = useMemo(() => parseLanguages(me?.languages), [me]);

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
  function langsOf(u) { return parseLanguages(u.languages); }

  function recommendInfo(u) {
    const common = commonHobbiesOf(u);
    let score = common.length * 3;
    const reasons = [];
    if (common.length > 0) reasons.push(`共通の趣味${common.length}件`);
    if (myPurpose && u.training_purpose === myPurpose) { score += 2; if (reasons.length < 3) reasons.push("同じ目的"); }
    const refLangs = myLanguages.length > 0 ? myLanguages : [lang];
    if (langsOf(u).some((c) => refLangs.includes(c))) { score += 1; if (reasons.length < 3) reasons.push("同じ言語"); }
    if (isOnline(u)) { score += 1; if (reasons.length < 3) reasons.push("オンライン中"); }
    if (dist(u) < 5) { score += 1; if (reasons.length < 3) reasons.push("近くにいます"); }
    const last = presence[u.id] ? new Date(presence[u.id]).getTime() : 0;
    if (last && Date.now() - last < 3600000) { score += 1; if (reasons.length < 3) reasons.push("最近アクティブ"); }
    if (!last && new Date(u.created_date) && Date.now() - new Date(u.created_date).getTime() < 604800000) {
      score += 1; if (reasons.length < 3) reasons.push("新規ユーザー");
    }
    return { score, reasons: reasons.slice(0, 2), common };
  }

  const filterCount = [fCountry, fLang, fAgeMin, fAgeMax, fGender, fHobby, fPurpose].filter(Boolean).length + (fOnlineOnly ? 1 : 0);
  const hasFilter = filterCount > 0;

  function resetFilter() {
    setFCountry(""); setFLang(""); setFAgeMin(""); setFAgeMax("");
    setFGender(""); setFHobby(""); setFPurpose(""); setFOnlineOnly(false);
  }

  const filtered = useMemo(() => {
    let arr = users;
    if (fCountry) arr = arr.filter((u) => u.country === fCountry);
    if (fLang) arr = arr.filter((u) => langsOf(u).includes(fLang));
    if (fAgeMin) arr = arr.filter((u) => u.age != null && u.age >= Number(fAgeMin));
    if (fAgeMax) arr = arr.filter((u) => u.age != null && u.age <= Number(fAgeMax));
    if (fGender) arr = arr.filter((u) => u.gender === fGender && u.gender_public === true);
    if (fHobby) arr = arr.filter((u) => parseHobbies(u.hobbies).includes(fHobby));
    if (fPurpose) arr = arr.filter((u) => u.training_purpose === fPurpose);
    if (fOnlineOnly) arr = arr.filter(isOnline);
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
      case "same-language": {
        const refLangs = myLanguages.length > 0 ? myLanguages : [lang];
        return arr
          .filter((u) => langsOf(u).some((c) => refLangs.includes(c)))
          .map((u) => ({ u, common: commonHobbiesOf(u) }));
      }
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
          .sort((a, b) => b.score - a.score || (new Date(b.u.created_date) - new Date(a.u.created_date)));
        return scored.map((x) => ({ u: x.u, reason: x.reasons, common: x.common }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, category, query, fCountry, fLang, fAgeMin, fAgeMax, fGender, fHobby, fPurpose, fOnlineOnly, presence, trainingIds, followIds, me, myHobbies, myPurpose, myCountry, myLanguages, lang]);

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

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
              category === c.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
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
        {hasFilter && <span className="text-primary">· {filterCount}件適用中</span>}
        {showFilter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showFilter && (
        <div className="glass rounded-xl border border-border p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FilterField label="国">
              <select value={fCountry} onChange={(e) => setFCountry(e.target.value)} className={inputCls}>
                <option value="">指定しない</option>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{flagEmoji(c.code)} {c.name}</option>)}
              </select>
            </FilterField>
            <FilterField label="言語">
              <select value={fLang} onChange={(e) => setFLang(e.target.value)} className={inputCls}>
                <option value="">指定しない</option>
                {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </FilterField>
            <FilterField label="年齢">
              <div className="flex items-center gap-1">
                <input type="number" value={fAgeMin} onChange={(e) => setFAgeMin(e.target.value)} placeholder="下" className={inputCls} min="13" />
                <span className="text-muted-foreground text-xs">〜</span>
                <input type="number" value={fAgeMax} onChange={(e) => setFAgeMax(e.target.value)} placeholder="上" className={inputCls} min="13" />
              </div>
            </FilterField>
            <FilterField label="性別">
              <select value={fGender} onChange={(e) => setFGender(e.target.value)} className={inputCls}>
                <option value="">指定しない</option>
                {GENDERS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </FilterField>
            <FilterField label="趣味">
              <select value={fHobby} onChange={(e) => setFHobby(e.target.value)} className={inputCls}>
                <option value="">指定しない</option>
                {ALL_HOBBIES.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </FilterField>
            <FilterField label="トレーニング目的">
              <select value={fPurpose} onChange={(e) => setFPurpose(e.target.value)} className={inputCls}>
                <option value="">指定しない</option>
                {TRAINING_PURPOSES.map((p) => <option key={p.key} value={p.key}>{t("purpose." + p.key)}</option>)}
              </select>
            </FilterField>
            <FilterField label="オンライン状態">
              <label className="flex items-center gap-2 text-sm py-1.5 cursor-pointer">
                <input type="checkbox" checked={fOnlineOnly} onChange={(e) => setFOnlineOnly(e.target.checked)} className="accent-primary" />
                オンライン中のみ
              </label>
            </FilterField>
          </div>
          {hasFilter && (
            <button onClick={resetFilter} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <RotateCcw className="w-3.5 h-3.5" /> リセット
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : users.length === 0 ? null : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">この条件に該当する仲間が見つかりません</div>
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

function FilterField({ label, children }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      {children}
    </div>
  );
}