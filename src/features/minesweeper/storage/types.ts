import type { MinesweeperGameState, MinesweeperPreset } from "../engine/types.ts";

export interface SavedMinesweeperGame {
  version: 1;
  savedAt: string;
  elapsedSeconds: number;
  game: MinesweeperGameState;
}

export interface MinesweeperRecords {
  version: 1;
  times: Record<MinesweeperPreset, number | null>;
}
