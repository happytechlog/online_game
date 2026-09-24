import { BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS } from "./config.ts";
import { getPieceCells, nextRotation } from "./pieces.ts";
import type {
  ActivePiece,
  Board,
  LineClearResult,
  PieceType,
  RotationDirection,
  RotationResult,
} from "./types.ts";

type Kick = readonly [number, number];

const ZERO_KICK: Kick = [0, 0];

const JLSTZ_KICKS: Readonly<Record<string, readonly Kick[]>> = {
  "0>1": [ZERO_KICK, [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "1>0": [ZERO_KICK, [1, 0], [1, 1], [0, -2], [1, -2]],
  "1>2": [ZERO_KICK, [1, 0], [1, 1], [0, -2], [1, -2]],
  "2>1": [ZERO_KICK, [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "2>3": [ZERO_KICK, [1, 0], [1, -1], [0, 2], [1, 2]],
  "3>2": [ZERO_KICK, [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "3>0": [ZERO_KICK, [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "0>3": [ZERO_KICK, [1, 0], [1, -1], [0, 2], [1, 2]],
};

const I_KICKS: Readonly<Record<string, readonly Kick[]>> = {
  "0>1": [ZERO_KICK, [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "1>0": [ZERO_KICK, [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "1>2": [ZERO_KICK, [-1, 0], [2, 0], [-1, 2], [2, -1]],
  "2>1": [ZERO_KICK, [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "2>3": [ZERO_KICK, [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "3>2": [ZERO_KICK, [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "3>0": [ZERO_KICK, [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "0>3": [ZERO_KICK, [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

export function createEmptyBoard(): Board {
  return Array<PieceType | null>(BOARD_WIDTH * BOARD_HEIGHT).fill(null);
}

export function canPlacePiece(board: Board, piece: ActivePiece): boolean {
  return getPieceCells(piece).every(({ x, y }) =>
    x >= 0 &&
    x < BOARD_WIDTH &&
    y >= 0 &&
    y < BOARD_HEIGHT &&
    board[y * BOARD_WIDTH + x] === null,
  );
}

export function movePiece(
  board: Board,
  piece: ActivePiece,
  dx: number,
  dy: number,
): ActivePiece | null {
  const moved = { ...piece, x: piece.x + dx, y: piece.y + dy };
  return canPlacePiece(board, moved) ? moved : null;
}

export function rotatePiece(
  board: Board,
  piece: ActivePiece,
  direction: RotationDirection,
): RotationResult | null {
  const rotation = nextRotation(piece.rotation, direction);
  const transition = `${piece.rotation}>${rotation}`;
  const kicks = piece.type === "I"
    ? I_KICKS[transition]
    : piece.type === "O"
      ? [ZERO_KICK]
      : JLSTZ_KICKS[transition];

  for (let kickIndex = 0; kickIndex < kicks.length; kickIndex += 1) {
    const [dx, dy] = kicks[kickIndex];
    const candidate = { ...piece, x: piece.x + dx, y: piece.y + dy, rotation };
    if (canPlacePiece(board, candidate)) return { piece: candidate, kickIndex };
  }

  return null;
}

export function getLandingPiece(board: Board, piece: ActivePiece): ActivePiece {
  let landing = piece;

  while (true) {
    const next = movePiece(board, landing, 0, 1);
    if (!next) return landing;
    landing = next;
  }
}

export function lockPiece(board: Board, piece: ActivePiece): Board {
  if (!canPlacePiece(board, piece)) {
    throw new RangeError("Cannot lock a piece in an invalid position.");
  }

  const nextBoard = [...board];
  for (const { x, y } of getPieceCells(piece)) {
    nextBoard[y * BOARD_WIDTH + x] = piece.type;
  }
  return nextBoard;
}

export function clearFullRows(board: Board): LineClearResult {
  const remainingRows: (PieceType | null)[][] = [];
  let cleared = 0;

  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    const row = board.slice(y * BOARD_WIDTH, (y + 1) * BOARD_WIDTH);
    if (row.every((cell) => cell !== null)) {
      cleared += 1;
    } else {
      remainingRows.push([...row]);
    }
  }

  while (remainingRows.length < BOARD_HEIGHT) {
    remainingRows.unshift(Array<PieceType | null>(BOARD_WIDTH).fill(null));
  }

  return { board: remainingRows.flat(), cleared };
}

export function isTopOut(board: Board): boolean {
  for (let index = 0; index < BOARD_WIDTH * HIDDEN_ROWS; index += 1) {
    if (board[index] !== null) return true;
  }
  return false;
}

