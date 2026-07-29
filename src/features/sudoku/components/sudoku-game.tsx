"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLanguage } from "@/src/components/providers/language-provider";
import { markGameAsRecent } from "@/src/storage/recent-games";
import type { MessageKey } from "@/src/i18n/messages";
import {
  DIGITS,
  createEmptySudokuBestTimes,
  createSudokuHistory,
  createSudokuGame,
  createSudokuTimer,
  enterSudokuDigit,
  eraseSudokuCell,
  finishSudokuTimer,
  formatSudokuTime,
  getCellPosition,
  getConflictIndices,
  getPeerIndices,
  getSudokuElapsedMs,
  loadSudokuBestTimes,
  moveSudokuSelection,
  pauseSudokuTimer,
  recordSudokuAction,
  redoSudokuAction,
  resumeSudokuTimer,
  saveSudokuBestTimes,
  selectSudokuCell,
  sudokuPuzzleBundle,
  toggleSudokuNoteMode,
  undoSudokuAction,
  updateSudokuBestTime,
  type Difficulty,
  type Digit,
  type SudokuBestTimes,
  type SudokuDirection,
  type SudokuGameState,
  type SudokuHistory,
  type SudokuTimer,
} from "../index.ts";

const DIFFICULTIES: readonly {
  value: Difficulty;
  label: MessageKey;
  description: MessageKey;
}[] = [
  {
    value: "easy",
    label: "sudokuEasy",
    description: "sudokuEasyDescription",
  },
  {
    value: "medium",
    label: "sudokuMedium",
    description: "sudokuMediumDescription",
  },
  {
    value: "hard",
    label: "sudokuHard",
    description: "sudokuHardDescription",
  },
  {
    value: "expert",
    label: "sudokuExpert",
    description: "sudokuExpertDescription",
  },
];

