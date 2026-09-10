import React from "react";
import { Check, CheckCheck } from "lucide-react";
import { parseReactions, groupReactions } from "@/lib/dm";
import { useT } from "@/lib/i18n";

export default function MessageBubble({ message, meId, read }) {
  const t = useT();
  const mine = message.sender_id === meId;
  const grouped = groupReactions(parseReactions(message.reactions));
  const d = new Date(message.created_date);
  const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary border border-border rounded-bl-md"}`}>
          {message.image_url && <img src={message.image_url} alt="" className="rounded-lg max-h-60 max-w-full object-cover mb-1" />}
          {message.content && <div className="whitespace-pre-wrap break-words">{message.content}</div>}
        </div>
        {Object.keys(grouped).length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {Object.entries(grouped).map(([emoji, count]) => (
              <span key={emoji} className="text-xs bg-secondary/60 border border-border rounded-full px-1.5 py-0.5">{emoji} {count}</span>
            ))}
          </div>
        )}
        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
          {mine && (read ? <><CheckCheck className="w-3 h-3" /> {t("common.read")}</> : <Check className="w-3 h-3" />)}
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}