export const BOARD_SIZE = 8;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

export type Player = "black" | "white";
export type Cell = Player | null;
export type Board = readonly Cell[];
export type Winner = Player | "draw" | null;
export type GameStatus = "playing" | "finished" | "resigned";

export interface OthelloMove {
  index: number;
  row: number;
  column: number;
  flips: readonly number[];
}

export interface OthelloScore {
  black: number;
  white: number;
  empty: number;
}

export interface OthelloGameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Winner;
  lastMove: number | null;
  moveNumber: number;
}

export interface MoveResult {
  state: OthelloGameState;
  passedPlayer: Player | null;
}
