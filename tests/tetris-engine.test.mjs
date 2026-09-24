import assert from "node:assert/strict";
import test from "node:test";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  MAX_LOCK_RESETS,
  advanceGame,
  clearFullRows,
  createEmptyBoard,
  createGame,
  getGravityIntervalMs,
  getLandingPiece,
  hardDrop,
  holdActivePiece,
  lockPiece,
  moveActivePiece,
  movePiece,
  rotateActivePiece,
  rotatePiece,
  scoreClear,
  softDrop,
} from "../src/features/tetris/engine/index.ts";
import { PIECE_TYPES } from "../src/features/tetris/engine/pieces.ts";

function customGame(activePiece, overrides = {}) {
  const { board = createEmptyBoard(), ...stateOverrides } = overrides;
  return {
    ...createGame(12345),
    ...stateOverrides,
    board,
    activePiece,
    status: "playing",
  };
}

test("seeded games reproduce their state and each seven-bag contains every piece", () => {
  const first = createGame(0x12345678);
  const second = createGame(0x12345678);
  const sequence = [first.activePiece.type, ...first.nextPieces];

  assert.deepEqual(first, second);
  assert.equal(sequence.length, 14);
  for (let start = 0; start < sequence.length; start += 7) {
    assert.deepEqual(
      sequence.slice(start, start + 7).sort(),
      [...PIECE_TYPES].sort(),
    );
  }
});

test("SRS rotation uses JLSTZ and I-piece kick tests independently", () => {
  const jltszBoard = [...createEmptyBoard()];
  jltszBoard[7 * BOARD_WIDTH + 4] = "L";
  const tResult = rotatePiece(
    jltszBoard,
    { type: "T", x: 3, y: 5, rotation: 0 },
    "clockwise",
  );
  assert.deepEqual(tResult, {
    piece: { type: "T", x: 2, y: 5, rotation: 1 },
    kickIndex: 1,
  });

  const iBoard = [...createEmptyBoard()];
  iBoard[5 * BOARD_WIDTH + 5] = "J";
  const iResult = rotatePiece(
    iBoard,
    { type: "I", x: 3, y: 5, rotation: 0 },
    "clockwise",
  );
  assert.deepEqual(iResult, {
    piece: { type: "I", x: 1, y: 5, rotation: 1 },
    kickIndex: 1,
  });
});

test("movement rejects wall and floor collisions and finds the legal landing row", () => {
  const board = createEmptyBoard();
  const nearRightWall = { type: "T", x: 7, y: 5, rotation: 0 };
  const onFloor = { type: "T", x: 3, y: BOARD_HEIGHT - 2, rotation: 0 };

  assert.equal(movePiece(board, nearRightWall, 1, 0), null);
  assert.equal(movePiece(board, onFloor, 0, 1), null);
  assert.deepEqual(
    getLandingPiece(board, { type: "T", x: 3, y: 20, rotation: 0 }),
    onFloor,
  );
});

test("locking and clearing a full row settles the remaining board downward", () => {
  const board = [...createEmptyBoard()];
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (x !== 4 && x !== 5) board[(BOARD_HEIGHT - 1) * BOARD_WIDTH + x] = "J";
  }
  board[21 * BOARD_WIDTH] = "L";

  const locked = lockPiece(board, { type: "O", x: 3, y: 22, rotation: 0 });
  const result = clearFullRows(locked);

  assert.equal(result.cleared, 1);
  assert.equal(result.board[22 * BOARD_WIDTH], "L");
  assert.equal(result.board[(BOARD_HEIGHT - 1) * BOARD_WIDTH + 4], "O");
  assert.equal(result.board[(BOARD_HEIGHT - 1) * BOARD_WIDTH + 5], "O");
  assert.equal(result.board[(BOARD_HEIGHT - 1) * BOARD_WIDTH + 3], null);

  const doubleBoard = [...createEmptyBoard()];
  for (let y = BOARD_HEIGHT - 2; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      if (x !== 4 && x !== 5) doubleBoard[y * BOARD_WIDTH + x] = "J";
    }
  }
  const doubleLocked = lockPiece(doubleBoard, {
    type: "O",
    x: 3,
    y: 22,
    rotation: 0,
  });
  const doubleResult = clearFullRows(doubleLocked);
  assert.equal(doubleResult.cleared, 2);
  assert.ok(doubleResult.board.slice(22 * BOARD_WIDTH).every((cell) => cell === null));
});

