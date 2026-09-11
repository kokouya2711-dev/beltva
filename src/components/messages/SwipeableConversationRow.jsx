import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { displayName } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { useTimeAgo } from "@/lib/i18nHelpers";
import { Pin, PinOff, BellOff, Bell, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CountryFlagBadge from "@/components/CountryFlagBadge";

const RIGHT_ACTION_WIDTH = 150; // pin + delete
const LEFT_ACTION_WIDTH = 80; // mute
const SNAP_THRESHOLD = 40;

export default function SwipeableConversationRow({
  conv,
  me,
  other,
  isOnline,
  unread,
  onNavigate,
  onDeleted,
}) {
  const t = useT();
  const timeAgo = useTimeAgo();
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const dragRef = useRef(null);
  const startRef = useRef(null);

  const isA = conv.a_id === me.id;
  const myPinned = isA ? conv.a_pinned : conv.b_pinned;
  const myMuted = isA ? conv.a_muted : conv.b_muted;

  function clampOffset(v) {
    return Math.max(-RIGHT_ACTION_WIDTH, Math.min(LEFT_ACTION_WIDTH, v));
  }

  function handleStart(clientX) {
    setAnimating(false);
    startRef.current = { x: clientX, offset };
  }

  function handleMove(clientX) {
    if (!startRef.current) return;
    const dx = clientX - startRef.current.x;
    setOffset(clampOffset(startRef.current.offset + dx));
  }

  function handleEnd() {
    if (!startRef.current) return;
    startRef.current = null;
    setAnimating(true);
    if (offset <= -SNAP_THRESHOLD) {
      setOffset(-RIGHT_ACTION_WIDTH);
    } else if (offset >= SNAP_THRESHOLD) {
      setOffset(LEFT_ACTION_WIDTH);
    } else {
      setOffset(0);
    }
    setTimeout(() => setAnimating(false), 250);
  }

  // Close any open row when clicking elsewhere
  useEffect(() => {
    if (offset === 0) return;
    function onDocClick(e) {
      if (dragRef.current && !dragRef.current.contains(e.target)) {
        setAnimating(true);
        setOffset(0);
      }
    }
    document.addEventListener("touchstart", onDocClick, { passive: true });
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [offset]);

  function closeRow() {
    setAnimating(true);
    setOffset(0);
    setTimeout(() => setAnimating(false), 250);
  }

  async function togglePin() {
    closeRow();
    const key = isA ? "a_pinned" : "b_pinned";
    try {
      await base44.entities.Conversation.update(conv.id, { [key]: !myPinned });
      onDeleted();
    } catch {}
  }

  async function toggleMute() {
    closeRow();
    const key = isA ? "a_muted" : "b_muted";
    try {
      await base44.entities.Conversation.update(conv.id, { [key]: !myMuted });
      onDeleted();
    } catch {}
  }

  async function doDelete() {
    setShowDeleteDialog(false);
    closeRow();
    try {
      // Delete all messages in the conversation, then the conversation itself
      const msgs = await base44.entities.Message.filter({ conversation_id: conv.id }, "-created_date", 500);
      if (msgs.length > 0) {
        await base44.entities.Message.deleteMany({ conversation_id: conv.id });
      }
      await base44.entities.Conversation.delete(conv.id);
      onDeleted();
    } catch {}
  }

  function handleRowClick() {
    if (offset !== 0) {
      closeRow();
      return;
    }
    onNavigate();
  }

  const otherId = isA ? conv.b_id : conv.a_id;
  const o = other;

  return (
    <>
      <div
        ref={dragRef}
        className="relative overflow-hidden border-b border-border last:border-b-0"
        style={{ touchAction: "pan-y" }}
      >
        {/* Left action (revealed on right swipe): mute */}
        <div className="absolute inset-y-0 left-0 flex items-stretch transition-opacity duration-200" style={{ opacity: offset > 0 ? 1 : 0 }}>
          <button
            onClick={toggleMute}
            className="w-[80px] flex flex-col items-center justify-center gap-1 bg-slate-600 text-white"
          >
            {myMuted ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{myMuted ? t("messages.unmute") : t("messages.mute")}</span>
          </button>
        </div>

        {/* Right actions (revealed on left swipe): pin + delete (delete outermost) */}
        <div className="absolute inset-y-0 right-0 flex items-stretch transition-opacity duration-200" style={{ opacity: offset < 0 ? 1 : 0 }}>
          <button
            onClick={togglePin}
            className="w-[75px] flex flex-col items-center justify-center gap-1 bg-primary text-primary-foreground"
          >
            {myPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{myPinned ? t("messages.unpin") : t("messages.pin")}</span>
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-[75px] flex flex-col items-center justify-center gap-1 bg-destructive text-destructive-foreground"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("messages.deleteChat")}</span>
          </button>
        </div>

        {/* Sliding content */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none bg-transparent"
          style={{
            transform: `translateX(${offset}px)`,
            transition: animating ? "transform 0.25s ease-out" : "none",
          }}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseMove={(e) => {
            if (startRef.current) handleMove(e.clientX);
          }}
          onMouseUp={handleEnd}
          onMouseLeave={() => { if (startRef.current) handleEnd(); }}
          onClick={handleRowClick}
        >
          <div className="relative shrink-0">
            {o?.avatar_url ? (
              <img src={o.avatar_url} className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                {displayName(o).slice(0, 2).toUpperCase()}
              </div>
            )}
            {o?.country && o.country.length === 2 && <CountryFlagBadge country={o.country} />}
            {isOnline && <span className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background z-20" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 min-w-0">
                {myPinned && <Pin className="w-3.5 h-3.5 text-primary shrink-0" />}
                {myMuted && <BellOff className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                <span className="font-medium truncate">{displayName(o)}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">{conv.last_message_at ? (() => { const dd = new Date(conv.last_message_at); return Date.now() - dd.getTime() > 24 * 60 * 60 * 1000 ? `${dd.getMonth() + 1}/${dd.getDate()}` : timeAgo(conv.last_message_at); })() : ""}</span>
            </div>
            <div className={`text-sm truncate ${unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {conv.last_message ? t(conv.last_message) : t("messages.startChat")}
            </div>
          </div>
          {unread && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("messages.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("messages.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("messages.deleteChat")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}