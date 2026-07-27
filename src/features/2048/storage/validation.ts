import {
  CELL_COUNT,
  canMove,
  hasWinningTile,
  type Board,
  type Game2048State,
} from "../engine/index.ts";
import type { Best2048Score, Saved2048Game } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isScore(value: unknown): value is number {
  return (
    Number.isSafeInteger(value) &&
    Number(value) >= 0 &&
    Number(value) % 4 === 0
  );
}

function isTile(value: unknown): value is number | null {
  return (
    value === null ||
    (Number.isSafeInteger(value) &&
      Number(value) >= 2 &&
      Number.isInteger(Math.log2(Number(value))))
  );
}

export function is2048Board(value: unknown): value is Board {
  return (
    Array.isArray(value) &&
    value.length === CELL_COUNT &&
    value.every(isTile)
  );
}

export function is2048GameState(value: unknown): value is Game2048State {
  if (
    !isRecord(value) ||
    !is2048Board(value.board) ||
    !isScore(value.score) ||
    !["playing", "won", "game-over"].includes(String(value.status)) ||
    typeof value.hasWon !== "boolean"
  ) {
    return false;
  }

  const boardHasWinningTile = hasWinningTile(value.board);
  if (boardHasWinningTile !== value.hasWon) return false;
  if (value.status === "won") return value.hasWon;
  if (value.status === "game-over") return !canMove(value.board);
  return canMove(value.board);
}

export function isSaved2048Game(
  value: unknown,
): value is Saved2048Game {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.savedAt === "string" &&
    !Number.isNaN(Date.parse(value.savedAt)) &&
    is2048GameState(value.game)
  );
}

export function isBest2048Score(
  value: unknown,
): value is Best2048Score {
  return isRecord(value) && value.version === 1 && isScore(value.score);
}
