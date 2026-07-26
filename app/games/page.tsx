import type { Metadata } from "next";
import { GamesPage } from "@/src/components/games-page";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "모든 게임",
  description:
    "오델로, 2048, 스도쿠, 지뢰찾기 등 무료 브라우저 게임을 찾아보세요.",
  openGraph: {
    title: `모든 게임 | ${siteConfig.koreanName}`,
    description:
      "설치 없이 브라우저에서 바로 즐기는 무료 퍼즐과 보드 게임 모음.",
    url: "/games",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  alternates: { canonical: "/games" },
};

export default function GamesRoute() {
  return <GamesPage />;
}
