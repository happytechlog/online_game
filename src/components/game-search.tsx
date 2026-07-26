"use client";

import { useMemo, useState } from "react";
import { games } from "@/src/config/games";
import { GameCard } from "./game-card";
import { useLanguage } from "./providers/language-provider";

export function GameSearch() {
  const [query, setQuery] = useState("");
  const { language, t } = useLanguage();
  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language);
    if (!normalizedQuery) return games;

    return games.filter((game) =>
      [game.title[language], game.description[language], game.category[language]]
        .join(" ")
        .toLocaleLowerCase(language)
        .includes(normalizedQuery),
    );
  }, [language, query]);

  return (
    <>
      <label className="search-box">
        <span className="sr-only">{t("searchLabel")}</span>
        <span aria-hidden="true">⌕</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          type="search"
          value={query}
        />
      </label>
      {filteredGames.length > 0 ? (
        <div className="games-grid">
          {filteredGames.map((game) => (
            <GameCard game={game} key={game.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">{t("searchEmpty")}</div>
      )}
    </>
  );
}
