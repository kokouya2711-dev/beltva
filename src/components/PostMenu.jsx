import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Bookmark, BookmarkCheck, EyeOff, VolumeX, Ban, Flag, Share2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { muteUser, blockUser, reportUser } from "@/lib/dm";

export default function PostMenu({ post, meId, isOwner, onEdit, onDelete, onShare, onFavoriteToggle, isFavorited, onHidden }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

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

  async function handleReport(reason) {
    setShowReport(false);
    if (!post.created_by_id) return;
    await reportUser(meId, post.created_by_id, reason);
    alert(t("post.reportedDone"));
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

  function handleShare() {
    setOpen(false);
    onShare?.();
  }

  if (post.is_anonymous && !isOwner) {
    // For anonymous posts by others, only show limited options
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-popover border border-border rounded-xl shadow-xl py-1" onClick={(e) => e.stopPropagation()}>
          {isOwner ? (
            <>
              <MenuItem icon={Pencil} label={t("common.edit")} onClick={() => { setOpen(false); onEdit?.(); }} />
              <MenuItem icon={Trash2} label={t("common.delete")} danger onClick={() => { setOpen(false); onDelete?.(); }} />
            </>
          ) : (
            <>
              <MenuItem icon={isFavorited ? BookmarkCheck : Bookmark} label={isFavorited ? t("post.unfavorite") : t("post.favorite")} onClick={handleFavorite} />
              <MenuItem icon={Share2} label={t("post.share")} onClick={handleShare} />
              {!post.is_anonymous && <MenuItem icon={EyeOff} label={t("post.hidePost")} onClick={handleHidePost} />}
              {!post.is_anonymous && <MenuItem icon={VolumeX} label={t("post.muteUser")} onClick={handleMute} />}
              {!post.is_anonymous && <MenuItem icon={Ban} label={t("post.blockUser")} onClick={handleBlock} />}
              {!post.is_anonymous && <MenuItem icon={Flag} label={t("common.report")} onClick={() => { setOpen(false); setShowReport(true); }} />}
            </>
          )}
        </div>
      )}

      {showReport && (
        <ReportReasonPicker
          t={t}
          onSubmit={handleReport}
          onClose={() => setShowReport(false)}
        />
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

function ReportReasonPicker({ t, onSubmit, onClose }) {
  const REASON_KEYS = ["report.spam", "report.inappropriate", "report.harassment", "report.violent", "report.other"];
  const [reason, setReason] = useState(REASON_KEYS[0]);
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold mb-3">{t("common.report")}</h3>
        <div className="space-y-2 mb-4">
          {REASON_KEYS.map((r) => (
            <button key={r} onClick={() => setReason(r)} className={`w-full text-left text-sm px-3 py-2 rounded-lg border ${reason === r ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{t(r)}</button>
          ))}
        </div>
        <button onClick={() => onSubmit(t(reason))} className="w-full bg-red-500 text-white font-semibold py-2.5 rounded-xl">{t("report.submit")}</button>
      </div>
    </div>
  );
}