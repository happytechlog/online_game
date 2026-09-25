"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLanguage } from "@/src/components/providers/language-provider";
import { tetrisContent } from "@/src/i18n/tetris-content";
import { markGameAsRecent } from "@/src/storage/recent-games";
import type { StorageLike } from "@/src/storage/safe-storage";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  HIDDEN_ROWS,
  advanceGame,
  createEmptyBoard,
  createGame,
  getGhostPiece,
  getLocalCells,
  getPieceCells,
  hardDrop,
  holdActivePiece,
  moveActivePiece,
  pauseGame,
  resumeGame,
  rotateActivePiece,
  softDrop,
  type ActivePiece,
  type PieceType,
  type RotationDirection,
  type TetrisState,
} from "../engine/index.ts";
import {
  loadBestTetrisScore,
  saveBestTetrisScore,
} from "../storage/index.ts";
import { TetrisGuide } from "./tetris-guide";

const EMPTY_BOARD = createEmptyBoard();
const NEXT_PREVIEW_COUNT = 3;

type CellKind = "locked" | "ghost" | "active";
interface DisplayCell {
  type: PieceType;
  kind: CellKind;
}

function getBrowserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function createRandomSeed(): number {
  try {
    const seed = new Uint32Array(1);
    window.crypto.getRandomValues(seed);
    return seed[0] ?? 1;
  } catch {
    return Math.floor(Math.random() * 0x1_0000_0000) >>> 0;
  }
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.closest("input, select, textarea, button, a, [role='button']") !== null
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.closest("input, select, textarea") !== null
  );
}

function placePiece(
  cells: (DisplayCell | null)[],
  piece: ActivePiece,
  kind: CellKind,
) {
  for (const position of getPieceCells(piece)) {
    if (
      position.x < 0 ||
      position.x >= BOARD_WIDTH ||
      position.y < HIDDEN_ROWS ||
      position.y >= BOARD_HEIGHT
    ) {
      continue;
    }

    const index = (position.y - HIDDEN_ROWS) * BOARD_WIDTH + position.x;
    cells[index] = { type: piece.type, kind };
  }
}

function getDisplayCells(game: TetrisState | null): (DisplayCell | null)[] {
  const board = game?.board ?? EMPTY_BOARD;
  const cells = board
    .slice(HIDDEN_ROWS * BOARD_WIDTH)
    .map((type) => (type === null ? null : { type, kind: "locked" as const }));

  if (game?.activePiece) {
    const ghost = getGhostPiece(game);
    if (ghost) placePiece(cells, ghost, "ghost");
    placePiece(cells, game.activePiece, "active");
  }

  return cells;
}

function PreviewPiece({
  piece,
  label,
  emptyLabel,
}: {
  piece: PieceType | null;
  label: string;
  emptyLabel: string;
}) {
  const occupied = useMemo(
    () =>
      new Set(
        piece
          ? getLocalCells(piece, 0).map(({ x, y }) => `${x}:${y}`)
          : [],
      ),
    [piece],
  );

  return (
    <div
      aria-label={`${label}: ${piece ?? emptyLabel}`}
      className="tetris-piece-preview"
      role="img"
    >
      {Array.from({ length: 16 }, (_, index) => {
        const key = `${index % 4}:${Math.floor(index / 4)}`;
        return (
          <span
            aria-hidden="true"
            className={
              occupied.has(key) && piece
                ? `tetris-preview-cell piece-${piece.toLowerCase()}`
                : "tetris-preview-cell"
            }
            key={key}
          />
        );
      })}
      {!piece && <span aria-hidden="true" className="tetris-preview-empty">—</span>}
    </div>
  );
}

