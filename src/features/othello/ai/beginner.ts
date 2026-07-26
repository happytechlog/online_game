import { getLegalMoves } from "../engine/board.ts";
import type { Board, Player } from "../engine/types.ts";

export function chooseBeginnerMove(
  board: Board,
  player: Player,
  random: () => number = Math.random,
): number | null {
  const moves = getLegalMoves(board, player);
  if (moves.length === 0) return null;

  const randomIndex = Math.min(
    moves.length - 1,
    Math.floor(Math.max(0, random()) * moves.length),
  );
  return moves[randomIndex].index;
}
