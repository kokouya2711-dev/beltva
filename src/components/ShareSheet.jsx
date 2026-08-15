import React, { useState, useEffect, useRef } from "react";
import { X, Search, Check, Bookmark, BookmarkCheck, Link2, MoreHorizontal, Mail, MessageSquare, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { displayName, flagEmoji, fetchUser } from "@/lib/profile";
import { getOrCreateConversation, checkDmScope, sendMessage } from "@/lib/dm";

// App share targets with web intent URLs that work on mobile + desktop.
// The OS will open the native app if installed, otherwise the web version.
const APP_TARGETS = [
  { key: "whatsapp", label: "WhatsApp", bg: "#25D366", fn: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + " " + url)}` },
  { key: "x", label: "X", bg: "#000000", fn: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { key: "telegram", label: "Telegram", bg: "#0088CC", fn: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { key: "messenger", label: "Messenger", bg: "#006AFF", fn: (url) => `fb-messenger://share?link=${encodeURIComponent(url)}` },
  { key: "instagram", label: "Instagram", bg: "#E1306C", fn: (url, text) => `instagram://share?text=${encodeURIComponent(text + " " + url)}` },
  { key: "email", label: "Email", bg: "#6B7280", icon: Mail, fn: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}` },
  { key: "sms", label: "SMS", bg: "#10B981", icon: MessageSquare, fn: (url, text) => `sms:?&body=${encodeURIComponent(text + " " + url)}` },
];

export default function ShareSheet({ post, meId, onClose, onFavoriteToggle, isFavorited }) {
  const t = useT();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [sentTo, setSentTo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [favSaving, setFavSaving] = useState(false);
  const sheetRef = useRef(null);
  const searchTimer = useRef(null);

  const shareUrl = `${window.location.origin}/posts/${post.id}`;
  const shareText = post.content?.slice(0, 100) || "BELTVA";

  useEffect(() => {
    (async () => {
      if (!meId) { setLoading(false); return; }
      const myFollows = await base44.entities.Follow.filter({ follower_id: meId }, "-created_date", 50);
      const users = await Promise.all(
        myFollows.map((f) => fetchUser(f.followee_id).catch(() => null))
      );
      setFollowing(users.filter(Boolean));
      setLoading(false);
    })();
  }, [meId]);

  // Debounced user search
  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      const results = await base44.entities.User.list(20).catch(() => []);
      const q = search.toLowerCase();
      const filtered = results.filter((u) => {
        const name = (displayName(u) || "").toLowerCase();
        return u.id !== meId && name.includes(q);
      });
      const enriched = await Promise.all(filtered.map((u) => fetchUser(u.id).catch(() => u)));
      setSearchResults(enriched);
    }, 400);
  }, [search]);

  async function shareToUser(user) {
    const scopeCheck = await checkDmScope(meId, user.id);
    if (!scopeCheck.ok) { alert(t(scopeCheck.message === "dm.blocked" ? "messages.blocked" : "messages.cantSend")); return; }
    const conv = await getOrCreateConversation(meId, user.id);
    await sendMessage(conv, meId, { content: shareUrl });
    setSentTo(user.id);
    setTimeout(() => { setSentTo(null); onClose(); }, 1200);
  }

  function openApp(target) {
    const url = target.fn(shareUrl, shareText);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function openNativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: "BELTVA", text: shareText, url: shareUrl }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
    }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }

  async function saveFavorite() {
    setFavSaving(true);
    await onFavoriteToggle?.();
    setFavSaving(false);
  }

  const displayUsers = searchResults || following;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col animate-[slideUp_0.25s_ease-out]"
        style={{ animationName: "slideUp" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <h2 className="text-base font-bold">{t("share.title")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* Section 1: BELTVA users */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">{t("share.toBeltva")}</div>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("share.searchUsers")}
                className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : displayUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground py-3 text-center">{search ? t("users.noUsers") : t("share.noFollowing")}</div>
            ) : (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {displayUsers.map((u) => (
                  <button key={u.id} onClick={() => shareToUser(u)} className="flex flex-col items-center gap-1 shrink-0 w-16 group">
                    <div className="relative">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                          {(displayName(u) || "?").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {flagEmoji(u.country) && (
                        <span className="absolute -bottom-0.5 -right-0.5 text-[14px] leading-none">{flagEmoji(u.country)}</span>
                      )}
                      {sentTo === u.id && (
                        <div className="absolute inset-0 rounded-full bg-primary/80 flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] truncate w-full text-center group-hover:text-primary transition">{displayName(u)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Apps */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">{t("share.toApps")}</div>
            <div className="grid grid-cols-5 gap-3">
              {APP_TARGETS.map((app) => (
                <button key={app.key} onClick={() => openApp(app)} className="flex flex-col items-center gap-1.5 group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition" style={{ background: app.bg }}>
                    {app.icon ? <app.icon className="w-5 h-5" /> : app.label.slice(0, 1)}
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{app.label}</span>
                </button>
              ))}
              <button onClick={openNativeShare} className="flex flex-col items-center gap-1.5 group">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-105 transition">
                  <MoreHorizontal className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">{t("share.more")}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Copy link + Save favorite */}
          <div className="border-t border-border pt-3 space-y-1">
            <button onClick={copyLink} className="w-full flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-secondary transition">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4 text-muted-foreground" />}
              </div>
              <span className="text-sm font-medium">{copied ? t("post.linkCopied") : t("share.copyLink")}</span>
            </button>
            <button onClick={saveFavorite} disabled={favSaving} className="w-full flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-secondary transition disabled:opacity-50">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                {favSaving ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : isFavorited ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
              </div>
              <span className="text-sm font-medium">{isFavorited ? t("post.unfavorite") : t("share.saveFavorite")}</span>
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}