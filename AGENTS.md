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

## 컨텍스트 관리

- 진행 상황은 짧고 명확하게 보고한다.
- 요청이 없으면 파일 전체나 긴 명령 실행 로그를 대화에 출력하지 않는다.
- 테스트 결과와 오류는 원인 및 관련 내용만 요약한다.
- 중요한 구조 결정은 docs/DECISIONS.md에 기록한다.
- 의미 있는 기능을 완료했거나 새 작업을 권장하기 전에는 NEXT_TASK.md를 갱신한다.

## 계획 작업

- 사용자가 계획만 요청한 경우에는 제품 결정과 문서만 갱신하고 구현 파일은 수정하지 않는다.
- 확정된 게임 규칙은 `docs/game-specs/`에, 미결정 질문과 실행 순서는
  `docs/plans/`의 날짜별 계획에 기록한다.
- 사용자 결정이 필요한 항목을 임의로 확정하지 않는다.
