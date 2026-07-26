import type { Metadata } from "next";
import { HomePage } from "@/src/components/home-page";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = {
  title: "무료 온라인 브라우저 게임",
  description: siteConfig.koreanDescription,
  openGraph: {
    title: `${siteConfig.koreanName} | 무료 온라인 브라우저 게임`,
    description: siteConfig.koreanDescription,
    url: "/",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main id="main-content">
      <HomePage />
    </main>
  );
}
