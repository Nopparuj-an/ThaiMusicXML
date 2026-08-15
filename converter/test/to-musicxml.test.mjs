// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DOMParser } from "#dom-parser";
import { resolve } from "../src/resolve.mjs";
import { toMusicXml } from "../src/to-musicxml.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const realFiles = [
  ...readdirSync(path.join(here, "../../renderer/examples"))
    .filter((f) => f.endsWith(".txml"))
    .map((f) => path.join(here, "../../renderer/examples", f)),
  ...readdirSync(path.join(here, "../../public/corpus/valid"))
    .filter((f) => f.endsWith(".txml"))
    .map((f) => path.join(here, "../../public/corpus/valid", f)),
];

const score = (partData, { ensemble = `<part id="P1"><instrument-name>Test</instrument-name></part>`, structure = `<section id="s1"/>` } = {}) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/0.1" version="0.1">
  <header><title>Test</title></header>
  <structure>${structure}</structure>
  <ensemble>${ensemble}</ensemble>
  ${partData}
</thai-score>`;

const parseXml = (xml) => {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  assert.equal(doc.getElementsByTagName("parsererror").length, 0, "output must be well-formed XML");
  return doc;
};

/**
 * Most tests below state their expectations in the source document's own
 * measure positions, so they turn the downbeat shift off. It moves every note
 * a slot later (see "the downbeat shift..." tests further down), which is
 * right for a printed score and pure noise for a test about pitch, ties, or
 * lyric attachment.
 */
const unshifted = (options = {}) => ({ downbeatShift: false, ...options });

test("a simple score produces well-formed MusicXML with matching pitch and duration", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  const notes = xml.getElementsByTagName("note");
  assert.equal(notes.length, 4);
  const steps = Array.from(notes).map((n) => n.getElementsByTagName("step")[0].textContent);
  assert.deepEqual(steps, ["C", "D", "E", "G"]);
  const durations = Array.from(notes).map((n) => n.getElementsByTagName("duration")[0].textContent);
  const divisions = xml.getElementsByTagName("divisions")[0].textContent;
  assert.ok(durations.every((d) => d === String(Number(divisions) / 2)), "each is one eighth note");
});

test("a rest-extended note ties across the tuplet/plain boundary it needs to", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1">
          <note pitch="ด"/><group><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></group>
        </measure></line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc));
  // ด, ร, and ม each keep a 1/3-slot share (ด is cut short by the group's own
  // pickup member attacking early) and need the tuplet marking; ซ, the
  // group's last member, rings for a full extra beat and needs none.
  assert.equal(xml.getElementsByTagName("time-modification").length, 3);
  const tuplet = xml.getElementsByTagName("time-modification")[0];
  assert.equal(tuplet.getElementsByTagName("actual-notes")[0].textContent, "3");
  assert.equal(tuplet.getElementsByTagName("normal-notes")[0].textContent, "2");
});

test("a kept rest inside a group's tuplet bracket still carries a <time-modification>", () => {
  // Regression: a rest was written with a tuplet-scaled <duration> but no
  // <time-modification>, leaving <type> and <duration> visibly inconsistent -
  // some readers "correct" the rest back to its plain duration, throwing the
  // whole measure's total off by the tuplet's own scaling (reported by
  // MuseScore as e.g. "Found: 25/48, Expected: 2/4").
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><rest/><group><rest/><note pitch="ม"/><note pitch="ซ"/></group></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  const rests = Array.from(xml.getElementsByTagName("note")).filter((n) => n.getElementsByTagName("rest").length);
  const tupletRest = rests.find((n) => n.getElementsByTagName("time-modification").length);
  assert.ok(tupletRest, "the group's own rest member should carry a <time-modification>");

  // The measure is 2 slots (one quarter note) long; every duration in it,
  // rests included, must sum to exactly one quarter note's worth of ticks.
  const divisions = Number(xml.getElementsByTagName("divisions")[0].textContent);
  const durations = Array.from(xml.getElementsByTagName("duration")).map((d) => Number(d.textContent));
  assert.equal(durations.reduce((a, b) => a + b, 0), divisions);
});

test("a run of real silence prints as one rest, broken only where the beat is", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><rest/><rest/><rest/><note pitch="ด"/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  const notes = Array.from(xml.getElementsByTagName("note"));
  const divisions = Number(xml.getElementsByTagName("divisions")[0].textContent);
  const described = notes.map((n) => [
    n.getElementsByTagName("rest").length ? "rest" : "note",
    n.getElementsByTagName("type")[0].textContent,
    Number(n.getElementsByTagName("duration")[0].textContent),
  ]);
  // Three slots of silence are one rest, not three: but written as a quarter
  // rest on beat 1 and an eighth rest opening beat 2, since a single dotted
  // quarter rest across both would hide where the beat falls.
  assert.deepEqual(described, [
    ["rest", "quarter", divisions],
    ["rest", "eighth", divisions / 2],
    ["note", "eighth", divisions / 2],
  ]);
});

test("a measure nothing sounds in prints as a single whole-measure rest", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1">
          <measure number="1"><note pitch="ด"/><rest/><rest/><rest/></measure>
          <measure number="2"><rest/><rest/><rest/><rest/></measure>
        </line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  const second = xml.getElementsByTagName("measure")[1];
  const notes = second.getElementsByTagName("note");
  assert.equal(notes.length, 1);
  assert.equal(notes[0].getElementsByTagName("rest")[0].getAttribute("measure"), "yes");
  assert.equal(notes[0].getElementsByTagName("type").length, 0, "a whole-measure rest has no written value");
  const divisions = Number(xml.getElementsByTagName("divisions")[0].textContent);
  assert.equal(Number(notes[0].getElementsByTagName("duration")[0].textContent), divisions * 2);
});

test("the downbeat shift moves every note a slot later, so a Thai last beat lands on a Western first", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1">
          <measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure>
          <measure number="2"><note pitch="ล"/><note pitch="ท"/><note pitch="ด" octave="1"/><note pitch="ร" octave="1"/></measure>
        </line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc));
  const measures = Array.from(xml.getElementsByTagName("measure"));
  const stepsOf = (measure) =>
    Array.from(measure.getElementsByTagName("note")).map((n) =>
      n.getElementsByTagName("rest").length ? "rest" : n.getElementsByTagName("step")[0].textContent,
    );
  // Measure 1's own last beat (ซ) opens measure 2, which is what the setting
  // is for; the eighth the music moved off leaves a rest at the very front.
  assert.deepEqual(stepsOf(measures[0]), ["rest", "C", "D", "E"]);
  assert.deepEqual(stepsOf(measures[1]), ["G", "A", "B", "C"]);
  // The last beat needs one more measure to land in; the rest of that
  // measure is silence, written to the beat (an eighth, then a quarter).
  assert.equal(measures.length, 3);
  assert.deepEqual(stepsOf(measures[2]), ["D", "rest", "rest"]);
});

test("the shift adds no trailing measure when nothing would land past the last barline", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><rest/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc));
  // ม absorbs the trailing rest and so already ends at the barline; shifted,
  // it rings one slot past it, but nothing is struck there, so the piece ends
  // at the barline with ม clipped rather than buying a measure for a decay.
  assert.equal(xml.getElementsByTagName("measure").length, 1);
  assert.equal(xml.getElementsByTagName("tie").length, 0);
});

test("a note the shift pushes across a barline is split and tied, not moved whole", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1">
          <measure number="1"><note pitch="ด"/><note pitch="ร"/><rest/><rest/></measure>
          <measure number="2"><note pitch="ม"/><rest/><rest/><rest/></measure>
        </line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc));
  const measures = Array.from(xml.getElementsByTagName("measure"));
  const last = (measure) => Array.from(measure.getElementsByTagName("note")).at(-1);
  const first = (measure) => measure.getElementsByTagName("note")[0];
  // ร absorbs two rests and reaches its own barline; shifted, its last slot
  // falls in the next measure.
  assert.equal(last(measures[0]).getElementsByTagName("tie")[0].getAttribute("type"), "start");
  assert.equal(first(measures[1]).getElementsByTagName("tie")[0].getAttribute("type"), "stop");
  assert.equal(first(measures[1]).getElementsByTagName("step")[0].textContent, "D");
});

test("--trim-leading-empty-measures drops the silent measures in front, and is off by default", () => {
  const source = score(
    `<part-data part="P1"><section-ref section="s1">
        <line number="1">
          <measure number="1"><rest/><rest/><rest/><rest/></measure>
          <measure number="2"><rest/><rest/><rest/><rest/></measure>
          <measure number="3"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure>
        </line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1">
          <measure number="1"><rest/><rest/><rest/><rest/></measure>
          <measure number="2"><rest/><rest/><rest/><note pitch="ล"/></measure>
          <measure number="3"><note pitch="ท"/><note pitch="ล"/><note pitch="ซ"/><note pitch="ม"/></measure>
        </line>
      </section-ref></part-data>`,
    {
      ensemble: `<part id="P1"><instrument-name>A</instrument-name></part><part id="P2"><instrument-name>B</instrument-name></part>`,
    },
  );
  const doc = resolve(source);
  assert.equal(parseXml(toMusicXml(doc, unshifted())).getElementsByTagName("measure").length / 2, 3);

  const trimmed = parseXml(toMusicXml(doc, unshifted({ trimLeadingEmptyMeasures: true })));
  const parts = Array.from(trimmed.getElementsByTagName("part"));
  // Only measure 1 goes: P2 plays in measure 2, and the trim is measured
  // across the whole ensemble so the parts stay aligned with each other.
  assert.deepEqual(
    parts.map((p) => p.getElementsByTagName("measure").length),
    [2, 2],
  );
  assert.equal(parts[0].getElementsByTagName("rest")[0].getAttribute("measure"), "yes");
});

test("a part that leaves out a whole section stays aligned with a part that plays it", () => {
  // P2 has no <section-ref> for s1 - a documented-valid way to sit a section
  // out entirely (section-ref.md). Before this was fixed, P2's own measure
  // grid simply never grew for s1, so its s2 content printed starting at
  // measure 1 - overlapping P1's own s1, not P1's s2 - rather than a rest
  // measure for s1 followed by s2 in the right place.
  const doc = resolve(
    score(
      `<part-data part="P1">
        <section-ref section="s1"><line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line></section-ref>
        <section-ref section="s2"><line number="1"><measure number="1"><note pitch="ล"/><note pitch="ท"/><note pitch="ด" octave="1"/><note pitch="ร" octave="1"/></measure></line></section-ref>
      </part-data>
      <part-data part="P2">
        <section-ref section="s2"><line number="1"><measure number="1"><note pitch="ท"/><note pitch="ล"/><note pitch="ซ"/><note pitch="ม"/></measure></line></section-ref>
      </part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>A</instrument-name></part><part id="P2"><instrument-name>B</instrument-name></part>`,
        structure: `<section id="s1"/><section id="s2"/>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  const parts = Array.from(xml.getElementsByTagName("part"));
  assert.deepEqual(
    parts.map((p) => p.getElementsByTagName("measure").length),
    [2, 2],
  );
  const p2Measures = Array.from(parts[1].getElementsByTagName("measure"));
  assert.equal(p2Measures[0].getElementsByTagName("rest")[0]?.getAttribute("measure"), "yes");
  const p2M2Notes = Array.from(p2Measures[1].getElementsByTagName("note"));
  assert.deepEqual(
    p2M2Notes.map((n) => n.getElementsByTagName("step")[0].textContent),
    ["B", "A", "G", "E"], // ท ล ซ ม, P2's own s2 content - not P1's s1
  );
});

