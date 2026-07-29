# Next Task

## Current focus

The approved Sudoku interaction and mobile layout revisions are complete.
Matching placed digits and matching note candidates receive stronger emphasis,
the number pad supports digit filtering and hides completed digits without
shifting positions, and the in-game difficulty action is removed.

The mobile play view now fits the board without horizontal scrolling, shows
digits 1 through 9 in one row, places Pause beside the timer, and keeps Undo,
Redo, Notes, Erase, and Hint in one compact row.

A follow-up selection regression is fixed: choosing a different number-pad
digit now clears the previously selected board cell before applying the new
digit highlight.

## Next implementation

Wait for player review of the revised Sudoku experience. If no further
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
