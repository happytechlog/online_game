import type { Metadata } from "next";
import { OthelloGame } from "@/src/features/othello/components/othello-game";
import { siteConfig } from "@/src/config/site";
import { othelloContent } from "@/src/i18n/othello-content";

export const metadata: Metadata = {
  title: "오델로",
  description:
    "브라우저에서 무료로 즐기는 오델로. 컴퓨터 대전과 같은 기기 2인 플레이를 지원합니다.",
  openGraph: {
    title: `오델로 | ${siteConfig.koreanName}`,
    description: "간단한 규칙과 깊은 전략을 가진 클래식 8×8 보드 게임.",
    url: "/games/othello",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  alternates: {
    canonical: "/games/othello",
  },
  keywords: ["오델로", "Othello", "무료 게임", "브라우저 게임", "보드 게임"],
};

export default function OthelloRoute() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: othelloContent.ko.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <OthelloGame />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
    </>
  );
}
