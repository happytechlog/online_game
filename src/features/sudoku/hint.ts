import {
  findNextLogicalStep,
  type Board,
  type Digit,
  type LogicalStep,
} from "./engine/index.ts";
import type { SudokuGameState } from "./game.ts";

export const SUDOKU_HINT_LIMIT = 3;

export interface SudokuHint {
  step: LogicalStep;
  cellIndices: readonly number[];
  candidates: readonly {
    index: number;
    digits: readonly Digit[];
  }[];
}

export interface SudokuHintResult {
  state: SudokuGameState;
  hint: SudokuHint | null;
}

export function createSudokuHint(board: Board): SudokuHint | null {
  const step = findNextLogicalStep(board);
  if (step === null) return null;

  const candidateMap = new Map<number, Set<Digit>>();
  for (const highlight of [...step.highlights, ...step.eliminations]) {
    const digits = candidateMap.get(highlight.index) ?? new Set<Digit>();
    for (const digit of highlight.digits) digits.add(digit);
    candidateMap.set(highlight.index, digits);
  }
  for (const placement of step.placements) {
    const digits = candidateMap.get(placement.index) ?? new Set<Digit>();
    digits.add(placement.digit);
    candidateMap.set(placement.index, digits);
  }

  const cellIndices = [
    ...new Set([
      ...step.relatedCells,
      ...step.placements.map((placement) => placement.index),
      ...step.highlights.map((highlight) => highlight.index),
      ...step.eliminations.map((elimination) => elimination.index),
    ]),
  ].sort((left, right) => left - right);

  return {
    step,
    cellIndices,
    candidates: [...candidateMap.entries()]
      .sort(([left], [right]) => left - right)
      .map(([index, digits]) => ({
        index,
        digits: [...digits].sort((left, right) => left - right),
      })),
  };
}

export function requestSudokuHint(
  state: SudokuGameState,
): SudokuHintResult {
  if (state.complete || state.hintsRemaining <= 0) {
    return { state, hint: null };
  }

  const hint = createSudokuHint(state.board);
  if (hint === null) return { state, hint: null };

  return {
    state: { ...state, hintsRemaining: state.hintsRemaining - 1 },
    hint,
  };
}
