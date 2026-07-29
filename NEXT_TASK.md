# Next Task

## Current focus

Sudoku Phase 11 now includes playable board interactions, in-session timing,
per-difficulty best records, and unlimited undo/redo. Player value, erase, and
note changes are recorded by a pure history module. A final placement and all
peer notes removed by that placement form one atomic action, so undo restores
the exact prior board and notes and redo reapplies them together. Selection and
note-mode toggles do not pollute history, rejected edits are ignored, and any
divergent input clears the redo branch. Accessible touch buttons and the agreed
`Ctrl`/`Cmd` keyboard shortcuts are connected. History remains session-only.

## Next implementation

Add the three-use explanatory logical hint flow. Ask the existing deterministic
solver for the next available approved technique, explain it in both languages,
and highlight the relevant cells or candidates without entering a digit.
Expose an accessible touch action and announcement, decrement the remaining
count only when a valid hint is shown, and clear stale highlighting after a
player board change. Hint use must not alter timer or best-time eligibility.

## Constraints

- Treat `docs/game-specs/sudoku.md` as the finalized MVP behavior.
- Do not use guessing or backtracking for player-facing hints or difficulty
  classification.
- Keep hint derivation React-independent and deterministic by reusing the
  existing logical-step contract.
- Do not fill a value, remove a candidate, or add undo history when showing a
  hint.
- Keep unfinished-game persistence and puzzle selection history out of the
  hint slice; add them after the active-game shape includes remaining hints.
- Keep undo and redo history session-only and exclude it from future persisted
  payloads.
- Record any product-rule change in the dated plan before implementation.
