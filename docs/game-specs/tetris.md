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

## Rules to make explicit during implementation

- Select and document one consistent modern scoring table, including T-Spin classification, combo, back-to-back eligibility, and drop points.
- Define the gravity interval for each level and the maximum speed. The product decision is that speed rises every 10 lines; the exact curve remains an implementation parameter.
- Specify rotation buffering, lock delay, top-out checks, and piece spawn behavior in deterministic engine tests.

## Controls

- Keyboard: arrow keys move and soft-drop; Up or X rotates clockwise; Z rotates counterclockwise; Space hard-drops; C or Shift holds; P or Escape pauses.
- Touch: visible buttons for left, right, soft drop, rotate, hard drop, hold, and pause.
- Keep touch targets at least 44px and ensure controls remain usable in portrait mobile layout.

## Accessibility and localization

- Provide visible keyboard focus and semantic labels for all controls.
- Support both Korean and English through the existing message catalogs.
- Do not rely on color alone to identify pieces or game states.
