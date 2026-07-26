"use client";

import Link from "next/link";
import { siteConfig } from "@/src/config/site";
import { useLanguage } from "./providers/language-provider";

export function SiteFooter() {
  const { language, t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>
              {language === "ko" ? siteConfig.koreanName : siteConfig.name}
            </span>
          </Link>
          <p>{t("footerTagline")}</p>
        </div>
        <p className="footer-meta">
          © {new Date().getFullYear()} {siteConfig.name}
          <span aria-hidden="true"> · </span>
          {t("footerRights")}
        </p>
      </div>
    </footer>
  );
}
