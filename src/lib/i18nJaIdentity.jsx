// Identity map for ja: prevents t() from falling through to translations.en
// for exercise names. Without this, Japanese exercise keys like "インクラインベンチプレス"
// resolve to the English "Incline Bench Press" via the en fallback in t().

import { EXERCISES_BY_BODY_PART } from "@/lib/exercises";

const jaIdentity = {};
Object.values(EXERCISES_BY_BODY_PART).forEach(list => {
  list.forEach(name => { jaIdentity[name] = name; });
});

export const jaExerciseIdentity = { ja: jaIdentity };