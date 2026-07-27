import type { Direction } from "./engine/index.ts";

export interface Point {
  x: number;
  y: number;
}

export function directionFromKey(key: string): Direction | null {
  const normalized = key.toLowerCase();
  if (normalized === "arrowup" || normalized === "w") return "up";
  if (normalized === "arrowdown" || normalized === "s") return "down";
  if (normalized === "arrowleft" || normalized === "a") return "left";
  if (normalized === "arrowright" || normalized === "d") return "right";
  return null;
}

export function directionFromSwipe(
  start: Point,
  end: Point,
  minimumDistance = 32,
): Direction | null {
  const horizontalDistance = end.x - start.x;
  const verticalDistance = end.y - start.y;
  const absoluteHorizontal = Math.abs(horizontalDistance);
  const absoluteVertical = Math.abs(verticalDistance);

  if (
    Math.max(absoluteHorizontal, absoluteVertical) < minimumDistance ||
    absoluteHorizontal === absoluteVertical
  ) {
    return null;
  }

  if (absoluteHorizontal > absoluteVertical) {
    return horizontalDistance > 0 ? "right" : "left";
  }
  return verticalDistance > 0 ? "down" : "up";
}
