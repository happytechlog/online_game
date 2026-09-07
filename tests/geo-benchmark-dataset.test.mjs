import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadGeoBenchmarkDataset } from "../src/features/geo-benchmark/dataset.ts";
import { createSession, submitResponse, nextRound, getSessionView } from "../src/features/geo-benchmark/session.ts";
import { inspectJpeg, stripJpegMetadata } from "../scripts/lib/geo-benchmark-jpeg.mjs";

const root = new URL("../", import.meta.url);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = JSON.parse(await readFile(new URL("docs/datasets/geo-benchmark-assets.json", root), "utf8"));

test("release dataset contains 25 local photos with verified metadata and difficulty mix", async () => {
  const dataset = loadGeoBenchmarkDataset();
  assert.equal(dataset.version, manifest.datasetVersion);
  assert.deepEqual(dataset.places.map(p => p.difficulty).sort(), [...Array(5).fill("easy"),...Array(5).fill("hard"),...Array(15).fill("medium")]);
  assert.equal(manifest.assets.length, 25);
  assert.equal(new Set(dataset.places.map(p => p.imagePath)).size, 25);
  for (const place of dataset.places) {
    const asset = manifest.assets.find(a => a.id === place.id);
    assert.ok(asset);
    assert.equal(place.imagePath, "/images/geo-benchmark/"+asset.filename);
    const bytes = await readFile(new URL("public"+place.imagePath, root));
    assert.equal(hash(bytes), asset.sha256);
    assert.equal(bytes.length, asset.bytes);
    assert.ok(bytes.length < 1_000_000);
    const {width, height, segments} = inspectJpeg(bytes);
    assert.equal(width, asset.width);
    assert.equal(height, asset.height);
    assert.ok(Math.max(width, height) >= 1000 && Math.min(width, height) >= 600);
    assert.ok(!segments.some(s => [0xe1,0xed,0xfe].includes(s.marker)));
    assert.deepEqual(stripJpegMetadata(bytes), bytes);
    assert.match(place.coordinateSource, new RegExp("oldid="+asset.sourceRevision+"$"));
    assert.ok(asset.cameraLocationTemplate.startsWith("{{"));
    assert.ok(place.attribution.licenseUrl.startsWith("https://"));
  }
});

test("real dataset completes a perfect game without early answer leakage", () => {
  const dataset = loadGeoBenchmarkDataset();
  let session = createSession(dataset);
  for (let i=0;i<5;i++) {
    session = submitResponse(session,{
      coordinates: session.dataset.places[i].coordinates, country:null,city:null,
      confidence:100,reasoning:"Fixture uses the documented camera coordinates.",
    });
    const view = getSessionView(session);
    if (i<4) {
      assert.equal(view.results,null);
      assert.ok(!JSON.stringify(view).includes("commons.wikimedia.org"));
      session=nextRound(session);
    }
  }
  const view=getSessionView(session);
  assert.equal(view.total,25000);
  assert.equal(view.results.length,5);
  assert.ok(view.results.every(r=>r.distanceKm===0 && r.answer.attribution.title));
  const fresh=loadGeoBenchmarkDataset();
  fresh.places[0].coordinates.latitude=0;
  assert.notEqual(loadGeoBenchmarkDataset().places[0].coordinates.latitude,0);
});

test("metadata removal preserves image scans and strips metadata inserted between scans", async () => {
  const clean=await readFile(new URL("public/images/geo-benchmark/location-02.jpg",root));
  const info=inspectJpeg(clean);
  const beforeEnd=info.segments.at(-1).start;
  const payload=Buffer.from("Exif\0\0GPSLatitude=35;City=Kyoto");
  const length=Buffer.alloc(2); length.writeUInt16BE(payload.length+2);
  const metadata=Buffer.concat([Buffer.from([0xff,0xe1]),length,payload]);
  const withMetadata=Buffer.concat([clean.subarray(0,2),metadata,clean.subarray(2,beforeEnd),metadata,clean.subarray(beforeEnd),Buffer.from("trailing-location")]);
  assert.deepEqual(stripJpegMetadata(withMetadata),clean);
  assert.throws(()=>inspectJpeg(Buffer.from("not jpeg")),/INVALID_JPEG/);
  assert.throws(()=>inspectJpeg(clean.subarray(0,100)));
  assert.throws(()=>inspectJpeg(clean.subarray(0,-2)),/MISSING_JPEG_END/);
});
