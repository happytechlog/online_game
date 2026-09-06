# Next Task

## Current focus — Geo Benchmark phase 2 (2026-09-06)

Phase 1 committed as 5d5c2fe (pure engine, scoring, round lifecycle and tests).
Phase 2 now includes five locally bundled photos, versioned places.v1.json,
a runtime loader, validated attribution metadata, source/coordinate evidence,
and a hash-pinned JPEG metadata-removal preparation command.

The dataset is 1 easy / 3 medium / 1 hard (Paris, Kyoto, Lisbon, Cape Town, Tartu).
Difficulty is editorial, not model-calibrated. Coordinates are checked against
publisher camera-location templates, not independently field-surveyed.
See docs/datasets/geo-benchmark-v1.md for licensing, accuracy and reproduction.
No browser route, database, authentication, external model calls or deployment
changes are included yet.

## Next Geo Benchmark work — phase 3

Connect the desktop photo/map/form/round-score/final-results UI to the local
dataset and pure engine. Keep actual locations and source/title attribution
out of the intermediate round display and show complete credits with final
answers. Provide bilingual copy, keyboard controls and browser QA, then register
the route and game catalog entry.
Inspect vinext/static hosting compatibility before declaring static delivery.
Follow docs/plans/2026-09-05-geo-benchmark-mvp.md and docs/game-specs/geo-benchmark.md.

## Geo Benchmark verification

- npm test: 139 passed (9 Geo Benchmark tests).
- npm run lint: passed.
- npm run typecheck -- --incremental false: passed.
- npm run build: passed.
- node scripts/prepare-geo-benchmark-images.mjs: reproduced all five output hashes.
- All five decoded pixel hashes match the corresponding downloads after metadata removal.
- Source photo previews visually inspected; browser gameplay QA awaits phase 3.

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
