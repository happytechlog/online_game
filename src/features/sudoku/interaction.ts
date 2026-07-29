import type { Digit } from "./engine/index.ts";
import type { SudokuDirection } from "./game.ts";
import type { SudokuTimerStatus } from "./timer.ts";

export type SudokuKeyboardCommand =
  | { type: "move"; direction: SudokuDirection }
  | { type: "enter"; digit: Digit }
  | { type: "erase" }
  | { type: "toggle-notes" }
  | { type: "toggle-pause" }
  | { type: "undo" }
  | { type: "redo" };

export interface SudokuKeyboardInput {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  defaultPrevented?: boolean;
  editableTarget?: boolean;
}

function directionFromKey(key: string): SudokuDirection | null {
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (key === "ArrowLeft") return "left";
  if (key === "ArrowRight") return "right";
  return null;
}

export function resolveSudokuKeyboardCommand(
  input: SudokuKeyboardInput,
  timerStatus: SudokuTimerStatus,
): SudokuKeyboardCommand | null {
  if (
    input.defaultPrevented ||
    input.altKey ||
    input.editableTarget
  ) {
    return null;
  }

  const key = input.key.toLowerCase();
  const modifier = Boolean(input.ctrlKey || input.metaKey);
  if (modifier && key === "z") {
    return { type: input.shiftKey ? "redo" : "undo" };
  }
  if (input.ctrlKey && key === "y") return { type: "redo" };

  if (input.ctrlKey || input.metaKey) return null;
  if (key === "p" && timerStatus !== "finished") {
    return { type: "toggle-pause" };
  }
  if (timerStatus !== "running") return null;

  const direction = directionFromKey(input.key);
  if (direction) return { type: "move", direction };
  if (/^[1-9]$/.test(input.key)) {
    return { type: "enter", digit: Number(input.key) as Digit };
  }
  if (
    input.key === "Backspace" ||
    input.key === "Delete" ||
    input.key === "0"
  ) {
    return { type: "erase" };
  }
  if (key === "n") return { type: "toggle-notes" };
  return null;
}

export function shouldAutoPauseSudoku(
  hasGame: boolean,
  timerStatus: SudokuTimerStatus | null,
  documentHidden: boolean,
): boolean {
  return hasGame && timerStatus === "running" && documentHidden;
}
