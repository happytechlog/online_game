"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/src/components/providers/language-provider";
import { geoMessages, type GeoCopy } from "@/src/i18n/geo-benchmark";
import { loadGeoBenchmarkDataset } from "./dataset";
import { createSession, getSessionView, nextRound, submitResponse, type Response } from "./session";
import { isCoordinates } from "./data";
import { parseResponseDraft } from "./response-form";
import { WorldMap } from "./world-map";
import "./geo-benchmark.css";

function GuessForm({ copy, locked, onSubmit }: { copy: GeoCopy; locked: boolean; onSubmit: (response: Response) => void }) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [countryUnknown, setCountryUnknown] = useState(false);
  const [cityUnknown, setCityUnknown] = useState(false);
  const [confidence, setConfidence] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [invalid, setInvalid] = useState(false);
  const coordinates = { latitude: Number(latitude), longitude: Number(longitude) };
  const point = latitude.trim() && longitude.trim() && isCoordinates(coordinates) ? coordinates : null;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    const response = parseResponseDraft({ latitude, longitude, country, city, countryUnknown, cityUnknown, confidence, reasoning });
    if (!response) { setInvalid(true); return; }
    setInvalid(false);
    onSubmit(response);
  }
  return <form onSubmit={submit} className="geo-response">
    <WorldMap value={point} copy={copy} onClear={locked ? undefined : () => { setLatitude(""); setLongitude(""); }} onChange={locked ? undefined : (value) => {
      setLatitude(value.latitude.toFixed(6)); setLongitude(value.longitude.toFixed(6));
    }} />
    <fieldset disabled={locked}>
      <legend>{copy.response}</legend>
      <div className="geo-pair">
        <label>{copy.latitude}<input required type="number" min="-90" max="90" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} /></label>
        <label>{copy.longitude}<input required type="number" min="-180" max="180" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} /></label>
      </div>
      <div className="geo-pair">
        <div><label>{copy.country}<input required={!countryUnknown} disabled={countryUnknown || locked} value={country} onChange={e => setCountry(e.target.value)} /></label>
          <label className="geo-checkbox"><input type="checkbox" checked={countryUnknown} onChange={e => setCountryUnknown(e.target.checked)} />{copy.unknown}</label></div>
        <div><label>{copy.city}<input required={!cityUnknown} disabled={cityUnknown || locked} value={city} onChange={e => setCity(e.target.value)} /></label>
          <label className="geo-checkbox"><input type="checkbox" checked={cityUnknown} onChange={e => setCityUnknown(e.target.checked)} />{copy.unknown}</label></div>
      </div>
      <label>{copy.confidence}<input required type="number" min="0" max="100" step="any" value={confidence} onChange={e => setConfidence(e.target.value)} /></label>
      <label>{copy.reasoning}<textarea required rows={3} value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder={copy.reasonHint} /></label>
      {invalid && <p role="alert" className="geo-error">{copy.invalid}</p>}
      <button type="submit" className="button button-primary geo-submit">{locked ? copy.locked : copy.submit}</button>
    </fieldset>
  </form>;
}

