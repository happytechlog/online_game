import assert from "node:assert/strict";
import test from "node:test";
import {
  TETRIS_BEST_SCORE_STORAGE_KEY,
  loadBestTetrisScore,
  saveBestTetrisScore,
} from "../src/features/tetris/storage/index.ts";

class MemoryStorage {
  values = new Map();
  failReads = false;
  failWrites = false;

  getItem(key) {
    if (this.failReads) throw new Error("storage unavailable");
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    if (this.failWrites) throw new Error("quota exceeded");
    this.values.set(key, value);
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

test("loads no score for an empty store and saves a versioned record", () => {
  const storage = new MemoryStorage();

  assert.equal(TETRIS_BEST_SCORE_STORAGE_KEY, "online-games:tetris:best:v1");
  assert.equal(loadBestTetrisScore(storage), 0);
  assert.equal(saveBestTetrisScore(storage, 128), true);
  assert.deepEqual(
    JSON.parse(storage.getItem(TETRIS_BEST_SCORE_STORAGE_KEY)),
    { version: 1, score: 128 },
  );
  assert.equal(loadBestTetrisScore(storage), 128);
});

test("keeps the best score monotonic and allows zero", () => {
  const storage = new MemoryStorage();

  assert.equal(saveBestTetrisScore(storage, 128), true);
  assert.equal(saveBestTetrisScore(storage, 64), true);
  assert.equal(loadBestTetrisScore(storage), 128);
  assert.equal(saveBestTetrisScore(storage, 0), true);
  assert.equal(loadBestTetrisScore(storage), 128);
  assert.equal(saveBestTetrisScore(storage, 256), true);
  assert.equal(loadBestTetrisScore(storage), 256);
});

test("treats malformed and invalid persisted records as an empty score", () => {
  const storage = new MemoryStorage();

  for (const value of [
    "{broken",
    "null",
    JSON.stringify({ version: 2, score: 100 }),
    JSON.stringify({ version: 1, score: -1 }),
    JSON.stringify({ version: 1, score: 1.5 }),
    JSON.stringify({ version: 1, score: Number.MAX_SAFE_INTEGER + 1 }),
    JSON.stringify({ version: 1, score: 100, extra: true }),
  ]) {
    storage.setItem(TETRIS_BEST_SCORE_STORAGE_KEY, value);
    assert.equal(loadBestTetrisScore(storage), 0, value);
  }
});

test("rejects invalid score inputs without changing a valid record", () => {
  const storage = new MemoryStorage();

  assert.equal(saveBestTetrisScore(storage, 128), true);
  const original = storage.getItem(TETRIS_BEST_SCORE_STORAGE_KEY);

  for (const score of [
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    "128",
    null,
  ]) {
    assert.equal(saveBestTetrisScore(storage, score), false);
    assert.equal(storage.getItem(TETRIS_BEST_SCORE_STORAGE_KEY), original);
  }
});

test("contains storage read and quota failures", () => {
  const storage = new MemoryStorage();
  storage.failReads = true;
  assert.equal(loadBestTetrisScore(storage), 0);

  storage.failReads = false;
  storage.failWrites = true;
  assert.equal(saveBestTetrisScore(storage, 128), false);
});
