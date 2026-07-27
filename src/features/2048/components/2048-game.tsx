"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type TouchEvent,
} from "react";
import { useLanguage } from "@/src/components/providers/language-provider";
import {
  continueGame,
  createEmptyBoard,
  createInitialGame,
  createRandomTileSpawner,
  playMove,
  type Direction,
  type Game2048State,
  type TileSpawner,
} from "../engine/index.ts";
import {
  directionFromKey,
  directionFromSwipe,
  type Point,
} from "../input.ts";
import {
  load2048Game,
  loadBest2048Score,
  save2048Game,
  saveBest2048Score,
} from "../storage/index.ts";
import { markGameAsRecent } from "@/src/storage/recent-games";
import { Game2048Guide } from "./2048-guide";

interface GameSession {
  game: Game2048State | null;
  bestScore: number;
  hydrated: boolean;
}

type GameAction =
  | { type: "hydrate"; game: Game2048State; bestScore: number }
  | { type: "start"; game: Game2048State }
  | { type: "move"; direction: Direction; spawner: TileSpawner }
  | { type: "continue" };

const EMPTY_BOARD = createEmptyBoard();

function gameReducer(state: GameSession, action: GameAction): GameSession {
  if (action.type === "hydrate") {
    return {
      game: action.game,
      bestScore: Math.max(action.bestScore, action.game.score),
      hydrated: true,
    };
  }
  if (action.type === "start") {
    return { ...state, game: action.game };
  }
  if (!state.game) return state;

  if (action.type === "continue") {
    return { ...state, game: continueGame(state.game) };
  }

  const result = playMove(state.game, action.direction, action.spawner);
  return {
    ...state,
    game: result.state,
    bestScore: Math.max(state.bestScore, result.state.score),
  };
}

function newRandomGame() {
  return createInitialGame(createRandomTileSpawner(Math.random));
}

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

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA"
  );
}

