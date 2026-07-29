# Sudoku MVP Plan — 2026-07-27

## Context

Sudoku is the next game being implemented in the browser game collection.
Product decisions were completed collaboratively before Phase 11 began.

## Confirmed requirements

- Use a standard 9×9 Sudoku board with 3×3 boxes.
- Ask the player to choose a difficulty when starting a new game.
- Include Easy, Medium, Hard, and Expert.
- Display the Korean labels as 쉬움, 보통, 어려움, and 전문가.
- Select puzzles from a bundled local set prepared and verified before release.
- Require exactly one solution and a verified difficulty classification for
  every bundled puzzle.
- Require every difficulty, including Expert, to be solvable through approved
  logical techniques without guessing or backtracking.
- Bundle 100 verified puzzles per difficulty, for 400 total.
- Avoid repeats within each difficulty until all 100 puzzles have been
  selected, then begin a new randomized cycle.
- Highlight row, column, and box conflicts immediately without revealing
  non-conflicting wrong answers.
- Do not count or limit mistakes; complete only when every cell is correct.
- Include note mode, erase, unlimited in-game undo/redo, peer and matching-digit
  highlighting, and automatic peer-note removal.
- Allow at most three explanatory logical hints per game. Hints do not fill a
  digit, and hint use does not affect best-time eligibility.
- Start the timer when the puzzle is shown; manual pause or a hidden page stops
  elapsed-time accumulation.
- Manual pause hides the board, and reload restores saved elapsed time with the
  game paused.
- Pausing does not affect best-time eligibility.
- Autosave one unfinished game's entries, notes, remaining hints, and elapsed
  time after every state-changing action.
- On return, offer Continue or New Game while the restored game remains paused.
- Select a new difficulty before confirming replacement of unfinished progress.
- Reset undo/redo history after reload; completion clears only the current save.
- On completion, show difficulty, current time, best time, and a New Best
  indicator for a first or improved record.
- Format time as `MM:SS` below one hour and `H:MM:SS` otherwise.
- Offer same-difficulty new game, different-difficulty selection, and completed
  board viewing; do not add extended statistics.
- On valid completion, show both the current completion time and the best local
  time for that difficulty.
- Preserve the repository's client-only, bilingual, accessible architecture.

## Decision sequence

Resolve one product area at a time and update this plan plus
`docs/game-specs/sudoku.md` after each answer:

1. Difficulty names and player-facing meaning.
2. Puzzle source, generation, uniqueness, and difficulty classification.
3. Entry validation and mistake behavior.
4. Notes, hints, undo, erase, and convenience features.
5. Timer lifecycle, pause behavior, and best-time eligibility.
6. Autosave, resume, and new-game confirmation behavior.
7. Completion experience and statistics.
8. Keyboard, touch, screen-reader, and visual interaction details.

## Agreed product decisions

### 1. Difficulty names

- The four English labels are Easy, Medium, Hard, and Expert.
- The four Korean labels are 쉬움, 보통, 어려움, and 전문가.
- Classify each puzzle by the hardest approved logical technique required to
  solve it, not by clue count alone.
- Easy allows naked singles and hidden singles.
- Medium adds locked candidates and candidate pairs.
- Hard adds candidate triples and X-Wing.
- Expert adds XY-Wing, Swordfish, and logical chains.

### 2. Puzzle construction

- Prepare puzzles ahead of time and ship the verified results as a local set;
  do not generate puzzles in the player's browser.
- Guarantee exactly one solution for every puzzle.
- Store per-difficulty selection history locally so all 100 puzzles are used
  before any repeat; reset only the exhausted difficulty's history for its next
  randomized cycle.
- Validate that every puzzle can be completed by the approved logical solver;
  uniqueness alone is not sufficient.
- Assign difficulty from the hardest required approved technique rather than
  clue count alone.

### 3. Input and mistakes

- Accept provisional digit entries and immediately highlight every duplicated
  digit involved in a row, column, or box conflict.