test("a part that stops playing before the piece's actual end still ties its last decay under the downbeat shift", () => {
  // P2 has no <section-ref> for s2 - it stops after s1, the piece's actual
  // end. Before this was fixed, P2's own boundaries ended right there, so
  // recut() (which only skips a barline-crossing tie in a group's *own*
  // last measure, to avoid buying a whole extra measure for a decay nobody
  // strikes) mistook that early stop for the piece's true end and silently
  // clipped P2's last decaying note there instead of tying it across the
  // barline the shift pushed it into - a sharper case than the plain
  // measure-count mismatch above, since it drops sound (a whole tied
  // continuation), not just misplaces measures.
  const doc = resolve(
    score(
      `<part-data part="P1">
        <section-ref section="s1"><line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><rest/></measure></line></section-ref>
        <section-ref section="s2"><line number="1">
          <measure number="1"><note pitch="ล"/><note pitch="ท"/><note pitch="ด" octave="1"/><rest/></measure>
          <measure number="2"><note pitch="ร" octave="1"/><rest/><rest/><rest/></measure>
        </line></section-ref>
      </part-data>
      <part-data part="P2">
        <section-ref section="s1"><line number="1"><measure number="1"><note pitch="ท"/><rest/><rest/><rest/></measure></line></section-ref>
      </part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>A</instrument-name></part><part id="P2"><instrument-name>B</instrument-name></part>`,
        structure: `<section id="s1"/><section id="s2"/>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc)); // shift on: the default
  const parts = Array.from(xml.getElementsByTagName("part"));
  assert.deepEqual(
    parts.map((p) => p.getElementsByTagName("measure").length),
    [3, 3],
  );
  const p2Measures = Array.from(parts[1].getElementsByTagName("measure"));
  const p2Notes = Array.from(p2Measures[0].getElementsByTagName("note"));
  // ท absorbs its trailing rests and, shifted, crosses into measure 2 - tied,
  // not clipped.
  assert.equal(p2Notes.at(-1).getElementsByTagName("tie")[0]?.getAttribute("type"), "start");
  const m2First = p2Measures[1].getElementsByTagName("note")[0];
  assert.equal(m2First.getElementsByTagName("tie")[0]?.getAttribute("type"), "stop");
});

test("a repeated section is unrolled into its own plain measures", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line>
      </section-ref></part-data>`,
      { structure: `<repeat times="3"><section id="s1"/></repeat>` },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  assert.equal(xml.getElementsByTagName("measure").length, 3);
  assert.equal(xml.getElementsByTagName("note").length, 12);
});

test("stacked rows merge into one part with one staff per row", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><rest/><rest/><rest/><rest/></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1" stack="s" row="1"><instrument-name>Top</instrument-name></part><part id="P2" stack="s" row="2"><instrument-name>Bottom</instrument-name></part>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  assert.equal(xml.getElementsByTagName("part").length, 1);
  assert.equal(xml.getElementsByTagName("staves")[0].textContent, "2");
  assert.equal(xml.getElementsByTagName("backup").length, 1);
  const staffTags = Array.from(xml.getElementsByTagName("staff")).map((s) => s.textContent);
  // Row 2's four rests are four separate real silences in the resolved
  // timeline - nothing ever sounds to absorb them, matching "a rest before
  // any note is a real silence" (resolve.test.mjs) - but they print as the
  // one whole-measure rest a reader expects to see there.
  assert.deepEqual(staffTags, ["1", "1", "1", "1", "2"]);
  const staffTwoRest = Array.from(xml.getElementsByTagName("rest")).at(-1);
  assert.equal(staffTwoRest.getAttribute("measure"), "yes");
});

test("--split-stacks gives each row its own part instead", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><rest/><rest/><rest/><rest/></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1" stack="s" row="1"><instrument-name>Top</instrument-name></part><part id="P2" stack="s" row="2"><instrument-name>Bottom</instrument-name></part>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted({ splitStacks: true })));
  assert.equal(xml.getElementsByTagName("part").length, 2);
  assert.equal(xml.getElementsByTagName("staves").length, 0);
});

