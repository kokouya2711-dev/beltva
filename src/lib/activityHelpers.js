import { EXERCISES_BY_BODY_PART } from "@/lib/exercises";

const CARDIO_EXERCISES = new Set(EXERCISES_BY_BODY_PART["有酸素"] || []);

export function isCardio(workoutType) {
  return CARDIO_EXERCISES.has(workoutType);
}

const EXERCISE_TO_BODY_PART = {};
Object.entries(EXERCISES_BY_BODY_PART).forEach(([part, exercises]) => {
  exercises.forEach((ex) => { EXERCISE_TO_BODY_PART[ex] = part; });
});

export function getBodyPart(workoutType) {
  return EXERCISE_TO_BODY_PART[workoutType] || "その他";
}

export function formatDuration(seconds, t) {
  const s = Math.round(Number(seconds) || 0);
  if (s <= 0) return t ? t("dur.s").replace("{s}", 0) : "0秒";
  if (s < 60) return t ? t("dur.s").replace("{s}", s) : `${s}秒`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) {
    if (t) return rem > 0 ? t("dur.hms").replace("{h}", 0).replace("{m}", m).replace("{s}", rem) : t("dur.ms").replace("{m}", m);
    return rem > 0 ? `${m}分${rem}秒` : `${m}分`;
  }
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (t) return mm > 0 ? t("dur.hms").replace("{h}", h).replace("{m}", mm).replace("{s}", 0) : t("dur.hms").replace("{h}", h).replace("{m}", 0).replace("{s}", 0);
  return mm > 0 ? `${h}時間${mm}分` : `${h}時間`;
}

export function formatPace(distanceKm, durationSec) {
  const d = Number(distanceKm) || 0;
  const s = Math.round(Number(durationSec) || 0);
  if (d <= 0 || s <= 0) return "—";
  const paceSec = s / d;
  const m = Math.floor(paceSec / 60);
  const sec = Math.round(paceSec % 60);
  return `${m}:${String(sec).padStart(2, "0")}/km`;
}

export function getDateKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatTime(d) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDateJP(d, t) {
  if (t) return t("date.format").replace("{y}", d.getFullYear()).replace("{m}", d.getMonth() + 1).replace("{d}", d.getDate());
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// Month navigation bounds shared by calendar & activity sections.
// lowerBound = max(appStart month, 3 months ago). upperBound = current month.
export function getMonthNav(appStart, currentYear, currentMonth) {
  const threeAgo = new Date(currentYear, currentMonth - 3, 1);
  let lowerY = threeAgo.getFullYear();
  let lowerM = threeAgo.getMonth();
  if (appStart) {
    const startY = appStart.getFullYear();
    const startM = appStart.getMonth();
    if (startY > lowerY || (startY === lowerY && startM > lowerM)) {
      lowerY = startY;
      lowerM = startM;
    }
  }
  const totalMonths = (currentYear - lowerY) * 12 + (currentMonth - lowerM) + 1;
  const dotsCount = Math.min(Math.max(totalMonths, 1), 4);
  const activeIndex = (viewY, viewM) => (viewY - lowerY) * 12 + (viewM - lowerM);
  const canPrev = (viewY, viewM) => viewY > lowerY || (viewY === lowerY && viewM > lowerM);
  const canNext = (viewY, viewM) => viewY < currentYear || (viewY === currentYear && viewM < currentMonth);
  return { lowerY, lowerM, dotsCount, activeIndex, canPrev, canNext };
}

export function groupByDay(records) {
  const map = {};
  records.forEach((r) => {
    const key = getDateKey(r.created_date);
    if (!map[key]) map[key] = [];
    map[key].push(r);
  });
  return Object.entries(map)
    .map(([key, recs]) => {
      const sorted = [...recs].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      const end = new Date(sorted[sorted.length - 1].created_date);
      const duration = Math.max(0, ...recs.map((r) => Number(r.duration_sec) || 0));
      const start = new Date(new Date(sorted[0].created_date).getTime() - duration * 1000);
      const hasCardio = recs.some((r) => isCardio(r.workout_type));
      const hasStrength = recs.some((r) => !isCardio(r.workout_type));
      return {
        key, date: new Date(key), records: sorted,
        start, end, totalDuration: duration,
        hasCardio, hasStrength,
        totalVolume: recs.reduce((s, r) => s + (Number(r.volume) || 0), 0),
        totalDistance: recs.reduce((s, r) => s + (Number(r.distance) || 0), 0),
      };
    })
    .sort((a, b) => b.date - a.date);
}