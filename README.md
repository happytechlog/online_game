# Playground

한국어와 영어를 지원하는 무료 브라우저 게임 모음입니다. 오델로는 로컬
2인 플레이, 세 단계의 컴퓨터 상대, 자동 저장과 통계를 포함한 MVP가
완료되었습니다. 2048은 원작 규칙의 플레이 화면, 자동 저장, 최고 점수,
최근 게임 연동까지 구현되었으며 최종 출시 품질 점검을 앞두고 있습니다.

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

## Geo Benchmark

`npm run dev` 후 `http://localhost:3000/games/geo-benchmark`에서 실행합니다. 쉬움 5장·보통 15장·어려움 5장으로 구성한 25장 풀에서 게임마다 쉬움 1장 → 보통 3장 → 어려움 1장을 중복 없이 뽑습니다. 선택된 사진 5장의 위치를 지도에서 선택하고 국가/도시(모름 허용), 확신도와 근거를 수동 입력합니다. 각 라운드 점수는 즉시, 정답과 사진 출처는 5라운드 종료 후 표시합니다. 다시 시작하면 새로 추첨합니다. 결과 JSON에는 추첨 시드와 사진 ID도 포함되며 새로고침하면 초기화됩니다.

사진과 기본 지도는 로컬 파일입니다. 기본 화면은 OpenStreetMap 상세 지도를 인터넷으로 불러오며 도시·도로·건물을 확대해서 볼 수 있습니다. 연결이 없으면 기본 지도(오프라인)로 전환할 수 있습니다. API 키·로그인·DB가 필요 없습니다. 기존 vinext 빌드/실행 구조를 사용합니다. 호스팅 설정이나 배포는 수행하지 않았습니다.
