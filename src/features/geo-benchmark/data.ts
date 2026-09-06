export type Coordinates = Readonly<{ latitude: number; longitude: number }>;
export type Place = Readonly<{
  id: string;
  imagePath: string;
  difficulty: "easy" | "medium" | "hard";
  coordinates: Coordinates;
  country: Readonly<{ ko: string; en: string }>;
  city: Readonly<{ ko: string; en: string }>;
  sourceUrl: string;
  author: string;
  license: string;
  coordinateSource: string;
}>;
export type Dataset = Readonly<{ version: string; places: readonly Place[] }>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCoordinates(value: unknown): value is Coordinates {
  return record(value) &&
    typeof value.latitude === "number" && Number.isFinite(value.latitude) &&
    Math.abs(value.latitude) <= 90 &&
    typeof value.longitude === "number" && Number.isFinite(value.longitude) &&
    Math.abs(value.longitude) <= 180;
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function localized(value: unknown): boolean {
  return record(value) && text(value.ko) && text(value.en);
}

function source(value: unknown): boolean {
  if (!text(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// Validation establishes shape; image existence, license and camera coordinates
// still require evidence review before a dataset is released.
export function parseDataset(input: unknown): Dataset {
  if (!record(input) || !text(input.version) ||
      !Array.isArray(input.places) || input.places.length !== 5) {
    throw new Error("INVALID_DATASET");
  }
  const ids = new Set<string>();
  const counts = { easy: 0, medium: 0, hard: 0 };
  const places: Place[] = input.places.map((place: unknown) => {
    if (!record(place) || !text(place.id) || ids.has(place.id) ||
        !text(place.imagePath) ||
        !/^\/images\/geo-benchmark\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(place.imagePath) ||
        !isCoordinates(place.coordinates) ||
        !localized(place.country) || !localized(place.city) ||
        !source(place.sourceUrl) || !source(place.coordinateSource) ||
        !text(place.author) || !text(place.license) ||
        (place.difficulty !== "easy" && place.difficulty !== "medium" && place.difficulty !== "hard")) {
      throw new Error("INVALID_PLACE");
    }
    ids.add(place.id);
    counts[place.difficulty]++;
    // Clone so caller mutations cannot change the validated dataset.
    return structuredClone(place) as Place;
  });
  if (counts.easy !== 1 || counts.medium !== 3 || counts.hard !== 1) {
    throw new Error("INVALID_DIFFICULTY_MIX");
  }
  return { version: input.version, places };
}
