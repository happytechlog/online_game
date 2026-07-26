"use client";

import Link from "next/link";
import type { GameCatalogItem } from "@/src/config/games";
import { useLanguage } from "./providers/language-provider";

export function GameCard({
  game,
  featured = false,
}: {
  game: GameCatalogItem;
  featured?: boolean;
}) {
  const { language, t } = useLanguage();
  const isAvailable = game.status === "available";
  const content = (
    <>
      <div className={`game-art game-art-${game.accent}`}>
        <span aria-hidden="true">{game.icon}</span>
        {game.id === "othello" && <i aria-hidden="true" />}
      </div>
      <div className="game-card-body">
        <div className="game-card-meta">
          <span>{game.category[language]}</span>
          <span
            className={`status-pill ${isAvailable ? "status-live" : ""}`}
          >
            {isAvailable ? t("availableNow") : t("comingSoon")}
          </span>
        </div>
        <h3>{game.title[language]}</h3>
        <p>{game.description[language]}</p>
        {isAvailable && (
          <span className="card-action">
            {t("playNow")} <span aria-hidden="true">→</span>
          </span>
        )}
      </div>
    </>
  );

  const className = `game-card ${featured ? "game-card-featured" : ""}`;
  return isAvailable ? (
    <Link className={className} href={game.href}>
      {content}
    </Link>
  ) : (
    <article className={`${className} game-card-disabled`}>{content}</article>
  );
}
