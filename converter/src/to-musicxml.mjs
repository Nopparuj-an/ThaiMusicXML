// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// ThaiMusicXML -> MusicXML. See reference/conversion in the docs for the
// mapping policy this implements.
//
// v0.1 of this writer always unrolls play order (every pass of every
// repeated section becomes its own plain measures) rather than emitting
// native repeat barlines and volta endings. The docs describe native
// encoding as the eventual default; this is a staged interim step so a
// working converter exists sooner, not a change of the documented policy.

import { resolveTuning, resolvePitch } from "./pitch.mjs";
import { ticksPerSlot, encodeDuration } from "./musicxml-durations.mjs";
import { compare, subtract, ZERO } from "./fraction.mjs";
import { groupParts } from "./ensemble-groups.mjs";

const escapeXml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** One of <text> children's three positions, or plain content: whichever is present, preferring center. */
const creditText = (aligned) => (aligned ? (aligned.center ?? aligned.left ?? aligned.right) : null);

/** Every denominator appearing in a part's resolved notes, for sizing this piece's <divisions>. */
function denominatorsOf(notes) {
  const out = [];
  for (const note of notes) out.push(note.onset.d, note.duration.d);
  return out;
}

const timeModification = (tuplet) =>
  tuplet
    ? `<time-modification><actual-notes>${tuplet.actual}</actual-notes><normal-notes>${tuplet.normal}</normal-notes></time-modification>`
    : "";

/** One resolved note or rest as its head markup (null for a rest) plus its tied MusicXML duration segments, in order. */
function describeNote(note, tuning, slotTicks, divisions) {
  const segments = encodeDuration(note.duration, slotTicks, divisions);
  if (note.rest) return { head: "<rest/>", segments };

  const head =
    note.sound !== null && note.sound !== undefined
      ? // Unpitched: one fixed notehead position, since sound codes have no
        // defined mapping to a staff position. See "Unpitched and lyric parts".
        `<unpitched><display-step>B</display-step><display-octave>4</display-octave></unpitched>`
      : (() => {
          const pitch = resolvePitch(note.pitch, note.octave, tuning);
          return `<pitch><step>${pitch.step}</step>${pitch.alter ? `<alter>${pitch.alter}</alter>` : ""}<octave>${pitch.octave}</octave></pitch>`;
        })();
  return { head, segments };
}

/**
 * Flatten one staff's ordered notes/rests into one segment per tied piece,
 * each carrying a tie mark (from splitting one note across several printed
 * durations) so the render step doesn't need to re-derive it.
 */
function flattenSegments(notes, tuning, slotTicks, divisions) {
  const items = [];
  for (const note of notes) {
    const { head, segments } = describeNote(note, tuning, slotTicks, divisions);
    segments.forEach(({ ticks, type, dots, tuplet }, i) => {
      items.push({
        head,
        ticks,
        type,
        dots,
        tuplet,
        tieMark: segments.length > 1 ? (i === 0 ? "start" : "stop") : null,
      });
    });
  }
  return items;
}

/**
 * A <tuplet> bracket needs explicit start/stop markers, not just a
 * <time-modification> on each note - without them, a reader can't tell a
 * tied continuation note is still inside the same bracket, and may revert
 * that one note to its unscaled face value, throwing the measure's total
 * off by the tuplet's own scaling. This finds each contiguous run of
 * same-ratio tuplet segments and marks its first/last item.
 */
function assignTupletBrackets(items) {
  const marks = items.map(() => []);
  const sameRatio = (a, b) => a.actual === b.actual && a.normal === b.normal;
  let open = null; // { ratio, startIndex }
  items.forEach((it, i) => {
    if (it.tuplet) {
      if (!open) {
        marks[i].push("start");
        open = { ratio: it.tuplet, startIndex: i };
      } else if (!sameRatio(open.ratio, it.tuplet)) {
        marks[i - 1].push("stop");
        marks[i].push("start");
        open = { ratio: it.tuplet, startIndex: i };
      }
    } else if (open) {
      marks[i - 1].push("stop");
      open = null;
    }
  });
  if (open) marks[items.length - 1].push("stop");
  return items.map((it, i) => ({ ...it, tupletMarks: marks[i] }));
}

/** One flattened, tuplet-bracketed segment as a complete MusicXML <note> element, in DTD child order. */
function renderSegment(item, staff) {
  const notationsInner = [
    item.tieMark ? `<tied type="${item.tieMark}"/>` : "",
    ...item.tupletMarks.map((mark) => `<tuplet type="${mark}"/>`),
  ].join("");
  const tie = item.tieMark ? `<tie type="${item.tieMark}"/>` : "";
  const notations = notationsInner ? `<notations>${notationsInner}</notations>` : "";
  const staffTag = staff ? `<staff>${staff}</staff>` : "";
  return `<note>${item.head}<duration>${item.ticks}</duration>${tie}<type>${item.type}</type>${"<dot/>".repeat(item.dots)}${timeModification(item.tuplet)}${staffTag}${notations}</note>`;
}

