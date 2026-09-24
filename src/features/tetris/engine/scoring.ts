import type { SpinType } from "./types.ts";

const NORMAL_CLEAR_POINTS: Readonly<Record<number, number>> = {
  0: 0,
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

const MINI_T_SPIN_POINTS: Readonly<Record<number, number>> = {
  0: 100,
  1: 200,
  2: 400,
};

const FULL_T_SPIN_POINTS: Readonly<Record<number, number>> = {
  0: 400,
  1: 800,
  2: 1200,
  3: 1600,
};

export interface ClearScoreInput {
  clearedLines: number;
  spin: SpinType;
  level: number;
  combo: number;
  backToBack: boolean;
}

export interface ClearScoreResult {
  points: number;
  basePoints: number;
  comboPoints: number;
  backToBackPoints: number;
  combo: number;
  backToBack: boolean;
}

export function scoreClear(input: ClearScoreInput): ClearScoreResult {
  const { clearedLines, spin, level, combo: previousCombo, backToBack } = input;
  const safeLevel = Math.max(1, Math.floor(level));
  const baseTable = spin === "full"
    ? FULL_T_SPIN_POINTS
    : spin === "mini"
      ? MINI_T_SPIN_POINTS
      : NORMAL_CLEAR_POINTS;
  const basePoints = (baseTable[clearedLines] ?? 0) * safeLevel;

  if (clearedLines === 0) {
    return {
      points: basePoints,
      basePoints,
      comboPoints: 0,
      backToBackPoints: 0,
      combo: 0,
      backToBack,
    };
  }

  const combo = previousCombo + 1;
  const comboPoints = combo > 1 ? 50 * (combo - 1) * safeLevel : 0;
  const difficultClear = clearedLines === 4 || spin !== "none";
  const backToBackPoints = difficultClear && backToBack
    ? Math.floor(basePoints / 2)
    : 0;

  return {
    points: basePoints + comboPoints + backToBackPoints,
    basePoints,
    comboPoints,
    backToBackPoints,
    combo,
    backToBack: difficultClear,
  };
}

