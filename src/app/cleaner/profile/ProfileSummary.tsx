"use client";

import { useT } from "@/lib/LanguageContext";

interface CommunitySummary {
  id: string;
  name: string;
  villaCount: number;
  carCount: number;
  monthlyRevenue: number;
}

export default function ProfileSummary({ communities }: { communities: CommunitySummary[] }) {
  const { t } = useT();

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 mb-2">{t("profile_customers_title")}</h2>
      {communities.length === 0 && (
        <p className="text-center text-gray-400 py-6">{t("profile_no_community")}</p>
      )}
      <div className="space-y-2">
        {communities.map((c) => (
          <div key={c.id} className="rounded-card bg-white border border-line p-4">
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {c.villaCount} {t("word_villas")} · {c.carCount} {t("word_cars")}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              AED {c.monthlyRevenue.toLocaleString()}/mo
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
