# Repository Guidelines

## Project Structure

Routes use the Next.js App Router under `app/`. Shared UI belongs in
`src/components/`, site-wide configuration in `src/config/`, and localization
code in `src/i18n/`. Keep each game self-contained under
`src/features/<game-id>/`; React-independent rules, AI, storage adapters, and UI
should be separate modules. The canonical game list is `src/config/games.ts`.
Long-lived decisions belong in `docs/`; game-specific behavior belongs in
`docs/game-specs/`.

## Development Commands

- `npm ci` installs the exact locked dependency set.
- `npm run dev` starts the local development site.
- `npm test` runs automated tests.
- `npm run lint` checks Next.js and TypeScript lint rules.
- `npm run typecheck` performs strict TypeScript checking.
- `npm run build` produces the deployment build.

Run test, lint, typecheck, and build before opening a pull request.

## Code Style & Architecture

Use TypeScript with strict types and two-space indentation. Use `camelCase` for
variables/functions, `PascalCase` for components/types, and `kebab-case` for
route and asset names. Prefer named exports. Keep game engines pure and
deterministic: they must not import React, browser APIs, or storage. Browser-only
modules must guard access to `window`, `navigator`, and `localStorage`.

All user-facing copy must exist in both Korean and English message catalogs.
Maintain semantic HTML, visible focus states, keyboard operation, and touch
targets of at least 44px. Do not add a server, database, authentication, remote
multiplayer, or external AI service without an explicit architecture decision.

## Testing

Place cross-cutting tests in `tests/` and feature tests beside the feature or in
`tests/<game-id>/`. Name tests `*.test.ts` or `*.test.mjs`. Cover pure rules,
edge cases, invalid persisted data, and regressions. AI tests must use seeded or
deterministic positions rather than timing assumptions.

## Commits & Pull Requests

Use short Conventional Commit subjects such as `feat(othello): add legal move
search`. Pull requests should describe player-visible changes, link issues,
list verification commands, and include screenshots for UI changes. Call out
storage schema, accessibility, dependency, and SEO changes.

## Security & Persistence

Never commit secrets. Treat localStorage as untrusted input: version keys,
validate every field, recover safely, and handle quota or parse failures.
