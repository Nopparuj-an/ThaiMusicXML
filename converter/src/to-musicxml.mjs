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
import { compare, add, subtract, ZERO } from "./fraction.mjs";
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

/** Stable map key for an exact-fraction onset, used to match a syllable to the note it lands on. */
const onsetKey = (f) => `${f.n}/${f.d}`;

const timeModification = (tuplet) =>
  tuplet
    ? `<time-modification><actual-notes>${tuplet.actual}</actual-notes><normal-notes>${tuplet.normal}</normal-notes></time-modification>`
    : "";

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
 * One resolved note or rest as its head markup (null for a rest) plus its
 * tied MusicXML duration segments, in order. `isUnpitched` is the note's own
 * part's declared type; a note whose `sound`/`pitch` doesn't match it (a
 * type mismatch invalid per note.md's Conformance) has no meaningful
 * notehead on either reading and converts as a rest instead, with a warning
 * - the same "soft violation, still produce a playable/printable file"
 * degrade the MIDI writer uses for the same case.
 */
function describeNote(note, tuning, slotTicks, divisions, isUnpitched, memberId, warn) {
  const segments = encodeDuration(note.duration, slotTicks, divisions);
  if (note.rest) return { head: "<rest/>", segments };

  const usesSound = note.sound !== null && note.sound !== undefined;
  if (usesSound !== isUnpitched) {
    const value = usesSound ? `sound "${note.sound}"` : `pitch "${note.pitch}${note.octave ?? ""}"`;
    warn(
      `${noteLocation(memberId, note)} (part type="${isUnpitched ? "unpitched" : "pitched"}"): a note carries ${value}, which doesn't match its declared type; treating it as a rest`,
    );
    return { head: "<rest/>", segments };
  }

  const head = usesSound
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
 * durations) so the render step doesn't need to re-derive it. `lyricTexts`,
 * when given, is this staff's onset -> syllable-text lookup (see
 * resolveLyricAssignments); it's attached only to a note's first segment,
 * never a tied continuation, since the syllable is sung on the attack.
 */