function formatMessage(
  template: string,
  values: Readonly<Record<string, string | number>>,
) {
  return Object.entries(values).reduce(
    (message, [key, value]) =>
      message.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function directionFromKey(key: string): SudokuDirection | null {
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (key === "ArrowLeft") return "left";
  if (key === "ArrowRight") return "right";
  return null;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA"
  );
}

function choosePuzzle(difficulty: Difficulty) {
  const matchingPuzzles = sudokuPuzzleBundle.puzzles.filter(
    (puzzle) => puzzle.difficulty === difficulty,
  );
  return matchingPuzzles[
    Math.floor(Math.random() * matchingPuzzles.length)
  ];
}

function currentTimestamp() {
  return Date.now();
}

interface CompletionSummary {
  elapsedMs: number;
  bestTimeMs: number;
  isNewBest: boolean;
}

export function SudokuGame() {
  const { t } = useLanguage();
  const [game, setGame] = useState<SudokuGameState | null>(null);
  const [history, setHistory] = useState<SudokuHistory>(
    createSudokuHistory,
  );
  const [announcement, setAnnouncement] = useState("");
  const [timer, setTimer] = useState<SudokuTimer | null>(null);
  const [clockMs, setClockMs] = useState(0);
  const [bestTimes, setBestTimes] = useState<SudokuBestTimes>(
    createEmptySudokuBestTimes,
  );
  const [completion, setCompletion] =
    useState<CompletionSummary | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pauseActionRef = useRef<HTMLButtonElement | null>(null);
  const completionActionRef = useRef<HTMLButtonElement | null>(null);

  const conflictIndices = useMemo(
    () => new Set(game ? getConflictIndices(game.board) : []),
    [game],
  );
  const selectedIndex = game?.selectedIndex;
  const peerIndices = useMemo(
    () =>
      new Set(
        selectedIndex === null || selectedIndex === undefined
          ? []
          : getPeerIndices(selectedIndex),
      ),
    [selectedIndex],
  );
  const selectedDigit =
    game?.selectedIndex === null || game?.selectedIndex === undefined
      ? null
      : game.board[game.selectedIndex];
  const elapsedMs = timer ? getSudokuElapsedMs(timer, clockMs) : 0;
  const bestTimeMs = game
    ? bestTimes.times[game.puzzle.difficulty]
    : null;

  const updateGame = useCallback(
    (update: (current: SudokuGameState) => SudokuGameState) => {
      setGame((current) => (current ? update(current) : current));
    },
    [],
  );

  const completeGame = useCallback(
    (completedGame: SudokuGameState) => {
      if (!timer || timer.status === "finished") return;
      const now = currentTimestamp();
      const finishedTimer = finishSudokuTimer(timer, now);
      const result = updateSudokuBestTime(
        bestTimes,
        completedGame.puzzle.difficulty,
        finishedTimer.elapsedMs,
      );
      setTimer(finishedTimer);
      setClockMs(now);
      setBestTimes(result.bestTimes);
      saveSudokuBestTimes(window.localStorage, result.bestTimes);
      setCompletion({
        elapsedMs: finishedTimer.elapsedMs,
        bestTimeMs: result.bestTimeMs,
        isNewBest: result.isNewBest,
      });
      setShowCompletion(true);
    },
    [bestTimes, timer],
  );

  const enterDigit = useCallback(
    (digit: Digit) => {
      if (!game) return;
      const nextGame = enterSudokuDigit(game, digit);
      setHistory(recordSudokuAction(history, game, nextGame));
      setGame(nextGame);
      setAnnouncement(
        formatMessage(t("sudokuStatusEntered"), { digit }),
      );
      if (!game.complete && nextGame.complete) {
        completeGame(nextGame);
      }
    },
    [completeGame, game, history, t],
  );

  const erase = useCallback(() => {
    if (!game) return;
    const nextGame = eraseSudokuCell(game);
    setHistory(recordSudokuAction(history, game, nextGame));
    setGame(nextGame);
    setAnnouncement(t("sudokuStatusErased"));
  }, [game, history, t]);

  const undo = useCallback(() => {
    if (!game || timer?.status !== "running") return;
    const result = undoSudokuAction(game, history);
    if (!result.changed) return;
    setGame(result.state);
    setHistory(result.history);
    setAnnouncement(t("sudokuStatusUndone"));
  }, [game, history, t, timer?.status]);

  const redo = useCallback(() => {
    if (!game || timer?.status !== "running") return;
    const result = redoSudokuAction(game, history);
    if (!result.changed) return;
    setGame(result.state);
    setHistory(result.history);
    setAnnouncement(t("sudokuStatusRedone"));
  }, [game, history, t, timer?.status]);

  const togglePause = useCallback(() => {
    if (!timer || timer.status === "finished") return;
    const now = currentTimestamp();
    const next =
      timer.status === "running"
        ? pauseSudokuTimer(timer, now)
        : resumeSudokuTimer(timer, now);
    setTimer(next);
    setClockMs(now);
    setAnnouncement(
      next.status === "paused"
        ? t("sudokuStatusPaused")
        : t("sudokuStatusResumed"),
    );
  }, [t, timer]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      setBestTimes(loadSudokuBestTimes(window.localStorage));
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (timer?.status !== "running") return;
    const tick = window.setInterval(() => {
      setClockMs(currentTimestamp());
    }, 250);
    return () => window.clearInterval(tick);
  }, [timer?.status]);

  useEffect(() => {
    if (!game || !timer || timer.status !== "running") return;

    const handleVisibilityChange = () => {
      if (!document.hidden) return;
      const now = currentTimestamp();
      setTimer((current) =>
        current ? pauseSudokuTimer(current, now) : current,
      );
      setClockMs(now);
      setAnnouncement(t("sudokuStatusAutoPaused"));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [game, t, timer]);

  useEffect(() => {
    if (!game) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (modifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if (event.ctrlKey && key === "y") {
        event.preventDefault();
        redo();
        return;
      }

      if (!event.ctrlKey && !event.metaKey) {
        if (event.key.toLowerCase() === "p") {
          event.preventDefault();
          togglePause();
          return;
        }

        if (timer?.status !== "running") return;

        const direction = directionFromKey(event.key);
        if (direction) {
          event.preventDefault();
          updateGame((current) =>
            moveSudokuSelection(current, direction),
          );
          return;
        }

        if (/^[1-9]$/.test(event.key)) {
          event.preventDefault();
          enterDigit(Number(event.key) as Digit);
          return;
        }

        if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
          event.preventDefault();
          erase();
          return;
        }

        if (event.key.toLowerCase() === "n") {
          event.preventDefault();
          updateGame(toggleSudokuNoteMode);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enterDigit,
    erase,
    game,
    redo,
    timer?.status,
    togglePause,
    undo,
    updateGame,
  ]);

  useEffect(() => {
    if (showCompletion) {
      completionActionRef.current?.focus();
    } else if (timer?.status === "paused") {
      pauseActionRef.current?.focus();
    } else if (
      game?.selectedIndex !== null &&
      game?.selectedIndex !== undefined
    ) {
      cellRefs.current[game.selectedIndex]?.focus();
    }
  }, [game?.selectedIndex, showCompletion, timer?.status]);

  function startGame(difficulty: Difficulty) {
    const now = currentTimestamp();
    setGame(createSudokuGame(choosePuzzle(difficulty)));
    setHistory(createSudokuHistory());
    setTimer(createSudokuTimer(now));
    setClockMs(now);
    setCompletion(null);
    setShowCompletion(false);
    setAnnouncement("");
    markGameAsRecent(window.localStorage, "sudoku");
  }

  function chooseAnotherDifficulty() {
    setGame(null);
    setHistory(createSudokuHistory());
    setTimer(null);
    setCompletion(null);
    setShowCompletion(false);
  }

  function selectCell(index: number) {
    updateGame((current) => selectSudokuCell(current, index));
    const { row, column } = getCellPosition(index);
    setAnnouncement(
      formatMessage(t("sudokuStatusSelected"), {
        row: row + 1,
        column: column + 1,
      }),
    );
  }

  function difficultyLabel(difficulty: Difficulty) {
    const option = DIFFICULTIES.find(
      (candidate) => candidate.value === difficulty,
    );
    return option ? t(option.label) : difficulty;
  }

  return (
    <main className="sudoku-page" id="main-content">
      <header className="shell sudoku-heading">
        <Link className="back-link" href="/games">
          <span aria-hidden="true">←</span>&nbsp; {t("backToGames")}
        </Link>
        <div className="sudoku-title-row">
          <div>
            <span className="eyebrow">
              <i className="eyebrow-dot" />
              {t("sudokuEyebrow")}
            </span>
            <h1>{t("sudokuTitle")}</h1>
            <p>{t("sudokuBody")}</p>
          </div>
          <span className="sudoku-badge">{t("sudokuBadge")}</span>
        </div>
      </header>

      {!game ? (
        <section
          aria-labelledby="sudoku-difficulty-title"
          className="shell sudoku-difficulty-panel"
        >
          <div>
            <span className="sudoku-panel-kicker">{t("newGame")}</span>
            <h2 id="sudoku-difficulty-title">
              {t("sudokuChooseDifficulty")}
            </h2>
            <p>{t("sudokuChooseDifficultyBody")}</p>
          </div>
          <div className="sudoku-difficulty-grid">
            {DIFFICULTIES.map((difficulty, index) => (
              <button
                className={`sudoku-difficulty sudoku-difficulty-${difficulty.value}`}
                key={difficulty.value}
                onClick={() => startGame(difficulty.value)}
                type="button"
              >
                <span aria-hidden="true">0{index + 1}</span>
                <strong>{t(difficulty.label)}</strong>
                <small>{t(difficulty.description)}</small>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section
          aria-label={t("sudokuTitle")}
          className="shell sudoku-layout"
        >
          <div className="sudoku-play">
            <div className="sudoku-game-meta">
              <div>
                <span>{t("sudokuCurrentDifficulty")}</span>
                <strong>{difficultyLabel(game.puzzle.difficulty)}</strong>
              </div>
              <div>
                <span>{t("sudokuElapsedTime")}</span>
                <strong>{formatSudokuTime(elapsedMs)}</strong>
              </div>
              <div>
                <span>{t("sudokuBestTime")}</span>
                <strong>
                  {bestTimeMs === null
                    ? t("sudokuNoBestTime")
                    : formatSudokuTime(bestTimeMs)}
                </strong>
              </div>
            </div>

            <div className="sudoku-board-scroll">
              <div className="sudoku-board-card">
                <div
                  aria-hidden={
                    timer?.status === "paused" ||
                    (game.complete && showCompletion)
                  }
                  aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight 1 2 3 4 5 6 7 8 9 0 Backspace Delete N P Control+Z Meta+Z Control+Shift+Z Meta+Shift+Z Control+Y"
                  aria-label={t("sudokuBoardLabel")}
                  className={`sudoku-board${
                    timer?.status === "paused" ? " paused" : ""
                  }`}
                  inert={
                    timer?.status === "paused" ||
                    (game.complete && showCompletion)
                  }
                  role="grid"
                >
                  {Array.from({ length: 9 }, (_, row) => (
                    <div className="sudoku-row" key={row} role="row">
                      {Array.from({ length: 9 }, (_, column) => {
                        const index = row * 9 + column;
                        const value = game.board[index];
                        const notes = game.notes[index];
                        const selected = game.selectedIndex === index;
                        const conflict = conflictIndices.has(index);
                        const related = peerIndices.has(index);
                        const matching =
                          selectedDigit !== null && value === selectedDigit;
                        const content =
                          value !== null
                            ? formatMessage(t("sudokuPlacedDigit"), {
                                digit: value,
                              })
                            : notes.length > 0
                              ? formatMessage(t("sudokuNotes"), {
                                  notes: notes.join(", "),
                                })
                              : t("sudokuEmptyCell");
                        const label = formatMessage(t("sudokuCellLabel"), {
                          row: row + 1,
                          column: column + 1,
                          state: game.givens[index]
                            ? t("sudokuGivenCell")
                            : t("sudokuEditableCell"),
                          content,
                          conflict: conflict ? t("sudokuConflict") : "",
                        });
                        const className = [
                          "sudoku-cell",
                          game.givens[index] ? "given" : "editable",
                          selected ? "selected" : "",
                          related ? "related" : "",
                          matching ? "matching" : "",
                          conflict ? "conflict" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <div
                            aria-colindex={column + 1}
                            aria-rowindex={row + 1}
                            className="sudoku-gridcell"
                            key={column}
                            role="gridcell"
                          >
                            <button
                              aria-label={label}
                              aria-pressed={selected}
                              className={className}
                              onClick={() => selectCell(index)}
                              ref={(element) => {
                                cellRefs.current[index] = element;
                              }}
                              tabIndex={
                                selected ||
                                (game.selectedIndex === null && index === 0)
                                  ? 0
                                  : -1
                              }
                              type="button"
                            >
                              {value !== null ? (
                                <span className="sudoku-value">{value}</span>
                              ) : (
                                <span aria-hidden="true" className="sudoku-notes">
                                  {DIGITS.map((digit) => (
                                    <i key={digit}>
                                      {notes.includes(digit) ? digit : ""}
                                    </i>
                                  ))}
                                </span>
                              )}
                              {conflict && (
                                <span
                                  aria-hidden="true"
                                  className="sudoku-conflict-mark"
                                >
                                  !
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {timer?.status === "paused" && (
                  <div
                    aria-labelledby="sudoku-paused-title"
                    aria-modal="true"
                    className="sudoku-pause-panel"
                    role="dialog"
                  >
                    <span aria-hidden="true">Ⅱ</span>
                    <strong id="sudoku-paused-title">
                      {t("sudokuPausedTitle")}
                    </strong>
                    <p>{t("sudokuPausedBody")}</p>
                    <button
                      className="button sudoku-primary"
                      onClick={togglePause}
                      ref={pauseActionRef}
                      type="button"
                    >
                      {t("sudokuResume")}
                    </button>
                  </div>
                )}

                {game.complete && completion && showCompletion && (
                  <div
                    aria-labelledby="sudoku-result-title"
                    aria-modal="true"
                    className="game-result sudoku-result"
                    role="dialog"
                  >
                    <span>{t("sudokuTitle")}</span>
                    <strong id="sudoku-result-title">
                      {t("sudokuComplete")}
                    </strong>
                    <p>{t("sudokuCompleteBody")}</p>
                    {completion.isNewBest && (
                      <b className="sudoku-new-best">
                        {t("sudokuNewBest")}
                      </b>
                    )}
                    <dl className="sudoku-result-times">
                      <div>
                        <dt>{t("sudokuCompletionTime")}</dt>
                        <dd>{formatSudokuTime(completion.elapsedMs)}</dd>
                      </div>
                      <div>
                        <dt>{t("sudokuBestTime")}</dt>
                        <dd>{formatSudokuTime(completion.bestTimeMs)}</dd>
                      </div>
                    </dl>
                    <div className="sudoku-result-actions">
                      <button
                        className="button sudoku-primary"
                        onClick={() => startGame(game.puzzle.difficulty)}
                        ref={completionActionRef}
                        type="button"
                      >
                        {t("sudokuSameDifficulty")}
                      </button>
                      <button
                        className="button"
                        onClick={chooseAnotherDifficulty}
                        type="button"
                      >
                        {t("sudokuChooseAnother")}
                      </button>
                      <button
                        className="sudoku-view-board"
                        onClick={() => setShowCompletion(false)}
                        type="button"
                      >
                        {t("sudokuViewCompleted")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="sudoku-sidebar">
            <div className="sudoku-number-pad" aria-label={t("sudokuBoardLabel")}>
              {DIGITS.map((digit) => (
                <button
                  disabled={game.complete || timer?.status !== "running"}
                  key={digit}
                  onClick={() => enterDigit(digit)}
                  type="button"
                >
                  {digit}
                </button>
              ))}
            </div>
            <div className="sudoku-actions">
              <button
                aria-pressed={game.noteMode}
                className={game.noteMode ? "active" : ""}
                disabled={game.complete || timer?.status !== "running"}
                onClick={() => updateGame(toggleSudokuNoteMode)}
                type="button"
              >
                <span aria-hidden="true">✎</span>
                {t("sudokuNoteMode")}
                <small>
                  {game.noteMode
                    ? t("sudokuNoteModeOn")
                    : t("sudokuNoteModeOff")}
                </small>
              </button>
              <button
                disabled={game.complete || timer?.status !== "running"}
                onClick={erase}
                type="button"
              >
                <span aria-hidden="true">⌫</span>
                {t("sudokuErase")}
              </button>
              <button
                disabled={
                  game.complete ||
                  timer?.status !== "running" ||
                  history.past.length === 0
                }
                onClick={undo}
                type="button"
              >
                <span aria-hidden="true">↶</span>
                {t("sudokuUndo")}
              </button>
              <button
                disabled={
                  game.complete ||
                  timer?.status !== "running" ||
                  history.future.length === 0
                }
                onClick={redo}
                type="button"
              >
                <span aria-hidden="true">↷</span>
                {t("sudokuRedo")}
              </button>
              <button
                className="sudoku-pause-action"
                disabled={game.complete}
                onClick={togglePause}
                type="button"
              >
                <span aria-hidden="true">
                  {timer?.status === "paused" ? "▶" : "Ⅱ"}
                </span>
                {timer?.status === "paused"
                  ? t("sudokuResume")
                  : t("sudokuPause")}
              </button>
            </div>
            <p className="sudoku-controls-hint">
              {t("sudokuControlsHint")}
            </p>
            <button
              className="button sudoku-primary sudoku-new-game"
              onClick={chooseAnotherDifficulty}
              type="button"
            >
              <span aria-hidden="true">＋</span>
              {t("sudokuSelectDifficulty")}
            </button>
          </aside>

          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </section>
      )}
    </main>
  );
}
