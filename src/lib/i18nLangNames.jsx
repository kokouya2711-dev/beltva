// 言語選択画面用：各言語の「言語名」「国名」をユーザー言語で表示するための辞書。
// keys = ユーザーの現在の言語コード。各値は { langCode: 表示名 } の辞書。

export const LANG_CODES = [
  "ja", "en", "fr", "es", "pt", "de", "it", "ru",
  "ar", "tr", "ko", "zh", "zh-TW", "id", "th", "vi",
];

// 各言語での「言語名」表記
export const LANG_NAME_BY_LANG = {
  ja: { ja: "日本語", en: "英語", fr: "フランス語", es: "スペイン語", pt: "ポルトガル語", de: "ドイツ語", it: "イタリア語", ru: "ロシア語", ar: "アラビア語", tr: "トルコ語", ko: "韓国語", zh: "中国語（簡体）", "zh-TW": "中国語（繁体）", id: "インドネシア語", th: "タイ語", vi: "ベトナム語" },
  en: { ja: "Japanese", en: "English", fr: "French", es: "Spanish", pt: "Portuguese", de: "German", it: "Italian", ru: "Russian", ar: "Arabic", tr: "Turkish", ko: "Korean", zh: "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)", id: "Indonesian", th: "Thai", vi: "Vietnamese" },
  fr: { ja: "Japonais", en: "Anglais", fr: "Français", es: "Espagnol", pt: "Portugais", de: "Allemand", it: "Italien", ru: "Russe", ar: "Arabe", tr: "Turc", ko: "Coréen", zh: "Chinois (simplifié)", "zh-TW": "Chinois (traditionnel)", id: "Indonésien", th: "Thaï", vi: "Vietnamien" },
  es: { ja: "Japonés", en: "Inglés", fr: "Francés", es: "Español", pt: "Portugués", de: "Alemán", it: "Italiano", ru: "Ruso", ar: "Árabe", tr: "Turco", ko: "Coreano", zh: "Chino (simplificado)", "zh-TW": "Chino (tradicional)", id: "Indonesio", th: "Tailandés", vi: "Vietnamita" },
  pt: { ja: "Japonês", en: "Inglês", fr: "Francês", es: "Espanhol", pt: "Português", de: "Alemão", it: "Italiano", ru: "Russo", ar: "Árabe", tr: "Turco", ko: "Coreano", zh: "Chinês (simplificado)", "zh-TW": "Chinês (tradicional)", id: "Indonésio", th: "Tailandês", vi: "Vietnamita" },
  de: { ja: "Japanisch", en: "Englisch", fr: "Französisch", es: "Spanisch", pt: "Portugiesisch", de: "Deutsch", it: "Italienisch", ru: "Russisch", ar: "Arabisch", tr: "Türkisch", ko: "Koreanisch", zh: "Chinesisch (vereinfacht)", "zh-TW": "Chinesisch (traditionell)", id: "Indonesisch", th: "Thailändisch", vi: "Vietnamesisch" },
  it: { ja: "Giapponese", en: "Inglese", fr: "Francese", es: "Spagnolo", pt: "Portoghese", de: "Tedesco", it: "Italiano", ru: "Russo", ar: "Arabo", tr: "Turco", ko: "Coreano", zh: "Cinese (semplificato)", "zh-TW": "Cinese (tradizionale)", id: "Indonesiano", th: "Tailandese", vi: "Vietnamita" },
  ru: { ja: "Японский", en: "Английский", fr: "Французский", es: "Испанский", pt: "Португальский", de: "Немецкий", it: "Итальянский", ru: "Русский", ar: "Арабский", tr: "Турецкий", ko: "Корейский", zh: "Китайский (упрощенный)", "zh-TW": "Китайский (традиционный)", id: "Индонезийский", th: "Тайский", vi: "Вьетнамский" },
  ar: { ja: "اليابانية", en: "الإنجليزية", fr: "الفرنسية", es: "الإسبانية", pt: "البرتغالية", de: "الألمانية", it: "الإيطالية", ru: "الروسية", ar: "العربية", tr: "التركية", ko: "الكورية", zh: "الصينية (مبسطة)", "zh-TW": "الصينية (تقليدية)", id: "الإندونيسية", th: "التايلاندية", vi: "الفيتنامية" },
  tr: { ja: "Japonca", en: "İngilizce", fr: "Fransızca", es: "İspanyolca", pt: "Portekizce", de: "Almanca", it: "İtalyanca", ru: "Rusça", ar: "Arapça", tr: "Türkçe", ko: "Korece", zh: "Çince (Basitleştirilmiş)", "zh-TW": "Çince (Geleneksel)", id: "Endonezce", th: "Tayca", vi: "Vietnamca" },
  ko: { ja: "일본어", en: "영어", fr: "프랑스어", es: "스페인어", pt: "포르투갈어", de: "독일어", it: "이탈리아어", ru: "러시아어", ar: "아랍어", tr: "터키어", ko: "한국어", zh: "중국어(간체)", "zh-TW": "중국어(번체)", id: "인도네시아어", th: "태국어", vi: "베트남어" },
  zh: { ja: "日语", en: "英语", fr: "法语", es: "西班牙语", pt: "葡萄牙语", de: "德语", it: "意大利语", ru: "俄语", ar: "阿拉伯语", tr: "土耳其语", ko: "韩语", zh: "中文（简体）", "zh-TW": "中文（繁体）", id: "印尼语", th: "泰语", vi: "越南语" },
  "zh-TW": { ja: "日語", en: "英語", fr: "法語", es: "西班牙語", pt: "葡萄牙語", de: "德語", it: "義大利語", ru: "俄語", ar: "阿拉伯語", tr: "土耳其語", ko: "韓語", zh: "中文（簡體）", "zh-TW": "中文（繁體）", id: "印尼語", th: "泰語", vi: "越南語" },
  id: { ja: "Jepang", en: "Inggris", fr: "Prancis", es: "Spanyol", pt: "Portugis", de: "Jerman", it: "Italia", ru: "Rusia", ar: "Arab", tr: "Turki", ko: "Korea", zh: "Tionghoa (Sederhana)", "zh-TW": "Tionghoa (Tradisional)", id: "Indonesia", th: "Thai", vi: "Vietnam" },
  th: { ja: "ญี่ปุ่น", en: "อังกฤษ", fr: "ฝรั่งเศส", es: "สเปน", pt: "โปรตุเกส", de: "เยอรมัน", it: "อิตาลี", ru: "รัสเซีย", ar: "อาหรับ", tr: "ตุรกี", ko: "เกาหลี", zh: "จีน (ตัวย่อ)", "zh-TW": "จีน (ตัวเต็ม)", id: "อินโดนีเซีย", th: "ไทย", vi: "เวียดนาม" },
  vi: { ja: "Tiếng Nhật", en: "Tiếng Anh", fr: "Tiếng Pháp", es: "Tiếng Tây Ban Nha", pt: "Tiếng Bồ Đào Nha", de: "Tiếng Đức", it: "Tiếng Ý", ru: "Tiếng Nga", ar: "Tiếng Ả Rập", tr: "Tiếng Thổ Nhĩ Kỳ", ko: "Tiếng Hàn", zh: "Tiếng Trung (Giản thể)", "zh-TW": "Tiếng Trung (Phồn thể)", id: "Tiếng Indonesia", th: "Tiếng Thái", vi: "Tiếng Việt" },
};

