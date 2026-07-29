# Next Task

## Current focus

Sudoku Phase 12 is complete. The released play experience now covers four
difficulties, semantic board input, notes, erase, atomic undo/redo, three
logical hints, pause, timing, best records, completion actions, autosave/resume,
replacement confirmation, and non-repeating 100-puzzle cycles per difficulty.
All local payloads are versioned, independently validated, and isolated on
failure. Korean and English gameplay, guide, controls, FAQ content, route
metadata, FAQ structured data, sitemap, recent-games tracking, and catalog
availability are integrated.

## Next implementation

Start Phase 13 release quality. Expand automated interaction coverage around
resume, confirmation, visibility pause, completion cleanup, and keyboard
shortcuts. Audit keyboard and screen-reader behavior, reduced motion, contrast,
and 44×44px touch targets. Verify mobile and desktop layouts plus route-specific
SEO, then run the complete release verification suite.

## Constraints

- Preserve all finalized Sudoku product behavior and storage schemas unless a
  regression requires an explicitly documented correction.
- Keep browser QA focused on observable gameplay and responsive layout.
- Treat accessibility findings as release blockers when they prevent keyboard,
  screen-reader, reduced-motion, contrast, or touch use.
- Do not deploy or change site access without explicit authorization.
- Update Phase 13 checkboxes only after their corresponding audits pass.
