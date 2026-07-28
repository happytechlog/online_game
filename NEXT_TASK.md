# Next Task

## Current focus

Sudoku Phase 11 is in progress. The pure board, candidate, conflict, completion,
parsing, uniqueness search, and puzzle-definition validation foundation is
implemented and covered by deterministic tests. Naked singles and hidden
singles produce structured logical steps and can solve and identify Easy
puzzles without guessing.

## Next implementation

Add a persistent candidate-state model, then implement locked candidates and
candidate pairs. Eliminations must be represented as immutable structured steps
and survive until a placement changes the candidate state. Extend logical
solving so puzzles requiring these techniques can be classified as Medium.

After Medium coverage, continue in the approved order:

1. Candidate triples and X-Wing.
2. XY-Wing, Swordfish, and logical chains.

Return structured explanation data and affected cells/candidates so the same
engine result can power difficulty classification and player-facing hints.

## Constraints

- Treat `docs/game-specs/sudoku.md` as the finalized MVP behavior.
- Do not use guessing or backtracking for player-facing logical steps or
  difficulty classification; backtracking remains limited to uniqueness
  validation.
- Keep the solver React-independent and deterministic.
- Record any product-rule change in the dated plan before implementation.
