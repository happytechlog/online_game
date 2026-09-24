import {
  readStoredJson,
  writeStoredJson,
  type StorageLike,
} from "../../../storage/safe-storage.ts";
import type { TetrisBestScore } from "./types.ts";
import { isTetrisBestScore } from "./validation.ts";

export const TETRIS_BEST_SCORE_STORAGE_KEY =
  "online-games:tetris:best:v1";

export function loadBestTetrisScore(storage: StorageLike): number {
  const value = readStoredJson(storage, TETRIS_BEST_SCORE_STORAGE_KEY);
  return isTetrisBestScore(value) ? value.score : 0;
}

export function saveBestTetrisScore(
  storage: StorageLike,
  score: number,
): boolean {
  if (!Number.isSafeInteger(score) || score < 0) return false;

  const value: TetrisBestScore = {
    version: 1,
    score: Math.max(loadBestTetrisScore(storage), score),
  };

  return (
    isTetrisBestScore(value) &&
    writeStoredJson(storage, TETRIS_BEST_SCORE_STORAGE_KEY, value)
  );
}
