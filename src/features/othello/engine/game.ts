import {
  createInitialBoard,
  getLegalMoves,
  getOpponent,
  getScore,
  placeDisc,
} from "./board.ts";
import type {
  MoveResult,
  OthelloGameState,
  Player,
  Winner,
} from "./types.ts";

export function createInitialGame(): OthelloGameState {
  return {
    board: createInitialBoard(),
    currentPlayer: "black",
    status: "playing",
    winner: null,
    lastMove: null,
    moveNumber: 0,
  };
}

export function getWinner(state: Pick<OthelloGameState, "board">): Winner {
  const score = getScore(state.board);
  if (score.black === score.white) return "draw";
  return score.black > score.white ? "black" : "white";
}

export function playMove(
  state: OthelloGameState,
  index: number,
): MoveResult | null {
  if (state.status !== "playing") return null;

  const move = getLegalMoves(state.board, state.currentPlayer).find(
    (candidate) => candidate.index === index,
  );
  if (!move) return null;

  const board = placeDisc(state.board, move, state.currentPlayer);
  const opponent = getOpponent(state.currentPlayer);
  const opponentMoves = getLegalMoves(board, opponent);

  if (opponentMoves.length > 0) {
    return {
      state: {
        ...state,
        board,
        currentPlayer: opponent,
        lastMove: index,
        moveNumber: state.moveNumber + 1,
      },
      passedPlayer: null,
    };
  }

  const currentPlayerMoves = getLegalMoves(board, state.currentPlayer);
  if (currentPlayerMoves.length > 0) {
    return {
      state: {
        ...state,
        board,
        lastMove: index,
        moveNumber: state.moveNumber + 1,
      },
      passedPlayer: opponent,
    };
  }

  const finishedState: OthelloGameState = {
    ...state,
    board,
    status: "finished",
    winner: null,
    lastMove: index,
    moveNumber: state.moveNumber + 1,
  };

  return {
    state: { ...finishedState, winner: getWinner(finishedState) },
    passedPlayer: null,
  };
}

export function resignGame(
  state: OthelloGameState,
  player: Player = state.currentPlayer,
): OthelloGameState {
  if (state.status !== "playing") return state;

  return {
    ...state,
    status: "resigned",
    winner: getOpponent(player),
  };
}
