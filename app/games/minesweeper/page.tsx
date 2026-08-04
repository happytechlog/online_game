import type { Metadata } from "next";
import { MinesweeperGame } from "@/src/features/minesweeper/components/minesweeper-game";
import { siteConfig } from "@/src/config/site";
import { minesweeperContent } from "@/src/i18n/minesweeper-content";

export const metadata: Metadata = {
  title: "지뢰찾기 | Minesweeper",
  description: "고전 지뢰찾기를 브라우저에서 즐기세요. 첫 클릭 안전, 저장 게임, 키보드와 모바일 조작을 지원합니다.",
  alternates: { canonical: "/games/minesweeper" },
  openGraph: { title: `지뢰찾기 | ${siteConfig.koreanName}`, description: "A classic Minesweeper puzzle with local saves and accessible controls.", url: "/games/minesweeper", images: [{ url: "/og.png", width: 1536, height: 1024 }] },
  keywords: ["지뢰찾기", "Minesweeper", "browser game", "puzzle"],
};

export default function MinesweeperRoute() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: minesweeperContent.ko.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  return <><MinesweeperGame /><script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c") }} type="application/ld+json" /></>;
}
