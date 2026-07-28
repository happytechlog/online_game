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

## Next implementation

Create the ahead-of-time Sudoku puzzle preparation and validation pipeline.
It must ingest candidate puzzle definitions, reject malformed, non-unique,
unsolved, solution-mismatched, or difficulty-mismatched entries, and emit a
stable local bundle suitable for gameplay.

Add deterministic pipeline tests, a documented input/output format, duplicate
ID and duplicate-grid checks, and a summary by difficulty. Keep the pipeline
outside the browser runtime and reuse the same uniqueness and logical-solving
contracts used by gameplay hints.

## Constraints

- Treat `docs/game-specs/sudoku.md` as the finalized MVP behavior.
- Do not use guessing or backtracking for player-facing logical steps or
  difficulty classification; backtracking remains limited to uniqueness
  validation.
- Keep the solver React-independent and deterministic.
- Do not begin assembling the 400-puzzle release bundle until the preparation
  pipeline rejects every invalid fixture class deterministically.
- Record any product-rule change in the dated plan before implementation.
