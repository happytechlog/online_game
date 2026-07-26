"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SETTINGS_STORAGE_KEY,
  getBrowserLanguage,
  parseStoredLanguage,
} from "@/src/i18n/language";
import {
  messages,
  type Language,
  type MessageKey,
} from "@/src/i18n/messages";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ko");

  useEffect(() => {
    const storedLanguage = (() => {
      try {
        return parseStoredLanguage(
          window.localStorage.getItem(SETTINGS_STORAGE_KEY),
        );
      } catch {
        return null;
      }
    })();

    const nextLanguage =
      storedLanguage ?? getBrowserLanguage(window.navigator.language);
    document.documentElement.lang = nextLanguage;

    const timer = window.setTimeout(() => {
      setLanguageState(nextLanguage);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    document.documentElement.lang = nextLanguage;

    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ version: 1, language: nextLanguage }),
      );
    } catch {
      // Language changes still work for the current session.
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: MessageKey) => messages[language][key],
    }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
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
