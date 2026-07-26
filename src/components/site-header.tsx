"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/src/config/site";
import { useLanguage } from "./providers/language-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label={siteConfig.koreanName}>
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>{language === "ko" ? siteConfig.koreanName : siteConfig.name}</span>
        </Link>

        <nav className="primary-nav" aria-label="Primary">
          <Link
            className={pathname === "/" ? "active" : undefined}
            href="/"
          >
            {t("navHome")}
          </Link>
          <Link
            className={pathname.startsWith("/games") ? "active" : undefined}
            href="/games"
          >
            {t("navGames")}
          </Link>
        </nav>

        <div className="language-switcher" aria-label={t("language")}>
          <button
            aria-pressed={language === "ko"}
            onClick={() => setLanguage("ko")}
            type="button"
          >
            KO
          </button>
          <button
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
            type="button"
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
