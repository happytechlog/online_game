import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  HARD_DROP_POINTS_PER_CELL,
  HIDDEN_ROWS,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
  SOFT_DROP_POINTS_PER_CELL,
} from "./config.ts";
import {
  canPlacePiece,
  clearFullRows,
  createEmptyBoard,
  getLandingPiece,
  isTopOut,
  lockPiece,
  movePiece,
  rotatePiece,
} from "./board.ts";
import { getGravityIntervalMs } from "./gravity.ts";
import { createSpawnPiece, getPieceCells } from "./pieces.ts";
import { refillPieceQueue } from "./queue.ts";
import { scoreClear } from "./scoring.ts";
import type {
  ActivePiece,
  Board,
  PieceType,
  Position,
  RotationDirection,
  SpinType,
  TetrisState,
} from "./types.ts";

const QUEUE_PREVIEW_SIZE = 14;

function createBaseState(seed: number): TetrisState {
  return {
    board: createEmptyBoard(),
    activePiece: null,
    holdPiece: null,
    holdUsed: false,
    nextPieces: [],
    randomState: seed >>> 0,
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    backToBack: false,
    status: "playing",
    gravityAccumulatorMs: 0,
    lockElapsedMs: 0,
    lockResets: 0,
    lastAction: null,
    lastRotationKick: null,
  };
}

function spawnPiece(
  state: TetrisState,
  type: PieceType,
  holdUsed = false,
): TetrisState {
  const activePiece = createSpawnPiece(type);
  if (!canPlacePiece(state.board, activePiece)) {
    return { ...state, activePiece: null, holdUsed, status: "game-over" };
  }

  return {
    ...state,
    activePiece,
    holdUsed,
    gravityAccumulatorMs: 0,
    lockElapsedMs: 0,
    lockResets: 0,
    lastAction: null,
    lastRotationKick: null,
  };
}

function spawnNextPiece(state: TetrisState, holdUsed = false): TetrisState {
  const filledQueue = refillPieceQueue(
    state.nextPieces,
    state.randomState,
    QUEUE_PREVIEW_SIZE,
  );
  const type = filledQueue.pieces[0];
  if (!type) throw new RangeError("Cannot draw from an empty piece queue.");

  return spawnPiece({
    ...state,
    nextPieces: filledQueue.pieces.slice(1),
    randomState: filledQueue.randomState,
  }, type, holdUsed);
}

export function createGame(seed: number): TetrisState {
  if (!Number.isFinite(seed) || !Number.isInteger(seed)) {
    throw new RangeError("Game seed must be a finite integer.");
  }

  return spawnNextPiece(createBaseState(seed));
}

function isOccupied(board: Board, position: Position): boolean {
  return position.x < 0 ||
    position.x >= BOARD_WIDTH ||
    position.y < 0 ||
    position.y >= BOARD_HEIGHT ||
    board[position.y * BOARD_WIDTH + position.x] !== null;
}

function detectTSpin(
  board: Board,
  piece: ActivePiece,
  lastAction: TetrisState["lastAction"],
  kickIndex: number | null,
): SpinType {
  if (piece.type !== "T" || (lastAction !== "rotate" && lastAction !== "hard-drop")) {
    return "none";
  }

  const pivot = { x: piece.x + 1, y: piece.y + 1 };
  const corners = [
    { x: pivot.x - 1, y: pivot.y - 1 },
    { x: pivot.x + 1, y: pivot.y - 1 },
    { x: pivot.x - 1, y: pivot.y + 1 },
    { x: pivot.x + 1, y: pivot.y + 1 },
  ];
  if (corners.filter((corner) => isOccupied(board, corner)).length < 3) {
    return "none";
  }

  const frontCorners: Record<ActivePiece["rotation"], readonly number[]> = {
    0: [0, 1],
    1: [1, 3],
    2: [2, 3],
    3: [0, 2],
  };
  const frontIsOccupied = frontCorners[piece.rotation]
    .every((index) => isOccupied(board, corners[index]));

  return frontIsOccupied || kickIndex === 4 ? "full" : "mini";
}

function applyManipulation(
  state: TetrisState,
  previousPiece: ActivePiece,
  piece: ActivePiece,
  action: "move" | "rotate",
  kickIndex: number | null,
): TetrisState {
  const wasGrounded = !movePiece(state.board, previousPiece, 0, 1);
  const canResetLock = wasGrounded && state.lockResets < MAX_LOCK_RESETS;

  return {
    ...state,
    activePiece: piece,
    lastAction: action,
    lastRotationKick: action === "rotate" ? kickIndex : null,
    lockElapsedMs: canResetLock ? 0 : state.lockElapsedMs,
    lockResets: canResetLock ? state.lockResets + 1 : state.lockResets,
  };
}