test("hold can be used once per piece and becomes available after a lock", () => {
  const initial = createGame(2468);
  const firstHold = holdActivePiece(initial);

  assert.equal(firstHold.holdPiece, initial.activePiece.type);
  assert.equal(firstHold.activePiece.type, initial.nextPieces[0]);
  assert.equal(firstHold.holdUsed, true);
  assert.equal(holdActivePiece(firstHold), firstHold);

  const afterLock = hardDrop(firstHold);
  assert.equal(afterLock.holdUsed, false);
  assert.ok(afterLock.activePiece);
  const secondHold = holdActivePiece(afterLock);
  assert.equal(secondHold.holdPiece, afterLock.activePiece.type);
  assert.equal(secondHold.holdUsed, true);
  assert.equal(holdActivePiece(secondHold), secondHold);
});

test("normal and T-Spin clear tables scale by the level", () => {
  for (const [lines, basePoints] of [[1, 100], [2, 300], [3, 500], [4, 800]]) {
    const result = scoreClear({
      clearedLines: lines,
      spin: "none",
      level: 2,
      combo: 0,
      backToBack: false,
    });
    assert.equal(result.basePoints, basePoints * 2);
  }

  for (const [lines, basePoints] of [[0, 100], [1, 200], [2, 400]]) {
    const result = scoreClear({
      clearedLines: lines,
      spin: "mini",
      level: 3,
      combo: 0,
      backToBack: false,
    });
    assert.equal(result.basePoints, basePoints * 3);
  }

  for (const [lines, basePoints] of [[0, 400], [1, 800], [2, 1200], [3, 1600]]) {
    const result = scoreClear({
      clearedLines: lines,
      spin: "full",
      level: 2,
      combo: 0,
      backToBack: false,
    });
    assert.equal(result.basePoints, basePoints * 2);
  }
});

test("combos and back-to-back bonuses continue and break at the agreed cases", () => {
  const firstDifficultClear = scoreClear({
    clearedLines: 4,
    spin: "none",
    level: 2,
    combo: 0,
    backToBack: false,
  });
  assert.equal(firstDifficultClear.points, 1600);
  assert.equal(firstDifficultClear.combo, 1);
  assert.equal(firstDifficultClear.backToBack, true);

  const chainedSpin = scoreClear({
    clearedLines: 1,
    spin: "full",
    level: 2,
    combo: firstDifficultClear.combo,
    backToBack: firstDifficultClear.backToBack,
  });
  assert.equal(chainedSpin.basePoints, 1600);
  assert.equal(chainedSpin.comboPoints, 100);
  assert.equal(chainedSpin.backToBackPoints, 800);
  assert.equal(chainedSpin.points, 2500);
  assert.equal(chainedSpin.combo, 2);

  const ordinaryClear = scoreClear({
    clearedLines: 1,
    spin: "none",
    level: 2,
    combo: chainedSpin.combo,
    backToBack: chainedSpin.backToBack,
  });
  assert.equal(ordinaryClear.points, 400);
  assert.equal(ordinaryClear.backToBack, false);

  const noClear = scoreClear({
    clearedLines: 0,
    spin: "none",
    level: 2,
    combo: ordinaryClear.combo,
    backToBack: true,
  });
  assert.equal(noClear.combo, 0);
  assert.equal(noClear.backToBack, true);
});

