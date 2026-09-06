import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripJpegMetadata, inspectJpeg } from "./lib/geo-benchmark-jpeg.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const inputDir = resolve(process.argv[2] ?? join(root, "work/geo-benchmark"));
const manifest = JSON.parse(await readFile(join(root, "docs/datasets/geo-benchmark-assets.json"), "utf8"));
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const prepared = [];
for (const asset of manifest.assets) {
  if (!/^location-0[1-5]\.jpg$/.test(asset.filename)) throw new Error("INVALID_ASSET_NAME");
  const original = await readFile(join(inputDir, asset.filename));
  if (sha256(original) !== asset.downloadSha256) throw new Error("SOURCE_HASH_MISMATCH: " + asset.filename);
  const output = stripJpegMetadata(original);
  const size = inspectJpeg(output);
  if (sha256(output) !== asset.sha256 || size.width !== asset.width || size.height !== asset.height) {
    throw new Error("OUTPUT_MISMATCH: " + asset.filename);
  }
  prepared.push({ filename: asset.filename, output });
}
// Validate the entire set before writing any output.
const outputDir = join(root, "public/images/geo-benchmark");
await mkdir(outputDir, { recursive: true });
for (const asset of prepared) await writeFile(join(outputDir, asset.filename), asset.output);
console.log("Prepared " + prepared.length + " verified, metadata-stripped JPEGs.");
