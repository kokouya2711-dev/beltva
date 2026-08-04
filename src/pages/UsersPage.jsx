import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { COUNTRIES, flagEmoji } from "@/lib/profile";
import { ALL_HOBBIES, TRAINING_PURPOSES, parseHobbies } from "@/lib/hobbies";
import UserCard from "@/components/UserCard";
import { Loader2, Search } from "lucide-react";

export default function UsersPage() {
  const t = useT();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});
  const [trainingIds, setTrainingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [country, setCountry] = useState("");
  const [hobby, setHobby] = useState("");
  const [purpose, setPurpose] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const [meUser, us, pres, live] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.User.list("-created_date", 200),
        base44.entities.Presence.list("-last_seen", 200).catch(() => []),
        base44.entities.LiveSession.filter({ status: "live" }, "-started_at", 200)
      ]);
      setMe(meUser);
      setUsers(us.filter((u) => u.id !== meUser?.id));
      const pm = {}; pres.forEach((p) => { pm[p.created_by_id] = p.last_seen; }); setPresence(pm);
      setTrainingIds(new Set(live.map((s) => s.created_by_id)));
      setLoading(false);
    })();
  }, []);

  function dist(u) {
    if (!me?.lat || !u.lat) return Infinity;
    return Math.hypot(u.lat - me.lat, u.lng - me.lng);
  }

  const filtered = useMemo(() => {
    let arr = users.filter((u) => {
      if (country && u.country !== country) return false;
      if (purpose && u.training_purpose !== purpose) return false;
      if (hobby && !parseHobbies(u.hobbies).includes(hobby)) return false;
      if (query && !(u.display_name || u.email || "").toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    if (filter === "training") arr = arr.filter((u) => trainingIds.has(u.id));
    if (filter === "nearby") arr = [...arr].sort((a, b) => dist(a) - dist(b));
    return arr;
  }, [users, country, purpose, hobby, query, filter, trainingIds, me]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-4">
      <h1 className="text-2xl font-bold">{t("users.title")}</h1>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("users.searchPlaceholder")} className="w-full bg-secondary/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[["all", t("users.filterAll")], ["nearby", t("users.filterNearby")], ["training", t("users.filterTraining")]].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${filter === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm">
          <option value="">{t("users.filterCountry")}</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{flagEmoji(c.code)} {c.name}</option>)}
        </select>
        <select value={hobby} onChange={(e) => setHobby(e.target.value)} className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm">
          <option value="">{t("users.filterHobby")}</option>
          {ALL_HOBBIES.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm">
          <option value="">{t("users.filterPurpose")}</option>
          {TRAINING_PURPOSES.map((p) => <option key={p.key} value={p.key}>{t("purpose." + p.key)}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-border py-12 text-center text-sm text-muted-foreground">{t("users.noUsers")}</div>
      ) : (
        <div className="space-y-3">{filtered.map((u) => <UserCard key={u.id} user={u} me={me} isOnline={presence[u.id] && Date.now() - new Date(presence[u.id]).getTime() < 120000} isTraining={trainingIds.has(u.id)} />)}</div>
      )}
    </div>
  );
}