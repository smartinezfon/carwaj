"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useT } from "@/lib/LanguageContext";
import type { Lang } from "@/lib/i18n";

const LANG_OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English",  native: "" },
  { code: "hi", label: "Hindi",    native: "हिन्दी" },
  { code: "bn", label: "Bengali",  native: "বাংলা" },
  { code: "ur", label: "Urdu",     native: "اردو" },
  { code: "pa", label: "Punjabi",  native: "پنجابی" },
];

type Phase = "lang" | "install" | null;
type Platform = "android" | "ios" | "other";

function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

function isInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function FirstRunFlow() {
  const { t, setLang } = useT();
  const [phase, setPhase] = useState<Phase>(null);
  const [selectedLang, setSelectedLang] = useState<Lang>("en");
  const [platform, setPlatform] = useState<Platform>("other");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const guideTriggered = useRef(false);

  // Capture Android install prompt as early as possible
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  // Listen for guide completion → show install step
  useEffect(() => {
    const onGuideDone = () => {
      if (
        !localStorage.getItem("carwaj_install_shown") &&
        !isInstalled() &&
        getPlatform() !== "other"
      ) {
        localStorage.setItem("carwaj_install_shown", "1");
        setPhase("install");
      }
    };
    window.addEventListener("carwaj:guideDone", onGuideDone);
    return () => window.removeEventListener("carwaj:guideDone", onGuideDone);
  }, []);

  // Determine starting phase on mount
  useEffect(() => {
    setPlatform(getPlatform());
    const hasLang = !!localStorage.getItem("carwaj_lang");
    const hasGuide = !!localStorage.getItem("carwaj_guide_done");

    if (!hasLang) {
      setPhase("lang");
      return;
    }

    // User has lang but guide not done (e.g. refreshed mid-onboarding)
    if (!hasGuide && !guideTriggered.current) {
      guideTriggered.current = true;
      setTimeout(() => window.dispatchEvent(new Event("carwaj:startGuide")), 800);
    }
  }, []);

  const confirmLang = useCallback(() => {
    setLang(selectedLang);
    setPhase(null);
    // Small delay so language context re-renders before guide starts
    setTimeout(() => window.dispatchEvent(new Event("carwaj:startGuide")), 400);
  }, [selectedLang, setLang]);

  const skipInstall = useCallback(() => {
    localStorage.setItem("carwaj_install_shown", "1");
    setPhase(null);
  }, []);

  const doInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setPhase(null);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // ── Language picker ──────────────────────────────────────────────────
  if (phase === "lang") {
    return (
      <div className="fixed inset-0 z-[70] bg-canvas flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center overflow-y-auto py-8">
          {/* Logo */}
          <div className="h-16 w-16 rounded-[22px] bg-blue-600 flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(37,99,235,.5)] mb-6 shrink-0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3.6 15.2l1.5-3.9A2.5 2.5 0 0 1 7.4 9.6h7.2a2.5 2.5 0 0 1 2.3 1.6l1.5 3.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 15.2h16v2a1 1 0 0 1-1 1h-.3a1 1 0 0 1-1-1v-.2H5.3v.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
              <circle cx="7.3" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
              <circle cx="14.7" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
              <path d="M19.4 4.2C19.6 5.9 20.1 6.4 21.8 6.6C20.1 6.8 19.6 7.3 19.4 9C19.2 7.3 18.7 6.8 17 6.6C18.7 6.4 19.2 5.9 19.4 4.2Z" fill="#fff"/>
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold mb-1">Welcome to Carwaj</h1>
          <p className="text-sm text-gray-500 mb-8">
            Choose your language · अपनी भाषा चुनें
          </p>

          {/* Language options */}
          <div className="w-full max-w-sm space-y-2">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setSelectedLang(opt.code)}
                className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                  selectedLang === opt.code
                    ? "border-blue-600 bg-blue-50"
                    : "border-transparent bg-white"
                }`}
              >
                <span className="text-[15px] font-semibold text-gray-900">
                  {opt.label}
                  {opt.native && (
                    <span className="ml-2 text-gray-400 font-normal">{opt.native}</span>
                  )}
                </span>
                {selectedLang === opt.code && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <circle cx="12" cy="12" r="9" fill="#2563eb"/>
                    <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Continue */}
        <div className="px-6 pb-[max(env(safe-area-inset-bottom),24px)] shrink-0">
          <button
            onClick={confirmLang}
            className="w-full rounded-xl bg-blue-600 py-4 text-base font-bold text-white min-h-[54px]"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── Install bottom sheet ─────────────────────────────────────────────
  if (phase === "install") {
    const isIOS = platform === "ios";
    const isAndroid = platform === "android";

    return (
      <div className="fixed inset-0 z-[70] flex flex-col justify-end">
        <div className="absolute inset-0 bg-black/50" onClick={skipInstall} />
        <div className="relative bg-white rounded-t-3xl px-6 pt-5 pb-[max(env(safe-area-inset-bottom),28px)]">
          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

          {/* Icon + heading */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-[16px] bg-blue-600 flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3.6 15.2l1.5-3.9A2.5 2.5 0 0 1 7.4 9.6h7.2a2.5 2.5 0 0 1 2.3 1.6l1.5 3.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 15.2h16v2a1 1 0 0 1-1 1h-.3a1 1 0 0 1-1-1v-.2H5.3v.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
                <circle cx="7.3" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
                <circle cx="14.7" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">{t("install_title")}</h2>
              <p className="text-sm text-gray-500">{t("install_subtitle")}</p>
            </div>
          </div>

          {isIOS && (
            <ol className="mb-5 space-y-3">
              {([t("install_ios_step1"), t("install_ios_step2"), t("install_ios_step3")] as string[]).map(
                (step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-600 leading-snug">{step}</span>
                  </li>
                )
              )}
            </ol>
          )}

          <div className="space-y-2.5">
            {isAndroid && (
              <button
                onClick={doInstall}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white min-h-[52px]"
              >
                {t("install_btn")}
              </button>
            )}
            <button
              onClick={skipInstall}
              className="w-full rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-500 min-h-[52px]"
            >
              {t("install_dismiss")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
