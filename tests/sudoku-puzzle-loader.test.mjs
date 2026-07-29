import assert from "node:assert/strict";
import test from "node:test";
import {
  loadSudokuPuzzleBundle,
  SUDOKU_PUZZLE_BUNDLE_VERSION,
  SUDOKU_PUZZLES_PER_DIFFICULTY,
} from "../src/features/sudoku/puzzles/index.ts";
import {
  sudokuPuzzleBundle,
} from "../src/features/sudoku/puzzles/release.ts";

const solution =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
const difficulties = ["easy", "medium", "hard", "expert"];
const blankPatterns = [];

for (let first = 0; first < 79 && blankPatterns.length < 400; first += 1) {
  for (
    let second = first + 1;
    second < 80 && blankPatterns.length < 400;
    second += 1
  ) {
    blankPatterns.push([first, second, 80]);
  }
}

function createPuzzle(sequence) {
  const cells = [...solution];
  for (const index of blankPatterns[sequence]) {
    cells[index] = ".";
  }
  return cells.join("");
}

function createValidBundle() {
  return {
    version: SUDOKU_PUZZLE_BUNDLE_VERSION,
    puzzles: difficulties.flatMap((difficulty, difficultyIndex) =>
      Array.from(
        { length: SUDOKU_PUZZLES_PER_DIFFICULTY },
        (_, puzzleIndex) => {
          const sequence =
            difficultyIndex * SUDOKU_PUZZLES_PER_DIFFICULTY + puzzleIndex;
          return {
            id: `${difficulty}-${String(puzzleIndex + 1).padStart(3, "0")}`,
            difficulty,
            puzzle: createPuzzle(sequence),
            solution,
          };
        },
      ),
    ),
  };
}

test("loads a lightweight bundle with exactly 100 puzzles per difficulty", () => {
  const source = createValidBundle();
  const result = loadSudokuPuzzleBundle(source);

  assert.equal(result.valid, true);
  assert.equal(result.bundle.version, SUDOKU_PUZZLE_BUNDLE_VERSION);
  assert.equal(result.bundle.puzzles.length, 400);
  assert.deepEqual(result.bundle, source);
});

test("loads the generated 400-puzzle release artifact", () => {
  assert.equal(sudokuPuzzleBundle.puzzles.length, 400);

  for (const difficulty of difficulties) {
    assert.equal(
      sudokuPuzzleBundle.puzzles.filter(
        (puzzle) => puzzle.difficulty === difficulty,
      ).length,
      SUDOKU_PUZZLES_PER_DIFFICULTY,
    );
  }
});

test("rejects invalid bundle versions and envelope shapes", () => {
  assert.deepEqual(loadSudokuPuzzleBundle(null).issues, [
    { code: "invalid-bundle", index: null, id: null },
  ]);
  assert.deepEqual(
    loadSudokuPuzzleBundle({ version: 2, puzzles: [] }).issues,
    [{ code: "invalid-version", index: null, id: null }],
  );
  assert.deepEqual(
    loadSudokuPuzzleBundle({ version: 1, puzzles: [], extra: true }).issues,
    [{ code: "invalid-bundle", index: null, id: null }],
  );
  assert.deepEqual(loadSudokuPuzzleBundle({ version: 1 }).issues, [
    { code: "invalid-bundle", index: null, id: null },
  ]);
});

test("rejects malformed entries without expensive preparation checks", () => {
  const source = createValidBundle();
  source.puzzles[0] = {
    ...source.puzzles[0],
    puzzle: source.puzzles[0].puzzle.slice(1),
  };
  source.puzzles[1] = {
    ...source.puzzles[1],
    solution: `6${source.puzzles[1].solution.slice(1)}`,
  };

  const result = loadSudokuPuzzleBundle(source);

  assert.equal(result.valid, false);
  assert.equal(result.bundle, null);
  assert.deepEqual(result.issues.slice(0, 2), [
    { code: "invalid-entry", index: 0, id: "easy-001" },
    { code: "invalid-entry", index: 1, id: "easy-002" },
  ]);
});

test("rejects any difficulty that does not contain exactly 100 entries", () => {
  const source = createValidBundle();
  source.puzzles.pop();

  const result = loadSudokuPuzzleBundle(source);

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues, [
    {
      code: "invalid-difficulty-count",
      index: null,
      id: null,
      difficulty: "expert",
      actual: 99,
      expected: 100,
    },
  ]);
});
