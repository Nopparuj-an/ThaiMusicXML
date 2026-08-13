// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTuning, resolvePitch, TUNING_REFERENCES } from "../src/pitch.mjs";

test("c-major spells every degree natural, ด at middle C", () => {
  const degrees = ["ด", "ร", "ม", "ฟ", "ซ", "ล", "ท"];
  const expected = [
    { step: "C", alter: 0, octave: 4 },
    { step: "D", alter: 0, octave: 4 },
    { step: "E", alter: 0, octave: 4 },
    { step: "F", alter: 0, octave: 4 },
    { step: "G", alter: 0, octave: 4 },
    { step: "A", alter: 0, octave: 4 },
    { step: "B", alter: 0, octave: 4 },
  ];
  degrees.forEach((pitch, i) => {
    const { step, alter, octave } = resolvePitch(pitch, 0, "c-major");
    assert.deepEqual({ step, alter, octave }, expected[i]);
  });
});

test("bb-major's tonic sits below the C that follows it, a real scale from Bb", () => {
  assert.deepEqual(resolvePitch("ด", 0, "bb-major"), { midi: 58, step: "B", alter: -1, octave: 3 });
  assert.deepEqual(resolvePitch("ร", 0, "bb-major"), { midi: 60, step: "C", alter: 0, octave: 4 });
  assert.deepEqual(resolvePitch("ฟ", 0, "bb-major"), { midi: 63, step: "E", alter: -1, octave: 4 });
});

test("the three spellings of one degree resolve identically", () => {
  const thai = resolvePitch("ด", 0, "c-major");
  const letter = resolvePitch("D", 0, "c-major");
  const lower = resolvePitch("d", 0, "c-major");
  const number = resolvePitch("1", 0, "c-major");
  assert.deepEqual(letter, thai);
  assert.deepEqual(lower, thai);
  assert.deepEqual(number, thai);
});

test("octave attribute shifts by whole octaves", () => {
  assert.equal(resolvePitch("ด", 1, "c-major").midi, 72);
  assert.equal(resolvePitch("ด", -1, "c-major").midi, 48);
  assert.equal(resolvePitch("ด", 2, "c-major").midi, 84);
});

test("a literal nikhahit or pinthu determines the octave, ignoring the attribute", () => {
  assert.equal(resolvePitch("ดํ", 0, "c-major").midi, resolvePitch("ด", 1, "c-major").midi);
  assert.equal(resolvePitch("ทฺ", 0, "c-major").midi, resolvePitch("ท", -1, "c-major").midi);
  // octave alongside a modifier is ignored, not added to it
  assert.equal(resolvePitch("ดํ", 5, "c-major").midi, resolvePitch("ด", 1, "c-major").midi);
});

test("g-major spells its seventh degree with a sharp", () => {
  assert.deepEqual(resolvePitch("ด", 0, "g-major"), { midi: 55, step: "G", alter: 0, octave: 3 });
  assert.deepEqual(resolvePitch("ท", 0, "g-major"), { midi: 66, step: "F", alter: 1, octave: 4 });
});

test("eb-major spells three degrees with flats, none doubled", () => {
  assert.deepEqual(resolvePitch("ด", 0, "eb-major"), { midi: 51, step: "E", alter: -1, octave: 3 });
  assert.deepEqual(resolvePitch("ฟ", 0, "eb-major"), { midi: 56, step: "A", alter: -1, octave: 3 });
  assert.deepEqual(resolvePitch("ซ", 0, "eb-major"), { midi: 58, step: "B", alter: -1, octave: 3 });
});

test("all twelve tuning references resolve without a warning and spell every degree with a single accidental", () => {
  assert.equal(TUNING_REFERENCES.length, 12);
  for (const reference of TUNING_REFERENCES) {
    const warnings = [];
    assert.equal(resolveTuning(reference, (w) => warnings.push(w)), reference);
    assert.equal(warnings.length, 0);
    for (const pitch of ["ด", "ร", "ม", "ฟ", "ซ", "ล", "ท"]) {
      const { alter } = resolvePitch(pitch, 0, reference);
      assert.ok(alter >= -1 && alter <= 1, `${reference} ${pitch}: alter ${alter} out of range`);
    }
  }
});

test("resolveTuning falls back to c-major on an unrecognized or missing reference", () => {
  const warnings = [];
  assert.equal(resolveTuning("khrueang-sai", (w) => warnings.push(w)), "c-major");
  assert.equal(resolveTuning(null, (w) => warnings.push(w)), "c-major");
  assert.equal(resolveTuning(undefined, (w) => warnings.push(w)), "c-major");
  assert.equal(warnings.length, 3);
  assert.equal(resolveTuning("bb-major"), "bb-major");
});
