# Geo Benchmark dataset v2

Dataset: geo-pool-2026-09-06-v2. Reviewed 2026-09-06.

## Pool and sampling

25 photos: 5 easy, 15 medium, 5 hard. Each game independently draws 1 easy, 3 distinct medium photos, then 1 hard. Sampling occurs once per game; restart draws again. Different games may repeat photos. Difficulty is editorial, not empirically calibrated.

## Reviewed photos

| ID | Difficulty | Country / city | Camera latitude, longitude | Source revision |
|---|---|---|---|---|
| location-01 | easy | France / Paris | 48.857083, 2.296306 | [SElefant (Sean H. Yu)](https://commons.wikimedia.org/w/index.php?oldid=1225377672) |
| location-02 | medium | Japan / Kyoto | 34.995649, 135.781928 | [Radek Kucharski](https://commons.wikimedia.org/w/index.php?oldid=971123630) |
| location-03 | medium | Portugal / Lisbon | 38.709744, -9.137375 | [Jolly Janner](https://commons.wikimedia.org/w/index.php?oldid=1017718814) |
| location-04 | medium | South Africa / Cape Town | -33.918223, 18.414252 | [PIERRE ANDRE LECLERCQ](https://commons.wikimedia.org/w/index.php?oldid=1226032290) |
| location-05 | hard | Estonia / Tartu | 58.378876, 26.724168 | [Guntars Mednis](https://commons.wikimedia.org/w/index.php?oldid=718212957) |
| location-06 | easy | United Kingdom / London | 51.500953, -0.119733 | [Colin](https://commons.wikimedia.org/w/index.php?oldid=1230516855) |
| location-07 | easy | Italy / Rome | 41.889392, 12.492381 | [Nicholas Hartmann](https://commons.wikimedia.org/w/index.php?oldid=1162820653) |
| location-08 | easy | Australia / Sydney | -33.852575, 151.210729 | [Diliff](https://commons.wikimedia.org/w/index.php?oldid=1265484871) |
| location-09 | easy | United States / New York City | 40.759194, -73.984917 | [Terabass](https://commons.wikimedia.org/w/index.php?oldid=1270885776) |
| location-10 | medium | South Korea / Seoul | 37.583725, 126.984173 | [Basile Morin](https://commons.wikimedia.org/w/index.php?oldid=1100875519) |
| location-11 | medium | Thailand / Bangkok | 13.741852, 100.507482 | [Marcin Konsek](https://commons.wikimedia.org/w/index.php?oldid=754592944) |
| location-12 | medium | Türkiye / Istanbul | 41.033836, 28.977969 | [Antimuonium](https://commons.wikimedia.org/w/index.php?oldid=1093303578) |
| location-13 | medium | Czechia / Prague | 50.086389, 14.411667 | [Petar Milošević](https://commons.wikimedia.org/w/index.php?oldid=1199075757) |
| location-14 | medium | Netherlands / Amsterdam | 52.363506, 4.895889 | [Massimo Catarinella](https://commons.wikimedia.org/w/index.php?oldid=966603545) |
| location-15 | medium | Hungary / Budapest | 47.503319, 19.032281 | [Dguendel](https://commons.wikimedia.org/w/index.php?oldid=1100234973) |
| location-16 | medium | Argentina / Buenos Aires | -34.616083, -58.375194 | [Banfield](https://commons.wikimedia.org/w/index.php?oldid=1272029653) |
| location-17 | medium | United States / San Francisco | 37.787393, -122.407451 | [Dllu](https://commons.wikimedia.org/w/index.php?oldid=997521657) |
| location-18 | medium | Morocco / Marrakech | 31.631975, -7.986214 | [Yamen](https://commons.wikimedia.org/w/index.php?oldid=776042236) |
| location-19 | medium | Singapore / Singapore | 1.310158, 103.902435 | [Basile Morin](https://commons.wikimedia.org/w/index.php?oldid=1144480082) |
| location-20 | medium | Mexico / Mexico City | 19.436308, -99.154494 | [Carlos Valenzuela](https://commons.wikimedia.org/w/index.php?oldid=808920695) |
| location-21 | medium | Austria / Vienna | 48.208217, 16.370417 | [C.Stadler/Bwag](https://commons.wikimedia.org/w/index.php?oldid=1085745798) |
| location-22 | hard | Latvia / Riga | 56.945788, 24.108576 | [Egilus](https://commons.wikimedia.org/w/index.php?oldid=1248515833) |
| location-23 | hard | Finland / Turku | 60.483056, 22.291389 | [Samuli Lintula](https://commons.wikimedia.org/w/index.php?oldid=1168330215) |
| location-24 | hard | Czechia / Brno | 49.225403, 16.582747 | [Jiří Sedláček - Frettie](https://commons.wikimedia.org/w/index.php?oldid=1118363548) |
| location-25 | hard | Slovenia / Ljubljana | 46.049263, 14.548585 | [Petar Milošević](https://commons.wikimedia.org/w/index.php?oldid=1220664225) |

## Evidence and preparation

The five v1 photos and their source evidence are retained. For the 20 additions, camera Location templates (decimal or DMS) were converted and compared with Commons metadata. Vienna location-21 has separate Object location and camera Location templates: the camera value is used, not the API GPS value of the object. Source revisions, raw factual metadata, licenses and original wikitext are in geo-benchmark-v2-source-evidence.json. Never render source HTML as trusted UI.

All 20 added images were visually reviewed for subject consistency. Rejected candidates included close-up products, people and theater seats. Publisher camera coordinates are not independent survey measurements; accuracy is unspecified. Six decimal places do not imply sub-meter measurement accuracy.

New photos use Wikimedia renditions with their original aspect ratios. Metadata was removed without re-encoding image scans. No AI-generated photos, local cropping or retouching. Original scene edits or panoramas, if any, belong to the source photographer and are described on the source page.

geo-benchmark-assets.json pins source download/output hashes, dimensions, source revisions, license evidence and per-photo difficulty rationale for all 25 images. Run scripts/prepare-geo-benchmark-images.mjs after downloading the manifest URLs into work/geo-benchmark to reproduce the metadata-stripped assets. Each delivered photo is under 1 MB; all sources/credits are in public/images/geo-benchmark/ATTRIBUTION.md and the runtime JSON.

## Reproducibility

The seeded partial Fisher-Yates draw is selection version difficulty-draw-v1. Browser crypto supplies a fresh unsigned 32-bit seed at game start and restart. The pure engine accepts an injected seed. Final JSON includes datasetVersion, selectionVersion, seed, selectedPlaceIds and the five responses/results. Seed and future photo IDs are withheld from the in-progress view. Keep this version of the pool and algorithm to reproduce a run. Static bundled answers remain inspectable using developer tools.

Automated tests check 5/15/5 pool counts, file hashes/dimensions/metadata, tier ordering, no repeats within a game, seed determinism and invalid seeds, pool coverage over 1,000 seeds and a perfect five-round run.
