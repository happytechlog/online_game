import { isCoordinates, type Coordinates } from "./data.ts";

export const SCORING_VERSION = "haversine-exp-2000-v1";
export const EARTH_RADIUS_KM = 6371.0088;

export function distanceKm(actual: Coordinates, guess: Coordinates): number {
  if (!isCoordinates(actual) || !isCoordinates(guess)) {
    throw new Error("INVALID_COORDINATES");
  }
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const deltaLatitude = radians(guess.latitude - actual.latitude);
  const deltaLongitude = radians(guess.longitude - actual.longitude);
  const a = Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(radians(actual.latitude)) * Math.cos(radians(guess.latitude)) *
    Math.sin(deltaLongitude / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
}

export function scoreDistance(km: number): number {
  if (!Number.isFinite(km) || km < 0) throw new Error("INVALID_DISTANCE");
  return Math.max(0, Math.min(5000, Math.round(5000 * Math.exp(-km / 2000))));
}
