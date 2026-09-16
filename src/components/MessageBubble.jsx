import React, { useRef } from "react";
import { Check, CheckCheck } from "lucide-react";
import { parseReactions } from "@/lib/dm";
import { useT } from "@/lib/i18n";

export default function MessageBubble({
  message,
  meId,
  read,
  replyOrigin,
  replySenderName,
  onReplyTap,
  onLongPress,
  editing,
  editValue,
  onEditChange,
  onEditSave,
  onEditCancel,
  onReact,
}) {
  const t = useT();
  const mine = message.sender_id === meId;
  const reactions = parseReactions(message.reactions);
  const myEmojis = reactions.filter((r) => r.user_id === meId).map((r) => r.emoji);
  const uniqueEmojis = [...new Set(reactions.map((r) => r.emoji))];
  const d = new Date(message.created_date);
  const displayTime = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  const deleted = !!message.deleted_at;
  const edited = !!message.edited_at && !deleted;

  const lpTimer = useRef(null);
  const lpCoords = useRef({ x: 0, y: 0 });

  const handleCtx = (e) => {
    if (deleted) return;
    e.preventDefault();
    onLongPress?.(message, e);
  };

  const startLongPress = (e) => {
    if (deleted) return;
    const touch = e.touches?.[0];
    lpCoords.current = { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
    lpTimer.current = setTimeout(() => {
      onLongPress?.(message, { clientX: lpCoords.current.x, clientY: lpCoords.current.y });
    }, 480);
  };
  const cancelLongPress = () => {
    if (lpTimer.current) { clearTimeout(lpTimer.current); lpTimer.current = null; }
  };

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
        <div
          onContextMenu={handleCtx}
          onTouchStart={startLongPress}
          onTouchMove={cancelLongPress}
          onTouchEnd={cancelLongPress}
          onTouchCancel={cancelLongPress}
          style={{ WebkitTouchCallout: "none", userSelect: "none", touchAction: "manipulation" }}
          className={`rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary border border-border rounded-bl-md"} ${deleted ? "italic bg-secondary !text-muted-foreground border-0" : ""}`}
        >
          {message.image_url && !deleted && (
            <img src={message.image_url} alt="" className="rounded-lg max-h-60 max-w-full object-cover mb-1" draggable={false} />
          )}
          {deleted ? (
            <div>{t("chat.unsent")}</div>
          ) : editing ? (
            <div className="flex flex-col gap-1.5">
              <textarea
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                className="bg-background/20 rounded-lg p-1.5 text-sm outline-none resize-none min-h-[44px] w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEditSave(); }
                }}
              />
              <div className="flex gap-2 justify-end text-xs">
                <button type="button" onClick={onEditCancel} className="opacity-80 px-2 py-0.5 rounded">{t("settings.cancel")}</button>
                <button type="button" onClick={onEditSave} className="font-semibold px-2 py-0.5 rounded">{t("common.done")}</button>
              </div>
            </div>
          ) : (
            <React.Fragment>
              {message.reply_to_id && (
                <button
                  type="button"
                  onClick={() => onReplyTap?.(message.reply_to_id)}
                  className={`block w-full text-left mb-1.5 rounded-lg overflow-hidden border-l-2 ${mine ? "bg-black/15 border-primary-foreground/50" : "bg-background/50 border-primary"}`}
                >
                  <div className="px-2 py-1">
                    <div className="font-semibold text-sm leading-tight">
                      {replyOrigin?.deleted_at ? t("chat.replyCancelled") : (replySenderName || "")}
                    </div>
                    <div className="text-sm leading-snug opacity-80 line-clamp-3 break-words">
                      {replyOrigin?.deleted_at ? t("chat.unsent") : (replyOrigin?.content || "…")}
                    </div>
                  </div>
                </button>
              )}
              {message.content && <div className="whitespace-pre-wrap break-words">{message.content}</div>}
            </React.Fragment>
          )}
        </div>

        {uniqueEmojis.length > 0 && !deleted && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {uniqueEmojis.map((emoji) => {
              const mineReact = myEmojis.includes(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact?.(emoji)}
                  className={`text-lg leading-none rounded-full px-1.5 py-0.5 border transition active:scale-90 ${mineReact ? "border-primary bg-primary/15" : "border-border bg-secondary/60"}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        )}

        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
          {mine && !deleted && (read ? <><CheckCheck className="w-3 h-3" /> {t("common.read")}</> : <Check className="w-3 h-3" />)}
          {edited && <span className="italic">{t("chat.edited")}</span>}
          <span>{displayTime}</span>
        </div>
      </div>
    </div>
  );
}