import React, { useState, useEffect, useRef } from "react";
import { X, Search, Check, Link2, Share2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { displayName, flagEmoji, fetchUser } from "@/lib/profile";
import { getOrCreateConversation, checkDmScope, sendMessage } from "@/lib/dm";
import { getMediaUrls } from "@/lib/media";

export default function ShareSheet({ post, meId, onClose }) {
  const t = useT();
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [sentTo, setSentTo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const searchTimer = useRef(null);

  const shareUrl = `${window.location.origin}/posts/${post.id}`;
  const shareText = post.content?.slice(0, 100) || "BELTVA";
  const mediaUrls = getMediaUrls(post);

  useEffect(() => {
    (async () => {
      if (!meId) { setLoading(false); return; }
      // Fetch recent conversations (both as a_id and b_id)
      const [asA, asB] = await Promise.all([
        base44.entities.Conversation.filter({ a_id: meId }, "-last_message_at", 30).catch(() => []),
        base44.entities.Conversation.filter({ b_id: meId }, "-last_message_at", 30).catch(() => []),
      ]);
      const allConvs = [...asA, ...asB];
      allConvs.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
      const otherIds = allConvs
        .map((c) => (c.a_id === meId ? c.b_id : c.a_id))
        .filter((id) => id && id !== meId);
      const uniqueIds = [...new Set(otherIds)].slice(0, 20);
      const users = await Promise.all(
        uniqueIds.map((id) => fetchUser(id).catch(() => null))
      );
      setRecentUsers(users.filter(Boolean));
      setLoading(false);
    })();
  }, [meId]);

  // Debounced user search
  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      const results = await base44.entities.User.list(50).catch(() => []);
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

  async function openNativeShare() {
    setSharing(true);
    try {
      // Try to share with media files if the post has images/videos
      if (mediaUrls.length > 0 && navigator.canShare && navigator.canShare({ files: [] })) {
        const files = await Promise.all(
          mediaUrls.slice(0, 5).map(async (url) => {
            try {
              const res = await fetch(url);
              const blob = await res.blob();
              const isVideo = url.match(/\.(mp4|mov|webm)$/i) || blob.type.startsWith("video");
              return new File([blob], isVideo ? "video.mp4" : "image.jpg", {
                type: isVideo ? "video/mp4" : "image/jpeg",
              });
            } catch { return null; }
          })
        );
        const validFiles = files.filter(Boolean);
        if (validFiles.length > 0 && navigator.canShare({ files: validFiles })) {
          await navigator.share({ title: "BELTVA", text: shareText, files: validFiles });
          return;
        }
      }
      // Fall back to sharing URL + text only
      if (navigator.share) {
        await navigator.share({ title: "BELTVA", text: shareText, url: shareUrl });
      } else {
        // No Web Share API — copy link as fallback
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
      }
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  const displayUsers = searchResults || recentUsers;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
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
          {/* Section 1: BELTVA users (recent conversations + search) */}
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
              <div className="text-sm text-muted-foreground py-3 text-center">{search ? t("users.noUsers") : t("share.noRecent")}</div>
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

          {/* Section 2: Native share sheet (all installed apps with official logos) */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">{t("share.toApps")}</div>
            <button
              onClick={openNativeShare}
              disabled={sharing}
              className="w-full flex items-center gap-3 bg-secondary border border-border rounded-xl px-4 py-3.5 hover:bg-muted transition disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                {sharing ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Share2 className="w-5 h-5 text-primary" />}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-semibold">{t("share.openNative")}</div>
                <div className="text-xs text-muted-foreground">{t("share.openNativeDesc")}</div>
              </div>
            </button>
          </div>

          {/* Section 3: Copy link */}
          <div className="border-t border-border pt-3">
            <button onClick={copyLink} className="w-full flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-secondary transition">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4 text-muted-foreground" />}
              </div>
              <span className="text-sm font-medium">{copied ? t("post.linkCopied") : t("share.copyLink")}</span>
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}