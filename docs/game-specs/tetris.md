# Tetris game specification

## Product decisions

- The first release is a single-player marathon mode.
- A run continues until the stack reaches the top of the playfield.
- Use a modern standard Tetris ruleset as the baseline.
- Include line-clear scoring, T-Spins, combo bonuses, and back-to-back bonuses.
- Increase the level and fall speed after every 10 cleared lines.
- Support keyboard and touch input. Mobile play uses on-screen buttons.
- Save the player's best score in the current browser only. No account or online leaderboard.

## Gameplay baseline

- Use the familiar 10-column by 20-visible-row playfield and the seven tetromino shapes.
- Use a modern piece randomizer and rotation system, with wall kicks.
- Provide hold, a ghost landing position, and a next-piece preview.
- Support soft drop and hard drop.
- Start a new run at level 1. Level speed increases through the marathon.
- Show score, level, cleared lines, next piece, held piece, pause state, and game-over state.

## Confirmed engine rules

### Scoring

- Normal line clears score 100 / 300 / 500 / 800 points for 1 / 2 / 3 / 4 lines, multiplied by the level before that clear.
- T-Spin Mini scores 100 / 200 / 400 for 0 / 1 / 2 lines. Full T-Spin scores 400 / 800 / 1,200 / 1,600 for 0 / 1 / 2 / 3 lines. Multiply by the level before the lock.
- A T-Spin requires a T piece whose final player action is a successful rotation; a hard drop may immediately lock it. At least three diagonal pivot corners must be occupied. It is full when both front corners are occupied or the fifth SRS kick succeeded; otherwise it is mini.
- A combo begins with a line-clear placement. The first clear in a chain has no combo bonus; each following consecutive line-clear placement adds 50 × combo step × level. A placement without a line clear resets the combo.
- A four-line clear or any T-Spin line clear is difficult and can continue a back-to-back chain. Each difficult clear after the first adds 50% of its base clear points. A non-difficult line clear breaks the chain; a placement with no line clear leaves back-to-back unchanged.
- Soft drop scores 1 point per manually dropped cell. Hard drop scores 2 points per dropped cell. There is no perfect-clear bonus.

### Level and gravity

- Start at level 1. The level is 1 + floor(total cleared lines / 10).
- One gravity tick is 1/60 second. Levels 1–15 require 60 / 48 / 37 / 28 / 21 / 16 / 12 / 10 / 8 / 6 / 5 / 4 / 3 / 2 / 1 ticks per cell, respectively.
- Level 15 gravity is the maximum speed and remains in effect at higher score levels. The score multiplier level continues increasing.

### Board and piece behavior

- Store a 10 × 24 board: four hidden rows followed by 20 visible rows. Pieces spawn at x=3, y=0.
- Use a deterministic seeded seven-bag queue and Super Rotation System wall kicks, with separate kick tests for I pieces and JLSTZ pieces.
- A held piece can be used once per active piece. Hard drop locks immediately; natural gravity and soft drop use a 500ms lock delay. A successful horizontal move or rotation while grounded resets the delay up to 15 times per piece.
- Do not buffer pre-spawn rotations. Apply input immediately to the current active piece.
- Top out if a piece cannot spawn, or if any occupied cell remains in the hidden rows after a lock and line clear. Check lock-out after clearing rows.

## Controls

- Keyboard: arrow keys move and soft-drop; Up or X rotates clockwise; Z rotates counterclockwise; Space hard-drops; C or Shift holds; P or Escape pauses.
- Touch: visible buttons for left, right, soft drop, rotate, hard drop, hold, and pause.
- Keep touch targets at least 44px and ensure controls remain usable in portrait mobile layout.

## Accessibility and localization

- Provide visible keyboard focus and semantic labels for all controls.
- Support both Korean and English through the existing message catalogs.
- Do not rely on color alone to identify pieces or game states.

## Application integration

- Use the App Router route /games/tetris with game id tetris.
- Keep all Tetris-specific modules under src/features/tetris/; expose a client game component from the feature.
- Add the id and bilingual catalog data to src/config/games.ts, the id validator in src/storage/recent-games.ts, and the canonical URL to app/sitemap.ts.
- Follow the existing feature-specific copy pattern with src/i18n/tetris-content.ts and useLanguage. Keep site-wide labels in src/i18n/messages.ts.
- Reuse src/storage/safe-storage.ts from the browser-only best-score adapter. Do not add a server or remote leaderboard.
