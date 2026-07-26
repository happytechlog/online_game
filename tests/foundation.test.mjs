import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("defines all phase-one routes with unique metadata", async () => {
  const [home, games, othello] = await Promise.all([
    source("app/page.tsx"),
    source("app/games/page.tsx"),
    source("app/games/othello/page.tsx"),
  ]);

  assert.match(home, /title:\s*"무료 온라인 브라우저 게임"/);
  assert.match(games, /title:\s*"모든 게임"/);
  assert.match(othello, /title:\s*"오델로"/);
  assert.match(home, /<HomePage \/>/);
  assert.match(games, /<GamesPage \/>/);
  assert.match(othello, /<OthelloGame \/>/);
});

test("keeps the game catalog centralized and extensible", async () => {
  const catalog = await source("src/config/games.ts");

  for (const id of ["othello", "2048", "sudoku", "minesweeper"]) {
    assert.match(catalog, new RegExp(`id: "${id}"`));
  }

  assert.match(catalog, /status:\s*"available"/);
  assert.match(catalog, /status:\s*"coming-soon"/);
  assert.match(catalog, /title:\s*\{\s*ko:/);
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
