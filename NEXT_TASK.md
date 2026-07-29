# Next Task

## Current focus

Sudoku Phase 11 puzzle infrastructure is complete. The pure board, candidate,
conflict, completion,
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
A lightweight gameplay loader now validates the generated artifact's version,
exact shape, canonical grids, solution consistency, duplicates, and exactly
100 entries per difficulty without rerunning uniqueness search or logical
classification in the browser.
The reproducible release source and generated gameplay artifact now contain
400 fully accepted puzzles: 100 each for Easy, Medium, Hard, and Expert.

## Next implementation

Start the accessible Sudoku board UI and new-game difficulty flow described in
the finalized specification. Load puzzles only through the committed release
entry point, present Easy, Medium, Hard, and Expert choices in both languages,
and establish the semantic grid, selection, digit entry, erase, note mode, and
conflict-highlighting interaction model before adding persistence and timing.

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
  first board interaction slice; add them in their planned dedicated phase.
- Record any product-rule change in the dated plan before implementation.
