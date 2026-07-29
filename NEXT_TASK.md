# Next Task

## Current focus

Sudoku is now included in the home page's featured game grid alongside Othello
and 2048. The centralized catalog marks all three available games as featured,
and the foundation test protects the Sudoku home-page visibility setting.

## Next implementation

Wait for player review of the three-card home-page layout. If no further
adjustments are requested, the next product task can be planned separately.

## Constraints

- Do not deploy or change site access without explicit authorization.
- Preserve storage schemas unless the approved interaction model genuinely
  requires a documented version change.
- Keep all user-facing copy bilingual and all controls keyboard and
  screen-reader accessible.

## Verification

- `npm test`: 118 passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Browser QA: 360×800, 390×844, 430×932, and 1440×900 passed without
  horizontal overflow or browser warnings.
- Follow-up interaction QA confirmed `9` board selection followed by number-pad
  `4` leaves zero selected board cells and highlights only digit `4`.
