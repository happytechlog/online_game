import { PIECE_TYPES } from "./pieces.ts";
import type { PieceType } from "./types.ts";

export interface RefilledQueue {
  pieces: readonly PieceType[];
  randomState: number;
}

function nextRandom(state: number): { value: number; state: number } {
  let next = state >>> 0;
  if (next === 0) next = 0x6d2b79f5;

  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;

  return { value: next / 0x100000000, state: next };
}

export function refillPieceQueue(
  pieces: readonly PieceType[],
  randomState: number,
  minimumSize = 7,
): RefilledQueue {
  const nextPieces = [...pieces];
  let state = randomState >>> 0;

  while (nextPieces.length < minimumSize) {
    const bag = [...PIECE_TYPES];

    for (let index = bag.length - 1; index > 0; index -= 1) {
      const random = nextRandom(state);
      state = random.state;
      const swapIndex = Math.floor(random.value * (index + 1));
      [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
    }

    nextPieces.push(...bag);
  }

  return { pieces: nextPieces, randomState: state };
}
