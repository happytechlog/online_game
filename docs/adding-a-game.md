# Adding a Game

1. Choose a stable lowercase `game-id` and create
   `src/features/<game-id>/`. Keep rules, UI, AI, and storage in separate
   subdirectories when applicable.
2. Add the title, bilingual description, status, category, route, and visual
   accent to `src/config/games.ts`. The catalog is the only source for site
   cards, search, recommendations, and availability.
3. Add all shared-facing copy to both catalogs in
   `src/i18n/messages.ts`. Do not place translated UI strings in components.
4. Create `app/games/<game-id>/page.tsx` with unique title, description, Open
   Graph data, one H1, and logical H2 sections. Add the route to `app/sitemap.ts`.
5. Document rules and UX in `docs/game-specs/<game-id>.md`.
6. Implement game rules as pure TypeScript. Rule modules must not import React,
   Web Workers, localStorage, timers, or randomness. Inject seeded randomness
   into tests and strategies that need it.
7. Use versioned storage keys such as `online-games:<game-id>:save:v1`.
   Validate parsed JSON at runtime and catch read/write failures.
8. Add engine edge-case tests, interaction tests, bilingual copy, responsive
   styles, and keyboard/touch support.

Before changing a catalog item from `coming-soon` to `available`, verify:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
