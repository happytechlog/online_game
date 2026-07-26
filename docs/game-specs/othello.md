# Othello Specification

## Scope

Othello is an 8×8 local browser game with two modes: human versus computer and
two humans taking turns on one device. It excludes accounts, remote play,
rooms, matchmaking, WebSockets, and external AI.

## Rules

- Initialize black and white with two center discs each; black moves first.
- A move is legal only when it brackets one or more opposing discs in any of
  eight horizontal, vertical, or diagonal directions.
- Applying a move flips every bracketed line.
- A player with no legal move passes automatically.
- The game ends when both players have no legal moves or the board is full.
- The higher disc count wins; equal counts are a draw.

The engine is immutable, deterministic, and independent of React. Public
operations cover initial state, legal moves, move application, score, pass, and
game-over detection.

## Modes and controls

Players can start a new game, choose black or white against the computer,
choose difficulty, undo, resign, open settings, resume, or delete a saved game.
The board shows legal destinations, last move, current turn, scores, AI status,
passes, and the final result. In AI mode, undo should return to the human's
previous decision by reverting the computer reply and preceding human move when
possible.

## AI

- Beginner selects a random legal move.
- Intermediate evaluates corners, edges, empty-corner adjacency, both players'
  mobility, and phase-sensitive disc counts.
- Advanced uses depth-limited minimax with alpha-beta pruning, phase-aware
  evaluation, deeper endgame search, and a computation deadline in a Web
  Worker. Timeout or failure returns a safe legal fallback.

## Persistence

Use `online-games:othello:save:v1` and
`online-games:othello:stats:v1`. Save the board, turn, mode, difficulty, human
color, move history, and version. Validate JSON shape, board dimensions, cell
values, player values, and version before restoration. Malformed, incomplete,
unknown, or unwritable data must never crash the app.

## Content and accessibility

The page includes bilingual introduction, rules, controls, AI descriptions, and
FAQ as ordinary HTML. All cells expose coordinates and state to assistive
technology. Keyboard and touch input receive equal support; color is never the
only status cue.

## Implementation status

The MVP is complete through Phase 5: local two-player and three AI levels,
worker-based advanced search, validated device-local saves and stats, recent
games, bilingual guide content, FAQ structured data, and responsive
accessibility verification.
