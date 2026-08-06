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