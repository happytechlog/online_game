"use client";

import { useLanguage } from "@/src/components/providers/language-provider";
import { game2048Content } from "@/src/i18n/2048-content";

export function Game2048Guide() {
  const { language } = useLanguage();
  const content = game2048Content[language];

  return (
    <div className="game-2048-guide">
      <section className="guide-intro shell" aria-labelledby="game-2048-intro">
        <span className="guide-number" aria-hidden="true">01</span>
        <div>
          <h2 id="game-2048-intro">{content.introTitle}</h2>
          <p>{content.intro}</p>
        </div>
      </section>

      <section
        className="guide-section guide-section-tinted"
        aria-labelledby="game-2048-how"
      >
        <div className="shell">
          <span className="guide-number" aria-hidden="true">02</span>
          <h2 id="game-2048-how">{content.howTitle}</h2>
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

      <section
        className="guide-section shell"
        aria-labelledby="game-2048-controls"
      >
        <span className="guide-number" aria-hidden="true">03</span>
        <h2 id="game-2048-controls">{content.controlsTitle}</h2>
        <div className="game-2048-control-guide">
          {content.controls.map((control) => (
            <article key={control.title}>
              <span aria-hidden="true">◆</span>
              <h3>{control.title}</h3>
              <p>{control.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="guide-section shell faq-section"
        aria-labelledby="game-2048-faq"
      >
        <span className="guide-number" aria-hidden="true">04</span>
        <h2 id="game-2048-faq">{content.faqTitle}</h2>
        <div className="faq-list">
          {content.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
