# Next Task

## Current focus

Minesweeper is now available at `/games/minesweeper`. It includes the pure
first-click-safe engine, versioned local active-game and best-time storage,
responsive keyboard/touch board controls, and catalog, sitemap, metadata, and
recent-game integration. Intermediate and Advanced boards now scale their
cells to the available viewport instead of requiring internal board scrolling,
and win/loss results remain fixed at the center of the viewport.

## Next implementation

Complete device-level QA for the responsive dense board, 550ms long-press
gesture, and page-visibility timer pause on a touch device before publishing
the branch. Investigate the local `vinext start` static-asset 404 if
production-preview parity is required; the application build itself succeeds
and the built client was exercised with a temporary local asset proxy.

## Constraints

- Do not deploy or change site access without explicit authorization.
- Preserve storage schemas unless the approved interaction model genuinely
  requires a documented version change.
- Keep all user-facing copy bilingual and all controls keyboard and
  screen-reader accessible.

## Verification

- `npm test`: 130 passed, including responsive-board and centered-result
  regression assertions.
- `npm run lint`: passed.
- `npm run typecheck -- --incremental false`: passed.
- `npm run build`: passed.
- Browser QA at 614×600: Intermediate rendered 26.6px cells and Advanced
  rendered 17.5px cells with no internal or page horizontal overflow. The
  Advanced game frame measured about 456px high.
- Browser QA at 390×844: pending because local-page reload was blocked by the
  browser security policy after applying the temporary viewport.
- Browser interaction QA covered first-click safety, keyboard and secondary-click
  flagging, bilingual content, roving focus, active-game restore and timer resume.
