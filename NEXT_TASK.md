# Latest update — 25-photo random pool (2026-09-06)

Completed dataset v2: 5 easy / 15 medium / 5 hard, retaining the previous five photos and adding 20 reviewed Commons photos with license/camera-location evidence, neutral local assets, metadata stripping and hash-pinned reproduction. Detailed provenance: docs/datasets/geo-benchmark-v2.md.
Each game draws 1 easy → 3 distinct medium → 1 hard. Browser crypto supplies a fresh seed after hydration and on restart; the pure seeded selector fixes the five rounds for the session. Final JSON records seed, selection version and selected IDs for reproduction. Different games can repeat photos.
Validation: 146 tests, lint, typecheck and build passed. Image preparation reproduced all 25 matching files. Tests cover 1,000 seeds, tier counts/order, uniqueness, pool coverage, input isolation and final-only seed disclosure. Browser QA completed two perfect games (seeds 42 and 43), verified different draws after restart, no early answers, matching exported IDs and reproducible final JSON; no page errors. Artifacts: work/geo-benchmark/pool-v2-qa.mjs, pool-v2-run-0.json, pool-v2-run-1.json and pool-v2-desktop.png (ignored).
All 20 additions were visually reviewed. Coordinates are publisher-provided camera locations, not survey measurements; Vienna uses its camera template instead of the separate object coordinates reported in API metadata. Difficulty remains editorial.
No required work remains for this request. No Sites configuration changes or deployment. Country/city reverse geocoding remains unimplemented; its interaction choice was not finalized.

# Latest update — map controls (2026-09-06)

Added bilingual Clear selection for editable guesses, clearing marker and coordinate inputs together. Both maps zoom around the current viewport center with buttons and mouse wheel. Submitted responses remain locked.
Validation: 143 tests, lint, typecheck and build passed. Browser QA verified clearing and center-preserving button/wheel zoom in both detailed and offline maps (work/geo-benchmark/map-controls-qa.mjs).
No hosting changes or deployment.

# Latest update — detailed map (2026-09-06)

Implemented Leaflet/OpenStreetMap detail map with city, road and building tiles, zoom up to 19, click and keyboard selection, numeric-coordinate sync, localized instructions and tile-failure notice. Local Natural Earth map remains available via the offline toggle.
Validation: 143 tests, lint, typecheck and build passed. Headless Edge verified real loaded OSM tiles at zoom 14, click/numeric/keyboard selection, switching map modes, 390px overflow and simulated tile failure. Screenshot: work/geo-benchmark/detail-map.png (ignored).
No Sites changes or deployment. Detailed map requires internet; no API key needed. No required implementation remains for this request.

# Next Task

## Current focus — Geo Benchmark phase 3 (2026-09-06)

Browser MVP implemented at /games/geo-benchmark: five local photos, local world
map with click/pan/zoom/keyboard and numeric coordinates, bilingual manual input,
unknown country/city, mandatory confidence/reasoning, immediate scores, final
answers/credits, JSON export and restart. Game catalog and sitemap registered.
No hosting configuration or deployment was changed.

## Verification

- npm test: 143 passed, including 13 Geo Benchmark tests.
- npm run lint: passed.
- npm run typecheck -- --incremental false: passed.
- npm run build: passed after final JSON export changes.
- Headless Edge at 1440x1000: five rounds, map selection, immediate scores,
  no intermediate credits, five final results, download and restart passed.
- English, keyboard map selection, zoom, whitespace-only rejection, export
  structure/totals and 390px viewport overflow checks passed. No page errors.
- Desktop screenshot visually inspected. QA artifacts are in ignored
  work/geo-benchmark/ (ui-desktop.png, ui-results.png, result-test.json).

## Delivery notes

Run npm run dev and open http://localhost:3000/games/geo-benchmark.
The existing vinext runtime remains; a standalone static HTML export was not
created. Core benchmark logic/data run in the browser without a backend API.
Reload resets progress. Answers are inspectable in bundled data; screen reveal
timing is not an exam security boundary. Photo coordinates use publisher evidence
and difficulty is editorial. See docs/datasets/geo-benchmark-v1.md.

## Remaining optional work

Model integration and deployment require a new user request. No hosting work is
authorized. The requested local manual benchmark MVP is ready for user review.

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