test("a <group> in a stack's second row alone still sizes the piece's divisions", () => {
  // Regression: <divisions> was once computed by scanning only each stack's
  // first row, so a tuplet appearing only in a later row crashed the writer.
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><group><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></group></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1" stack="s" row="1"><instrument-name>Top</instrument-name></part><part id="P2" stack="s" row="2"><instrument-name>Bottom</instrument-name></part>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  assert.equal(xml.getElementsByTagName("time-modification").length, 3);
});

test("a lyric part pairs to the first notated part by default and prints one syllable per matching beat", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><rest/><syllable>เพลง</syllable><rest/><syllable>ไทย</syllable></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>Melody</instrument-name></part><part id="P2" type="lyric"><instrument-name>Lyrics</instrument-name></part>`,
      },
    ),
  );
  const warnings = [];
  const xml = parseXml(toMusicXml(doc, unshifted({ warn: (w) => warnings.push(w) })));
  assert.equal(xml.getElementsByTagName("part").length, 1); // the lyric part contributes no part of its own
  const notes = xml.getElementsByTagName("note");
  const texts = Array.from(notes).map((n) => n.getElementsByTagName("text")[0]?.textContent ?? null);
  // 4 items in a 4-beat measure: aligned, so beat 2 (ร) and beat 4 (ซ) carry the syllables.
  assert.deepEqual(texts, [null, "เพลง", null, "ไทย"]);
});

test("a lyric part stays aligned to its target across a section the target leaves out", () => {
  // P1 (the lyric target) has no <section-ref> for s1 - silent for the whole
  // section, same as the plain-part case above. Before this was fixed,
  // unrollLyrics's own cursor (independent of unroll()'s) also didn't
  // advance for a section the target lacks, which happened to still agree
  // with the target's own (then-also-buggy) unroll() output - but once
  // unroll() was fixed to advance correctly, the two would have gone out of
  // sync with each other unless unrollLyrics got the identical fix.
  const doc = resolve(
    score(
      `<part-data part="P1">
        <section-ref section="s2"><line number="1"><measure number="1"><note pitch="ล"/><note pitch="ท"/><note pitch="ด" octave="1"/><note pitch="ร" octave="1"/></measure></line></section-ref>
      </part-data>
      <part-data part="P2">
        <section-ref section="s1"><line number="1"><measure number="1"><syllable>ไม่ควรได้ยิน</syllable></measure></line></section-ref>
        <section-ref section="s2"><line number="1"><measure number="1"><syllable>ลา</syllable><rest/><rest/><rest/></measure></line></section-ref>
      </part-data>
      <part-data part="P3">
        <section-ref section="s1"><line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line></section-ref>
      </part-data>`,
      {
        // P3 gives s1 a notated reference to borrow its measure grid from,
        // the same role another instrument plays in a real ensemble - the
        // lyric part P2's own <section-ref> for s1 doesn't count, since a
        // lyric measure holds words rather than beats and has no comparable
        // shape (see resolve.mjs's referenceSectionResolution).
        ensemble: `<part id="P1"><instrument-name>Melody</instrument-name></part><part id="P2" type="lyric"><instrument-name>Lyrics</instrument-name></part><part id="P3"><instrument-name>Other</instrument-name></part>`,
        structure: `<section id="s1"/><section id="s2"/>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  assert.equal(xml.getElementsByTagName("part").length, 2); // P1 and P3; the lyric part contributes no part of its own
  const measures = Array.from(xml.getElementsByTagName("part")[0].getElementsByTagName("measure"));
  assert.equal(measures.length, 2);
  // Measure 1 is a whole-measure rest for the section P1 sits out, and
  // carries no lyric - "ไม่ควรได้ยิน" ("shouldn't be heard") has nothing in
  // P1's own timeline to attach to there.
  assert.equal(measures[0].getElementsByTagName("text").length, 0);
  // "ลา" lands on measure 2's first note (ล), P1's actual s2 content - not
  // shifted a section early onto measure 1.
  const m2Texts = Array.from(measures[1].getElementsByTagName("note")).map(
    (n) => n.getElementsByTagName("text")[0]?.textContent ?? null,
  );
  assert.deepEqual(m2Texts, ["ลา", null, null, null]);
});

