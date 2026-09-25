# Tetris play screen revision plan (2026-09-24)

## Completion (2026-09-24)

Implemented the planned layout, preview, and bilingual guide changes. Browser inspection found that the queue contained pieces and their cells had the expected colors, but `.tetris-piece-preview` centered grid children with zero intrinsic height. Stretching those children made the pieces visible. A local browser check showed the next queue advancing after hard drop and the hold preview updating.

At 390×844, score, the first next block, board, and all touch controls were visible together. At 320×568, the board stays wider, the controls remain 44px high, there is no horizontal overflow, and vertical scrolling is allowed. At 1280×900, HUD and play columns align and the preview, board, and controls begin at the same vertical position. The three guide sections rendered in Korean and English.

Verification: 163 tests passed with `node --test --experimental-test-isolation=none tests/*.test.mjs`; lint, typecheck, production build, and `git diff --check` passed. The default test command and the sandboxed build cannot spawn required subprocesses in this Windows sandbox; the direct Node command and an elevated build completed successfully.

## Goal and scope

Improve the Tetris play screen in portrait mobile and desktop layouts. During play, the score and next piece must be easy to check without losing access to the board or touch controls. Align the desktop panels, fix the reported missing next-piece preview, and add the three explanatory sections used by other game pages.

## Current evidence

- The supplied mobile screenshots show that the score/HUD, hold/next, board, and controls occupy separate vertical bands. The board is almost screen width and has a 1:2 aspect ratio, pushing controls below the visible area.
- `src/features/tetris/components/tetris-game.tsx` renders the HUD separately above a three-column play layout. At widths up to 680px, `app/globals.css` stacks the previews, board, and controls in one column; the board width becomes up to 82vw. The long page header also consumes mobile height.
- On desktop, the HUD is capped at 930px while the play columns are centered independently. The left preview cards and right controls card have unrelated heights; the provided desktop screenshot shows the resulting misalignment.
- `createGame` fills `nextPieces`, and the view maps the first three entries to `PreviewPiece`. Before a game starts, the component intentionally renders an empty next list. The reported absence **during play** still needs reproduction; do not assume that the pregame empty state is the whole defect.
- Other games implement localized introduction, how-to-play, and controls/assistance sections with feature-specific guide components and shared guide styling. Tetris currently ends after the play area.

## Proposed implementation sequence

1. **Reproduce and isolate the preview defect.** Inspect `/games/tetris` in both languages at mobile and desktop widths. Start a run, then hard-drop and hold several pieces. Check `game.nextPieces`, `PreviewPiece` cells, computed styles, and clipping/overflow separately. Determine whether the queue is absent, the preview is rendered but hidden, or its panel has a layout problem. Capture a failing case before changing the implementation.
2. **Fix the next-piece display.** Correct the confirmed cause in the engine-to-view mapping or CSS. Show a clearly legible first upcoming piece throughout active play, pause, and after hold; keep the ordered additional previews if they fit. Make the pregame state understandable rather than leaving a misleading blank card. Preserve the current seven-bag order and gameplay rules.
3. **Rework the mobile play surface.** Put score and first next-piece preview in a compact, persistent-at-a-glance band close to the board. Give best score, level, lines, and hold a secondary but readable position. Reduce header and card spacing within the play view. Size the board from available width **and** height while preserving 10:20 square cells and a usable minimum cell size. Keep touch controls near the board and maintain at least 44px targets. Ensure the start, pause, and game-over overlays fit inside the resized board.
4. **Align the desktop layout.** Use a shared width and grid for HUD and play area. Align panel top edges and card edges, balance preview/controls dimensions, and keep the board as the clear visual center. Check intermediate tablet widths so columns neither crowd nor jump awkwardly.
5. **Add the lower guide.** Add bilingual “What is Tetris?”, “How to play”, and “Controls and assistance” content in `src/i18n/tetris-content.ts`, with a game-specific guide component under `src/features/tetris/components/`. Follow the semantic section pattern used by 2048 and Sudoku, and explain the actual marathon goal, row clears, next/hold, keyboard/touch inputs, pause, and local best score without contradicting `docs/game-specs/tetris.md`.
6. **Verify the experience.** Test active play, pause/resume, hold, queue progression, and game over at representative small and tall mobile viewports, tablet, and desktop, in Korean and English. Check no horizontal overflow, visible focus, screen-reader labels, preview order, 44px touch targets, and score/next visibility while playing. Add a targeted regression test for the confirmed preview failure if the bug is testable below the browser layer; use browser QA for layout and visibility. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` before a pull request.

## Acceptance criteria

- The first upcoming block is visibly recognizable while playing and updates correctly as pieces spawn or are held.
- On a typical portrait phone, score, first next block, board, and primary touch controls are available together without repeated scrolling during play; the board remains large enough for comfortable play and its cells stay square.
- When viewport height is too small to satisfy both board and touch-target usability, the layout keeps controls operable and permits limited scrolling rather than shrinking the board or targets beyond usability.
- Desktop HUD, previews, board, and controls share consistent alignment, spacing, and visual hierarchy.
- The three lower guide sections appear below the game in both languages, use semantic headings, and match the site's existing guide pattern.
- Existing gameplay, scoring, persistence, keyboard controls, and accessibility continue to work.

## Confirmed mobile tradeoff

- On very short mobile screens, prioritize a comfortable board size and operable controls. Allow limited page scrolling if those cannot fit with score and next-piece preview in one viewport. Do not shrink the board or touch targets just to force a single-screen fit.
