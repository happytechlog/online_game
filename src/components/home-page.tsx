"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { games } from "@/src/config/games";
import { GameCard } from "./game-card";
import { useLanguage } from "./providers/language-provider";
import { RecentGames } from "./recent-games";

const availableGames = games.filter((game) => game.status === "available");

export function HomePage() {
  const { language, t } = useLanguage();
  const [featuredGames, setFeaturedGames] = useState(() => availableGames.slice(0, 3));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const shuffled = [...availableGames];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }
      setFeaturedGames(shuffled.slice(0, 3));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {t("featuredEyebrow")}
          </div>
          <h1>
            {t("heroTitleStart")}{" "}
            <em>{t("heroTitleAccent")}</em>
            {t("heroTitleEnd")}
          </h1>
          <p>{t("heroBody")}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/games/tetris">
              {t("playNow")} <span aria-hidden="true">→</span>
            </Link>
            <Link className="button button-secondary" href="/games">
              {t("browseGames")}
            </Link>
          </div>
        </div>
        <div className="hero-board" aria-hidden="true">
          <div className="board-glow" />
          <div className="hero-art-card hero-art-tetris">
            <span>{games.find((game) => game.id === "tetris")?.title[language]}</span>
          </div>
          <div className="hero-art-card hero-art-geo">
            <span>{games.find((game) => game.id === "geo-benchmark")?.title[language]}</span>
          </div>
          <div className="hero-art-card hero-art-minesweeper">
            <span>{games.find((game) => game.id === "minesweeper")?.title[language]}</span>
          </div>
        </div>
      </section>

      <section className="section shell" aria-labelledby="featured-games">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t("featuredEyebrow")}</span>
            <h2 id="featured-games">{t("featuredTitle")}</h2>
            <p>{t("featuredBody")}</p>
          </div>
          <Link className="text-link" href="/games">
            {t("navGames")} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="featured-grid">
          {featuredGames.map((game) => (
            <GameCard featured game={game} key={game.id} />
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Continue</span>
              <h2>{t("recentTitle")}</h2>
            </div>
          </div>
          <RecentGames />
        </div>
      </section>
    </>
  );
}