export function GeoBenchmark() {
  const { language } = useLanguage();
  const copy = geoMessages[language];
  const [session, setSession] = useState(() => createSession(loadGeoBenchmarkDataset()));
  const [imageError, setImageError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const view = getSessionView(session);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [view.round, view.phase]);
  const format = (value: number) => value.toLocaleString(language === "ko" ? "ko-KR" : "en-US", { maximumFractionDigits: 1 });
  return <section className="geo-shell">
    <header className="geo-header">
      <div><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.intro}</p></div>
      <div className="geo-total"><span>{copy.total}</span><strong>{format(view.total)}<small> / 25,000</small></strong></div>
    </header>
    <ol className="geo-progress" aria-label={copy.roundScores}>
      {Array.from({ length: 5 }, (_, i) => <li key={i} aria-current={view.phase !== "finished" && view.round === i + 1 ? "step" : undefined}>
        <span>{copy.round} {String(i + 1).padStart(2, "0")}</span><strong>{view.scores[i] === undefined ? "—" : format(view.scores[i])}</strong>
      </li>)}
    </ol>
    <h2 ref={heading} tabIndex={-1} className="geo-round-title">{view.phase === "finished" ? copy.finished : `${copy.round} ${view.round} / 5`}</h2>
    {view.photo && <div className="geo-workspace">
      <div className="geo-photo-panel">
        <div className="geo-photo">
          {/* Fixed local dataset assets need no image optimization service. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={view.photo.id} src={view.photo.imagePath} alt={`${copy.photo} · ${view.round}`} onError={() => setImageError(true)} />
        </div>
        <a className="geo-photo-link" href={view.photo.imagePath} target="_blank" rel="noreferrer">{copy.enlarge} ↗</a>
        {imageError && <p className="geo-error" role="alert">{copy.photoError}</p>}
        <p>{copy.withheld}</p>
        {view.phase === "scored" && <div className="geo-round-result" role="status">
          <span>{copy.score}</span><strong>{format(view.scores[view.round - 1])}<small> / 5,000</small></strong>
          <button className="button button-primary" onClick={() => { setImageError(false); setSession(current => nextRound(current)); }}>{copy.next} →</button>
        </div>}
      </div>
      <GuessForm key={view.round} copy={copy} locked={view.phase !== "guessing" || imageError} onSubmit={response => {
        setSession(current => current.phase === "guessing" ? submitResponse(current, response) : current);
      }} />
    </div>}
    {view.results && <div className="geo-results">
      {view.results.map((result, index) => <article className="geo-result" key={result.answer.id}>
        <header><div><span className="eyebrow">{copy.round} {index + 1} · {copy[result.answer.difficulty]}</span>
          <h3>{result.answer.city[language]}, {result.answer.country[language]}</h3></div><strong>{format(result.score)} / 5,000</strong></header>
        <div className="geo-result-grid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.answer.imagePath} alt={result.answer.attribution.title} loading="lazy" />
          <div>
            <WorldMap value={result.response.coordinates} answer={result.answer.coordinates} copy={copy} />
            <dl>
              <div><dt>{copy.distance}</dt><dd>{format(result.distanceKm)} km</dd></div>
              <div><dt>{copy.answer}</dt><dd>{result.answer.coordinates.latitude.toFixed(6)}, {result.answer.coordinates.longitude.toFixed(6)}</dd></div>
              <div><dt>{copy.guess}</dt><dd>{result.response.coordinates.latitude.toFixed(6)}, {result.response.coordinates.longitude.toFixed(6)}</dd></div>
              <div><dt>{copy.country} / {copy.city}</dt><dd>{result.response.country ?? copy.unknown} / {result.response.city ?? copy.unknown}</dd></div>
              <div><dt>{copy.confidence}</dt><dd>{result.response.confidence}%</dd></div>
            </dl>
          </div>
        </div>
        <h4>{copy.reasoning}</h4><p className="geo-reason">{result.response.reasoning}</p>
        <div className="geo-credit"><strong>{copy.credits}</strong><p>{result.answer.attribution.title} — {result.answer.author}</p>
          <a href={result.answer.sourceUrl} target="_blank" rel="noreferrer">{copy.source} ↗</a>{" · "}
          <a href={result.answer.attribution.licenseUrl} target="_blank" rel="noreferrer">{result.answer.license} ↗</a>{" · "}
          <a href={result.answer.coordinateSource} target="_blank" rel="noreferrer">{copy.coordinateSource} ↗</a>
          <p>{result.answer.attribution.changes[language]}</p>
        </div>
      </article>)}
      <button className="button" onClick={() => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(view, null, 2)], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "geo-benchmark-results.json";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}>{copy.exportResults}</button>
      <button className="button button-primary" onClick={() => { setImageError(false); setSession(createSession(loadGeoBenchmarkDataset())); }}>{copy.restart}</button>
    </div>}
    <footer className="geo-footnote"><p>{copy.scoring}</p><p>{copy.reload}</p><small>{copy.dataset}: {view.datasetVersion}</small></footer>
  </section>;
}
