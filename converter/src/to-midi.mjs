// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// ThaiMusicXML -> Standard MIDI File (SMF format 1). See reference/conversion
// in the docs for the mapping policy this implements.
//
// Repeats are always fully unrolled here (Standard MIDI has no native
// repeat concept, unlike the MusicXML writer's native-barline goal), lyric
// parts are always skipped (Standard MIDI text meta events have no notion of
// syllable-to-note pairing, unlike to-musicxml.mjs's <lyric> elements), and
// <annotation> text/<nathap> aren't carried into meta events yet -
// resolve.mjs's playOrder doesn't capture their content, only <chan>'s value
// and <bpm>. See HANDOFF.md.
//
// toMidi() returns a Node Buffer under Node, a Uint8Array in the browser -
// both are byte-addressable and work with writeFileSync/Blob respectively.

import { resolvePitch, resolveTuning } from "./pitch.mjs";
import { lcm, subtract, compare, ZERO } from "./fraction.mjs";
import { groupParts } from "./ensemble-groups.mjs";

// General MIDI program numbers, 1-indexed as GM names them; the wire value
// sent in a Program Change is one less. See reference/conversion's "MIDI:
// instrument patches".
const GM_INSTRUMENTS = [
  { match: "ระนาดเอก", program: 14 }, // Xylophone
  { match: "ฆ้องวงใหญ่", program: 12 }, // Vibraphone
  { match: "ขิม", program: 16 }, // Dulcimer
  { match: "จะเข้", program: 108 }, // Koto
  { match: "ซอด้วง", program: 41 }, // Violin
  { match: "ซออู้", program: 43 }, // Cello
];
const DEFAULT_PROGRAM = 14; // Xylophone, with a warning - see "MIDI: instrument patches"

// General MIDI percussion key numbers (channel 10), cycled across a part's
// distinct `sound` codes in first-appearance order. See "MIDI: percussion".
const PERCUSSION_NOTES = [38, 39, 42, 46, 45, 50, 56, 75];
const PERCUSSION_CHANNEL = 9; // MIDI channel 10, 0-indexed

/** GM program (1-indexed) for a pitched instrument-name, overrides checked first, substring match against the table otherwise. */
function resolveProgram(instrumentName, overrides, warn) {
  for (const [match, program] of Object.entries(overrides)) {
    if (instrumentName.includes(match)) return program;
  }
  for (const { match, program } of GM_INSTRUMENTS) {
    if (instrumentName.includes(match)) return program;
  }
  warn(`no General MIDI patch known for instrument "${instrumentName}", using Xylophone`);
  return DEFAULT_PROGRAM;
}

/**
 * The tempo events this piece needs, in tick order, deduplicated.
 *
 * One <bpm> beat is half a measure, not a fixed count of note slots (see
 * <bpm>'s "The unit being counted"), so a measure lasts the same wall-clock
 * time whatever its beat count and the slots inside it stretch or compress to
 * fit. MIDI has no measure-relative tempo, so that is expressed by scaling
 * microseconds-per-quarter per measure: a measure of B slots has to fill two
 * bpm beats, which puts a quarter (two slots) at 240000000 / (bpm * B)
 * microseconds. At the usual B of 4 this is the plain 60000000 / bpm and no
 * per-measure event is emitted at all, since the value never changes.
 */
function tempoEvents({ tempoChanges = [], measureBoundaries = [] }) {
  // The bpm in force at a given onset, from the last <direction> at or before
  // it. A piece with no <bpm> anywhere gets no tempo events and plays at
  // whatever the reading device defaults to.
  const bpmAt = (onset) => {
    let bpm = null;
    for (const change of tempoChanges) {
      if (compare(change.onset, onset) > 0) break;
      bpm = change.bpm;
    }
    return bpm;
  };

  const events = [];
  const push = (onset, bpm, slots) => {
    if (bpm === null || slots <= 0) return;
    events.push({ onset, microsecondsPerQuarter: Math.round(240000000 / (bpm * slots)) });
  };

  // Every point the rate can change: a measure start, or a <direction>
  // landing mid-measure.
  let measureStart = ZERO;
  for (const boundary of measureBoundaries) {
    const slots = subtract(boundary, measureStart);
    const beats = slots.n / slots.d;
    push(measureStart, bpmAt(measureStart), beats);
    for (const change of tempoChanges)
      if (compare(change.onset, measureStart) > 0 && compare(change.onset, boundary) < 0)
        push(change.onset, change.bpm, beats);
    measureStart = boundary;
  }

  // A tempo that has not moved needs no second event.
  events.sort((a, b) => compare(a.onset, b.onset));
  return events.filter(
    (e, i) => i === 0 || e.microsecondsPerQuarter !== events[i - 1].microsecondsPerQuarter,
  );
}

