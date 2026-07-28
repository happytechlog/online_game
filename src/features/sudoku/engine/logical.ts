import {
  assertBoard,
  getBoxIndices,
  getCandidates,
  getColumnIndices,
  getConflictIndices,
  getRowIndices,
  isCompleteBoard,
} from "./board.ts";
import {
  BOARD_SIZE,
  DIGITS,
  type Board,
  type Digit,
  type LogicalSolveResult,
  type LogicalStep,
  type LogicalTechnique,
  type LogicalUnit,
} from "./types.ts";

interface UnitEntry {
  unit: LogicalUnit;
  indices: readonly number[];
}

const TECHNIQUE_RANK: Readonly<Record<LogicalTechnique, number>> = {
  "naked-single": 0,
  "hidden-single": 1,
};

function getUnits(): readonly UnitEntry[] {
  const units: UnitEntry[] = [];

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    units.push({
      unit: { kind: "row", index },
      indices: getRowIndices(index),
    });
  }
  for (let index = 0; index < BOARD_SIZE; index += 1) {
    units.push({
      unit: { kind: "column", index },
      indices: getColumnIndices(index),
    });
  }
  for (let index = 0; index < BOARD_SIZE; index += 1) {
    units.push({
      unit: { kind: "box", index },
      indices: getBoxIndices(index),
    });
  }

  return units;
}

const UNITS = getUnits();

function createPlacementStep(
  technique: LogicalTechnique,
  index: number,
  digit: Digit,
  relatedCells: readonly number[],
  unit: LogicalUnit | null,
): LogicalStep {
  return {
    technique,
    placements: [{ index, digit }],
    eliminations: [],
    highlights: [{ index, digits: [digit] }],
    relatedCells,
    unit,
  };
}

function findNakedSingle(board: Board): LogicalStep | null {
  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== null) continue;
    const candidates = getCandidates(board, index);

    if (candidates.length === 1) {
      return createPlacementStep(
        "naked-single",
        index,
        candidates[0],
        [index],
        null,
      );
    }
  }

  return null;
}

function findHiddenSingle(board: Board): LogicalStep | null {
  for (const { unit, indices } of UNITS) {
    for (const digit of DIGITS) {
      const possibleIndices = indices.filter(
        (index) =>
          board[index] === null && getCandidates(board, index).includes(digit),
      );

      if (possibleIndices.length === 1) {
        return createPlacementStep(
          "hidden-single",
          possibleIndices[0],
          digit,
          indices,
          unit,
        );
      }
    }
  }

  return null;
}

export function findNextLogicalStep(board: Board): LogicalStep | null {
  assertBoard(board);
  if (getConflictIndices(board).length > 0) return null;

  return findNakedSingle(board) ?? findHiddenSingle(board);
}

export function applyLogicalStep(
  board: Board,
  step: LogicalStep,
): Board {
  assertBoard(board);
  const next = [...board];

  for (const placement of step.placements) {
    if (
      next[placement.index] !== null ||
      !getCandidates(next, placement.index).includes(placement.digit)
    ) {
      throw new RangeError("Logical step contains an invalid placement.");
    }
    next[placement.index] = placement.digit;
  }

  return next;
}

function getHarderTechnique(
  current: LogicalTechnique | null,
  candidate: LogicalTechnique,
): LogicalTechnique {
  if (current === null) return candidate;
  return TECHNIQUE_RANK[candidate] > TECHNIQUE_RANK[current]
    ? candidate
    : current;
}

export function solveLogically(board: Board): LogicalSolveResult {
  assertBoard(board);
  const initial = [...board];
  if (getConflictIndices(initial).length > 0) {
    return {
      status: "invalid",
      board: initial,
      steps: [],
      hardestTechnique: null,
    };
  }

  let current: Board = initial;
  const steps: LogicalStep[] = [];
  let hardestTechnique: LogicalTechnique | null = null;

  while (!isCompleteBoard(current)) {
    const step = findNextLogicalStep(current);
    if (step === null) {
      return {
        status: "stuck",
        board: current,
        steps,
        hardestTechnique,
      };
    }

    current = applyLogicalStep(current, step);
    steps.push(step);
    hardestTechnique = getHarderTechnique(
      hardestTechnique,
      step.technique,
    );
  }

  return {
    status: "solved",
    board: current,
    steps,
    hardestTechnique,
  };
}
