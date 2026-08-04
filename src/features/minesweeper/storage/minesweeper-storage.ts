import { readStoredJson, removeStoredValue, writeStoredJson, type StorageLike } from "../../../storage/safe-storage.ts";
import type { MinesweeperPreset } from "../engine/types.ts";
import { isMinesweeperRecords, isSavedMinesweeperGame } from "./validation.ts";
import type { MinesweeperRecords, SavedMinesweeperGame } from "./types.ts";

export const MINESWEEPER_SAVE_STORAGE_KEY = "online-games:minesweeper:save:v1";
export const MINESWEEPER_RECORDS_STORAGE_KEY = "online-games:minesweeper:records:v1";

export function createEmptyMinesweeperRecords(): MinesweeperRecords {
  return { version: 1, times: { beginner: null, intermediate: null, advanced: null } };
}

export function createSavedMinesweeperGame(game: SavedMinesweeperGame["game"], elapsedSeconds: number, now = new Date()): SavedMinesweeperGame {
  return { version: 1, savedAt: now.toISOString(), elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)), game };
}

export function loadMinesweeperGame(storage: StorageLike): SavedMinesweeperGame | null {
  const value = readStoredJson(storage, MINESWEEPER_SAVE_STORAGE_KEY);
  return isSavedMinesweeperGame(value) ? value : null;
}

export function saveMinesweeperGame(storage: StorageLike, save: SavedMinesweeperGame): boolean {
  return isSavedMinesweeperGame(save) && writeStoredJson(storage, MINESWEEPER_SAVE_STORAGE_KEY, save);
}

export function deleteMinesweeperGame(storage: StorageLike): boolean {
  return removeStoredValue(storage, MINESWEEPER_SAVE_STORAGE_KEY);
}

export function loadMinesweeperRecords(storage: StorageLike): MinesweeperRecords {
  const value = readStoredJson(storage, MINESWEEPER_RECORDS_STORAGE_KEY);
  return isMinesweeperRecords(value) ? value : createEmptyMinesweeperRecords();
}

export function updateMinesweeperRecord(records: MinesweeperRecords, preset: MinesweeperPreset, elapsedSeconds: number) {
  const current = records.times[preset];
  const nextTime = Math.max(0, Math.floor(elapsedSeconds));
  const isNewBest = current === null || nextTime < current;
  return {
    records: {
      version: 1 as const,
      times: { ...records.times, [preset]: isNewBest ? nextTime : current },
    },
    isNewBest,
  };
}

export function saveMinesweeperRecords(storage: StorageLike, records: MinesweeperRecords): boolean {
  return isMinesweeperRecords(records) && writeStoredJson(storage, MINESWEEPER_RECORDS_STORAGE_KEY, records);
}
