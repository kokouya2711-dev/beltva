// 「目的」フィルターの多言語ラベル
// ボディメイクは各言語で音訳せず「体型・見た目を改善する」意味の自然な表現を使用
export const purposeFilterLabels = {
  ja: { health: "健康維持", bodymake: "ボディメイク", contest: "競技・大会", friends: "交流" },
  en: { health: "Health", bodymake: "Physique", contest: "Competition", friends: "Social" },
  fr: { health: "Santé", bodymake: "Esthétique", contest: "Compétition", friends: "Rencontres" },
  es: { health: "Salud", bodymake: "Físico", contest: "Competición", friends: "Social" },
  pt: { health: "Saúde", bodymake: "Estética", contest: "Competição", friends: "Social" },
  de: { health: "Gesundheit", bodymake: "Figur", contest: "Wettkampf", friends: "Austausch" },
  it: { health: "Salute", bodymake: "Fisico", contest: "Gara", friends: "Social" },
  ru: { health: "Здоровье", bodymake: "Фигура", contest: "Соревнования", friends: "Общение" },
  ar: { health: "صحة", bodymake: "نحت الجسم", contest: "مسابقات", friends: "تواصل" },
  tr: { health: "Sağlık", bodymake: "Fizik", contest: "Yarışma", friends: "Sosyal" },
  ko: { health: "건강 유지", bodymake: "체형 관리", contest: "대회 출전", friends: "교류" },
  zh: { health: "健康维持", bodymake: "塑形", contest: "竞技・比赛", friends: "交流" },
  "zh-TW": { health: "健康維持", bodymake: "塑形", contest: "競技・比賽", friends: "交流" },
  id: { health: "Kesehatan", bodymake: "Bentuk Tubuh", contest: "Kompetisi", friends: "Sosial" },
  th: { health: "สุขภาพ", bodymake: "สร้างสัดส่วน", contest: "การแข่งขัน", friends: "สังคม" },
  vi: { health: "Sức khỏe", bodymake: "Thể hình", contest: "Thi đấu", friends: "Giao lưu" }
};

export function purposeLabel(lang, key) {
  const tbl = purposeFilterLabels[lang] || purposeFilterLabels.ja;
  return tbl[key] || purposeFilterLabels.ja[key] || key;
}