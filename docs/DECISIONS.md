# Architecture Decisions

Record important structural decisions here after they are agreed. Product rules
belong in `docs/game-specs/`, and temporary options belong in dated files under
`docs/plans/`.

## 2026-07-27 — Bundle pre-verified Sudoku puzzles

### Decision

Sudoku gameplay selects puzzles from a local set prepared before release.
Puzzle generation and verification do not run in the player's browser. Every
bundled puzzle must pass deterministic checks for a unique solution and its
assigned difficulty before it is included. The validation process must also
solve the puzzle to completion with the approved logical-technique catalog;
backtracking may verify uniqueness but cannot qualify a puzzle as logically
solvable or determine its player-facing difficulty. The player-facing rating is
the hardest required approved technique: singles for Easy; locked candidates
and pairs for Medium; triples and X-Wing for Hard; and XY-Wing, Swordfish, or
logical chains for Expert.

### Consequences

- New games start immediately without runtime generation work.
- Released puzzles have stable, testable difficulty classifications.
- Puzzle variety is finite: bundle 100 puzzles per difficulty and persist
  per-difficulty selection history locally to avoid repeats until that
  difficulty's set is exhausted.
- A development-time preparation and validation process is required, but it is
  not part of the shipped gameplay runtime.

## 2026-07-27 — Persist one active Sudoku game

### Decision

Keep at most one unfinished Sudoku game in versioned local storage. Autosave
entries, notes, remaining hints, and accumulated elapsed time after every
state-changing action. Restore it paused with Continue and New Game choices.
Undo and redo history are session-only and reset after reload.

### Consequences

- Reload and return visits preserve meaningful progress without counting
  inactive time.
- Starting a selected new puzzle requires confirmation before unfinished
  progress is replaced.
- Completion clears the active save but preserves per-difficulty best times and
  puzzle selection history.
- Runtime validation must isolate invalid payloads so one damaged record does
  not erase unrelated valid records.
