"use client";

import Link from "next/link";
import { useLanguage } from "./providers/language-provider";

export function OthelloPlaceholder() {
  const { t } = useLanguage();

  return (
    <main id="main-content">
      <section className="othello-hero shell">
        <div className="othello-copy">
          <Link className="back-link" href="/games">
            ← {t("backToGames")}
          </Link>
          <span className="section-kicker">{t("othelloEyebrow")}</span>
          <h1>{t("othelloTitle")}</h1>
          <p>{t("othelloBody")}</p>
          <div className="mode-list">
            <strong>{t("modes")}</strong>
            <span>● {t("localMode")}</span>
            <span>● {t("aiMode")}</span>
          </div>
        </div>
        <div className="placeholder-panel">
          <div className="placeholder-board" aria-hidden="true">
            {Array.from({ length: 64 }, (_, index) => (
              <span key={index}>
                {[27, 28, 35, 36].includes(index) && (
                  <i
                    className={[28, 35].includes(index) ? "white" : "black"}
                  />
                )}
              </span>
            ))}
          </div>
          <div className="placeholder-message">
            <span className="status-pulse" />
            <div>
              <h2>{t("othelloStatus")}</h2>
              <p>{t("othelloStatusBody")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