export function Game2048() {
  const { t } = useLanguage();
  const [session, dispatch] = useReducer(gameReducer, {
    game: null,
    bestScore: 0,
    hydrated: false,
  });
  const touchStart = useRef<Point | null>(null);
  const resultActionRef = useRef<HTMLButtonElement | null>(null);
  const game = session.game;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedGame = load2048Game(window.localStorage);
      dispatch({
        type: "hydrate",
        game: savedGame?.game ?? newRandomGame(),
        bestScore: loadBest2048Score(window.localStorage),
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session.hydrated || !game) return;

    save2048Game(window.localStorage, game);
    saveBest2048Score(window.localStorage, session.bestScore);
    markGameAsRecent(window.localStorage, "2048");
  }, [game, session.bestScore, session.hydrated]);

  const move = useCallback((direction: Direction) => {
    dispatch({
      type: "move",
      direction,
      spawner: createRandomTileSpawner(Math.random),
    });
  }, []);

  useEffect(() => {
    if (game?.status !== "playing") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const direction = directionFromKey(event.key);
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game?.status, move]);

  useEffect(() => {
    if (game?.status === "won" || game?.status === "game-over") {
      resultActionRef.current?.focus();
    }
  }, [game?.status]);

  function startNewGame() {
    dispatch({ type: "start", game: newRandomGame() });
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    if (
      start &&
      directionFromSwipe(
        start,
        { x: touch.clientX, y: touch.clientY },
        12,
      )
    ) {
      event.preventDefault();
    }
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const direction = directionFromSwipe(start, {
      x: touch.clientX,
      y: touch.clientY,
    });
    if (direction) move(direction);
  }

  const board = game?.board ?? EMPTY_BOARD;
  const score = game?.score ?? 0;
  const statusAnnouncement =
    game?.status === "won"
      ? t("game2048Won")
      : game?.status === "game-over"
        ? `${t("gameOver")}. ${t("game2048GameOverBody")}`
        : formatMessage(t("game2048ScoreAnnouncement"), { score });

  return (
    <main className="game-2048-page">
      <header className="shell game-2048-heading">
        <Link className="back-link" href="/games">
          <span aria-hidden="true">←</span>&nbsp; {t("backToGames")}
        </Link>
        <div className="game-2048-title-row">
          <div>
            <span className="eyebrow">
              <i className="eyebrow-dot" />
              {t("game2048Eyebrow")}
            </span>
            <h1>{t("game2048Title")}</h1>
            <p>{t("game2048Body")}</p>
          </div>
          <span className="game-2048-badge">{t("game2048Badge")}</span>
        </div>
      </header>

      <section className="shell game-2048-layout" aria-label={t("game2048Title")}>
        <div className="game-2048-play">
          <div className="game-2048-scoreboard">
            <div>
              <span>{t("currentScore")}</span>
              <strong>{score}</strong>
            </div>
            <div>
              <span>{t("bestScore")}</span>
              <strong>{session.bestScore}</strong>
            </div>
          </div>

          <div className="game-2048-board-card">
            <div
              aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight W A S D"
              aria-label={t("game2048BoardLabel")}
              className="game-2048-board"
              onTouchCancel={() => {
                touchStart.current = null;
              }}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onTouchStart={handleTouchStart}
              role="grid"
              tabIndex={0}
            >
              {[0, 1, 2, 3].map((rowIndex) => (
                <div className="game-2048-row" key={rowIndex} role="row">
                  {board
                    .slice(rowIndex * 4, rowIndex * 4 + 4)
                    .map((tile, columnIndex) => {
                      const row = rowIndex + 1;
                      const column = columnIndex + 1;
                      const value = tile ?? t("game2048EmptyCell");
                      const tileClass =
                        tile === null
                          ? " empty"
                          : tile <= 4096
                            ? ` tile-${tile}`
                            : " tile-super";

                      return (
                        <div
                          aria-label={formatMessage(t("game2048CellLabel"), {
                            row,
                            column,
                            value,
                          })}
                          className={`game-2048-cell${tileClass}`}
                          key={columnIndex}
                          role="gridcell"
                        >
                          {tile !== null && <span>{tile}</span>}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>

            {!game && (
              <div className="game-2048-loading" role="status">
                {t("game2048Loading")}
              </div>
            )}

            {game?.status === "won" && (
              <div
                aria-labelledby="game-2048-result-title"
                className="game-result game-2048-result"
                role="dialog"
              >
                <span>{t("game2048Title")}</span>
                <strong id="game-2048-result-title">{t("game2048Won")}</strong>
                <p>{t("game2048WonBody")}</p>
                <button
                  className="button game-2048-primary"
                  onClick={() => dispatch({ type: "continue" })}
                  ref={resultActionRef}
                  type="button"
                >
                  {t("keepGoing")}
                </button>
              </div>
            )}

            {game?.status === "game-over" && (
              <div
                aria-labelledby="game-2048-result-title"
                className="game-result game-2048-result"
                role="dialog"
              >
                <span>{t("game2048Title")}</span>
                <strong id="game-2048-result-title">{t("gameOver")}</strong>
                <p>{t("game2048GameOverBody")}</p>
                <button
                  className="button game-2048-primary"
                  onClick={startNewGame}
                  ref={resultActionRef}
                  type="button"
                >
                  {t("newGame")}
                </button>
              </div>
            )}
          </div>

          <p aria-live="polite" className="sr-only">
            {statusAnnouncement}
          </p>
        </div>

        <aside className="game-2048-sidebar">
          <div className="game-2048-instructions">
            <span aria-hidden="true">↔</span>
            <p>{t("game2048ControlsHint")}</p>
            <div className="key-cluster" aria-hidden="true">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </div>
          </div>
          <button
            className="button game-2048-primary game-2048-new-game"
            onClick={startNewGame}
            type="button"
          >
            <span aria-hidden="true">＋</span>
            {t("newGame")}
          </button>
        </aside>
      </section>

      <Game2048Guide />
    </main>
  );
}
