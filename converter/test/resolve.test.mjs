// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Structural resolution: pass counts, line-repeat expansion, ending
// substitution, and rest folding. See reference/conversion in the docs for
// the policy under test.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "../src/resolve.mjs";
import { NS } from "../../renderer/src/parse.mjs";

const corpus = (name) =>
  readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "../../public/corpus/valid", name),
    "utf8",
  );

const score = (body, { partAttrs = "", structure = `<section id="s1" name="s1"/>` } = {}) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="0.1">
  <header><title>ทดสอบ</title></header>
  <structure>${structure}</structure>
  <ensemble><part id="P1"${partAttrs}/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">${body}</section-ref>
  </part-data>
</thai-score>`;

const num = (f) => f.n / f.d;
const pitches = (notes) => notes.map((n) => n.rest ? "-" : n.pitch);

test("line-repeat ranges expand nested, in document order", () => {
  const doc = resolve(corpus("line-repeats.txml"));
  const [item] = doc.playOrder.filter((i) => i.kind === "section");
  assert.equal(item.totalPasses, 1);

  const { passes } = doc.resolveSection("P1", "s1", item.totalPasses);
  const order = pitches(passes[0].notes).filter((_, i) => i % 2 === 0); // one pitch per line is enough to see the order
  assert.deepEqual(order, [
    "ด", "ม", "ล", "ม", "ล", "ม", "ล", "ดํ", // first pass of the outer [1,4] range
    "ด", "ม", "ล", "ม", "ล", "ม", "ล", "ดํ", // second pass of the outer range
    "ซ", "ซ", // the disjoint [5,5] range, twice
  ]);
});

test("nested <repeat> multiplies a section's total pass count", () => {
  const doc = resolve(corpus("repeats-and-endings.txml"));
  const [item] = doc.playOrder.filter((i) => i.kind === "section");
  assert.equal(item.totalPasses, 4);
});

test("<ending> substitutes its line only on the passes it names", () => {
  const doc = resolve(corpus("repeats-and-endings.txml"));
  const { passes } = doc.resolveSection("P1", "s1", 4);
  assert.equal(passes.length, 4);

  // Passes 1 and 3 play the base line 2: ล ซ ม ร.
  assert.deepEqual(pitches(passes[0].notes).slice(4), ["ล", "ซ", "ม", "ร"]);
  assert.deepEqual(pitches(passes[2].notes).slice(4), ["ล", "ซ", "ม", "ร"]);
  // Passes 2 and 4 play the ending's line 2: ล ม ร ด.
  assert.deepEqual(pitches(passes[1].notes).slice(4), ["ล", "ม", "ร", "ด"]);
  assert.deepEqual(pitches(passes[3].notes).slice(4), ["ล", "ม", "ร", "ด"]);

  // The part with no <ending> plays the same line 2 on every pass.
  const p2 = doc.resolveSection("P2", "s1", 4);
  for (const pass of p2.passes) assert.deepEqual(pitches(pass.notes).slice(4), ["ล", "ซ", "ม", "ร"]);
});

test("unroll() concatenates every pass in playback order", () => {
  const doc = resolve(corpus("repeats-and-endings.txml"));
  const { notes } = doc.unroll("P1");
  assert.equal(notes.length, 4 * 8); // 4 passes, 2 lines of 4 notes each
  assert.equal(num(notes[0].onset), 0);
  assert.equal(num(notes[8].onset), 8); // second pass starts right after the first
});

test("a <rest> extends the previous note rather than sounding as silence", () => {
  const doc = resolve(
    score(`<line number="1"><measure number="1">
      <note pitch="ด"/><rest/><rest/><note pitch="ร"/>
    </measure></line>`),
  );
  const { passes } = doc.resolveSection("P1", "s1", 1);
  const notes = passes[0].notes;
  assert.equal(notes.length, 2);
  assert.equal(notes[0].pitch, "ด");
  assert.equal(num(notes[0].duration), 3); // one slot of its own plus two absorbed rests
  assert.equal(notes[1].pitch, "ร");
  assert.equal(num(notes[1].duration), 1);
});

test("a rest before any note in its measure is a real silence", () => {
  const doc = resolve(
    score(`<line number="1"><measure number="1"><rest/><note pitch="ด"/></measure></line>`),
  );
  const notes = doc.resolveSection("P1", "s1", 1).passes[0].notes;
  assert.equal(notes[0].rest, true);
  assert.equal(notes[1].pitch, "ด");
});

test("note extension does not cross a measure boundary", () => {
  const doc = resolve(
    score(
      `<line number="1">
        <measure number="1"><note pitch="ด"/><rest/><rest/><rest/></measure>
        <measure number="2"><rest/><note pitch="ร"/></measure>
      </line>`,
    ),
  );
  const notes = doc.resolveSection("P1", "s1", 1).passes[0].notes;
  assert.equal(notes[0].pitch, "ด");
  assert.equal(num(notes[0].duration), 4); // capped at the end of measure 1
  assert.equal(notes[1].rest, true); // measure 2's leading rest does not tie back to it
  assert.equal(num(notes[1].duration), 1);
  assert.equal(notes[2].pitch, "ร");
});

test("a <group>'s last member lands on the beat; earlier members lead up to it", () => {
  // "ด (ร ม ซ)": the group replaces beat 2, so ซ (its last member) falls
  // where a plain note at beat 2 would, and ร, ม run up to it beforehand -
  // borrowing from ด's own decay rather than from a full beat of their own.
  // See group.md's "Where the children fall".
  const doc = resolve(
    score(
      `<line number="1"><measure number="1">
        <note pitch="ด"/><group><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></group>
      </measure></line>`,
    ),
  );
  const notes = doc.resolveSection("P1", "s1", 1).passes[0].notes;
  assert.equal(notes.length, 4);
  assert.deepEqual(
    notes.map((n) => [n.pitch, num(n.onset), num(n.duration)]),
    [
      ["ด", 0, 1 / 3], // cut short: ร attacks before ด's beat would otherwise end
      ["ร", 1 / 3, 1 / 3],
      ["ม", 2 / 3, 1 / 3],
      ["ซ", 1, 1], // the last member: lands on the beat, then rings to the measure's end
    ],
  );
});

test("a pickup group after leading rests: only the group's own members are real silence", () => {
  // "- - - (ฟ ซ ล)": three rests, then a group in the last beat. Nothing has
  // sounded yet when the group's own leading member attacks, so ฟ is real
  // silence up to that point, not an extension of anything.
  const doc = resolve(
    score(
      `<line number="1"><measure number="1">
        <rest/><rest/><rest/><group><note pitch="ฟ"/><note pitch="ซ"/><note pitch="ล"/></group>
      </measure></line>`,
    ),
  );
  const notes = doc.resolveSection("P1", "s1", 1).passes[0].notes;
  assert.deepEqual(
    notes.map((n) => [n.rest ? "-" : n.pitch, num(n.onset), num(n.duration)]),
    [
      ["-", 0, 1],
      ["-", 1, 1],
      ["-", 2, 1 / 3], // cut short: ฟ attacks before beat 3's own rest would otherwise end
      ["ฟ", 7 / 3, 1 / 3],
      ["ซ", 8 / 3, 1 / 3],
      ["ล", 3, 1], // lands on beat 4, then rings to the measure's end
    ],
  );
});

test("a stacked row's decay is capped by the next attack in any row of its stack, not just its own", () => {
  // Reproduces example-khaek-borathes.txml's s2 measure 3. P2's ฟ absorbs two
  // trailing rests with nothing else written in its own row, so with no
  // sibling it would ring for a full extra beat past its own share. P1's
  // sibling row attacks partway through that window (ซ, the group's own
  // middle position) - a stack is one physical instrument (group.md's
  // `link`), so ฟ's decay stops mattering there instead of ringing on.
  const doc = resolve(
    `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="0.1">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble>
    <part id="P1" stack="k" row="1"/>
    <part id="P2" stack="k" row="2"/>
  </ensemble>
  <part-data part="P1">
    <section-ref section="s1"><line number="1"><measure number="1">
      <rest/><rest/><rest/>
      <group><rest/><note pitch="ซ"/><note pitch="ล"/></group>
    </measure></line></section-ref>
  </part-data>
  <part-data part="P2">
    <section-ref section="s1"><line number="1"><measure number="1">
      <rest/><rest/><rest/>
      <group><note pitch="ฟ"/><rest/><rest/></group>
    </measure></line></section-ref>
  </part-data>
