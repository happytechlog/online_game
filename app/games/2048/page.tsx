import type { Metadata } from "next";
import { Game2048 } from "@/src/features/2048/components/2048-game";
import { siteConfig } from "@/src/config/site";
import { game2048Content } from "@/src/i18n/2048-content";

export const metadata: Metadata = {
  title: "2048",
  description:
    "설치 없이 브라우저에서 무료로 즐기는 원작 규칙의 2048 숫자 퍼즐.",
  openGraph: {
    title: `2048 | ${siteConfig.koreanName}`,
    description: "숫자 타일을 밀고 합쳐 2048을 만드는 무료 퍼즐 게임.",
    url: "/games/2048",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  alternates: {
    canonical: "/games/2048",
  },
  keywords: ["2048", "무료 게임", "브라우저 게임", "숫자 퍼즐", "퍼즐 게임"],
};

export default function Game2048Route() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: game2048Content.ko.faqs.map((faq) => ({
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
      <Game2048 />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
    </>
  );
}
