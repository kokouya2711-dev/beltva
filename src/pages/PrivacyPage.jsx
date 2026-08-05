import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, MapPin, Eye } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function PrivacyPage() {
  const t = useT();
  const [me, setMe] = useState(null);
  const [shareLocation, setShareLocation] = useState(true);
  const [showOnline, setShowOnline] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      if (u.privacy_location !== undefined) setShareLocation(u.privacy_location !== false);
      if (u.privacy_online !== undefined) setShowOnline(u.privacy_online !== false);
    }).catch(() => {});
  }, []);

  async function toggleLocation() {
    const next = !shareLocation;
    setShareLocation(next);
    if (!next) {
      // Clear stored location when disabled
      try { await base44.auth.updateMe({ privacy_location: false, lat: null, lng: null }); } catch {}
    } else {
      try { await base44.auth.updateMe({ privacy_location: true }); } catch {}
    }
  }

  async function toggleOnline() {
    const next = !showOnline;
    setShowOnline(next);
    try { await base44.auth.updateMe({ privacy_online: next }); } catch {}
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">{t("settings.privacy")}</h1>
      </div>

      <div className="glass rounded-2xl border border-border divide-y divide-border overflow-hidden">
        <ToggleRow
          icon={MapPin}
          label={t("privacy.location")}
          desc={t("privacy.locationDesc")}
          checked={shareLocation}
          onChange={toggleLocation}
        />
        <ToggleRow
          icon={Eye}
          label={t("privacy.online")}
          desc={t("privacy.onlineDesc")}
          checked={showOnline}
          onChange={toggleOnline}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-4 px-1 leading-relaxed">{t("privacy.note")}</p>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        </div>
      </div>
      <button onClick={onChange} className={`w-11 h-6 rounded-full transition relative shrink-0 ${checked ? "bg-primary" : "bg-secondary border border-border"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}