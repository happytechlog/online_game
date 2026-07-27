"use client";

import { siteConfig } from "@/src/config/site";
import { useLanguage } from "./providers/language-provider";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <span className="footer-owner-label">{t("footerBlogLabel")}</span>
        <a
          className="footer-owner-link"
          href={siteConfig.operatorBlogUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("footerBlogLinkLabel")}
        >
          happy tlog
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  );
}
