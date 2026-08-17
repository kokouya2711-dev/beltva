import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home as HomeIcon,
  Users,
  Send,
  MessageSquare,
  User,
  Dumbbell,
  Plus
} from "lucide-react";
import GoLiveDialog from "@/components/GoLiveDialog";
import WorkoutSessionDialog from "@/components/workout/WorkoutSessionDialog";
import SimpleSessionDialog from "@/components/SimpleSessionDialog";
import NotificationsBell from "@/components/NotificationsBell";
import { updatePresence } from "@/lib/dm";
import { initNotifStore, subscribeNotif } from "@/lib/notifStore";
import { initDmUnreadStore, subscribeDmUnread } from "@/lib/dmUnreadStore";
import { useT } from "@/lib/i18n";
import { TrainingProvider, useTraining } from "@/lib/trainingContext";
import { Image } from "@/components/ui/image";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { TimelineFilterProvider, useTimelineFilter } from "@/lib/timelineFilterContext";
import { POST_CATEGORIES } from "@/lib/community";
import { useTCategory } from "@/lib/i18nHelpers";
import TimelineWorkoutFilter from "@/components/TimelineWorkoutFilter";

const LOGO_URL = "https://media.base44.com/images/public/6a7190f1483b67d357e796b4/8a9fd6e06_IMG_2256.png";

const nav = [
  { to: "/", labelKey: "nav.home", icon: HomeIcon },
  { to: "/users", labelKey: "nav.users", icon: Users },
  { to: "/messages", labelKey: "nav.messages", icon: Send },
  { to: "/timeline", labelKey: "nav.timeline", icon: MessageSquare },
  { to: "/me", labelKey: "nav.me", icon: User }
];

const FILTER_TABS = ["all", "latest", "popular", "following", ...POST_CATEGORIES];

const MemoizedOutlet = React.memo(() => <Outlet />);

// Red badge for bottom nav items (timeline notifications + DM unread)
function NavBadge({ to }) {
  const [count, setCount] = useState(0);
  React.useEffect(() => {
    if (to === "/timeline") return subscribeNotif(setCount);
    if (to === "/messages") return subscribeDmUnread(setCount);
  }, [to]);
  if (!count) return null;
  return (
    <span className="absolute top-0.5 right-[20%] min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function AppLayout() {
  return (
    <TrainingProvider>
      <TimelineFilterProvider>
        <AppLayoutInner />
      </TimelineFilterProvider>
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
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const headerHidden = useScrollDirection([location.pathname]);
  const { filter, setFilter } = useTimelineFilter();
  const tCat = useTCategory();

  React.useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      if (u?.id) {
        initNotifStore(u.id);
        initDmUnreadStore(u.id);
      }
    }).catch(() => {});
  }, []);

  // Detect mobile keyboard open/close via focus/blur on input elements
  React.useEffect(() => {
    const isInput = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    const onFocusIn = (e) => { if (isInput(e.target)) setKeyboardOpen(true); };
    const onFocusOut = (e) => { if (isInput(e.target)) setKeyboardOpen(false); };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  React.useEffect(() => {
    if (!me) return;
    updatePresence(me.id, isActive);
    const i = setInterval(() => updatePresence(me.id, isActive), 60000);
    return () => clearInterval(i);
  }, [me, isActive]);



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

      {/* Mobile top bar — minimal on timeline, full on other pages, hidden on post detail */}
      {location.pathname === "/timeline" ? (
        <header className="md:hidden sticky top-0 z-30 glass border-b border-border transition-transform duration-300 ease-out" style={{ transform: headerHidden ? "translateY(-100%)" : "translateY(0)" }}>
          <div className="flex items-center justify-end px-4 py-2 gap-2">
            <NotificationsBell meId={me?.id} />
            <button
              onClick={() => navigate("/create-post")}
              className="flex items-center gap-1 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg"
            >
              <Plus className="w-4 h-4" /> {t("post.create")}
            </button>
          </div>
          <div className="relative border-t border-border">
            <div
              className="flex gap-8 pl-4 pr-20 overflow-x-auto no-scrollbar"
              style={{
                maskImage: "linear-gradient(to right, black 78%, transparent 92%)",
                WebkitMaskImage: "linear-gradient(to right, black 78%, transparent 92%)"
              }}
            >
              {FILTER_TABS.map((c) => {
                const active = filter === c;
                const label = c === "all" ? t("common.all") : c === "latest" ? t("post.tab_latest") : c === "popular" ? t("post.tab_popular") : c === "following" ? t("post.tab_following") : tCat(c);
                return (
                  <button key={c} onClick={() => setFilter(c)} className={`shrink-0 text-[19px] py-2.5 border-b-2 transition whitespace-nowrap ${active ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground font-medium"}`}>{label}</button>
                );
              })}
            </div>
            <TimelineWorkoutFilter />
          </div>
        </header>
      ) : location.pathname.startsWith("/posts/") || location.pathname === "/create-post" ? null : (
        <header className="md:hidden sticky top-0 z-30 glass border-b border-border flex items-center justify-between px-4 py-2 transition-transform duration-300 ease-out" style={{ transform: headerHidden ? "translateY(-100%)" : "translateY(0)" }}>
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
      )}

      {/* Main content */}
      <main className={`flex-1 min-w-0 md:pb-8 ${keyboardOpen ? "pb-4" : "pb-28"}`}>
        <MemoizedOutlet />
      </main>

      {/* Mobile bottom tab bar — hidden while keyboard is open */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-border flex ${keyboardOpen ? "hidden" : "flex"}`} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {nav.map((n) => {
          const active = location.pathname === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`relative flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon style={{ width: 20, height: 20 }} />
              {t(n.labelKey)}
              <NavBadge to={n.to} />
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
    </div>
  );
}