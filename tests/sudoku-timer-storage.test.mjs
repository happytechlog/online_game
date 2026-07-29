import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptySudokuBestTimes,
  createSudokuTimer,
  finishSudokuTimer,
  formatSudokuTime,
  getSudokuElapsedMs,
  loadSudokuBestTimes,
  pauseSudokuTimer,
  resumeSudokuTimer,
  saveSudokuBestTimes,
  SUDOKU_BEST_TIMES_STORAGE_KEY,
  updateSudokuBestTime,
} from "../src/features/sudoku/index.ts";

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("accumulates only running Sudoku timer intervals", () => {
  let timer = createSudokuTimer(1_000);
  assert.equal(getSudokuElapsedMs(timer, 4_250), 3_250);

  timer = pauseSudokuTimer(timer, 4_250);
  assert.equal(getSudokuElapsedMs(timer, 20_000), 3_250);
  timer = resumeSudokuTimer(timer, 30_000);
  timer = finishSudokuTimer(timer, 31_750);

  assert.deepEqual(timer, {
    status: "finished",
    elapsedMs: 5_000,
    startedAtMs: null,
  });
});

test("keeps repeated pause, resume, and finish operations idempotent", () => {
  const paused = pauseSudokuTimer(createSudokuTimer(100), 600);
  assert.equal(pauseSudokuTimer(paused, 900), paused);
  const running = resumeSudokuTimer(paused, 1_000);
  assert.equal(resumeSudokuTimer(running, 1_200), running);
  const finished = finishSudokuTimer(running, 1_500);
  assert.equal(finishSudokuTimer(finished, 2_000), finished);
});

test("formats Sudoku times on both sides of one hour", () => {
  assert.equal(formatSudokuTime(0), "00:00");
  assert.equal(formatSudokuTime(65_999), "01:05");
  assert.equal(formatSudokuTime(3_599_999), "59:59");
  assert.equal(formatSudokuTime(3_600_000), "1:00:00");
  assert.equal(formatSudokuTime(37_845_000), "10:30:45");
});

test("stores only lower per-difficulty Sudoku best times", () => {
  const empty = createEmptySudokuBestTimes();
  const first = updateSudokuBestTime(empty, "hard", 120_000);
  const slower = updateSudokuBestTime(first.bestTimes, "hard", 130_000);
  const faster = updateSudokuBestTime(slower.bestTimes, "hard", 110_000);

  assert.equal(first.isNewBest, true);
  assert.equal(slower.isNewBest, false);
  assert.equal(slower.bestTimes, first.bestTimes);
  assert.equal(faster.isNewBest, true);
  assert.equal(faster.bestTimeMs, 110_000);
  assert.equal(faster.bestTimes.times.easy, null);
});

test("validates stored best times and contains storage failures", () => {
  const valid = updateSudokuBestTime(
    createEmptySudokuBestTimes(),
    "easy",
    45_000,
  ).bestTimes;
  const storage = createMemoryStorage();
  assert.equal(saveSudokuBestTimes(storage, valid), true);
  assert.deepEqual(loadSudokuBestTimes(storage), valid);

  const invalid = createMemoryStorage({
    [SUDOKU_BEST_TIMES_STORAGE_KEY]: JSON.stringify({
      version: 1,
      times: { easy: -1, medium: null, hard: null, expert: null },
    }),
  });
  assert.deepEqual(loadSudokuBestTimes(invalid), createEmptySudokuBestTimes());

  const unavailable = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("quota");
    },
    removeItem() {},
  };
  assert.deepEqual(
    loadSudokuBestTimes(unavailable),
    createEmptySudokuBestTimes(),
  );
  assert.equal(saveSudokuBestTimes(unavailable, valid), false);
});
