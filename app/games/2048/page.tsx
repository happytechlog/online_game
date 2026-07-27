import type { Metadata } from "next";
import { Game2048 } from "@/src/features/2048/components/2048-game";

export const metadata: Metadata = {
  title: "2048",
  description: "브라우저에서 무료로 즐기는 원작 규칙의 2048 숫자 퍼즐.",
};

export default function Game2048Route() {
  return <Game2048 />;
}
