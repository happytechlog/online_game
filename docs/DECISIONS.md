# Architecture Decisions

Record important structural decisions here after they are agreed. Product rules
belong in `docs/game-specs/`, and temporary options belong in dated files under
`docs/plans/`.

## 2026-08-03 — Keep Minesweeper progress and records device-local

### Decision

Minesweeper keeps one unfinished game and per-preset best times in validated,
versioned local storage. The gameplay model otherwise follows the classic
Windows interaction pattern: fixed Beginner, Intermediate, and Advanced
presets; first-click safety; right-click mark cycling; classic chording; and
inline win/loss feedback. Mobile and assistive-technology adaptations use a
Flag mode, an explicit surrounding-cells action, semantic cell state, and
keyboard controls.

### Consequences

- Reload and return visits preserve an unfinished board without an account or
  remote service.
- Best times are device-local and cannot be presented as a global leaderboard.
- The first reveal must be modeled separately from a generated board so the
  clicked cell can be guaranteed safe and the ready state can be saved.
- Narrow screens require an internally scrollable board to preserve 44px
  interaction targets for the fixed Advanced preset.
- The complete behavior contract, including the deliberate classic risk of an
  incorrect-flag chord, lives in `docs/game-specs/minesweeper.md`.

## 2026-07-27 — Bundle pre-verified Sudoku puzzles

### Decision

Sudoku gameplay selects puzzles from a local set prepared before release.
Puzzle generation and verification do not run in the player's browser. Every
bundled puzzle must pass deterministic checks for a unique solution and its
assigned difficulty before it is included. The validation process must also
solve the puzzle to completion with the approved logical-technique catalog;
backtracking may verify uniqueness but cannot qualify a puzzle as logically
solvable or determine its player-facing difficulty. The player-facing rating is
the hardest required approved technique: singles for Easy; locked candidates
and pairs for Medium; triples and X-Wing for Hard; and XY-Wing, Swordfish, or
logical chains for Expert.

### Consequences

- New games start immediately without runtime generation work.
- Released puzzles have stable, testable difficulty classifications.
- Puzzle variety is finite: bundle 100 puzzles per difficulty and persist
  per-difficulty selection history locally to avoid repeats until that
  difficulty's set is exhausted.
- A development-time preparation and validation process is required, but it is
  not part of the shipped gameplay runtime.

## 2026-07-27 — Persist one active Sudoku game

### Decision

Keep at most one unfinished Sudoku game in versioned local storage. Autosave
entries, notes, remaining hints, and accumulated elapsed time after every
state-changing action. Restore it paused with Continue and New Game choices.
Undo and redo history are session-only and reset after reload.

### Consequences

- Reload and return visits preserve meaningful progress without counting
  inactive time.
- Starting a selected new puzzle requires confirmation before unfinished
  progress is replaced.
- Completion clears the active save but preserves per-difficulty best times and
  puzzle selection history.
- Runtime validation must isolate invalid payloads so one damaged record does
  not erase unrelated valid records.

## 2026-07-27 — Bound Expert logical chains to X-Chains

### Decision

The Sudoku MVP interprets the approved Expert "logical chains" technique as a
single-digit X-Chain. Candidate nodes for one digit are connected by strong
links when that digit appears in exactly two cells of a row, column, or box,
and by weak links when the two cells are peers. The solver considers only
simple paths that start and end with a strong link, alternate strong and weak
links, and contain three or five links. If both endpoints see another
candidate for the same digit, that candidate can be eliminated.

Search order is deterministic by digit, cell index, link type, and neighbor
index. Paths cannot repeat a candidate node, and the five-link maximum is part
of the MVP contract.

### Consequences

- Player-facing Expert hints remain finite, reproducible, and explainable as
  one highlighted chain plus its eliminated candidates.
- Backtracking, forcing chains, multi-digit alternating inference chains, and
  chains longer than five links remain outside player-facing classification.
- The preparation pipeline may reject otherwise valid puzzles that require a
  broader chain catalog; bundled Expert puzzles must solve within this bound.

## 2026-07-27 — Make Sudoku bundle preparation atomic and deterministic

### Decision

Keep the preparation logic as a pure, React-independent module and expose it
through a development-only file command. Treat the versioned JSON source as
untrusted input. If any entry fails shape, duplicate, uniqueness, solution,
logical-completion, or difficulty checks, emit no bundle. Normalize grids and
sort accepted puzzles by difficulty and ID before serialization.

### Consequences

- Gameplay can consume a stable local artifact without shipping preparation
  code in its route bundle.
- Reordered equivalent inputs produce the same release artifact.
- A partially valid source cannot accidentally become a partial release set.
- Validation reports remain deterministic and include per-difficulty counts
  for accepted entries.

## 2026-07-28 — Assemble the Sudoku release set reproducibly

### Decision

Build the first 400-puzzle release source from four already verified
difficulty seeds. Deterministically add or exchange givens, apply
Sudoku-preserving row, column, transpose, and digit permutations, and retain
only candidates that still match the seed's declared logical difficulty.
After assembly, pass the complete source through the atomic preparation
pipeline again before producing the gameplay artifact.

Keep the small seed source, assembled release source, generated gameplay
bundle, and assembly command as separate committed inputs and outputs.

### Consequences

- The release source and gameplay bundle can be reproduced without a remote
  generator or external service.
- Every shipped grid is distinct and receives full uniqueness, solution,
  logical-completion, and difficulty validation.
- Variants share ancestry with one verified seed per difficulty. Future bundle
  revisions can add independently sourced seeds without changing the gameplay
  format or loader.


## 2026-09-06 — Geo Benchmark: manual responses and fixed local data

Use manually entered model responses and a fixed photo dataset managed as JSON.
Do not introduce login, a database, a backend, Street View APIs, or automatic
external model calls for this MVP. Prefer static delivery and verify compatibility
with the existing build before finalizing integration.

Photo redistribution terms, sources, and camera coordinates must be verified.
Show round scores immediately and reveal actual locations and answers only
after five rounds. Client-delivered answers are inspectable; delayed display
is a UI rule, not secret-answer security.

Product rules: [Geo Benchmark](game-specs/geo-benchmark.md).
Execution plan: [MVP plan](plans/2026-09-05-geo-benchmark-mvp.md).

## 2026-09-06 — Geo Benchmark local browser UI
Use the existing React/vinext app with client-only benchmark state and bundled photos/JSON. Bundle a Natural Earth v5.1.2 SVG instead of a remote map SDK or tile API. Provide click, pan, zoom, keyboard and numeric coordinate input. Reveal answers and attribution only after five submissions; allow final JSON download with dataset/scoring versions. Reload resets progress. No backend, login, persistence or model API is added. Hosting configuration and deployment remain outside the user-authorized scope.
