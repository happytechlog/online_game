# Minesweeper Specification

## Scope

Minesweeper is a single-player browser puzzle based on the classic Windows
interaction model. It has three fixed presets, device-local progress, and
device-local best times. Accounts, online leaderboards, custom boards, hints,
undo, sound, and remote services are out of scope.

## Presets and rules

- Beginner is 9x9 with 10 mines.
- Intermediate is 16x16 with 40 mines.
- Advanced is 30x16 with 99 mines.
- Mines are generated when the first cell is revealed so that the clicked cell
  is safe. Only the clicked cell is guaranteed safe; adjacent cells are not
  reserved.
- Revealing a zero cell recursively reveals adjacent zero cells and their
  numbered boundary cells.
- A covered cell can be marked `covered`, `flagged`, or `questioned`.
- A flagged or questioned cell cannot be revealed until it is covered again.
- Revealing every non-mine cell wins the game; flags are not required for
  victory.
- Revealing a mine loses the game and freezes all input.
- On loss, all mines are revealed and an incorrectly placed flag is shown with
  a distinct wrong-mark indicator. The detonated mine is distinct from other
  mines.
- On win, all mines are automatically flagged, matching the classic result.
- The mine counter is total mines minus flags and may become negative, as in
  the classic game. Its accessible label also exposes the number of flags.

## Controls and feedback

- Desktop primary button reveals a cell.
- Desktop secondary button cycles `covered -> flagged -> questioned -> covered`.
  The board suppresses the browser context menu for this interaction.
- Chording a revealed numbered cell opens adjacent covered cells when the
  number of adjacent flags equals the number. A mismatch is a no-op with a
  brief status message. Incorrect flags therefore retain the classic risk of
  causing a loss when the chord condition appears satisfied.
- The face/restart control starts a new game immediately, matching the
  original. Its accessible name includes the selected preset. The current
  unfinished save is replaced.
- The timer starts on the first reveal, stops when the page is hidden or the
  game ends, and does not count time spent in a restored paused game. There is
  no gameplay pause button in the MVP.
- Results are shown in an inline status panel beside the board rather than a
  blocking modal. The finished board remains inspectable and the primary
  action is a new game.

## Mobile interaction

- A tap reveals a cell.
- A visible Flag mode is the primary way to mark cells; tapping a cell in Flag
  mode performs the same mark cycle as desktop secondary-click.
- A 550ms long press is supported as a shortcut to mark a cell, but it never
  reveals the cell and does not open the browser context menu.
- Chording is replaced by an explicit `Open surrounding cells` action for a
  selected revealed number. The action is disabled when the flag count does
  not match the number.
- The full board scales down from a maximum 44x44px cell size to fit both the
  available width and one viewport height. Intermediate and Advanced boards
  must not require internal or horizontal page scrolling to reach a cell.
- Dense presets may use targets below 44x44px when fitting the entire board is
  required. Keyboard navigation and complete screen-reader labels remain
  available at every size.

## Keyboard and assistive technology

- Arrow keys move a single visible focus within the semantic board grid.
- `Space` or `Enter` reveals the focused cell.
- `F` cycles the focused cell's mark; `C` performs chording when available.
- `M` cycles the question-mark state without revealing the cell.
- A restart button, preset selector, mine counter, timer, and result dialog
  are independently keyboard reachable. The result dialog is fixed to the
  center of the viewport so it remains visible regardless of page scroll.
- Each cell exposes its row, column, covered/revealed state, number or blank
  state, flag/question mark, and terminal mine state. The accessible name does
  not rely on color.
- A polite live region announces meaningful actions and state changes:
  reveal results, mark changes, chord results, loss, win, and new records. It
  does not announce every timer tick or every cell in a flood reveal.
- Focus remains visible, and after restart or restoration the focus location
  is announced. Reduced motion does not remove any gameplay feedback.

## Persistence and records

- Keep at most one unfinished Minesweeper game in
  `online-games:minesweeper:save:v1`.
- The save contains the schema version, preset, phase, generated board when
  available, cell marks and visibility, elapsed active time, and any seed or
  generation data needed to restore the same board.
- A pre-first-click game may be saved without a generated mine layout. The
  first reveal still guarantees that its clicked cell is safe.
- Autosave after every state-changing action. Restore an unfinished game
  paused and offer Continue or New Game.
- Store best times in
  `online-games:minesweeper:records:v1`, separately for each preset. A record
  is the fastest completed time on this device; no online ranking is implied.
- Invalid, unavailable, or unwritable storage must never interrupt play.
  Active save and records recover independently, and all payloads are runtime
  validated.
- Completion removes only the active save and preserves the relevant record.

## Localization and visual language

All player-facing copy exists in Korean and English. Use `지뢰`, `깃발`,
`물음표`, `공개`, and `주변 칸 열기` in Korean; explain `chord` as “주변 칸
열기” rather than exposing the English jargon alone. Use concise cell labels
such as “Row 3, column 5, revealed, number 2” and their Korean equivalent.
Numbers, flags, mines, explosions, and wrong flags use text or symbols in
addition to color.

## Decision status

The MVP product decisions are finalized. Implementation may proceed after the
accessibility and responsive interaction contracts are covered by tests and
manual QA.
