import { useT, useI18n } from "@/lib/i18n";
import { HOBBY_LABELS, LANG_ORDER } from "@/lib/hobbies";

const CATEGORY_KEYS = {
  "相談": "post.cat_consult",
  "質問": "post.cat_question",
  "シェア": "post.cat_share",
  "報告": "post.cat_report"
};

const WORKOUT_KEYS = {
  "ベンチプレス": "workout.bench",
  "スクワット": "workout.squat",
  "デッドリフト": "workout.deadlift",
  "腕立て伏せ": "workout.pushup",
  "懸垂": "workout.pullup",
  "ランニング": "workout.running",
  "プランク": "workout.plank",
  "ダンベルカール": "workout.curl"
};

const BODY_PART_KEYS = {
  "胸": "body.chest",
  "背中": "body.back",
  "肩": "body.shoulders",
  "二頭筋": "body.biceps",
  "三頭筋": "body.triceps",
  "脚": "body.legs",
  "腹筋": "body.abs",
  "有酸素": "body.cardio",
  "ストレッチ": "body.stretch",
  "全身": "body.fullbody",
  "その他": "body.other"
};

const METRIC_KEYS = {
  volume: "workout.metric_volume",
  reps: "workout.metric_reps",
  duration: "workout.metric_duration"
};

const LOCALE_MAP = {
  ja: "ja-JP", en: "en-US", zh: "zh-CN", "zh-TW": "zh-TW", ko: "ko-KR", es: "es-ES",
  fr: "fr-FR", de: "de-DE", pt: "pt-BR", it: "it-IT", ru: "ru-RU",
  vi: "vi-VN", id: "id-ID", th: "th-TH", hi: "hi-IN", ar: "ar-SA", tr: "tr-TR"
};

// Fallback for hobby labels when a language has no direct translation
const HOBBY_FALLBACK = { tr: "en", "zh-TW": "zh" };

export function useTCategory() {
  const t = useT();
  return (cat) => t(CATEGORY_KEYS[cat] || `post.cat_${cat}`) || cat;
}

export function useTWorkout() {
  const t = useT();
  return (w) => {
    if (!w) return w;
    if (WORKOUT_KEYS[w]) return t(WORKOUT_KEYS[w]);
    if (BODY_PART_KEYS[w]) return t(BODY_PART_KEYS[w]);
    return t(w);
  };
}

export function useTBodyPart() {
  const t = useT();
  return (b) => {
    if (!b) return b;
    return t(BODY_PART_KEYS[b] || b);
  };
}

export function useTMetric() {
  const t = useT();
  return (m) => t(METRIC_KEYS[m] || m);
}

export function useTimeAgo() {
  const t = useT();
  return (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 0) return "";
    if (diff < 60) return t("time.secondsAgo").replace("{n}", diff);
    if (diff < 3600) return t("time.minutesAgo").replace("{n}", Math.floor(diff / 60));
    if (diff < 86400) return t("time.hoursAgo").replace("{n}", Math.floor(diff / 3600));
    return t("time.daysAgo").replace("{n}", Math.floor(diff / 86400));
  };
}

export function useFormatNumber() {
  const { lang } = useI18n();
  const locale = LOCALE_MAP[lang] || "en-US";
  return (n) => (Number(n) || 0).toLocaleString(locale);
}

export function useHobbyLabel() {
  const { lang } = useI18n();
  return (stored) => {
    if (!stored) return "";
    if (stored.startsWith("p:")) {
      const key = stored.slice(2);
      const labels = HOBBY_LABELS[key];
      if (!labels) return key;
      let idx = LANG_ORDER.indexOf(lang);
      if (idx < 0 && HOBBY_FALLBACK[lang]) idx = LANG_ORDER.indexOf(HOBBY_FALLBACK[lang]);
      return labels[idx >= 0 ? idx : 0] || labels[0];
    }
    if (stored.startsWith("c:")) return stored.slice(2);
    return stored; // backward compat: legacy bare string
  };
}

export { CATEGORY_KEYS, WORKOUT_KEYS, BODY_PART_KEYS, METRIC_KEYS, HOBBY_LABELS, LANG_ORDER };