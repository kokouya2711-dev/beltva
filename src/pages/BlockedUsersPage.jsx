import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Ban, Loader2, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import { fetchUser, displayName } from "@/lib/profile";

export default function BlockedUsersPage() {
  const t = useT();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const meUser = await base44.auth.me().catch(() => null);
      if (!meUser) { setLoading(false); return; }
      setMe(meUser);
      const bs = await base44.entities.Block.filter({ blocker_id: meUser.id });
      setBlocks(bs);
      setLoading(false);
    })();
  }, []);

  async function unblock(blockId) {
    if (!window.confirm(t("blocked.unblockConfirm"))) return;
    await base44.entities.Block.delete(blockId).catch(() => {});
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="relative flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full bg-secondary/60 hover:bg-secondary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">{t("blocked.title")}</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : blocks.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <Ban className="w-10 h-10 opacity-40" />
          <div className="text-base">{t("blocked.empty")}</div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {blocks.map((b) => <BlockedRow key={b.id} block={b} onUnblock={() => unblock(b.id)} />)}
        </div>
      )}
    </div>
  );
}

function BlockedRow({ block, onUnblock }) {
  const t = useT();
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(block.blocked_id).then(setUser).catch(() => {}); }, [block.blocked_id]);
  const name = displayName(user);
  return (
    <div className="flex items-center gap-3 py-4">
      <Link to={user ? `/profile/${user.id}` : "#"} className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
        {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
      </Link>
      <Link to={user ? `/profile/${user.id}` : "#"} className="flex-1 min-w-0 text-base font-medium truncate hover:text-primary">{name}</Link>
      <button onClick={onUnblock} className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition">{t("common.unblock")}</button>
    </div>
  );
}