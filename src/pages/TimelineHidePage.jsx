import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { EyeOff, Loader2, ArrowLeft, Search, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { fetchUser, displayName } from "@/lib/profile";

export default function TimelineHidePage() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [hides, setHides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      const meUser = await base44.auth.me().catch(() => null);
      if (!meUser) { setLoading(false); return; }
      setMe(meUser);
      const hs = await base44.entities.TimelineHide.filter({ hider_id: meUser.id });
      setHides(hs);
      setLoading(false);
    })();
  }, []);

  async function addHide(user) {
    if (!me || hides.some((h) => h.hidden_id === user.id)) return;
    const rec = await base44.entities.TimelineHide.create({ hider_id: me.id, hidden_id: user.id });
    setHides((prev) => [...prev, rec]);
    setQuery("");
    setResults([]);
    setShowSearch(false);
  }

  async function removeHide(hideId) {
    await base44.entities.TimelineHide.delete(hideId).catch(() => {});
    setHides((prev) => prev.filter((h) => h.id !== hideId));
  }

  async function searchUsers() {
    if (!query.trim()) { setResults([]); return; }
    const users = await base44.entities.User.list("-created_date", 100).catch(() => []);
    const hiddenIds = new Set(hides.map((h) => h.hidden_id));
    setResults(users.filter((u) =>
      u.id !== me?.id &&
      !hiddenIds.has(u.id) &&
      (u.display_name?.toLowerCase().includes(query.toLowerCase()) ||
       u.email?.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 10));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="relative flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{t("privacy.timelineHideTitle")}</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{t("privacy.timelineHideDesc")}</p>

      {showSearch ? (
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              placeholder={t("privacy.searchUserPlaceholder")}
              className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              autoFocus
            />
            <button onClick={() => { setShowSearch(false); setQuery(""); setResults([]); }} className="p-1.5 rounded-lg hover:bg-secondary shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          {results.length > 0 && (
            <div className="divide-y divide-border">
              {results.map((u) => {
                const name = displayName(u);
                return (
                  <div key={u.id} className="flex items-center gap-3 py-3">
                    <Link to={`/profile/${u.id}`} className="w-9 h-9 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
                    </Link>
                    <span className="flex-1 text-base truncate">{name}</span>
                    <button onClick={() => addHide(u)} className="text-sm px-3 py-1.5 rounded-lg border border-border hover:border-primary hover:text-primary transition">
                      {t("privacy.add")}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setShowSearch(true)} className="w-full py-3 flex items-center justify-center gap-2 text-base hover:text-primary transition mb-4">
          <Search className="w-4 h-4" /> {t("privacy.searchUser")}
        </button>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : hides.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <EyeOff className="w-10 h-10 opacity-40" />
          <div className="text-base">{t("privacy.timelineHideEmpty")}</div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {hides.map((h) => <HiddenRow key={h.id} hide={h} onRemove={() => removeHide(h.id)} />)}
        </div>
      )}
    </div>
  );
}

function HiddenRow({ hide, onRemove }) {
  const t = useT();
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(hide.hidden_id).then(setUser).catch(() => {}); }, [hide.hidden_id]);
  const name = displayName(user);
  return (
    <div className="flex items-center gap-3 py-4">
      <Link to={user ? `/profile/${user.id}` : "#"} className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
        {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
      </Link>
      <Link to={user ? `/profile/${user.id}` : "#"} className="flex-1 min-w-0 text-base font-medium truncate hover:text-primary">{name}</Link>
      <button onClick={onRemove} className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition">{t("privacy.remove")}</button>
    </div>
  );
}