import type { Metadata } from "next";
import { SudokuGame } from "@/src/features/sudoku/components/sudoku-game";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "스도쿠",
  description:
    "쉬움부터 전문가까지 400개의 검증된 퍼즐을 즐기는 무료 브라우저 스도쿠.",
  openGraph: {
    title: `스도쿠 | ${siteConfig.koreanName}`,
    description: "논리만으로 풀 수 있는 네 가지 난이도의 무료 스도쿠.",
    url: "/games/sudoku",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  alternates: {
    canonical: "/games/sudoku",
  },
  keywords: ["스도쿠", "Sudoku", "무료 게임", "논리 퍼즐", "숫자 퍼즐"],
};

export default function SudokuRoute() {
  return <SudokuGame />;
}
