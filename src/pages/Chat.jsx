import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { displayName, fetchUser } from "@/lib/profile";
import { acceptRequest, declineRequest, sendMessage, toggleReaction, blockExists, blockUser, unblockUser, muteUser, unmuteUser, isMuted, reportUser } from "@/lib/dm";
import MessageBubble from "@/components/MessageBubble";
import ReportDialog from "@/components/ReportDialog";
import { ArrowLeft, Send, Image as ImageIcon, MoreVertical, Ban, BellOff, Flag, Loader2 } from "lucide-react";

export default function Chat() {
  const { conversationId: id } = useParams();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [conv, setConv] = useState(null);
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [online, setOnline] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reactFor, setReactFor] = useState(null);
  const scrollRef = useRef(null);

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
    setOnline(presence[0]?.last_seen && Date.now() - new Date(presence[0].last_seen).getTime() < 120000);
    setBlocked(bl);
    setMuted(mt);
    const myField = meUser.id === c.a_id ? "a_read_at" : "b_read_at";
    await base44.entities.Conversation.update(id, { [myField]: new Date().toISOString() });
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, [id]);

  useEffect(() => {
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== id) return;
      setMessages((prev) => prev.some((m) => m.id === event.data.id) ? prev : [...prev, event.data]);
      if (event.data.sender_id !== me?.id && conv) {
        const myField = me?.id === conv.a_id ? "a_read_at" : "b_read_at";
        base44.entities.Conversation.update(id, { [myField]: new Date().toISOString() });
      }
    });
    return unsub;
  }, [id, me, conv]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!conv) return <div className="text-center py-20 text-muted-foreground">会話が見つかりません</div>;

  const otherId = me.id === conv.a_id ? conv.b_id : conv.a_id;
  const isRequest = conv.status === "requested";
  const amRecipient = conv.requester_id !== me.id;
  const otherReadAt = me.id === conv.a_id ? conv.b_read_at : conv.a_read_at;
  const canSend = !isRequest && !blocked;

  async function send() {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const { msg } = await sendMessage(conv, me.id, { content: draft.trim() });
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setDraft("");
      setConv((c) => ({ ...c, status: "active", last_message: draft.trim(), last_message_at: new Date().toISOString(), last_sender_id: me.id }));
    } finally { setSending(false); }
  }

  async function sendImage(file) {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const { msg } = await sendMessage(conv, me.id, { image_url: file_url });
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setConv((c) => ({ ...c, status: "active", last_message: "📷 画像", last_message_at: new Date().toISOString(), last_sender_id: me.id }));
    } finally { setUploading(false); }
  }

  async function react(emoji) {
    if (!reactFor) return;
    const msg = messages.find((m) => m.id === reactFor);
    const next = await toggleReaction(msg, me.id, emoji);
    setMessages((prev) => prev.map((m) => (m.id === reactFor ? { ...m, reactions: JSON.stringify(next) } : m)));
    setReactFor(null);
  }

  async function accept() { await acceptRequest(conv, me.id); setConv((c) => ({ ...c, status: "active" })); }
  async function decline() { await declineRequest(conv); navigate("/messages"); }

  async function toggleBlock() { if (blocked) { await unblockUser(me.id, otherId); setBlocked(false); } else { await blockUser(me.id, otherId); setBlocked(true); } setMenuOpen(false); }
  async function toggleMute() { if (muted) { await unmuteUser(me.id, otherId); setMuted(false); } else { await muteUser(me.id, otherId); setMuted(true); } setMenuOpen(false); }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-3rem)]">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => navigate("/messages")} className="p-1.5"><ArrowLeft className="w-5 h-5" /></button>
        <Link to={`/profile/${otherId}`} className="flex items-center gap-2 flex-1 min-w-0">
          {other?.avatar_url ? <img src={other.avatar_url} className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{displayName(other).slice(0, 2).toUpperCase()}</div>}
          <div className="min-w-0">
            <div className="font-semibold truncate flex items-center gap-1.5">{displayName(other)} {online && <span className="w-2 h-2 rounded-full bg-green-500" />}</div>
            <div className="text-xs text-muted-foreground">{online ? "オンライン" : "オフライン"}</div>
          </div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="p-1.5"><MoreVertical className="w-5 h-5" /></button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 glass border border-border rounded-xl py-1 w-40">
              <button onClick={toggleMute} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><BellOff className="w-4 h-4" /> {muted ? "ミュート解除" : "ミュート"}</button>
              <button onClick={toggleBlock} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Ban className="w-4 h-4" /> {blocked ? "ブロック解除" : "ブロック"}</button>
              <button onClick={() => { setMenuOpen(false); setShowReport(true); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Flag className="w-4 h-4" /> 通報</button>
            </div>
          )}
        </div>
      </div>

      {isRequest && (
        <div className="glass rounded-xl border border-border p-3 mb-3 text-sm">
          {amRecipient ? (
            <>
              <div className="font-medium mb-1">メッセージリクエスト</div>
              <div className="text-muted-foreground mb-3">{displayName(other)}さんからのメッセージです。承認するとチャットを始められます。</div>
              <div className="flex gap-2">
                <button onClick={accept} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-semibold">承認</button>
                <button onClick={decline} className="flex-1 bg-secondary border border-border py-2 rounded-lg">削除</button>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">相手の承認待ちです。</div>
          )}
        </div>
      )}
      {blocked && !isRequest && <div className="glass rounded-xl border border-border p-3 mb-3 text-sm text-muted-foreground">このユーザーをブロックしているため、メッセージを送れません。</div>}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pb-3">
        {messages.map((m) => {
          const read = m.sender_id === me.id && otherReadAt && new Date(otherReadAt).getTime() >= new Date(m.created_date).getTime();
          return (
            <div key={m.id} onClick={() => setReactFor(reactFor === m.id ? null : m.id)}>
              <MessageBubble message={m} meId={me.id} read={read} />
              {reactFor === m.id && (
                <div className="flex gap-1 mt-1 justify-end">
                  {["👍", "❤️", "🔥", "😂", "💪"].map((e) => (
                    <button key={e} onClick={(ev) => { ev.stopPropagation(); react(e); }} className="text-lg hover:scale-125 transition">{e}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {canSend ? (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <label className="p-2 cursor-pointer hover:text-primary relative">
            <ImageIcon className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && sendImage(e.target.files[0])} />
            {uploading && <Loader2 className="w-4 h-4 animate-spin absolute -top-0 -right-1" />}
          </label>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="メッセージを入力…" className="flex-1 bg-secondary/60 border border-border rounded-full px-4 py-2 text-sm outline-none focus:border-primary" />
          <button onClick={send} disabled={sending || !draft.trim()} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-border text-center text-xs text-muted-foreground py-3">{isRequest ? (amRecipient ? "承認してチャットを始めよう" : "承認待ちです") : "メッセージを送れません"}</div>
      )}

      {showReport && <ReportDialog onClose={() => setShowReport(false)} onSubmit={async (reason) => { await reportUser(me.id, otherId, reason); setShowReport(false); }} />}
    </div>
  );
}