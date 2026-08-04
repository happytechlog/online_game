import { MINESWEEPER_PRESETS } from "../engine/game.ts";
import type { MinesweeperGameState, MinesweeperPreset } from "../engine/types.ts";
import type { MinesweeperRecords, SavedMinesweeperGame } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isCell(value: unknown): value is Record<string, unknown> {
  return isRecord(value) &&
    typeof value.mine === "boolean" &&
    isInteger(value.adjacent) && value.adjacent >= 0 && value.adjacent <= 8 &&
    typeof value.revealed === "boolean" &&
    (value.mark === "covered" || value.mark === "flagged" || value.mark === "questioned");
}

function adjacentMineCount(cells: readonly Record<string, unknown>[], rows: number, columns: number, index: number) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  let count = 0;
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      if (nextRow >= 0 && nextRow < rows && nextColumn >= 0 && nextColumn < columns) {
        if (cells[nextRow * columns + nextColumn].mine === true) count += 1;
      }
    }
  }
  return count;
}

function isPreset(value: unknown): value is MinesweeperPreset {
  return value === "beginner" || value === "intermediate" || value === "advanced";
}

export function isMinesweeperGameState(value: unknown): value is MinesweeperGameState {
  if (!isRecord(value) || !isPreset(value.preset)) return false;
  const config = MINESWEEPER_PRESETS[value.preset];
  if (
    value.rows !== config.rows ||
    value.columns !== config.columns ||
    value.mineCount !== config.mineCount ||
    typeof value.generated !== "boolean" ||
    !["ready", "playing", "won", "lost"].includes(String(value.phase)) ||
    !Array.isArray(value.cells) ||
    value.cells.length !== config.rows * config.columns ||
    !(value.explodedIndex === null || (isInteger(value.explodedIndex) && value.explodedIndex >= 0 && value.explodedIndex < value.cells.length))
  ) return false;
  if (!value.cells.every(isCell)) return false;
  const cells = value.cells as Record<string, unknown>[];
  const mines = cells.filter((cell) => cell.mine === true).length;
  if (!value.generated) {
    return value.phase === "ready" && value.explodedIndex === null && mines === 0 &&
      cells.every((cell) => cell.adjacent === 0 && cell.revealed === false);
  }
  if (mines !== config.mineCount) return false;
  if (!cells.every((cell, index) => cell.mine ? cell.adjacent === 0 : cell.adjacent === adjacentMineCount(cells, config.rows, config.columns, index))) return false;
  const revealedMine = cells.some((cell) => cell.mine === true && cell.revealed === true);
  if (revealedMine || value.phase === "ready") return false;
  if (value.phase === "lost") {
    return isInteger(value.explodedIndex) && cells[value.explodedIndex].mine === true;
  }
  if (value.explodedIndex !== null) return false;
  if (value.phase === "won") {
    return cells.every((cell) => cell.mine ? cell.mark === "flagged" : cell.revealed === true);
  }
  return value.phase === "playing" && cells.some((cell) => cell.revealed === true);
}

export function isSavedMinesweeperGame(value: unknown): value is SavedMinesweeperGame {
  return isRecord(value) &&
    value.version === 1 &&
    typeof value.savedAt === "string" && !Number.isNaN(Date.parse(value.savedAt)) &&
    isInteger(value.elapsedSeconds) && value.elapsedSeconds >= 0 && value.elapsedSeconds <= 999999 &&
    isMinesweeperGameState(value.game) &&
    (value.game.phase === "ready" || value.game.phase === "playing");
}

function isRecordTime(value: unknown): value is number | null {
  return value === null || (isInteger(value) && value >= 0 && value <= 999999);
}

export function isMinesweeperRecords(value: unknown): value is MinesweeperRecords {
  return isRecord(value) && value.version === 1 && isRecord(value.times) &&
    isRecordTime(value.times.beginner) && isRecordTime(value.times.intermediate) && isRecordTime(value.times.advanced);
}
