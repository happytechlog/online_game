"use client";

import { GameSearch } from "./game-search";
import { useLanguage } from "./providers/language-provider";

export function GamesPage() {
  const { t } = useLanguage();

  return (
    <main id="main-content">
      <section className="page-hero shell">
        <span className="section-kicker">{t("browseGames")}</span>
        <h1>{t("allGamesTitle")}</h1>
        <p>{t("allGamesBody")}</p>
      </section>
      <section className="section shell" aria-label={t("allGamesTitle")}>
        <GameSearch />
      </section>
    </main>
  );
}
