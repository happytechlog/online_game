import {
  getLegalMoves,
  getOpponent,
  getScore,
  placeDisc,
} from "../engine/board.ts";
import type { Board, OthelloMove, Player } from "../engine/types.ts";

const POSITION_WEIGHTS = [
  120, -24, 20, 8, 8, 20, -24, 120,
  -24, -48, -4, -3, -3, -4, -48, -24,
  20, -4, 14, 4, 4, 14, -4, 20,
  8, -3, 4, 3, 3, 4, -3, 8,
  8, -3, 4, 3, 3, 4, -3, 8,
  20, -4, 14, 4, 4, 14, -4, 20,
  -24, -48, -4, -3, -3, -4, -48, -24,
  120, -24, 20, 8, 8, 20, -24, 120,
] as const;

const CORNER_NEIGHBORS = [
  { corner: 0, adjacent: [1, 8, 9] },
  { corner: 7, adjacent: [6, 14, 15] },
  { corner: 56, adjacent: [48, 49, 57] },
  { corner: 63, adjacent: [54, 55, 62] },
] as const;

export function evaluateBoard(board: Board, perspective: Player): number {
  const opponent = getOpponent(perspective);
  const score = getScore(board);
  const occupied = 64 - score.empty;
  let positionalScore = 0;

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] === perspective) positionalScore += POSITION_WEIGHTS[index];
    else if (board[index] === opponent) {
      positionalScore -= POSITION_WEIGHTS[index];
    }
  }

  let emptyCornerAdjacency = 0;
  for (const { corner, adjacent } of CORNER_NEIGHBORS) {
    if (board[corner] !== null) continue;
    for (const index of adjacent) {
      if (board[index] === perspective) emptyCornerAdjacency -= 36;
      else if (board[index] === opponent) emptyCornerAdjacency += 36;
    }
  }

  const ownMobility = getLegalMoves(board, perspective).length;
  const opponentMobility = getLegalMoves(board, opponent).length;
  const mobilityScore = (ownMobility - opponentMobility) * 9;
  const discDifference =
    perspective === "black"
      ? score.black - score.white
      : score.white - score.black;
  const discWeight = occupied < 20 ? 0.5 : occupied < 52 ? 2 : 10;

  return (
    positionalScore +
    emptyCornerAdjacency +
    mobilityScore +
    discDifference * discWeight
  );
}

export function rankMoves(
  board: Board,
  player: Player,
): readonly OthelloMove[] {
  return [...getLegalMoves(board, player)].sort((left, right) => {
    const leftBoard = placeDisc(board, left, player);
    const rightBoard = placeDisc(board, right, player);
    const scoreDifference =
      evaluateBoard(rightBoard, player) - evaluateBoard(leftBoard, player);
    return scoreDifference || left.index - right.index;
  });
}
