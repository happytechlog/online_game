# Next Task

## Current focus

Sudoku Phases 10 through 13 are complete and the MVP is release-ready locally.
The final experience includes four verified difficulty levels, full keyboard
and touch play, notes, atomic undo/redo, logical hints, pause and timing,
versioned device-local persistence, non-repeating puzzle cycles, bilingual
guidance, responsive layouts, accessibility coverage, and route-specific SEO.

The release suite passes with 115 automated tests plus lint, strict typecheck,
and the production build. Browser QA covers desktop and mobile layout,
keyboard entry and undo, pause and focus behavior, saved-game resume,
replacement confirmation, live announcements, touch targets, contrast, and
SEO. Production publishing has not been performed.

## Next implementation

Start the next game with a planning-only Minesweeper phase. Confirm the rule
variant, board sizes and mine counts, first-click safety, input model, win and
loss behavior, timing and records, persistence, accessibility, and bilingual
content before changing implementation files. Record finalized behavior in
`docs/game-specs/minesweeper.md` and unresolved choices plus execution order in
a dated plan.

## Constraints

- Do not deploy or change site access without explicit authorization.
- Do not modify finalized Sudoku behavior or storage schemas unless a verified
  regression requires a documented correction.
- Keep the first Minesweeper phase planning-only until player-facing decisions
  and acceptance criteria are finalized.
- Do not mark Minesweeper available in the catalog until its implementation and
  release-quality phases pass.
