"use client";

import { useState, useEffect, useCallback } from "react";
import { useT } from "@/lib/LanguageContext";

const STORAGE_KEY = "carwaj_guide_done";

const STEP_KEYS = [
  { target: "today",    titleKey: "guide_step1_title", bodyKey: "guide_step1_body", arrow: "down" },
  { target: "calendar", titleKey: "guide_step2_title", bodyKey: "guide_step2_body", arrow: "down" },
  { target: "clients",  titleKey: "guide_step3_title", bodyKey: "guide_step3_body", arrow: "down" },
  { target: "payments", titleKey: "guide_step4_title", bodyKey: "guide_step4_body", arrow: "down" },
  { target: "profile",  titleKey: "guide_step5_title", bodyKey: "guide_step5_body", arrow: "up"   },
] as const;

export default function WalkthroughOverlay() {
  const { t } = useT();
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const start = useCallback(() => setStep(0), []);

  const finish = useCallback(() => {
    setStep(-1);
    localStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new Event("carwaj:guideDone"));
  }, []);

  const next = useCallback(() => {
    setStep((s) => {
      const n = s + 1;
      if (n >= STEP_KEYS.length) {
        localStorage.setItem(STORAGE_KEY, "1");
        window.dispatchEvent(new Event("carwaj:guideDone"));
        return -1;
      }
      return n;
    });
  }, []);

  // Triggered by FirstRunFlow (new user) or Profile "Show again" button
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem(STORAGE_KEY);
      start();
    };
    window.addEventListener("carwaj:startGuide", handler);
    return () => window.removeEventListener("carwaj:startGuide", handler);
  }, [start]);

  // Measure target element position
  useEffect(() => {
    if (step < 0) { setRect(null); return; }
    const el = document.querySelector(`[data-guide="${STEP_KEYS[step].target}"]`);
    if (el) setRect(el.getBoundingClientRect());
  }, [step]);

  if (step < 0 || !rect) return null;

  const current = STEP_KEYS[step];
  const PAD = 10;
  const spotTop = rect.top - PAD;
  const spotLeft = rect.left - PAD;
  const spotW = rect.width + PAD * 2;
  const spotH = rect.height + PAD * 2;

  const TOOLTIP_W = 280;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const centerX = rect.left + rect.width / 2;
  const tooltipLeft = Math.min(Math.max(centerX - TOOLTIP_W / 2, 12), vw - TOOLTIP_W - 12);
  const arrowOffset = Math.min(Math.max(centerX - tooltipLeft - 8, 16), TOOLTIP_W - 32);
  const arrowDown = current.arrow === "down";

  return (
    <>
      {/* Full-screen interaction blocker */}
      <div className="fixed inset-0 z-[59]" />

      {/* Dark backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: "rgba(0,0,0,0.6)", pointerEvents: "none" }}
      />

      {/* Spotlight hole via box-shadow */}
      <div
        className="fixed z-[61] rounded-2xl"
        style={{
          top: spotTop,
          left: spotLeft,
          width: spotW,
          height: spotH,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}
      />

      {/* Tooltip card */}
      <div
        className="fixed z-[62] bg-white rounded-2xl shadow-2xl p-4"
        style={{
          width: TOOLTIP_W,
          left: tooltipLeft,
          ...(arrowDown
            ? { bottom: vh - spotTop + 12 }
            : { top: spotTop + spotH + 12 }),
        }}
      >
        {/* Progress pills */}
        <div className="flex items-center gap-1.5 mb-3">
          {STEP_KEYS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6,
                background: i === step ? "#2563eb" : "#e2e8f0",
              }}
            />
          ))}
          <span className="ml-auto text-[11px] text-gray-400 font-medium tabular-nums">
            {step + 1} / {STEP_KEYS.length}
          </span>
        </div>

        <h3 className="text-[15px] font-bold mb-1 text-gray-900">{t(current.titleKey)}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">{t(current.bodyKey)}</p>

        <div className="flex gap-2">
          <button
            onClick={finish}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-400 min-h-11"
          >
            {t("guide_skip")}
          </button>
          <button
            onClick={next}
            className="flex-[2] rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white min-h-11"
          >
            {step === STEP_KEYS.length - 1 ? `${t("guide_done")} ✓` : `${t("guide_next")} →`}
          </button>
        </div>

        {/* Caret arrow pointing at the highlighted element */}
        <div
          className="absolute w-0 h-0"
          style={{
            left: arrowOffset,
            ...(arrowDown
              ? {
                  bottom: -8,
                  borderTop: "8px solid white",
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                }
              : {
                  top: -8,
                  borderBottom: "8px solid white",
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                }),
          }}
        />
      </div>
    </>
  );
}
