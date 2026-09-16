import React, { useRef } from "react";
import { Check, CheckCheck } from "lucide-react";
import { parseReactions, groupReactions } from "@/lib/dm";
import { useT } from "@/lib/i18n";

export default function MessageBubble({
  message,
  meId,
  read,
  replyOrigin,
  onReplyTap,
  onLongPress,
  editing,
  editValue,
  onEditChange,
  onEditSave,
  onEditCancel,
}) {
  const t = useT();
  const mine = message.sender_id === meId;
  const grouped = groupReactions(parseReactions(message.reactions));
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
      <div className={`max-w-[78%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
        {/* Reply quote */}
        {message.reply_to_id && (
          <button
            type="button"
            onClick={() => onReplyTap?.(message.reply_to_id)}
            className={`mb-1 max-w-full text-left text-xs rounded-lg px-2 py-1 border-l-2 truncate ${mine ? "border-primary-foreground/60 bg-primary-foreground/10" : "border-primary/60 bg-primary/10"}`}
          >
            {replyOrigin?.deleted_at ? (
              <span className="italic text-muted-foreground">{t("chat.replyCancelled")}</span>
            ) : (
              <span className="block truncate">
                <span className="opacity-70">{t("chat.replyTo")}: </span>
                {(replyOrigin?.content || "").slice(0, 60) || "…"}
              </span>
            )}
          </button>
        )}

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
            message.content && <div className="whitespace-pre-wrap break-words">{message.content}</div>
          )}
        </div>

        {Object.keys(grouped).length > 0 && !deleted && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {Object.entries(grouped).map(([emoji, count]) => (
              <span key={emoji} className="text-xs bg-secondary/60 border border-border rounded-full px-1.5 py-0.5">{emoji} {count}</span>
            ))}
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