"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { uz } from "@/locales/uz";
import { ru } from "@/locales/ru";

type Language = "UZ" | "RU";
type Translations = typeof uz;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("UZ");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved === "UZ" || saved === "RU") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: keyof Translations, params?: Record<string, string>) => {
    const dict = language === "UZ" ? uz : ru;
    let text = dict[key] || key;
    
    if (params) {
      Object.keys(params).forEach(p => {
        text = text.replace(`{${p}}`, params[p]);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
