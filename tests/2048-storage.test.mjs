import assert from "node:assert/strict";
import test from "node:test";
import {
  GAME_2048_BEST_STORAGE_KEY,
  GAME_2048_SAVE_STORAGE_KEY,
  createInitialGame,
  createSaved2048Game,
  load2048Game,
  loadBest2048Score,
  save2048Game,
  saveBest2048Score,
} from "../src/features/2048/index.ts";

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

function validGame() {
  const spawns = [
    { index: 0, value: 2 },
    { index: 15, value: 4 },
  ];
  return createInitialGame(() => spawns.shift());
}

test("round-trips a cloned, versioned 2048 game", () => {
  const storage = new MemoryStorage();
  const game = validGame();
  const savedAt = new Date("2026-07-26T12:00:00.000Z");

  assert.equal(save2048Game(storage, game, savedAt), true);
  assert.deepEqual(
    load2048Game(storage),
    createSaved2048Game(game, savedAt),
  );
  assert.notEqual(load2048Game(storage).game.board, game.board);
});

test("rejects malformed saves, unknown versions, and invalid boards", () => {
  const storage = new MemoryStorage();
  const valid = createSaved2048Game(validGame());

  for (const value of [
    "{not-json",
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({
      ...valid,
      game: { ...valid.game, board: Array(15).fill(null) },
    }),
    JSON.stringify({
      ...valid,
      game: { ...valid.game, board: [3, ...Array(15).fill(null)] },
    }),
    JSON.stringify({
      ...valid,
      game: { ...valid.game, score: 2 },
    }),
    JSON.stringify({
      ...valid,
      game: { ...valid.game, hasWon: true },
    }),
  ]) {
    storage.setItem(GAME_2048_SAVE_STORAGE_KEY, value);
    assert.equal(load2048Game(storage), null);
  }
});

test("validates game-over state against the available moves", () => {
  const storage = new MemoryStorage();
  const lockedBoard = [
    2, 4, 2, 4,
    4, 2, 4, 2,
    2, 4, 2, 4,
    4, 2, 4, 2,
  ];
  const gameOver = {
    board: lockedBoard,
    score: 100,
    status: "game-over",
    hasWon: false,
  };

  assert.equal(save2048Game(storage, gameOver), true);

  const invalidPlaying = { ...gameOver, status: "playing" };
  assert.equal(save2048Game(storage, invalidPlaying), false);
});

test("keeps the best score monotonic and rejects invalid score payloads", () => {
  const storage = new MemoryStorage();

  assert.equal(loadBest2048Score(storage), 0);
  assert.equal(saveBest2048Score(storage, 128), true);
  assert.equal(saveBest2048Score(storage, 64), true);
  assert.equal(loadBest2048Score(storage), 128);

  storage.setItem(
    GAME_2048_BEST_STORAGE_KEY,
    JSON.stringify({ version: 2, score: 256 }),
  );
  assert.equal(loadBest2048Score(storage), 0);

  storage.setItem(
    GAME_2048_BEST_STORAGE_KEY,
    JSON.stringify({ version: 1, score: -4 }),
  );
  assert.equal(loadBest2048Score(storage), 0);
});

test("contains unavailable storage and quota failures", () => {
  const storage = new MemoryStorage();
  storage.failReads = true;
  assert.equal(load2048Game(storage), null);
  assert.equal(loadBest2048Score(storage), 0);

  storage.failReads = false;
  storage.failWrites = true;
  assert.equal(save2048Game(storage, validGame()), false);
  assert.equal(saveBest2048Score(storage, 128), false);
});
