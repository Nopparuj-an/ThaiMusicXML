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

test("a simple score produces well-formed MusicXML with matching pitch and duration", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const xml = parseXml(toMusicXml(doc));
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
  const xml = parseXml(toMusicXml(doc));
  const rests = Array.from(xml.getElementsByTagName("note")).filter((n) => n.getElementsByTagName("rest").length);
  const tupletRest = rests.find((n) => n.getElementsByTagName("time-modification").length);
  assert.ok(tupletRest, "the group's own rest member should carry a <time-modification>");

  // The measure is 2 slots (one quarter note) long; every duration in it,
  // rests included, must sum to exactly one quarter note's worth of ticks.
  const divisions = Number(xml.getElementsByTagName("divisions")[0].textContent);
  const durations = Array.from(xml.getElementsByTagName("duration")).map((d) => Number(d.textContent));
  assert.equal(durations.reduce((a, b) => a + b, 0), divisions);
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
  const xml = parseXml(toMusicXml(doc));
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
  const xml = parseXml(toMusicXml(doc));
  assert.equal(xml.getElementsByTagName("part").length, 1);
  assert.equal(xml.getElementsByTagName("staves")[0].textContent, "2");
  assert.equal(xml.getElementsByTagName("backup").length, 1);
  const staffTags = Array.from(xml.getElementsByTagName("staff")).map((s) => s.textContent);
  // row 2's four rests stay four separate real silences: nothing ever sounds
  // to absorb them, so none merge, matching "a rest before any note is a
  // real silence" (resolve.test.mjs).
  assert.deepEqual(staffTags, ["1", "1", "1", "1", "2", "2", "2", "2"]);
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
  const xml = parseXml(toMusicXml(doc, { splitStacks: true }));
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
  const xml = parseXml(toMusicXml(doc));
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
  const xml = parseXml(toMusicXml(doc, { warn: (w) => warnings.push(w) }));
  assert.equal(xml.getElementsByTagName("part").length, 1); // the lyric part contributes no part of its own
  const notes = xml.getElementsByTagName("note");
  const texts = Array.from(notes).map((n) => n.getElementsByTagName("text")[0]?.textContent ?? null);
  // 4 items in a 4-beat measure: aligned, so beat 2 (ร) and beat 4 (ซ) carry the syllables.
  assert.deepEqual(texts, [null, "เพลง", null, "ไทย"]);
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
  const xml = parseXml(toMusicXml(doc, { lyrics: false }));
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
  const xml = parseXml(toMusicXml(doc, { warn: (w) => warnings.push(w) }));
  const texts = Array.from(xml.getElementsByTagName("text")).map((t) => t.textContent);
  assert.deepEqual(texts, ["หนึ่ง"]); // only V1, paired to the first output group (P1)
  assert.ok(warnings.some((w) => w.includes("V2") && w.includes("--lyrics-map")));

  const mapped = parseXml(toMusicXml(doc, { lyricsMap: { V2: "P2" } }));
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
  const xml = parseXml(toMusicXml(doc));
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
  const xml = parseXml(toMusicXml(doc));
  const notes = xml.getElementsByTagName("note");
  const texts = Array.from(notes).map((n) => n.getElementsByTagName("text")[0]?.textContent ?? null);
  // ด rings through measure 1 only (extension stops at its own measure's
  // end); measure 2 opens with two individually-real-silence rests (each its
  // own kept event) before its own first note. "หนึ่ง" (measure 2's first
  // beat) has nothing sounding there and falls back to the nearest note
  // before it (ด, still the very first <note> in the output). "สอง" lands
  // exactly on ร, an ordinary sounding-note match.
  assert.deepEqual(texts, ["หนึ่ง", null, null, "สอง"]);
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
  const xml = parseXml(toMusicXml(doc));
  const notes = xml.getElementsByTagName("note");
  const texts = Array.from(notes).map((n) => n.getElementsByTagName("text")[0]?.textContent ?? null);
  // Measure 1 is 4 individually-real-silence rests (nothing ever sounds
  // there); ร (measure 2's only note - its own trailing rests get absorbed)
  // is the sole candidate, so "ก่อน" falls back to it as the nearest note
  // after, there being none before.
  assert.deepEqual(texts, [null, null, null, null, "ก่อน"]);
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
  const xml = parseXml(toMusicXml(doc, { warn: (w) => warnings.push(w) }));
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
  const xml = parseXml(toMusicXml(doc, { warn: (w) => warnings.push(w) }));
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
  const xml = parseXml(toMusicXml(doc, { warn: (w) => warnings.push(w) }));
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