test("hard drop only counts a T-Spin after a successful rotation", () => {
  const board = [...createEmptyBoard()];
  board[21 * BOARD_WIDTH + 3] = "J";
  board[23 * BOARD_WIDTH + 3] = "L";
  board[23 * BOARD_WIDTH + 5] = "S";
  const tPiece = { type: "T", x: 3, y: 21, rotation: 0 };

  const ordinaryDrop = hardDrop(customGame(tPiece, { board }));
  assert.equal(ordinaryDrop.score, 0);

  const rotated = rotateActivePiece(customGame(tPiece, { board }), "clockwise");
  assert.equal(rotated.lastAction, "rotate");
  const spinDrop = hardDrop(rotated);
  assert.equal(spinDrop.score, 100);

  const fullBoard = [...board];
  fullBoard[21 * BOARD_WIDTH + 5] = "Z";
  const fullRotation = rotateActivePiece(
    customGame(tPiece, { board: fullBoard }),
    "clockwise",
  );
  assert.equal(hardDrop(fullRotation).score, 400);
});

test("the level rises at each ten-line boundary and gravity caps at level 15", () => {
  const board = [...createEmptyBoard()];
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (x !== 4 && x !== 5) board[(BOARD_HEIGHT - 1) * BOARD_WIDTH + x] = "J";
  }
  const state = customGame(
    { type: "O", x: 3, y: 22, rotation: 0 },
    { board, lines: 9, level: 1 },
  );
  const next = hardDrop(state);

  assert.equal(next.lines, 10);
  assert.equal(next.level, 2);
  assert.equal(next.score, 100);
  const ticksByLevel = [60, 48, 37, 28, 21, 16, 12, 10, 8, 6, 5, 4, 3, 2, 1];
  for (let level = 1; level <= ticksByLevel.length; level += 1) {
    assert.equal(getGravityIntervalMs(level), ticksByLevel[level - 1] * 1000 / 60);
  }
  assert.equal(getGravityIntervalMs(99), getGravityIntervalMs(15));
});

test("lock delay lasts 500ms and grounded movement resets it at most 15 times", () => {
  const piece = { type: "T", x: 3, y: 22, rotation: 0 };
  const state = customGame(piece);
  const almostLocked = advanceGame(state, 499);
  assert.equal(almostLocked.activePiece.type, "T");
  assert.equal(almostLocked.lockElapsedMs, 499);

  const locked = advanceGame(almostLocked, 1);
  assert.ok(locked.activePiece);
  assert.equal(locked.board[23 * BOARD_WIDTH + 3], "T");

  const reset = moveActivePiece(
    customGame(piece, { lockElapsedMs: 400, lockResets: 0 }),
    -1,
  );
  assert.equal(reset.lockElapsedMs, 0);
  assert.equal(reset.lockResets, 1);

  const capped = moveActivePiece(
    customGame(piece, { lockElapsedMs: 400, lockResets: MAX_LOCK_RESETS }),
    -1,
  );
  assert.equal(capped.lockElapsedMs, 400);
  assert.equal(capped.lockResets, MAX_LOCK_RESETS);
});

test("soft drop scores one point per cell and hard drop locks immediately", () => {
  const initial = createGame(9876);
  const softDropped = softDrop(initial);
  assert.equal(softDropped.score, 1);
  assert.equal(softDropped.activePiece.y, initial.activePiece.y + 1);

  const landed = getLandingPiece(softDropped.board, softDropped.activePiece);
  const distance = landed.y - softDropped.activePiece.y;
  const hardDropped = hardDrop(softDropped);
  assert.equal(hardDropped.score, 1 + distance * 2);
  assert.ok(hardDropped.activePiece);
  assert.equal(hardDropped.activePiece.y, 0);
});

test("locking above the visible field ends the run", () => {
  const board = [...createEmptyBoard()];
  board[2 * BOARD_WIDTH + 3] = "J";
  const state = customGame(
    { type: "T", x: 3, y: 0, rotation: 0 },
    { board },
  );
  const next = hardDrop(state);

  assert.equal(next.status, "game-over");
  assert.equal(next.activePiece, null);
  assert.equal(next.board[BOARD_WIDTH + 3], "T");

  const blockedSpawnBoard = [...createEmptyBoard()];
  blockedSpawnBoard[4] = "J";
  const blockedSpawn = customGame(
    { type: "I", x: 3, y: 0, rotation: 0 },
    { board: blockedSpawnBoard, holdPiece: "T" },
  );
  const spawnTopout = holdActivePiece(blockedSpawn);
  assert.equal(spawnTopout.status, "game-over");
  assert.equal(spawnTopout.activePiece, null);
});
