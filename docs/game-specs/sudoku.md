# Sudoku Specification

## Scope

Sudoku is a single-player 9×9 browser puzzle. The player fills empty cells so
that every row, column, and 3×3 box contains the digits 1 through 9 exactly
once.

This document contains only agreed product behavior. Open product questions
remain in `docs/plans/2026-07-27-sudoku-mvp.md` until decided.

## Confirmed product behavior

- Starting a new game includes a difficulty selection.
- The difficulty set includes Easy, Medium, Hard, and Expert.
- The Korean labels are 쉬움, 보통, 어려움, and 전문가, respectively.
- Puzzles are selected from a bundled local set prepared and verified before
  release rather than generated in the player's browser.
- Every bundled puzzle must have exactly one solution and a verified difficulty
  classification.
- Every puzzle, including Expert, must be solvable to completion with approved
  logical techniques. Guessing and backtracking are not valid player-facing
  solution steps.
- Difficulty is determined by the hardest approved technique required by the
  logical solver, not by clue count alone:
  - Easy: naked single and hidden single.
  - Medium: locked candidates and candidate pairs.
  - Hard: candidate triples and X-Wing.
  - Expert: XY-Wing, Swordfish, and logical chains.
- Bundle 100 verified puzzles for each difficulty, for 400 puzzles total.
- Within a difficulty, do not repeat a puzzle until all 100 have been selected.
  After the set is exhausted, reset that difficulty's selection history and
  begin a new randomized cycle.
- A digit that duplicates another digit in the same row, column, or 3×3 box is
  accepted provisionally but its conflicts are highlighted immediately.
- A non-conflicting entry is not compared with the stored solution or exposed
  as incorrect during play.
- Mistakes are neither counted nor limited.
- Completion occurs only when every cell matches the valid solution.
- Players can toggle note mode, enter candidate digits, erase entries, and use
  unlimited undo and redo within the current game.
- Selecting a cell highlights its row, column, and 3×3 box. Selecting or
  entering a digit also highlights matching placed digits.
- Placing a final digit automatically removes that digit from notes in peer
  cells. Undoing the placement restores both the prior cell value and any notes
  removed by that action.
- A player may request at most three hints per game. Each hint explains the
  next available logical technique and highlights the relevant cells or
  candidates without filling a digit automatically.
- Hint use does not affect best-time eligibility.
- The timer starts when the puzzle is displayed.
- Manual pause hides the board and stops elapsed-time accumulation.
- Hiding the page or switching away from its tab pauses the timer
  automatically.
- Reload restores the saved elapsed time with the game paused. The timer
  continues only after the player resumes.
- Pausing does not affect best-time eligibility.
- Keep one unfinished game and autosave its board entries, notes, remaining
  hints, and accumulated elapsed time after each state-changing action.
- Returning to an unfinished game presents Continue and New Game choices while
  the saved game remains paused.
- New Game opens difficulty selection first. If an unfinished game exists,
  starting the selected puzzle requires confirmation before replacing it.
- Reload restores the board and notes but resets undo and redo history.
- Completion removes only the unfinished-game save; best times and puzzle
  selection history remain.
- The completion dialog shows difficulty, current completion time, and the
  updated best time for that difficulty.
- The first valid completion and any faster completion display a New Best
  indicator.
- Format times as `MM:SS` below one hour and `H:MM:SS` at one hour or above.
- Completion actions are New Game at the Same Difficulty, Choose Another
  Difficulty, and View Completed Board.
- Do not include completion count, average time, or other extended statistics
  in the MVP.
- Arrow keys move the selected cell. Digits 1 through 9 enter values,
  `Backspace`, `Delete`, or `0` erase, and `N` toggles note mode.
- `P` pauses or resumes. `Ctrl`/`Cmd`+`Z` undoes, and
  `Ctrl`/`Cmd`+`Shift`+`Z` or `Ctrl`+`Y` redoes.
- Touch controls expose digit, note, erase, and hint actions with targets of at
  least 44×44px.
- A completed puzzle shows the current completion time.
- A completed puzzle also shows the locally stored best completion time for
  that difficulty.
- A lower valid completion time replaces the previous best time for the same
  difficulty.
- Player-visible copy must be available in Korean and English.

## Decision status

The Sudoku MVP product rules are finalized and implementation is in progress.

## Persistence boundary

Best times are device-local and separated by difficulty. The unfinished-game
save and per-difficulty puzzle selection history are also device-local. All
payloads are versioned and validated as untrusted input; an invalid current save
falls back safely without deleting valid best times or selection history.
Accounts, online leaderboards, and remote services are out of scope unless a
later architecture decision explicitly adds them.

## Accessibility

The board uses semantic grid, row, and cell relationships. Each cell exposes
its row, column, given or editable state, placed digit, candidate notes, and
conflict state to assistive technology. Selection, conflict, and focus are
distinguishable without relying on color alone. Focus is always visible during
keyboard operation, status changes are announced without excessive repetition,
and gameplay remains understandable with reduced motion enabled.

## Implementation status

Phase 11 is in progress. Pure board contracts, candidate calculation, conflict
and completion detection, canonical puzzle parsing, exact-solution matching,
bounded solution counting, and bundled-puzzle structural validation are
implemented with deterministic tests. Structured naked-single and hidden-single
steps now support deterministic Easy solving and expose placements, candidates,
related cells, and unit context for future hints. Persistent candidate state,
pointing and claiming locked candidates, naked and hidden candidate pairs, and
Medium classification are also implemented. Naked and hidden candidate triples,
row- and column-based X-Wing, and Hard classification are complete. Expert
classification is complete with XY-Wing, row- and column-based Swordfish, and
deterministic single-digit X-Chains bounded to five links. The preparation
pipeline and verified 400-puzzle bundle remain before gameplay implementation.
