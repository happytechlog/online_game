import {
  BOARD_SIZE,
  CELL_COUNT,
  WINNING_TILE,
  type Board,
  type Direction,
  type MoveBoardResult,
  type SpawnValue,
  type Tile,
  type TileSpawn,
  type TileSpawner,
} from "./types.ts";

interface MoveLineResult {
  line: readonly Tile[];
  scoreGained: number;
}

function moveLine(line: readonly Tile[]): MoveLineResult {
  const compacted = line.filter((tile): tile is number => tile !== null);
  const merged: Tile[] = [];
  let scoreGained = 0;

  for (let index = 0; index < compacted.length; index += 1) {
    const tile = compacted[index];
    const nextTile = compacted[index + 1];

    if (tile === nextTile) {
      const mergedValue = tile * 2;
      merged.push(mergedValue);
      scoreGained += mergedValue;
      index += 1;
    } else {
      merged.push(tile);
    }
  }

  while (merged.length < BOARD_SIZE) {
    merged.push(null);
  }

  return { line: merged, scoreGained };
}

function getLineIndices(direction: Direction, lineIndex: number): number[] {
  const indices: number[] = [];

  for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
    if (direction === "left") {
      indices.push(lineIndex * BOARD_SIZE + offset);
    } else if (direction === "right") {
      indices.push(lineIndex * BOARD_SIZE + (BOARD_SIZE - 1 - offset));
    } else if (direction === "up") {
      indices.push(offset * BOARD_SIZE + lineIndex);
    } else {
      indices.push((BOARD_SIZE - 1 - offset) * BOARD_SIZE + lineIndex);
    }
  }

  return indices;
}

export function createEmptyBoard(): Board {
  return Array<Tile>(CELL_COUNT).fill(null);
}

export function getEmptyIndices(board: Board): readonly number[] {
  const emptyIndices: number[] = [];

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] === null) emptyIndices.push(index);
  }

  return emptyIndices;
}

export function moveBoard(
  board: Board,
  direction: Direction,
): MoveBoardResult {
  const nextBoard = [...board];
  let scoreGained = 0;

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex += 1) {
    const indices = getLineIndices(direction, lineIndex);
    const { line, scoreGained: lineScore } = moveLine(
      indices.map((index) => board[index]),
    );

    indices.forEach((boardIndex, offset) => {
      nextBoard[boardIndex] = line[offset];
    });
    scoreGained += lineScore;
  }

  return {
    board: nextBoard,
    scoreGained,
    moved: nextBoard.some((tile, index) => tile !== board[index]),
  };
}

export function addSpawnedTile(
  board: Board,
  spawner: TileSpawner,
): { board: Board; spawnedTile: TileSpawn | null } {
  const emptyIndices = getEmptyIndices(board);
  if (emptyIndices.length === 0) {
    return { board, spawnedTile: null };
  }

  const spawnedTile = spawner(emptyIndices);
  if (
    !emptyIndices.includes(spawnedTile.index) ||
    (spawnedTile.value !== 2 && spawnedTile.value !== 4)
  ) {
    throw new RangeError("Tile spawner returned an invalid tile.");
  }

  const nextBoard = [...board];
  nextBoard[spawnedTile.index] = spawnedTile.value;
  return { board: nextBoard, spawnedTile };
}

export function createRandomTileSpawner(
  random: () => number,
): TileSpawner {
  const nextRandom = () => {
    const value = random();
    if (value < 0 || value >= 1 || !Number.isFinite(value)) {
      throw new RangeError("Random source must return a value in [0, 1).");
    }
    return value;
  };

  return (emptyIndices) => {
    if (emptyIndices.length === 0) {
      throw new RangeError("Cannot spawn a tile on a full board.");
    }

    const index =
      emptyIndices[Math.floor(nextRandom() * emptyIndices.length)];
    const value: SpawnValue = nextRandom() < 0.9 ? 2 : 4;
    return { index, value };
  };
}

export function hasWinningTile(board: Board): boolean {
  return board.some((tile) => tile !== null && tile >= WINNING_TILE);
}

export function canMove(board: Board): boolean {
  if (getEmptyIndices(board).length > 0) return true;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const index = row * BOARD_SIZE + column;
      const tile = board[index];

      if (
        column + 1 < BOARD_SIZE &&
        tile === board[index + 1]
      ) {
        return true;
      }
      if (
        row + 1 < BOARD_SIZE &&
        tile === board[index + BOARD_SIZE]
      ) {
        return true;
      }
    }
  }

  return false;
}
