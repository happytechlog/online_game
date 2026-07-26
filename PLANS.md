# Development Plans

This file tracks the delivery sequence for the browser game collection. Update
the dated plan in `docs/plans/` with implementation notes and verification
results after each phase.

## Phase 1 — Site foundation

- [x] Initialize Next.js App Router, TypeScript, and Tailwind CSS.
- [x] Add responsive shared header, footer, and page shell.
- [x] Add the central catalog in `src/config/games.ts`.
- [x] Add Korean/English messages, browser-language detection, manual switch,
  and versioned language persistence.
- [x] Build `/`, `/games`, and the Othello placeholder at `/games/othello`.
- [x] Add search, recommended games, recent-play placeholder, and coming-soon
  states.
- [x] Add route metadata, sitemap, and robots foundations.

## Phase 2 — Othello core

- [x] Implement a pure TypeScript 8×8 engine and immutable game history.
- [x] Cover legal moves, flipping, pass, end conditions, and scoring with tests.
- [x] Build local two-player controls, board UI, new game, resign, and undo.

## Phase 3 — Computer players

- [x] Add beginner random and intermediate heuristic strategies.
- [x] Add bounded minimax with alpha-beta pruning and a safe fallback.
- [x] Run advanced search in a Web Worker and test AI decisions.

## Phase 4 — Local persistence

- [x] Add validated, versioned save, stats, settings, and recent-game schemas.
- [x] Add autosave, resume/delete, personal stats, and recent-play UI.
- [x] Test malformed JSON, unknown versions, invalid boards, and quota errors.

## Phase 5 — Release quality

- [x] Complete Othello guide, controls, difficulty details, and FAQ content.
- [x] Audit keyboard, screen-reader, reduced-motion, contrast, and touch use.
- [x] Verify mobile/desktop layouts and route-specific SEO.
- [x] Run tests, lint, typecheck, and production build with no errors.

The Othello MVP is release-ready locally. Production publishing remains a
separate operation because uploading the repository to the private hosting
source requires explicit approval.
