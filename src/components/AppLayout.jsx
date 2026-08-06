import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home as HomeIcon,
  Users,
  Send,
  MessageSquare,
  Flame,
  Settings,
  Dumbbell,
  Bell
} from "lucide-react";
import GoLiveDialog from "@/components/GoLiveDialog";
import WorkoutSessionDialog from "@/components/workout/WorkoutSessionDialog";
import NotificationsBell from "@/components/NotificationsBell";
import { updatePresence } from "@/lib/dm";
import { getGeolocation, fuzzCoords } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { TrainingProvider, useTraining } from "@/lib/trainingContext";
import TrainingFloatingBar from "@/components/TrainingFloatingBar";

const nav = [
  { to: "/", labelKey: "nav.home", icon: HomeIcon },
  { to: "/users", labelKey: "nav.users", icon: Users },
  { to: "/messages", labelKey: "nav.messages", icon: Send },
  { to: "/timeline", labelKey: "nav.timeline", icon: MessageSquare },
  { to: "/settings", labelKey: "nav.settings", icon: Settings }
];

export default function AppLayout() {
  return (
    <TrainingProvider>
      <AppLayoutInner />
    </TrainingProvider>
  );
}

function AppLayoutInner() {
  const t = useT();
  const navigate = useNavigate();
  const { isActive } = useTraining();
  const [me, setMe] = useState(null);
  const [showGoLive, setShowGoLive] = useState(false);
  const [showWorkoutSession, setShowWorkoutSession] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!me) return;
    updatePresence(me.id);
    const i = setInterval(() => updatePresence(me.id), 60000);
    return () => clearInterval(i);
  }, [me]);

  React.useEffect(() => {
    if (!me || me.lat) return;
    (async () => {
      const geo = await getGeolocation();
      if (!geo) return;
      const f = fuzzCoords(geo.lat, geo.lng);
      base44.auth.updateMe({ lat: f.lat, lng: f.lng }).catch(() => {});
    })();
  }, [me]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border glass sticky top-0 h-screen">
        <div className="p-5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-tight flex-1">
            <div className="font-bold tracking-tight">BELTVA</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Train · Live · Rank</div>
          </div>
          <NotificationsBell meId={me?.id} />
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
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon style={{ width: 18, height: 18 }} />
                {t(n.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            onClick={() => setShowGoLive(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20"
          >
            <Dumbbell className="w-4 h-4" /> {t("nav.goLive")}
          </button>
          {me && (
            <Link to={`/profile/${me.id}`} className="mt-3 px-2 text-xs text-muted-foreground truncate hover:text-primary block">
              @{me.email?.split("@")[0]}
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 glass border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight">BELTVA</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationsBell meId={me?.id} />
          <button
            onClick={() => setShowGoLive(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-lg"
          >
            <Dumbbell className="w-3.5 h-3.5" /> {t("nav.goLive")}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-28 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-border flex" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
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
              {t(n.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Training floating bar - visible on all pages when training is active */}
      {isActive && !showWorkoutSession && (
        <TrainingFloatingBar onClick={() => setShowWorkoutSession(true)} />
      )}

      {showGoLive && <GoLiveDialog onClose={() => setShowGoLive(false)} onDetailedSelect={() => { setShowGoLive(false); setShowWorkoutSession(true); }} />}
      {showWorkoutSession && <WorkoutSessionDialog onClose={() => setShowWorkoutSession(false)} />}
    </div>
  );
}