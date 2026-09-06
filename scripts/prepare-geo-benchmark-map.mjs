import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Natural Earth v5.1.2, public domain. Download once to the ignored work directory:
// https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson
const root = new URL("../", import.meta.url);
const source = JSON.parse(readFileSync(new URL("work/geo-benchmark/world.geojson", root), "utf8"));
const paths = source.features.flatMap(feature => {
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  return polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat], i) =>
    `${i === 0 ? "M" : "L"}${((lon + 180) * 2).toFixed(3)},${((90 - lat) * 2).toFixed(3)}`).join("") + "Z").join(""));
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 360"><rect width="720" height="360" fill="#dcebee"/><g fill="#f4f3e6" stroke="#9eafa1" stroke-width=".45" fill-rule="evenodd">${paths.map(d => `<path d="${d}"/>`).join("")}</g></svg>\n`;
writeFileSync(fileURLToPath(new URL("public/images/geo-benchmark/world.svg", root)), svg);
console.log("Prepared local Natural Earth world map.");
