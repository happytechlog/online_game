import type { Metadata } from "next";
import { OthelloGame } from "@/src/features/othello/components/othello-game";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "오델로",
  description:
    "브라우저에서 무료로 즐기는 오델로. 컴퓨터 대전과 같은 기기 2인 플레이를 지원합니다.",
  openGraph: {
    title: `오델로 | ${siteConfig.koreanName}`,
    description: "간단한 규칙과 깊은 전략을 가진 클래식 8×8 보드 게임.",
    url: "/games/othello",
  },
};

export default function OthelloRoute() {
  return <OthelloGame />;
}
