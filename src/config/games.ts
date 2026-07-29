export type GameStatus = "available" | "coming-soon";

export interface GameCatalogItem {
  id: "othello" | "2048" | "sudoku" | "minesweeper";
  href: string;
  status: GameStatus;
  featured: boolean;
  accent: string;
  icon: string;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  category: { ko: string; en: string };
}

export const games: readonly GameCatalogItem[] = [
  {
    id: "othello",
    href: "/games/othello",
    status: "available",
    featured: true,
    accent: "emerald",
    icon: "●",
    title: { ko: "오델로", en: "Othello" },
    description: {
      ko: "한 수로 판을 뒤집는 클래식 전략 게임",
      en: "A classic strategy game where one move changes everything",
    },
    category: { ko: "보드 · 전략", en: "Board · Strategy" },
  },
  {
    id: "2048",
    href: "/games/2048",
    status: "available",
    featured: true,
    accent: "amber",
    icon: "2048",
    title: { ko: "2048", en: "2048" },
    description: {
      ko: "숫자를 밀고 합쳐 2048을 만드세요",
      en: "Slide and merge tiles to reach 2048",
    },
    category: { ko: "퍼즐 · 숫자", en: "Puzzle · Numbers" },
  },
  {
    id: "sudoku",
    href: "/games/sudoku",
    status: "available",
    featured: false,
    accent: "violet",
    icon: "9×9",
    title: { ko: "스도쿠", en: "Sudoku" },
    description: {
      ko: "차분하게 채워 나가는 논리 퍼즐",
      en: "A calm, focused puzzle of pure logic",
    },
    category: { ko: "퍼즐 · 논리", en: "Puzzle · Logic" },
  },
  {
    id: "minesweeper",
    href: "/games",
    status: "coming-soon",
    featured: false,
    accent: "sky",
    icon: "✦",
    title: { ko: "지뢰찾기", en: "Minesweeper" },
    description: {
      ko: "숫자 단서로 안전한 칸을 찾아보세요",
      en: "Use number clues to reveal every safe tile",
    },
    category: { ko: "퍼즐 · 추리", en: "Puzzle · Deduction" },
  },
] as const;

export function getGame(gameId: GameCatalogItem["id"]) {
  return games.find((game) => game.id === gameId);
}
