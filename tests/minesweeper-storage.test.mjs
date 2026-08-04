import assert from "node:assert/strict";
import test from "node:test";
import {
  MINESWEEPER_RECORDS_STORAGE_KEY,
  MINESWEEPER_SAVE_STORAGE_KEY,
  createMinesweeperGame,
  createSavedMinesweeperGame,
  loadMinesweeperGame,
  loadMinesweeperRecords,
  isMinesweeperGameState,
  revealCell,
  saveMinesweeperGame,
  saveMinesweeperRecords,
  updateMinesweeperRecord,
} from "../src/features/minesweeper/index.ts";

class MemoryStorage {
  values = new Map();
  fail = false;
  getItem(key) { if (this.fail) throw new Error("unavailable"); return this.values.get(key) ?? null; }
  setItem(key, value) { if (this.fail) throw new Error("quota"); this.values.set(key, value); }
  removeItem(key) { this.values.delete(key); }
}

test("stores and restores a versioned unfinished board", () => {
  const storage = new MemoryStorage();
  const save = createSavedMinesweeperGame(createMinesweeperGame(), 17, new Date("2026-01-01"));
  assert.equal(saveMinesweeperGame(storage, save), true);
  assert.deepEqual(loadMinesweeperGame(storage), save);
});

test("invalid saves and records recover independently", () => {
  const storage = new MemoryStorage();
  storage.values.set(MINESWEEPER_SAVE_STORAGE_KEY, "{broken");
  storage.values.set(MINESWEEPER_RECORDS_STORAGE_KEY, JSON.stringify({ version: 1, times: { beginner: 9, intermediate: null, advanced: null } }));
  assert.equal(loadMinesweeperGame(storage), null);
  assert.equal(loadMinesweeperRecords(storage).times.beginner, 9);
  storage.values.set(MINESWEEPER_RECORDS_STORAGE_KEY, JSON.stringify({ version: 2 }));
  assert.equal(loadMinesweeperRecords(storage).times.beginner, null);
});

test("storage exceptions never interrupt save or record updates", () => {
  const storage = new MemoryStorage(); storage.fail = true;
  assert.equal(saveMinesweeperGame(storage, createSavedMinesweeperGame(createMinesweeperGame(), 0)), false);
  const result = updateMinesweeperRecord(loadMinesweeperRecords(storage), "beginner", 22);
  assert.equal(result.isNewBest, true);
  assert.equal(saveMinesweeperRecords(storage, result.records), false);
});

test("rejects corrupted generation fields and terminal games from active saves", () => {
  const generated = revealCell(createMinesweeperGame(), 40, () => 0);
  assert.equal(isMinesweeperGameState(generated), true);
  const wrongAdjacent = structuredClone(generated);
  wrongAdjacent.cells[0].adjacent = 8;
  assert.equal(isMinesweeperGameState(wrongAdjacent), false);
  const revealedMine = structuredClone(generated);
  const mineIndex = revealedMine.cells.findIndex((cell) => cell.mine);
  revealedMine.cells[mineIndex].revealed = true;
  assert.equal(isMinesweeperGameState(revealedMine), false);
  const invalidReady = createMinesweeperGame();
  invalidReady.cells[0].adjacent = 1;
  assert.equal(isMinesweeperGameState(invalidReady), false);
  const won = structuredClone(generated);
  won.phase = "won";
  assert.equal(saveMinesweeperGame(new MemoryStorage(), createSavedMinesweeperGame(won, 5)), false);
});
