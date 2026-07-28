# Next Task

## Current focus

Sudoku Phase 11 is in progress. The pure board, candidate, conflict, completion,
parsing, uniqueness search, and puzzle-definition validation foundation is
implemented and covered by deterministic tests.

## Next implementation

Implement deterministic logical-step discovery and solving in the approved
technique order:

1. Naked single and hidden single.
2. Locked candidates and candidate pairs.
3. Candidate triples and X-Wing.
4. XY-Wing, Swordfish, and logical chains.

Return structured explanation data and affected cells/candidates so the same
engine result can power difficulty classification and player-facing hints.

## Constraints

- Treat `docs/game-specs/sudoku.md` as the finalized MVP behavior.
- Do not use guessing or backtracking for player-facing logical steps or
  difficulty classification; backtracking remains limited to uniqueness
  validation.
- Keep the solver React-independent and deterministic.
- Record any product-rule change in the dated plan before implementation.