</thai-score>`,
  );

  const p2Notes = doc.resolveSection("P2", "s1", 1).passes[0].notes;
  assert.deepEqual(
    p2Notes.map((n) => [n.rest ? "-" : n.pitch, num(n.onset), num(n.duration)]),
    [
      ["-", 0, 1],
      ["-", 1, 1],
      ["-", 2, 1 / 3],
      ["ฟ", 7 / 3, 1 / 3], // capped by P1's ซ, not left ringing to the measure's end
    ],
  );

  // P1 itself is unaffected: its own next note (ล) follows ซ with no gap, an
  // explicit choice a sibling's activity shouldn't override. Its group's own
  // leading rest is real silence too (nothing has sounded yet in P1 either).
  const p1Notes = doc.resolveSection("P1", "s1", 1).passes[0].notes;
  assert.deepEqual(
    p1Notes.map((n) => [n.rest ? "-" : n.pitch, num(n.onset), num(n.duration)]),
    [
      ["-", 0, 1],
      ["-", 1, 1],
      ["-", 2, 1 / 3],
      ["-", 7 / 3, 1 / 3],
      ["ซ", 8 / 3, 1 / 3],
      ["ล", 3, 1],
    ],
  );
});

test("a non-stacked part's decay is unaffected - only sibling rows of the same stack cap it", () => {
  const doc = resolve(
    score(
      `<line number="1"><measure number="1">
        <rest/><rest/><rest/><group><note pitch="ฟ"/><rest/><rest/></group>
      </measure></line>`,
    ),
  );
  const notes = doc.resolveSection("P1", "s1", 1).passes[0].notes;
  const flat = notes.find((n) => n.pitch === "ฟ");
  assert.equal(num(flat.duration), 5 / 3); // no stack, no sibling, no capping
});
