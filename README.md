# Playground

한국어와 영어를 지원하는 무료 브라우저 게임 모음입니다. 현재 1단계
사이트 기반과 오델로 진입 페이지가 구현되어 있으며, 게임 엔진과 플레이
기능은 다음 단계에서 추가합니다.

## 시작하기

Node.js 22.13 이상이 필요합니다.

```bash
npm ci
npm run dev
```

기본 개발 주소는 `http://localhost:3000`입니다.

## 검증

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## 구조

- `app/`: App Router 페이지와 SEO 파일
- `src/components/`: 공통 UI와 언어 Provider
- `src/config/`: 사이트 설정과 중앙 게임 카탈로그
- `src/i18n/`: 한국어·영어 메시지와 언어 선택
- `src/features/<game-id>/`: 향후 게임별 엔진, AI, UI, 저장소
- `docs/`: 아키텍처, 게임 명세, 단계별 계획

전체 로드맵은 `PLANS.md`, 오델로 요구사항은
`docs/game-specs/othello.md`를 참고하세요.