- Do not compare non-conflicting entries with the solution during play.
- Do not count or limit mistakes.
- Validate completion only when the filled board matches the valid solution.

### 4. Assistance

- Allow candidate digits through a toggleable note mode.
- Provide erase plus unlimited undo and redo within the current game.
- Highlight the selected cell's row, column, and box, plus matching placed
  digits.
- Remove a placed final digit from notes in peer cells automatically.
- Treat a final-digit placement and its automatic note removals as one atomic
  undoable action; undo restores all affected notes.
- Allow at most three hints per game.
- Each hint explains the next logical technique and highlights relevant cells
  or candidates without entering a digit.
- Hint use does not affect best-time eligibility.

### 5. Time and records

- Start timing when the selected puzzle appears.
- Manual pause stops the timer and hides the board until resumed.
- Page visibility loss pauses the timer automatically.
- Reload restores accumulated elapsed time with the game paused.
- Hint use and pausing do not disqualify an otherwise valid completion time.
- Treat the first valid completion as a new best record.
- Display `MM:SS` below one hour and `H:MM:SS` at one hour or above.

### 6. Persistence and navigation

- Keep at most one unfinished game.
- Autosave entries, notes, remaining hints, and accumulated elapsed time after
  every state-changing action.
- Restore the game paused and offer Continue or New Game.
- New Game opens difficulty selection first, then requires confirmation before
  replacing an unfinished game.
- Restore the board and notes after reload but not undo/redo history.
- Clear only the unfinished-game save on completion; retain best times and
  puzzle selection history.
- Do not include completion counts, averages, or statistics beyond the
  per-difficulty best time in the MVP.

### 7. Completion experience

- Show difficulty, current completion time, and updated best time.
- Mark the first completion or a faster completion as New Best.
- Offer New Game at the Same Difficulty, Choose Another Difficulty, and View
  Completed Board.

### 8. Input and accessibility

- Arrow keys move the selected cell.
- Digits 1 through 9 enter a value; `Backspace`, `Delete`, and `0` erase.
- `N` toggles note mode and `P` pauses or resumes.
- `Ctrl`/`Cmd`+`Z` undoes. `Ctrl`/`Cmd`+`Shift`+`Z` and `Ctrl`+`Y` redo.
- Touch digit, note, erase, and hint controls have at least 44×44px targets.
- The semantic grid exposes row, column, given/editable state, value, notes,
  and conflict state to assistive technology.
- Selection, conflict, and focus have non-color indicators, and keyboard focus
  remains visible.
- Announce meaningful game-state changes without repeating every visual update.

## Proposed delivery sequence

The implementation follows this delivery sequence:

1. Finalize the specification and deterministic engine contracts.
2. Build and test the ahead-of-time puzzle preparation pipeline, local puzzle
   loading, uniqueness validation, and difficulty classification.
3. Build the accessible board, input model, and new-game difficulty flow.
4. Add timer, completion validation, and per-difficulty best times.
5. Add agreed assistance features and versioned persistence.
6. Integrate bilingual content, route metadata, catalog, sitemap, and recent
   games.
7. Complete automated verification and desktop/mobile accessibility audits.

## Acceptance criteria

- All 400 bundled puzzles have one solution, pass logical-only solving, and
  match their assigned hardest-technique difficulty.
- A difficulty does not repeat a puzzle within its 100-puzzle cycle; invalid
  local selection history recovers safely.
- Conflict highlighting never reveals a non-conflicting wrong answer, and a
  game completes only when all 81 cells are correct.
- Notes, peer-note removal, erase, undo, and redo preserve exact board state;
  undo restores notes removed by the original action.
- Hints are limited to three, explain and highlight a valid next logical step,
  do not fill a digit, and do not affect best-time eligibility.
- Manual and visibility pauses stop elapsed-time accumulation. Reload restores
  the saved time paused and does not restore undo/redo history.
- Starting a new selected puzzle cannot replace unfinished progress without
  confirmation.
- A valid first completion sets the per-difficulty best time; afterward only a
  lower time replaces it. The dialog uses the agreed actions and time format.
