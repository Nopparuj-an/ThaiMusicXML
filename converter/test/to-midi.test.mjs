// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "../src/resolve.mjs";
import { toMidi } from "../src/to-midi.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const realFiles = [
  ...readdirSync(path.join(here, "../../renderer/examples"))
    .filter((f) => f.endsWith(".txml"))
    .map((f) => path.join(here, "../../renderer/examples", f)),
  ...readdirSync(path.join(here, "../../public/corpus/valid"))
    .filter((f) => f.endsWith(".txml"))
    .map((f) => path.join(here, "../../public/corpus/valid", f)),
];

const score = (
  partData,
  { ensemble = `<part id="P1"><instrument-name>Test</instrument-name></part>`, structure = `<section id="s1"/>` } = {},
) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/0.1" version="0.1">
  <header><title>Test</title></header>
  <structure>${structure}</structure>
  <ensemble>${ensemble}</ensemble>
  ${partData}
</thai-score>`;

/** Minimal SMF reader: structural validity plus a flat list of {tick, channel, type, data} events per track, for assertions. */
function readMidi(buf) {
  let p = 0;
  const u32 = () => {
    const v = buf.readUInt32BE(p);
    p += 4;
    return v;
  };
  const u16 = () => {
    const v = buf.readUInt16BE(p);
    p += 2;
    return v;
  };
  const str = (n) => {
    const v = buf.toString("ascii", p, p + n);
    p += n;
    return v;
  };
  const vlq = () => {
    let value = 0,
      b;
    do {
      b = buf[p++];
      value = (value << 7) | (b & 0x7f);
    } while (b & 0x80);
    return value;
  };

  assert.equal(str(4), "MThd");
  u32();
  const format = u16();
  const numTracks = u16();
  const division = u16();

  const tracks = [];
  for (let t = 0; t < numTracks; t++) {
    assert.equal(str(4), "MTrk", `track ${t} magic`);
    const len = u32();
    const end = p + len;
    let tick = 0;
    const events = [];
    while (p < end) {
      tick += vlq();
      const status = buf[p];
      if (status === 0xff) {
        p++;
        const type = buf[p++];
        const dataLen = vlq();
        const data = buf.slice(p, p + dataLen);
        p += dataLen;
        events.push({ tick, meta: type, data });
      } else {
        const hi = status & 0xf0;
        const channel = status & 0x0f;
        p++;
        if (hi === 0x90) {
          events.push({ tick, on: true, channel, note: buf[p], velocity: buf[p + 1] });
          p += 2;
        } else if (hi === 0x80) {
          events.push({ tick, off: true, channel, note: buf[p], velocity: buf[p + 1] });
          p += 2;
        } else if (hi === 0xc0) {
          events.push({ tick, programChange: true, channel, program: buf[p] });
          p += 1;
        } else {
          throw new Error(`unknown status 0x${status.toString(16)} at track ${t}, byte ${p}`);
        }
      }
    }
    assert.equal(p, end, `track ${t} length`);
    tracks.push(events);
  }
  assert.equal(p, buf.length, "trailing bytes after last track");
  return { format, division, tracks };
}

test("a simple score produces a well-formed SMF with correct pitch and balanced note on/off", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const { format, tracks } = readMidi(toMidi(doc));
  assert.equal(format, 1);
  assert.equal(tracks.length, 2); // meta + one part

  const notes = tracks[1].filter((e) => e.on).map((e) => e.note);
  assert.deepEqual(notes, [60, 62, 64, 67]); // C D E G at middle C
  const ons = tracks[1].filter((e) => e.on).length;
  const offs = tracks[1].filter((e) => e.off).length;
  assert.equal(ons, offs);
  assert.equal(ons, 4);
});

test("a rest produces no note event, and a rest-extended note's off lands at its full resolved duration", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/><rest/><rest/><note pitch="ร"/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const { division, tracks } = readMidi(toMidi(doc));
  const events = tracks[1].filter((e) => e.on || e.off);
  assert.equal(events.length, 4); // two notes, no events for the two rests
  const [on1, off1, on2] = events;
  assert.equal(on1.tick, 0);
  const slotTicks = division / 2;
  assert.equal(off1.tick, 3 * slotTicks); // ด extends through both absorbed rests
  assert.equal(on2.tick, 3 * slotTicks);
});

test("<bpm> becomes a set-tempo meta event with the right microseconds-per-quarter", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      </section-ref></part-data>`,
      { structure: `<direction><bpm>120</bpm></direction><section id="s1"/>` },
    ),
  );
  const { tracks } = readMidi(toMidi(doc));
  const tempoEvent = tracks[0].find((e) => e.meta === 0x51);
  assert.ok(tempoEvent);
  const microseconds = (tempoEvent.data[0] << 16) | (tempoEvent.data[1] << 8) | tempoEvent.data[2];
  assert.equal(microseconds, 500000); // 60,000,000 / 120
});

test("a known instrument name resolves to its General MIDI program", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      </section-ref></part-data>`,
      { ensemble: `<part id="P1"><instrument-name>ระนาดเอก</instrument-name></part>` },
    ),
  );
  const { tracks } = readMidi(toMidi(doc));
  const programChange = tracks[1].find((e) => e.programChange);
  assert.equal(programChange.program, 13); // Xylophone, GM program 14, 0-indexed
});

test("an unmatched instrument name falls back to Xylophone with a warning", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      </section-ref></part-data>`,
      { ensemble: `<part id="P1"><instrument-name>Some Unknown Instrument</instrument-name></part>` },
    ),
  );
  const warnings = [];
  const { tracks } = readMidi(toMidi(doc, { warn: (w) => warnings.push(w) }));
  const programChange = tracks[1].find((e) => e.programChange);
  assert.equal(programChange.program, 13);
  assert.ok(warnings.some((w) => w.includes("Some Unknown Instrument")));
});

