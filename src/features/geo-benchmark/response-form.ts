import { isCoordinates } from "./data.ts";
import type { Response } from "./session.ts";

export type ResponseDraft = {
  latitude: string; longitude: string; country: string; city: string;
  countryUnknown: boolean; cityUnknown: boolean; confidence: string; reasoning: string;
};
export function parseResponseDraft(draft: ResponseDraft): Response | null {
  if (!draft.latitude.trim() || !draft.longitude.trim() || !draft.confidence.trim()) return null;
  const coordinates = { latitude: Number(draft.latitude), longitude: Number(draft.longitude) };
  const confidence = Number(draft.confidence);
  const country = draft.countryUnknown ? null : draft.country.trim();
  const city = draft.cityUnknown ? null : draft.city.trim();
  if (!isCoordinates(coordinates) || !Number.isFinite(confidence) || confidence < 0 || confidence > 100 ||
      country === "" || city === "" || !draft.reasoning.trim()) return null;
  return { coordinates, country, city, confidence, reasoning: draft.reasoning.trim() };
}
