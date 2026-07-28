import assert from "node:assert/strict";
import test from "node:test";
import {
  prepareSudokuPuzzleBundle,
  SUDOKU_PUZZLE_BUNDLE_VERSION,
  SUDOKU_PUZZLE_SOURCE_VERSION,
} from "../src/features/sudoku/puzzles/index.ts";

const solution =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
const expertSolution =
  "857362941249715863163489275924673158386951724571824396432196587698537412715248639";

const puzzles = {
  easy:
    "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79",
  easyAlternate:
    "534.7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79",
  medium:
    "53....9.2..2............5678...6.4234.68.......39.4....6.5.7..428.41.....4......9",
  hard:
    "....7...2...1.....1..3.2.6.85....4.3.2.....9.....248....1.....4..7..9..53..2.6..9",
  expert:
    "....6........1.863..3..9...9.4......3.....7.457.82.........658.69...7.......4..3.",
};

function definition(id, difficulty, puzzle = puzzles[difficulty]) {
  return {
    id,
    difficulty,
    puzzle,
    solution: difficulty === "expert" ? expertSolution : solution,
  };
}

test("rejects malformed source envelopes deterministically", () => {
  assert.deepEqual(prepareSudokuPuzzleBundle(null).issues, [
    { code: "invalid-source", index: null, id: null },
  ]);
  assert.deepEqual(prepareSudokuPuzzleBundle({ version: 2, puzzles: [] }).issues, [
    { code: "invalid-version", index: null, id: null },
  ]);
  assert.deepEqual(prepareSudokuPuzzleBundle({ version: 1 }).issues, [
    { code: "invalid-puzzles", index: null, id: null },
  ]);
});

test("emits a canonical stable bundle with a difficulty summary", () => {
  const source = {
    version: SUDOKU_PUZZLE_SOURCE_VERSION,
    puzzles: [
      definition("expert-z", "expert"),
      definition("easy-z", "easy", puzzles.easyAlternate.replaceAll(".", "0")),
      definition("hard-a", "hard"),
      definition("medium-a", "medium"),
      definition("easy-a", "easy"),
    ],
  };
  const first = prepareSudokuPuzzleBundle(source);
  const second = prepareSudokuPuzzleBundle({
    ...source,
    puzzles: [...source.puzzles].reverse(),
  });

  assert.equal(first.valid, true);
  assert.equal(first.bundle.version, SUDOKU_PUZZLE_BUNDLE_VERSION);
  assert.deepEqual(first.summary, {
    total: 5,
    accepted: 5,
    rejected: 0,
    byDifficulty: { easy: 2, medium: 1, hard: 1, expert: 1 },
  });
  assert.deepEqual(
    first.bundle.puzzles.map(({ id }) => id),
    ["easy-a", "easy-z", "medium-a", "hard-a", "expert-z"],
  );
  assert.equal(first.bundle.puzzles[1].puzzle, puzzles.easyAlternate);
  assert.deepEqual(first.bundle, second.bundle);
});

test("rejects malformed, non-unique, and mismatched definitions atomically", () => {
  const wrongSolution =
    "672195348534678912198342567859761423426853791713924856961537284287419635345286179";
  const result = prepareSudokuPuzzleBundle({
    version: 1,
    puzzles: [
      definition("valid-easy", "easy"),
      {
        id: "Bad ID",
        difficulty: "unknown",
        puzzle: "short",
        solution: "short",
      },
      {
        id: "non-unique",
        difficulty: "easy",
        puzzle: ".".repeat(81),
        solution,
      },
      {
        ...definition("solution-mismatch", "hard"),
        solution: wrongSolution,
      },
    ],
  });

  assert.equal(result.valid, false);
  assert.equal(result.bundle, null);
  assert.equal(result.summary.total, 4);
  assert.equal(result.summary.accepted, 1);
  assert.equal(result.summary.rejected, 3);
  assert.deepEqual(
    [...new Set(result.issues.map(({ code }) => code))],
    [
      "invalid-id",
      "invalid-difficulty",
      "invalid-puzzle",
      "invalid-solution",
      "multiple-solutions",
      "clue-mismatch",
      "solution-mismatch",
    ],
  );
});

test("rejects puzzles outside the logical catalog and wrong difficulty labels", () => {
  const logicalStuckPuzzle =
    "1....7.9..3..2...8..96..5....53..9...1..8...26....4...3......1..4......7..7...3..";
  const logicalStuckSolution =
    "162857493534129678789643521475312986913586742628794135356478219241935867897261354";
  const result = prepareSudokuPuzzleBundle({
    version: 1,
    puzzles: [
      {
        id: "outside-catalog",
        difficulty: "expert",
        puzzle: logicalStuckPuzzle,
        solution: logicalStuckSolution,
      },
      {
        ...definition("wrong-rating", "easy"),
        difficulty: "expert",
      },
    ],
  });

  assert.deepEqual(result.issues, [
    {
      code: "logical-unsolved",
      index: 0,
      id: "outside-catalog",
    },
    {
      code: "difficulty-mismatch",
      index: 1,
      id: "wrong-rating",
      actualDifficulty: "easy",
    },
  ]);
  assert.equal(result.bundle, null);
});

test("rejects duplicate IDs and canonical duplicate puzzle grids", () => {
  const result = prepareSudokuPuzzleBundle({
    version: 1,
    puzzles: [
      definition("same-id", "easy"),
      definition("same-id", "medium"),
      definition("same-grid", "easy", puzzles.easy.replaceAll(".", "0")),
    ],
  });

  assert.deepEqual(result.issues, [
    { code: "duplicate-id", index: 1, id: "same-id" },
    { code: "duplicate-puzzle", index: 2, id: "same-grid" },
  ]);
  assert.deepEqual(result.summary, {
    total: 3,
    accepted: 1,
    rejected: 2,
    byDifficulty: { easy: 1, medium: 0, hard: 0, expert: 0 },
  });
  assert.equal(result.bundle, null);
});
