import type { GameCatalogItem } from "../config/games.ts";
import {
  readStoredJson,
  writeStoredJson,
  type StorageLike,
} from "./safe-storage.ts";

export const RECENT_GAMES_STORAGE_KEY = "online-games:recent:v1";

type GameId = GameCatalogItem["id"];

export interface RecentGames {
  version: 1;
  gameIds: GameId[];
  updatedAt: string;
}

const GAME_IDS = new Set<GameId>([
  "othello",
  "2048",
  "sudoku",
  "minesweeper",
]);

export function isRecentGames(value: unknown): value is RecentGames {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<RecentGames>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.gameIds) &&
    candidate.gameIds.length <= 8 &&
    candidate.gameIds.every(
      (gameId) => typeof gameId === "string" && GAME_IDS.has(gameId as GameId),
    ) &&
    typeof candidate.updatedAt === "string" &&
    !Number.isNaN(Date.parse(candidate.updatedAt))
  );
}

export function loadRecentGames(storage: StorageLike): RecentGames | null {
  const value = readStoredJson(storage, RECENT_GAMES_STORAGE_KEY);
  return isRecentGames(value) ? value : null;
}

export function markGameAsRecent(
  storage: StorageLike,
  gameId: GameId,
  now = new Date(),
): boolean {
  const current = loadRecentGames(storage);
  const gameIds = [
    gameId,
    ...(current?.gameIds.filter((id) => id !== gameId) ?? []),
  ].slice(0, 8);

  return writeStoredJson(storage, RECENT_GAMES_STORAGE_KEY, {
    version: 1,
    gameIds,
    updatedAt: now.toISOString(),
  } satisfies RecentGames);
}
