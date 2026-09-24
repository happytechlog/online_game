import type { TetrisBestScore } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isTetrisBestScore(value: unknown): value is TetrisBestScore {
  return (
    isRecord(value) &&
    Object.keys(value).length === 2 &&
    Object.hasOwn(value, "version") &&
    value.version === 1 &&
    Object.hasOwn(value, "score") &&
    typeof value.score === "number" &&
    Number.isSafeInteger(value.score) &&
    value.score >= 0
  );
}
