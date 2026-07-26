/* eslint-disable @next/next/next-script-for-ga -- Keep the site owner's Google Analytics snippet in the shared head. */
import type { Metadata } from "next";
import { LanguageProvider } from "@/src/components/providers/language-provider";
import { SiteFooter } from "@/src/components/site-footer";
import { SiteHeader } from "@/src/components/site-header";
import { siteConfig } from "@/src/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.koreanName} | 무료 브라우저 게임`,
    template: `%s | ${siteConfig.koreanName}`,
  },
  description: siteConfig.koreanDescription,
  openGraph: {
    type: "website",
    siteName: siteConfig.koreanName,
    title: `${siteConfig.koreanName} | 무료 브라우저 게임`,
    description: siteConfig.koreanDescription,
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.koreanName} | 무료 브라우저 게임`,
    description: siteConfig.koreanDescription,
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-J3JQTW8ZFG"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-J3JQTW8ZFG');
            `,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <a className="skip-link" href="#main-content">
            본문으로 건너뛰기 / Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
