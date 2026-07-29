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
  enterSudokuDigit,
  eraseSudokuCell,
  getCellPosition,
  getConflictIndices,
  getPeerIndices,
  moveSudokuSelection,
  selectSudokuCell,
  sudokuPuzzleBundle,
  toggleSudokuNoteMode,
  createSudokuGame,
  type Difficulty,
  type Digit,
  type SudokuDirection,
  type SudokuGameState,
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

export function SudokuGame() {
  const { t } = useLanguage();
  const [game, setGame] = useState<SudokuGameState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

  const updateGame = useCallback(
    (update: (current: SudokuGameState) => SudokuGameState) => {
      setGame((current) => (current ? update(current) : current));
    },
    [],
  );

  const enterDigit = useCallback(
    (digit: Digit) => {
      updateGame((current) => enterSudokuDigit(current, digit));
      setAnnouncement(
        formatMessage(t("sudokuStatusEntered"), { digit }),
      );
    },
    [t, updateGame],
  );

  const erase = useCallback(() => {
    updateGame(eraseSudokuCell);
    setAnnouncement(t("sudokuStatusErased"));
  }, [t, updateGame]);

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

      if (!event.ctrlKey && !event.metaKey) {
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
  }, [enterDigit, erase, game, updateGame]);

  useEffect(() => {
    if (game?.selectedIndex !== null && game?.selectedIndex !== undefined) {
      cellRefs.current[game.selectedIndex]?.focus();
    }
  }, [game?.selectedIndex]);

  function startGame(difficulty: Difficulty) {
    setGame(createSudokuGame(choosePuzzle(difficulty)));
    setAnnouncement("");
    markGameAsRecent(window.localStorage, "sudoku");
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
              <span>{t("sudokuCurrentDifficulty")}</span>
              <strong>{difficultyLabel(game.puzzle.difficulty)}</strong>
            </div>

            <div className="sudoku-board-scroll">
              <div className="sudoku-board-card">
                <div
                  aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight 1 2 3 4 5 6 7 8 9 0 Backspace Delete N"
                  aria-label={t("sudokuBoardLabel")}
                  className="sudoku-board"
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

                {game.complete && (
                  <div
                    aria-labelledby="sudoku-result-title"
                    className="game-result sudoku-result"
                    role="dialog"
                  >
                    <span>{t("sudokuTitle")}</span>
                    <strong id="sudoku-result-title">
                      {t("sudokuComplete")}
                    </strong>
                    <p>{t("sudokuCompleteBody")}</p>
                    <button
                      className="button sudoku-primary"
                      onClick={() => setGame(null)}
                      type="button"
                    >
                      {t("sudokuStartAnother")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="sudoku-sidebar">
            <div className="sudoku-number-pad" aria-label={t("sudokuBoardLabel")}>
              {DIGITS.map((digit) => (
                <button
                  disabled={game.complete}
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
                disabled={game.complete}
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
                disabled={game.complete}
                onClick={erase}
                type="button"
              >
                <span aria-hidden="true">⌫</span>
                {t("sudokuErase")}
              </button>
            </div>
            <p className="sudoku-controls-hint">
              {t("sudokuControlsHint")}
            </p>
            <button
              className="button sudoku-primary sudoku-new-game"
              onClick={() => setGame(null)}
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
