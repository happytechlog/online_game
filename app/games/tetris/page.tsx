import type { Metadata } from "next";
import { TetrisGame } from "@/src/features/tetris";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "테트리스 (Tetris)",
  description:
    "설치 없이 브라우저에서 즐기는 무료 테트리스. 블록을 쌓고 가로줄을 지워 최고 점수에 도전하세요.",
  alternates: {
    canonical: "/games/tetris",
  },
  openGraph: {
    title: `테트리스 | ${siteConfig.koreanName}`,
    description: "브라우저에서 바로 즐기는 클래식 블록 퍼즐 게임.",
    url: "/games/tetris",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  keywords: ["테트리스", "Tetris", "무료 게임", "브라우저 게임", "퍼즐 게임"],
};

export default function TetrisRoute() {
  return <TetrisGame />;
}
