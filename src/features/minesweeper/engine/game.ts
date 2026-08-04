import type {
  CellMark,
  CreateMinesweeperGameOptions,
  Direction,
  MinesweeperCell,
  MinesweeperGameState,
  MinesweeperPreset,
  MinesweeperPresetConfig,
} from "./types.ts";

export const MINESWEEPER_PRESETS: Readonly<Record<MinesweeperPreset, MinesweeperPresetConfig>> = {
  beginner: { rows: 9, columns: 9, mineCount: 10 },
  intermediate: { rows: 16, columns: 16, mineCount: 40 },
  advanced: { rows: 16, columns: 30, mineCount: 99 },
};

function createCells(size: number): MinesweeperCell[] {
  return Array.from({ length: size }, () => ({
    mine: false,
    adjacent: 0,
    revealed: false,
    mark: "covered" as CellMark,
  }));
}

function isIndex(state: MinesweeperGameState, index: number) {
  return Number.isInteger(index) && index >= 0 && index < state.cells.length;
}

export function getCellIndex(row: number, column: number, columns: number) {
  return row * columns + column;
}

export function getCellPosition(state: MinesweeperGameState, index: number) {
  return {
    row: Math.floor(index / state.columns),
    column: index % state.columns,
  };
}

export function getAdjacentIndexes(state: MinesweeperGameState, index: number) {
  if (!isIndex(state, index)) return [];
  const { row, column } = getCellPosition(state, index);
  const indexes: number[] = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      if (
        nextRow >= 0 &&
        nextRow < state.rows &&
        nextColumn >= 0 &&
        nextColumn < state.columns
      ) {
        indexes.push(getCellIndex(nextRow, nextColumn, state.columns));
      }
    }
  }
  return indexes;
}

function withMineIndexes(
  state: MinesweeperGameState,
  mineIndexes: readonly number[],
): MinesweeperGameState {
  const mineSet = new Set(mineIndexes);
  const cells = state.cells.map((cell, index) => ({
    ...cell,
    mine: mineSet.has(index),
  }));
  const mineState = { ...state, cells };
  return {
    ...mineState,
    cells: cells.map((cell, index) => ({
      ...cell,
      adjacent: cell.mine
        ? 0
        : getAdjacentIndexes(mineState, index).filter(
            (neighbor) => cells[neighbor].mine,
          ).length,
    })),
  };
}

function validMineIndexes(state: MinesweeperGameState, indexes: readonly number[]) {
  return (
    indexes.length === state.mineCount &&
    new Set(indexes).size === indexes.length &&
    indexes.every((index) => isIndex(state, index))
  );
}

export function createMinesweeperGame(
  preset: MinesweeperPreset = "beginner",
  options: CreateMinesweeperGameOptions = {},
): MinesweeperGameState {
  const config = MINESWEEPER_PRESETS[preset];
  const state: MinesweeperGameState = {
    preset,
    ...config,
    cells: createCells(config.rows * config.columns),
    generated: false,
    phase: "ready",
    explodedIndex: null,
  };
  if (!options.mineIndexes) return state;
  if (!validMineIndexes(state, options.mineIndexes)) {
    throw new Error("Mine indexes do not match the selected preset.");
  }
  return { ...withMineIndexes(state, options.mineIndexes), generated: true };
}

export function generateMines(
  state: MinesweeperGameState,
  safeIndex: number,
  rng: () => number = Math.random,
): MinesweeperGameState {
  if (state.generated || !isIndex(state, safeIndex)) return state;
  const candidates = state.cells
    .map((_, index) => index)
    .filter((index) => index !== safeIndex);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const selected = Math.max(0, Math.min(index, Math.floor(rng() * (index + 1))));
    [candidates[index], candidates[selected]] = [candidates[selected], candidates[index]];
  }
  return {
    ...withMineIndexes(state, candidates.slice(0, state.mineCount)),
    generated: true,
  };
}

