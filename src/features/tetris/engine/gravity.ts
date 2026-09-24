const TICKS_PER_CELL_BY_LEVEL = [
  60, 48, 37, 28, 21, 16, 12, 10, 8, 6, 5, 4, 3, 2, 1,
] as const;

const TICKS_PER_SECOND = 60;

export function getGravityIntervalMs(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  const levelIndex = Math.min(safeLevel, TICKS_PER_CELL_BY_LEVEL.length) - 1;
  return (TICKS_PER_CELL_BY_LEVEL[levelIndex] * 1000) / TICKS_PER_SECOND;
}

