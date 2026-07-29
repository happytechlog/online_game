import releaseBundle from "./generated/release-v1.json" with { type: "json" };
import {
  loadSudokuPuzzleBundle,
  type PuzzleBundleLoadIssue,
} from "./load.ts";
import type { SudokuPuzzleBundle } from "./prepare.ts";

function loadReleaseBundle(): SudokuPuzzleBundle {
  const result = loadSudokuPuzzleBundle(releaseBundle);

  if (!result.valid || result.bundle === null) {
    throw new Error(
      `Invalid bundled Sudoku puzzles: ${formatIssues(result.issues)}`,
    );
  }

  return result.bundle;
}

function formatIssues(issues: readonly PuzzleBundleLoadIssue[]): string {
  return issues
    .map((issue) => {
      const location = issue.index === null ? "" : ` at index ${issue.index}`;
      return `${issue.code}${location}`;
    })
    .join(", ");
}

export const sudokuPuzzleBundle = loadReleaseBundle();
