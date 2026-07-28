import {
  assertBoard,
  getBoxIndices,
  getCandidates,
  getCellPosition,
  getColumnIndices,
  getConflictIndices,
  getPeerIndices,
  getRowIndices,
  isCompleteBoard,
} from "./board.ts";
import {
  BOARD_SIZE,
  DIGITS,
  type Board,
  type Difficulty,
  type Digit,
  type LogicalCandidateHighlight,
  type LogicalSolveResult,
  type LogicalState,
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
  "locked-candidates": 2,
  "candidate-pair": 3,
  "candidate-triple": 4,
  "x-wing": 5,
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

function uniqueSorted(indices: readonly number[]): readonly number[] {
  return [...new Set(indices)].sort((left, right) => left - right);
}

function createEliminations(
  indices: readonly number[],
  digits: readonly Digit[],
): readonly LogicalCandidateHighlight[] {
  return uniqueSorted(indices).map((index) => ({ index, digits }));
}

function getState(value: Board | LogicalState): LogicalState {
  return Array.isArray(value)
    ? createLogicalState(value)
    : value as LogicalState;
}

export function createLogicalState(board: Board): LogicalState {
  assertBoard(board);

  return {
    board: [...board],
    candidates: board.map((cell, index) =>
      cell === null ? [...getCandidates(board, index)] : null,
    ),
  };
}

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

function findNakedSingle(state: LogicalState): LogicalStep | null {
  for (let index = 0; index < state.board.length; index += 1) {
    const candidates = state.candidates[index];
    if (candidates?.length === 1) {
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

function findHiddenSingle(state: LogicalState): LogicalStep | null {
  for (const { unit, indices } of UNITS) {
    for (const digit of DIGITS) {
      const possibleIndices = indices.filter((index) =>
        state.candidates[index]?.includes(digit),
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

function createLockedCandidateStep(
  state: LogicalState,
  sourceIndices: readonly number[],
  targetIndices: readonly number[],
  digit: Digit,
  unit: LogicalUnit,
  pattern: "pointing" | "claiming",
): LogicalStep | null {
  const targets = targetIndices.filter((index) =>
    state.candidates[index]?.includes(digit),
  );
  if (targets.length === 0) return null;

  return {
    technique: "locked-candidates",
    pattern,
    placements: [],
    eliminations: createEliminations(targets, [digit]),
    highlights: createEliminations(sourceIndices, [digit]),
    relatedCells: uniqueSorted([...sourceIndices, ...targets]),
    unit,
  };
}

function findPointingLockedCandidates(
  state: LogicalState,
): LogicalStep | null {
  for (let box = 0; box < BOARD_SIZE; box += 1) {
    const boxIndices = getBoxIndices(box);

    for (const digit of DIGITS) {
      const sources = boxIndices.filter((index) =>
        state.candidates[index]?.includes(digit),
      );
      if (sources.length < 2) continue;

      const positions = sources.map(getCellPosition);
      const row = positions[0].row;
      if (positions.every((position) => position.row === row)) {
        const step = createLockedCandidateStep(
          state,
          sources,
          getRowIndices(row).filter((index) => !boxIndices.includes(index)),
          digit,
          { kind: "box", index: box },
          "pointing",
        );
        if (step !== null) return step;
      }

      const column = positions[0].column;
      if (positions.every((position) => position.column === column)) {
        const step = createLockedCandidateStep(
          state,
          sources,
          getColumnIndices(column).filter(
            (index) => !boxIndices.includes(index),
          ),
          digit,
          { kind: "box", index: box },
          "pointing",
        );
        if (step !== null) return step;
      }
    }
  }

  return null;
}

function findClaimingLockedCandidates(
  state: LogicalState,
): LogicalStep | null {
  const lineUnits = UNITS.filter(({ unit }) => unit.kind !== "box");

  for (const { unit, indices } of lineUnits) {
    for (const digit of DIGITS) {
      const sources = indices.filter((index) =>
        state.candidates[index]?.includes(digit),
      );
      if (sources.length < 2) continue;

      const box = getCellPosition(sources[0]).box;
      if (!sources.every((index) => getCellPosition(index).box === box)) {
        continue;
      }

      const step = createLockedCandidateStep(
        state,
        sources,
        getBoxIndices(box).filter((index) => !indices.includes(index)),
        digit,
        unit,
        "claiming",
      );
      if (step !== null) return step;
    }
  }

  return null;
}

function findLockedCandidates(state: LogicalState): LogicalStep | null {
  return (
    findPointingLockedCandidates(state) ??
    findClaimingLockedCandidates(state)
  );
}

function createPairStep(
  unit: LogicalUnit,
  pairIndices: readonly number[],
  pairDigits: readonly Digit[],
  eliminations: readonly LogicalCandidateHighlight[],
  pattern: "naked" | "hidden",
): LogicalStep {
  return {
    technique: "candidate-pair",
    pattern,
    placements: [],
    eliminations,
    highlights: createEliminations(pairIndices, pairDigits),
    relatedCells: uniqueSorted([
      ...pairIndices,
      ...eliminations.map(({ index }) => index),
    ]),
    unit,
  };
}

function findNakedPair(state: LogicalState): LogicalStep | null {
  for (const { unit, indices } of UNITS) {
    const pairs = new Map<string, number[]>();

    for (const index of indices) {
      const candidates = state.candidates[index];
      if (candidates?.length !== 2) continue;
      const key = candidates.join("");
      const pairIndices = pairs.get(key) ?? [];
      pairIndices.push(index);
      pairs.set(key, pairIndices);
    }

    for (const [key, pairIndices] of pairs) {
      if (pairIndices.length !== 2) continue;
      const pairDigits = [...key].map(Number) as Digit[];
      const eliminations: LogicalCandidateHighlight[] = [];

      for (const index of indices) {
        const candidates = state.candidates[index];
        if (pairIndices.includes(index) || candidates === null) continue;
        const digits = pairDigits.filter((digit) =>
          candidates.includes(digit),
        );
        if (digits.length > 0) eliminations.push({ index, digits });
      }

      if (eliminations.length > 0) {
        return createPairStep(
          unit,
          pairIndices,
          pairDigits,
          eliminations,
          "naked",
        );
      }
    }
  }

  return null;
}

function findHiddenPair(state: LogicalState): LogicalStep | null {
  for (const { unit, indices } of UNITS) {
    for (let left = 0; left < DIGITS.length - 1; left += 1) {
      const firstDigit = DIGITS[left];
      const firstIndices = indices.filter((index) =>
        state.candidates[index]?.includes(firstDigit),
      );
      if (firstIndices.length !== 2) continue;

      for (let right = left + 1; right < DIGITS.length; right += 1) {
        const secondDigit = DIGITS[right];
        const secondIndices = indices.filter((index) =>
          state.candidates[index]?.includes(secondDigit),
        );
        if (
          secondIndices.length !== 2 ||
          firstIndices.some((index, offset) => index !== secondIndices[offset])
        ) {
          continue;
        }

        const pairDigits = [firstDigit, secondDigit];
        const eliminations = firstIndices.flatMap((index) => {
          const candidates = state.candidates[index] ?? [];
          const digits = candidates.filter(
            (digit) => !pairDigits.includes(digit),
          );
          return digits.length > 0 ? [{ index, digits }] : [];
        });

        if (eliminations.length > 0) {
          return createPairStep(
            unit,
            firstIndices,
            pairDigits,
            eliminations,
            "hidden",
          );
        }
      }
    }
  }

  return null;
}

function findCandidatePair(state: LogicalState): LogicalStep | null {
  return findNakedPair(state) ?? findHiddenPair(state);
}

function getCombinations<T>(
  values: readonly T[],
  size: number,
): readonly (readonly T[])[] {
  const combinations: T[][] = [];

  const visit = (start: number, selected: T[]): void => {
    if (selected.length === size) {
      combinations.push([...selected]);
      return;
    }

    for (
      let index = start;
      index <= values.length - (size - selected.length);
      index += 1
    ) {
      selected.push(values[index]);
      visit(index + 1, selected);
      selected.pop();
    }
  };

  visit(0, []);
  return combinations;
}

function createTripleStep(
  state: LogicalState,
  unit: LogicalUnit,
  tripleIndices: readonly number[],
  tripleDigits: readonly Digit[],
  eliminations: readonly LogicalCandidateHighlight[],
  pattern: "naked" | "hidden",
): LogicalStep {
  return {
    technique: "candidate-triple",
    pattern,
    placements: [],
    eliminations,
    highlights: tripleIndices.map((index) => ({
      index,
      digits: (state.candidates[index] ?? []).filter((digit) =>
        tripleDigits.includes(digit),
      ),
    })),
    relatedCells: uniqueSorted([
      ...tripleIndices,
      ...eliminations.map(({ index }) => index),
    ]),
    unit,
  };
}

function findNakedTriple(state: LogicalState): LogicalStep | null {
  for (const { unit, indices } of UNITS) {
    const eligible = indices.filter((index) => {
      const length = state.candidates[index]?.length ?? 0;
      return length >= 2 && length <= 3;
    });

    for (const tripleIndices of getCombinations(eligible, 3)) {
      const tripleDigits = uniqueSorted(
        tripleIndices.flatMap((index) => state.candidates[index] ?? []),
      ) as readonly Digit[];
      if (tripleDigits.length !== 3) continue;

      const eliminations: LogicalCandidateHighlight[] = [];
      for (const index of indices) {
        const candidates = state.candidates[index];
        if (tripleIndices.includes(index) || candidates === null) continue;
        const digits = tripleDigits.filter((digit) =>
          candidates.includes(digit),
        );
        if (digits.length > 0 && digits.length < candidates.length) {
          eliminations.push({ index, digits });
        }
      }

      if (eliminations.length > 0) {
        return createTripleStep(
          state,
          unit,
          tripleIndices,
          tripleDigits,
          eliminations,
          "naked",
        );
      }
    }
  }

  return null;
}

function findHiddenTriple(state: LogicalState): LogicalStep | null {
  for (const { unit, indices } of UNITS) {
    for (const tripleDigits of getCombinations(DIGITS, 3)) {
      const positionsByDigit = tripleDigits.map((digit) =>
        indices.filter((index) => state.candidates[index]?.includes(digit)),
      );
      if (positionsByDigit.some((positions) => positions.length < 2)) {
        continue;
      }

      const tripleIndices = uniqueSorted(positionsByDigit.flat());
      if (tripleIndices.length !== 3) continue;

      const eliminations = tripleIndices.flatMap((index) => {
        const candidates = state.candidates[index] ?? [];
        const digits = candidates.filter(
          (digit) => !tripleDigits.includes(digit),
        );
        return digits.length > 0 ? [{ index, digits }] : [];
      });

      if (eliminations.length > 0) {
        return createTripleStep(
          state,
          unit,
          tripleIndices,
          tripleDigits,
          eliminations,
          "hidden",
        );
      }
    }
  }

  return null;
}

function findCandidateTriple(state: LogicalState): LogicalStep | null {
  return findNakedTriple(state) ?? findHiddenTriple(state);
}

function findXWingByRows(state: LogicalState): LogicalStep | null {
  for (const digit of DIGITS) {
    const rowColumns = Array.from({ length: BOARD_SIZE }, (_, row) => ({
      row,
      columns: getRowIndices(row)
        .filter((index) => state.candidates[index]?.includes(digit))
        .map((index) => getCellPosition(index).column),
    })).filter(({ columns }) => columns.length === 2);

    for (const [first, second] of getCombinations(rowColumns, 2)) {
      if (
        first.columns[0] !== second.columns[0] ||
        first.columns[1] !== second.columns[1]
      ) {
        continue;
      }

      const sourceIndices = [
        first.row * BOARD_SIZE + first.columns[0],
        first.row * BOARD_SIZE + first.columns[1],
        second.row * BOARD_SIZE + second.columns[0],
        second.row * BOARD_SIZE + second.columns[1],
      ];
      const targets = first.columns.flatMap((column) =>
        getColumnIndices(column).filter((index) => {
          const row = getCellPosition(index).row;
          return (
            row !== first.row &&
            row !== second.row &&
            state.candidates[index]?.includes(digit)
          );
        }),
      );
      if (targets.length === 0) continue;

      return {
        technique: "x-wing",
        pattern: "row-based",
        placements: [],
        eliminations: createEliminations(targets, [digit]),
        highlights: createEliminations(sourceIndices, [digit]),
        relatedCells: uniqueSorted([...sourceIndices, ...targets]),
        unit: null,
      };
    }
  }

  return null;
}

function findXWingByColumns(state: LogicalState): LogicalStep | null {
  for (const digit of DIGITS) {
    const columnRows = Array.from({ length: BOARD_SIZE }, (_, column) => ({
      column,
      rows: getColumnIndices(column)
        .filter((index) => state.candidates[index]?.includes(digit))
        .map((index) => getCellPosition(index).row),
    })).filter(({ rows }) => rows.length === 2);

    for (const [first, second] of getCombinations(columnRows, 2)) {
      if (
        first.rows[0] !== second.rows[0] ||
        first.rows[1] !== second.rows[1]
      ) {
        continue;
      }

      const sourceIndices = [
        first.rows[0] * BOARD_SIZE + first.column,
        first.rows[1] * BOARD_SIZE + first.column,
        second.rows[0] * BOARD_SIZE + second.column,
        second.rows[1] * BOARD_SIZE + second.column,
      ];
      const targets = first.rows.flatMap((row) =>
        getRowIndices(row).filter((index) => {
          const column = getCellPosition(index).column;
          return (
            column !== first.column &&
            column !== second.column &&
            state.candidates[index]?.includes(digit)
          );
        }),
      );
      if (targets.length === 0) continue;

      return {
        technique: "x-wing",
        pattern: "column-based",
        placements: [],
        eliminations: createEliminations(targets, [digit]),
        highlights: createEliminations(sourceIndices, [digit]),
        relatedCells: uniqueSorted([...sourceIndices, ...targets]),
        unit: null,
      };
    }
  }

  return null;
}

function findXWing(state: LogicalState): LogicalStep | null {
  return findXWingByRows(state) ?? findXWingByColumns(state);
}

export function findNextLogicalStep(
  value: Board | LogicalState,
): LogicalStep | null {
  const state = getState(value);
  assertBoard(state.board);
  if (getConflictIndices(state.board).length > 0) return null;

  return (
    findNakedSingle(state) ??
    findHiddenSingle(state) ??
    findLockedCandidates(state) ??
    findCandidatePair(state) ??
    findCandidateTriple(state) ??
    findXWing(state)
  );
}

function applyStepToState(
  state: LogicalState,
  step: LogicalStep,
): LogicalState {
  assertBoard(state.board);
  const board = [...state.board];
  const candidates = state.candidates.map((cell) =>
    cell === null ? null : [...cell],
  );

  for (const elimination of step.eliminations) {
    const current = candidates[elimination.index];
    if (
      current === null ||
      elimination.digits.some((digit) => !current.includes(digit))
    ) {
      throw new RangeError("Logical step contains a stale elimination.");
    }
    const next = current.filter(
      (digit) => !elimination.digits.includes(digit),
    );
    if (next.length === 0) {
      throw new RangeError("Logical step removes every candidate from a cell.");
    }
    candidates[elimination.index] = next;
  }

  for (const placement of step.placements) {
    const current = candidates[placement.index];
    if (
      board[placement.index] !== null ||
      current === null ||
      !current.includes(placement.digit)
    ) {
      throw new RangeError("Logical step contains an invalid placement.");
    }

    board[placement.index] = placement.digit;
    candidates[placement.index] = null;
    for (const peerIndex of getPeerIndices(placement.index)) {
      const peerCandidates = candidates[peerIndex];
      if (peerCandidates === null) continue;
      const next = peerCandidates.filter(
        (digit) => digit !== placement.digit,
      );
      if (next.length === 0) {
        throw new RangeError("Logical placement leaves a peer without candidates.");
      }
      candidates[peerIndex] = next;
    }
  }

  return { board, candidates };
}

export function applyLogicalStep(
  state: LogicalState,
  step: LogicalStep,
): LogicalState;
export function applyLogicalStep(board: Board, step: LogicalStep): Board;
export function applyLogicalStep(
  value: Board | LogicalState,
  step: LogicalStep,
): Board | LogicalState {
  const result = applyStepToState(getState(value), step);
  return Array.isArray(value) ? result.board : result;
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

function getDifficulty(
  technique: LogicalTechnique | null,
): Difficulty | null {
  if (technique === null) return null;
  if (TECHNIQUE_RANK[technique] <= TECHNIQUE_RANK["hidden-single"]) {
    return "easy";
  }
  return TECHNIQUE_RANK[technique] <= TECHNIQUE_RANK["candidate-pair"]
    ? "medium"
    : "hard";
}

function hasImpossibleCell(state: LogicalState): boolean {
  return state.candidates.some(
    (candidates, index) =>
      state.board[index] === null && candidates?.length === 0,
  );
}

export function solveLogically(board: Board): LogicalSolveResult {
  assertBoard(board);
  let state = createLogicalState(board);
  if (
    getConflictIndices(state.board).length > 0 ||
    hasImpossibleCell(state)
  ) {
    return {
      status: "invalid",
      board: state.board,
      candidates: state.candidates,
      steps: [],
      hardestTechnique: null,
      difficulty: null,
    };
  }

  const steps: LogicalStep[] = [];
  let hardestTechnique: LogicalTechnique | null = null;

  while (!isCompleteBoard(state.board)) {
    const step = findNextLogicalStep(state);
    if (step === null) {
      return {
        status: "stuck",
        board: state.board,
        candidates: state.candidates,
        steps,
        hardestTechnique,
        difficulty: null,
      };
    }

    state = applyStepToState(state, step);
    steps.push(step);
    hardestTechnique = getHarderTechnique(
      hardestTechnique,
      step.technique,
    );
  }

  return {
    status: "solved",
    board: state.board,
    candidates: state.candidates,
    steps,
    hardestTechnique,
    difficulty: getDifficulty(hardestTechnique),
  };
}
