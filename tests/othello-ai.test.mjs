import assert from "node:assert/strict";
import test from "node:test";
import {
  CELL_COUNT,
  chooseBeginnerMove,
  chooseIntermediateMove,
  createInitialBoard,
  findAdvancedMove,
  getLegalMoves,
} from "../src/features/othello/index.ts";

test("beginner AI chooses a legal move using injected randomness", () => {
  const board = createInitialBoard();
  const legalMoves = getLegalMoves(board, "black");

  assert.equal(chooseBeginnerMove(board, "black", () => 0), legalMoves[0].index);
  assert.equal(
    chooseBeginnerMove(board, "black", () => 0.999),
    legalMoves.at(-1).index,
  );
});

test("intermediate AI prioritizes an available corner", () => {
  const board = Array(CELL_COUNT).fill(null);
  board[1] = "white";
  board[2] = "black";
  board[8] = "white";
  board[16] = "black";

  assert.equal(chooseIntermediateMove(board, "black"), 0);
});

test("advanced AI returns a legal opening move after bounded search", () => {
  const board = createInitialBoard();
  const legalMoveIndexes = new Set(
    getLegalMoves(board, "black").map((move) => move.index),
  );
  const result = findAdvancedMove(board, "black", {
    maxDepth: 3,
    timeLimitMs: 1_000,
  });

  assert.ok(result.move !== null);
  assert.ok(legalMoveIndexes.has(result.move));
  assert.ok(result.completedDepth >= 1);
});

test("advanced AI keeps a safe legal fallback when its deadline expires", () => {
  const board = createInitialBoard();
  const legalMoveIndexes = new Set(
    getLegalMoves(board, "black").map((move) => move.index),
  );
  const result = findAdvancedMove(board, "black", {
    maxDepth: 12,
    timeLimitMs: 1,
  });

  assert.ok(result.move !== null);
  assert.ok(legalMoveIndexes.has(result.move));
});

test("all AI levels return null when no move is legal", () => {
  const board = Array(CELL_COUNT).fill("black");

  assert.equal(chooseBeginnerMove(board, "white"), null);
  assert.equal(chooseIntermediateMove(board, "white"), null);
  assert.equal(findAdvancedMove(board, "white").move, null);
});
