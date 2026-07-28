import {
  BOARD_SIZE,
  BOX_SIZE,
  CELL_COUNT,
  DIGITS,
  type Board,
  type Cell,
  type CellPosition,
  type Digit,
} from "./types.ts";

function assertCellIndex(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) {
    throw new RangeError(`Cell index must be between 0 and ${CELL_COUNT - 1}.`);
  }
}

export function isDigit(value: unknown): value is Digit {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 9;
}

export function isBoard(value: unknown): value is Board {
  return (
    Array.isArray(value) &&
    value.length === CELL_COUNT &&
    value.every((cell) => cell === null || isDigit(cell))
  );
}

export function assertBoard(board: Board): void {
  if (!isBoard(board)) {
    throw new TypeError("A Sudoku board must contain exactly 81 valid cells.");
  }
}

export function getCellPosition(index: number): CellPosition {
  assertCellIndex(index);
  const row = Math.floor(index / BOARD_SIZE);
  const column = index % BOARD_SIZE;

  return {
    row,
    column,
    box:
      Math.floor(row / BOX_SIZE) * BOX_SIZE +
      Math.floor(column / BOX_SIZE),
  };
}

export function getRowIndices(row: number): readonly number[] {
  if (!Number.isInteger(row) || row < 0 || row >= BOARD_SIZE) {
    throw new RangeError("Row must be between 0 and 8.");
  }

  return Array.from(
    { length: BOARD_SIZE },
    (_, column) => row * BOARD_SIZE + column,
  );
}

export function getColumnIndices(column: number): readonly number[] {
  if (!Number.isInteger(column) || column < 0 || column >= BOARD_SIZE) {
    throw new RangeError("Column must be between 0 and 8.");
  }

  return Array.from(
    { length: BOARD_SIZE },
    (_, row) => row * BOARD_SIZE + column,
  );
}

export function getBoxIndices(box: number): readonly number[] {
  if (!Number.isInteger(box) || box < 0 || box >= BOARD_SIZE) {
    throw new RangeError("Box must be between 0 and 8.");
  }

  const firstRow = Math.floor(box / BOX_SIZE) * BOX_SIZE;
  const firstColumn = (box % BOX_SIZE) * BOX_SIZE;
  const indices: number[] = [];

  for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < BOX_SIZE; columnOffset += 1) {
      indices.push(
        (firstRow + rowOffset) * BOARD_SIZE + firstColumn + columnOffset,
      );
    }
  }

  return indices;
}

export function getPeerIndices(index: number): readonly number[] {
  const { row, column, box } = getCellPosition(index);

  return [
    ...new Set([
      ...getRowIndices(row),
      ...getColumnIndices(column),
      ...getBoxIndices(box),
    ]),
  ]
    .filter((peerIndex) => peerIndex !== index)
    .sort((left, right) => left - right);
}

function findUnitConflicts(board: Board, indices: readonly number[]): number[] {
  const digitIndices = new Map<Digit, number[]>();

  for (const index of indices) {
    const cell = board[index];
    if (cell === null) continue;

    const matches = digitIndices.get(cell) ?? [];
    matches.push(index);
    digitIndices.set(cell, matches);
  }

  return [...digitIndices.values()]
    .filter((matches) => matches.length > 1)
    .flat();
}

export function getConflictIndices(board: Board): readonly number[] {
  assertBoard(board);
  const conflicts = new Set<number>();

  for (let unit = 0; unit < BOARD_SIZE; unit += 1) {
    for (const index of findUnitConflicts(board, getRowIndices(unit))) {
      conflicts.add(index);
    }
    for (const index of findUnitConflicts(board, getColumnIndices(unit))) {
      conflicts.add(index);
    }
    for (const index of findUnitConflicts(board, getBoxIndices(unit))) {
      conflicts.add(index);
    }
  }

  return [...conflicts].sort((left, right) => left - right);
}

export function getCandidates(board: Board, index: number): readonly Digit[] {
  assertBoard(board);
  assertCellIndex(index);
  if (board[index] !== null) return [];

  const unavailable = new Set<Cell>(
    getPeerIndices(index).map((peerIndex) => board[peerIndex]),
  );
  return DIGITS.filter((digit) => !unavailable.has(digit));
}

export function isCompleteBoard(board: Board): boolean {
  assertBoard(board);
  return (
    board.every((cell) => cell !== null) &&
    getConflictIndices(board).length === 0
  );
}

export function matchesSolution(board: Board, solution: Board): boolean {
  assertBoard(board);
  assertBoard(solution);
  return isCompleteBoard(solution) && board.every(
    (cell, index) => cell === solution[index],
  );
}

export function parseBoard(value: string): Board | null {
  if (value.length !== CELL_COUNT || !/^[0-9.]+$/.test(value)) return null;

  return [...value].map((character) => {
    if (character === "." || character === "0") return null;
    return Number(character) as Digit;
  });
}

export function serializeBoard(board: Board): string {
  assertBoard(board);
  return board.map((cell) => cell ?? ".").join("");
}
