import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Ban, BellOff, Flag } from "lucide-react";
import { blockUser, unblockUser, muteUser, unmuteUser, blockExists, isMuted, reportUser } from "@/lib/dm";
import ReportDialog from "@/components/ReportDialog";
import { useT } from "@/lib/i18n";

export default function UserMenu({ meId, targetId }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!meId || !targetId || meId === targetId) return;
    (async () => { setBlocked(await blockExists(meId, targetId)); setMuted(await isMuted(meId, targetId)); })();
  }, [meId, targetId]);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  async function toggleBlock() { if (blocked) { await unblockUser(meId, targetId); setBlocked(false); } else { await blockUser(meId, targetId); setBlocked(true); } setOpen(false); }
  async function toggleMute() { if (muted) { await unmuteUser(meId, targetId); setMuted(false); } else { await muteUser(meId, targetId); setMuted(true); } setOpen(false); }

  if (!meId || !targetId || meId === targetId) return null;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="p-2 rounded-lg hover:bg-secondary"><MoreVertical className="w-4 h-4" /></button>
      {open && (
        <div className="absolute right-0 top-10 z-50 glass border border-border rounded-xl py-1 w-40">
          <button onClick={toggleMute} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><BellOff className="w-4 h-4" /> {muted ? t("common.unmute") : t("common.mute")}</button>
          <button onClick={toggleBlock} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Ban className="w-4 h-4" /> {blocked ? t("common.unblock") : t("common.block")}</button>
          <button onClick={() => { setOpen(false); setShowReport(true); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Flag className="w-4 h-4" /> {t("common.report")}</button>
        </div>
      )}
      {showReport && <ReportDialog onClose={() => setShowReport(false)} onSubmit={async (reason) => { await reportUser(meId, targetId, reason); setShowReport(false); }} />}
    </div>
  );
}