import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function TermsPage() {
  const t = useT();
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">{t("terms.title")}</h1>
      </div>

      <div className="glass rounded-2xl border border-border p-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">{t("terms.serviceTitle")}</h2>
          <p>{t("terms.serviceBody")}</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">{t("terms.privacyTitle")}</h2>
          <p>{t("terms.privacyBody")}</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">{t("terms.locationTitle")}</h2>
          <p>{t("terms.locationBody")}</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">{t("terms.prohibitedTitle")}</h2>
          <p>{t("terms.prohibitedBody")}</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">{t("terms.contactTitle")}</h2>
          <p>{t("terms.contactBody")}</p>
        </section>
      </div>
    </div>
  );
}