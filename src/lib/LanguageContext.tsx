"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translate, type Lang, type TKey, RTL_LANGS } from "./i18n";

const LS_KEY = "carwaj_lang";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (key) => key as string,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as Lang | null;
    if (stored) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem(LS_KEY, l);
  }

  const isRTL = RTL_LANGS.has(lang);
  const t = (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars);

  return <Ctx.Provider value={{ lang, setLang, t, isRTL }}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);
