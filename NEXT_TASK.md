# Next Task

## Current focus

Minesweeper is now available at `/games/minesweeper`. It includes the pure
first-click-safe engine, versioned local active-game and best-time storage,
responsive keyboard/touch board controls, and catalog, sitemap, metadata, and
recent-game integration.

## Next implementation

Complete device-level QA for the 550ms long-press gesture and page-visibility
timer pause on a touch device before publishing the branch. Investigate the
local `vinext start` static-asset 404 if production-preview parity is required;
the application build itself succeeds and the built client was exercised with
a temporary local asset proxy.

## Constraints

- Do not deploy or change site access without explicit authorization.
- Preserve storage schemas unless the approved interaction model genuinely
  requires a documented version change.
- Keep all user-facing copy bilingual and all controls keyboard and
  screen-reader accessible.

## Verification

- `npm test`: 130 passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Browser QA: desktop play and 390×844 responsive layout passed without page
  horizontal overflow or browser warnings.
- Browser interaction QA covered first-click safety, keyboard and secondary-click
  flagging, bilingual content, roving focus, active-game restore and timer resume.
- The Advanced board preserved 44×44 cells and scrolled internally at 390px.
