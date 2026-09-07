import { parseDataset, type Dataset, type Place } from "./data.ts";

export const SELECTION_VERSION = "difficulty-draw-v1";

// Injected seed keeps selection reproducible and the engine independent of browser APIs.
export function selectRounds(input: unknown, seed: number): Dataset {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error("INVALID_SEED");
  const dataset = parseDataset(input);
  let state = seed >>> 0;
  function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
  function draw(difficulty: Place["difficulty"], count: number) {
    const pool = dataset.places.filter(place => place.difficulty === difficulty);
    for (let i = 0; i < count; i++) {
      const index = i + Math.floor(random() * (pool.length - i));
      [pool[i], pool[index]] = [pool[index], pool[i]];
    }
    return pool.slice(0, count);
  }
  return { version: dataset.version, places: [...draw("easy", 1), ...draw("medium", 3), ...draw("hard", 1)] };
}
