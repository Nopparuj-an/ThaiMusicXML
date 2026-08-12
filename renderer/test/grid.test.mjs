// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// layBoxes() and measureLine() directly, without going through a whole laid-
// out score the way layout.test.mjs's fixtures do. layBoxes() never looks at
// a row's measures or beats - only at instrumentOf(), a part's own
// annotations, and rowHeight/gap.instrument - so the rows and lines below are
// deliberately empty shells, opaque values whose only job is to carry an
// identity.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createPager } from "../src/pager.mjs";
import { createGridRenderer } from "../src/grid.mjs";
import { defaults } from "../src/settings.mjs";

const page = { width: 595.28, height: 841.89, marginSide: 42, marginTop: 42, marginBottom: 42 };

// A grid renderer wired to fakes minimal enough to exercise layBoxes() and
// measureLine() alone. `annotations` mirrors parse()'s
// score.music[partId][sectionId].annotations shape.
function makeGrid({ annotations = {} } = {}) {
  const pager = createPager(page);
  const s = { ...defaults, page };
  const instrumentOf = (p) => p.stack ?? `solo:${p.id}`;
  const gap = { instrument: 6, line: 4, row: 0, section: 20 };
  const drawnAnnotations = [];
  // A fake stand-in for layout.mjs's own annotationRow(): draws nothing real,
  // just records that it ran and advances y by a fixed, made-up height, which
  // is enough to prove a box gets pushed down by its own annotation.
  const annotationRow = (note) => {
    drawnAnnotations.push(note);
    pager.y += 11;
  };
  // Any part/section not given explicit annotations above falls back to
  // none, so a test that does not care about annotations does not have to
  // stub every part it names.
  const music = new Proxy(annotations, {
    get: (target, partId) => target[partId] ?? new Proxy({}, { get: () => ({ annotations: [] }) }),
  });
  const score = { music };
  const { layBoxes, renderGridLine, measureLine } = createGridRenderer({
    pager,
    settings: s,
    score,
    instrumentOf,
    gap,
    showLabels: true,
    cellWidth: 64,
    left: s.page.marginSide,
    annotationRow,
  });
  return { pager, layBoxes, renderGridLine, measureLine, drawnAnnotations, s };
}

const row = (partId, opts = {}) => ({ part: { id: partId, ...opts }, line: { measures: [] } });

test("rows sharing one instrument key rule as a single box; a different key opens a new one", () => {
  const { layBoxes } = makeGrid();
  const rows = [row("P1", { stack: "khong" }), row("P2", { stack: "khong" }), row("P3")];
  const boxes = layBoxes(rows, { id: "s1" }, 0, 0);

  assert.equal(boxes.length, 2, "P1+P2 share a box, P3 opens its own");
  assert.equal(boxes[0].rows.length, 2);
  assert.equal(boxes[1].rows.length, 1);
});

test("a box's rows stack rowHeight apart, and the next box clears it by gap.instrument", () => {
  const { layBoxes, s } = makeGrid();
  const rows = [row("P1", { stack: "a" }), row("P2", { stack: "a" }), row("P3")];
  const boxes = layBoxes(rows, { id: "s1" }, 0, 0);

  assert.equal(boxes[0].top, 0);
  assert.equal(boxes[0].rows[0].top, 0);
  assert.equal(boxes[0].rows[1].top, s.rowHeight);
  assert.equal(boxes[0].bottom, 2 * s.rowHeight);
  assert.equal(boxes[1].top, boxes[0].bottom + 6, "gap.instrument separates the boxes");
});

test("a part's own annotations print above its box, pushing that box (and later boxes) down", () => {
  const { layBoxes, drawnAnnotations } = makeGrid({
    annotations: { P1: { s1: { annotations: ["หมายเหตุ"] } }, P2: { s1: { annotations: [] } } },
  });
  const rows = [row("P1"), row("P2", { stack: "b" })];
  const boxes = layBoxes(rows, { id: "s1" }, 0, 0);

  assert.deepEqual(drawnAnnotations, ["หมายเหตุ"], "only P1's box gets its annotation drawn, once");
  assert.equal(boxes[0].top, 11, "P1's box is pushed down by its annotation's height");
  assert.equal(boxes[1].top, boxes[0].bottom + 6, "P2's box still follows with the ordinary instrument gap");
});

test("ownAnnotations: false suppresses every box's own annotations, even at lineIndex 0", () => {
  const { layBoxes, drawnAnnotations } = makeGrid({
    annotations: { P1: { s1: { annotations: ["หมายเหตุ"] } } },
  });
  const rows = [row("P1")];
  const boxes = layBoxes(rows, { id: "s1" }, 0, 0, { ownAnnotations: false });

  assert.equal(drawnAnnotations.length, 0);
  assert.equal(boxes[0].top, 0);
});

test("measureLine() caches by each row's line-object identity, not by the rows array's own identity", () => {
  // Two structurally distinct rows arrays that both point at the same
  // (part, line) pair - the real shape of the redundancy this cache exists
  // for: layout.mjs's own "extra" measurement for a heading builds its rows
  // array separately from the renderGridLine() call that later measures (and
  // draws) that same line for real.
  const { measureLine, drawnAnnotations } = makeGrid({
    annotations: { P1: { s1: { annotations: ["หมายเหตุ"] } } },
  });
  const part = { id: "P1" };
  const line = { measures: [] };

  const first = measureLine([{ part, line }], { id: "s1" }, 0);
  const second = measureLine([{ part, line }], { id: "s1" }, 0);

  assert.equal(first, second);
  assert.equal(drawnAnnotations.length, 1, "the second call reused the first answer instead of laying the line out again");
});

test("two distinct lines at the same lineIndex are measured independently, never conflated", () => {
  // The case caching-by-(section.id, lineIndex) alone would get wrong: two
  // different <ending>s both number their own first line 0, so a cache keyed
  // that way would answer the second ending's measureLine() call with the
  // first ending's height.
  const { measureLine, drawnAnnotations } = makeGrid({
    annotations: { P1: { s1: { annotations: ["หนึ่ง"] } } },
  });
  const part = { id: "P1" };

  measureLine([{ part, line: { measures: [] } }], { id: "s1" }, 0);
  measureLine([{ part, line: { measures: [] } }], { id: "s1" }, 0);

  assert.equal(drawnAnnotations.length, 2, "two distinct line objects are each measured for real, not cache-collided");
});

test("measureLine() leaves no trace on the real cursor or page", () => {
  const { pager, measureLine } = makeGrid({
    annotations: { P1: { s1: { annotations: ["หมายเหตุ"] } } },
  });
  pager.y = 200;
  pager.pending = 3;
  measureLine([row("P1")], { id: "s1" }, 0);

  assert.equal(pager.y, 200);
  assert.equal(pager.pending, 3);
  assert.deepEqual(pager.pages[0], [], "nothing measureLine() draws leaks onto the real page");
});