test("an unpitched part's sound codes cycle through General MIDI percussion notes on channel 10", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note sound="a"/><note sound="b"/><note sound="a"/><note sound="c"/></measure></line>
      </section-ref></part-data>`,
      { ensemble: `<part id="P1" type="unpitched"><instrument-name>Drum</instrument-name></part>` },
    ),
  );
  const { tracks } = readMidi(toMidi(doc));
  const ons = tracks[1].filter((e) => e.on);
  assert.deepEqual(
    ons.map((e) => e.channel),
    [9, 9, 9, 9],
  );
  assert.deepEqual(
    ons.map((e) => e.note),
    [38, 39, 38, 42], // a, b, a again, c - Acoustic Snare, Hand Clap, Snare, Closed Hi-Hat
  );
  assert.equal(tracks[1].some((e) => e.programChange), false); // percussion has no program change
});

test("percussionMap and instrumentMap options override the built-in tables", () => {
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note sound="a"/></measure></line>
      </section-ref></part-data>
      <part-data part="P2"><section-ref section="s1">
        <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      </section-ref></part-data>`,
      {
        ensemble: `<part id="P1" type="unpitched"><instrument-name>Drum</instrument-name></part><part id="P2"><instrument-name>Custom Instrument</instrument-name></part>`,
      },
    ),
  );
  const { tracks } = readMidi(
    toMidi(doc, { percussionMap: { a: 99 }, instrumentMap: { "Custom Instrument": 5 } }),
  );
  const drumOn = tracks[1].find((e) => e.on);
  assert.equal(drumOn.note, 99);
  const programChange = tracks[2].find((e) => e.programChange);
  assert.equal(programChange.program, 4); // instrumentMap uses the same 1-indexed GM convention as the built-in table
});

test("stacked rows merge into one track sharing one channel; --split-stacks gives each its own track/channel", () => {
  const partData = `<part-data part="P1"><section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
    </section-ref></part-data>
    <part-data part="P2"><section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ร"/></measure></line>
    </section-ref></part-data>`;
  const ensemble = `<part id="P1" stack="s" row="1"><instrument-name>Top</instrument-name></part><part id="P2" stack="s" row="2"><instrument-name>Bottom</instrument-name></part>`;

  const merged = readMidi(toMidi(resolve(score(partData, { ensemble }))));
  assert.equal(merged.tracks.length, 2); // meta + one merged stack track
  const mergedOns = merged.tracks[1].filter((e) => e.on);
  assert.equal(mergedOns.length, 2);
  assert.equal(mergedOns[0].channel, mergedOns[1].channel);

  const split = readMidi(toMidi(resolve(score(partData, { ensemble })), { splitStacks: true }));
  assert.equal(split.tracks.length, 3); // meta + two separate tracks
  const channel1 = split.tracks[1].find((e) => e.on).channel;
  const channel2 = split.tracks[2].find((e) => e.on).channel;
  assert.notEqual(channel1, channel2);
});

test("a lyric part is skipped with a warning rather than exported", () => {
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
  const warnings = [];
  const { tracks } = readMidi(toMidi(doc, { warn: (w) => warnings.push(w) }));
  assert.equal(tracks.length, 2); // meta + only the melody part
  assert.ok(warnings.some((w) => w.includes("lyric")));
});

test("a note with sound in a part not declared unpitched still plays, routed to the percussion channel, with a warning", () => {
  // Regression: example-lao-duang-duean.txml has a stray <note sound="x"/> in
  // a part with no type="unpitched" (a real, pre-existing inconsistency in
  // that file). The converter must not crash on this - it should warn and
  // still produce a playable note, per this format's general "warn on a
  // soft mismatch, don't hard-fail" convention.
  const doc = resolve(
    score(
      `<part-data part="P1"><section-ref section="s1">
        <line number="1"><measure number="1"><note sound="x"/><note pitch="ร"/></measure></line>
      </section-ref></part-data>`,
    ),
  );
  const warnings = [];
  const { tracks } = readMidi(toMidi(doc, { warn: (w) => warnings.push(w) }));
  const ons = tracks[1].filter((e) => e.on);
  assert.equal(ons.length, 2);
  assert.equal(ons[0].channel, 9); // routed to the percussion channel despite the part's own channel
  assert.equal(ons[1].channel, 0); // the normal pitched note keeps the part's own channel
  assert.ok(warnings.some((w) => w.includes("carries sound") && w.includes("doesn't match its declared type")));
});

test("every real example and corpus file converts to a structurally valid, note-balanced SMF", () => {
  for (const file of realFiles) {
    const doc = resolve(readFileSync(file, "utf8"));
    const buf = toMidi(doc, { warn: () => {} });
    const { tracks } = readMidi(buf);
    const totalOn = tracks.reduce((sum, t) => sum + t.filter((e) => e.on).length, 0);
    const totalOff = tracks.reduce((sum, t) => sum + t.filter((e) => e.off).length, 0);
    assert.equal(totalOn, totalOff, `${path.basename(file)}: unbalanced note on/off`);
  }
});