/** One member's flat unrolled notes bucketed into one array per measure, by comparing onsets to the shared measure boundaries. */
function bucketByMeasure(notes, measureBoundaries) {
  const measures = measureBoundaries.map(() => []);
  let m = 0;
  for (const note of [...notes].sort((a, b) => compare(a.onset, b.onset))) {
    while (m < measureBoundaries.length - 1 && compare(note.onset, measureBoundaries[m]) >= 0) m++;
    measures[m].push(note);
  }
  return measures;
}

function convertPart(doc, group, tuning, slotTicks, divisions, warn) {
  const memberNotes = group.members.map((m) => doc.unroll(m.id));
  const measureBoundaries = memberNotes[0]?.measureBoundaries ?? [];
  for (const other of memberNotes.slice(1)) {
    if (other.measureBoundaries.length !== measureBoundaries.length)
      warn(`part "${group.id}": stacked rows disagree on measure count, using the first row's`);
  }

  const staves = group.members.length;
  const isUnpitched = group.members[0].type === "unpitched";
  const perMemberMeasures = memberNotes.map((n) => bucketByMeasure(n.notes, measureBoundaries));

  let xml = "";
  for (let m = 0; m < measureBoundaries.length; m++) {
    const measureStart = m === 0 ? ZERO : measureBoundaries[m - 1];
    const measureSpan = subtract(measureBoundaries[m], measureStart);
    const measureTicks = Math.round((measureSpan.n * slotTicks) / measureSpan.d);

    xml += `<measure number="${m + 1}">`;
    if (m === 0) {
      xml += `<attributes><divisions>${divisions}</divisions>`;
      if (!isUnpitched) xml += `<key><fifths>0</fifths></key>`;
      xml += `<time><beats>2</beats><beat-type>4</beat-type></time>`;
      if (staves > 1) xml += `<staves>${staves}</staves>`;
      xml += isUnpitched
        ? `<clef><sign>percussion</sign><line>2</line></clef>`
        : `<clef><sign>G</sign><line>2</line></clef>`;
      xml += `</attributes>`;
    }
    perMemberMeasures.forEach((measures, staffIndex) => {
      if (staffIndex > 0) xml += `<backup><duration>${measureTicks}</duration></backup>`;
      const items = assignTupletBrackets(flattenSegments(measures[m] ?? [], tuning, slotTicks, divisions));
      for (const item of items) xml += renderSegment(item, staves > 1 ? staffIndex + 1 : null);
    });
    xml += `</measure>`;
  }
  return xml;
}

/**
 * Convert a resolved ThaiMusicXML document (from resolve.mjs) to a MusicXML
 * string. `options.tuning` overrides <tuning> or its absence; `options.splitStacks`
 * gives each stacked row its own part instead of merging them.
 */
export function toMusicXml(doc, options = {}) {
  const warn = options.warn ?? (() => {});
  const tuning = resolveTuning(options.tuning ?? doc.tuning, warn);

  const groups = groupParts(
    doc.parts.filter((p) => p.type !== "lyric"),
    options.splitStacks,
  );
  if (doc.parts.some((p) => p.type === "lyric")) {
    warn("lyric parts have no defined pairing to a notated part in v0.1 and are not exported");
  }

  const allDenominators = groups.flatMap((g) =>
    g.members.flatMap((m) => denominatorsOf(doc.unroll(m.id).notes)),
  );
  const slotTicks = ticksPerSlot(allDenominators);
  const divisions = slotTicks * 2;

  const partList = groups
    .map((g) => `<score-part id="${g.id}"><part-name>${escapeXml(g.name)}</part-name></score-part>`)
    .join("");

  const parts = groups
    .map((g) => `<part id="${g.id}">${convertPart(doc, g, tuning, slotTicks, divisions, warn)}</part>`)
    .join("");

  const work = doc.title ? `<work><work-title>${escapeXml(doc.title)}</work-title></work>` : "";
  const creators = [
    ["composer", creditText(doc.composer)],
    ["lyricist", creditText(doc.lyricist)],
    ["arranger", creditText(doc.arranger)],
  ]
    .filter(([, text]) => text)
    .map(([type, text]) => `<creator type="${type}">${escapeXml(text)}</creator>`)
    .join("");
  const identification = creators ? `<identification>${creators}</identification>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">${work}${identification}<part-list>${partList}</part-list>${parts}</score-partwise>`;
}
