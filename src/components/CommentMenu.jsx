import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Flag } from "lucide-react";
import { useT } from "@/lib/i18n";

// 3-dot menu for reporting another user's comment / reply.
// Own comments render nothing (existing edit/delete, if any, are kept by the caller).
export default function CommentMenu({ comment, meId }) {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!comment?.created_by_id || comment.created_by_id === meId) return null;

  function handleReport() {
    setOpen(false);
    navigate("/report", {
      state: {
        target_type: "comment",
        target_id: comment.id,
        reported_id: comment.created_by_id,
        target_content: comment.content || "",
      },
    });
  }

  return (
    <div className="relative shrink-0 self-start" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 -mr-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-8 z-50 w-40 bg-popover border border-border rounded-xl shadow-xl py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleReport}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-secondary transition"
          >
            <Flag className="w-4 h-4 shrink-0" /> {t("common.report")}
          </button>
        </div>
      )}
    </div>
  );
}