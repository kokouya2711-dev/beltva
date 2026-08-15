import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function NotificationsBell({ meId }) {
  const t = useT();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  async function load() {
    if (!meId) return;
    const ns = await base44.entities.Notification.filter({ user_id: meId }, "-created_date", 30).catch(() => []);
    setUnread(ns.filter((n) => !n.read).length);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [meId]);

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
      aria-label={t("notif.title")}
    >
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}