/**
 * Every distinct `sound` code across every unpitched-declared group,
 * first-appearance order, mapped to a GM percussion note, overrides checked
 * first. Only scans groups declared `type="unpitched"`: a `sound`-bearing
 * note elsewhere is a type mismatch that addNoteEvents converts to a rest
 * rather than a percussion hit, so it needs no note number here.
 */
function resolvePercussionNotes(groups, doc, overrides) {
  const codes = [];
  for (const group of groups) {
    if (group.members[0].type !== "unpitched") continue;
    for (const member of group.members) {
      for (const note of doc.unroll(member.id).notes) {
        if (!note.rest && note.sound != null && !codes.includes(note.sound)) codes.push(note.sound);
      }
    }
  }
  const map = {};
  let cycle = 0;
  for (const code of codes) {
    if (code in overrides) {
      map[code] = overrides[code];
      continue;
    }
    map[code] = PERCUSSION_NOTES[cycle % PERCUSSION_NOTES.length];
    cycle++;
  }
  return map;
}

/** Every fraction denominator (onset and duration) across a set of unrolled note lists, for sizing one shared tick resolution. */
function denominatorsOf(unrolled) {
  const out = [];
  for (const { notes } of unrolled) for (const note of notes) out.push(note.onset.d, note.duration.d);
  return out;
}

const ticksFor = (fraction, ticksPerSlot) => Math.round((fraction.n * ticksPerSlot) / fraction.d);

function variableLengthQuantity(value) {
  const bytes = [value & 0x7f];
  value = Math.floor(value / 128);
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value = Math.floor(value / 128);
  }
  return bytes;
}

class Track {
  constructor() {
    this.events = [];
  }

  add(tick, bytes) {
    this.events.push({ tick, bytes });
  }

  toBytes() {
    this.events.sort((a, b) => a.tick - b.tick); // stable: same-tick events keep insertion order
    const body = [];
    let previousTick = 0;
    for (const { tick, bytes } of this.events) {
      body.push(...variableLengthQuantity(tick - previousTick), ...bytes);
      previousTick = tick;
    }
    body.push(0x00, 0xff, 0x2f, 0x00); // end of track
    const length = body.length;
    return [
      0x4d,
      0x54,
      0x72,
      0x6b, // "MTrk"
      (length >>> 24) & 0xff,
      (length >>> 16) & 0xff,
      (length >>> 8) & 0xff,
      length & 0xff,
      ...body,
    ];
  }
}

const textMetaEvent = (type, text) => {
  const bytes = Array.from(new TextEncoder().encode(text));
  return [0xff, type, ...variableLengthQuantity(bytes.length), ...bytes];
};

/**
 * Where a resolved note came from in the source, for a warning message: its
 * part, section, and written line/measure. A `<repeat>` or `<line-repeat>`
 * can replay that same written line/measure several times over the course
 * of the piece - `dedupeWarn` (below) is what collapses those replays back
 * down to the one warning the single underlying source note deserves, not
 * this label, which stays the same across every replay on purpose.
 */
function noteLocation(memberId, note) {
  return `part "${memberId}" section "${note.section}" line ${note.line} measure ${note.measure}`;
}

/**
 * Wraps `warn` so the exact same message never prints twice in one
 * conversion. A `<repeat>` or `<line-repeat>` replays the same written
 * line/measure as many times as it plays, and each replay of a bad note
 * hits the same warning site with the same message - one warning per
 * distinct source problem is what's useful; one per playback of it just
 * reads as the converter stuttering.
 */
function dedupeWarn(warn) {
  const seen = new Set();
  return (message) => {
    if (seen.has(message)) return;
    seen.add(message);
    warn(message);
  };
}

/**
 * One group's notes as note-on/note-off pairs, percussion using its resolved
 * note map instead of pitch. Decided per note by whether it actually carries
 * `sound`, not by the group's declared type: `sound` is only supposed to
 * appear on a `type="unpitched"` part (note.md's Conformance), but a
 * mismatch is a warning elsewhere in this format, not a hard failure, and a
 * stray one shouldn't crash the whole conversion. A mismatched note carries
 * no meaning on either channel - not a real pitch, and not a percussion code
 * on an instrument nobody declared unpitched - so it converts as a rest
 * (no note event at all) rather than sounding on the wrong kind of channel.
 */
