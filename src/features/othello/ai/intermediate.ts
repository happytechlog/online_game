import type { Board, Player } from "../engine/types.ts";
import { rankMoves } from "./evaluation.ts";

export function chooseIntermediateMove(
  board: Board,
  player: Player,
): number | null {
  return rankMoves(board, player)[0]?.index ?? null;
}
