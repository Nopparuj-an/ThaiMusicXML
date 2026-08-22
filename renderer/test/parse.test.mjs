// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// The parsed tree, checked as a reading of the document rather than as a
// prelude to layout. Everything here is a statement about what the file says:
// no coordinate, size or placement belongs in this file.
//
// Span resolution gets most of the attention, because it is the one part of
// this stage that has to hold state across the walk - a marker's meaning
// depends on notes it does not sit next to, and on which run of <line>
// elements it is being matched within.

import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, NS } from "../src/parse.mjs";

/** A one-part score whose section-ref body is written out in full. */
const score = (body, { partAttrs = "", structure = `<section id="s1" name="s1"/>` } = {}) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>${structure}</structure>
  <ensemble><part id="P1"${partAttrs}/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">${body}</section-ref>
  </part-data>
</thai-score>`;

/** The one line most of these fixtures need, with the measure written out. */
const line = (number, measure) => `<line number="${number}"><measure number="1">${measure}</measure></line>`;

const at = (lineIndex, measureIndex, beatIndex, slotIndex) => ({
  lineIndex,
  measureIndex,
  beatIndex,
  slotIndex,
});

// The shape of a measure.

test("a bare note or rest is a beat of one slot, and a group is a beat of as many slots as it has children", () => {
  const doc = score(line(1, `<note pitch="ด"/><rest/><group><note pitch="ม"/><note pitch="ฟ"/><note pitch="ซ"/></group>`));
  const { beats } = parse(doc).music.P1.s1.lines[0].measures[0];

  assert.equal(beats.length, 3, "three children of the measure are three beats");
  assert.deepEqual(
    beats.map((b) => b.slots.length),
    [1, 1, 3],
  );
  assert.deepEqual(
    beats.map((b) => b.group),
    [false, false, true],
  );
});

test("a rest is a slot of its own kind, carrying nothing else", () => {
  const doc = score(line(1, `<rest/>`));
  assert.deepEqual(parse(doc).music.P1.s1.lines[0].measures[0].beats[0].slots[0], { kind: "rest" });
});

test("a note's pitch, sound and octave are read as written, and are null where the attribute is absent", () => {
  const doc = score(line(1, `<note pitch="ด" octave="-1" sound="ching"/><note pitch="ร"/>`));
  const [marked, bare] = parse(doc).music.P1.s1.lines[0].measures[0].beats.map((b) => b.slots[0]);

  assert.deepEqual(marked, { kind: "note", pitch: "ด", sound: "ching", octave: -1 });
  assert.deepEqual(bare, { kind: "note", pitch: "ร", sound: null, octave: null });
});

test("a zero-duration marker inside a group takes no slot, so it does not divide the beat", () => {
  // <bow> and <parenthesis> sound nothing. A group of two notes divides its
  // beat in two whether or not a marker was written between them.
  const doc = score(line(1, `<group><note pitch="ด"/><bow type="start"/><note pitch="ร"/></group>`));
  const { beats } = parse(doc).music.P1.s1.lines[0].measures[0];

  assert.equal(beats[0].slots.length, 2);
  assert.deepEqual(
    beats[0].slots.map((s) => s.pitch),
    ["ด", "ร"],
  );
});

test("a lyric part's measures hold items in document order and never divide into beats", () => {
  const doc = score(line(1, `<syllable>ลา</syllable><rest/><syllable>ดวง</syllable>`), {
    partAttrs: ` type="lyric"`,
  });
  const measure = parse(doc).music.P1.s1.lines[0].measures[0];

  assert.equal(measure.beats, undefined);
  assert.deepEqual(measure.items, [
    { kind: "syllable", text: "ลา" },
    { kind: "rest" },
    { kind: "syllable", text: "ดวง" },
  ]);
});

// The structure sequence.

test("a repeat contributes what it wraps and leaves nothing of itself in the sequence", () => {
  const doc = score(line(1, `<note pitch="ด"/>`), {
    structure: `<section id="s1" name="s1"/><repeat times="2"><annotation>กลับต้น</annotation><section id="s2" name="s2"/></repeat>`,
  });
  const { structure } = parse(doc);

  assert.deepEqual(
    structure.map((item) => item.kind),
    ["section", "annotation", "section"],
    "the repeat's children keep their place in order; the repeat itself prints nothing",
  );
});

test("a bare annotation goes left and a bare credit centers, since where each one sits differs", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title><composer>ครูมีแขก</composer></header>
  <structure><annotation>สองชั้น</annotation><section id="s1" name="s1"/></structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1"><section-ref section="s1">${line(1, `<note pitch="ด"/>`)}</section-ref></part-data>
</thai-score>`;
  const { structure, composer } = parse(doc);

  assert.deepEqual(structure[0], { kind: "annotation", left: "สองชั้น", center: null, right: null });
  assert.deepEqual(composer, { left: null, center: "ครูมีแขก", right: null });
});

