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
