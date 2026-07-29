"use client";

import { useLanguage } from "@/src/components/providers/language-provider";
import { sudokuContent } from "@/src/i18n/sudoku-content";

export function SudokuGuide() {
  const { language } = useLanguage();
  const content = sudokuContent[language];

  return (
    <div className="sudoku-guide">
      <section className="guide-intro shell" aria-labelledby="sudoku-intro">
        <span className="guide-number" aria-hidden="true">01</span>
        <div>
          <h2 id="sudoku-intro">{content.introTitle}</h2>
          <p>{content.intro}</p>
        </div>
      </section>

      <section
        className="guide-section guide-section-tinted"
        aria-labelledby="sudoku-how"
      >
        <div className="shell">
          <span className="guide-number" aria-hidden="true">02</span>
          <h2 id="sudoku-how">{content.howTitle}</h2>
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
        aria-labelledby="sudoku-controls"
      >
        <span className="guide-number" aria-hidden="true">03</span>
        <h2 id="sudoku-controls">{content.controlsTitle}</h2>
        <div className="sudoku-control-guide">
          {content.controls.map((control) => (
            <article key={control.title}>
              <span aria-hidden="true">◇</span>
              <h3>{control.title}</h3>
              <p>{control.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="guide-section sudoku-difficulty-guide"
        aria-labelledby="sudoku-difficulty-guide"
      >
        <div className="shell">
          <span className="guide-number" aria-hidden="true">04</span>
          <h2 id="sudoku-difficulty-guide">{content.difficultyTitle}</h2>
          <p className="guide-lead">{content.difficultyIntro}</p>
          <div>
            {content.difficulties.map((difficulty) => (
              <article key={difficulty.name}>
                <h3>{difficulty.name}</h3>
                <p>{difficulty.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="guide-section shell faq-section"
        aria-labelledby="sudoku-faq"
      >
        <span className="guide-number" aria-hidden="true">05</span>
        <h2 id="sudoku-faq">{content.faqTitle}</h2>
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