test("a direction carries chan and bpm out of the sequence, each null where its element is absent", () => {
  const doc = score(line(1, `<note pitch="ด"/>`), {
    structure: `<direction><chan value="2"/><bpm>80</bpm></direction><direction><chan value="3"/></direction><section id="s1" name="s1"/>`,
  });
  const directions = parse(doc).structure.filter((item) => item.kind === "direction");

  assert.deepEqual(directions[0], { kind: "direction", chan: "2", bpm: 80 });
  assert.deepEqual(directions[1], { kind: "direction", chan: "3", bpm: null });
});

// Span resolution.

test("a start marker opens on the note after it and a stop closes on the note before it", () => {
  // Neither end is the marker's own position: the span is ร..ม, not ด..ฟ.
  const doc = score(line(1, `<note pitch="ด"/><bow type="start" direction="out"/><note pitch="ร"/><note pitch="ม"/><bow type="stop"/><note pitch="ฟ"/>`));
  const spans = parse(doc).music.P1.s1.bowSpans;

  assert.equal(spans.length, 1);
  assert.equal(spans[0].direction, "out");
  assert.deepEqual(spans[0].first, at(0, 0, 1, 0));
  assert.deepEqual(spans[0].last, at(0, 0, 2, 0));
});

test("a span's ends are array indices into the lines it was matched over, counting beats afresh in each measure", () => {
  const doc = score(
    `<line number="1">
      <measure number="1"><note pitch="ด"/><note pitch="ร"/><parenthesis type="start"/></measure>
      <measure number="2"><note pitch="ม"/><note pitch="ฟ"/></measure>
    </line>
    <line number="2">
      <measure number="1"><note pitch="ซ"/><parenthesis type="stop"/><note pitch="ล"/></measure>
    </line>`,
  );
  const spans = parse(doc).music.P1.s1.parenSpans;

  assert.equal(spans.length, 1);
  assert.deepEqual(spans[0].first, at(0, 1, 0, 0), "the span opens on the first note of the next measure");
  assert.deepEqual(spans[0].last, at(1, 0, 0, 0), "and closes on the first note of the next line, beats counted from 0 again");
});

test("a span's ends address a slot inside a group, not the group as a whole", () => {
  const doc = score(line(1, `<group><note pitch="ด"/><bow type="start"/><note pitch="ร"/><note pitch="ม"/><bow type="stop"/></group><note pitch="ฟ"/>`));
  const spans = parse(doc).music.P1.s1.bowSpans;

  assert.deepEqual(spans[0].first, at(0, 0, 0, 1), "the second slot of the group");
  assert.deepEqual(spans[0].last, at(0, 0, 0, 2), "the third");
});

test("a bow and a parenthesis are matched independently, so one may open inside the other", () => {
  // Two spans of the same type cannot nest or overlap, which is why matching
  // needs no stack - but a bow and a parenthesis are separate runs.
  const doc = score(line(1, `<bow type="start"/><note pitch="ด"/><parenthesis type="start"/><note pitch="ร"/><bow type="stop"/><note pitch="ม"/><parenthesis type="stop"/>`));
  const { bowSpans, parenSpans } = parse(doc).music.P1.s1;

  assert.deepEqual(bowSpans[0].first, at(0, 0, 0, 0));
  assert.deepEqual(bowSpans[0].last, at(0, 0, 1, 0));
  assert.deepEqual(parenSpans[0].first, at(0, 0, 1, 0));
  assert.deepEqual(parenSpans[0].last, at(0, 0, 2, 0));
});

test("a parenthesis reads dim and mute as three states, so an absent attribute is not a written false", () => {
  // The renderer's own default only applies where the document said nothing;
  // dim="false" has to survive as a written decision.
  const spansFor = (attrs) =>
    parse(score(line(1, `<parenthesis type="start"${attrs}/><note pitch="ด"/><parenthesis type="stop"/>`))).music.P1.s1
      .parenSpans[0];

  assert.equal(spansFor("").dim, null);
  assert.equal(spansFor("").mute, null);
  assert.equal(spansFor(` dim="true" mute="true"`).dim, true);
  assert.equal(spansFor(` dim="true" mute="true"`).mute, true);
  assert.equal(spansFor(` dim="false"`).dim, false);
});

test("a marker with nothing to match is dropped rather than left half-resolved", () => {
  const unclosed = score(line(1, `<bow type="start"/><note pitch="ด"/>`));
  assert.deepEqual(parse(unclosed).music.P1.s1.bowSpans, [], "a start that never closes produces no span");

  const unopened = score(line(1, `<note pitch="ด"/><parenthesis type="stop"/>`));
  assert.deepEqual(parse(unopened).music.P1.s1.parenSpans, [], "a stop with nothing open produces no span");
});

