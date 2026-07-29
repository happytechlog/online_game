# Sudoku UI Revision Plan

Date: 2026-07-28

## Scope

The user approved the mobile layout proposal and resolved every product
question on 2026-07-28. Implementation may proceed.

## Requested behavior

1. When a placed digit is selected, matching note candidates use a stronger
   visual treatment so they are easy to find.
2. Matching placed digits use the same strong background as the selected digit.
   The selected cell does not need its current inset border.
3. When no cell is selected and note mode is off, pressing a number-pad digit
   enters a digit-filter state. Matching placed digits and matching notes use
   the same strong emphasis as board-originated digit selection.
4. When all nine instances of a digit have been placed, hide that digit in the
   number pad.
5. Remove the in-game `Choose difficulty` action. Keep the initial difficulty
   selection, saved-game replacement flow, and completion actions unless the
   user decides otherwise.
6. On mobile, fit the board within the page without horizontal scrolling.
7. On mobile, show digits 1–9 in one row.
8. On mobile, keep Undo, Redo, Notes, Erase, Hint, and Pause reachable without
   scrolling. The proposed layout places Pause beside the timer and the other
   five actions in one compact row.

## Proposed implementation sequence

1. Resolve the open questions and approve the mobile composition.
2. Update the Sudoku interaction model with an explicit digit-filter state
   that can be activated without a selected cell.
3. Derive per-digit completion counts from the current board and expose hidden
   number-pad states without changing digit positions.
4. Update board rendering classes for selected values, matching values, and
   matching notes. Preserve visible keyboard focus and conflict/hint priority.
5. Remove the in-game difficulty-selection action while preserving new-game
   entry and completion flows.
6. Add a mobile-only compact layout: full-width board, one-row number pad,
   compact action row, and Pause beside elapsed time.
7. Update Korean and English accessible labels or status announcements for the
   digit-filter and completed-digit states.
8. Add deterministic interaction tests and responsive browser QA at 320, 360,
   390, and 430 CSS pixels.
9. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

## Test and acceptance plan

- Selecting a placed digit emphasizes every matching placed digit and matching
  note candidate.
- The selection remains distinguishable through focus and semantic selected
  state even when its special inset border is removed.
- Pressing a number with no selected cell and note mode off activates the same
  matching-digit view without changing the board.
- A digit disappears from the number pad after nine instances are present, and
  reappears after erase or undo drops the count below nine.
- Hidden digits retain their grid slot so the 1–9 row never shifts.
- Conflict and hint visuals remain more important than ordinary match
  highlighting.
- The board has no horizontal scroll at the approved mobile minimum width.
- All mobile controls required by the approved composition appear in the first
  game viewport for the agreed target device height.
- Keyboard, screen-reader, bilingual copy, pause, undo/redo, and persistence
  behavior do not regress.

## Implementation and verification

- Added explicit digit-filter presentation state without changing the persisted
  active-game schema.
- Added pure completed-digit and editable-empty-target helpers with regression
  coverage.
- Matching placed digits now use the selected digit's strong background, and
  matching note candidates use a high-contrast bold marker.
- Completed digits become invisible and disabled while their number-pad slots
  remain reserved.
- Removed the in-game difficulty action while retaining initial and completion
  difficulty flows.
- Mobile uses a full-width board, one-row digit pad, Pause in the timer area,
  and one row for Undo, Redo, Notes, Erase, and Hint.
- Browser QA passed at 360×800, 390×844, 430×932, and 1440×900. At 390px the
  board cells measured approximately 39px, all game controls ended near 600px,
  and there was no page-level horizontal overflow.
- Browser interaction QA confirmed matching placed-digit emphasis, matching
  note emphasis, and number-pad-only digit filtering. No browser warnings or
  errors were observed.
- Fixed a follow-up regression where choosing a number-pad filter left the
  previously selected filled cell visually selected. Digit filtering now clears
  the board selection before applying the new highlight.
- `npm test`: 118 passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.

## Resolved product decisions

1. Mobile board cells and one-row digit controls may shrink to approximately
   38–42px wide so the complete board fits without horizontal scrolling. Digit
   controls remain at least 44px high.
2. Remove only the in-game difficulty action. Keep initial new-game difficulty
   selection and completion-time difficulty choices.
3. When a digit is complete, hide only its number and reserve its number-pad
   slot so positions do not move.
4. On mobile, place Pause in the timer area and place Undo, Redo, Notes, Erase,
   and Hint in one row.
