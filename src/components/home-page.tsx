"use client";

import Link from "next/link";
import { games } from "@/src/config/games";
import { GameCard } from "./game-card";
import { useLanguage } from "./providers/language-provider";
import { RecentGames } from "./recent-games";

export function HomePage() {
  const { t } = useLanguage();
  const featuredGames = games.filter((game) => game.featured);

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
            <Link className="button button-primary" href="/games/othello">
              {t("playNow")} <span aria-hidden="true">→</span>
            </Link>
            <Link className="button button-secondary" href="/games">
              {t("browseGames")}
            </Link>
          </div>
        </div>
        <div className="hero-board" aria-hidden="true">
          <div className="board-glow" />
          <div className="mini-board">
            {Array.from({ length: 36 }, (_, index) => (
              <span className="mini-cell" key={index}>
                {[7, 14, 15, 20, 21, 28].includes(index) && (
                  <i
                    className={[14, 21, 28].includes(index) ? "white" : "black"}
                  />
                )}
              </span>
            ))}
          </div>
          <span className="floating-chip chip-one">2048</span>
          <span className="floating-chip chip-two">9×9</span>
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
