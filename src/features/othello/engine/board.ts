import {
  BOARD_SIZE,
  CELL_COUNT,
  type Board,
  type Cell,
  type OthelloMove,
  type OthelloScore,
  type Player,
} from "./types.ts";

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

export function createInitialBoard(): Board {
  const board: Cell[] = Array<Cell>(CELL_COUNT).fill(null);
  board[toIndex(3, 3)] = "white";
  board[toIndex(3, 4)] = "black";
  board[toIndex(4, 3)] = "black";
  board[toIndex(4, 4)] = "white";
  return board;
}

export function toIndex(row: number, column: number): number {
  return row * BOARD_SIZE + column;
}

export function toCoordinate(index: number) {
  return {
    row: Math.floor(index / BOARD_SIZE),
    column: index % BOARD_SIZE,
  };
}

export function isInsideBoard(row: number, column: number): boolean {
  return (
    row >= 0 &&
    row < BOARD_SIZE &&
    column >= 0 &&
    column < BOARD_SIZE
  );
}

export function getOpponent(player: Player): Player {
  return player === "black" ? "white" : "black";
}

export function getFlips(
  board: Board,
  index: number,
  player: Player,
): readonly number[] {
  if (board.length !== CELL_COUNT || board[index] !== null) return [];

  const { row, column } = toCoordinate(index);
  const opponent = getOpponent(player);
  const flips: number[] = [];

  for (const [rowDelta, columnDelta] of DIRECTIONS) {
    let nextRow = row + rowDelta;
    let nextColumn = column + columnDelta;
    const line: number[] = [];

    while (
      isInsideBoard(nextRow, nextColumn) &&
      board[toIndex(nextRow, nextColumn)] === opponent
    ) {
      line.push(toIndex(nextRow, nextColumn));
      nextRow += rowDelta;
      nextColumn += columnDelta;
    }

    if (
      line.length > 0 &&
      isInsideBoard(nextRow, nextColumn) &&
      board[toIndex(nextRow, nextColumn)] === player
    ) {
      flips.push(...line);
    }
  }

  return flips;
}

export function getLegalMoves(
  board: Board,
  player: Player,
): readonly OthelloMove[] {
  if (board.length !== CELL_COUNT) return [];

  const moves: OthelloMove[] = [];
  for (let index = 0; index < CELL_COUNT; index += 1) {
    const flips = getFlips(board, index, player);
    if (flips.length === 0) continue;

    const { row, column } = toCoordinate(index);
    moves.push({ index, row, column, flips });
  }
  return moves;
}

export function placeDisc(
  board: Board,
  move: OthelloMove,
  player: Player,
): Board {
  const nextBoard = [...board];
  nextBoard[move.index] = player;
  for (const index of move.flips) {
    nextBoard[index] = player;
  }
  return nextBoard;
}

export function getScore(board: Board): OthelloScore {
  return board.reduce<OthelloScore>(
    (score, cell) => {
      if (cell === "black") score.black += 1;
      else if (cell === "white") score.white += 1;
      else score.empty += 1;
      return score;
    },
    { black: 0, white: 0, empty: 0 },
  );
}
