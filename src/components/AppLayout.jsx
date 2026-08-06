import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home as HomeIcon,
  Users,
  Send,
  MessageSquare,
  User,
  Dumbbell
} from "lucide-react";
import GoLiveDialog from "@/components/GoLiveDialog";
import WorkoutSessionDialog from "@/components/workout/WorkoutSessionDialog";
import SimpleSessionDialog from "@/components/SimpleSessionDialog";
import NotificationsBell from "@/components/NotificationsBell";
import { updatePresence } from "@/lib/dm";
import { getGeolocation, fuzzCoords } from "@/lib/workouts";
import { useT } from "@/lib/i18n";
import { TrainingProvider, useTraining } from "@/lib/trainingContext";
import { Image } from "@/components/ui/image";
import TranslationDebugOverlay from "@/components/TranslationDebugOverlay";

const LOGO_URL = "https://media.base44.com/images/public/6a7190f1483b67d357e796b4/8a9fd6e06_IMG_2256.png";

const nav = [
  { to: "/", labelKey: "nav.home", icon: HomeIcon },
  { to: "/users", labelKey: "nav.users", icon: Users },
  { to: "/messages", labelKey: "nav.messages", icon: Send },
  { to: "/timeline", labelKey: "nav.timeline", icon: MessageSquare },
  { to: "/me", labelKey: "nav.me", icon: User }
];

const MemoizedOutlet = React.memo(() => <Outlet />);

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
  const { isActive, isSimple, isPaused, elapsedSec, startTraining } = useTraining();
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const ss = String(elapsedSec % 60).padStart(2, "0");
  const [me, setMe] = useState(null);
  const [showGoLive, setShowGoLive] = useState(false);
  const [showWorkoutSession, setShowWorkoutSession] = useState(false);
  const [showSimpleSession, setShowSimpleSession] = useState(false);
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
        <div className="px-4 py-3 flex items-center gap-2">
          <Image src={LOGO_URL} alt="BELTVA" className="w-9 h-9 rounded-lg shrink-0" fittingType="fill" />
          <div className="leading-tight flex-1">
            <div className="font-semibold tracking-tight text-sm">BELTVA</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Train · Live · Rank</div>
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
          {isActive ? (
            <button
              onClick={() => isSimple ? setShowSimpleSession(true) : setShowWorkoutSession(true)}
              className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-semibold py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-accent/20"
            >
              <Dumbbell className="w-4 h-4" /> {isPaused ? `⏸ ${t("training.paused")} ${mm}:${ss}` : `💪 ${t("nav.training")} ${mm}:${ss}`}
            </button>
          ) : (
            <button
              onClick={() => setShowGoLive(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20"
            >
              <Dumbbell className="w-4 h-4" /> {t("nav.goLive")}
            </button>
          )}
          {me && (
            <Link to={`/profile/${me.id}`} className="mt-3 px-2 text-xs text-muted-foreground truncate hover:text-primary block">
              @{me.email?.split("@")[0]}
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 glass border-b border-border flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Image src={LOGO_URL} alt="BELTVA" className="w-8 h-8 rounded-lg shrink-0" fittingType="fill" />
          <span className="font-semibold tracking-tight text-sm">BELTVA</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationsBell meId={me?.id} />
          {isActive ? (
            <button
              onClick={() => isSimple ? setShowSimpleSession(true) : setShowWorkoutSession(true)}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground text-sm font-semibold px-3 py-1.5 rounded-lg"
            >
              <Dumbbell className="w-3.5 h-3.5" /> {isPaused ? `⏸ ${mm}:${ss}` : `${mm}:${ss}`}
            </button>
          ) : (
            <button
              onClick={() => setShowGoLive(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-lg"
            >
              <Dumbbell className="w-3.5 h-3.5" /> {t("nav.goLive")}
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-28 md:pb-8">
        <MemoizedOutlet />
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

      {showGoLive && <GoLiveDialog onClose={() => setShowGoLive(false)} onDetailedSelect={() => { setShowGoLive(false); setShowWorkoutSession(true); }} onQuickStart={(tpl) => {
        const data = JSON.parse(tpl.exercises || "[]");
        startTraining(data.map(e => ({ workout_type: e.workout_type, sets: e.sets.map(s => ({ weight: s.weight || 0, reps: s.reps || 0 })) })));
        setShowGoLive(false);
        setShowWorkoutSession(true);
      }} onQuickStartCategory={(tpls) => {
        const allExercises = tpls.flatMap(tpl => {
          const data = JSON.parse(tpl.exercises || "[]");
          return data.map(e => ({ workout_type: e.workout_type, sets: e.sets.map(s => ({ weight: s.weight || 0, reps: s.reps || 0 })) }));
        });
        startTraining(allExercises);
        setShowGoLive(false);
        setShowWorkoutSession(true);
      }} onSimpleSelect={() => {
        startTraining([], true);
        setShowGoLive(false);
      }} />}
      {showWorkoutSession && <WorkoutSessionDialog onClose={() => setShowWorkoutSession(false)} />}
      {showSimpleSession && <SimpleSessionDialog onClose={() => setShowSimpleSession(false)} />}
      <TranslationDebugOverlay />
    </div>
  );
}