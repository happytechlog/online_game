"use client";

import { siteConfig } from "@/src/config/site";
import { useLanguage } from "./providers/language-provider";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-group">
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
        <div className="footer-group">
          <span className="footer-owner-label">{t("footerSitesLabel")}</span>
          <ul className="footer-site-list">
            <li>
              <a
                className="footer-owner-link"
                href={siteConfig.operatorToolsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("footerToolsLinkLabel")}
              >
                {t("footerToolsName")}
                <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li>
              <a
                className="footer-owner-link"
                href={siteConfig.operatorLooplistUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("footerLooplistLinkLabel")}
              >
                {t("footerLooplistName")}
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
