import React, { useState, useMemo } from "react";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";
import { useT, useI18n, LANGS } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/useScrollLock";
import { purposeLabel } from "@/lib/i18nPurposeFilter";
import { editStepUrl } from "@/lib/onboardingNav";
import LegalSheet from "@/components/auth/LegalSheet";

// 登録内容確認ステップ
// プログレスバーなし(最終ステップのため)
export default function ConfirmStep({ me, returnTo, onBack, onComplete, saving }) {
  const t = useT();
  const { lang } = useI18n();
  useScrollLock();
  const [agreed, setAgreed] = useState(false);
  const [sheet, setSheet] = useState(null); // null | "terms" | "privacy"

  const locale = lang === "zh-TW" ? "zh-TW" : lang;

  const birthdateText = useMemo(() => {
    if (!me?.birthdate) return "";
    try {
      return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(me.birthdate));
    } catch {
      return me.birthdate;
    }
  }, [me?.birthdate, locale]);

  const languageText = useMemo(() => {
    if (!me?.main_language) return "";
    try {
      const dn = new Intl.DisplayNames([locale], { type: "language" });
      return dn.of(me.main_language) || me.main_language;
    } catch {
      return me.main_language;
    }
  }, [me?.main_language, locale]);

  const genderText = me?.gender === "male" ? t("common.genderMale")
    : me?.gender === "female" ? t("common.genderFemale")
    : "";

  const levelText = me?.level === "beginner" ? t("auth.levelBeginner")
    : me?.level === "intermediate" ? t("auth.levelIntermediate")
    : me?.level === "advanced" ? t("auth.levelAdvanced")
    : "";

  const rows = [
    { label: t("auth.confirmUsername"), value: me?.display_name || "", step: "username" },
    { label: t("auth.confirmUserId"), value: me?.username ? "@" + me.username : "", step: "userid" },
    { label: t("auth.confirmBirthdate"), value: birthdateText, step: "birthdate" },
    { label: t("auth.confirmGender"), value: genderText, step: "gender" },
    { label: t("auth.confirmCountry"), value: me?.country_name || "", step: "country", flag: me?.country },
    { label: t("auth.confirmLanguage"), value: languageText, step: "language" },
    { label: t("auth.confirmPurpose"), value: me?.training_purpose ? purposeLabel(lang, me.training_purpose) : "", step: "purpose" },
    { label: t("auth.confirmLevel"), value: levelText, step: "level" },
  ];

  return (
    <div className="relative h-[100dvh] flex flex-col bg-background overflow-hidden">
      <header className="flex items-center px-4 pt-[env(safe-area-inset-top)] shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-foreground" aria-label={t("auth.back")}>
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 min-h-0 px-6 pt-6 overflow-y-auto overscroll-contain">
        <h2 className="text-center text-xl font-bold text-foreground mb-6">{t("auth.confirmTitle")}</h2>

        <div className="flex flex-col gap-2.5">
          {rows.map((r) => (
            <div key={r.step} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <span className="block text-xs text-muted-foreground mb-0.5">{r.label}</span>
                <span className="flex items-center gap-2 text-base font-semibold text-foreground truncate">
                  {r.flag && (
                    <img
                      src={`https://flagcdn.com/w40/${r.flag.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w80/${r.flag.toLowerCase()}.png 2x`}
                      alt=""
                      className="w-5 h-3.5 rounded-[3px] object-cover shrink-0"
                      loading="lazy"
                    />
                  )}
                  <span className="truncate">{r.value || "—"}</span>
                </span>
              </div>
              <a
                href={editStepUrl(r.step, returnTo)}
                className="flex items-center gap-0.5 text-sm font-bold text-primary shrink-0"
              >
                {t("auth.change")}
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-6 text-sm">
          <button onClick={() => setSheet("terms")} className="text-primary underline">{t("auth.terms")}</button>
          <span className="text-muted-foreground">・</span>
          <button onClick={() => setSheet("privacy")} className="text-primary underline">{t("auth.privacyPolicy")}</button>
        </div>

        <label className="flex items-center justify-center gap-2.5 mt-4 mb-2 cursor-pointer select-none py-2.5">
          <span
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${agreed ? "border-primary bg-primary" : "border-muted-foreground/40"}`}
          >
            {agreed && <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />}
          </span>
          <span className="text-sm text-foreground">{t("auth.agreeTerms")}</span>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
        </label>
      </div>

      <div className="shrink-0 px-6 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => agreed && !saving && onComplete()}
          disabled={!agreed || saving}
          className={`w-full h-12 rounded-full font-bold transition-colors ${agreed && !saving ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          {t("auth.completeRegistration")}
        </button>
      </div>

      {sheet && <LegalSheet type={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}