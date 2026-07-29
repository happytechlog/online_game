# Next Task

## Current focus

Sudoku Phase 12 gameplay and persistence are implemented. The complete
in-session experience includes difficulty selection, semantic board input,
notes, erase, atomic undo/redo, three explanatory hints, pause, timing, records,
and completion flows. Separate validated local payloads now own best times, one
unfinished game, and per-difficulty puzzle cycles. Reload restores the active
game paused without undo history or hint highlighting. New games require
replacement confirmation, and each difficulty uses all 100 release puzzles
before its own cycle resets.

## Next implementation

Finish the Phase 12 content surface. Add a bilingual Sudoku guide covering the
rules, difficulty model, controls, hints, pause, autosave, and records. Add
bilingual FAQs and route-level FAQ structured data, while keeping route
metadata, sitemap, recent-games tracking, and catalog availability aligned.
Then update Phase 12 status and run the complete verification suite.

## Constraints

- Keep all visible guide and FAQ content in Korean and English.
- Use semantic sections, ordered rules, control cards, and native FAQ details.
- Keep explanations consistent with the finalized Sudoku specification and
  current device-local behavior.
- Do not claim online accounts, remote saving, or guessing-based hints.
- Preserve existing route metadata, catalog, sitemap, and recent-game wiring.
- Update `PLANS.md`, the game specification, dated plan, and `NEXT_TASK.md`
  after Phase 12 is complete.