function RepeatControl({
  action,
  label,
  shortLabel,
  icon,
  disabled,
}: {
  action: () => void;
  label: string;
  shortLabel: string;
  icon: string;
  disabled: boolean;
}) {
  const delayTimer = useRef<number | null>(null);
  const repeatTimer = useRef<number | null>(null);
  const pointerAction = useRef(false);

  const stopRepeating = useCallback(() => {
    if (delayTimer.current !== null) {
      window.clearTimeout(delayTimer.current);
      delayTimer.current = null;
    }
    if (repeatTimer.current !== null) {
      window.clearInterval(repeatTimer.current);
      repeatTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const handleWindowBlur = () => {
      stopRepeating();
      pointerAction.current = false;
    };
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      stopRepeating();
    };
  }, [stopRepeating]);
  useEffect(() => {
    if (disabled) stopRepeating();
  }, [disabled, stopRepeating]);

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    pointerAction.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The initial action still works if pointer capture is unavailable.
    }
    action();
    delayTimer.current = window.setTimeout(() => {
      repeatTimer.current = window.setInterval(action, 85);
    }, 180);
  }

  function handlePointerUp() {
    stopRepeating();
    window.setTimeout(() => {
      pointerAction.current = false;
    }, 0);
  }

  function handleClick() {
    if (pointerAction.current) {
      pointerAction.current = false;
      return;
    }
    action();
  }

  return (
    <button
      aria-label={label}
      className="tetris-control-button tetris-repeat-control"
      disabled={disabled}
      onClick={handleClick}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      type="button"
    >
      <span aria-hidden="true">{icon}</span>
      <small>{shortLabel}</small>
    </button>
  );
}

function ActionControl({
  action,
  label,
  shortLabel,
  icon,
  disabled,
  className = "",
}: {
  action: () => void;
  label: string;
  shortLabel: string;
  icon: string;
  disabled: boolean;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={`tetris-control-button ${className}`}
      disabled={disabled}
      onClick={action}
      type="button"
    >
      <span aria-hidden="true">{icon}</span>
      <small>{shortLabel}</small>
    </button>
  );
}

