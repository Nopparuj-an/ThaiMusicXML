// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { frac } from "../src/fraction.mjs";
import { tupletRatio, ticksPerSlot, decomposeTicks, encodeDuration } from "../src/musicxml-durations.mjs";

test("tupletRatio", () => {
  assert.equal(tupletRatio(1), null);
  assert.equal(tupletRatio(2), null); // a power of two needs no tuplet marking
  assert.equal(tupletRatio(4), null);
  assert.deepEqual(tupletRatio(3), { actual: 3, normal: 2 });
  assert.deepEqual(tupletRatio(5), { actual: 5, normal: 4 });
  assert.deepEqual(tupletRatio(6), { actual: 6, normal: 4 });
  assert.deepEqual(tupletRatio(7), { actual: 7, normal: 4 });
});

test("ticksPerSlot covers a tuplet's own division and its display scaling", () => {
  assert.equal(ticksPerSlot([1]), 1);
  assert.equal(ticksPerSlot([2]), 2);
  assert.equal(ticksPerSlot([3]) % 3, 0);
  assert.equal(ticksPerSlot([3]) % 2, 0); // normal=2 for a 3-tuplet
  assert.equal(ticksPerSlot([5]) % 5, 0);
  assert.equal(ticksPerSlot([5]) % 4, 0); // normal=4 for a 5-tuplet
  assert.equal(ticksPerSlot([6]) % 3, 0); // 2/6 reduces to 1/3: still a 3-tuplet underneath
});

test("decomposeTicks: exact standard values need no tie", () => {
  const divisions = 4; // quarter = 4 ticks, eighth = 2, 16th = 1
  assert.deepEqual(decomposeTicks(4, divisions), [{ type: "quarter", dots: 0 }]);
  assert.deepEqual(decomposeTicks(2, divisions), [{ type: "eighth", dots: 0 }]);
  assert.deepEqual(decomposeTicks(6, divisions), [{ type: "quarter", dots: 1 }]); // dotted quarter
});

test("decomposeTicks: an awkward remainder ties two notes", () => {
  const divisions = 4;
  // 5 ticks: no single type or dotted type is exactly 5, so quarter + 16th
  assert.deepEqual(decomposeTicks(5, divisions), [
    { type: "quarter", dots: 0 },
    { type: "16th", dots: 0 },
  ]);
});

test("a plain note (power-of-two denominator) carries no tuplet", () => {
  const slotTicks = ticksPerSlot([1]);
  const divisions = slotTicks * 2;
  const notes = encodeDuration(frac(1), slotTicks, divisions);
  assert.deepEqual(notes, [{ ticks: slotTicks, type: "eighth", dots: 0, tuplet: null }]);
});

test("a note extended across a whole measure decomposes by its own binary value, however large", () => {
  // note held for 4 slots (from absorbed rests) = 4 eighths = one half note
  const slotTicks = ticksPerSlot([1]);
  const divisions = slotTicks * 2;
  const notes = encodeDuration(frac(4), slotTicks, divisions);
  assert.deepEqual(notes, [{ ticks: 4 * slotTicks, type: "half", dots: 0, tuplet: null }]);
});

test("a group member fully inside its bracket is one tuplet-typed note", () => {
  // ด (group ร ม ซ): ร is the group's first member, 1/3 of its beat
  const slotTicks = ticksPerSlot([1, 3]);
  const divisions = slotTicks * 2;
  const notes = encodeDuration(frac(1, 3), slotTicks, divisions);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].type, "16th");
  assert.deepEqual(notes[0].tuplet, { actual: 3, normal: 2 });
  assert.equal(notes[0].ticks, slotTicks / 3);
});

test("a 2-unit tuplet member (an absorbed rest inside the group) prints as one plain-shaped note", () => {
  // group(note, rest, note): the first note absorbs the middle rest, spanning 2 of 3 units
  const slotTicks = ticksPerSlot([3]);
  const divisions = slotTicks * 2;
  const notes = encodeDuration(frac(2, 3), slotTicks, divisions);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].type, "eighth"); // 2 of 3 triplet-16ths print as one eighth
  assert.deepEqual(notes[0].tuplet, { actual: 3, normal: 2 });
  assert.equal(notes[0].ticks, (2 * slotTicks) / 3);
});

test("a group's last member extending to fill a whole extra beat needs no tuplet marking", () => {
  // ด (group ร ม ซ) with nothing after: ซ rings for a full beat past its own 1/3 share.
  // Its sounding duration is still correct; only the display loses the tuplet-3 look.
  const slotTicks = ticksPerSlot([1, 3]);
  const divisions = slotTicks * 2;
  const notes = encodeDuration(frac(1), slotTicks, divisions);
  assert.deepEqual(notes, [{ ticks: slotTicks, type: "eighth", dots: 0, tuplet: null }]);
});

test("a preceding note absorbing a following group's leading rest is scaled by that group's own ratio", () => {
  // note, group(rest, note, note): the plain note's decay is cut short where
  // the group's own second member attacks, one 3-tuplet unit in - a duration
  // of 1/3 slot, even though the note itself was never written as a group member.
  const slotTicks = ticksPerSlot([1, 3]);
  const divisions = slotTicks * 2;
  const notes = encodeDuration(frac(1, 3), slotTicks, divisions);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].type, "16th");
  assert.deepEqual(notes[0].tuplet, { actual: 3, normal: 2 });
});
