export const siteConfig = {
  name: "Playground",
  koreanName: "플레이그라운드",
  description:
    "Free browser games designed for quick, thoughtful play on any device.",
  koreanDescription:
    "설치 없이 바로 즐기는, 가볍고 깊이 있는 무료 브라우저 게임 모음.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://online-games.example.com",
  operatorBlogUrl: "https://happytlog.com",
} as const;
