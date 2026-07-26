"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/src/components/providers/language-provider";
import {
  chooseBeginnerMove,
  chooseIntermediateMove,
  type AiDifficulty,
  type AiWorkerResponse,
} from "../ai/index.ts";
import {
  createInitialGame,
  getLegalMoves,
  getScore,
  playMove,
  resignGame,
  type OthelloGameState,
  type Player,
} from "../engine/index.ts";

type GameMode = "local" | "computer";

function playerName(player: Player, language: "ko" | "en") {
  if (language === "ko") return player === "black" ? "흑" : "백";
  return player === "black" ? "Black" : "White";
}

function cellLabel(
  index: number,
  cell: Player | null,
  isLegal: boolean,
  language: "ko" | "en",
) {
  const coordinate = `${String.fromCharCode(65 + (index % 8))}${Math.floor(index / 8) + 1}`;
  const state =
    cell === null
      ? language === "ko"
        ? "빈 칸"
        : "empty"
      : playerName(cell, language);
  const legal = isLegal
    ? language === "ko"
      ? ", 착수 가능"
      : ", legal move"
    : "";
  return `${coordinate}, ${state}${legal}`;
}

function findPreviousHumanDecision(
  history: readonly OthelloGameState[],
  humanColor: Player,
) {
  for (let index = history.length - 2; index >= 0; index -= 1) {
    const candidate = history[index];
    if (
      candidate.status === "playing" &&
      candidate.currentPlayer === humanColor
    ) {
      return index;
    }
  }
  return -1;
}

