"use client";

import { useState } from "react";
import { useT } from "@/lib/LanguageContext";
import { type Lang } from "@/lib/i18n";

const LANG_OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "pa", label: "Punjabi", native: "پنجابی" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
];

export default function LanguageSelector() {
  const { t, lang, setLang } = useT();
  const [open, setOpen] = useState(false);

  const current = LANG_OPTIONS.find((o) => o.code === lang)!;

  return (
    <div className="rounded-card bg-white border border-line overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold">{t("profile_language")}</p>
          <p className="text-sm text-muted mt-0.5">
            {current.label}
            {current.native ? ` ${current.native}` : ""}
          </p>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expandable list */}
      {open && (
        <div className="border-t border-line px-4 pb-4 pt-3 space-y-2">
          {LANG_OPTIONS.map(({ code, label, native }) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                lang === code
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-line bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>
                {label}
                {native ? <span className="ml-2 font-normal">{native}</span> : null}
              </span>
              {lang === code && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
