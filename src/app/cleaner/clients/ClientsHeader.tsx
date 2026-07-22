"use client";

import Link from "next/link";
import { useT } from "@/lib/LanguageContext";

export default function ClientsHeader({ isEmpty }: { isEmpty: boolean }) {
  const { t } = useT();
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("clients_title")}</h1>
        <Link
          href="/cleaner/clients/new"
          data-guide="new_client_btn"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {t("clients_new_btn")}
        </Link>
      </div>
      {isEmpty && (
        <p className="text-center text-gray-500 py-10">{t("clients_empty")}</p>
      )}
    </>
  );
}