export function OthelloGame() {
  const { language, t } = useLanguage();
  const [history, setHistory] = useState<readonly OthelloGameState[]>(() => [
    createInitialGame(),
  ]);
  const [passedPlayer, setPassedPlayer] = useState<Player | null>(null);
  const [mode, setMode] = useState<GameMode>("computer");
  const [difficulty, setDifficulty] =
    useState<AiDifficulty>("intermediate");
  const [humanColor, setHumanColor] = useState<Player>("black");
  const aiRequestId = useRef(0);
  const state = history[history.length - 1];
  const score = useMemo(() => getScore(state.board), [state.board]);
  const isComputerTurn =
    mode === "computer" &&
    state.status === "playing" &&
    state.currentPlayer !== humanColor;
  const legalMoves = useMemo(
    () =>
      state.status === "playing"
        ? getLegalMoves(state.board, state.currentPlayer)
        : [],
    [state],
  );
  const legalMoveIndexes = useMemo(
    () => new Set(legalMoves.map((move) => move.index)),
    [legalMoves],
  );
  const previousHumanDecision = useMemo(
    () =>
      mode === "computer"
        ? findPreviousHumanDecision(history, humanColor)
        : -1,
    [history, humanColor, mode],
  );
  const canUndo =
    mode === "local" ? history.length > 1 : previousHumanDecision >= 0;

  useEffect(() => {
    if (!isComputerTurn) return;

    const requestId = aiRequestId.current + 1;
    aiRequestId.current = requestId;
    let worker: Worker | null = null;
    let timer: number | null = null;
    let cancelled = false;

    const applyComputerMove = (index: number | null) => {
      if (cancelled || index === null || aiRequestId.current !== requestId) {
        return;
      }
      const result = playMove(state, index);
      if (!result) return;
      setHistory((current) => [...current, result.state]);
      setPassedPlayer(result.passedPlayer);
    };

    if (difficulty === "advanced") {
      worker = new Worker(new URL("../ai/ai.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.onmessage = (event: MessageEvent<AiWorkerResponse>) => {
        if (event.data.id === requestId) applyComputerMove(event.data.move);
      };
      worker.onerror = () => {
        applyComputerMove(
          chooseIntermediateMove(state.board, state.currentPlayer),
        );
      };
      worker.postMessage({
        id: requestId,
        board: state.board,
        player: state.currentPlayer,
        options: { maxDepth: 5, timeLimitMs: 900 },
      });
    } else {
      timer = window.setTimeout(() => {
        const move =
          difficulty === "beginner"
            ? chooseBeginnerMove(state.board, state.currentPlayer)
            : chooseIntermediateMove(state.board, state.currentPlayer);
        applyComputerMove(move);
      }, 420);
    }

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      worker?.terminate();
    };
  }, [difficulty, isComputerTurn, state]);

  function startNewGame() {
    aiRequestId.current += 1;
    setHistory([createInitialGame()]);
    setPassedPlayer(null);
  }

  function changeMode(nextMode: GameMode) {
    setMode(nextMode);
    startNewGame();
  }

  function changeHumanColor(player: Player) {
    setHumanColor(player);
    startNewGame();
  }

  function handleMove(index: number) {
    if (isComputerTurn) return;
    const result = playMove(state, index);
    if (!result) return;

    setHistory((current) => [...current, result.state]);
    setPassedPlayer(result.passedPlayer);
  }

  function undoMove() {
    if (!canUndo) return;
    aiRequestId.current += 1;
    if (mode === "local") {
      setHistory((current) => current.slice(0, -1));
    } else {
      setHistory((current) =>
        current.slice(0, previousHumanDecision + 1),
      );
    }
    setPassedPlayer(null);
  }

  function resign() {
    if (state.status !== "playing" || isComputerTurn) return;
    aiRequestId.current += 1;
    setHistory((current) => [...current, resignGame(state)]);
    setPassedPlayer(null);
  }

  const resultTitle =
    state.winner === "black"
      ? t("blackWins")
      : state.winner === "white"
        ? t("whiteWins")
        : t("drawResult");
  const currentPlayerOwner =
    mode === "computer"
      ? state.currentPlayer === humanColor
        ? t("you")
        : t("computer")
      : null;

  return (
    <main id="main-content" className="othello-page">
      <div className="shell othello-page-heading">
        <Link className="back-link" href="/games">
          <span aria-hidden="true">←</span> {t("backToGames")}
        </Link>
        <div className="othello-title-row">
          <div>
            <span className="section-kicker">{t("othelloEyebrow")}</span>
            <h1>{t("othelloTitle")}</h1>
          </div>
          <span className="local-mode-badge">
            <i aria-hidden="true" />
            {mode === "local" ? t("othelloLocalBadge") : t("computerMode")}
          </span>
        </div>
        <p>{mode === "local" ? t("localModeDescription") : t("othelloBody")}</p>
      </div>

      <section className="shell game-settings" aria-label={t("gameMode")}>
        <div className="setting-group">
          <span>{t("gameMode")}</span>
          <div className="segmented-control">
            <button
              aria-pressed={mode === "computer"}
              onClick={() => changeMode("computer")}
              type="button"
            >
              {t("computerMode")}
            </button>
            <button
              aria-pressed={mode === "local"}
              onClick={() => changeMode("local")}
              type="button"
            >
              {t("localTwoPlayer")}
            </button>
          </div>
        </div>

        {mode === "computer" && (
          <>
            <div className="setting-group">
              <span>{t("difficulty")}</span>
              <div className="segmented-control">
                {(["beginner", "intermediate", "advanced"] as const).map(
                  (level) => (
                    <button
                      aria-pressed={difficulty === level}
                      key={level}
                      onClick={() => setDifficulty(level)}
                      type="button"
                    >
                      {t(level)}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="setting-group">
              <span>{t("humanColor")}</span>
              <div className="segmented-control color-control">
                {(["black", "white"] as const).map((color) => (
                  <button
                    aria-pressed={humanColor === color}
                    key={color}
                    onClick={() => changeHumanColor(color)}
                    type="button"
                  >
                    <i className={`score-disc ${color}`} aria-hidden="true" />
                    {t(color)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <section className="shell othello-game-layout" aria-label={t("othelloTitle")}>
        <div className="othello-board-card">
          <div
            aria-busy={isComputerTurn}
            aria-label={t("boardLabel")}
            className="othello-board"
            role="grid"
          >
            {state.board.map((cell, index) => {
              const isLegal = legalMoveIndexes.has(index);
              const isLastMove = state.lastMove === index;
              return (
                <button
                  aria-label={cellLabel(index, cell, isLegal, language)}
                  className={`othello-cell${isLegal ? " legal" : ""}${isLastMove ? " last-move" : ""}`}
                  disabled={
                    !isLegal || state.status !== "playing" || isComputerTurn
                  }
                  key={index}
                  onClick={() => handleMove(index)}
                  role="gridcell"
                  type="button"
                >
                  {cell && <span className={`othello-disc ${cell}`} />}
                  {isLegal && !isComputerTurn && <span className="legal-marker" />}
                  {isLastMove && <span className="last-move-marker" />}
                </button>
              );
            })}
          </div>

          {isComputerTurn && (
            <div className="ai-thinking" role="status">
              <span className="thinking-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {t("aiThinking")}
            </div>
          )}

          {state.status !== "playing" && (
            <div className="game-result" role="status">
              <span>{t("gameOver")}</span>
              <strong>{resultTitle}</strong>
              <p>
                {t("black")} {score.black} · {t("white")} {score.white}
              </p>
              {state.status === "resigned" && <small>{t("resigned")}</small>}
              <button className="button button-primary" onClick={startNewGame}>
                {t("playAgain")}
              </button>
            </div>
          )}
        </div>

        <aside className="othello-sidebar">
          <div className="turn-card">
            <span className="turn-label">{t("currentTurn")}</span>
            <div className="turn-player">
              <span className={`score-disc ${state.currentPlayer}`} />
              <strong>{playerName(state.currentPlayer, language)}</strong>
              {currentPlayerOwner && <small>{currentPlayerOwner}</small>}
            </div>
            <p>{t("howToPlayShort")}</p>
          </div>

          {passedPlayer && (
            <div className="pass-alert" role="status">
              <span aria-hidden="true">↷</span>
              <p>
                <strong>{playerName(passedPlayer, language)}</strong>
                <br />
                {t("passNotice")}
              </p>
            </div>
          )}

          <div className="score-card">
            <div className="score-row">
              <span className="score-disc black" />
              <span>{t("black")}</span>
              <strong>{score.black}</strong>
            </div>
            <div className="score-row">
              <span className="score-disc white" />
              <span>{t("white")}</span>
              <strong>{score.white}</strong>
            </div>
            <div className="game-facts">
              <span>
                {t("legalMoves")} <strong>{legalMoves.length}</strong>
              </span>
              <span>
                {t("moveCount")} <strong>{state.moveNumber}</strong>
              </span>
            </div>
          </div>

          <div className="game-controls">
            <button className="control-primary" onClick={startNewGame}>
              <span aria-hidden="true">＋</span> {t("newGame")}
            </button>
            <button disabled={!canUndo} onClick={undoMove} type="button">
              <span aria-hidden="true">↶</span> {t("undo")}
            </button>
            <button
              className="danger-control"
              disabled={state.status !== "playing" || isComputerTurn}
              onClick={resign}
              type="button"
            >
              <span aria-hidden="true">◇</span> {t("resign")}
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
