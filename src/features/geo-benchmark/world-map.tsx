"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinates } from "./data";
import type { GeoCopy } from "@/src/i18n/geo-benchmark";
import { OfflineMap } from "./offline-map";

type Props = { value: Coordinates | null; answer?: Coordinates; onChange?: (point: Coordinates) => void; onClear?: () => void; copy: GeoCopy };

export function WorldMap(props: Props) {
  const [offline, setOffline] = useState(false);
  return <div>
    <div className="geo-map-mode">{props.onClear && <button type="button" disabled={!props.value} onClick={props.onClear}>{props.copy.clearSelection}</button>}<button type="button" onClick={() => setOffline(!offline)}>
      {offline ? props.copy.detailMap : props.copy.basicMap}
    </button></div>
    {offline ? <OfflineMap {...props} /> : <DetailMap {...props} />}
  </div>;
}

function DetailMap({ value, answer, onChange, copy }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const runtime = useRef<{ map: Leaflet.Map; L: typeof Leaflet; markers: Leaflet.LayerGroup } | null>(null);
  const latest = useRef({ value, answer, onChange, copy });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { latest.current = { value, answer, onChange, copy }; }, [value, answer, onChange, copy]);
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    import("leaflet").then(L => {
      if (disposed || !container.current) return;
      const map = L.map(container.current, { zoomControl: false, minZoom: 1, maxZoom: 19,
        worldCopyJump: true, scrollWheelZoom: "center", doubleClickZoom: "center", touchZoom: "center" }).setView([20, 0], 2);
      const markers = L.layerGroup().addTo(map);
      runtime.current = { map, L, markers };
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
      }).on("tileerror", () => { if (!disposed) setFailed(true); }).addTo(map);
      map.on("click", (event: Leaflet.LeafletMouseEvent) => {
        const point = event.latlng.wrap();
        latest.current.onChange?.({ latitude: Math.max(-90, Math.min(90, point.lat)), longitude: point.lng });
      });
      observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(container.current);
      setReady(true);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; observer?.disconnect(); runtime.current?.map.remove(); runtime.current = null; };
  }, []);
  useEffect(() => {
    const current = runtime.current;
    if (!ready || !current) return;
    const { L, map, markers } = current;
    markers.clearLayers();
    if (value) L.circleMarker([value.latitude, value.longitude], {
      radius: 8, color: "white", weight: 3, fillColor: "#9c390e", fillOpacity: 1, interactive: false,
    }).bindTooltip(copy.guess).addTo(markers);
    if (answer) {
      L.marker([answer.latitude, answer.longitude], {
        icon: L.divIcon({ className: "geo-actual-marker", html: "◆", iconSize: [24, 24], iconAnchor: [12, 12] }),
        title: copy.answer, keyboard: false, interactive: false,
      }).addTo(markers);
      map.fitBounds(L.latLngBounds(value ? [[value.latitude, value.longitude], [answer.latitude, answer.longitude]]
        : [[answer.latitude, answer.longitude]]), { padding: [35, 35], maxZoom: 13, animate: false });
    } else if (value && !map.getBounds().contains([value.latitude, value.longitude])) {
      map.panTo([value.latitude, value.longitude], { animate: false });
    }
  }, [value, answer, copy, ready]);
  return <div className="geo-map-wrap">
    <div className="geo-map-tools"><strong>{copy.map}</strong><div>
      <button type="button" aria-label={copy.zoomOut} disabled={!ready} onClick={() => runtime.current?.map.zoomOut()}>−</button>
      <button type="button" aria-label={copy.zoomIn} disabled={!ready} onClick={() => runtime.current?.map.zoomIn()}>+</button>
      <button type="button" disabled={!ready} onClick={() => runtime.current?.map.setView([20, 0], 2)}>{copy.resetMap}</button>
    </div></div>
    <div ref={container} className="geo-detail-map" role="region" aria-label={copy.map}
      tabIndex={0} onKeyDown={event => {
        if (event.key !== "Enter" || !onChange || !runtime.current) return;
        event.preventDefault();
        const point = runtime.current.map.getCenter().wrap();
        onChange({ latitude: point.lat, longitude: point.lng });
      }} />
    <p className="geo-caption">{copy.detailHint}</p>
    {!onChange && <p className="geo-caption"><span className="geo-guess">● {copy.guess}</span> · <span className="geo-answer">◆ {copy.answer}</span></p>}
    {failed && <p className="geo-error" role="status">{copy.mapError}</p>}
  </div>;
}
