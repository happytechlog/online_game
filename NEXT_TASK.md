# Next Task

## Current focus

Sudoku Phase 11 is in progress. The pure board, candidate, conflict, completion,
parsing, uniqueness search, and puzzle-definition validation foundation is
implemented and covered by deterministic tests. Naked singles and hidden
singles produce structured logical steps and can solve and identify Easy
puzzles without guessing. Persistent candidate eliminations now support
pointing and claiming locked candidates, naked and hidden candidate pairs, and
Medium classification.

## Next implementation

Implement candidate triples and X-Wing with immutable structured elimination
steps. Extend logical solving so puzzles requiring either technique are
classified as Hard, with uniquely solvable regression puzzles demonstrating
that candidate eliminations persist through completion.

After Hard coverage, continue with XY-Wing, Swordfish, and logical chains.

Return structured explanation data and affected cells/candidates so the same
engine result can power difficulty classification and player-facing hints.

## Constraints

- Treat `docs/game-specs/sudoku.md` as the finalized MVP behavior.
- Do not use guessing or backtracking for player-facing logical steps or
  difficulty classification; backtracking remains limited to uniqueness
  validation.
- Keep the solver React-independent and deterministic.
- Record any product-rule change in the dated plan before implementation.
