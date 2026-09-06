import type { Coordinates } from "./data.ts";

export const WORLD_WIDTH = 720;
export const WORLD_HEIGHT = 360;
export function project(point: Coordinates) {
  return { x: (point.longitude + 180) * 2, y: (90 - point.latitude) * 2 };
}
export function unproject(x: number, y: number): Coordinates {
  return {
    latitude: Math.max(-90, Math.min(90, 90 - y / 2)),
    longitude: Math.max(-180, Math.min(180, x / 2 - 180)),
  };
}
export function mapWindow(x: number, y: number, zoom: number) {
  const scale = Math.max(1, Math.min(32, zoom));
  const width = WORLD_WIDTH / scale;
  const height = WORLD_HEIGHT / scale;
  return { x: Math.max(0, Math.min(WORLD_WIDTH - width, x)),
    y: Math.max(0, Math.min(WORLD_HEIGHT - height, y)), width, height };
}
