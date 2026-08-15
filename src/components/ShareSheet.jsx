import React, { useState, useEffect, useRef } from "react";
import { X, Search, Check, Link2, Loader2, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { displayName, flagEmoji, fetchUser } from "@/lib/profile";
import { getOrCreateConversation, checkDmScope, sendMessage } from "@/lib/dm";
import { getMediaUrls } from "@/lib/media";
import { LineIcon, XIcon, FacebookIcon, WhatsAppIcon, TelegramIcon, OthersIcon } from "@/components/ShareAppIcons";

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

  function openAppShareUrl(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function openNativeShare() {
    setSharing(true);
    try {
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
      if (navigator.share) {
        await navigator.share({ title: "BELTVA", text: shareText, url: shareUrl });
      }
    } catch (err) {
      // user cancelled or error — silently ignore
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  const displayUsers = searchResults || recentUsers;
  const isSearching = !!search.trim();

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedFull = encodeURIComponent(shareText + " " + shareUrl);

  const apps = [
    { key: "line", label: "LINE", Icon: LineIcon, url: `https://line.me/R/share?text=${encodedFull}` },
    { key: "x", label: "X", Icon: XIcon, url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { key: "facebook", label: "Facebook", Icon: FacebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { key: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon, url: `https://wa.me/?text=${encodedFull}` },
    { key: "telegram", label: "Telegram", Icon: TelegramIcon, url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col animate-[slideUp_0.25s_ease-out]"
        style={{ animationName: "slideUp" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-full hover:bg-secondary">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <h2 className="text-base font-bold">{t("share.forward")}</h2>
          <div className="w-8" />
        </div>

        <div className="overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* Search */}
          <div className="relative mb-4 mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("share.searchUsers")}
              className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Recent / Search results — circular avatars */}
          {!isSearching && (
            loading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : recentUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center mb-4">{t("share.noRecent")}</div>
            ) : (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 mb-5">
                {recentUsers.map((u) => (
                  <button key={u.id} onClick={() => shareToUser(u)} className="flex flex-col items-center gap-1.5 shrink-0 w-16 group">
                    <div className="relative">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                          {(displayName(u) || "?").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {flagEmoji(u.country) && (
                        <span className="absolute -bottom-0.5 -right-0.5 text-[14px] leading-none">{flagEmoji(u.country)}</span>
                      )}
                      {sentTo === u.id && (
                        <div className="absolute inset-0 rounded-full bg-primary/80 flex items-center justify-center">
                          <Check className="w-6 h-6 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] truncate w-full text-center group-hover:text-primary transition">{displayName(u)}</span>
                  </button>
                ))}
              </div>
            )
          )}

          {isSearching && searchResults && (
            searchResults.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center mb-4">{t("users.noUsers")}</div>
            ) : (
              <div className="flex flex-col gap-1 mb-5">
                {searchResults.map((u) => (
                  <button key={u.id} onClick={() => shareToUser(u)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition">
                    <div className="relative shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
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
                    <span className="text-sm font-medium flex-1 text-left truncate">{displayName(u)}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )
          )}

          {/* Apps — square rounded icons */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 mb-5">
            {apps.map(({ key, label, Icon, url }) => (
              <button key={key} onClick={() => openAppShareUrl(url)} className="flex flex-col items-center gap-1.5 shrink-0 w-16 group">
                <Icon size={56} />
                <span className="text-[11px] truncate w-full text-center group-hover:text-primary transition">{label}</span>
              </button>
            ))}
            {/* Others — opens native share sheet for all remaining apps */}
            <button onClick={openNativeShare} disabled={sharing} className="flex flex-col items-center gap-1.5 shrink-0 w-16 group disabled:opacity-50">
              {sharing ? (
                <div className="w-14 h-14 rounded-[14px] bg-secondary border border-border flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              ) : (
                <OthersIcon size={56} />
              )}
              <span className="text-[11px] truncate w-full text-center group-hover:text-primary transition">{t("share.more")}</span>
            </button>
          </div>

          {/* Copy link — standalone list item */}
          <div className="border-t border-border pt-3">
            <button onClick={copyLink} className="w-full flex items-center gap-3 px-1 py-3 rounded-lg hover:bg-secondary transition">
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