import {
  addSpawnedTile,
  canMove,
  createEmptyBoard,
  hasWinningTile,
  moveBoard,
} from "./board.ts";
import type {
  Direction,
  Game2048State,
  PlayMoveResult,
  TileSpawner,
} from "./types.ts";

export function createInitialGame(
  spawner: TileSpawner,
): Game2048State {
  const firstSpawn = addSpawnedTile(createEmptyBoard(), spawner);
  const secondSpawn = addSpawnedTile(firstSpawn.board, spawner);

  return {
    board: secondSpawn.board,
    score: 0,
    status: "playing",
    hasWon: false,
  };
}

export function playMove(
  state: Game2048State,
  direction: Direction,
  spawner: TileSpawner,
): PlayMoveResult {
  if (state.status !== "playing") {
    return { state, moved: false, spawnedTile: null };
  }

  const move = moveBoard(state.board, direction);
  if (!move.moved) {
    const nextState = canMove(state.board)
      ? state
      : { ...state, status: "game-over" as const };
    return { state: nextState, moved: false, spawnedTile: null };
  }

  const spawn = addSpawnedTile(move.board, spawner);
  const hasWon = state.hasWon || hasWinningTile(spawn.board);
  const wonNow = !state.hasWon && hasWon;
  const status = wonNow
    ? "won"
    : canMove(spawn.board)
      ? "playing"
      : "game-over";

  return {
    state: {
      board: spawn.board,
      score: state.score + move.scoreGained,
      status,
      hasWon,
    },
    moved: true,
    spawnedTile: spawn.spawnedTile,
  };
}

export function continueGame(state: Game2048State): Game2048State {
  if (state.status !== "won") return state;

  return {
    ...state,
    status: canMove(state.board) ? "playing" : "game-over",
  };
}
