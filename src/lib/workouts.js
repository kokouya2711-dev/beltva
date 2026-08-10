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

export function getGeolocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

// 位置を近隣（約5kmのグリッド）にぼかす。プライバシー保護のため正確な位置は保存しない。
export function fuzzCoords(lat, lng) {
  const grid = 0.05;
  const baseLat = Math.round((Number(lat) || 0) / grid) * grid;
  const baseLng = Math.round((Number(lng) || 0) / grid) * grid;
  const jitter = () => (Math.random() - 0.5) * grid * 0.6;
  return {
    lat: Math.round((baseLat + jitter()) * 1000) / 1000,
    lng: Math.round((baseLng + jitter()) * 1000) / 1000
  };
}

// Reverse geocode device coordinates to city + country display names.
// Uses bigdatacloud's free client-side reverse geocoding API.
export async function reverseGeocodeCity(lat, lng, lang = "ja") {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`
    );
    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision || "";
    const country = data.countryName || "";
    const countryCode = data.countryCode || "";
    return { city, country, countryCode };
  } catch {
    return { city: "", country: "", countryCode: "" };
  }
}

// Snap coordinates to a city-level grid (0.1° ≈ 11km) for privacy.
const LOC_GRID = 0.1;
export function snapToCityGrid(lat, lng) {
  return [
    Math.floor(lat / LOC_GRID) * LOC_GRID + LOC_GRID / 2,
    Math.floor(lng / LOC_GRID) * LOC_GRID + LOC_GRID / 2,
  ];
}

// Tokyo fallback
export const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 };

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