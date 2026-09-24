import type {
  ActivePiece,
  PieceType,
  Position,
  Rotation,
} from "./types.ts";

const JLSTZ_BASE: Record<Exclude<PieceType, "I" | "O">, readonly Position[]> = {
  J: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  L: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  S: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  T: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  Z: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
};

const I_BASE: readonly Position[] = [
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
];

const O_BASE: readonly Position[] = [
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
];

export const PIECE_TYPES: readonly PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export function nextRotation(
  rotation: Rotation,
  direction: "clockwise" | "counterclockwise",
): Rotation {
  return ((rotation + (direction === "clockwise" ? 1 : 3)) % 4) as Rotation;
}

export function getLocalCells(
  type: PieceType,
  rotation: Rotation,
): readonly Position[] {
  if (type === "O") return O_BASE;

  if (type === "I") {
    return Array.from({ length: rotation }, (_, turn) => turn).reduce<Position[]>(
      (cells) => cells.map(({ x, y }) => ({ x: 3 - y, y: x })),
      I_BASE.map((cell) => ({ ...cell })),
    );
  }

  const base = JLSTZ_BASE[type];
  return Array.from({ length: rotation }, (_, turn) => turn).reduce<Position[]>(
    (cells) => cells.map(({ x, y }) => ({ x: 2 - y, y: x })),
    base.map((cell) => ({ ...cell })),
  );
}

export function getPieceCells(piece: ActivePiece): readonly Position[] {
  return getLocalCells(piece.type, piece.rotation).map(({ x, y }) => ({
    x: piece.x + x,
    y: piece.y + y,
  }));
}

export function createSpawnPiece(type: PieceType): ActivePiece {
  return { type, x: 3, y: 0, rotation: 0 };
}
