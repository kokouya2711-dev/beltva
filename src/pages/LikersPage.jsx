import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Heart } from "lucide-react";
import { useT } from "@/lib/i18n";
import { displayName, flagEmoji, fetchUser } from "@/lib/profile";
import { saveLikersScroll, getLikersScroll } from "@/lib/likersScrollCache";

export default function LikersPage() {
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [likers, setLikers] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ls = await base44.entities.Like.filter({ post_id: id }, "-created_date", 500).catch(() => []);
      setLikers(ls);
      const ids = new Set(ls.map((l) => l.created_by_id).filter(Boolean));
      const us = await Promise.all([...ids].map((uid) => fetchUser(uid).catch(() => null)));
      const m = {};
      us.forEach((u) => { if (u) m[u.id] = u; });
      setUsers(m);
      setLoading(false);
      // Restore scroll position after data loads (POP navigation back from profile)
      requestAnimationFrame(() => {
        const saved = getLikersScroll(id);
        if (saved > 0) window.scrollTo(0, saved);
      });
    })();
  }, [id]);

  function goToProfile(uid) {
    saveLikersScroll(id, window.scrollY);
    navigate(`/profile/${uid}`, { state: { from: "likers" } });
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 glass border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-secondary transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            {t("post.likersTitle")}
          </h1>
          {!loading && (
            <span className="text-sm text-muted-foreground ml-auto">{likers.length}</span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : likers.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-2 text-muted-foreground">
            <Heart className="w-8 h-8 opacity-30" />
            <span className="text-sm">{t("post.likersTitle")}</span>
          </div>
        ) : (
          <div>
            {likers.map((l) => {
              const u = users[l.created_by_id];
              const name = u ? displayName(u) : "User";
              const flag = u ? flagEmoji(u.country) : "";
              return (
                <button
                  key={l.id}
                  onClick={() => u && goToProfile(u.id)}
                  className="w-full flex items-center gap-3 py-3 border-b border-border hover:bg-secondary/50 transition text-left"
                >
                  <div className="relative shrink-0">
                    {u?.avatar_url ? (
                      <img src={u.avatar_url} alt={name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {flag && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[14px] rounded-[3px] overflow-hidden shadow-md">
                        {flag}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-sm truncate">{name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}