function addNoteEvents(track, group, channel, doc, tuning, ticksPerSlot, percussionNotes, warn) {
  const isUnpitched = group.members[0].type === "unpitched";
  for (const member of group.members) {
    for (const note of doc.unroll(member.id).notes) {
      if (note.rest) continue;
      const usesSound = note.sound != null;
      if (usesSound !== isUnpitched) {
        const value = usesSound ? `sound "${note.sound}"` : `pitch "${note.pitch}${note.octave ?? ""}"`;
        warn(
          `${noteLocation(member.id, note)} (part type="${member.type}"): a note carries ${value}, which doesn't match its declared type; treating it as a rest`,
        );
        continue;
      }
      const midi = usesSound ? percussionNotes[note.sound] : resolvePitch(note.pitch, note.octave, tuning).midi;
      const onsetTicks = ticksFor(note.onset, ticksPerSlot);
      const offTicks = onsetTicks + ticksFor(note.duration, ticksPerSlot);
      track.add(onsetTicks, [0x90 | channel, midi, 100]);
      track.add(offTicks, [0x80 | channel, midi, 64]);
    }
  }
}

/**
 * Convert a resolved ThaiMusicXML document (from resolve.mjs) to a Standard
 * MIDI File, format 1: one tempo/meta track plus one track per output part.
 * `options.tuning` overrides <tuning> or its absence; `options.splitStacks`
 * gives each stacked row its own track instead of merging them;
 * `options.instrumentMap`/`options.percussionMap` override the built-in GM
 * patch/percussion-note tables, keyed the same way (a substring of
 * `instrument-name`, or a literal `sound` code).
 */
export function toMidi(doc, options = {}) {
  const warn = dedupeWarn(options.warn ?? (() => {}));
  const tuning = resolveTuning(options.tuning ?? doc.tuning, warn);
  const instrumentMap = options.instrumentMap ?? {};
  const percussionMap = options.percussionMap ?? {};

  const groups = groupParts(
    doc.parts.filter((p) => p.type !== "lyric"),
    options.splitStacks,
  );
  if (doc.parts.some((p) => p.type === "lyric")) {
    warn("Standard MIDI has no lyric pairing in v1.0; lyric parts are not carried into this file");
  }

  const unrolledByGroup = groups.map((g) => g.members.map((m) => doc.unroll(m.id)));
  const allDenominators = unrolledByGroup.flatMap(denominatorsOf);
  const ticksPerSlot = allDenominators.reduce(lcm, 1);
  const division = ticksPerSlot * 2; // ticks per quarter note: two note slots

  const percussionNotes = resolvePercussionNotes(groups, doc, percussionMap);

  const metaTrack = new Track();
  if (doc.title) metaTrack.add(0, textMetaEvent(0x03, doc.title));
  metaTrack.add(0, [0xff, 0x58, 0x04, 0x02, 0x02, 0x18, 0x08]); // 2/4 time signature

  // playOrder's directions don't depend on any one part, so any group's own
  // timeline works as the reference for placing tempo/chan markers - see
  // HANDOFF.md for the one edge case (a part that skips a section) this
  // doesn't perfectly account for.
  const reference = groups[0]
    ? doc.unroll(groups[0].members[0].id)
    : { tempoChanges: [], measureBoundaries: [] };
  for (const { onset, microsecondsPerQuarter } of tempoEvents(reference)) {
    metaTrack.add(ticksFor(onset, ticksPerSlot), [
      0xff,
      0x51,
      0x03,
      (microsecondsPerQuarter >>> 16) & 0xff,
      (microsecondsPerQuarter >>> 8) & 0xff,
      microsecondsPerQuarter & 0xff,
    ]);
  }
  for (const { onset, chan } of reference.chanChanges) {
    metaTrack.add(ticksFor(onset, ticksPerSlot), textMetaEvent(0x06, `chan ${chan}`));
  }

  const channels = [];
  let nextChannel = 0;
  for (const group of groups) {
    if (group.members[0].type === "unpitched") {
      channels.push(PERCUSSION_CHANNEL);
      continue;
    }
    if (nextChannel === PERCUSSION_CHANNEL) nextChannel++;
    if (nextChannel > 15) throw new Error("more pitched instruments than available MIDI channels (15)");
    channels.push(nextChannel++);
  }

  const tracks = groups.map((group, i) => {
    const track = new Track();
    const channel = channels[i];
    track.add(0, textMetaEvent(0x03, group.name));
    if (channel !== PERCUSSION_CHANNEL) {
      const program = resolveProgram(group.members[0].name, instrumentMap, warn);
      track.add(0, [0xc0 | channel, program - 1]);
    }
    addNoteEvents(track, group, channel, doc, tuning, ticksPerSlot, percussionNotes, warn);
    return track;
  });

  const allTracks = [metaTrack, ...tracks];
  const header = [
    0x4d,
    0x54,
    0x68,
    0x64, // "MThd"
    0x00,
    0x00,
    0x00,
    0x06,
    0x00,
    0x01, // format 1
    (allTracks.length >>> 8) & 0xff,
    allTracks.length & 0xff,
    (division >>> 8) & 0xff,
    division & 0xff,
  ];
  const bytes = [...header, ...allTracks.flatMap((t) => t.toBytes())];
  return typeof Buffer !== "undefined" ? Buffer.from(bytes) : new Uint8Array(bytes);
}
