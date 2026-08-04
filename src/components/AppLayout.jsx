import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home as HomeIcon,
  Radio,
  Map as MapIcon,
  Trophy,
  Flame,
  Menu,
  X
} from "lucide-react";
import GoLiveDialog from "@/components/GoLiveDialog";

const nav = [
  { to: "/", label: "ホーム", icon: HomeIcon },
  { to: "/live", label: "ライブ", icon: Radio },
  { to: "/map", label: "マップ", icon: MapIcon },
  { to: "/rankings", label: "ランキング", icon: Trophy }
];

export default function AppLayout() {
  const [me, setMe] = useState(null);
  const [showGoLive, setShowGoLive] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border glass sticky top-0 h-screen">
        <div className="p-5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-bold tracking-tight">PULSE</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Train · Live · Rank</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {nav.map((n) => {
            const active = location.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            onClick={() => setShowGoLive(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20"
          >
            <Radio className="w-4 h-4" /> ライブ開始
          </button>
          {me && (
            <div className="mt-3 px-2 text-xs text-muted-foreground truncate">
              @{me.email?.split("@")[0]}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 glass border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight">PULSE</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGoLive(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-lg"
          >
            <Radio className="w-3.5 h-3.5" /> 配信
          </button>
          <button onClick={() => setMobileOpen((v) => !v)} className="p-1.5">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden glass border-b border-border px-4 py-3 flex gap-2">
          {nav.map((n) => {
            const active = location.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs ${
                  active ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              >
                <Icon style={{ width: 18, height: 18 }} />
                {n.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-border flex">
        {nav.map((n) => {
          const active = location.pathname === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon style={{ width: 20, height: 20 }} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {showGoLive && <GoLiveDialog onClose={() => setShowGoLive(false)} />}
    </div>
  );
}