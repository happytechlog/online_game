import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("defines all public routes with unique metadata", async () => {
  const [home, games, othello, game2048, sudoku] = await Promise.all([
    source("app/page.tsx"),
    source("app/games/page.tsx"),
    source("app/games/othello/page.tsx"),
    source("app/games/2048/page.tsx"),
    source("app/games/sudoku/page.tsx"),
  ]);

  assert.match(home, /title:\s*"무료 온라인 브라우저 게임"/);
  assert.match(games, /title:\s*"모든 게임"/);
  assert.match(othello, /title:\s*"오델로"/);
  assert.match(game2048, /title:\s*"2048"/);
  assert.match(sudoku, /title:\s*"스도쿠"/);
  assert.match(home, /<HomePage \/>/);
  assert.match(games, /<GamesPage \/>/);
  assert.match(othello, /<OthelloGame \/>/);
  assert.match(game2048, /<Game2048 \/>/);
  assert.match(sudoku, /<SudokuGame \/>/);
});

test("keeps the game catalog centralized and extensible", async () => {
  const catalog = await source("src/config/games.ts");

  for (const id of ["othello", "2048", "sudoku", "minesweeper"]) {
    assert.match(catalog, new RegExp(`id: "${id}"`));
  }

  assert.match(catalog, /status:\s*"available"/);
  assert.match(catalog, /status:\s*"coming-soon"/);
  assert.match(catalog, /title:\s*\{\s*ko:/);
  assert.match(
    catalog,
    /id:\s*"2048"[\s\S]*?href:\s*"\/games\/2048"[\s\S]*?status:\s*"available"/,
  );
  assert.match(
    catalog,
    /id:\s*"sudoku"[\s\S]*?href:\s*"\/games\/sudoku"[\s\S]*?status:\s*"available"/,
  );
});

test("guards versioned language persistence", async () => {
  const [language, provider] = await Promise.all([
    source("src/i18n/language.ts"),
    source("src/components/providers/language-provider.tsx"),
  ]);

  assert.match(language, /online-games:settings:v1/);
  assert.match(language, /value\.version === 1/);
  assert.match(language, /value\.language === "ko"/);
  assert.match(provider, /try\s*\{/);
  assert.match(provider, /window\.localStorage/);
  assert.match(provider, /window\.navigator\.language/);
});

test("publishes crawler discovery files and social artwork", async () => {
  const [layout, robots, sitemap, image] = await Promise.all([
    source("app/layout.tsx"),
    source("app/robots.ts"),
    source("app/sitemap.ts"),
    readFile(new URL("public/og.png", root)),
  ]);

  assert.match(layout, /images:\s*\[\{ url: "\/og\.png"/);
  assert.match(robots, /sitemap/);
  assert.match(sitemap, /games\/othello/);
  assert.match(sitemap, /games\/2048/);
  assert.match(sitemap, /games\/sudoku/);
  assert.ok(image.byteLength > 100_000);
});

test("provides semantic Othello guide and FAQ SEO content", async () => {
  const [guide, content, page] = await Promise.all([
    source("src/features/othello/components/othello-guide.tsx"),
    source("src/i18n/othello-content.ts"),
    source("app/games/othello/page.tsx"),
  ]);

  assert.match(guide, /<section/);
  assert.match(guide, /<h2/);
  assert.match(guide, /<ol/);
  assert.match(guide, /<details/);
  assert.match(content, /introTitle/);
  assert.match(content, /howTitle/);
  assert.match(content, /faqTitle/);
  assert.match(page, /FAQPage/);
  assert.match(page, /application\/ld\+json/);
  assert.match(page, /canonical/);
});

test("provides semantic 2048 guide and FAQ SEO content", async () => {
  const [guide, content, page] = await Promise.all([
    source("src/features/2048/components/2048-guide.tsx"),
    source("src/i18n/2048-content.ts"),
    source("app/games/2048/page.tsx"),
  ]);

  assert.match(guide, /<section/);
  assert.match(guide, /<h2/);
  assert.match(guide, /<ol/);
  assert.match(guide, /<details/);
  assert.match(content, /introTitle/);
  assert.match(content, /howTitle/);
  assert.match(content, /faqTitle/);
  assert.match(page, /FAQPage/);
  assert.match(page, /application\/ld\+json/);
  assert.match(page, /canonical/);
});

test("keeps the 2048 board accessible for keyboard and touch play", async () => {
  const [game, styles] = await Promise.all([
    source("src/features/2048/components/2048-game.tsx"),
    source("app/globals.css"),
  ]);

  assert.match(game, /role="grid"/);
  assert.match(game, /role="row"/);
  assert.match(game, /role="gridcell"/);
  assert.match(game, /aria-keyshortcuts=/);
  assert.match(game, /aria-live="polite"/);
  assert.match(styles, /\.game-2048-board \{[^}]*touch-action: none;/);
  assert.match(styles, /\.game-2048-row \{ display: contents; \}/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("exposes the Sudoku board state and controls accessibly", async () => {
  const [game, styles] = await Promise.all([
    source("src/features/sudoku/components/sudoku-game.tsx"),
    source("app/globals.css"),
  ]);

  assert.match(game, /role="grid"/);
  assert.match(game, /role="row"/);
  assert.match(game, /role="gridcell"/);
  assert.match(game, /aria-rowindex=/);
  assert.match(game, /aria-colindex=/);
  assert.match(game, /aria-keyshortcuts=/);
  assert.match(game, /aria-live="polite"/);
  assert.match(game, /visibilitychange/);
  assert.match(game, /inert=/);
  assert.match(game, /sudoku-pause-panel/);
  assert.match(game, /sudokuCompletionTime/);
  assert.match(game, /Control\+Z/);
  assert.match(game, /sudokuUndo/);
  assert.match(game, /sudokuRedo/);
  assert.match(game, /sudokuHint/);
  assert.match(styles, /\.sudoku-cell\.hint-cell/);
  assert.match(game, /sudokuGivenCell/);
  assert.match(game, /sudokuConflict/);
  assert.match(styles, /\.sudoku-gridcell \{[^}]*min-height: 44px;[^}]*min-width: 44px;/);
  assert.match(styles, /\.sudoku-cell:focus-visible/);
  assert.match(styles, /\.sudoku-cell\.conflict[^}]*text-decoration:/);
});

test("keeps every standard 2048 tile above large-text contrast minimums", async () => {
  const styles = await source("app/globals.css");
  const tileValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

  function luminance(hex) {
    const channels = hex
      .match(/[0-9a-f]{2}/gi)
      .map((channel) => Number.parseInt(channel, 16) / 255)
      .map((channel) =>
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      );
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  for (const value of tileValues) {
    const rule = styles.match(
      new RegExp(`\\.game-2048-cell\\.tile-${value} \\{([^}]*)\\}`),
    );
    assert.ok(rule, `missing tile style for ${value}`);

    const background = rule[1].match(/background:\s*(#[0-9a-f]{6})/i)?.[1];
    const foreground = rule[1].match(/color:\s*(#[0-9a-f]{6})/i)?.[1];
    assert.ok(background, `missing background for ${value}`);
    assert.ok(foreground, `missing foreground for ${value}`);

    const light = Math.max(luminance(background), luminance(foreground));
    const dark = Math.min(luminance(background), luminance(foreground));
    const ratio = (light + 0.05) / (dark + 0.05);
    assert.ok(ratio >= 3, `${value} tile contrast was ${ratio.toFixed(2)}:1`);
  }
});
