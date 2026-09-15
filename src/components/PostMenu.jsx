import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Pencil, Trash2, Bookmark, BookmarkCheck, EyeOff, VolumeX, Ban, Flag } from "lucide-react";
import { useT } from "@/lib/i18n";
import { muteUser, blockUser } from "@/lib/dm";

export default function PostMenu({ post, meId, isOwner, onEdit, onDelete, onFavoriteToggle, isFavorited, onHidden }) {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const btnRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function openMenu() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const MENU_HEIGHT = 230; // approx 5 items × ~44px + padding
      const BOTTOM_NAV = 80;
      const spaceBelow = window.innerHeight - rect.bottom - BOTTOM_NAV;
      const spaceAbove = rect.top;
      const placeBelow = spaceBelow >= MENU_HEIGHT || spaceBelow >= spaceAbove;
      if (placeBelow) {
        setMenuPos({ top: rect.bottom + 4, left: rect.right - 176 });
      } else {
        setMenuPos({ top: rect.top - MENU_HEIGHT - 4, left: rect.right - 176 });
      }
    }
    setOpen(true);
  }

  async function handleMute() {
    setOpen(false);
    if (!post.created_by_id || post.is_anonymous) return;
    await muteUser(meId, post.created_by_id);
    alert(t("post.mutedDone"));
    onHidden?.();
  }

  async function handleBlock() {
    setOpen(false);
    if (!post.created_by_id || post.is_anonymous) return;
    if (!window.confirm(t("post.blockConfirm"))) return;
    await blockUser(meId, post.created_by_id);
    alert(t("post.blockedDone"));
    onHidden?.();
  }

  function handleReport() {
    setOpen(false);
    if (!post.created_by_id) return;
    navigate("/report", {
      state: {
        target_type: "post",
        target_id: post.id,
        reported_id: post.created_by_id,
        target_content: post.content || "",
      },
    });
  }

  async function handleHidePost() {
    setOpen(false);
    if (!window.confirm(t("post.hideConfirm"))) return;
    await import("@/api/base44Client").then(({ base44 }) =>
      base44.entities.HiddenPost.create({ post_id: post.id })
    );
    onHidden?.();
  }

  function handleFavorite() {
    setOpen(false);
    onFavoriteToggle?.();
  }

  if (post.is_anonymous && !isOwner) {
    // For anonymous posts by others, only show limited options
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); open ? setOpen(false) : openMenu(); }}
        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && menuPos && (
        <div
          className="fixed z-[60] w-44 bg-popover border border-border rounded-xl shadow-xl py-1"
          style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {isOwner ? (
            <>
              <MenuItem icon={Pencil} label={t("common.edit")} onClick={() => { setOpen(false); onEdit?.(); }} />
              <MenuItem icon={Trash2} label={t("common.delete")} danger onClick={() => { setOpen(false); onDelete?.(); }} />
            </>
          ) : (
            <>
              <MenuItem icon={isFavorited ? BookmarkCheck : Bookmark} label={isFavorited ? t("post.unfavorite") : t("post.favorite")} onClick={handleFavorite} />
              {!post.is_anonymous && <MenuItem icon={EyeOff} label={t("post.hidePost")} onClick={handleHidePost} />}
              {!post.is_anonymous && <MenuItem icon={VolumeX} label={t("post.muteUser")} onClick={handleMute} />}
              {!post.is_anonymous && <MenuItem icon={Ban} label={t("post.blockUser")} onClick={handleBlock} />}
              {!post.is_anonymous && <MenuItem icon={Flag} label={t("common.report")} onClick={handleReport} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-secondary transition ${danger ? "text-destructive" : "text-foreground"}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}