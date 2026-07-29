# Next Task

## Current focus

Sudoku Phase 11 now has its first playable UI slice. The verified local release
bundle contains 400 accepted puzzles, and the new-game flow offers bilingual
Easy, Medium, Hard, and Expert choices through that release entry point only.
The semantic 9×9 board supports selection, bounded arrow-key movement, digit
entry, erase, note mode, automatic peer-note removal, peer and matching-digit
highlighting, provisional conflict highlighting, and exact-solution
completion. Given cells are immutable, touch controls meet the 44×44px target,
and focus, conflict, cell state, and status announcements have accessible
non-color treatment. The Sudoku route is available from the central catalog
and included in the sitemap.

## Next implementation

Add the timer and pause lifecycle plus versioned best times per difficulty.
Start timing when a selected puzzle appears, pause manually or on page
visibility loss, hide the board during manual pause, format elapsed time as
specified, and show current and best times on valid completion. Keep unfinished
game persistence, selection history, hints, and undo/redo for their later
dedicated slices.

## Constraints

- Treat `docs/game-specs/sudoku.md` as the finalized MVP behavior.
- Do not use guessing or backtracking for player-facing logical steps or
  difficulty classification; backtracking remains limited to uniqueness
  validation.
- Keep the solver React-independent and deterministic.
- Keep candidate sources and the generated gameplay bundle clearly separated.
- Do not weaken validation or silently drop rejected entries to reach the
  required per-difficulty counts.
- Keep puzzle selection history and unfinished-game persistence out of the
  timer slice; add them in their planned dedicated phase.
- Validate best-time storage as untrusted, versioned device-local data without
  coupling it to the unfinished-game save.
- Record any product-rule change in the dated plan before implementation.
