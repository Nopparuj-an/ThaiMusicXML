// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// pager.mjs in isolation - the pagination cursor layout.mjs and grid.mjs
// thread through their own drawing, tested here without a score or any
// content at all: does ensureRoom() call newPage() at the right moment, does
// spend() cap what pending gives up, does withScratch() leave no trace.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createPager } from "../src/pager.mjs";

const page = { width: 100, height: 200, marginSide: 10, marginTop: 20, marginBottom: 20 };

test("push() lands on the current page, pushTo() on whichever page is named", () => {
  const pager = createPager(page);
  pager.push({ id: "a" });
  pager.newPage();
  pager.push({ id: "b" });
  pager.pushTo(0, { id: "c" });

  assert.deepEqual(pager.pages[0], [{ id: "a" }, { id: "c" }]);
  assert.deepEqual(pager.pages[1], [{ id: "b" }]);
});

test("newPage() resets y to the top margin, pending to zero, and starts a fresh page", () => {
  const pager = createPager(page);
  pager.y = 150;
  pager.pending = 5;
  pager.newPage();

  assert.equal(pager.page, 1);
  assert.equal(pager.y, page.marginTop);
  assert.equal(pager.pending, 0);
  assert.equal(pager.pages.length, 2);
});

test("ensureRoom() breaks to a new page only once content plus the pending break would overflow", () => {
  const pager = createPager(page); // bottom = 200 - 20 = 180
  pager.y = 170;
  pager.ensureRoom(5); // 170 + 5 = 175, fits
  assert.equal(pager.page, 0);

  pager.ensureRoom(20); // 170 + 20 = 190, overflows
  assert.equal(pager.page, 1);
  assert.equal(pager.y, page.marginTop);
});

test("ensureRoom() never breaks at the very top of a page, however tall the content", () => {
  // The y > pageTop guard: a block taller than a whole page still has to
  // land somewhere, and breaking again from the top of the fresh page it is
  // already on would loop forever.
  const pager = createPager(page);
  pager.y = page.marginTop; // top of page 0, nothing placed yet
  pager.ensureRoom(10000);
  assert.equal(pager.page, 0, "no break: the cursor was already at the top");
});

test("ensureRoom() folds in the pending break, capped, before comparing against the bottom", () => {
  const pager = createPager(page); // bottom = 180
  pager.y = 170;
  pager.pending = 20;
  pager.ensureRoom(5, 3); // capped pending contribution is 3: 170+3+5=178, fits
  assert.equal(pager.page, 0);

  pager.ensureRoom(5); // uncapped: 170+20+5=195, overflows
  assert.equal(pager.page, 1);
});

test("spend() takes the smaller of pending and its cap, leaving the rest owed", () => {
  const pager = createPager(page);
  pager.y = 50;
  pager.pending = 10;

  pager.spend(4);
  assert.equal(pager.y, 54);
  assert.equal(pager.pending, 6, "what a capped spend does not use stays owed");

  pager.spend();
  assert.equal(pager.y, 60);
  assert.equal(pager.pending, 0);
});

test("page.infinite drops the bottom edge, so ensureRoom() never breaks", () => {
  const pager = createPager({ ...page, infinite: true });
  pager.y = 170;
  pager.ensureRoom(10000);
  assert.equal(pager.page, 0);
});

test("withScratch() runs fn() against a throwaway sink at y=0, then restores the real cursor untouched", () => {
  const pager = createPager(page);
  pager.push({ id: "real" });
  pager.y = 99;
  pager.pending = 7;

  let sawDuringScratch;
  const result = pager.withScratch(() => {
    pager.push({ id: "scratch" });
    sawDuringScratch = { y: pager.y, pending: pager.pending };
    return "fn's return value";
  });

  assert.equal(result, "fn's return value");
  assert.deepEqual(sawDuringScratch, { y: 0, pending: 0 });
  assert.equal(pager.y, 99, "y is restored");
  assert.equal(pager.pending, 7, "pending is restored");
  assert.deepEqual(pager.pages[0], [{ id: "real" }], "the scratch push never reached the real page");
});

test("withScratch() restores the real cursor even where fn() throws", () => {
  const pager = createPager(page);
  pager.y = 42;
  assert.throws(() =>
    pager.withScratch(() => {
      throw new Error("boom");
    }),
  );
  assert.equal(pager.y, 42, "the cursor comes back regardless of how fn() exits");
});
