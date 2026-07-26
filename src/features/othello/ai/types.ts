import type { Board, Player } from "../engine/types.ts";

export type AiDifficulty = "beginner" | "intermediate" | "advanced";

export interface AdvancedSearchOptions {
  maxDepth?: number;
  timeLimitMs?: number;
}

export interface AdvancedSearchResult {
  move: number | null;
  completedDepth: number;
  timedOut: boolean;
}

export interface AiWorkerRequest {
  id: number;
  board: Board;
  player: Player;
  options?: AdvancedSearchOptions;
}

export interface AiWorkerResponse extends AdvancedSearchResult {
  id: number;
}
