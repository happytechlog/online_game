"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/src/components/providers/language-provider";
import { minesweeperContent } from "@/src/i18n/minesweeper-content";
import { markGameAsRecent } from "@/src/storage/recent-games";
import {
  chordCell,
  createMinesweeperGame,
  createSavedMinesweeperGame,
  cycleCellMark,
  deleteMinesweeperGame,
  getAdjacentIndexes,
  getFlagCount,
  getMineCounter,
  getCellPosition,
  loadMinesweeperGame,
  loadMinesweeperRecords,
  moveCellFocus,
  revealCell,
  saveMinesweeperGame,
  saveMinesweeperRecords,
  toggleQuestionMark,
  updateMinesweeperRecord,
  beginMinesweeperPointerInteraction,
  completeMinesweeperLongPress,
  consumeMinesweeperPointerClick,
  shouldAutosaveMinesweeperGame,
  type MinesweeperGameState,
  type MinesweeperPreset,
  type MinesweeperRecords,
} from "../index.ts";

const PRESETS: readonly MinesweeperPreset[] = ["beginner", "intermediate", "advanced"];

function formatTime(seconds: number) { return String(Math.min(999, seconds)).padStart(3, "0"); }
function replace(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

export function MinesweeperGame() {
  const { language } = useLanguage();
  const copy = minesweeperContent[language];
  const [game, setGame] = useState<MinesweeperGameState>(() => createMinesweeperGame());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savedGame, setSavedGame] = useState<ReturnType<typeof loadMinesweeperGame>>(null);
  const [records, setRecords] = useState<MinesweeperRecords>(() => ({ version: 1, times: { beginner: null, intermediate: null, advanced: null } }));
  const [focusIndex, setFocusIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [flagMode, setFlagMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const longPressTimer = useRef<number | null>(null);
  const pointerInteraction = useRef<ReturnType<typeof beginMinesweeperPointerInteraction>>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecords(loadMinesweeperRecords(window.localStorage));
      setSavedGame(loadMinesweeperGame(window.localStorage));
      setHydrated(true);
      markGameAsRecent(window.localStorage, "minesweeper");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }, []);

  useEffect(() => () => clearLongPressTimer(), [clearLongPressTimer]);

  useEffect(() => {
    if (!running || game.phase === "won" || game.phase === "lost") return;
    const interval = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [game.phase, running]);

  useEffect(() => {
    if (!shouldAutosaveMinesweeperGame({ hydrated, hasSavedGameChoice: savedGame !== null, phase: game.phase })) return;
    saveMinesweeperGame(window.localStorage, createSavedMinesweeperGame(game, elapsedSeconds));
  }, [elapsedSeconds, game, hydrated, savedGame]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && running) {
        setRunning(false);
        setAnnouncement(copy.paused);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [copy.paused, running]);

  useEffect(() => {
    cellRefs.current[focusIndex]?.focus();
  }, [focusIndex]);

  const finishIfNeeded = useCallback((next: MinesweeperGameState) => {
    if (next.phase === "won") {
      setRunning(false);
      deleteMinesweeperGame(window.localStorage);
      const result = updateMinesweeperRecord(records, next.preset, elapsedSeconds);
      setRecords(result.records);
      saveMinesweeperRecords(window.localStorage, result.records);
      setAnnouncement(result.isNewBest ? `${copy.won} ${copy.newRecord}` : copy.won);
    } else if (next.phase === "lost") {
      setRunning(false);
      deleteMinesweeperGame(window.localStorage);
      setAnnouncement(copy.lost);
    }
  }, [copy.lost, copy.newRecord, copy.won, elapsedSeconds, records]);

  const updateGame = useCallback((next: MinesweeperGameState, message?: string) => {
    if (next === game) return;
    setGame(next);
    if (message) setAnnouncement(message);
    finishIfNeeded(next);
  }, [finishIfNeeded, game]);

  const canInteract = game.phase === "ready" || (game.phase === "playing" && running);

  const reveal = useCallback((index: number) => {
    if (!canInteract) { setAnnouncement(copy.paused); return; }
    const next = revealCell(game, index);
    if (next !== game && game.phase === "ready") setRunning(true);
    updateGame(next);
  }, [canInteract, copy.paused, game, updateGame]);

  const mark = useCallback((index: number) => { if (!canInteract) { setAnnouncement(copy.paused); return; } updateGame(cycleCellMark(game, index), copy.marked); }, [canInteract, copy.marked, copy.paused, game, updateGame]);
  const question = useCallback((index: number) => { if (!canInteract) { setAnnouncement(copy.paused); return; } updateGame(toggleQuestionMark(game, index), copy.marked); }, [canInteract, copy.marked, copy.paused, game, updateGame]);
  const chord = useCallback((index: number) => {
    if (!canInteract) { setAnnouncement(copy.paused); return; }
    const next = chordCell(game, index);
    updateGame(next, next === game ? copy.mismatch : copy.chorded);
  }, [canInteract, copy.chorded, copy.mismatch, copy.paused, game, updateGame]);

  function startNewGame(preset = game.preset) {
    deleteMinesweeperGame(window.localStorage);
    setGame(createMinesweeperGame(preset)); setElapsedSeconds(0); setRunning(false); setFocusIndex(0); setSelectedIndex(null); setAnnouncement(copy.ready);
  }
  function continueSaved() {
    if (!savedGame) return;
    const restored = savedGame.game;
    setGame(restored); setElapsedSeconds(savedGame.elapsedSeconds); setSavedGame(null); setFocusIndex(0);
    setRunning(restored.phase === "playing");
    setAnnouncement(restored.phase === "playing" ? "" : copy.ready);
  }
  function resumeTimer() { if (game.phase === "playing") { setRunning(true); setAnnouncement(""); } }
  const canChord = selectedIndex !== null && game.cells[selectedIndex]?.revealed && game.cells[selectedIndex].adjacent > 0 && getAdjacentIndexes(game, selectedIndex).filter((index) => game.cells[index].mark === "flagged").length === game.cells[selectedIndex].adjacent;
  const counter = getMineCounter(game);

  function cellLabel(index: number) {
    const cell = game.cells[index]; const position = getCellPosition(game, index);
    let state: string = cell.mark === "flagged" ? copy.flagged : cell.mark === "questioned" ? copy.questioned : copy.covered;
    if (cell.revealed) state = cell.adjacent === 0 ? copy.blank : replace(copy.number, { number: cell.adjacent });
    if (game.phase === "lost" && cell.mine) state = index === game.explodedIndex ? copy.exploded : copy.mine;
    if (game.phase === "lost" && cell.mark === "flagged" && !cell.mine) state = copy.wrongFlag;
    return `${replace(copy.rowColumn, { row: position.row + 1, column: position.column + 1 })}, ${state}`;
  }
  const classForCell = useCallback((index: number) => {
    const cell = game.cells[index];
    return ["minesweeper-cell", cell.revealed ? "revealed" : "", cell.revealed && cell.adjacent > 0 ? `number-${cell.adjacent}` : "", cell.mark, game.phase === "lost" && cell.mine ? "mine" : "", game.explodedIndex === index ? "exploded" : "", game.phase === "lost" && cell.mark === "flagged" && !cell.mine ? "wrong" : ""].filter(Boolean).join(" ");
  }, [game]);
  const cellContents = useCallback((index: number) => {
    const cell = game.cells[index];
    if (game.phase === "lost" && cell.mark === "flagged" && !cell.mine) return "✕";
    if (game.phase === "lost" && cell.mine) return index === game.explodedIndex ? "✹" : "✸";
    if (!cell.revealed) return cell.mark === "flagged" ? "⚑" : cell.mark === "questioned" ? "?" : "";
    return cell.adjacent || "";
  }, [game]);

  const record = records.times[game.preset];
  const boardAspectRatio = game.columns / game.rows;
  const boardWidth = `min(100%, calc(${boardAspectRatio * 100}svh - ${boardAspectRatio * 170}px), ${game.columns * 44 + 6}px)`;
  return <main className="minesweeper-page" id="main-content">
    <header className="shell minesweeper-heading"><Link className="back-link" href="/games">←</Link><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.body}</p></header>
    {!hydrated ? <p className="shell" role="status">…</p> : savedGame ? <section className="shell minesweeper-saved"><h2>{copy.savedTitle}</h2><p>{copy.savedBody}</p><div><button className="button minesweeper-primary" onClick={continueSaved} type="button">{copy.continue}</button><button className="button" onClick={() => { setSavedGame(null); startNewGame(); }} type="button">{copy.newGame}</button></div></section> : <section className="shell minesweeper-layout">
      <div className="minesweeper-play">
        <div className="minesweeper-toolbar">
          <fieldset aria-label={copy.preset} className="minesweeper-presets">
            <legend>{copy.preset}</legend>
            {PRESETS.map((preset) => <button aria-pressed={game.preset === preset} key={preset} onClick={() => startNewGame(preset)} type="button">{copy[preset]}</button>)}
          </fieldset>
          <button aria-label={`${copy.newGame}: ${copy[game.preset]}`} className="minesweeper-face" onClick={() => startNewGame()} type="button">{game.phase === "won" ? "⌣" : game.phase === "lost" ? "☹" : "☺"}</button>
          <div><span>{copy.mineCounter}</span><strong aria-label={`${copy.mineCounter}: ${counter}; ${getFlagCount(game)} ${copy.flags}`}>{formatTime(counter)}</strong></div><div><span>{copy.timer}</span><strong>{formatTime(elapsedSeconds)}</strong></div>
        </div>
        {game.phase === "playing" && !running && <button className="minesweeper-resume" onClick={resumeTimer} type="button">{copy.continue}</button>}
        <div className="minesweeper-scroll"><div aria-colcount={game.columns} aria-label={copy.board} aria-rowcount={game.rows} className="minesweeper-board" role="grid" style={{ gridTemplateColumns: `repeat(${game.columns}, minmax(0, 1fr))`, width: boardWidth }}>
          {game.cells.map((cell, index) => {
            const position = getCellPosition(game, index);
            return <button aria-colindex={position.column + 1} aria-disabled={!canInteract} aria-keyshortcuts="Enter Space F M C ArrowUp ArrowDown ArrowLeft ArrowRight" aria-label={cellLabel(index)} aria-rowindex={position.row + 1} className={classForCell(index)} disabled={!canInteract} key={index} onClick={() => {
              const click = consumeMinesweeperPointerClick(pointerInteraction.current);
              pointerInteraction.current = click.nextInteraction;
              if (click.suppress || !canInteract) return;
              setSelectedIndex(index);
              if (flagMode) mark(index); else if (cell.revealed) chord(index); else reveal(index);
            }} onContextMenu={(event) => { event.preventDefault(); if (!canInteract) return; setSelectedIndex(index); mark(index); }} onFocus={() => setFocusIndex(index)} onKeyDown={(event) => { const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" } as const; if (event.key in directions) { event.preventDefault(); setFocusIndex(moveCellFocus(game, index, directions[event.key as keyof typeof directions])); } else if (event.key === "f" || event.key === "F") { event.preventDefault(); mark(index); } else if (event.key === "m" || event.key === "M") { event.preventDefault(); question(index); } else if (event.key === "c" || event.key === "C") { event.preventDefault(); chord(index); } }} onPointerDown={(event) => { if (!canInteract) return; clearLongPressTimer(); pointerInteraction.current = beginMinesweeperPointerInteraction(event.pointerType); if (pointerInteraction.current) longPressTimer.current = window.setTimeout(() => { pointerInteraction.current = completeMinesweeperLongPress(pointerInteraction.current); mark(index); }, 550); }} onPointerMove={() => { if (pointerInteraction.current?.longPressCompleted) return; clearLongPressTimer(); pointerInteraction.current = null; }} onPointerUp={clearLongPressTimer} onPointerCancel={() => { clearLongPressTimer(); pointerInteraction.current = null; }} ref={(element) => { cellRefs.current[index] = element; }} role="gridcell" tabIndex={index === focusIndex ? 0 : -1} type="button"><span aria-hidden="true">{cellContents(index)}</span></button>;
          })}
        </div></div>
        <div className="minesweeper-mobile-actions"><button aria-pressed={flagMode} onClick={() => setFlagMode((value) => !value)} type="button">⚑ {copy.flagMode}</button><button disabled={!canInteract || !canChord} onClick={() => { if (selectedIndex !== null) chord(selectedIndex); }} type="button">{copy.openAround}</button></div>
        {(game.phase === "won" || game.phase === "lost") && <div aria-label={game.phase === "won" ? copy.won : copy.lost} aria-modal="true" className="minesweeper-result" role="alertdialog"><strong>{game.phase === "won" ? copy.won : copy.lost}</strong><button className="button minesweeper-primary" onClick={() => startNewGame()} type="button">{copy.playAgain}</button></div>}
      </div>
      <aside className="minesweeper-sidebar"><p>{copy.controls}</p><dl><div><dt>{copy.best}</dt><dd>{record === null ? copy.noRecord : formatTime(record)}</dd></div><div><dt>{copy.mineCounter}</dt><dd>{counter}</dd></div></dl><p>{copy.storage}</p></aside>
      <p aria-live="polite" className="sr-only">{announcement}</p>
    </section>}
    <section className="shell minesweeper-guide" aria-labelledby="minesweeper-guide-title"><h2 id="minesweeper-guide-title">{copy.guideTitle}</h2><p>{copy.guideBody}</p><ol>{copy.steps.map((step) => <li key={step}>{step}</li>)}</ol><h2>{copy.faqTitle}</h2>{copy.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
  </main>;
}
