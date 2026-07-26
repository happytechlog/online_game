import assert from "node:assert/strict";
import test from "node:test";
import {
  CELL_COUNT,
  createInitialGame,
  getFlips,
  getLegalMoves,
  getScore,
  playMove,
  resignGame,
  toIndex,
} from "../src/features/othello/engine/index.ts";

test("creates the standard opening position with black to move", () => {
  const state = createInitialGame();

  assert.equal(state.board.length, 64);
  assert.deepEqual(getScore(state.board), { black: 2, white: 2, empty: 60 });
  assert.equal(state.currentPlayer, "black");
  assert.deepEqual(
    getLegalMoves(state.board, "black").map((move) => move.index),
    [19, 26, 37, 44],
  );
});

test("finds bracketed discs in all eight directions", () => {
  const board = Array(CELL_COUNT).fill(null);
  const center = toIndex(3, 3);
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [rowDelta, columnDelta] of directions) {
    board[toIndex(3 + rowDelta, 3 + columnDelta)] = "white";
    board[toIndex(3 + rowDelta * 2, 3 + columnDelta * 2)] = "black";
  }

  assert.deepEqual(
    [...getFlips(board, center, "black")].sort((a, b) => a - b),
    directions
      .map(([rowDelta, columnDelta]) =>
        toIndex(3 + rowDelta, 3 + columnDelta),
      )
      .sort((a, b) => a - b),
  );
});

test("applies a legal move immutably and rejects illegal moves", () => {
  const initial = createInitialGame();
  const result = playMove(initial, 19);

  assert.ok(result);
  assert.equal(initial.board[19], null);
  assert.deepEqual(getScore(initial.board), { black: 2, white: 2, empty: 60 });
  assert.equal(result.state.board[19], "black");
  assert.equal(result.state.board[27], "black");
  assert.equal(result.state.currentPlayer, "white");
  assert.equal(result.state.lastMove, 19);
  assert.equal(playMove(initial, 0), null);
});

test("automatically passes a player with no legal move", () => {
  const board = Array(CELL_COUNT).fill("black");
  board[0] = null;
  board[1] = "white";
  board[62] = "white";
  board[63] = null;

  const result = playMove(
    {
      ...createInitialGame(),
      board,
      currentPlayer: "black",
    },
    0,
  );

  assert.ok(result);
  assert.equal(result.passedPlayer, "white");
  assert.equal(result.state.currentPlayer, "black");
  assert.deepEqual(
    getLegalMoves(result.state.board, "black").map((move) => move.index),
    [63],
  );
});

test("finishes a full board and determines the winner", () => {
  const board = Array(CELL_COUNT).fill("black");
  board[0] = null;
  board[1] = "white";

  const result = playMove(
    {
      ...createInitialGame(),
      board,
      currentPlayer: "black",
    },
    0,
  );

  assert.ok(result);
  assert.equal(result.state.status, "finished");
  assert.equal(result.state.winner, "black");
  assert.deepEqual(getScore(result.state.board), {
    black: 64,
    white: 0,
    empty: 0,
  });
});

test("awards a resignation to the opponent", () => {
  const resigned = resignGame(createInitialGame(), "black");

  assert.equal(resigned.status, "resigned");
  assert.equal(resigned.winner, "white");
});
