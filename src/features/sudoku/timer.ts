export type SudokuTimerStatus = "running" | "paused" | "finished";

export interface SudokuTimer {
  status: SudokuTimerStatus;
  elapsedMs: number;
  startedAtMs: number | null;
}

function normalizeNow(nowMs: number): number {
  if (!Number.isFinite(nowMs)) {
    throw new TypeError("Sudoku timer time must be finite.");
  }
  return Math.max(0, nowMs);
}

export function createSudokuTimer(nowMs: number): SudokuTimer {
  return {
    status: "running",
    elapsedMs: 0,
    startedAtMs: normalizeNow(nowMs),
  };
}

export function getSudokuElapsedMs(
  timer: SudokuTimer,
  nowMs: number,
): number {
  if (timer.status !== "running" || timer.startedAtMs === null) {
    return timer.elapsedMs;
  }
  return (
    timer.elapsedMs +
    Math.max(0, normalizeNow(nowMs) - timer.startedAtMs)
  );
}

export function pauseSudokuTimer(
  timer: SudokuTimer,
  nowMs: number,
): SudokuTimer {
  if (timer.status !== "running") return timer;
  return {
    status: "paused",
    elapsedMs: getSudokuElapsedMs(timer, nowMs),
    startedAtMs: null,
  };
}

export function resumeSudokuTimer(
  timer: SudokuTimer,
  nowMs: number,
): SudokuTimer {
  if (timer.status !== "paused") return timer;
  return {
    ...timer,
    status: "running",
    startedAtMs: normalizeNow(nowMs),
  };
}

export function finishSudokuTimer(
  timer: SudokuTimer,
  nowMs: number,
): SudokuTimer {
  if (timer.status === "finished") return timer;
  return {
    status: "finished",
    elapsedMs: getSudokuElapsedMs(timer, nowMs),
    startedAtMs: null,
  };
}

export function formatSudokuTime(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
  }
  return `${String(totalMinutes).padStart(2, "0")}:${paddedSeconds}`;
}