test("--no-lyrics disables lyric export entirely", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><syllable>เพลง</syllable></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>Melody</instrument-name></part><part id="P2" type="lyric"><instrument-name>Lyrics</instrument-name></part>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted({ lyrics: false })));
  assert.equal(xml.getElementsByTagName("lyric").length, 0);
});

test("a second lyric part is dropped with a warning unless --lyrics-map names it", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ร"/></measure></line>
      </section-ref></part-data>
      <part-data part="V1"><section-ref section="s1">
        <line number="1"><measure number="1"><syllable>หนึ่ง</syllable></measure></line>
      </section-ref></part-data>
      <part-data part="V2"><section-ref section="s1">
        <line number="1"><measure number="1"><syllable>สอง</syllable></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>A</instrument-name></part><part id="P2"><instrument-name>B</instrument-name></part><part id="V1" type="lyric"><instrument-name>Lyrics 1</instrument-name></part><part id="V2" type="lyric"><instrument-name>Lyrics 2</instrument-name></part>`,
      },
    ),
  );

  const warnings = [];
  const xml = parseXml(toMusicXml(doc, unshifted({ warn: (w) => warnings.push(w) })));
  const texts = Array.from(xml.getElementsByTagName("text")).map((t) => t.textContent);
  assert.deepEqual(texts, ["หนึ่ง"]); // only V1, paired to the first output group (P1)
  assert.ok(warnings.some((w) => w.includes("V2") && w.includes("--lyrics-map")));

  const mapped = parseXml(toMusicXml(doc, unshifted({ lyricsMap: { V2: "P2" } })));
  const mappedTexts = Array.from(mapped.getElementsByTagName("text")).map((t) => t.textContent);
  assert.deepEqual(mappedTexts, ["สอง"]); // explicit map replaces the default pairing entirely
});

test("a lyric measure whose item count doesn't match the beat count spreads evenly across the measure", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ล"/><note pitch="ซ"/><note pitch="ม"/><note pitch="ร"/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><syllable>ดวง</syllable><rest/><syllable>เดือน</syllable></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>Melody</instrument-name></part><part id="P2" type="lyric"><instrument-name>Lyrics</instrument-name></part>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  const notes = xml.getElementsByTagName("note");
  const texts = Array.from(notes).map((n) => n.getElementsByTagName("text")[0]?.textContent ?? null);
  // 3 items over 4 beats: item i lands at onset 4*i/3 - "ดวง" at 0 (ล), "เดือน"
  // at 8/3, inside ม's [2,3) window.
  assert.deepEqual(texts, ["ดวง", null, "เดือน", null]);
});

test("a syllable landing on real silence attaches to the nearest note before it", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1">
          <measure number="1"><note pitch="ด"/><rest/><rest/><rest/></measure>
          <measure number="2"><rest/><rest/><note pitch="ร"/><rest/></measure>
        </line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1">
          <measure number="1"><rest/><rest/><rest/><rest/></measure>
          <measure number="2"><syllable>หนึ่ง</syllable><rest/><syllable>สอง</syllable><rest/></measure>
        </line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>Melody</instrument-name></part><part id="P2" type="lyric"><instrument-name>Lyrics</instrument-name></part>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  const notes = xml.getElementsByTagName("note");
  const texts = Array.from(notes).map((n) => n.getElementsByTagName("text")[0]?.textContent ?? null);
  // ด rings through measure 1 only (extension stops at its own measure's
  // end); measure 2 opens with two individually-real-silence rests (each its
  // own kept event, printed as the one quarter rest they add up to) before
  // its own first note. "หนึ่ง" (measure 2's first beat) has nothing sounding
  // there and falls back to the nearest note before it (ด, still the very
  // first <note> in the output). "สอง" lands exactly on ร, an ordinary
  // sounding-note match.
  assert.deepEqual(texts, ["หนึ่ง", null, "สอง"]);
});

test("a syllable before the target's first note attaches to the nearest note after it", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1">
          <measure number="1"><rest/><rest/><rest/><rest/></measure>
          <measure number="2"><note pitch="ร"/><rest/><rest/><rest/></measure>
        </line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1">
          <measure number="1"><syllable>ก่อน</syllable><rest/><rest/><rest/></measure>
          <measure number="2"><rest/><rest/><rest/><rest/></measure>
        </line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>Melody</instrument-name></part><part id="P2" type="lyric"><instrument-name>Lyrics</instrument-name></part>`,
      },
    ),
  );
  const xml = parseXml(toMusicXml(doc, unshifted()));
  const notes = xml.getElementsByTagName("note");
  const texts = Array.from(notes).map((n) => n.getElementsByTagName("text")[0]?.textContent ?? null);
  // Measure 1 is 4 individually-real-silence rests (nothing ever sounds
  // there), printed as one whole-measure rest; ร (measure 2's only note -
  // its own trailing rests get absorbed) is the sole candidate, so "ก่อน"
  // falls back to it as the nearest note after, there being none before.
  assert.deepEqual(texts, [null, "ก่อน"]);
});

