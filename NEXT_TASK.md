# Next Task

## Current focus

Sudoku Phase 11 is in progress. The pure board, candidate, conflict, completion,
parsing, uniqueness search, and puzzle-definition validation foundation is
implemented and covered by deterministic tests. Naked singles and hidden
singles produce structured logical steps and can solve and identify Easy
puzzles without guessing. Persistent candidate eliminations now support
pointing and claiming locked candidates, naked and hidden candidate pairs, and
Medium classification. Naked and hidden candidate triples plus row- and
column-based X-Wing now support Hard classification.

## Next implementation

Implement XY-Wing and row- and column-based Swordfish with immutable structured
elimination steps. Define the MVP's bounded logical-chain algorithm precisely
in `docs/DECISIONS.md` before implementing it, then extend logical solving so
puzzles requiring any approved advanced technique are classified as Expert.

Add synthetic technique coverage and uniquely solvable Expert puzzle
regressions proving eliminations persist through completion.

Return structured explanation data and affected cells/candidates so the same
engine result can power difficulty classification and player-facing hints.

## Constraints

- Treat `docs/game-specs/sudoku.md` as the finalized MVP behavior.
- Do not use guessing or backtracking for player-facing logical steps or
  difficulty classification; backtracking remains limited to uniqueness
  validation.
- Keep the solver React-independent and deterministic.
- Record any product-rule change in the dated plan before implementation.
