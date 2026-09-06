import assert from "node:assert/strict";
import test from "node:test";
import { parseDataset } from "../src/features/geo-benchmark/data.ts";
import { distanceKm, scoreDistance, EARTH_RADIUS_KM } from "../src/features/geo-benchmark/scoring.ts";
import { createSession, submitResponse, nextRound, getSessionView } from "../src/features/geo-benchmark/session.ts";

// Synthetic coordinates only: these fixtures are not a verified photo dataset.
const dataset = () => ({
  version: "test-v1",
  places: ["easy", "medium", "medium", "medium", "hard"].map((difficulty, index) => ({
    id: "sample-" + index, imagePath: "/images/geo-benchmark/sample-" + index + ".jpg",
    difficulty, coordinates: { latitude: index, longitude: index },
    country: { ko: "테스트 국가", en: "Test country" },
    city: { ko: "테스트 도시", en: "Test city" },
    sourceUrl: "https://example.org/photo", author: "Fixture", license: "Test only",
    coordinateSource: "https://example.org/coordinates",
    attribution: { title: "Test photo", licenseUrl: "https://example.org/license", changes: { ko: "테스트", en: "Test" } },
  })),
});
const response = () => ({
  coordinates: { latitude: 0, longitude: 0 },
  country: null, city: null, confidence: 0, reasoning: "Visual clues are insufficient.",
});

test("geo distances cover identical points, dateline, poles and antipodes", () => {
  const origin = { latitude: 0, longitude: 0 };
  assert.equal(distanceKm(origin, origin), 0);
  assert.ok(Math.abs(distanceKm(origin, { latitude: 0, longitude: 180 }) - Math.PI * EARTH_RADIUS_KM) < 1e-6);
  assert.ok(Math.abs(distanceKm({ latitude: 0, longitude: 179 }, { latitude: 0, longitude: -179 }) - 222.39016) < 0.001);
  assert.ok(distanceKm({ latitude: 90, longitude: 0 }, { latitude: 90, longitude: 180 }) < 1e-8);
  assert.equal(distanceKm(origin, { latitude: 23, longitude: -45 }), distanceKm({ latitude: 23, longitude: -45 }, origin));
  for (const coordinates of [null, { latitude: NaN, longitude: 0 }, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: 181 }]) {
    assert.throws(() => distanceKm(origin, coordinates), /INVALID_COORDINATES/);
  }
});

test("geo scoring is bounded, deterministic and decreases with distance", () => {
  assert.equal(scoreDistance(0), 5000);
  assert.equal(scoreDistance(2000), 1839);
  assert.equal(scoreDistance(Math.PI * EARTH_RADIUS_KM), 0);
  let previous = 5000;
  for (let km = 0; km <= 21000; km += 50) {
    const score = scoreDistance(km);
    assert.ok(score >= 0 && score <= previous);
    previous = score;
  }
  for (const value of [-1, NaN, Infinity, "1"]) assert.throws(() => scoreDistance(value));
});

test("geo dataset validation rejects bad counts, mix, duplicate IDs and malformed fields", () => {
  assert.deepEqual(parseDataset(dataset()), dataset());
  for (const mutate of [
    (d) => d.places.pop(),
    (d) => { d.places[0].difficulty = "medium"; },
    (d) => { d.places[1].id = d.places[0].id; },
    (d) => { d.places[0].coordinates.latitude = Infinity; },
    (d) => { d.places[0].imagePath = "/images/geo-benchmark/../secret.jpg"; },
    (d) => { d.places[0].country.en = ""; },
    (d) => { d.places[0].sourceUrl = "javascript:alert(1)"; },
    (d) => { d.places[0].coordinateSource = ""; },
    (d) => { d.places[0].license = " "; },
    (d) => { d.version = ""; },
    (d) => { d.places[0].attribution.licenseUrl = "javascript:alert(1)"; },
    (d) => { d.places[0].attribution.changes.ko = ""; },
  ]) {
    const input = dataset(); mutate(input);
    assert.throws(() => parseDataset(input));
  }
  for (const bad of [null, [], {}, "bad JSON"]) assert.throws(() => parseDataset(bad));
});

test("geo response requires explicit confidence and reasoning; null means unknown", () => {
  const session = createSession(dataset());
  assert.equal(submitResponse(session, response()).responses[0].confidence, 0);
  for (const patch of [
    { confidence: undefined }, { confidence: null }, { confidence: "" },
    { confidence: NaN }, { confidence: -1 }, { confidence: 101 },
    { reasoning: "  " }, { country: "" }, { city: undefined },
    { coordinates: null },
  ]) assert.throws(() => submitResponse(session, { ...response(), ...patch }), /INVALID_RESPONSE/);
  assert.equal(submitResponse(session, { ...response(), confidence: 100 }).responses[0].confidence, 100);
});

test("geo five-round lifecycle withholds answers until completion and prevents duplicate submits", () => {
  let session = createSession(dataset());
  assert.throws(() => nextRound(session));
  for (let index = 0; index < 5; index++) {
    const before = getSessionView(session);
    assert.equal(before.round, index + 1);
    assert.deepEqual(Object.keys(before.photo).sort(), ["id", "imagePath"]);
    session = submitResponse(session, response());
    const view = getSessionView(session);
    assert.equal(view.scores.length, index + 1);
    assert.throws(() => submitResponse(session, response()), /ROUND_NOT_OPEN/);
    if (index < 4) {
      assert.equal(view.results, null);
      assert.ok(!JSON.stringify(view).includes("Test country"));
      assert.ok(!JSON.stringify(view).includes("latitude"));
      session = nextRound(session);
    }
  }
  const final = getSessionView(session);
  assert.equal(final.phase, "finished");
  assert.equal(final.results.length, 5);
  assert.equal(final.photo, null);
  assert.equal(final.results[0].distanceKm, 0);
  assert.equal(final.results[0].score, 5000);
  assert.equal(final.total, final.scores.reduce((sum, score) => sum + score, 0));
  assert.throws(() => nextRound(session));
});

test("geo sessions preserve prior state and isolate caller mutations", () => {
  const input = dataset();
  const original = createSession(input);
  input.places[0].coordinates.latitude = 50;
  const guess = response();
  const submitted = submitResponse(original, guess);
  guess.coordinates.latitude = 60;
  assert.equal(original.responses.length, 0);
  assert.equal(submitted.responses[0].coordinates.latitude, 0);
  assert.equal(submitted.dataset.places[0].coordinates.latitude, 0);
  let session = submitted;
  for (let index = 1; index < 5; index++) session = submitResponse(nextRound(session), response());
  const view = getSessionView(session);
  view.results[0].answer.coordinates.latitude = 80;
  assert.equal(session.dataset.places[0].coordinates.latitude, 0);
});