- Every persisted payload is versioned, validated, and isolated from unrelated
  records on failure.
- Korean and English content, keyboard operation, touch targets, semantic grid
  state, focus visibility, non-color indicators, announcements, and reduced
  motion meet repository requirements.
- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass
  before the catalog status changes to available.

## Verification log

- 2026-07-27: User approved continuing into Phase 11.
- Implemented pure 9×9 board validation, row/column/box and peer lookup,
  candidate calculation, complete conflict reporting, completion checks,
  canonical parsing, exact-solution matching, bounded solution counting, and
  bundled-puzzle validation.
- Added deterministic coverage for valid, malformed, conflicting, unsolvable,
  and non-unique puzzles.
- `npm test`: 53 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Implemented deterministic naked-single and hidden-single discovery,
  immutable step application, structured hint context, and a logical solver
  that distinguishes solved, stuck, and invalid boards.
- `npm test`: 58 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Next: add persistent candidate-state eliminations for locked candidates and
  candidate pairs, then classify puzzles solved with those techniques as
  Medium.
- Added immutable persistent candidate state, pointing and claiming locked
  candidates, naked and hidden candidate pairs, and Easy/Medium classification
  from the hardest technique actually used.
- Added synthetic technique tests plus uniquely solvable Medium puzzle
  regressions proving eliminations persist through completion.
- `npm test`: 64 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- Next: implement candidate triples and X-Wing with Hard classification.
- Added naked and hidden candidate triples plus row- and column-based X-Wing
  as immutable elimination steps.
- Added synthetic orientation and subset coverage plus uniquely solvable Hard
  puzzle regressions proving Triple and X-Wing eliminations persist through
  completion and determine Hard classification.
- `npm test`: 70 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- Next: implement XY-Wing, Swordfish, and a bounded logical-chain definition
  with Expert classification.
- Defined the MVP logical-chain boundary as deterministic single-digit
  X-Chains with alternating strong and weak links, simple paths, and a maximum
  of five links.
- Added XY-Wing, row- and column-based Swordfish, and bounded X-Chain
  elimination steps with Expert classification.
- Added synthetic coverage for every Expert technique plus uniquely solvable
  XY-Wing and Swordfish regressions proving eliminations persist through
  completion.
- `npm test`: 76 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Next: create the ahead-of-time puzzle preparation and validation pipeline.
- Added a pure, versioned, atomic Sudoku preparation pipeline plus a
  development-only JSON command.
- Added deterministic rejection for malformed entries, duplicate IDs and
  canonical grids, non-unique or mismatched solutions, logical-solver stalls,
  and declared difficulty mismatches.
- Documented source and bundle formats, stable normalization and ordering, and
  per-difficulty validation summaries.
- `npm test`: 81 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- Next: assemble and validate 100 release puzzles per difficulty, then add the
  lightweight gameplay bundle loader.
- Added a lightweight gameplay-facing bundle loader that validates the version,
  exact artifact shape, canonical grids, solution consistency, duplicates, and
  exactly 100 puzzles per difficulty.
- Kept uniqueness search, logical solving, and difficulty classification
  exclusively in the ahead-of-time preparation pipeline.
- `npm test`: 85 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Next: assemble and validate 100 release puzzles per difficulty and commit the
  generated stable bundle before starting the board UI.
- Added a deterministic release-source assembler with separate verified seeds,
  assembled candidate source, and generated gameplay artifact.
- Generated and atomically accepted 400 puzzles: 100 each for Easy, Medium,
  Hard, and Expert, with zero rejected entries.
- Added a runtime release entry point and regression coverage proving the
  committed gameplay artifact passes the lightweight loader.
- Repeated assembly and preparation produced byte-identical source and bundle
  hashes.
- `npm test`: 86 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Next: build the accessible board interaction slice and bilingual difficulty
  selection before timer and persistence work.
- Added the bilingual Easy, Medium, Hard, and Expert new-game flow backed only
  by the committed 400-puzzle release entry point.