// 各言語での「国名」表記
export const COUNTRY_NAME_BY_LANG = {
  ja: { ja: "日本", en: "イギリス", fr: "フランス", es: "スペイン", pt: "ポルトガル", de: "ドイツ", it: "イタリア", ru: "ロシア", ar: "サウジアラビア", tr: "トルコ", ko: "韓国", zh: "中国", "zh-TW": "台湾", id: "インドネシア", th: "タイ", vi: "ベトナム" },
  en: { ja: "Japan", en: "United Kingdom", fr: "France", es: "Spain", pt: "Portugal", de: "Germany", it: "Italy", ru: "Russia", ar: "Saudi Arabia", tr: "Turkey", ko: "South Korea", zh: "China", "zh-TW": "Taiwan", id: "Indonesia", th: "Thailand", vi: "Vietnam" },
  fr: { ja: "Japon", en: "Royaume-Uni", fr: "France", es: "Espagne", pt: "Portugal", de: "Allemagne", it: "Italie", ru: "Russie", ar: "Arabie saoudite", tr: "Turquie", ko: "Corée du Sud", zh: "Chine", "zh-TW": "Taïwan", id: "Indonésie", th: "Thaïlande", vi: "Vietnam" },
  es: { ja: "Japón", en: "Reino Unido", fr: "Francia", es: "España", pt: "Portugal", de: "Alemania", it: "Italia", ru: "Rusia", ar: "Arabia Saudí", tr: "Turquía", ko: "Corea del Sur", zh: "China", "zh-TW": "Taiwán", id: "Indonesia", th: "Tailandia", vi: "Vietnam" },
  pt: { ja: "Japão", en: "Reino Unido", fr: "França", es: "Espanha", pt: "Portugal", de: "Alemanha", it: "Itália", ru: "Rússia", ar: "Arábia Saudita", tr: "Turquia", ko: "Coreia do Sul", zh: "China", "zh-TW": "Taiwan", id: "Indonésia", th: "Tailândia", vi: "Vietnã" },
  de: { ja: "Japan", en: "Vereinigtes Königreich", fr: "Frankreich", es: "Spanien", pt: "Portugal", de: "Deutschland", it: "Italien", ru: "Russland", ar: "Saudi-Arabien", tr: "Türkei", ko: "Südkorea", zh: "China", "zh-TW": "Taiwan", id: "Indonesien", th: "Thailand", vi: "Vietnam" },
  it: { ja: "Giappone", en: "Regno Unito", fr: "Francia", es: "Spagna", pt: "Portogallo", de: "Germania", it: "Italia", ru: "Russia", ar: "Arabia Saudita", tr: "Turchia", ko: "Corea del Sud", zh: "Cina", "zh-TW": "Taiwan", id: "Indonesia", th: "Thailandia", vi: "Vietnam" },
  ru: { ja: "Япония", en: "Великобритания", fr: "Франция", es: "Испания", pt: "Португалия", de: "Германия", it: "Италия", ru: "Россия", ar: "Саудовская Аравия", tr: "Турция", ko: "Южная Корея", zh: "Китай", "zh-TW": "Тайвань", id: "Индонезия", th: "Таиланд", vi: "Вьетнам" },
  ar: { ja: "اليابان", en: "المملكة المتحدة", fr: "فرنسا", es: "إسبانيا", pt: "البرتغال", de: "ألمانيا", it: "إيطاليا", ru: "روسيا", ar: "السعودية", tr: "تركيا", ko: "كوريا الجنوبية", zh: "الصين", "zh-TW": "تايوان", id: "إندونيسيا", th: "تايلاند", vi: "فيتنام" },
  tr: { ja: "Japonya", en: "Birleşik Krallık", fr: "Fransa", es: "İspanya", pt: "Portekiz", de: "Almanya", it: "İtalya", ru: "Rusya", ar: "Suudi Arabistan", tr: "Türkiye", ko: "Güney Kore", zh: "Çin", "zh-TW": "Tayvan", id: "Endonezya", th: "Tayland", vi: "Vietnam" },
  ko: { ja: "일본", en: "영국", fr: "프랑스", es: "스페인", pt: "포르투갈", de: "독일", it: "이탈리아", ru: "러시아", ar: "사우디아라비아", tr: "튀르키예", ko: "대한민국", zh: "중국", "zh-TW": "대만", id: "인도네시아", th: "태국", vi: "베트남" },
  zh: { ja: "日本", en: "英国", fr: "法国", es: "西班牙", pt: "葡萄牙", de: "德国", it: "意大利", ru: "俄罗斯", ar: "沙特阿拉伯", tr: "土耳其", ko: "韩国", zh: "中国", "zh-TW": "台湾", id: "印度尼西亚", th: "泰国", vi: "越南" },
  "zh-TW": { ja: "日本", en: "英國", fr: "法國", es: "西班牙", pt: "葡萄牙", de: "德國", it: "義大利", ru: "俄羅斯", ar: "沙烏地阿拉伯", tr: "土耳其", ko: "韓國", zh: "中國", "zh-TW": "臺灣", id: "印尼", th: "泰國", vi: "越南" },
  id: { ja: "Jepang", en: "Britania Raya", fr: "Prancis", es: "Spanyol", pt: "Portugal", de: "Jerman", it: "Italia", ru: "Rusia", ar: "Arab Saudi", tr: "Turki", ko: "Korea Selatan", zh: "Tiongkok", "zh-TW": "Taiwan", id: "Indonesia", th: "Thailand", vi: "Vietnam" },
  th: { ja: "ญี่ปุ่น", en: "สหราชอาณาจักร", fr: "ฝรั่งเศส", es: "สเปน", pt: "โปรตุเกส", de: "เยอรมนี", it: "อิตาลี", ru: "รัสเซีย", ar: "ซาอุดีอาระเบีย", tr: "ตุรกี", ko: "เกาหลีใต้", zh: "จีน", "zh-TW": "ไต้หวัน", id: "อินโดนีเซีย", th: "ไทย", vi: "เวียดนาม" },
  vi: { ja: "Nhật Bản", en: "Vương quốc Anh", fr: "Pháp", es: "Tây Ban Nha", pt: "Bồ Đào Nha", de: "Đức", it: "Ý", ru: "Nga", ar: "Ả Rập Xê Út", tr: "Thổ Nhĩ Kỳ", ko: "Hàn Quốc", zh: "Trung Quốc", "zh-TW": "Đài Loan", id: "Indonesia", th: "Thái Lan", vi: "Việt Nam" },
};