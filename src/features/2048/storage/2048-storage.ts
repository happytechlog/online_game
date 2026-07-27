import {
  readStoredJson,
  removeStoredValue,
  writeStoredJson,
  type StorageLike,
} from "../../../storage/safe-storage.ts";
import type { Game2048State } from "../engine/index.ts";
import type { Best2048Score, Saved2048Game } from "./types.ts";
import {
  is2048GameState,
  isBest2048Score,
  isSaved2048Game,
} from "./validation.ts";

export const GAME_2048_SAVE_STORAGE_KEY = "online-games:2048:save:v1";
export const GAME_2048_BEST_STORAGE_KEY = "online-games:2048:best:v1";

export function createSaved2048Game(
  game: Game2048State,
  now = new Date(),
): Saved2048Game {
  return {
    version: 1,
    savedAt: now.toISOString(),
    game: { ...game, board: [...game.board] },
  };
}

export function load2048Game(
  storage: StorageLike,
): Saved2048Game | null {
  const value = readStoredJson(storage, GAME_2048_SAVE_STORAGE_KEY);
  return isSaved2048Game(value) ? value : null;
}

export function save2048Game(
  storage: StorageLike,
  game: Game2048State,
  now = new Date(),
): boolean {
  if (!is2048GameState(game)) return false;
  return writeStoredJson(
    storage,
    GAME_2048_SAVE_STORAGE_KEY,
    createSaved2048Game(game, now),
  );
}

export function delete2048Game(storage: StorageLike): boolean {
  return removeStoredValue(storage, GAME_2048_SAVE_STORAGE_KEY);
}

export function loadBest2048Score(storage: StorageLike): number {
  const value = readStoredJson(storage, GAME_2048_BEST_STORAGE_KEY);
  return isBest2048Score(value) ? value.score : 0;
}

export function saveBest2048Score(
  storage: StorageLike,
  score: number,
): boolean {
  const bestScore = Math.max(loadBest2048Score(storage), score);
  const value: Best2048Score = { version: 1, score: bestScore };
  if (!isBest2048Score(value)) return false;
  return writeStoredJson(storage, GAME_2048_BEST_STORAGE_KEY, value);
}
