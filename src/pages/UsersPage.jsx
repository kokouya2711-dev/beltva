import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useT, useI18n, LANGS } from "@/lib/i18n";
import { displayName, COUNTRIES, flagEmoji } from "@/lib/profile";
import { parseHobbies, TRAINING_PURPOSES, HOBBY_CATEGORIES, hobbyLabel, hobbyCategoryLabel, makePresetHobby, ALL_HOBBY_KEYS } from "@/lib/hobbies";
import UserCard from "@/components/UserCard";
import { Loader2, Search, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const ONLINE_WINDOW = 120000;

const CATEGORIES = [
  { key: "recommended", labelKey: "users.cat_recommended" },
  { key: "online", labelKey: "users.cat_online" },
  { key: "training", labelKey: "users.cat_training" },
  { key: "nearby", labelKey: "users.cat_nearby" },
  { key: "common-hobbies", labelKey: "users.cat_commonHobbies" },
  { key: "same-purpose", labelKey: "users.cat_samePurpose" },
  { key: "same-language", labelKey: "users.cat_sameLanguage" },
  { key: "same-country", labelKey: "users.cat_sameCountry" },
  { key: "new", labelKey: "users.cat_new" },
  { key: "following", labelKey: "users.cat_following" }
];

const GENDERS = [
  { key: "male", labelKey: "users.gender_male" },
  { key: "female", labelKey: "users.gender_female" },
  { key: "undisclosed", labelKey: "users.gender_undisclosed" }
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
        base44.entities.User.list("-created_date", 100),
        base44.entities.Presence.list("-last_seen", 100).catch(() => []),
        base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 100),
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
    if (u.show_online_status === false) return false;
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
    if (common.length > 0) reasons.push(t("users.reason_commonHobbies").replace("{n}", common.length));
    if (myPurpose && u.training_purpose === myPurpose) { score += 2; if (reasons.length < 3) reasons.push(t("users.reason_samePurpose")); }
    const refLangs = myLanguages.length > 0 ? myLanguages : [lang];
    if (langsOf(u).some((c) => refLangs.includes(c))) { score += 1; if (reasons.length < 3) reasons.push(t("users.reason_sameLanguage")); }
    if (isOnline(u)) { score += 1; if (reasons.length < 3) reasons.push(t("users.reason_online")); }
    if (dist(u) < 5) { score += 1; if (reasons.length < 3) reasons.push(t("users.reason_nearby")); }
    const last = presence[u.id] ? new Date(presence[u.id]).getTime() : 0;
    if (last && Date.now() - last < 3600000) { score += 1; if (reasons.length < 3) reasons.push(t("users.reason_recentActive")); }
    if (!last && new Date(u.created_date) && Date.now() - new Date(u.created_date).getTime() < 604800000) {
      score += 1; if (reasons.length < 3) reasons.push(t("users.reason_newUser"));
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
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowFilter((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" /> {t("users.detailFilter")}
        {hasFilter && <span className="text-primary">· {t("users.filterApplied").replace("{n}", filterCount)}</span>}
        {showFilter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showFilter && (
        <div className="glass rounded-xl border border-border p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FilterField label={t("common.country")}>
              <select value={fCountry} onChange={(e) => setFCountry(e.target.value)} className={inputCls}>
                <option value="">{t("users.noSpecify")}</option>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{flagEmoji(c.code)} {c.name}</option>)}
              </select>
            </FilterField>
            <FilterField label={t("common.language")}>
              <select value={fLang} onChange={(e) => setFLang(e.target.value)} className={inputCls}>
                <option value="">{t("users.noSpecify")}</option>
                {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </FilterField>
            <FilterField label={t("users.age")}>
              <div className="flex items-center gap-1">
                <input type="number" value={fAgeMin} onChange={(e) => setFAgeMin(e.target.value)} placeholder={t("users.ageMin")} className={inputCls} min="13" />
                <span className="text-muted-foreground text-xs">〜</span>
                <input type="number" value={fAgeMax} onChange={(e) => setFAgeMax(e.target.value)} placeholder={t("users.ageMax")} className={inputCls} min="13" />
              </div>
            </FilterField>
            <FilterField label={t("users.gender")}>
              <select value={fGender} onChange={(e) => setFGender(e.target.value)} className={inputCls}>
                <option value="">{t("users.noSpecify")}</option>
                {GENDERS.map((g) => <option key={g.key} value={g.key}>{t(g.labelKey)}</option>)}
              </select>
            </FilterField>
            <FilterField label={t("common.hobbies")}>
              <select value={fHobby} onChange={(e) => setFHobby(e.target.value)} className={inputCls}>
                <option value="">{t("users.noSpecify")}</option>
                {HOBBY_CATEGORIES.map((cat) => (
                  <optgroup key={cat.key} label={hobbyCategoryLabel(cat.key, lang)}>
                    {cat.items.map((key) => (
                      <option key={key} value={makePresetHobby(key)}>{hobbyLabel(makePresetHobby(key), lang)}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FilterField>
            <FilterField label={t("common.purpose")}>
              <select value={fPurpose} onChange={(e) => setFPurpose(e.target.value)} className={inputCls}>
                <option value="">{t("users.noSpecify")}</option>
                {TRAINING_PURPOSES.map((p) => <option key={p.key} value={p.key}>{t("purpose." + p.key)}</option>)}
              </select>
            </FilterField>
            <FilterField label={t("users.onlineStatus")}>
              <label className="flex items-center gap-2 text-sm py-1.5 cursor-pointer">
                <input type="checkbox" checked={fOnlineOnly} onChange={(e) => setFOnlineOnly(e.target.checked)} className="accent-primary" />
                {t("users.onlineOnly")}
              </label>
            </FilterField>
          </div>
          {hasFilter && (
            <button onClick={resetFilter} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <RotateCcw className="w-3.5 h-3.5" /> {t("users.reset")}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : users.length === 0 ? null : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">{t("users.noMatch")}</div>
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