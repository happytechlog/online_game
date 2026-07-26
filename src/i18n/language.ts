import type { Language } from "./messages";

export const SETTINGS_STORAGE_KEY = "online-games:settings:v1";

export function getBrowserLanguage(language: string | undefined): Language {
  return language?.toLowerCase().startsWith("ko") ? "ko" : "en";
}

export function parseStoredLanguage(raw: string | null): Language | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "version" in value &&
      value.version === 1 &&
      "language" in value &&
      (value.language === "ko" || value.language === "en")
    ) {
      return value.language;
    }
  } catch {
    return null;
  }

  return null;
}