function flattenSegments(notes, tuning, slotTicks, divisions, isUnpitched, memberId, warn, lyricTexts) {
  const items = [];
  for (const note of notes) {
    const { head, segments } = describeNote(note, tuning, slotTicks, divisions, isUnpitched, memberId, warn);
    const lyric = !note.rest && lyricTexts ? lyricTexts.get(onsetKey(note.onset)) : undefined;
    segments.forEach(({ ticks, type, dots, tuplet }, i) => {
      items.push({
        head,
        ticks,
        type,
        dots,
        tuplet,
        tieMark: segments.length > 1 ? (i === 0 ? "start" : "stop") : null,
        lyric: i === 0 ? lyric : undefined,
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
  const lyric = item.lyric ? `<lyric><syllabic>single</syllabic><text>${escapeXml(item.lyric)}</text></lyric>` : "";
  return `<note>${item.head}<duration>${item.ticks}</duration>${tie}<type>${item.type}</type>${"<dot/>".repeat(item.dots)}${timeModification(item.tuplet)}${staffTag}${notations}${lyric}</note>`;
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

/**
 * Pair every lyric part in <ensemble> to the output group its syllables
 * attach to. ThaiMusicXML states no structural pairing (see
 * reference/conversion's "Unpitched and lyric parts"), so a converter has to
 * pick one: `lyricsMap` (a {lyricPartId: notatedPartId} JSON file via
 * --lyrics-map) states it explicitly, part id or stack-member id either way;
 * with no map, the first lyric part in ensemble order pairs to the first
 * output group, and any further lyric part is dropped with a warning.
 */
function resolveLyricPairs(doc, groups, lyricsMap, warn) {
  const lyricParts = doc.parts.filter((p) => p.type === "lyric");
  if (lyricParts.length === 0) return [];

  const findTarget = (targetId) => {
    for (const g of groups) {
      if (g.id === targetId) return { group: g, memberId: g.members[0].id };
      const member = g.members.find((m) => m.id === targetId);
      if (member) return { group: g, memberId: member.id };
    }
    return null;
  };

  if (lyricsMap) {
    const pairs = [];
    for (const [lyricId, targetId] of Object.entries(lyricsMap)) {
      const lyricPart = lyricParts.find((p) => p.id === lyricId);
      if (!lyricPart) {
        warn(`--lyrics-map: "${lyricId}" is not a lyric part, ignoring`);
        continue;
      }
      const target = findTarget(targetId);
      if (!target) {
        warn(`--lyrics-map: no notated part or stack matches "${targetId}", "${lyricId}" not exported`);
        continue;
      }
      pairs.push({ lyricId, ...target });
    }
    for (const p of lyricParts) {
      if (!(p.id in lyricsMap)) warn(`lyric part "${p.id}" has no mapping in --lyrics-map, not exported`);
    }
    return pairs;
  }

  if (groups.length === 0) {
    warn(`lyric part "${lyricParts[0].id}" has no notated part to attach to, not exported`);
    return [];
  }
  const [first, ...rest] = lyricParts;
  for (const p of rest) {
    warn(`lyric part "${p.id}" is dropped: only the first lyric part is paired by default - use --lyrics-map to pair it`);
  }
  return [{ lyricId: first.id, group: groups[0], memberId: groups[0].members[0].id }];
}

/**
 * The note a syllable at `onset` attaches to: whichever note is actually
 * sounding there, first choice - the notated line the words are sung over,
 * not necessarily a note starting exactly there, since a decaying note can
 * still be ringing (see reference/conversion's "Rests"). Failing that
 * (real silence at that instant), the nearest note before it - appending to
 * whatever's still there rather than leaving the syllable stranded. Failing
 * that too (the syllable falls before the target's first note), the nearest
 * note after it instead. `null` only when the target has no notes at all.
 */
function attachTarget(notes, onset) {
  let before = null;
  let after = null;
  for (const n of notes) {
    if (compare(n.onset, onset) <= 0 && compare(add(n.onset, n.duration), onset) > 0) return n;
    if (compare(n.onset, onset) <= 0) {
      if (!before || compare(n.onset, before.onset) > 0) before = n;
    } else if (!after || compare(n.onset, after.onset) < 0) {
      after = n;
    }
  }
  return before ?? after ?? null;
}

/**
 * One lyric pair's syllables, matched to a note in the target part via
 * attachTarget. Only dropped, with a warning, when the target has no note at
 * all to attach to. More than one syllable landing on the same note (a
 * melisma written with several syllables over one held note, or two
 * syllables both falling back to the same nearest note) joins them with a
 * space rather than overwriting.
 */
function resolveLyricTexts(doc, lyricId, memberId, warn) {
  const syllables = doc.unrollLyrics(lyricId, memberId);
  const targetNotes = doc.unroll(memberId).notes.filter((n) => !n.rest);
  const texts = new Map();
  for (const { onset, text, line, measure } of syllables) {
    const note = attachTarget(targetNotes, onset);
    if (!note) {
      warn(
        `lyric part "${lyricId}" line ${line} measure ${measure}: syllable "${text}" has no note at all in "${memberId}" to attach to`,
      );
      continue;
    }
    const key = onsetKey(note.onset);
    texts.set(key, texts.has(key) ? `${texts.get(key)} ${text}` : text);
  }
  return texts;
}

/** Every output group's lyric assignment: which member (staff) index carries the text, and the text keyed by that member's note onsets. */
function resolveLyricAssignments(doc, groups, lyricsMap, warn) {
  const assignments = new Map();
  for (const { lyricId, group, memberId } of resolveLyricPairs(doc, groups, lyricsMap, warn)) {
    const staffIndex = group.members.findIndex((m) => m.id === memberId);
    assignments.set(group.id, { staffIndex, texts: resolveLyricTexts(doc, lyricId, memberId, warn) });
  }
  return assignments;
}

function convertPart(doc, group, tuning, slotTicks, divisions, warn, lyricAssignment) {
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
      const member = group.members[staffIndex];
      const memberIsUnpitched = member.type === "unpitched";
      const lyricTexts = lyricAssignment?.staffIndex === staffIndex ? lyricAssignment.texts : null;
      const items = assignTupletBrackets(
        flattenSegments(measures[m] ?? [], tuning, slotTicks, divisions, memberIsUnpitched, member.id, warn, lyricTexts),
      );
      for (const item of items) xml += renderSegment(item, staves > 1 ? staffIndex + 1 : null);
    });
    xml += `</measure>`;
  }
  return xml;
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
 * Convert a resolved ThaiMusicXML document (from resolve.mjs) to a MusicXML
 * string. `options.tuning` overrides <tuning> or its absence; `options.splitStacks`
 * gives each stacked row its own part instead of merging them.
 * `options.lyrics` (default true) turns off lyric export entirely when
 * false; `options.lyricsMap` (a {lyricPartId: notatedPartId} object) states
 * which lyric part pairs to which notated part/stack, overriding the
 * first-to-first default - see resolveLyricPairs.
 */
export function toMusicXml(doc, options = {}) {
  const warn = dedupeWarn(options.warn ?? (() => {}));
  const tuning = resolveTuning(options.tuning ?? doc.tuning, warn);
  const lyricsEnabled = options.lyrics ?? true;

  const groups = groupParts(
    doc.parts.filter((p) => p.type !== "lyric"),
    options.splitStacks,
  );
  const lyricAssignments = lyricsEnabled
    ? resolveLyricAssignments(doc, groups, options.lyricsMap, warn)
    : new Map();

  const allDenominators = groups.flatMap((g) =>
    g.members.flatMap((m) => denominatorsOf(doc.unroll(m.id).notes)),
  );
  const slotTicks = ticksPerSlot(allDenominators);
  const divisions = slotTicks * 2;

  const partList = groups
    .map((g) => `<score-part id="${g.id}"><part-name>${escapeXml(g.name)}</part-name></score-part>`)
    .join("");

  const parts = groups
    .map(
      (g) =>
        `<part id="${g.id}">${convertPart(doc, g, tuning, slotTicks, divisions, warn, lyricAssignments.get(g.id))}</part>`,
    )
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
