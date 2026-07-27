export const BOARD_SIZE = 4;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
export const WINNING_TILE = 2048;

export type Tile = number | null;
export type Board = readonly Tile[];
export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "playing" | "won" | "game-over";
export type SpawnValue = 2 | 4;

export interface TileSpawn {
  index: number;
  value: SpawnValue;
}

export type TileSpawner = (
  emptyIndices: readonly number[],
) => TileSpawn;

export interface MoveBoardResult {
  board: Board;
  scoreGained: number;
  moved: boolean;
}

export interface Game2048State {
  board: Board;
  score: number;
  status: GameStatus;
  hasWon: boolean;
}

export interface PlayMoveResult {
  state: Game2048State;
  moved: boolean;
  spawnedTile: TileSpawn | null;
}
