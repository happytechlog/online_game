export const BOARD_SIZE = 9;
export const BOX_SIZE = 3;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type Digit = (typeof DIGITS)[number];
export type Cell = Digit | null;
export type Board = readonly Cell[];
export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type UnitKind = "row" | "column" | "box";
export type LogicalTechnique =
  | "naked-single"
  | "hidden-single"
  | "locked-candidates"
  | "candidate-pair"
  | "candidate-triple"
  | "x-wing";
export type LogicalPattern =
  | "pointing"
  | "claiming"
  | "naked"
  | "hidden"
  | "row-based"
  | "column-based";
export type CandidateGrid = readonly (readonly Digit[] | null)[];

export interface CellPosition {
  row: number;
  column: number;
  box: number;
}

export interface PuzzleDefinition {
  id: string;
  difficulty: Difficulty;
  puzzle: string;
  solution: string;
}

export type PuzzleValidationIssue =
  | "invalid-id"
  | "invalid-difficulty"
  | "invalid-puzzle"
  | "invalid-solution"
  | "solution-incomplete"
  | "solution-conflict"
  | "clue-mismatch"
  | "no-solution"
  | "multiple-solutions"
  | "solution-mismatch";

export interface PuzzleValidationResult {
  valid: boolean;
  issues: readonly PuzzleValidationIssue[];
  puzzle: Board | null;
  solution: Board | null;
}

export interface LogicalPlacement {
  index: number;
  digit: Digit;
}

export interface LogicalCandidateHighlight {
  index: number;
  digits: readonly Digit[];
}

export interface LogicalUnit {
  kind: UnitKind;
  index: number;
}

export interface LogicalStep {
  technique: LogicalTechnique;
  pattern?: LogicalPattern;
  placements: readonly LogicalPlacement[];
  eliminations: readonly LogicalCandidateHighlight[];
  highlights: readonly LogicalCandidateHighlight[];
  relatedCells: readonly number[];
  unit: LogicalUnit | null;
}

export type LogicalSolveStatus = "solved" | "stuck" | "invalid";

export interface LogicalState {
  board: Board;
  candidates: CandidateGrid;
}

export interface LogicalSolveResult {
  status: LogicalSolveStatus;
  board: Board;
  candidates: CandidateGrid;
  steps: readonly LogicalStep[];
  hardestTechnique: LogicalTechnique | null;
  difficulty: Difficulty | null;
}
