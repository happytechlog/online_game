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

## Phase 6 — 2048 rules and engine

- [x] Finalize the original 2048 rules and UX in
  `docs/game-specs/2048.md`.
- [x] Implement a pure, deterministic 4×4 engine with injected tile spawning.
- [x] Cover movement, single-merge behavior, scoring, 2048 detection,
  continuation, and game-over conditions with tests.

## Phase 7 — 2048 play experience

- [x] Build the responsive board, score display, new-game control, win state,
  continue action, and game-over state.
- [x] Support arrow keys, WASD, and touch swipes without adding undo.
- [x] Add Korean and English gameplay, guide, control, and FAQ content.

## Phase 8 — 2048 persistence and site integration

- [x] Add validated, versioned autosave for the current game and best score.
- [x] Recover safely from malformed, unknown-version, and unavailable storage.
- [x] Finalize `/games/2048` metadata, add its sitemap entry and recent-play
  support, and change the catalog status to `available` only after verification.

## Phase 9 — 2048 release quality

- [x] Audit keyboard, screen-reader, reduced-motion, contrast, and touch use.
- [x] Verify mobile and desktop layouts and route-specific SEO.
- [x] Run tests, lint, typecheck, and production build with no errors.

Implementation details, acceptance criteria, and verification results belong in
`docs/plans/2026-07-26-2048-mvp.md`.

## Phase 10 — Sudoku product planning

- [x] Confirm difficulty names and definitions.
- [x] Decide puzzle generation, uniqueness, and classification rules.
- [x] Decide input validation, mistakes, notes, hints, and undo behavior.
- [x] Decide timer, best-time eligibility, autosave, and resume behavior.
- [x] Finalize `docs/game-specs/sudoku.md` and its acceptance criteria before
  implementation.

The collaborative planning record is
`docs/plans/2026-07-27-sudoku-mvp.md`. Sudoku implementation is in progress.

## Phase 11 — Sudoku puzzle foundation

- [x] Implement pure board, candidate, conflict, completion, parsing, and
  uniqueness-validation modules.
- [x] Implement structured logical-step contracts plus naked-single and
  hidden-single discovery, application, and Easy solving.
- [x] Implement persistent candidate eliminations, pointing and claiming
  locked candidates, naked and hidden pairs, and Medium classification.
- [x] Implement naked and hidden candidate triples, row- and column-based
  X-Wing, and Hard classification.
- [x] Implement the remaining approved Expert logical-solving technique
  catalog and classification.
- [x] Create the ahead-of-time puzzle preparation and validation pipeline.
- [ ] Bundle 100 uniquely solvable, correctly classified puzzles per
  difficulty.
- [ ] Cover engine rules, every approved technique, uniqueness, classification,
  and invalid puzzle data with deterministic tests.

## Phase 12 — Sudoku play experience

- [x] Build difficulty selection, the responsive semantic board, input controls,
  notes, undo/redo, hints, pause, and completion flows.
- [ ] Add versioned autosave, best times, puzzle-cycle history, and safe
  recovery.
- [ ] Add bilingual gameplay, guide, control, and FAQ content.
- [ ] Integrate the route, metadata, sitemap, recent games, and catalog status.

## Phase 13 — Sudoku release quality

- [ ] Complete automated interaction and storage tests.
- [ ] Audit keyboard, screen-reader, reduced-motion, contrast, and touch use.
- [ ] Verify mobile and desktop layouts and route-specific SEO.
- [ ] Run test, lint, typecheck, and production build before release.
