export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
export type Rotation = 0 | 1 | 2 | 3;
export type RotationDirection = "clockwise" | "counterclockwise";
export type Board = readonly (PieceType | null)[];
export type GameStatus = "ready" | "playing" | "paused" | "game-over";
export type LastAction = "move" | "rotate" | "soft-drop" | "hard-drop" | null;
export type SpinType = "none" | "mini" | "full";

export interface Position {
  x: number;
  y: number;
}

export interface ActivePiece extends Position {
  type: PieceType;
  rotation: Rotation;
}

export interface TetrisState {
  board: Board;
  activePiece: ActivePiece | null;
  holdPiece: PieceType | null;
  holdUsed: boolean;
  nextPieces: readonly PieceType[];
  randomState: number;
  score: number;
  lines: number;
  level: number;
  combo: number;
  backToBack: boolean;
  status: GameStatus;
  gravityAccumulatorMs: number;
  lockElapsedMs: number;
  lockResets: number;
  lastAction: LastAction;
  lastRotationKick: number | null;
}

export interface LineClearResult {
  board: Board;
  cleared: number;
}

export interface RotationResult {
  piece: ActivePiece;
  kickIndex: number;
}

