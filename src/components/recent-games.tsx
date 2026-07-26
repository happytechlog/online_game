"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { games, type GameCatalogItem } from "@/src/config/games";
import { loadRecentGames } from "@/src/storage/recent-games";
import { useLanguage } from "./providers/language-provider";

export function RecentGames() {
  const { language, t } = useLanguage();
  const [recentGameIds, setRecentGameIds] = useState<
    readonly GameCatalogItem["id"][]
  >([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const recent = loadRecentGames(window.localStorage);
      setRecentGameIds(recent?.gameIds ?? []);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const recentGames = recentGameIds
    .map((gameId) => games.find((game) => game.id === gameId))
    .filter(
      (game): game is GameCatalogItem =>
        Boolean(game) && game?.status === "available",
    );

  if (recentGames.length === 0) {
    return (
      <div className="recent-empty">
        <span aria-hidden="true">↻</span>
        <div>
          <strong>{t("recentEmpty")}</strong>
          <p>{t("recentHint")}</p>
        </div>
        <Link className="button button-small" href="/games/othello">
          {t("playNow")}
        </Link>
      </div>
    );
  }

  return (
    <div className="recent-list">
      {recentGames.map((game) => (
        <Link className="recent-game-card" href={game.href} key={game.id}>
          <span className={`recent-game-icon game-art-${game.accent}`}>
            {game.icon}
          </span>
          <span>
            <strong>{game.title[language]}</strong>
            <small>{game.category[language]}</small>
          </span>
          <span className="recent-action">
            {t("continuePlaying")} <i aria-hidden="true">→</i>
          </span>
        </Link>
      ))}
    </div>
  );
}
