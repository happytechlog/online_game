import { isCoordinates, type Coordinates, type Dataset } from "./data.ts";
import { distanceKm, scoreDistance, SCORING_VERSION } from "./scoring.ts";

import { selectRounds, SELECTION_VERSION } from "./selection.ts";

export type Response = Readonly<{
  coordinates: Coordinates;
  country: string | null;
  city: string | null;
  confidence: number;
  reasoning: string;
}>;
export type Session = Readonly<{
  dataset: Dataset;
  seed: number;
  phase: "guessing" | "scored" | "finished";
  responses: readonly Response[];
}>;

export function createSession(dataset: unknown, seed = 0): Session {
  return { dataset: selectRounds(dataset, seed), seed, phase: "guessing", responses: [] };
}

export function submitResponse(session: Session, input: Response): Session {
  if (session.phase !== "guessing" || session.responses.length >= 5) {
    throw new Error("ROUND_NOT_OPEN");
  }
  const nameValid = (value: unknown) =>
    value === null || (typeof value === "string" && value.trim().length > 0);
  if (!input || !isCoordinates(input.coordinates) ||
      !nameValid(input.country) || !nameValid(input.city) ||
      typeof input.confidence !== "number" || !Number.isFinite(input.confidence) ||
      input.confidence < 0 || input.confidence > 100 ||
      typeof input.reasoning !== "string" || !input.reasoning.trim()) {
    throw new Error("INVALID_RESPONSE");
  }
  const response: Response = {
    coordinates: { ...input.coordinates },
    country: input.country?.trim() ?? null,
    city: input.city?.trim() ?? null,
    confidence: input.confidence,
    reasoning: input.reasoning.trim(),
  };
  const responses = [...session.responses, response];
  return { ...session, responses, phase: responses.length === 5 ? "finished" : "scored" };
}

export function nextRound(session: Session): Session {
  if (session.phase !== "scored") throw new Error("ROUND_NOT_SCORED");
  return { ...session, phase: "guessing" };
}

// UI consumes this projection, not the session's answer-bearing dataset.
// This prevents accidental early rendering, not developer-tools inspection.
export function getSessionView(session: Session) {
  const scores = session.responses.map((response, index) =>
    scoreDistance(distanceKm(session.dataset.places[index].coordinates, response.coordinates)));
  const place = session.phase === "finished" ? null :
    session.dataset.places[session.phase === "scored" ? session.responses.length - 1 : session.responses.length];
  const publicView = {
    phase: session.phase,
    round: Math.min(session.responses.length + (session.phase === "guessing" ? 1 : 0), 5),
    photo: place ? { id: place.id, imagePath: place.imagePath } : null,
    scores,
    total: scores.reduce((sum, score) => sum + score, 0),
    datasetVersion: session.dataset.version,
    scoringVersion: SCORING_VERSION,
  };
  if (session.phase !== "finished") return { ...publicView, results: null };
  return {
    ...publicView,
    selectionVersion: SELECTION_VERSION,
    seed: session.seed,
    selectedPlaceIds: session.dataset.places.map(place => place.id),
    results: session.responses.map((response, index) => ({
      answer: structuredClone(session.dataset.places[index]),
      response: structuredClone(response),
      distanceKm: distanceKm(session.dataset.places[index].coordinates, response.coordinates),
      score: scores[index],
    })),
  };
}