test("spans are matched within one section-ref, so a marker cannot reach into the next section", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/><section id="s2" name="s2"/></structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">${line(1, `<bow type="start"/><note pitch="ด"/>`)}</section-ref>
    <section-ref section="s2">${line(1, `<note pitch="ร"/><bow type="stop"/>`)}</section-ref>
  </part-data>
</thai-score>`;
  const music = parse(doc).music.P1;

  assert.deepEqual(music.s1.bowSpans, [], "s1's start finds no stop of its own");
  assert.deepEqual(music.s2.bowSpans, [], "and s2's stop is not s1's");
});

test("an ending's lines are matched as their own run, numbered from its own first line", () => {
  const doc = score(
    `${line(1, `<note pitch="ด"/>`)}
     <ending pass="2">
       ${line(1, `<note pitch="ร"/>`)}
       ${line(2, `<bow type="start"/><note pitch="ม"/><note pitch="ฟ"/><bow type="stop"/>`)}
     </ending>`,
  );
  const ending = parse(doc).music.P1.s1.endings[0];

  assert.deepEqual(ending.pass, [2]);
  assert.equal(ending.bowSpans.length, 1);
  assert.deepEqual(ending.bowSpans[0].first, at(1, 0, 0, 0), "lineIndex 1 is the ending's second line, not the section's");
  assert.deepEqual(ending.bowSpans[0].last, at(1, 0, 1, 0));
});

test("a span an ending leaves dangling is silently unmatched, since passes are not resolved here", () => {
  // Per <ending>'s "Spans across an overridden line", a span may open in the
  // regular lines and close inside an ending on some pass. This renderer
  // prints every ending once, unconditionally, so it never resolves a pass -
  // the two runs are matched separately and the dangling marker draws nothing
  // rather than reaching across. Documented limitation, not a defect.
  const doc = score(
    `${line(1, `<bow type="start"/><note pitch="ด"/>`)}
     <ending pass="2">${line(1, `<note pitch="ร"/><bow type="stop"/>`)}</ending>`,
  );
  const section = parse(doc).music.P1.s1;

  assert.deepEqual(section.bowSpans, []);
  assert.deepEqual(section.endings[0].bowSpans, []);
});

test("a lyric part resolves no spans at all, since neither marker is valid there", () => {
  const doc = score(line(1, `<bow type="start"/><syllable>ลา</syllable><syllable>ดวง</syllable><bow type="stop"/>`), {
    partAttrs: ` type="lyric"`,
  });
  const section = parse(doc).music.P1.s1;

  assert.deepEqual(section.bowSpans, []);
  assert.deepEqual(section.parenSpans, []);
  assert.deepEqual(section.linkSpans, []);
});

test("a link span resolves like a bow, carrying nothing from its start marker", () => {
  // Its shape follows from where its notes fell, so unlike a bow's direction
  // or a parenthesis's dim there is nothing on the start to read.
  const doc = score(line(1, `<note pitch="ด"/><link type="start"/><note pitch="ร"/><note pitch="ม"/><link type="stop"/><note pitch="ฟ"/>`));
  const spans = parse(doc).music.P1.s1.linkSpans;

  assert.equal(spans.length, 1);
  assert.deepEqual(Object.keys(spans[0]).sort(), ["first", "last"]);
  assert.deepEqual(spans[0].first, at(0, 0, 1, 0));
  assert.deepEqual(spans[0].last, at(0, 0, 2, 0));
});

test("a link span reaches past the group it opens in, which is the point of it being a marker", () => {
  // A boolean on <group> could only ever mark one beat. Here the span opens
  // before one group and closes after the next, four notes and two beats on.
  const doc = score(
    line(1, `<link type="start"/><group><note pitch="ด"/><note pitch="ร"/></group><group><note pitch="ม"/><note pitch="ฟ"/></group><link type="stop"/><note pitch="ซ"/><note pitch="ล"/>`),
  );
  const spans = parse(doc).music.P1.s1.linkSpans;

  assert.deepEqual(spans[0].first, at(0, 0, 0, 0), "the first slot of the first group");
  assert.deepEqual(spans[0].last, at(0, 0, 1, 1), "and the last slot of the second, a beat later");
});

test("a link is matched independently of a bow, so the two may overlap", () => {
  // Two spans of the same kind cannot nest or overlap; two of different kinds
  // are separate runs, and a gesture that is also bowed is an ordinary thing.
  const doc = score(line(1, `<bow type="start"/><note pitch="ด"/><link type="start"/><note pitch="ร"/><bow type="stop"/><note pitch="ม"/><link type="stop"/>`));
  const { bowSpans, linkSpans } = parse(doc).music.P1.s1;

  assert.deepEqual(bowSpans[0].first, at(0, 0, 0, 0));
  assert.deepEqual(bowSpans[0].last, at(0, 0, 1, 0));
  assert.deepEqual(linkSpans[0].first, at(0, 0, 1, 0));
  assert.deepEqual(linkSpans[0].last, at(0, 0, 2, 0));
});

test("an ending resolves its own link spans, as its own run", () => {
  const doc = score(
    `${line(1, `<note pitch="ด"/>`)}
     <ending pass="2">${line(1, `<link type="start"/><note pitch="ร"/><note pitch="ม"/><link type="stop"/>`)}</ending>`,
  );
  const ending = parse(doc).music.P1.s1.endings[0];

  assert.equal(ending.linkSpans.length, 1);
  assert.deepEqual(ending.linkSpans[0].first, at(0, 0, 0, 0));
  assert.deepEqual(ending.linkSpans[0].last, at(0, 0, 1, 0));
});
