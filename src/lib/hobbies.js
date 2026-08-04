export const HOBBY_CATEGORIES = [
  { key: "sports", items: ["筋トレ", "ランニング", "サッカー", "バスケ", "野球", "テニス", "水泳", "サイクリング", "ヨガ", "登山"] },
  { key: "games", items: ["FPS", "RPG", "対戦格闘", "ボードゲーム", "TRPG"] },
  { key: "music", items: ["ロック", "J-POP", "K-POP", "HIPHOP", "クラシック", "DJ", "楽器"] },
  { key: "anime", items: ["アニメ", "映画", "ドラマ", "漫画"] },
  { key: "travel", items: ["国内旅行", "海外旅行", "一人旅", "キャンプ"] },
  { key: "reading", items: ["小説", "ビジネス書", "雑誌"] },
  { key: "cafe", items: ["カフェ巡り", "コーヒー", "紅茶", "スイーツ"] },
  { key: "photo", items: ["風景", "ポートレート", "ストリート"] },
  { key: "cooking", items: ["和食", "洋食", "中華", "スイーツ作り"] },
  { key: "fashion", items: ["ストリート", "カジュアル", "ヴィンテージ"] },
  { key: "car", items: ["車", "バイク", "ドライブ"] },
  { key: "pet", items: ["犬", "猫", "魚", "爬虫類"] }
];

export const ALL_HOBBIES = [...new Set(HOBBY_CATEGORIES.flatMap((c) => c.items))];

export const TRAINING_PURPOSES = [
  { key: "hypertrophy" },
  { key: "diet" },
  { key: "health" },
  { key: "contest" },
  { key: "friends" }
];

export function parseHobbies(s) {
  try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; }
}