function lockActivePiece(state: TetrisState): TetrisState {
  const piece = state.activePiece;
  if (!piece) return state;

  const lockedBoard = lockPiece(state.board, piece);
  const spin = detectTSpin(
    lockedBoard,
    piece,
    state.lastAction,
    state.lastRotationKick,
  );
  const { board, cleared } = clearFullRows(lockedBoard);
  const scored = scoreClear({
    clearedLines: cleared,
    spin,
    level: state.level,
    combo: state.combo,
    backToBack: state.backToBack,
  });
  const lines = state.lines + cleared;
  const afterLock: TetrisState = {
    ...state,
    board,
    activePiece: null,
    score: state.score + scored.points,
    lines,
    level: Math.floor(lines / 10) + 1,
    combo: scored.combo,
    backToBack: scored.backToBack,
    gravityAccumulatorMs: 0,
    lockElapsedMs: 0,
    lockResets: 0,
    lastAction: null,
    lastRotationKick: null,
  };

  if (isTopOut(board)) return { ...afterLock, status: "game-over" };
  return spawnNextPiece(afterLock);
}

export function moveActivePiece(state: TetrisState, dx: -1 | 1): TetrisState {
  if (state.status !== "playing" || !state.activePiece) return state;
  const previousPiece = state.activePiece;
  const moved = movePiece(state.board, previousPiece, dx, 0);
  return moved
    ? applyManipulation(state, previousPiece, moved, "move", null)
    : state;
}

export function rotateActivePiece(
  state: TetrisState,
  direction: RotationDirection,
): TetrisState {
  if (state.status !== "playing" || !state.activePiece) return state;
  const previousPiece = state.activePiece;
  const result = rotatePiece(state.board, previousPiece, direction);
  return result
    ? applyManipulation(
        state,
        previousPiece,
        result.piece,
        "rotate",
        result.kickIndex,
      )
    : state;
}

export function softDrop(state: TetrisState): TetrisState {
  if (state.status !== "playing" || !state.activePiece) return state;
  const dropped = movePiece(state.board, state.activePiece, 0, 1);
  if (!dropped) return state;

  return {
    ...state,
    activePiece: dropped,
    score: state.score + SOFT_DROP_POINTS_PER_CELL,
    gravityAccumulatorMs: 0,
    lastAction: "soft-drop",
    lastRotationKick: null,
  };
}

export function hardDrop(state: TetrisState): TetrisState {
  if (state.status !== "playing" || !state.activePiece) return state;
  const landing = getLandingPiece(state.board, state.activePiece);
  const distance = landing.y - state.activePiece.y;
  return lockActivePiece({
    ...state,
    activePiece: landing,
    score: state.score + distance * HARD_DROP_POINTS_PER_CELL,
    lastAction: "hard-drop",
  });
}

export function holdActivePiece(state: TetrisState): TetrisState {
  if (state.status !== "playing" || !state.activePiece || state.holdUsed) {
    return state;
  }

  const activeType = state.activePiece.type;
  const heldType = state.holdPiece;

  if (!heldType) {
    return spawnNextPiece({
      ...state,
      holdPiece: activeType,
      holdUsed: true,
    }, true);
  }

  return spawnPiece({
    ...state,
    holdPiece: activeType,
  }, heldType, true);
}

export function pauseGame(state: TetrisState): TetrisState {
  return state.status === "playing" ? { ...state, status: "paused" } : state;
}

export function resumeGame(state: TetrisState): TetrisState {
  return state.status === "paused" ? { ...state, status: "playing" } : state;
}

export function advanceGame(state: TetrisState, elapsedMs: number): TetrisState {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError("Elapsed time must be a finite non-negative number.");
  }
  if (state.status !== "playing" || !state.activePiece || elapsedMs === 0) {
    return state;
  }

  let remainingMs = elapsedMs;
  let nextState = state;

  while (remainingMs > 0 && nextState.status === "playing" && nextState.activePiece) {
    const piece = nextState.activePiece;
    const grounded = !movePiece(nextState.board, piece, 0, 1);

    if (grounded) {
      const timeToLock = Math.max(0, LOCK_DELAY_MS - nextState.lockElapsedMs);
      const elapsed = Math.min(remainingMs, timeToLock);
      nextState = { ...nextState, lockElapsedMs: nextState.lockElapsedMs + elapsed };
      remainingMs -= elapsed;
      if (nextState.lockElapsedMs >= LOCK_DELAY_MS) {
        nextState = lockActivePiece(nextState);
      }
      continue;
    }

    const gravityIntervalMs = getGravityIntervalMs(nextState.level);
    const timeToFall = Math.max(
      0,
      gravityIntervalMs - nextState.gravityAccumulatorMs,
    );

    if (remainingMs < timeToFall) {
      nextState = {
        ...nextState,
        gravityAccumulatorMs: nextState.gravityAccumulatorMs + remainingMs,
      };
      remainingMs = 0;
      continue;
    }

    remainingMs -= timeToFall;
    const fallen = movePiece(nextState.board, piece, 0, 1);
    nextState = fallen
      ? {
          ...nextState,
          activePiece: fallen,
          gravityAccumulatorMs: 0,
        }
      : { ...nextState, gravityAccumulatorMs: 0 };
  }

  return nextState;
}

export function getGhostPiece(state: TetrisState): ActivePiece | null {
  if (!state.activePiece) return null;
  return getLandingPiece(state.board, state.activePiece);
}




