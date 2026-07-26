"use client";

import { useLanguage } from "@/src/components/providers/language-provider";
import { othelloContent } from "@/src/i18n/othello-content";

export function OthelloGuide() {
  const { language } = useLanguage();
  const content = othelloContent[language];

  return (
    <div className="othello-guide">
      <section className="guide-intro shell" aria-labelledby="othello-intro">
        <span className="guide-number" aria-hidden="true">01</span>
        <div>
          <h2 id="othello-intro">{content.introTitle}</h2>
          <p>{content.intro}</p>
        </div>
      </section>

      <section className="guide-section guide-section-tinted" aria-labelledby="how-to-play">
        <div className="shell">
          <span className="guide-number" aria-hidden="true">02</span>
          <h2 id="how-to-play">{content.howTitle}</h2>
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

      <section className="guide-section shell" aria-labelledby="controls">
        <span className="guide-number" aria-hidden="true">03</span>
        <h2 id="controls">{content.controlsTitle}</h2>
        <div className="control-guide-grid">
          {content.controls.map((control) => (
            <article key={control.title}>
              <span aria-hidden="true">◆</span>
              <h3>{control.title}</h3>
              <p>{control.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section ai-guide" aria-labelledby="ai-difficulty">
        <div className="shell">
          <span className="guide-number" aria-hidden="true">04</span>
          <h2 id="ai-difficulty">{content.aiTitle}</h2>
          <p className="guide-lead">{content.aiIntro}</p>
          <div className="difficulty-guide-grid">
            {content.difficulties.map((difficulty, index) => (
              <article key={difficulty.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{difficulty.name}</h3>
                <p>{difficulty.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section shell faq-section" aria-labelledby="faq">
        <span className="guide-number" aria-hidden="true">05</span>
        <h2 id="faq">{content.faqTitle}</h2>
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
