# Next Task

## Current focus

Sudoku Phase 11 is in progress. The pure board, candidate, conflict, completion,
parsing, uniqueness search, and puzzle-definition validation foundation is
implemented and covered by deterministic tests. Naked singles and hidden
singles produce structured logical steps and can solve and identify Easy
puzzles without guessing. Persistent candidate eliminations now support
pointing and claiming locked candidates, naked and hidden candidate pairs, and
Medium classification. Naked and hidden candidate triples plus row- and
column-based X-Wing support Hard classification. XY-Wing, row- and column-based
Swordfish, and bounded single-digit X-Chains now complete the approved Expert
catalog and classification.
The ahead-of-time preparation pipeline now rejects malformed definitions,
duplicate IDs or grids, invalid uniqueness or solutions, puzzles outside the
approved logical catalog, and difficulty mismatches. Valid sources produce a
canonical, stably sorted local bundle plus per-difficulty counts.

## Next implementation

Assemble the 400-puzzle release source: 100 uniquely solvable, correctly
classified puzzles for each of Easy, Medium, Hard, and Expert. Run the complete
source through the preparation command and commit the generated stable local
bundle only after all entries pass atomically.

Add a lightweight gameplay-facing bundle loader that validates the generated
artifact's version and shape without rerunning uniqueness search or logical
classification in the browser. Cover invalid artifact versions, malformed
entries, and exact per-difficulty counts before starting the board UI.

## Constraints

- Treat `docs/game-specs/sudoku.md` as the finalized MVP behavior.
- Do not use guessing or backtracking for player-facing logical steps or
  difficulty classification; backtracking remains limited to uniqueness
  validation.
- Keep the solver React-independent and deterministic.
- Keep candidate sources and the generated gameplay bundle clearly separated.
- Do not weaken validation or silently drop rejected entries to reach the
  required per-difficulty counts.
- Record any product-rule change in the dated plan before implementation.