function revealSafeArea(state: MinesweeperGameState, startIndex: number) {
  const cells = state.cells.map((cell) => ({ ...cell }));
  const pending = [startIndex];
  const seen = new Set<number>();
  while (pending.length) {
    const index = pending.pop();
    if (index === undefined || seen.has(index)) continue;
    seen.add(index);
    const cell = cells[index];
    if (cell.revealed || cell.mark !== "covered" || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) {
      for (const neighbor of getAdjacentIndexes(state, index)) pending.push(neighbor);
    }
  }
  return cells;
}

function finalizeWin(state: MinesweeperGameState): MinesweeperGameState {
  const unrevealedSafe = state.cells.some((cell) => !cell.mine && !cell.revealed);
  if (unrevealedSafe) return state;
  return {
    ...state,
    phase: "won",
    cells: state.cells.map((cell) =>
      cell.mine ? { ...cell, mark: "flagged" } : cell,
    ),
  };
}

function loseAt(state: MinesweeperGameState, index: number): MinesweeperGameState {
  return { ...state, phase: "lost", explodedIndex: index };
}

export function revealCell(
  state: MinesweeperGameState,
  index: number,
  rng: () => number = Math.random,
): MinesweeperGameState {
  if (state.phase === "won" || state.phase === "lost" || !isIndex(state, index)) return state;
  if (state.cells[index].mark !== "covered" || state.cells[index].revealed) return state;
  const generated = generateMines(state, index, rng);
  const target = generated.cells[index];
  if (target.mine) return loseAt(generated, index);
  return finalizeWin({
    ...generated,
    phase: "playing",
    cells: revealSafeArea(generated, index),
  });
}

export function cycleCellMark(state: MinesweeperGameState, index: number): MinesweeperGameState {
  if (state.phase === "won" || state.phase === "lost" || !isIndex(state, index)) return state;
  const cell = state.cells[index];
  if (cell.revealed) return state;
  const mark: CellMark =
    cell.mark === "covered" ? "flagged" : cell.mark === "flagged" ? "questioned" : "covered";
  return {
    ...state,
    cells: state.cells.map((candidate, candidateIndex) =>
      candidateIndex === index ? { ...candidate, mark } : candidate,
    ),
  };
}

/** Keyboard helper: move between covered and questioned directly, preserving a flag when set. */
export function toggleQuestionMark(state: MinesweeperGameState, index: number): MinesweeperGameState {
  if (state.phase === "won" || state.phase === "lost" || !isIndex(state, index)) return state;
  const cell = state.cells[index];
  if (cell.revealed) return state;
  const mark: CellMark = cell.mark === "questioned" ? "covered" : "questioned";
  return {
    ...state,
    cells: state.cells.map((candidate, candidateIndex) =>
      candidateIndex === index ? { ...candidate, mark } : candidate,
    ),
  };
}

export function chordCell(state: MinesweeperGameState, index: number): MinesweeperGameState {
  if (state.phase === "won" || state.phase === "lost" || !isIndex(state, index)) return state;
  const target = state.cells[index];
  if (!target.revealed || target.adjacent === 0) return state;
  const neighbors = getAdjacentIndexes(state, index);
  if (neighbors.filter((neighbor) => state.cells[neighbor].mark === "flagged").length !== target.adjacent) {
    return state;
  }
  let next = state;
  for (const neighbor of neighbors) {
    if (next.cells[neighbor].mark === "covered" && !next.cells[neighbor].revealed) {
      if (next.cells[neighbor].mine) return loseAt(next, neighbor);
      next = { ...next, cells: revealSafeArea(next, neighbor) };
    }
  }
  return finalizeWin(next);
}

export function getFlagCount(state: MinesweeperGameState) {
  return state.cells.filter((cell) => cell.mark === "flagged").length;
}

export function getMineCounter(state: MinesweeperGameState) {
  return state.mineCount - getFlagCount(state);
}

export function moveCellFocus(state: MinesweeperGameState, index: number, direction: Direction) {
  if (!isIndex(state, index)) return 0;
  const { row, column } = getCellPosition(state, index);
  const nextRow = direction === "up" ? Math.max(0, row - 1) : direction === "down" ? Math.min(state.rows - 1, row + 1) : row;
  const nextColumn = direction === "left" ? Math.max(0, column - 1) : direction === "right" ? Math.min(state.columns - 1, column + 1) : column;
  return getCellIndex(nextRow, nextColumn, state.columns);
}
