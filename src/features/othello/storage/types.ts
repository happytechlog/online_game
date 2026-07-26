import type { AiDifficulty } from "../ai/types.ts";
import type {
  OthelloGameState,
  Player,
  Winner,
} from "../engine/types.ts";

export type OthelloGameMode = "local" | "computer";

export interface SavedOthelloGame {
  version: 1;
  savedAt: string;
  sessionId: string;
  mode: OthelloGameMode;
  difficulty: AiDifficulty;
  humanColor: Player;
  history: OthelloGameState[];
}

export interface ResultStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface LocalResultStats {
  played: number;
  blackWins: number;
  whiteWins: number;
  draws: number;
}

export interface OthelloStats {
  version: 1;
  computer: ResultStats;
  local: LocalResultStats;
}

export interface CompletedOthelloGame {
  winner: Winner;
  mode: OthelloGameMode;
  humanColor: Player;
}
