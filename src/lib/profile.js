import { base44 } from "@/api/base44Client";

export function displayName(user) {
  if (!user) return "匿名";
  return user.display_name || user.full_name || (user.email && user.email.split("@")[0]) || "匿名";
}

export function flagEmoji(code) {
  if (!code || code.length !== 2) return "";
  const cc = code.toUpperCase();
  return String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)));
}

export const COUNTRIES = [
  { code: "JP", name: "日本" }, { code: "US", name: "アメリカ" }, { code: "KR", name: "韓国" },
  { code: "CN", name: "中国" }, { code: "TW", name: "台湾" }, { code: "HK", name: "香港" },
  { code: "GB", name: "イギリス" }, { code: "FR", name: "フランス" }, { code: "DE", name: "ドイツ" },
  { code: "IT", name: "イタリア" }, { code: "ES", name: "スペイン" }, { code: "AU", name: "オーストラリア" },
  { code: "CA", name: "カナダ" }, { code: "IN", name: "インド" }, { code: "TH", name: "タイ" },
  { code: "VN", name: "ベトナム" }, { code: "SG", name: "シンガポール" }, { code: "MY", name: "マレーシア" },
  { code: "ID", name: "インドネシア" }, { code: "PH", name: "フィリピン" }, { code: "BR", name: "ブラジル" },
  { code: "MX", name: "メキシコ" }, { code: "AR", name: "アルゼンチン" }, { code: "RU", name: "ロシア" },
  { code: "NL", name: "オランダ" }, { code: "SE", name: "スウェーデン" }, { code: "NO", name: "ノルウェー" },
  { code: "FI", name: "フィンランド" }, { code: "DK", name: "デンマーク" }, { code: "CH", name: "スイス" },
  { code: "AT", name: "オーストリア" }, { code: "BE", name: "ベルギー" }, { code: "PT", name: "ポルトガル" },
  { code: "GR", name: "ギリシャ" }, { code: "TR", name: "トルコ" }, { code: "SA", name: "サウジアラビア" },
  { code: "AE", name: "UAE" }, { code: "EG", name: "エジプト" }, { code: "ZA", name: "南アフリカ" },
  { code: "NZ", name: "ニュージーランド" }
];

const BODYWEIGHT_TYPES = ["腕立て伏せ", "懸垂", "プランク"];

export function computePRs(records) {
  const byType = {};
  records.forEach((r) => {
    if (!r.workout_type) return;
    if (!byType[r.workout_type]) byType[r.workout_type] = [];
    byType[r.workout_type].push(r);
  });
  const prs = [];
  Object.keys(byType).forEach((t) => {
    const recs = byType[t];
    const hasWeight = recs.some((r) => Number(r.weight) > 0);
    let value, unit;
    if (hasWeight) {
      value = Math.max(...recs.map((r) => Number(r.weight) || 0));
      unit = "kg";
    } else if (t === "プランク") {
      value = Math.max(...recs.map((r) => Number(r.duration_sec) || 0));
      unit = "秒";
    } else {
      value = Math.max(...recs.map((r) => Number(r.reps) || 0));
      unit = "回";
    }
    prs.push({ workout_type: t, value, unit });
  });
  return prs.sort((a, b) => b.value - a.value);
}

export function computeStreak(records) {
  if (!records.length) return 0;
  const days = new Set();
  records.forEach((r) => {
    if (!r.created_date) return;
    const d = new Date(r.created_date);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });
  const ts = [...days].map((s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m, d).getTime();
  }).sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  let cursor;
  if (ts[0] === todayTs) cursor = todayTs;
  else if (ts[0] === todayTs - 86400000) cursor = todayTs - 86400000;
  else return 0;
  let streak = 0;
  for (const t of ts) {
    if (t === cursor) { streak++; cursor -= 86400000; }
    else if (t < cursor) break;
  }
  return streak;
}

export function computeStats(records) {
  return {
    sessions: records.length,
    totalSeconds: records.reduce((s, r) => s + (Number(r.duration_sec) || 0), 0),
    streak: computeStreak(records),
    prs: computePRs(records)
  };
}

export function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}時間${m}分`;
  if (m > 0) return `${m}分`;
  return `${sec}秒`;
}

export async function fetchUser(id) {
  try {
    return await base44.entities.User.get(id);
  } catch {
    try {
      const recs = await base44.entities.WorkoutRecord.filter({ created_by_id: id }, "-created_date", 1);
      if (recs[0]?.created_by) return recs[0].created_by;
    } catch {}
    try {
      const ps = await base44.entities.Post.filter({ created_by_id: id }, "-created_date", 1);
      if (ps[0]?.created_by) return ps[0].created_by;
    } catch {}
    return null;
  }
}