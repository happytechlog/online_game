import test from "node:test";
import assert from "node:assert/strict";
import { parseResponseDraft } from "../src/features/geo-benchmark/response-form.ts";
import { project, unproject, mapWindow } from "../src/features/geo-benchmark/map.ts";

const draft = { latitude: "0", longitude: "0", country: "", city: "", countryUnknown: true, cityUnknown: true, confidence: "0", reasoning: " Road signs " };
test("manual response accepts zero confidence and unknown names", () => {
  assert.deepEqual(parseResponseDraft(draft), { coordinates: { latitude: 0, longitude: 0 }, country: null, city: null, confidence: 0, reasoning: "Road signs" });
});
test("manual response rejects blanks and out-of-range values", () => {
  for (const patch of [{ confidence: "" }, { confidence: "101" }, { confidence: "-1" }, { reasoning: "  " }, { latitude: "" }, { latitude: "91" }, { longitude: "-181" }, { longitude: "NaN" }, { countryUnknown: false }, { cityUnknown: false }]) {
    assert.equal(parseResponseDraft({ ...draft, ...patch }), null, JSON.stringify(patch));
  }
});
test("world map coordinates round-trip at boundaries and landmarks", () => {
  for (const point of [{ latitude: 90, longitude: -180 }, { latitude: -90, longitude: 180 }, { latitude: 48.85, longitude: 2.29 }]) {
    const p = project(point), result = unproject(p.x, p.y);
    assert.ok(Math.abs(result.latitude - point.latitude) < 1e-10);
    assert.ok(Math.abs(result.longitude - point.longitude) < 1e-10);
  }
  assert.deepEqual(unproject(-100, 500), { latitude: -90, longitude: -180 });
});
test("map panning stays inside the world at every zoom", () => {
  for (const zoom of [0, 1, 2, 16, 32, 100]) {
    const box = mapWindow(1000, -100, zoom);
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 720 && box.y + box.height <= 360);
  }
});
