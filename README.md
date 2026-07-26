# Playground

한국어와 영어를 지원하는 무료 브라우저 게임 모음입니다. 오델로는 로컬
2인 플레이, 세 단계의 컴퓨터 상대, 자동 저장과 통계를 포함한 MVP가
완료되었습니다. 다음 게임인 2048은 명세와 개발 계획을 준비했습니다.

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
- `src/features/<game-id>/`: 게임별 엔진, AI, UI, 저장소
- `docs/`: 아키텍처, 게임 명세, 단계별 계획

전체 로드맵은 `PLANS.md`를 참고하세요. 게임별 요구사항은
`docs/game-specs/othello.md`와 `docs/game-specs/2048.md`에 있습니다.