test("a syllable is dropped with a warning when the target part has no note at all", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><rest/><rest/><rest/><rest/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><syllable>เพลง</syllable><rest/><rest/><rest/></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1"><instrument-name>Melody</instrument-name></part><part id="P2" type="lyric"><instrument-name>Lyrics</instrument-name></part>`,
      },
    ),
  );
  const warnings = [];
  const xml = parseXml(toMusicXml(doc, unshifted({ warn: (w) => warnings.push(w) })));
  assert.equal(xml.getElementsByTagName("lyric").length, 0);
  assert.ok(warnings.some((w) => w.includes("เพลง") && w.includes("no note at all")));
});

test("a note with sound in a part not declared unpitched converts as a rest in MusicXML too", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note sound="x"/><note pitch="ร"/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const warnings = [];
  const xml = parseXml(toMusicXml(doc, unshifted({ warn: (w) => warnings.push(w) })));
  const notes = xml.getElementsByTagName("note");
  assert.equal(notes.length, 2);
  assert.equal(notes[0].getElementsByTagName("rest").length, 1);
  assert.equal(notes[1].getElementsByTagName("step")[0].textContent, "D");
  assert.ok(warnings.some((w) => w.includes("carries sound") && w.includes("treating it as a rest")));
});

test("an unrecognized or missing tuning falls back to c-major with a warning", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const warnings = [];
  const xml = parseXml(toMusicXml(doc, unshifted({ warn: (w) => warnings.push(w) })));
  assert.equal(xml.getElementsByTagName("step")[0].textContent, "C");
  assert.ok(warnings.some((w) => w.includes("no <tuning>")));
});