export function TetrisGame() {
  const { language } = useLanguage();
  const copy = tetrisContent[language];
  const [game, setGame] = useState<TetrisState | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [storageReady, setStorageReady] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const overlayActionRef = useRef<HTMLButtonElement | null>(null);
  const previousStatus = useRef<TetrisState["status"] | null>(null);
  const keyboardRepeats = useRef(
    new Map<string, { delay: number | null; interval: number | null }>(),
  );
  const scoreFormatter = useMemo(() => new Intl.NumberFormat(language), [language]);
  const currentScore = game?.score ?? 0;
  const displayedScore = currentScore;
  const displayedBest = Math.max(bestScore, displayedScore);
  const isPlaying = game?.status === "playing";
  const cells = useMemo(() => getDisplayCells(game), [game]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storage = getBrowserStorage();
      setBestScore(storage ? loadBestTetrisScore(storage) : 0);
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady || currentScore <= bestScore) return;
    const storage = getBrowserStorage();
    if (storage) saveBestTetrisScore(storage, currentScore);
  }, [bestScore, currentScore, storageReady]);

  useEffect(() => {
    if (game?.status !== "playing") return;

    let previousFrame: number | null = null;
    let frameId = 0;
    const tick = (timestamp: number) => {
      if (previousFrame !== null) {
        const elapsedMs = Math.min(timestamp - previousFrame, 100);
        setGame((current) =>
          current?.status === "playing"
            ? advanceGame(current, elapsedMs)
            : current,
        );
      }
      previousFrame = timestamp;
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [game?.status]);

  const updateGame = useCallback(
    (transition: (current: TetrisState) => TetrisState) => {
      setGame((current) => (current ? transition(current) : current));
    },
    [],
  );

  const startNewGame = useCallback(() => {
    const newBestScore = Math.max(bestScore, currentScore);
    if (newBestScore > bestScore) {
      setBestScore(newBestScore);
      const storage = getBrowserStorage();
      if (storage) saveBestTetrisScore(storage, newBestScore);
    }
    setGame(createGame(createRandomSeed()));
    const storage = getBrowserStorage();
    if (storage) markGameAsRecent(storage, "tetris");
  }, [bestScore, currentScore]);

  const moveLeft = useCallback(
    () => updateGame((current) => moveActivePiece(current, -1)),
    [updateGame],
  );
  const moveRight = useCallback(
    () => updateGame((current) => moveActivePiece(current, 1)),
    [updateGame],
  );
  const dropSoftly = useCallback(
    () => updateGame(softDrop),
    [updateGame],
  );
  const dropHard = useCallback(
    () => updateGame(hardDrop),
    [updateGame],
  );
  const holdPiece = useCallback(
    () => updateGame(holdActivePiece),
    [updateGame],
  );
  const rotate = useCallback(
    (direction: RotationDirection) =>
      updateGame((current) => rotateActivePiece(current, direction)),
    [updateGame],
  );
  const togglePause = useCallback(() => {
    updateGame((current) =>
      current.status === "paused" ? resumeGame(current) : pauseGame(current),
    );
  }, [updateGame]);

  useEffect(() => {
    const status = game?.status ?? null;
    if (status === "paused" || status === "game-over") {
      overlayActionRef.current?.focus();
    } else if (status === "playing" && previousStatus.current !== "playing") {
      boardRef.current?.focus();
    }
    previousStatus.current = status;
  }, [game?.status]);

  useEffect(() => {
    const stopRepeatingKey = (key: string) => {
      const timers = keyboardRepeats.current.get(key);
      if (!timers) return;
      if (timers.delay !== null) window.clearTimeout(timers.delay);
      if (timers.interval !== null) window.clearInterval(timers.interval);
      keyboardRepeats.current.delete(key);
    };

    const stopAllRepeatingKeys = () => {
      for (const key of keyboardRepeats.current.keys()) {
        stopRepeatingKey(key);
      }
    };

    const repeatHeldKey = (
      event: KeyboardEvent,
      action: () => void,
    ) => {
      event.preventDefault();
      if (event.repeat || keyboardRepeats.current.has(event.key)) return;

      action();
      const timers: { delay: number | null; interval: number | null } = {
        delay: null,
        interval: null,
      };
      timers.delay = window.setTimeout(() => {
        timers.delay = null;
        timers.interval = window.setInterval(action, 85);
      }, 180);
      keyboardRepeats.current.set(event.key, timers);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const status = game?.status;
      if (
        !event.defaultPrevented &&
        !event.repeat &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !isEditableTarget(event.target) &&
        (key === "p" || key === "escape")
      ) {
        if (status === "playing" || status === "paused") {
          event.preventDefault();
          togglePause();
        }
        return;
      }

      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isInteractiveTarget(event.target)
      ) {
        return;
      }

      if (!status) {
        if (!event.repeat && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          startNewGame();
        }
        return;
      }
      if (status !== "playing") return;

      const isMovementKey =
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowDown";
      if (event.repeat && !isMovementKey) return;

      switch (event.key) {
        case "ArrowLeft":
          repeatHeldKey(event, moveLeft);
          break;
        case "ArrowRight":
          repeatHeldKey(event, moveRight);
          break;
        case "ArrowDown":
          repeatHeldKey(event, dropSoftly);
          break;
        case "ArrowUp":
        case "x":
        case "X":
          event.preventDefault();
          rotate("clockwise");
          break;
        case "z":
        case "Z":
          event.preventDefault();
          rotate("counterclockwise");
          break;
        case " ":
          event.preventDefault();
          dropHard();
          break;
        case "c":
        case "C":
        case "Shift":
          event.preventDefault();
          holdPiece();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      stopRepeatingKey(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", stopAllRepeatingKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", stopAllRepeatingKeys);
      stopAllRepeatingKeys();
    };
  }, [
    dropHard,
    dropSoftly,
    game?.status,
    holdPiece,
    moveLeft,
    moveRight,
    rotate,
    startNewGame,
    togglePause,
  ]);

  const announcedStatus = !storageReady
    ? copy.loading
    : game?.status === "paused"
      ? copy.pausedTitle
      : game?.status === "game-over"
        ? `${copy.gameOverTitle}. ${copy.gameOverBody.replace(
            "{score}",
            scoreFormatter.format(game.score),
          )}`
        : game?.status === "playing"
          ? copy.gameRunning
          : "";

  return (
    <main className="tetris-page" id="main-content">
      <header className="shell tetris-heading">
        <Link className="back-link" href="/games">
          <span aria-hidden="true">←</span> {copy.backToGames}
        </Link>
        <div className="tetris-title-row">
          <div>
            <span className="tetris-eyebrow">
              <i aria-hidden="true" />
              {copy.eyebrow}
            </span>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
          </div>
          <span className="tetris-badge">{copy.badge}</span>
        </div>
      </header>

      <section
        aria-label={copy.title}
        className="shell tetris-hud"
      >
        <dl className="tetris-hud-list">
          <div className="tetris-stat tetris-stat-score">
            <dt>{copy.score}</dt>
            <dd>{scoreFormatter.format(displayedScore)}</dd>
          </div>
          <div className="tetris-stat">
            <dt>{copy.bestScore}</dt>
            <dd>{scoreFormatter.format(displayedBest)}</dd>
          </div>
          <div className="tetris-stat">
            <dt>{copy.level}</dt>
            <dd>{game?.level ?? 1}</dd>
          </div>
          <div className="tetris-stat">
            <dt>{copy.lines}</dt>
            <dd>{game?.lines ?? 0}</dd>
          </div>
        </dl>
      </section>

      <section className="shell tetris-layout" aria-label={copy.boardLabel}>
        <div className="tetris-preview-stack">
          <section className="tetris-preview-card" aria-label={copy.hold}>
            <h2>{copy.hold}</h2>
            <PreviewPiece
              emptyLabel={copy.noPiece}
              label={copy.hold}
              piece={game?.holdPiece ?? null}
            />
          </section>

          <section className="tetris-preview-card tetris-next-card" aria-label={copy.next}>
            <h2>{copy.next}</h2>
            <ol className="tetris-next-list">
              {(game?.nextPieces ?? []).slice(0, NEXT_PREVIEW_COUNT).map((piece, index) => (
                <li key={`${piece}-${index}`}>
                  <span aria-hidden="true">{index + 1}</span>
                  <PreviewPiece
                    emptyLabel={copy.noPiece}
                    label={copy.nextPieceLabel.replace(
                      "{number}",
                      String(index + 1),
                    )}
                    piece={piece}
                  />
                </li>
              ))}
            </ol>
            {!game && <p className="tetris-next-empty">{copy.nextAfterStart}</p>}
          </section>
        </div>

        <div className="tetris-board-column">
          <div className="tetris-board-card">
            <div
              aria-busy={!storageReady}
              aria-describedby="tetris-keyboard-hint"
              aria-keyshortcuts="ArrowLeft ArrowRight ArrowDown ArrowUp X Z Space C Shift P Escape"
              aria-label={copy.boardLabel}
              className="tetris-board"
              onClick={(event) => event.currentTarget.focus()}
              ref={boardRef}
              role="group"
              tabIndex={0}
            >
              {cells.map((cell, index) => (
                <span
                  aria-hidden="true"
                  className={
                    cell
                      ? `tetris-cell piece-${cell.type.toLowerCase()} ${cell.kind}`
                      : "tetris-cell"
                  }
                  key={index}
                />
              ))}
            </div>

            {!storageReady && (
              <div className="tetris-board-overlay" role="status">
                <span className="tetris-overlay-mark" aria-hidden="true">▦</span>
                <p>{copy.loading}</p>
              </div>
            )}

            {storageReady && !game && (
              <div className="tetris-board-overlay" role="group" aria-labelledby="tetris-start-title">
                <span className="tetris-overlay-mark" aria-hidden="true">▦</span>
                <h2 id="tetris-start-title">{copy.startTitle}</h2>
                <p>{copy.startBody}</p>
                <button
                  className="tetris-primary-button"
                  onClick={startNewGame}
                  type="button"
                >
                  <span aria-hidden="true">▶</span> {copy.startAction}
                </button>
              </div>
            )}

            {game?.status === "paused" && (
              <div className="tetris-board-overlay" role="group" aria-labelledby="tetris-paused-title">
                <span className="tetris-overlay-mark" aria-hidden="true">Ⅱ</span>
                <h2 id="tetris-paused-title">{copy.pausedTitle}</h2>
                <p>{copy.pausedBody}</p>
                <button
                  className="tetris-primary-button"
                  onClick={togglePause}
                  ref={overlayActionRef}
                  type="button"
                >
                  <span aria-hidden="true">▶</span> {copy.resume}
                </button>
              </div>
            )}

            {game?.status === "game-over" && (
              <div className="tetris-board-overlay" role="group" aria-labelledby="tetris-over-title">
                <span className="tetris-overlay-mark" aria-hidden="true">✦</span>
                <h2 id="tetris-over-title">{copy.gameOverTitle}</h2>
                <p>{copy.gameOverBody.replace("{score}", scoreFormatter.format(game.score))}</p>
                <button
                  className="tetris-primary-button"
                  onClick={startNewGame}
                  ref={overlayActionRef}
                  type="button"
                >
                  <span aria-hidden="true">↻</span> {copy.playAgain}
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="tetris-controls-panel" aria-label={copy.controls}>
          <div className="tetris-controls-heading">
            <span aria-hidden="true">⌨</span>
            <h2>{copy.controls}</h2>
          </div>
          <p className="tetris-touch-hint">{copy.touchHint}</p>

          <div className="tetris-movement-controls" aria-label={copy.controls}>
            <RepeatControl
              action={moveLeft}
              disabled={!isPlaying}
              icon="←"
              label={copy.moveLeft}
              shortLabel={copy.leftShort}
            />
            <RepeatControl
              action={dropSoftly}
              disabled={!isPlaying}
              icon="↓"
              label={copy.softDrop}
              shortLabel={copy.downShort}
            />
            <RepeatControl
              action={moveRight}
              disabled={!isPlaying}
              icon="→"
              label={copy.moveRight}
              shortLabel={copy.rightShort}
            />
          </div>

          <div className="tetris-action-controls">
            <ActionControl
              action={() => rotate("counterclockwise")}
              className="tetris-rotate-control"
              disabled={!isPlaying}
              icon="↶"
              label={copy.rotateLeft}
              shortLabel={copy.rotateLeftShort}
            />
            <ActionControl
              action={() => rotate("clockwise")}
              className="tetris-rotate-control"
              disabled={!isPlaying}
              icon="↷"
              label={copy.rotateRight}
              shortLabel={copy.rotateRightShort}
            />
            <ActionControl
              action={holdPiece}
              disabled={!isPlaying}
              icon="H"
              label={copy.holdAction}
              shortLabel={copy.hold}
            />
            <ActionControl
              action={togglePause}
              disabled={!game || game.status === "game-over"}
              icon={game?.status === "paused" ? "▶" : "Ⅱ"}
              label={game?.status === "paused" ? copy.resumeAction : copy.pauseAction}
              shortLabel={game?.status === "paused" ? copy.resume : copy.pause}
            />
          </div>

          <button
            aria-label={copy.hardDrop}
            className="tetris-hard-drop"
            disabled={!isPlaying}
            onClick={dropHard}
            type="button"
          >
            <span aria-hidden="true">⤓</span> {copy.hardDrop}
          </button>
          <button
            className="tetris-new-game"
            disabled={!storageReady}
            onClick={startNewGame}
            type="button"
          >
            <span aria-hidden="true">↻</span> {copy.newGame}
          </button>

          <p className="tetris-keyboard-hint" id="tetris-keyboard-hint">
            {copy.keyboardHint}
          </p>
        </aside>
      </section>

      <p aria-atomic="true" aria-live="polite" className="sr-only">
        {announcedStatus}
      </p>
      <TetrisGuide />
    </main>
  );
}
