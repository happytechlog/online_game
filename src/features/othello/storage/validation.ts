import { CELL_COUNT } from "../engine/types.ts";
import type {
  Board,
  OthelloGameState,
  Player,
  Winner,
} from "../engine/types.ts";
import type {
  LocalResultStats,
  OthelloStats,
  ResultStats,
  SavedOthelloGame,
} from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isPlayer(value: unknown): value is Player {
  return value === "black" || value === "white";
}

function isWinner(value: unknown): value is Winner {
  return value === null || value === "black" || value === "white" || value === "draw";
}

export function isBoard(value: unknown): value is Board {
  return (
    Array.isArray(value) &&
    value.length === CELL_COUNT &&
    value.every((cell) => cell === null || isPlayer(cell))
  );
}

export function isOthelloGameState(
  value: unknown,
): value is OthelloGameState {
  if (!isRecord(value)) return false;
  if (
    !isBoard(value.board) ||
    !isPlayer(value.currentPlayer) ||
    !["playing", "finished", "resigned"].includes(String(value.status)) ||
    !isWinner(value.winner) ||
    !(
      value.lastMove === null ||
      (Number.isInteger(value.lastMove) &&
        Number(value.lastMove) >= 0 &&
        Number(value.lastMove) < CELL_COUNT)
    ) ||
    !Number.isInteger(value.moveNumber) ||
    Number(value.moveNumber) < 0 ||
    Number(value.moveNumber) > 60
  ) {
    return false;
  }

  if (value.status === "playing") return value.winner === null;
  if (value.status === "finished") return value.winner !== null;
  return value.winner === "black" || value.winner === "white";
}

export function isSavedOthelloGame(
  value: unknown,
): value is SavedOthelloGame {
  if (!isRecord(value)) return false;
  return (
    value.version === 1 &&
    typeof value.savedAt === "string" &&
    !Number.isNaN(Date.parse(value.savedAt)) &&
    typeof value.sessionId === "string" &&
    value.sessionId.length >= 8 &&
    value.sessionId.length <= 100 &&
    (value.mode === "local" || value.mode === "computer") &&
    ["beginner", "intermediate", "advanced"].includes(
      String(value.difficulty),
    ) &&
    isPlayer(value.humanColor) &&
    Array.isArray(value.history) &&
    value.history.length >= 1 &&
    value.history.length <= 64 &&
    value.history.every(isOthelloGameState)
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isResultStats(value: unknown): value is ResultStats {
  if (!isRecord(value)) return false;
  return (
    isNonNegativeInteger(value.played) &&
    isNonNegativeInteger(value.wins) &&
    isNonNegativeInteger(value.losses) &&
    isNonNegativeInteger(value.draws) &&
    value.played === value.wins + value.losses + value.draws
  );
}

function isLocalResultStats(value: unknown): value is LocalResultStats {
  if (!isRecord(value)) return false;
  return (
    isNonNegativeInteger(value.played) &&
    isNonNegativeInteger(value.blackWins) &&
    isNonNegativeInteger(value.whiteWins) &&
    isNonNegativeInteger(value.draws) &&
    value.played === value.blackWins + value.whiteWins + value.draws
  );
}

export function isOthelloStats(value: unknown): value is OthelloStats {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isResultStats(value.computer) &&
    isLocalResultStats(value.local)
  );
}
