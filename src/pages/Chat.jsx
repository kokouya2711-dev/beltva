import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { displayName, fetchUser } from "@/lib/profile";
import { sendMessage, toggleReaction, blockExists, blockUser, unblockUser, muteUser, unmuteUser, isMuted } from "@/lib/dm";
import MessageBubble from "@/components/MessageBubble";
import CountryFlagBadge from "@/components/CountryFlagBadge";
import { useT } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Send, MoreVertical, Ban, BellOff, Flag, Loader2, Reply, Copy, Pencil, Trash2, X } from "lucide-react";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
}
const EDIT_WINDOW_MS = 15 * 60 * 1000;
const EMOJIS = ["👍", "❤️", "🔥", "😂", "💪"];

export default function Chat() {
  const t = useT();
  const { conversationId: id } = useParams();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [conv, setConv] = useState(null);
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ctxMenu, setCtxMenu] = useState(null); // { message, x, y }
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null); // { id, value }
  const [confirmUnsend, setConfirmUnsend] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const scrollRef = useRef(null);
  const menuRef = useRef(null);

  async function loadAll() {
    setLoading(true);
    const meUser = await base44.auth.me().catch(() => null);
    setMe(meUser);
    const c = await base44.entities.Conversation.get(id);
    setConv(c);
    const otherId = meUser.id === c.a_id ? c.b_id : c.a_id;
    const [o, msgs, presence, bl, mt] = await Promise.all([
      fetchUser(otherId),
      base44.entities.Message.filter({ conversation_id: id }, "created_date", 500),
      base44.entities.Presence.filter({ created_by_id: otherId }),
      blockExists(meUser.id, otherId),
      isMuted(meUser.id, otherId)
    ]);
    setOther(o);
    setMessages(msgs);
    setOnline(o?.show_online_status !== false && presence[0]?.last_seen && Date.now() - new Date(presence[0].last_seen).getTime() < 30000);
    setBlocked(bl);
    setMuted(mt);
    const myField = meUser.id === c.a_id ? "a_read_at" : "b_read_at";
    await base44.entities.Conversation.update(id, { [myField]: new Date().toISOString() });
    window.dispatchEvent(new CustomEvent("dm-unread-changed"));
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, [id]);

  useEffect(() => {
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== id) return;
      if (event.type === "create") {
        setMessages((prev) => prev.some((m) => m.id === event.data.id) ? prev : [...prev, event.data]);
        if (event.data.sender_id !== me?.id && conv) {
          const myField = me?.id === conv.a_id ? "a_read_at" : "b_read_at";
          base44.entities.Conversation.update(id, { [myField]: new Date().toISOString() });
          window.dispatchEvent(new CustomEvent("dm-unread-changed"));
        }
      } else if (event.type === "update") {
        setMessages((prev) => prev.map((m) => (m.id === event.data.id ? { ...m, ...event.data } : m)));
      } else if (event.type === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== event.data.id));
      }
    });
    return unsub;
  }, [id, me, conv]);

  useEffect(() => {
    if (!me || !conv) return;
    const otherId = me.id === conv.a_id ? conv.b_id : conv.a_id;
    const unsub = base44.entities.Presence.subscribe((event) => {
      if (event.data?.created_by_id !== otherId) return;
      setOnline(other?.show_online_status !== false && event.data.last_seen && Date.now() - new Date(event.data.last_seen).getTime() < 30000);
    });
    return unsub;
  }, [me, conv, other]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  // Close context menu on outside click / scroll / escape
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) close(); };
    window.addEventListener("scroll", close, true);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", (e) => e.key === "Escape" && close());
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("mousedown", onDown);
    };
  }, [ctxMenu]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!conv) return <div className="text-center py-20 text-muted-foreground">{t("chat.notFound")}</div>;

  const otherId = me.id === conv.a_id ? conv.b_id : conv.a_id;
  const otherReadAt = me.id === conv.a_id ? conv.b_read_at : conv.a_read_at;
  const canSend = !blocked;
  const msgById = (mid) => messages.find((m) => m.id === mid) || null;

  async function send() {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const { msg } = await sendMessage(conv, me.id, { content: draft.trim(), reply_to_id: replyTo?.id || "" });
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setDraft("");
      setReplyTo(null);
      setConv((c) => ({ ...c, status: "active", last_message: draft.trim(), last_message_at: new Date().toISOString(), last_sender_id: me.id }));
    } finally { setSending(false); }
  }

  async function react(messageId, emoji) {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    const next = await toggleReaction(msg, me.id, emoji);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: JSON.stringify(next) } : m)));
  }

  async function toggleBlock() { if (blocked) { await unblockUser(me.id, otherId); setBlocked(false); } else { await blockUser(me.id, otherId); setBlocked(true); } setMenuOpen(false); }
  async function toggleMute() { if (muted) { await unmuteUser(me.id, otherId); setMuted(false); } else { await muteUser(me.id, otherId); setMuted(true); } setMenuOpen(false); }

  function openCtxMenu(message, e) {
    const x = e.clientX ?? 0;
    const y = e.clientY ?? 0;
    setCtxMenu({ message, x, y });
  }

  function canMutate(message) {
    return message.sender_id === me.id && !message.deleted_at &&
      Date.now() - new Date(message.created_date).getTime() < EDIT_WINDOW_MS;
  }

  function doCopy(message) {
    const text = message.content || "";
    if (!text) return;
    try { navigator.clipboard?.writeText(text); } catch {}
    toast({ title: t("chat.copied") });
    setCtxMenu(null);
  }

  function startEdit(message) {
    setEditing({ id: message.id, value: message.content || "" });
    setCtxMenu(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const val = editing.value.trim();
    const msg = msgById(editing.id);
    if (val && msg && val !== msg.content) {
      const updated = await base44.entities.Message.update(editing.id, { content: val, edited_at: new Date().toISOString() });
      setMessages((prev) => prev.map((m) => (m.id === editing.id ? { ...m, ...updated } : m)));
    }
    setEditing(null);
  }

  function askUnsend(message) {
    setConfirmUnsend(message);
    setCtxMenu(null);
  }

  async function doUnsend() {
    const message = confirmUnsend;
    setConfirmUnsend(null);
    if (!message) return;
    const now = new Date().toISOString();
    const updated = await base44.entities.Message.update(message.id, { deleted_at: now });
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === message.id ? { ...m, ...updated } : m));
      const last = next[next.length - 1];
      if (last && last.id === message.id) {
        base44.entities.Conversation.update(id, { last_message: t("chat.unsent") }).catch(() => {});
      }
      return next;
    });
  }

  function reportMessage(message) {
    setCtxMenu(null);
    navigate("/report", { state: { target_type: "message", target_id: message.id, reported_id: message.sender_id, target_content: message.content || "" } });
  }

  function scrollToMessage(mid) {
    const el = document.getElementById(`msg-${mid}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(mid);
    setTimeout(() => setHighlightId((c) => (c === mid ? null : c)), 1600);
  }

  // Context menu item list
  const ctxItems = [];
  if (ctxMenu) {
    const m = ctxMenu.message;
    const mine = m.sender_id === me.id;
    ctxItems.push({ icon: Reply, label: t("chat.actReply"), onClick: () => { setReplyTo(m); setCtxMenu(null); } });
    if (m.content) ctxItems.push({ icon: Copy, label: t("chat.actCopy"), onClick: () => doCopy(m) });
    if (mine && canMutate(m)) {
      ctxItems.push({ icon: Pencil, label: t("chat.actEdit"), onClick: () => startEdit(m) });
      ctxItems.push({ icon: Trash2, label: t("chat.actUnsend"), onClick: () => askUnsend(m), danger: true });
    }
    if (!mine) ctxItems.push({ icon: Flag, label: t("chat.actReport"), onClick: () => reportMessage(m), danger: true });
  }

  // Clamp menu position
  const menuW = 200, menuH = 48 + ctxItems.length * 44 + 12;
  let menuStyle = {};
  if (ctxMenu) {
    const x = Math.min(ctxMenu.x, window.innerWidth - menuW - 8);
    let y = ctxMenu.y + 4;
    if (y + menuH > window.innerHeight - 8) y = Math.max(8, ctxMenu.y - menuH - 4);
    menuStyle = { left: x, top: y };
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)]">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => navigate(-1)} className="p-1.5"><ArrowLeft className="w-5 h-5" /></button>
        <Link to={`/profile/${otherId}`} className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative shrink-0">
            {other?.avatar_url ? <img src={other.avatar_url} className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{displayName(other).slice(0, 2).toUpperCase()}</div>}
            {other?.country && other.country.length === 2 && <CountryFlagBadge country={other.country} size={12} />}
            {online && <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-background z-20" />}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate flex items-center gap-1.5">{displayName(other)}</div>
            <div className="text-xs text-muted-foreground">{online ? t("common.online") : t("common.offline")}</div>
          </div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="p-1.5"><MoreVertical className="w-5 h-5" /></button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 glass border border-border rounded-xl py-1 w-40">
              <button onClick={toggleMute} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><BellOff className="w-4 h-4" /> {muted ? t("common.unmute") : t("common.mute")}</button>
              <button onClick={toggleBlock} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Ban className="w-4 h-4" /> {blocked ? t("common.unblock") : t("common.block")}</button>
              <button onClick={() => { setMenuOpen(false); navigate("/report", { state: { target_type: "conversation", target_id: id, reported_id: otherId } }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Flag className="w-4 h-4" /> {t("common.report")}</button>
            </div>
          )}
        </div>
      </div>

      {blocked && <div className="glass rounded-xl border border-border p-3 mb-3 text-sm text-muted-foreground">{t("messages.blocked")}</div>}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pb-3">
        {messages.map((m, i) => {
          const read = m.sender_id === me.id && otherReadAt && new Date(otherReadAt).getTime() >= new Date(m.created_date).getTime();
          const prev = messages[i - 1];
          const showDateSep = !prev || new Date(prev.created_date).toDateString() !== new Date(m.created_date).toDateString();
          const replyOrigin = m.reply_to_id ? msgById(m.reply_to_id) : null;
          const isEditing = editing?.id === m.id;
          return (
            <React.Fragment key={m.id}>
              {showDateSep && (
                <div className="flex justify-center my-3">
                  <span className="text-xs text-muted-foreground bg-secondary/60 rounded-full px-3 py-1">{formatDateLabel(m.created_date)}</span>
                </div>
              )}
              <div id={`msg-${m.id}`} className={`rounded-lg transition-colors duration-300 ${highlightId === m.id ? "bg-primary/10 ring-1 ring-primary/40" : ""}`}>
                <MessageBubble
                  message={m}
                  meId={me.id}
                  read={read}
                  replyOrigin={replyOrigin}
                  replySenderName={m.reply_to_id ? (replyOrigin?.sender_id === me.id ? t("chat.self") : displayName(other)) : ""}
                  onReplyTap={scrollToMessage}
                  onLongPress={openCtxMenu}
                  editing={isEditing}
                  editValue={isEditing ? editing.value : ""}
                  onEditChange={(v) => setEditing((e) => (e ? { ...e, value: v } : e))}
                  onEditSave={saveEdit}
                  onEditCancel={() => setEditing(null)}
                  onReact={(emoji) => react(m.id, emoji)}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Reply quote bar */}
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-2 mb-1 border-t border-border bg-secondary/40 rounded-t-lg">
          <Reply className="w-4 h-4 text-primary shrink-0" />
          <button onClick={() => scrollToMessage(replyTo.id)} className="flex-1 min-w-0 text-left">
            <div className="text-xs font-semibold truncate">{replyTo.deleted_at ? t("chat.replyCancelled") : (replyTo.sender_id === me.id ? t("chat.self") : displayName(other))}</div>
            <div className="text-xs truncate opacity-80">{replyTo.deleted_at ? t("chat.unsent") : (replyTo.content || "").slice(0, 80) || "…"}</div>
          </button>
          <button onClick={() => setReplyTo(null)} className="p-1.5 rounded-full hover:bg-secondary shrink-0"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      )}

      {canSend ? (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t("messages.inputPlaceholder")} className="flex-1 bg-secondary/60 border border-border rounded-full px-4 py-2 text-sm outline-none focus:border-primary" />
          <button onClick={send} disabled={sending || !draft.trim()} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-border text-center text-xs text-muted-foreground py-3">{t("messages.cantSend")}</div>
      )}

      {/* Long-press context menu */}
      {ctxMenu && (
        <div ref={menuRef} className="fixed z-50 glass border border-border rounded-xl overflow-hidden w-[200px] shadow-xl" style={menuStyle}>
          <div className="flex items-center justify-around px-2 py-2 border-b border-border">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => { react(ctxMenu.message.id, e); setCtxMenu(null); }} className="text-2xl leading-none w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary/60 transition">{e}</button>
            ))}
          </div>
          {ctxItems.map((it, idx) => (
            <button key={idx} onClick={it.onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-secondary/60 text-left ${it.danger ? "text-destructive" : ""}`}>
              <it.icon className="w-4 h-4 shrink-0" /> {it.label}
            </button>
          ))}
        </div>
      )}

      {/* Unsend confirm dialog */}
      {confirmUnsend && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center px-6" onClick={() => setConfirmUnsend(null)}>
          <div className="bg-card border border-border rounded-2xl p-5 max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-center mb-4">{t("chat.unsentConfirm")}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmUnsend(null)} className="flex-1 py-2.5 rounded-xl bg-secondary text-sm font-medium">{t("settings.cancel")}</button>
              <button onClick={doUnsend} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold">{t("chat.unsentConfirmAction")}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}