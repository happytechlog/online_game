import type { Metadata } from "next";
import { GeoBenchmark } from "@/src/features/geo-benchmark/geo-benchmark";

export const metadata: Metadata = {
  title: "Geo Benchmark | 이미지 위치 추론",
  description: "사진 5장으로 평가하는 이미지 기반 위치 추론 벤치마크. A five-round visual geolocation benchmark with manual model responses.",
  alternates: { canonical: "/games/geo-benchmark" },
};
export default function GeoBenchmarkPage() {
  return <GeoBenchmark />;
}
