"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/src/components/providers/language-provider";
import {
  createInitialGame,
  getLegalMoves,
  getScore,
  playMove,
  resignGame,
  type OthelloGameState,
  type Player,
} from "../engine/index.ts";

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

export function OthelloGame() {
  const { language, t } = useLanguage();
  const [history, setHistory] = useState<readonly OthelloGameState[]>(() => [
    createInitialGame(),
  ]);
  const [passedPlayer, setPassedPlayer] = useState<Player | null>(null);
  const state = history[history.length - 1];
  const score = useMemo(() => getScore(state.board), [state.board]);
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

  function startNewGame() {
    setHistory([createInitialGame()]);
    setPassedPlayer(null);
  }

  function handleMove(index: number) {
    const result = playMove(state, index);
    if (!result) return;

    setHistory((current) => [...current, result.state]);
    setPassedPlayer(result.passedPlayer);
  }

  function undoMove() {
    if (history.length <= 1) return;
    setHistory((current) => current.slice(0, -1));
    setPassedPlayer(null);
  }

  function resign() {
    if (state.status !== "playing") return;
    setHistory((current) => [...current, resignGame(state)]);
    setPassedPlayer(null);
  }

  const resultTitle =
    state.winner === "black"
      ? t("blackWins")
      : state.winner === "white"
        ? t("whiteWins")
        : t("drawResult");

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
            {t("othelloLocalBadge")}
          </span>
        </div>
        <p>{t("localModeDescription")}</p>
      </div>

      <section className="shell othello-game-layout" aria-label={t("othelloTitle")}>
        <div className="othello-board-card">
          <div
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
                  disabled={!isLegal || state.status !== "playing"}
                  key={index}
                  onClick={() => handleMove(index)}
                  role="gridcell"
                  type="button"
                >
                  {cell && <span className={`othello-disc ${cell}`} />}
                  {isLegal && <span className="legal-marker" />}
                  {isLastMove && <span className="last-move-marker" />}
                </button>
              );
            })}
          </div>

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
            <button
              disabled={history.length <= 1}
              onClick={undoMove}
              type="button"
            >
              <span aria-hidden="true">↶</span> {t("undo")}
            </button>
            <button
              className="danger-control"
              disabled={state.status !== "playing"}
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
