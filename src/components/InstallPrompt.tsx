"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/LanguageContext";

type Platform = "android" | "ios" | "other";

function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function InstallPrompt() {
  const { t } = useT();
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem("install-dismissed")) return;

    const p = getPlatform();
    setPlatform(p);

    if (p === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler as EventListener);
      return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
    }

    if (p === "ios") {
      setShow(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem("install-dismissed", "1");
    setShow(false);
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
      setDeferredPrompt(null);
    }
  }

  if (!show) return null;

  return (
    <div className="mx-4 mb-3 rounded-[14px] bg-blue-600 text-white shadow-lg overflow-hidden">
      {platform === "ios" && showIOSSteps ? (
        <div className="px-4 py-3.5 space-y-2">
          <p className="text-[13px] font-bold">{t("install_ios_title")}</p>
          <ol className="text-[12.5px] space-y-1 list-decimal list-inside opacity-90">
            <li>{t("install_ios_step1")}</li>
            <li>{t("install_ios_step2")}</li>
            <li>{t("install_ios_step3")}</li>
          </ol>
          <button onClick={dismiss} className="mt-1 text-[12px] underline opacity-75">
            {t("install_dismiss")}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-[10px] bg-white/20 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3.6 15.2l1.5-3.9A2.5 2.5 0 0 1 7.4 9.6h7.2a2.5 2.5 0 0 1 2.3 1.6l1.5 3.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 15.2h16v2a1 1 0 0 1-1 1h-.3a1 1 0 0 1-1-1v-.2H5.3v.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
              <circle cx="7.3" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
              <circle cx="14.7" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold leading-tight">{t("install_title")}</p>
            <p className="text-[11.5px] opacity-75 leading-tight mt-0.5">{t("install_subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {platform === "android" ? (
              <button
                onClick={install}
                className="bg-white text-blue-600 text-[12.5px] font-bold px-3 py-1.5 rounded-full"
              >
                {t("install_btn")}
              </button>
            ) : platform === "ios" ? (
              <button
                onClick={() => setShowIOSSteps(true)}
                className="bg-white text-blue-600 text-[12.5px] font-bold px-3 py-1.5 rounded-full"
              >
                {t("install_how")}
              </button>
            ) : null}
            <button onClick={dismiss} className="opacity-60 p-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M6 18L18 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
