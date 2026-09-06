import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useT } from "@/lib/i18n";
import { subscribeNotif, markAllNotifRead } from "@/lib/notifStore";

export default function NotificationsBell({ meId, className = "p-2", iconClassName = "w-5 h-5", to = "/notifications" }) {
  const t = useT();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    return subscribeNotif(setUnread);
  }, []);

  async function handleClick() {
    // Feed bell clears all notifications; home bell leaves feed notifications untouched
    if (to === "/notifications") {
      await markAllNotifRead();
    }
    navigate(to);
  }

  return (
    <button
      onClick={handleClick}
      className={`relative rounded-lg hover:bg-secondary transition-colors ${className}`}
      aria-label={t("notifications.title")}
    >
      <Bell className={iconClassName} />
      {unread > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}