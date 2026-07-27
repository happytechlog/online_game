import type { Game2048State } from "../engine/index.ts";

export interface Saved2048Game {
  version: 1;
  savedAt: string;
  game: Game2048State;
}

export interface Best2048Score {
  version: 1;
  score: number;
}
