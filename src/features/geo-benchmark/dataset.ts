import source from "./dataset/places.v2.json" with { type: "json" };
import { parseDataset } from "./data.ts";

// Local JSON import: no runtime network/API call is needed.
export function loadGeoBenchmarkDataset() {
  return parseDataset(source);
}