- Added a semantic 9×9 grid with roving keyboard focus, digit and erase
  shortcuts, note mode, peer and matching-digit emphasis, non-color conflict
  indicators, touch controls of at least 44×44px, and polite announcements.
- Added pure game-state transitions and deterministic tests for given-cell
  protection, bounded movement, notes, peer-note removal, provisional
  conflicts, erase, and exact-solution completion.
- Published Sudoku in the central game catalog and sitemap with bilingual
  player copy and route metadata.
- `npm test`: 91 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed with the Sudoku route included.
- Next: add the timer and pause lifecycle plus versioned per-difficulty best
  times before unfinished-game persistence and assistance history.
- Added a deterministic timer model with `MM:SS` and `H:MM:SS` formatting,
  manual pause/resume, automatic page-visibility pause, and completion freeze.
- The paused experience hides and removes the board from interaction, supports
  the `P` shortcut, announces state changes, and moves focus to Resume.
- Added a separately keyed, versioned, exact-shape best-time payload with
  per-difficulty monotonic updates and safe recovery from malformed, blocked,
  or quota-limited storage.
- Completion now shows current time, updated best time, and New Best state, with
  same-difficulty restart, another-difficulty selection, and completed-board
  viewing actions.
- `npm test`: 96 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Next: add atomic undo/redo history for board values and notes, including
  restoration of notes removed by a final-digit placement.
- Added a pure, unlimited snapshot history for player values and notes while
  preserving current selection and note-mode preference outside history.
- Final placements and their automatic peer-note removals are recorded as one
  action; undo restores all affected notes and redo reapplies the full action.
- Rejected given-cell edits and selection changes create no history, while a
  new action after undo clears the redo branch.
- Added accessible Undo and Redo touch controls plus `Ctrl`/`Cmd`+`Z`,
  `Ctrl`/`Cmd`+`Shift`+`Z`, and `Ctrl`+`Y` keyboard handling.
- `npm test`: 100 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Next: add the three-use explanatory logical hint flow and its accessible
  cell/candidate highlighting before persisting the complete active-game shape.
- Added a pure hint request contract backed by the existing deterministic
  logical-step finder, limited to three successful hints per game.
- Each supported technique has bilingual naming and explanation. Related cells
  use a dashed non-color marker and candidate digits receive distinct visual
  emphasis without applying the solver step.
- Conflicting, exhausted, or otherwise unavailable positions do not spend a
  hint. Player value, note, erase, undo, or redo changes clear stale hint
  highlights, while hint use leaves timer and best-time eligibility unchanged.
- `npm test`: 103 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Next: add validated active-game autosave/resume and per-difficulty puzzle
  cycles, then persist the remaining-hint count with the active snapshot.
- Added a separately keyed, exact-shape active-game save containing release
  puzzle identity, board, notes, remaining hints, elapsed time, and timestamp.
- Restore validates every field and original given against the current release
  bundle, resets selection/note mode/history/hint highlighting, and always
  resumes into a paused board.
- Added Continue/New Game return flow and replacement confirmation. Completion
  clears only the active save, preserving records and puzzle history.
- Added an independent per-difficulty puzzle-cycle payload that selects every
  one of the 100 release puzzles before resetting only that difficulty.
- Malformed, blocked, parse-failed, and quota-limited storage paths recover
  independently without deleting unrelated valid data.
- `npm test`: 108 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Next: add the bilingual Sudoku guide, controls, FAQ content, and FAQ
  structured data to finish Phase 12 product integration.
- Added bilingual semantic guide sections for rules, controls, assistance,
  difficulty classification, autosave, pause, and records.
- Added five Korean and English FAQs plus route-level FAQ structured data.
- Confirmed the Sudoku route, metadata, sitemap, recent-game tracking, and
  available catalog entry remain aligned.
- Phase 12 play experience and integration are complete.
- `npm test`: 109 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed without warnings.
- `npm run build`: passed.
- Next: Phase 13 interaction, accessibility, layout, SEO, and release-quality
  audits.
