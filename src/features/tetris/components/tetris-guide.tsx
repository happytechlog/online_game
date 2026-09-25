"use client";

import { useLanguage } from "@/src/components/providers/language-provider";
import { tetrisContent } from "@/src/i18n/tetris-content";

export function TetrisGuide() {
  const { language } = useLanguage();
  const content = tetrisContent[language];

  return (
    <div className="tetris-guide">
      <section className="guide-intro shell" aria-labelledby="tetris-intro">
        <span className="guide-number" aria-hidden="true">01</span>
        <div>
          <h2 id="tetris-intro">{content.introTitle}</h2>
          <p>{content.intro}</p>
        </div>
      </section>
      <section className="guide-section guide-section-tinted" aria-labelledby="tetris-how">
        <div className="shell">
          <span className="guide-number" aria-hidden="true">02</span>
          <h2 id="tetris-how">{content.howTitle}</h2>
          <ol className="rule-grid">
            {content.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="guide-section shell" aria-labelledby="tetris-controls-guide">
        <span className="guide-number" aria-hidden="true">03</span>
        <h2 id="tetris-controls-guide">{content.controlsTitle}</h2>
        <div className="tetris-control-guide">
          {content.guideControls.map((control) => (
            <article key={control.title}>
              <span aria-hidden="true">◆</span>
              <h3>{control.title}</h3>
              <p>{control.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
