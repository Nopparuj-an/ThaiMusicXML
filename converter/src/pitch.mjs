// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// A ThaiMusicXML pitch resolved to an absolute one, shared by both export
// targets. See reference/conversion's "Pitch": a scale degree names a step of
// the Thai scale, not a frequency, so a <tuning> reference is needed before
// either target can write a concrete pitch. Both a MIDI note number and a
// MusicXML step/alter/octave are derived from the same semitone-from-C4
// value, so the two targets can never disagree about which note sounds.

import { NIKHAHIT, PINTHU, DEGREE_BY_SPELLING } from "../../renderer/src/geometry.mjs";

// ด/1/D through ท/7/T, spelled per reference.reference-major, with each
// degree's semitone offset from C4 (MIDI 60) at octave attribute 0. bb-major
// shifts every degree down a whole step from c-major, so its tonic (Bb)
// lands below the C that follows it - a real major scale read up from its
// own tonic, not seven notes pinned to one fixed octave.
const TUNINGS = {
  "c-major": [
    { step: "C", alter: 0, semitone: 0 },
    { step: "D", alter: 0, semitone: 2 },
    { step: "E", alter: 0, semitone: 4 },
    { step: "F", alter: 0, semitone: 5 },
    { step: "G", alter: 0, semitone: 7 },
    { step: "A", alter: 0, semitone: 9 },
    { step: "B", alter: 0, semitone: 11 },
  ],
  "bb-major": [
    { step: "B", alter: -1, semitone: -2 },
    { step: "C", alter: 0, semitone: 0 },
    { step: "D", alter: 0, semitone: 2 },
    { step: "E", alter: -1, semitone: 3 },
    { step: "F", alter: 0, semitone: 5 },
    { step: "G", alter: 0, semitone: 7 },
    { step: "A", alter: 0, semitone: 9 },
  ],
};

/**
 * Resolve `<tuning reference>` to one of the two defined mappings, falling
 * back to c-major with a warning for anything else - including a missing
 * `<tuning>` altogether. See reference/conversion's "Pitch".
 */
export function resolveTuning(reference, warn = () => {}) {
  if (reference && TUNINGS[reference]) return reference;
  if (reference) warn(`unrecognized tuning reference "${reference}", converting as c-major`);
  else warn("no <tuning>, converting as c-major");
  return "c-major";
}

/**
 * A note's own octave, resolving the Thai modifier/attribute precedence in
 * note.md's Conformance: a literal nikhahit or pinthu in `pitch` determines
 * the octave outright, and an `octave` attribute alongside one is ignored
 * rather than added to it.
 */
function octaveOf(pitch, octaveAttr) {
  if (pitch.includes(NIKHAHIT)) return 1;
  if (pitch.includes(PINTHU)) return -1;
  return octaveAttr ?? 0;
}

/**
 * One note's absolute pitch: a MIDI note number (60 = C4) and the MusicXML
 * step/alter/octave derived from that same semitone value, so the two
 * targets always name the same sound.
 */
export function resolvePitch(pitch, octaveAttr, tuningReference) {
  const bare = pitch.replace(NIKHAHIT, "").replace(PINTHU, "");
  const degree = DEGREE_BY_SPELLING.get(bare);
  if (degree === undefined) throw new Error(`not a recognized pitch: "${pitch}"`);

  const entry = TUNINGS[tuningReference][degree];
  const octave = octaveOf(pitch, octaveAttr);
  const midi = 60 + entry.semitone + 12 * octave;
  return { midi, step: entry.step, alter: entry.alter, octave: Math.floor(midi / 12) - 1 };
}
