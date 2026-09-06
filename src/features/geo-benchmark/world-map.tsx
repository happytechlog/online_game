"use client";

import { useRef, useState, type PointerEvent } from "react";
import type { Coordinates } from "./data";
import type { GeoCopy } from "@/src/i18n/geo-benchmark";
import { mapWindow, project, unproject } from "./map";

export function WorldMap({ value, answer, onChange, copy }: {
  value: Coordinates | null; answer?: Coordinates; onChange?: (point: Coordinates) => void; copy: GeoCopy;
}) {
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const drag = useRef<{ x: number; y: number; originX: number; originY: number; moved: boolean } | null>(null);
  const box = mapWindow(viewport.x, viewport.y, viewport.zoom);
  const guess = value && project(value);
  const actual = answer && project(answer);
  function zoom(factor: number) {
    const next = Math.max(1, Math.min(32, viewport.zoom * factor));
    const center = guess ?? { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const nextBox = mapWindow(center.x - 360 / next, center.y - 180 / next, next);
    setViewport({ x: nextBox.x, y: nextBox.y, zoom: next });
  }
  function pointerPoint(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width * box.width + box.x,
      y: (event.clientY - rect.top) / rect.height * box.height + box.y };
  }
  return <div className="geo-map-wrap">
    <div className="geo-map-tools">
      <strong>{copy.map}</strong>
      <div>
        <button type="button" aria-label={copy.zoomOut} onClick={() => zoom(0.5)} disabled={viewport.zoom === 1}>−</button>
        <button type="button" aria-label={copy.zoomIn} onClick={() => zoom(2)} disabled={viewport.zoom === 32}>+</button>
        <button type="button" onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}>{copy.resetMap}</button>
      </div>
    </div>
    <svg className="geo-map" viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`} preserveAspectRatio="none"
      role="img" aria-label={copy.map + (onChange ? ". " + copy.mapHint : "")} tabIndex={onChange ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onChange || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const point = project(value ?? { latitude: 0, longitude: 0 });
        const step = (event.shiftKey ? 0.2 : 2) / viewport.zoom;
        const next = unproject(point.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0),
          point.y + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0));
        onChange(next);
        const selected = project(next);
        const nextBox = mapWindow(selected.x - box.width / 2, selected.y - box.height / 2, viewport.zoom);
        setViewport({ ...viewport, x: nextBox.x, y: nextBox.y });
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        drag.current = { x: event.clientX, y: event.clientY, originX: box.x, originY: box.y, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.x, dy = event.clientY - drag.current.y;
        if (Math.hypot(dx, dy) > 5) drag.current.moved = true;
        if (!drag.current.moved) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const next = mapWindow(drag.current.originX - dx / rect.width * box.width,
          drag.current.originY - dy / rect.height * box.height, viewport.zoom);
        setViewport({ ...viewport, x: next.x, y: next.y });
      }}
      onPointerUp={(event) => {
        if (drag.current && !drag.current.moved && onChange) {
          const point = pointerPoint(event); onChange(unproject(point.x, point.y));
        }
        drag.current = null;
      }}
      onPointerCancel={() => { drag.current = null; }}>
      <image href="/images/geo-benchmark/world.svg" x="0" y="0" width="720" height="360" />
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M ${(i + 1) * 60} 0 V 360`} stroke="#9dbdc4" opacity=".35" strokeWidth={0.5} />)}
      {[60, 120, 180, 240, 300].map(y => <path key={y} d={`M 0 ${y} H 720`} stroke="#9dbdc4" opacity=".35" strokeWidth={0.5} />)}
      {guess && <circle cx={guess.x} cy={guess.y} r={5 / viewport.zoom} fill="#9c390e" stroke="white" strokeWidth={2 / viewport.zoom} />}
      {actual && <path d={`M ${actual.x} ${actual.y - 6 / viewport.zoom} l ${6 / viewport.zoom} ${6 / viewport.zoom} l ${-6 / viewport.zoom} ${6 / viewport.zoom} l ${-6 / viewport.zoom} ${-6 / viewport.zoom} Z`} fill="#075840" stroke="white" strokeWidth={1.5 / viewport.zoom} />}
    </svg>
    {onChange ? <p className="geo-caption">{copy.mapHint}</p> :
      <p className="geo-caption"><span className="geo-guess">● {copy.guess}</span> · <span className="geo-answer">◆ {copy.answer}</span></p>}
    <a className="geo-map-credit" href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">{copy.mapCredit}</a>
  </div>;
}
