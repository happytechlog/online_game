import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  parseBoard,
  solveLogically,
} from "../src/features/sudoku/engine/index.ts";
import {
  prepareSudokuPuzzleBundle,
  SUDOKU_PUZZLE_SOURCE_VERSION,
  SUDOKU_PUZZLES_PER_DIFFICULTY,
} from "../src/features/sudoku/puzzles/index.ts";

const seedPath = resolve(
  "src/features/sudoku/puzzles/sources/release-seeds-v1.json",
);
const outputPath = resolve(
  process.argv[2] ??
    "src/features/sudoku/puzzles/sources/release-v1.json",
);
const difficulties = ["easy", "medium", "hard", "expert"];

function createRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function hashText(value) {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function shuffled(values, random) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [
      result[swapIndex],
      result[index],
    ];
  }

  return result;
}

function createUnitOrder(random) {
  return shuffled([0, 1, 2], random).flatMap((group) =>
    shuffled([0, 1, 2], random).map((offset) => group * 3 + offset),
  );
}

function transformGrid(value, transformKey) {
  const random = createRandom(hashText(transformKey));
  const rows = createUnitOrder(random);
  const columns = createUnitOrder(random);
  const digits = shuffled(["1", "2", "3", "4", "5", "6", "7", "8", "9"], random);
  const digitMap = new Map(
    digits.map((digit, index) => [String(index + 1), digit]),
  );
  const transpose = random() < 0.5;
  let result = "";

  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      const sourceRow = transpose ? rows[column] : rows[row];
      const sourceColumn = transpose ? columns[row] : columns[column];
      const cell = value[sourceRow * 9 + sourceColumn];
      result += cell === "." ? "." : digitMap.get(cell);
    }
  }

  return result;
}

function* createMaskCandidates(seed) {
  const blanks = [...seed.puzzle].flatMap((cell, index) =>
    cell === "." ? [index] : [],
  );
  const clues = [...seed.puzzle].flatMap((cell, index) =>
    cell === "." ? [] : [index],
  );

  for (let first = 0; first < blanks.length; first += 1) {
    for (let second = first; second < blanks.length; second += 1) {
      const cells = [...seed.puzzle];
      cells[blanks[first]] = seed.solution[blanks[first]];
      cells[blanks[second]] = seed.solution[blanks[second]];
      yield cells.join("");
    }
  }

  for (const removedIndex of clues) {
    for (const addedIndex of blanks) {
      const cells = [...seed.puzzle];
      cells[removedIndex] = ".";
      cells[addedIndex] = seed.solution[addedIndex];
      yield cells.join("");
    }
  }

  let fallback = 0;
  while (true) {
    yield seed.puzzle;
    fallback += 1;
    if (fallback > SUDOKU_PUZZLES_PER_DIFFICULTY * 10) return;
  }
}

function hasDeclaredDifficulty(puzzle, difficulty) {
  const board = parseBoard(puzzle);
  if (board === null) return false;
  const result = solveLogically(board);
  return result.status === "solved" && result.difficulty === difficulty;
}

async function assembleDifficulty(seed) {
  const accepted = [];
  const seenBaseMasks = new Set();
  const seenPuzzles = new Set();
  let candidateNumber = 0;

  for (const basePuzzle of createMaskCandidates(seed)) {
    if (
      basePuzzle !== seed.puzzle &&
      (seenBaseMasks.has(basePuzzle) ||
        !hasDeclaredDifficulty(basePuzzle, seed.difficulty))
    ) {
      continue;
    }
    seenBaseMasks.add(basePuzzle);

    for (let transformAttempt = 0; transformAttempt < 8; transformAttempt += 1) {
      candidateNumber += 1;
      const transformKey =
        `${seed.difficulty}-${candidateNumber}-${transformAttempt}`;
      const puzzle = transformGrid(basePuzzle, transformKey);
      if (seenPuzzles.has(puzzle)) continue;

      const definition = {
        id: `${seed.difficulty}-${String(accepted.length + 1).padStart(3, "0")}`,
        difficulty: seed.difficulty,
        puzzle,
        solution: transformGrid(seed.solution, transformKey),
      };
      const validation = prepareSudokuPuzzleBundle({
        version: SUDOKU_PUZZLE_SOURCE_VERSION,
        puzzles: [definition],
      });

      if (validation.valid) {
        accepted.push(definition);
        seenPuzzles.add(puzzle);
        break;
      }
    }

    if (accepted.length === SUDOKU_PUZZLES_PER_DIFFICULTY) {
      return accepted;
    }
  }

  throw new Error(
    `Only assembled ${accepted.length} ${seed.difficulty} puzzles.`,
  );
}

const seedSource = JSON.parse(await readFile(seedPath, "utf8"));
const seedValidation = prepareSudokuPuzzleBundle(seedSource);

if (!seedValidation.valid || seedValidation.bundle === null) {
  throw new Error(`Invalid release seeds: ${JSON.stringify(seedValidation.issues)}`);
}

const seedsByDifficulty = new Map(
  seedValidation.bundle.puzzles.map((seed) => [seed.difficulty, seed]),
);
const puzzles = [];

for (const difficulty of difficulties) {
  const seed = seedsByDifficulty.get(difficulty);
  if (seed === undefined) {
    throw new Error(`Missing ${difficulty} release seed.`);
  }

  const assembled = await assembleDifficulty(seed);
  puzzles.push(...assembled);
  console.log(`Assembled ${assembled.length} ${difficulty} puzzles.`);
}

const source = {
  version: SUDOKU_PUZZLE_SOURCE_VERSION,
  puzzles,
};
const finalValidation = prepareSudokuPuzzleBundle(source);

if (!finalValidation.valid) {
  throw new Error(
    `Assembled source failed validation: ${JSON.stringify(finalValidation.issues)}`,
  );
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(source, null, 2)}\n`, "utf8");
console.log(`Wrote ${puzzles.length} puzzles to ${outputPath}.`);
