import assert from "node:assert/strict";
import test from "node:test";
import {
  CELL_COUNT,
  canMove,
  continueGame,
  createInitialGame,
  createRandomTileSpawner,
  hasWinningTile,
  moveBoard,
  playMove,
} from "../src/features/2048/engine/index.ts";

function boardFromRows(rows) {
  return rows.flat();
}

function firstEmptySpawner(value = 2) {
  return (emptyIndices) => ({ index: emptyIndices[0], value });
}

test("creates a game with two injected starting tiles", () => {
  const spawns = [
    { index: 0, value: 2 },
    { index: 15, value: 4 },
  ];
  const state = createInitialGame(() => spawns.shift());

  assert.equal(state.board.length, CELL_COUNT);
  assert.equal(state.board[0], 2);
  assert.equal(state.board[15], 4);
  assert.equal(state.board.filter((tile) => tile !== null).length, 2);
  assert.equal(state.score, 0);
  assert.equal(state.status, "playing");
  assert.equal(state.hasWon, false);
});

test("moves and merges rows left without mutating the input", () => {
  const board = boardFromRows([
    [2, null, 2, 2],
    [2, 2, 2, 2],
    [4, 4, 8, 8],
    [null, null, null, null],
  ]);
  const snapshot = [...board];
  const result = moveBoard(board, "left");

  assert.deepEqual(result.board, boardFromRows([
    [4, 2, null, null],
    [4, 4, null, null],
    [8, 16, null, null],
    [null, null, null, null],
  ]));
  assert.equal(result.scoreGained, 36);
  assert.equal(result.moved, true);
  assert.deepEqual(board, snapshot);
});

test("resolves all directions toward the selected edge", () => {
  const horizontal = boardFromRows([
    [2, null, 2, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ]);
  const vertical = boardFromRows([
    [2, null, null, null],
    [null, null, null, null],
    [2, null, null, null],
    [null, null, null, null],
  ]);

  assert.deepEqual(moveBoard(horizontal, "left").board.slice(0, 4), [
    4,
    null,
    null,
    null,
  ]);
  assert.deepEqual(moveBoard(horizontal, "right").board.slice(0, 4), [
    null,
    null,
    null,
    4,
  ]);
  assert.deepEqual(
    [0, 4, 8, 12].map((index) => moveBoard(vertical, "up").board[index]),
    [4, null, null, null],
  );
  assert.deepEqual(
    [0, 4, 8, 12].map((index) => moveBoard(vertical, "down").board[index]),
    [null, null, null, 4],
  );
});

test("allows each tile to merge no more than once per move", () => {
  const board = boardFromRows([
    [2, 2, 4, null],
    [4, 4, 8, 8],
    [null, null, null, null],
    [null, null, null, null],
  ]);
  const result = moveBoard(board, "left");

  assert.deepEqual(result.board.slice(0, 4), [4, 4, null, null]);
  assert.deepEqual(result.board.slice(4, 8), [8, 16, null, null]);
  assert.equal(result.scoreGained, 28);
});

test("spawns exactly one tile after a successful move", () => {
  const state = {
    board: boardFromRows([
      [2, 2, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]),
    score: 10,
    status: "playing",
    hasWon: false,
  };
  const result = playMove(state, "left", (emptyIndices) => ({
    index: emptyIndices.at(-1),
    value: 4,
  }));

  assert.equal(result.moved, true);
  assert.deepEqual(result.spawnedTile, { index: 15, value: 4 });
  assert.equal(result.state.board[0], 4);
  assert.equal(result.state.board[15], 4);
  assert.equal(result.state.board.filter((tile) => tile !== null).length, 2);
  assert.equal(result.state.score, 14);
  assert.equal(state.board[0], 2);
});

test("does not spawn or score after an invalid move", () => {
  const state = {
    board: boardFromRows([
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]),
    score: 12,
    status: "playing",
    hasWon: false,
  };
  const result = playMove(state, "left", () => {
    throw new Error("spawner must not be called");
  });

  assert.equal(result.moved, false);
  assert.equal(result.spawnedTile, null);
  assert.equal(result.state, state);
  assert.equal(result.state.score, 12);
});

test("uses injected randomness for tile position and the 90/10 value split", () => {
  const twoValues = [0.5, 0.899999];
  const spawnTwo = createRandomTileSpawner(() => twoValues.shift());
  assert.deepEqual(spawnTwo([2, 7]), { index: 7, value: 2 });

  const fourValues = [0, 0.9];
  const spawnFour = createRandomTileSpawner(() => fourValues.shift());
  assert.deepEqual(spawnFour([2, 7]), { index: 2, value: 4 });
});

test("announces the first 2048 tile once and allows continued play", () => {
  const state = {
    board: boardFromRows([
      [1024, 1024, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]),
    score: 0,
    status: "playing",
    hasWon: false,
  };
  const won = playMove(state, "left", firstEmptySpawner());

  assert.equal(won.state.board[0], 2048);
  assert.equal(won.state.score, 2048);
  assert.equal(won.state.status, "won");
  assert.equal(won.state.hasWon, true);
  assert.equal(hasWinningTile(won.state.board), true);

  const continued = continueGame(won.state);
  assert.equal(continued.status, "playing");

  const nextMove = playMove(continued, "right", firstEmptySpawner());
  assert.equal(nextMove.state.hasWon, true);
  assert.notEqual(nextMove.state.status, "won");
});

test("detects game over only when no valid move remains", () => {
  const lockedBoard = boardFromRows([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ]);
  const mergeAvailable = [...lockedBoard];
  mergeAvailable[15] = 4;

  assert.equal(canMove(lockedBoard), false);
  assert.equal(canMove(mergeAvailable), true);
  assert.equal(
    canMove([
      ...lockedBoard.slice(0, 15),
      null,
    ]),
    true,
  );

  const result = playMove(
    {
      board: lockedBoard,
      score: 100,
      status: "playing",
      hasWon: false,
    },
    "left",
    firstEmptySpawner(),
  );
  assert.equal(result.moved, false);
  assert.equal(result.state.status, "game-over");
  assert.equal(result.state.score, 100);
});

test("rejects invalid injected random values and tile spawns", () => {
  const invalidRandomSpawner = createRandomTileSpawner(() => 1);
  assert.throws(() => invalidRandomSpawner([0]), RangeError);

  const state = {
    board: boardFromRows([
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]),
    score: 0,
    status: "playing",
    hasWon: false,
  };
  assert.throws(
    () => playMove(state, "right", () => ({ index: 3, value: 2 })),
    RangeError,
  );
});
