# Next Task

## Current focus

The complete in-session Sudoku interaction flow is now implemented: difficulty
selection, responsive semantic board, values, notes, erase, atomic undo/redo,
three-use explanatory hints, pause, timing, records, and completion actions.
Hints reuse the deterministic logical solver, highlight cells and candidates
without applying a step, and leave timing and history untouched. Unavailable
hints do not consume a use, while any subsequent player board change clears
stale highlighting.

## Next implementation

Complete Phase 12 persistence. Add one versioned unfinished-game autosave that
stores puzzle identity, board values, notes, remaining hints, and accumulated
elapsed time after every meaningful change. Restore it paused without restoring
undo/redo or active hint highlighting, and offer Continue or New Game. Add a
separate validated per-difficulty puzzle-cycle history so all 100 puzzles are
used before that difficulty resets. Selecting a new puzzle while unfinished
progress exists must require confirmation before replacement.

## Constraints

- Treat every local payload as untrusted: require exact versions and shapes,
  validate puzzle identity against the committed release bundle, and recover
  without damaging best times or another valid payload.
- Keep best times, unfinished game, and puzzle-cycle history in separate keys.
- Persist only the latest board, notes, remaining hints, and elapsed time;
  never persist undo/redo or active hint highlighting.
- Restore every unfinished game paused and continue timing only after the
  player explicitly resumes.
- Clear only the unfinished save on valid completion.
- Reset only the exhausted difficulty's puzzle cycle.
- Record any product-rule change in the dated plan before implementation.
