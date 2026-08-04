export type MinesweeperPreset = "beginner" | "intermediate" | "advanced";
export type CellMark = "covered" | "flagged" | "questioned";
export type GamePhase = "ready" | "playing" | "won" | "lost";

export interface MinesweeperCell {
  mine: boolean;
  adjacent: number;
  revealed: boolean;
  mark: CellMark;
}

export interface MinesweeperGameState {
  preset: MinesweeperPreset;
  rows: number;
  columns: number;
  mineCount: number;
  cells: MinesweeperCell[];
  generated: boolean;
  phase: GamePhase;
  explodedIndex: number | null;
}

export interface MinesweeperPresetConfig {
  rows: number;
  columns: number;
  mineCount: number;
}

export interface CreateMinesweeperGameOptions {
  /** Test-only deterministic layout. It must contain exactly the preset's mine count. */
  mineIndexes?: readonly number[];
  rng?: () => number;
}

export type Direction = "up" | "down" | "left" | "right";
