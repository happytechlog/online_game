# Next Task

## Current focus — Geo Benchmark phase 1 (2026-09-06)

Completed the pure TypeScript foundation:
- data.ts: validates five-place JSON objects, 1/3/1 difficulty mix, coordinates,
  bilingual names, local image paths, source and attribution fields.
- scoring.ts: Haversine distance and 2000km exponential scoring.
- session.ts: required inputs, unknown names as null, immutable round transitions,
  duplicate-submit prevention, immediate scores and final-only answer projection.
- tests/geo-benchmark.test.mjs: six regression tests using synthetic fixtures.

No browser route, real photo dataset, storage, dependencies or deployment changes
in this phase. Synthetic test coordinates are not verified photo locations.

## Next Geo Benchmark work

Phase 2: select five redistributable photos and verify camera coordinates, sources
and license terms; bundle images and versioned JSON. Phase 3: connect the desktop
photo/map/form/results UI, bilingual copy, keyboard controls and browser QA.
The existing app builds through vinext; static hosting compatibility still needs
verification before delivery. Follow the dated plan and game specification.

## Geo Benchmark verification

- npm test: 136 passed (including 6 new Geo Benchmark tests).
- npm run typecheck -- --incremental false: passed.
- npm run build: passed.
- npm run lint: passed.
- Browser QA: deferred until the UI phase.

## Previous focus — Minesweeper (preserved)

Minesweeper is now available at `/games/minesweeper`. It includes the pure
first-click-safe engine, versioned local active-game and best-time storage,
responsive keyboard/touch board controls, and catalog, sitemap, metadata, and
recent-game integration. Intermediate and Advanced boards now scale their
cells to the available viewport instead of requiring internal board scrolling,
and win/loss results remain fixed at the center of the viewport.

## Pending Minesweeper follow-up (preserved)

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
