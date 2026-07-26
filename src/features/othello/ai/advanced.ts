import {
  getLegalMoves,
  getOpponent,
  getScore,
  placeDisc,
} from "../engine/board.ts";
import type { Board, Player } from "../engine/types.ts";
import { evaluateBoard, rankMoves } from "./evaluation.ts";
import { chooseIntermediateMove } from "./intermediate.ts";
import type {
  AdvancedSearchOptions,
  AdvancedSearchResult,
} from "./types.ts";

class SearchTimeout extends Error {}

interface SearchContext {
  deadline: number;
  perspective: Player;
}

function terminalScore(board: Board, perspective: Player): number {
  const score = getScore(board);
  const difference =
    perspective === "black"
      ? score.black - score.white
      : score.white - score.black;
  return difference * 10_000;
}

function minimax(
  board: Board,
  player: Player,
  depth: number,
  alpha: number,
  beta: number,
  context: SearchContext,
): number {
  if (Date.now() >= context.deadline) throw new SearchTimeout();

  const moves = getLegalMoves(board, player);
  const opponent = getOpponent(player);
  const opponentMoves =
    moves.length === 0 ? getLegalMoves(board, opponent) : [];

  if (moves.length === 0 && opponentMoves.length === 0) {
    return terminalScore(board, context.perspective);
  }
  if (depth === 0) return evaluateBoard(board, context.perspective);
  if (moves.length === 0) {
    return minimax(
      board,
      opponent,
      depth - 1,
      alpha,
      beta,
      context,
    );
  }

  const maximizing = player === context.perspective;
  let bestScore = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

  for (const move of rankMoves(board, player)) {
    const nextBoard = placeDisc(board, move, player);
    const score = minimax(
      nextBoard,
      opponent,
      depth - 1,
      alpha,
      beta,
      context,
    );

    if (maximizing) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) break;
  }

  return bestScore;
}

function searchDepth(
  board: Board,
  player: Player,
  depth: number,
  context: SearchContext,
): number | null {
  let bestMove: number | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  const opponent = getOpponent(player);

  for (const move of rankMoves(board, player)) {
    if (Date.now() >= context.deadline) throw new SearchTimeout();
    const nextBoard = placeDisc(board, move, player);
    const score = minimax(
      nextBoard,
      opponent,
      depth - 1,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      context,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMove = move.index;
    }
  }

  return bestMove;
}

export function findAdvancedMove(
  board: Board,
  player: Player,
  options: AdvancedSearchOptions = {},
): AdvancedSearchResult {
  const fallback = chooseIntermediateMove(board, player);
  if (fallback === null) {
    return { move: null, completedDepth: 0, timedOut: false };
  }

  const emptyCount = getScore(board).empty;
  const requestedDepth = options.maxDepth ?? 5;
  const maxDepth =
    emptyCount <= 14
      ? Math.max(requestedDepth, Math.min(12, emptyCount))
      : requestedDepth;
  const context: SearchContext = {
    deadline: Date.now() + Math.max(1, options.timeLimitMs ?? 900),
    perspective: player,
  };

  let move = fallback;
  let completedDepth = 0;
  let timedOut = false;

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    try {
      const depthMove = searchDepth(board, player, depth, context);
      if (depthMove !== null) move = depthMove;
      completedDepth = depth;
    } catch (error) {
      if (!(error instanceof SearchTimeout)) throw error;
      timedOut = true;
      break;
    }
  }

  return { move, completedDepth, timedOut };
}
