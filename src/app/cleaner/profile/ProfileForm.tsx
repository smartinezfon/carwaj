"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Employee } from "@/lib/types";
import { useT } from "@/lib/LanguageContext";
import { LANG_NAMES, type Lang } from "@/lib/i18n";

const LANGS = Object.entries(LANG_NAMES) as [Lang, string][];

export default function ProfileForm({ employee }: { employee: Employee }) {
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useT();
  const [name, setName] = useState(employee.name);
  const [whatsappNumber, setWhatsappNumber] = useState(employee.whatsapp_number ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("employees")
      .update({ name, whatsapp_number: whatsappNumber || null })
      .eq("id", employee.id);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t("profile_title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white border border-line p-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {saved && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{t("profile_saved")}</p>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">{t("profile_name")}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-3 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("profile_phone")}</label>
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+971xxxxxxxxx"
            className="w-full rounded-lg border px-3 py-3 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white disabled:opacity-50 min-h-11"
        >
          {busy ? t("profile_saving") : t("profile_save")}
        </button>

        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="w-full rounded-lg bg-red-600 py-3 text-base font-semibold text-white min-h-11"
        >
          {t("profile_logout")}
        </button>
      </form>

      {/* Language selector */}
      <div className="rounded-card bg-white border border-line p-4">
        <h2 className="text-sm font-semibold mb-3">{t("profile_language")}</h2>
        <div className="space-y-2">
          {LANGS.map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                lang === code
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-line bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{label}</span>
              {lang === code && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
