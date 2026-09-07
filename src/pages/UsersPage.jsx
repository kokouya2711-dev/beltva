import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { parseHobbies } from "@/lib/hobbies";
import UserCard from "@/components/UserCard";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import UserSearchOverlay from "@/components/users/UserSearchOverlay";
import DetailFilterSheet from "@/components/users/DetailFilterSheet";
import { PURPOSES, LEVEL_KEYS, levelKeyForYears, parseTrainingYears } from "@/lib/userFilters";

const ONLINE_WINDOW = 30000;

const QUICK_OPTIONS = [
  { key: "same_language", label: "同じ言語" },
  { key: "beginner", label: "初級者" },
  { key: "intermediate", label: "中級者" },
  { key: "advanced", label: "上級者" },
];

function parseLanguages(s) {
  try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; }
}

export default function UsersPage() {
  const { lang } = useI18n();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});
  const [trainingIds, setTrainingIds] = useState(new Set());
  const [followIds, setFollowIds] = useState(new Set());
  const [earliestByUser, setEarliestByUser] = useState({});
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("all");
  const [quick, setQuick] = useState(new Set());
  const [detail, setDetail] = useState({ ageMin: 18, ageMax: 99, purpose: "", level: "" });
  const [detailActive, setDetailActive] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    (async () => {
      const meUser = await base44.auth.me().catch(() => null);
      const meIsMinor = meUser?.age != null && meUser.age < 18;
      const aMin = meIsMinor ? 13 : 18;
      const aMax = meIsMinor ? 17 : 99;
      setDetail({ ageMin: aMin, ageMax: aMax, purpose: "", level: "" });

      const [us, pres, live, follows, recs] = await Promise.all([
        base44.entities.User.list("-created_date", 100),
        base44.entities.Presence.list("-last_seen", 100).catch(() => []),
        base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 100),
        base44.entities.Follow.filter({ follower_id: meUser?.id || "___" }).catch(() => []),
        base44.entities.WorkoutRecord.list("created_date", 500).catch(() => []),
      ]);
      setMe(meUser);

      const ageOk = (u) => u.age != null && (meIsMinor ? (u.age >= 13 && u.age <= 17) : (u.age >= 18 && u.age <= 99));
      setUsers(us.filter((u) => u.id !== meUser?.id && ageOk(u)));

      const pm = {};
      pres.forEach((p) => { pm[p.created_by_id] = p.last_seen; });
      setPresence(pm);
      setTrainingIds(new Set(live.map((s) => s.created_by_id)));
      setFollowIds(new Set(follows.map((f) => f.followee_id)));

      const earliest = {};
      recs.forEach((r) => { if (r.created_by_id && !earliest[r.created_by_id]) earliest[r.created_by_id] = new Date(r.created_date); });
      setEarliestByUser(earliest);

      setLoading(false);
    })();
  }, []);

  // リアルタイムプレゼンス購読
  useEffect(() => {
    const unsubscribe = base44.entities.Presence.subscribe((event) => {
      setPresence((prev) => {
        const next = { ...prev };
        if (event.type === "delete") delete next[event.data.created_by_id];
        else if (event.data?.created_by_id) next[event.data.created_by_id] = event.data.last_seen;
        return next;
      });
    });
    return unsubscribe;
  }, []);

  const myLanguages = useMemo(() => parseLanguages(me?.languages), [me]);
  const allowedMin = me?.age != null && me.age < 18 ? 13 : 18;
  const allowedMax = me?.age != null && me.age < 18 ? 17 : 99;

  function isOnline(u) {
    if (u.show_online_status === false) return false;
    return !!(presence[u.id] && Date.now() - new Date(presence[u.id]).getTime() < ONLINE_WINDOW);
  }
  function isTraining(u) { return trainingIds.has(u.id); }
  function langsOf(u) { return parseLanguages(u.languages); }
  function yearsOf(u) {
    const declared = parseTrainingYears(u.training_history);
    if (declared != null) return declared;
    const e = earliestByUser[u.id];
    if (e) return (Date.now() - e.getTime()) / (365.25 * 86400000);
    return null;
  }
  function commonHobbiesOf(u) {
    const mine = parseHobbies(me?.hobbies);
    return parseHobbies(u.hobbies).filter((h) => mine.includes(h));
  }

  // クイックフィルター選択時は詳細フィルターを解除
  function toggleQuick(key) {
    setDetail({ ageMin: allowedMin, ageMax: allowedMax, purpose: "", level: "" });
    setDetailActive(false);
    setQuick((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); return next; }
      // レベルは1つだけ選択可能
      if (LEVEL_KEYS.includes(key)) LEVEL_KEYS.forEach((k) => next.delete(k));
      if (next.size >= 2) return next; // 合計最大2
      next.add(key);
      return next;
    });
  }

  // 詳細フィルター適用時はクイックフィルターをすべて解除
  function applyDetail(d) {
    setDetail(d);
    setDetailActive(true);
    setQuick(new Set());
    setShowDetail(false);
  }
  function clearDetail() {
    setDetail({ ageMin: allowedMin, ageMax: allowedMax, purpose: "", level: "" });
    setDetailActive(false);
  }

  const filtered = useMemo(() => {
    let arr = users;
    if (tab === "favorites") arr = arr.filter((u) => followIds.has(u.id));

    if (detailActive) {
      const { ageMin, ageMax, purpose, level } = detail;
      arr = arr.filter((u) => u.age >= ageMin && u.age <= ageMax);
      if (purpose) {
        const matchKeys = PURPOSES.find((p) => p.key === purpose)?.match || [];
        arr = arr.filter((u) => matchKeys.includes(u.training_purpose));
      }
      if (level) arr = arr.filter((u) => levelKeyForYears(yearsOf(u)) === level);
    } else {
      if (quick.has("same_language")) {
        const refLangs = myLanguages.length > 0 ? myLanguages : [lang];
        arr = arr.filter((u) => langsOf(u).some((c) => refLangs.includes(c)));
      }
      const lk = LEVEL_KEYS.find((k) => quick.has(k));
      if (lk) arr = arr.filter((u) => levelKeyForYears(yearsOf(u)) === lk);
    }

    const sorted = [...arr].sort((a, b) => {
      const ao = isOnline(a), bo = isOnline(b);
      if (ao !== bo) return bo - ao;
      const al = presence[a.id] ? new Date(presence[a.id]).getTime() : 0;
      const bl = presence[b.id] ? new Date(presence[b.id]).getTime() : 0;
      return bl - al;
    });
    return sorted.map((u) => ({ u, common: commonHobbiesOf(u) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, tab, quick, detail, detailActive, presence, trainingIds, followIds, me, myLanguages, lang, earliestByUser]);

  return (
    <div className="max-w-3xl mx-auto pb-6">
      {/* ヘッダー：検索 / タイトル / 詳細フィルター */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setShowSearch(true)} className="p-2 -ml-2 text-foreground" aria-label="検索">
          <Search className="w-5 h-5" />
        </button>
        <span className="text-base font-bold text-foreground">仲間を探す</span>
        <button
          onClick={() => setShowDetail(true)}
          className={`p-2 -mr-2 ${detailActive ? "text-primary" : "text-foreground"}`}
          aria-label="詳細フィルター"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 2段目タブ：すべて / お気に入り */}
      <div className="flex border-b border-border">
        {["all", "favorites"].map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`flex-1 py-2.5 text-sm font-bold transition relative ${tab === tb ? "text-primary" : "text-muted-foreground"}`}
          >
            {tb === "all" ? "すべて" : "お気に入り"}
            {tab === tb && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {/* クイックフィルター */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3">
        {QUICK_OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => toggleQuick(o.key)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${quick.has(o.key) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {detailActive && (
        <div className="flex items-center gap-2 px-4 pb-2">
          <span className="text-xs text-primary font-semibold">詳細フィルター適用中</span>
          <button onClick={clearDetail} className="text-xs text-muted-foreground underline">解除</button>
        </div>
      )}

      {/* リスト */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-16">表示できる仲間がいません</div>
      ) : (
        <div className="space-y-3 px-4 py-3">
          {filtered.map(({ u, common }) => (
            <UserCard
              key={u.id}
              user={u}
              me={me}
              isOnline={isOnline(u)}
              isTraining={isTraining(u)}
              reason={[]}
              commonHobbies={common}
            />
          ))}
        </div>
      )}

      {showSearch && (
        <UserSearchOverlay
          users={users}
          me={me}
          isOnline={isOnline}
          isTraining={isTraining}
          onClose={() => setShowSearch(false)}
        />
      )}

      <DetailFilterSheet
        open={showDetail}
        allowedMin={allowedMin}
        allowedMax={allowedMax}
        initial={detail}
        onClose={() => setShowDetail(false)}
        onApply={applyDetail}
      />
    </div>
  );
}