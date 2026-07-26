# Othello MVP Plan — 2026-07-25

## Context

The repository began with only a generic contributor guide. Phase 1 initialized
the framework and established boundaries that allow more games to be added
without coupling shared site code to Othello.

## Decisions

- Next.js 16 App Router, React 19, strict TypeScript, and Tailwind CSS 4.
- `app/` owns routes; `src/components/`, `src/config/`, and `src/i18n/` own
  shared concerns; `src/features/<game-id>/` owns game implementations.
- Korean is the server fallback. A client provider selects a validated saved
  language or the browser language after hydration.
- The catalog and site identity are typed central configuration.
- Persistence remains browser-only and receives runtime validation in Phase 4.
- Advanced AI is isolated behind a worker protocol in Phase 3.

## Delivery sequence

1. **Foundation — complete:** routes, shared shell, central catalog, bilingual
   UI, browser-language selection, search, recommendation/recent placeholders,
   coming-soon cards, metadata, sitemap, and robots.
2. **Game core — next:** domain types, pure engine, exhaustive rule tests,
   local two-player reducer and UI, undo/new game/resign.
3. **AI:** beginner and intermediate strategies, bounded advanced search,
   worker transport, safe fallback, deterministic fixtures.
4. **Persistence:** validators and adapters for settings, recent games, session,
   and stats; autosave/resume/delete UI; failure-path tests.
5. **Release:** explanatory HTML, accessibility and responsive audits, social
   metadata, full automated verification, and production deployment review.

## Phase 1 verification

Record final command outcomes here after implementation:

- `npm test`: passed (4 tests)
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run build`: passed (3 application routes)

## Phase 2 acceptance criteria

All standard legal move and flip directions pass unit tests; forced passes and
both end conditions are correct; two people can complete a match on one device;
undo restores the exact prior immutable position; no engine module imports
React or browser APIs.
