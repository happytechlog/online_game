# Geo Benchmark dataset v1

Reviewed: 2026-09-06. Dataset: geo-mvp-2026-09-06-v1.

## Accepted photos

| ID | Difficulty | Country / city | Camera latitude, longitude | Source |
|---|---|---|---|---|
| location-01 | Easy | France / Paris | 48.857083, 2.296306 | [SElefant, Eiffel Tower from Champ de Mars](https://commons.wikimedia.org/w/index.php?oldid=1225377672) |
| location-02 | Medium | Japan / Kyoto | 34.995649, 135.781928 | [Radek Kucharski, Kyoto street](https://commons.wikimedia.org/w/index.php?oldid=971123630) |
| location-03 | Medium | Portugal / Lisbon | 38.709744, -9.137375 | [Jolly Janner, Rua Augusta](https://commons.wikimedia.org/w/index.php?oldid=1017718814) |
| location-04 | Medium | South Africa / Cape Town | -33.918223, 18.414252 | [PIERRE ANDRE LECLERCQ, Chiappini Street](https://commons.wikimedia.org/w/index.php?oldid=1226032290) |
| location-05 | Hard | Estonia / Tartu | 58.378876, 26.724168 | [Guntars Mednis, Küüni street](https://commons.wikimedia.org/w/index.php?oldid=718212957) |

Difficulty is an editorial starting classification, not an empirically calibrated
model score. The Eiffel Tower is a strong global landmark; Kyoto, Lisbon and
Bo-Kaap offer architectural, script and streetscape clues; the Tartu retail street
has fewer globally distinctive cues. Natural signs and visible text are retained.
The exact rationale is stored per photo in geo-benchmark-assets.json.
Version 1 uses the listed stable order; changing photos/order requires a new
dataset version to preserve comparability.

## Camera-coordinate verification

The fixed Commons revisions above contain camera Location templates, not merely
coordinates of the photographed landmark. Template values were checked against
the Commons camera-location metadata. DMS values for Paris/Lisbon agree after
rounding to six decimal places. Cape Town's template has additional precision;
the dataset retains the six-decimal metadata value (sub-meter rounding).

Source coordinates, templates and revision IDs are retained in the adjacent
source-evidence and assets JSON files. The displayed photos were inspected for
consistency with the described scenes. The source templates had no detected
coordinate-discrepancy notice. These are publisher-provided camera coordinates,
not independent field-survey measurements; source accuracy is unspecified.
Do not represent six decimal places as proof of sub-meter measurement accuracy.

## Licensing and presentation

- Paris: CC BY-SA 3.0 (selected from the source's available licenses).
- Kyoto: CC BY 2.0, with the source's Flickr license-review record.
- Lisbon: public-domain dedication by the author.
- Cape Town: CC BY-SA 4.0.
- Tartu: CC BY-SA 3.0, with the source's Panoramio license-review record.

Full original titles, authors, source links, license links and bilingual change
notices are bundled in public/images/geo-benchmark/ATTRIBUTION.md and the runtime
JSON attribution fields. Keep these with redistributed copies. Share-alike photo
licenses apply to those photos; do not relabel them as the application license.
Source evidence is factual metadata; the raw source author/description HTML is
audit evidence only and must never be rendered as HTML.

The gameplay UI must use neutral photo IDs and alt text. Reveal full credits
alongside answers at completion; source links and titles can disclose the answer.
The attribution appendix remains independently available with the asset bundle.
This is a UI disclosure rule, not protection against source inspection.

## Asset preparation and reproduction

Files are bundled locally; gameplay needs no Commons, Street View or other remote
image API. Downloads used original pixels for Paris/Cape Town and Wikimedia's
1280px renditions for the other three. No local crop, generative edit or retouching
was performed. EXIF/XMP/IPTC and comments were removed losslessly from JPEG marker
segments, including segments between progressive scans. JFIF, ICC color data and
Adobe color markers are retained. All five source orientations were normal (1).

The assets total about 1.79 MB (decimal). Each is under 500 KB. The asset manifest
pins download SHA-256, output SHA-256, original Commons SHA-1, dimensions, revision,
download URL and processing notes. Hashes identify the reviewed bytes, not future
content at the same URL.

To reproduce after a fresh checkout, download each manifest downloadUrl into
work/geo-benchmark using its filename, then run:

~~~powershell
$manifest = Get-Content docs/datasets/geo-benchmark-assets.json -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force work/geo-benchmark | Out-Null
foreach ($asset in $manifest.assets) {
  Invoke-WebRequest -Uri $asset.downloadUrl -OutFile (Join-Path work/geo-benchmark $asset.filename)
}
node scripts/prepare-geo-benchmark-images.mjs
~~~

The preparation command validates all input and output hashes before writing.
If a remote file/rendition changes, it fails; review the new bytes instead of
silently accepting a new hash. The source downloads in work/ are not committed.
The delivered JPEGs and JSON are committed artifacts, so reproduction downloads
are unnecessary for normal development or gameplay.

## Validation

Automated checks cover local file existence, unique paths, difficulty mix, byte
hashes, dimensions, size budgets, attribution completeness, metadata stripping,
truncated JPEG rejection, unchanged encoded scans and a perfect five-round run.
Real dataset tests also verify that source links and answer coordinates are not
exposed by the pre-completion view. Browser gameplay QA follows in phase 3.
