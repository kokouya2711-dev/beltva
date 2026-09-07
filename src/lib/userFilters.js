// 仲間画面のフィルター定義・ヘルパー

export const PURPOSES = [
  { key: "health", label: "健康維持", match: ["health"] },
  { key: "appearance", label: "見た目改善", match: ["hypertrophy", "diet"] },
  { key: "contest", label: "競技・大会", match: ["contest"] },
  { key: "friends", label: "交流", match: ["friends"] },
];

export const LEVELS = [
  { key: "beginner", label: "初級者" },
  { key: "intermediate", label: "中級者" },
  { key: "advanced", label: "上級者" },
];

export const LEVEL_KEYS = ["beginner", "intermediate", "advanced"];

// トレ歴レベルを年数から判定（1年未満/1-3年未満/3年以上）
export function levelKeyForYears(y) {
  if (y == null) return null;
  if (y < 1) return "beginner";
  if (y < 3) return "intermediate";
  return "advanced";
}

// training_history 文字列から年数を解析
export function parseTrainingYears(s) {
  if (!s) return null;
  const str = String(s).trim();
  if (/半年/.test(str)) return 0.5;
  const m = str.match(/(\d+(?:\.\d+)?)\s*年/);
  if (m) return parseFloat(m[1]);
  const n = str.match(/^(\d+(?:\.\d+)?)$/);
  if (n) return parseFloat(n[1]);
  return null;
}

// 検索用の正規化（小文字化 + 全角半角統一）
export function normalizeAscii(s) {
  if (!s) return "";
  return String(s).toLowerCase().normalize("NFKC").trim();
}

// ユーザーID（ハンドル）= メールの @ 前部分
export function handleOf(u) {
  return u?.email ? u.email.split("@")[0] : "";
}