/**
 * Every note/rest marked with <time-modification> - including a tied
 * continuation note - must sit inside a properly matched <tuplet
 * type="start">...<tuplet type="stop"> bracket. Regression: a tied
 * continuation note carried <time-modification> but no bracket, so a reader
 * (MuseScore) couldn't tell it was still inside the tuplet and reverted it
 * to its unscaled face value, throwing the whole measure's total off by
 * exactly the tuplet's own scaling (reported as an "incomplete measure").
 * Checked against every real example and corpus file, not a synthetic one,
 * since that's what actually surfaced the bug.
 */
function assertTupletBracketsAreMatched(xml, label) {
  const partRe = /<part id="[^"]*">([\s\S]*?)<\/part>/g;
  let pm;
  while ((pm = partRe.exec(xml))) {
    const measureRe = /<measure number="(\d+)">([\s\S]*?)<\/measure>/g;
    let mm;
    while ((mm = measureRe.exec(pm[1]))) {
      const [, measureNumber, content] = mm;
      const staves = content.split(/<backup>.*?<\/backup>/);
      staves.forEach((staffXml, staffIndex) => {
        const where = `${label} measure ${measureNumber} staff ${staffIndex + 1}`;
        let open = false;
        const noteRe = /<note>([\s\S]*?)<\/note>/g;
        let nm;
        while ((nm = noteRe.exec(staffXml))) {
          const hasTimeMod = /<time-modification>/.test(nm[1]);
          const starts = /<tuplet type="start"\/>/.test(nm[1]);
          const stops = /<tuplet type="stop"\/>/.test(nm[1]);
          if (starts) {
            assert.ok(!open, `${where}: <tuplet type="start"/> while one was already open`);
            open = true;
          }
          assert.ok(!hasTimeMod || open, `${where}: <time-modification> outside any <tuplet> bracket`);
          if (stops) {
            assert.ok(open, `${where}: <tuplet type="stop"/> with none open`);
            open = false;
          }
        }
        assert.ok(!open, `${where}: tuplet bracket left open at measure end`);
      });
    }
  }
}

