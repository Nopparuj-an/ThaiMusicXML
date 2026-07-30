// The layout arithmetic, checked against expectations derived from the
// specification rather than from this renderer's own output.
//
// The two-part cases in "Where the children fall" on the <group> page are
// written as X and O rows, X marking a beat's arrival. Those become assertions
// about which column each symbol lands on, so the tests stay statements about
// where the music falls rather than about page geometry.

import { test } from "node:test";
import assert from "node:assert/strict";
import { shares, arrivals, columnX } from "../src/layout.mjs";

const near = (actual, expected, note) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${note}: expected ${expected}, got ${actual}`,
  );

const flat = (rows) => rows.flat();

test("a measure of four plain beats divides into four", () => {
  assert.deepEqual(shares([[1, 1, 1, 1]]), [1, 1, 1, 1]);
});

test("a group of two makes a four-beat measure divide into five", () => {
  // "That beat takes two fifths and the other three take one fifth each."
  const shareList = shares([[1, 1, 2, 1]]);
  assert.deepEqual(shareList, [1, 1, 2, 1]);
  assert.equal(
    shareList.reduce((a, b) => a + b, 0),
    5,
  );
});

test("| -  -  - (ม ร ด) | puts the group on the last three of six columns", () => {
  const slots = [1, 1, 1, 3];
  assert.deepEqual(flat(arrivals(shares([slots]), slots)), [1, 2, 3, 4, 5, 6]);
});

test("| (ด ร) ม (ซ ล ท) (ดํ รํ) | divides into eight", () => {
  const slots = [2, 1, 3, 2];
  const shareList = shares([slots]);
  assert.equal(
    shareList.reduce((a, b) => a + b, 0),
    8,
  );
  assert.deepEqual(flat(arrivals(shareList, slots)), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("every beat's last slot lands on the arrival, never its first", () => {
  // Right-anchoring is the rule an engraver used to Western notation gets
  // wrong, so state it directly: the run-up belongs to the beat it leads to.
  const rows = arrivals(shares([[1, 1, 1, 3]]), [1, 1, 1, 3]);
  assert.equal(rows[3].at(-1), 6, "the measure's last symbol is on the last column");
  assert.ok(rows[3][0] > rows[2][0], "the group opens after the previous beat");
});

test("a part playing one note meets a group of three on the arrival", () => {
  // "A part that plays a single note on the grouped beat still gets the full
  // shares for it", and lands level with the group's last symbol.
  const shareList = shares([
    [1, 1, 1, 1],
    [1, 1, 1, 3],
  ]);
  assert.deepEqual(shareList, [1, 1, 1, 3]);

  const plain = arrivals(shareList, [1, 1, 1, 1]);
  const grouped = arrivals(shareList, [1, 1, 1, 3]);

  assert.equal(plain[3][0], 6, "the plain part's fourth note");
  assert.equal(grouped[3].at(-1), 6, "the group's last symbol");
});

test("two against three meet on the arrival and nowhere else", () => {
  const shareList = shares([
    [2, 1, 1, 1],
    [3, 1, 1, 1],
  ]);
  assert.deepEqual(shareList, [3, 1, 1, 1]);

  const two = arrivals(shareList, [2, 1, 1, 1])[0];
  const three = arrivals(shareList, [3, 1, 1, 1])[0];

  assert.equal(two.at(-1), 3, "the pair arrives");
  assert.equal(three.at(-1), 3, "the triple arrives");
  assert.ok(
    !two.slice(0, -1).some((a) => three.slice(0, -1).some((b) => Math.abs(a - b) < 1e-9)),
    "nothing before the arrival coincides",
  );
});

test("tightening a group moves its slack to the left, not its arrival", () => {
  // A group has to read as one gesture rather than as separate beats, which it
  // cannot do while its symbols sit as far apart as the beats around it.
  const shareList = shares([[1, 1, 1, 3]]);
  const loose = arrivals(shareList, [1, 1, 1, 3], 1)[3];
  const tight = arrivals(shareList, [1, 1, 1, 3], 0.6)[3];

  assert.equal(tight.at(-1), loose.at(-1), "the arrival does not move");
  assert.ok(tight[0] > loose[0], "the group's first symbol pulls right");
  assert.ok(
    tight[1] - tight[0] < loose[1] - loose[0],
    "its symbols sit closer than a column apart",
  );
});

test("the run of symbols centers in the cell", () => {
  // Printed scores leave matching margins either side, rather than pushing the
  // last note against the barline.
  const total = 4;
  const first = columnX(1, total, 0, 100, 1);
  const last = columnX(total, total, 0, 100, 1);

  near(first, 100 - last, "margins match");
  near((first + last) / 2, 50, "the run centers on the cell");
  near(columnX(2, total, 0, 100, 1) - first, 25, "columns are evenly spaced");
});

test("a beat no part subdivides still counts as one", () => {
  assert.deepEqual(shares([[], []]), []);
  assert.deepEqual(shares([[1, 1]]), [1, 1]);
});
