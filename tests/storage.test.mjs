import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_OTHELLO_STATS,
  OTHELLO_SAVE_STORAGE_KEY,
  OTHELLO_STATS_STORAGE_KEY,
  applyCompletedGameToStats,
  createInitialGame,
  createSavedOthelloGame,
  loadOthelloGame,
  loadOthelloStats,
  saveOthelloGame,
} from "../src/features/othello/index.ts";
import {
  RECENT_GAMES_STORAGE_KEY,
  loadRecentGames,
  markGameAsRecent,
} from "../src/storage/recent-games.ts";

class MemoryStorage {
  values = new Map();
  failWrites = false;

  getItem(key) {
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

function validSave() {
  return createSavedOthelloGame(
    {
      sessionId: "test-session-1234",
      mode: "computer",
      difficulty: "intermediate",
      humanColor: "black",
      history: [createInitialGame()],
    },
    new Date("2026-07-25T12:00:00.000Z"),
  );
}

test("round-trips a valid versioned Othello save", () => {
  const storage = new MemoryStorage();
  const save = validSave();

  assert.equal(saveOthelloGame(storage, save), true);
  assert.deepEqual(loadOthelloGame(storage), save);
});

test("rejects malformed JSON and missing save fields", () => {
  const storage = new MemoryStorage();
  storage.setItem(OTHELLO_SAVE_STORAGE_KEY, "{not-json");
  assert.equal(loadOthelloGame(storage), null);

  storage.setItem(
    OTHELLO_SAVE_STORAGE_KEY,
    JSON.stringify({ version: 1, history: [] }),
  );
  assert.equal(loadOthelloGame(storage), null);
});

test("rejects unknown versions, invalid players, and wrong board sizes", () => {
  const storage = new MemoryStorage();

  for (const mutate of [
    (save) => ({ ...save, version: 2 }),
    (save) => ({ ...save, humanColor: "green" }),
    (save) => ({
      ...save,
      history: [{ ...save.history[0], currentPlayer: "green" }],
    }),
    (save) => ({
      ...save,
      history: [{ ...save.history[0], board: Array(63).fill(null) }],
    }),
  ]) {
    storage.setItem(
      OTHELLO_SAVE_STORAGE_KEY,
      JSON.stringify(mutate(validSave())),
    );
    assert.equal(loadOthelloGame(storage), null);
  }
});

test("contains storage quota failures without throwing", () => {
  const storage = new MemoryStorage();
  storage.failWrites = true;

  assert.equal(saveOthelloGame(storage, validSave()), false);
});

test("records computer and local results without mutating prior stats", () => {
  const computerStats = applyCompletedGameToStats(EMPTY_OTHELLO_STATS, {
    mode: "computer",
    humanColor: "black",
    winner: "black",
  });
  const localStats = applyCompletedGameToStats(computerStats, {
    mode: "local",
    humanColor: "black",
    winner: "draw",
  });

  assert.equal(EMPTY_OTHELLO_STATS.computer.played, 0);
  assert.deepEqual(computerStats.computer, {
    played: 1,
    wins: 1,
    losses: 0,
    draws: 0,
  });
  assert.equal(localStats.local.played, 1);
  assert.equal(localStats.local.draws, 1);
});

test("falls back to empty stats when stored counters are inconsistent", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    OTHELLO_STATS_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      computer: { played: 5, wins: 1, losses: 0, draws: 0 },
      local: { played: 0, blackWins: 0, whiteWins: 0, draws: 0 },
    }),
  );

  assert.deepEqual(loadOthelloStats(storage), EMPTY_OTHELLO_STATS);
});

test("deduplicates and validates recent games", () => {
  const storage = new MemoryStorage();
  const now = new Date("2026-07-25T12:00:00.000Z");

  assert.equal(markGameAsRecent(storage, "othello", now), true);
  assert.equal(markGameAsRecent(storage, "othello", now), true);
  assert.deepEqual(loadRecentGames(storage)?.gameIds, ["othello"]);

  storage.setItem(
    RECENT_GAMES_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      gameIds: ["unknown-game"],
      updatedAt: now.toISOString(),
    }),
  );
  assert.equal(loadRecentGames(storage), null);
});
