import { EXERCISES_BY_BODY_PART } from "@/lib/exercises";

const CARDIO_EXERCISES = new Set(EXERCISES_BY_BODY_PART["有酸素"] || []);

export function isCardio(workoutType) {
  return CARDIO_EXERCISES.has(workoutType);
}

export function formatDuration(seconds) {
  const s = Math.round(Number(seconds) || 0);
  if (s <= 0) return "0秒";
  if (s < 60) return `${s}秒`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem > 0 ? `${m}分${rem}秒` : `${m}分`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
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

export function formatDateJP(d) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
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