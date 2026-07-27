import assert from "node:assert/strict";
import test from "node:test";
import {
  directionFromKey,
  directionFromSwipe,
} from "../src/features/2048/input.ts";

test("maps arrow keys and WASD to the same directions", () => {
  assert.equal(directionFromKey("ArrowUp"), "up");
  assert.equal(directionFromKey("w"), "up");
  assert.equal(directionFromKey("ArrowLeft"), "left");
  assert.equal(directionFromKey("A"), "left");
  assert.equal(directionFromKey("ArrowDown"), "down");
  assert.equal(directionFromKey("s"), "down");
  assert.equal(directionFromKey("ArrowRight"), "right");
  assert.equal(directionFromKey("D"), "right");
});

test("ignores unrelated keyboard input", () => {
  assert.equal(directionFromKey("Enter"), null);
  assert.equal(directionFromKey(" "), null);
});

test("uses the dominant swipe axis and direction", () => {
  assert.equal(
    directionFromSwipe({ x: 10, y: 10 }, { x: 90, y: 25 }),
    "right",
  );
  assert.equal(
    directionFromSwipe({ x: 90, y: 10 }, { x: 10, y: 25 }),
    "left",
  );
  assert.equal(
    directionFromSwipe({ x: 10, y: 90 }, { x: 20, y: 10 }),
    "up",
  );
  assert.equal(
    directionFromSwipe({ x: 10, y: 10 }, { x: 20, y: 90 }),
    "down",
  );
});

test("ignores short and ambiguous diagonal swipes", () => {
  assert.equal(
    directionFromSwipe({ x: 0, y: 0 }, { x: 20, y: 5 }),
    null,
  );
  assert.equal(
    directionFromSwipe({ x: 0, y: 0 }, { x: 40, y: 40 }),
    null,
  );
});
