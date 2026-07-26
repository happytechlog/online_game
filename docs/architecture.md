# Architecture

## Goals

The application is a static, client-centered Next.js game collection. It has no
application server, database, account system, remote multiplayer, or external
AI. Vercel-compatible App Router pages provide metadata and HTML; games and
device-local state execute in the browser.

## Boundaries

```text
app/                         Routes, layouts, metadata, sitemap, robots
src/components/              Shared site UI and providers
src/config/games.ts          Canonical game catalog
src/config/site.ts           Site name, description, canonical URL
src/i18n/                    Languages, messages, language persistence
src/features/<game-id>/
  engine/                    Pure rules and domain types
  ai/                        Browser AI strategies and worker protocol
  components/                Game-specific React UI
  storage/                   Versioned validation and persistence adapters
  index.ts                   Public feature exports
tests/                       Cross-feature and deployment-oriented tests
docs/game-specs/             Stable game requirements
docs/plans/                  Dated execution plans and progress notes
```

Shared code may depend on catalog and i18n modules. A game feature may depend on
shared UI, but shared code must not import a game implementation. Route files
compose these layers and remain thin.

## Client state and persistence

React context owns language selection. Game sessions use feature-local state
and immutable history. localStorage is read only after hydration through guarded
adapters. Every stored payload has a version and runtime validator; invalid or
unavailable storage falls back to defaults without interrupting play.

Shared safe I/O and the recent-game schema live in `src/storage/`. Othello save,
history validation, and stats remain inside `src/features/othello/storage/`.
The UI pauses autosave when an older save awaits a resume/delete decision, so a
fresh render cannot overwrite recoverable progress.

## Othello execution model

The engine accepts a position and returns legal results without side effects.
Beginner and intermediate AI can run on the main thread within small budgets.
Advanced search uses a Web Worker with request IDs, deadlines, cancellation,
and a deterministic safe fallback. UI components never implement move legality.

## SEO and localization

Each public route exports unique metadata. `src/config/site.ts` is the source
for site identity and canonical URL. Korean is safe server-rendered fallback;
after hydration, the saved language or browser language updates the document
and client-rendered copy.