test("every tuplet bracket across every real example and corpus file is properly matched", () => {
  for (const file of realFiles) {
    const doc = resolve(readFileSync(file, "utf8"));
    const xml = toMusicXml(doc, { warn: () => {} });
    assertTupletBracketsAreMatched(xml, path.basename(file));
  }
});

/**
 * Every staff of every measure must be filled edge to edge, and every tie
 * must have both ends. Regression: before rests were merged and gaps filled,
 * a staff that simply ran out of written notes part-way through a measure -
 * a stacked row shorter than its sibling, a note whose decay a sibling's
 * attack cut short - left that measure short of its own length, which a
 * reader shows as an incomplete measure. `<duration>` totals per staff are
 * the direct check: they must agree with each other and with the `<backup>`
 * the writer uses to rewind between them.
 */
function assertMeasuresAreFilled(xml, label) {
  const backupRe = /<backup><duration>(\d+)<\/duration><\/backup>/;
  const partRe = /<part id="([^"]*)">([\s\S]*?)<\/part>/g;
  let pm;
  while ((pm = partRe.exec(xml))) {
    const measureRe = /<measure number="(\d+)">([\s\S]*?)<\/measure>/g;
    const open = {};
    let mm;
    while ((mm = measureRe.exec(pm[2]))) {
      const where = `${label} part ${pm[1]} measure ${mm[1]}`;
      const pieces = mm[2].split(new RegExp(backupRe.source, "g"));
      const staves = pieces.filter((_, i) => i % 2 === 0);
      const backups = pieces.filter((_, i) => i % 2 === 1).map(Number);
      const totals = staves.map((staff) =>
        [...staff.matchAll(/<duration>(\d+)<\/duration>/g)].reduce((sum, d) => sum + Number(d[1]), 0),
      );
      assert.equal(new Set(totals).size, 1, `${where}: staves disagree on how full the measure is (${totals})`);
      backups.forEach((backup, i) =>
        assert.equal(backup, totals[i], `${where}: <backup> rewinds ${backup}, but staff ${i + 1} wrote ${totals[i]}`),
      );
      staves.forEach((staff, staffIndex) => {
        for (const note of staff.matchAll(/<note>([\s\S]*?)<\/note>/g)) {
          const ties = [...note[1].matchAll(/<tie type="(start|stop)"\/>/g)].map((t) => t[1]);
          const tied = [...note[1].matchAll(/<tied type="(start|stop)"\/>/g)].map((t) => t[1]);
          assert.deepEqual(tied, ties, `${where}: <tie> and <tied> disagree`);
          assert.ok(!(ties.length && /<rest/.test(note[1])), `${where}: a rest carries a tie`);
          for (const tie of ties) {
            if (tie === "start") {
              assert.ok(!open[staffIndex], `${where}: a tie starts while one is already open`);
              open[staffIndex] = true;
            } else {
              assert.ok(open[staffIndex], `${where}: a tie stops with none open`);
              open[staffIndex] = false;
            }
          }
        }
      });
    }
    for (const [staffIndex, stillOpen] of Object.entries(open))
      assert.ok(!stillOpen, `${label} part ${pm[1]} staff ${Number(staffIndex) + 1}: a tie is left hanging`);
  }
}

test("every measure of every real example and corpus file is filled, with every tie closed", () => {
  for (const file of realFiles) {
    const doc = resolve(readFileSync(file, "utf8"));
    for (const options of [{}, { downbeatShift: false }, { trimLeadingEmptyMeasures: true }, { splitStacks: true }])
      assertMeasuresAreFilled(toMusicXml(doc, { warn: () => {}, ...options }), path.basename(file));
  }
});
