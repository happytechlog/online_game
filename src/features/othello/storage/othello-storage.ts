import {
  readStoredJson,
  removeStoredValue,
  writeStoredJson,
  type StorageLike,
} from "../../../storage/safe-storage.ts";
import type { OthelloGameState } from "../engine/types.ts";
import type {
  CompletedOthelloGame,
  OthelloStats,
  SavedOthelloGame,
} from "./types.ts";
import { isOthelloStats, isSavedOthelloGame } from "./validation.ts";

export const OTHELLO_SAVE_STORAGE_KEY = "online-games:othello:save:v1";
export const OTHELLO_STATS_STORAGE_KEY = "online-games:othello:stats:v1";

export const EMPTY_OTHELLO_STATS: OthelloStats = {
  version: 1,
  computer: { played: 0, wins: 0, losses: 0, draws: 0 },
  local: { played: 0, blackWins: 0, whiteWins: 0, draws: 0 },
};

export function createSavedOthelloGame(
  input: Omit<SavedOthelloGame, "version" | "savedAt">,
  now = new Date(),
): SavedOthelloGame {
  return {
    version: 1,
    savedAt: now.toISOString(),
    ...input,
    history: input.history.map((state) => ({
      ...state,
      board: [...state.board],
    })),
  };
}

export function loadOthelloGame(
  storage: StorageLike,
): SavedOthelloGame | null {
  const value = readStoredJson(storage, OTHELLO_SAVE_STORAGE_KEY);
  return isSavedOthelloGame(value) ? value : null;
}

export function saveOthelloGame(
  storage: StorageLike,
  save: SavedOthelloGame,
): boolean {
  if (!isSavedOthelloGame(save)) return false;
  return writeStoredJson(storage, OTHELLO_SAVE_STORAGE_KEY, save);
}

export function deleteOthelloGame(storage: StorageLike): boolean {
  return removeStoredValue(storage, OTHELLO_SAVE_STORAGE_KEY);
}

export function loadOthelloStats(storage: StorageLike): OthelloStats {
  const value = readStoredJson(storage, OTHELLO_STATS_STORAGE_KEY);
  return isOthelloStats(value) ? value : structuredClone(EMPTY_OTHELLO_STATS);
}

export function applyCompletedGameToStats(
  stats: OthelloStats,
  game: CompletedOthelloGame,
): OthelloStats {
  const next = structuredClone(stats);

  if (game.mode === "computer") {
    next.computer.played += 1;
    if (game.winner === "draw") next.computer.draws += 1;
    else if (game.winner === game.humanColor) next.computer.wins += 1;
    else next.computer.losses += 1;
  } else {
    next.local.played += 1;
    if (game.winner === "draw") next.local.draws += 1;
    else if (game.winner === "black") next.local.blackWins += 1;
    else if (game.winner === "white") next.local.whiteWins += 1;
  }

  return next;
}

export function recordCompletedOthelloGame(
  storage: StorageLike,
  state: Pick<OthelloGameState, "winner">,
  game: Omit<CompletedOthelloGame, "winner">,
): OthelloStats {
  const stats = applyCompletedGameToStats(loadOthelloStats(storage), {
    ...game,
    winner: state.winner,
  });
  writeStoredJson(storage, OTHELLO_STATS_STORAGE_KEY, stats);
  return stats;
}
