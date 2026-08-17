export const WORKOUT_TYPES = [
  "ベンチプレス",
  "スクワット",
  "デッドリフト",
  "腕立て伏せ",
  "懸垂",
  "ランニング",
  "プランク",
  "ダンベルカール"
];

export const WORKOUT_META = {
  ベンチプレス: { icon: "Dumbbell", unit: "kg" },
  スクワット: { icon: "Footprints", unit: "kg" },
  デッドリフト: { icon: "Dumbbell", unit: "kg" },
  腕立て伏せ: { icon: "Activity", unit: "回" },
  懸垂: { icon: "ArrowUp", unit: "回" },
  ランニング: { icon: "Footprints", unit: "秒" },
  プランク: { icon: "Timer", unit: "秒" },
  ダンベルカール: { icon: "Dumbbell", unit: "kg" }
};

export const METRIC_LABEL_KEYS = {
  volume: "workout.metric_volume",
  reps: "workout.metric_reps",
  duration: "workout.metric_duration"
};

export function computeVolume({ sets, reps, weight }) {
  const s = Number(sets) || 0;
  const r = Number(reps) || 0;
  const w = Number(weight) || 0;
  return Math.round(s * r * w * 100) / 100;
}

export function metricValue(record, metric) {
  if (metric === "reps") return Number(record.reps) || 0;
  if (metric === "duration") return Number(record.duration_sec) || 0;
  return Number(record.volume) || 0;
}

export function formatNumber(n) {
  return (Number(n) || 0).toLocaleString("ja-JP");
}



export function timeAgo(iso) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

export function liveDuration(startedAt) {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(diff / 60).toString().padStart(2, "0");
  const s = (diff % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}