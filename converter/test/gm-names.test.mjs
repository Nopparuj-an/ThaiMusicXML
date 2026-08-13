// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { GM_INSTRUMENT_FAMILIES, GM_PERCUSSION_NOTES } from "../src/gm-names.mjs";

test("GM_INSTRUMENT_FAMILIES covers every program 1-128 exactly once", () => {
  const programs = GM_INSTRUMENT_FAMILIES.flatMap((f) => f.instruments.map((i) => i.program));
  assert.equal(programs.length, 128);
  assert.equal(new Set(programs).size, 128);
  for (let program = 1; program <= 128; program++) assert.ok(programs.includes(program));
});

test("GM_PERCUSSION_NOTES covers every note 35-81 exactly once", () => {
  const notes = GM_PERCUSSION_NOTES.map((n) => n.note);
  assert.equal(notes.length, 47);
  assert.equal(new Set(notes).size, 47);
  for (let note = 35; note <= 81; note++) assert.ok(notes.includes(note));
});
