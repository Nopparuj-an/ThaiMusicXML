// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// ThaiMusicXML document to a plain object tree.
//
// This stage does no layout and makes no display decisions. It reads what the
// document says and hands on a structure the layout stage can walk. Anything
// the renderer chooses rather than reads belongs in layout.mjs.
//
// A measure is read as a list of beats, each holding one or more slots. A bare
// <note> or <rest> is a beat of one slot; a <group> is a beat of as many slots
// as it has children. That is the shape the subdivision count in
// reference/rendering/index.md works on.

import { DOMParser } from "#dom-parser";

export const NS = "https://thaimusicxml.anan.ovh/ns/0.1";

const els = (node, name) =>
  Array.from(node.getElementsByTagNameNS(NS, name)).filter(
    (el) => el.parentNode === node,
  );

const el = (node, name) => els(node, name)[0] ?? null;

const text = (node) => (node ? node.textContent.trim() : null);

/** A <note> or <rest> becomes one slot. */
function slot(node) {
  if (node.localName === "rest") return { kind: "rest" };
  return {
    kind: "note",
    pitch: node.getAttribute("pitch") || null,
    sound: node.getAttribute("sound") || null,
    octave: node.hasAttribute("octave")
      ? Number(node.getAttribute("octave"))
      : null,
  };
}

const sounds = (node) =>
  node.nodeType === 1 && (node.localName === "note" || node.localName === "rest");

/**
 * The three aligned positions shared by <annotation> and the credits. Where the
 * element has <text> children they carry the whole content, so the indentation
 * around them is not read as text.
 *
 * Plain text falls to one position, and which one differs: an annotation sits
 * in the body of the score and goes left, a credit sits under the title and
 * centers.
 */
function aligned(node, fallback) {
  if (!node) return null;
  const texts = els(node, "text");
  if (texts.length === 0) {
    const plain = text(node);
    if (!plain) return null;
    return { left: null, center: null, right: null, [fallback]: plain };
  }
  const at = (align) => {
    const match = texts.find((t) => t.getAttribute("align") === align);
    return match ? text(match) : null;
  };
  const found = { left: at("left"), center: at("center"), right: at("right") };
  return found.left || found.center || found.right ? found : null;
}

const annotation = (node) => aligned(node, "left");
const credit = (node) => aligned(node, "center");

/** A measure's children become beats of one or more slots each. */
function beats(measure) {
  const out = [];
  for (const child of Array.from(measure.childNodes)) {
    if (child.nodeType !== 1) continue;
    if (child.localName === "group") {
      // <bow> and <parenthesis> have zero duration, so they take no slot and do
      // not count toward the group's division of its beat.
      const slots = Array.from(child.childNodes).filter(sounds).map(slot);
      out.push({ slots, group: true, link: child.getAttribute("link") === "true" });
    } else if (child.localName === "note" || child.localName === "rest") {
      out.push({ slots: [slot(child)], group: false, link: false });
    }
  }
  return out;
}

/** A lyric measure's children: a <syllable> or a <rest>, in document order. */
function lyricItems(measure) {
  const out = [];
  for (const child of Array.from(measure.childNodes)) {
    if (child.nodeType !== 1) continue;
    if (child.localName === "syllable") out.push({ kind: "syllable", text: text(child) });
    else if (child.localName === "rest") out.push({ kind: "rest" });
  }
  return out;
}

/**
 * One <line>'s measures, shaped by the part's type: a notated part gets beats
 * of slots, a lyric part gets items that do not divide into beats at all. See
 * "Lyric rows" in reference/rendering.
 */
function parseLine(line, partType) {
  return {
    number: Number(line.getAttribute("number")),
    measures: els(line, "measure").map((m) =>
      partType === "lyric"
        ? { number: Number(m.getAttribute("number")), items: lyricItems(m) }
        : { number: Number(m.getAttribute("number")), beats: beats(m) },
    ),
  };
}

/**
 * Bow and parenthesis spans, matched across a run of <line> elements in
 * document order. Positions are array indices into the lines this walk was
 * given, in the same shape parseLine() produces, so layout.mjs can address a
 * span's ends directly once it has laid those lines out.
 *
 * A span may cross <measure> and <line> boundaries but never a <section>
 * boundary, so this is called once per <section-ref> over its regular lines,
 * and once more per <ending> over its own lines - a marker left dangling by
 * an ending that substitutes for part of a still-open span (see <ending>'s
 * "Spans across an overridden line") is a resolved-pass subtlety this static
 * renderer does not attempt; the dangling marker is silently unmatched.
 */
function resolveSpans(lineEls) {
  const bowSpans = [];
  const parenSpans = [];
  let openBow = null;
  let openParen = null;
  let last = null;

  const noteAt = (position) => {
    last = position;
    if (openBow && !openBow.first) openBow.first = position;
    if (openParen && !openParen.first) openParen.first = position;
  };

  const marker = (node) => {
    const type = node.getAttribute("type");
    if (node.localName === "bow") {
      if (type === "start") {
        openBow = { direction: node.getAttribute("direction") || null, first: null };
      } else if (openBow) {
        bowSpans.push({ ...openBow, last });
        openBow = null;
      }
    } else if (node.localName === "parenthesis") {
      if (type === "start") {
        openParen = {
          dim: node.hasAttribute("dim") ? node.getAttribute("dim") === "true" : null,
          mute: node.hasAttribute("mute") ? node.getAttribute("mute") === "true" : null,
          first: null,
        };
      } else if (openParen) {
        parenSpans.push({ ...openParen, last });
        openParen = null;
      }
    }
  };

  lineEls.forEach((lineEl, lineIndex) => {
    els(lineEl, "measure").forEach((measureEl, measureIndex) => {
      let beatIndex = -1;
      for (const child of Array.from(measureEl.childNodes)) {
        if (child.nodeType !== 1) continue;
        if (child.localName === "group") {
          beatIndex++;
          let slotIndex = 0;
          for (const gc of Array.from(child.childNodes)) {
            if (gc.nodeType !== 1) continue;
            if (gc.localName === "note" || gc.localName === "rest") {
              noteAt({ lineIndex, measureIndex, beatIndex, slotIndex });
              slotIndex++;
            } else if (gc.localName === "bow" || gc.localName === "parenthesis") {
              marker(gc);
            }
          }
        } else if (child.localName === "note" || child.localName === "rest") {
          beatIndex++;
          noteAt({ lineIndex, measureIndex, beatIndex, slotIndex: 0 });
        } else if (child.localName === "bow" || child.localName === "parenthesis") {
          marker(child);
        }
      }
    });
  });

  return { bowSpans, parenSpans };
}

export function parse(source) {
  const doc = new DOMParser().parseFromString(source, "text/xml");
  const score = doc.documentElement;

  const header = el(score, "header");
  const parts = els(el(score, "ensemble"), "part").map((p) => ({
    id: p.getAttribute("id"),
    type: p.getAttribute("type") || "pitched",
    stack: p.getAttribute("stack") || null,
    row: p.hasAttribute("row") ? Number(p.getAttribute("row")) : null,
    name: text(el(p, "instrument-name")),
    shortName: text(el(p, "instrument-short-name")),
  }));

  // <structure> in the order it lays the score out. A <repeat> contributes what
  // it wraps; the repeat itself prints nothing (see "Repeat brackets").
  //
  // Annotations and <br> keep their place in the sequence rather than being
  // gathered separately, because where an annotation sits is the only thing
  // that decides where it renders.
  const structure = [];
  const collect = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType !== 1) continue;
      if (child.localName === "section")
        structure.push({
          kind: "section",
          id: child.getAttribute("id"),
          name: child.getAttribute("name"),
          // A bracket in the margin right of the grid; see "Repeat brackets".
          lineRepeats: els(child, "line-repeat").map((lr) => ({
            first: Number(lr.getAttribute("first")),
            last: Number(lr.getAttribute("last")),
            times: lr.hasAttribute("times") ? Number(lr.getAttribute("times")) : 1,
          })),
        });
      else if (child.localName === "annotation") {
        const note = annotation(child);
        if (note) structure.push({ kind: "annotation", ...note });
      } else if (child.localName === "br") structure.push({ kind: "br" });
      else if (child.localName === "repeat") collect(child);
      else if (child.localName === "direction") {
        // None of nathap, chan, or bpm reach the page on their own - see each
        // element's own Rendering section - but chan is what "the ชั้น in
        // force" for a generated heading reads, so its place in the sequence
        // still matters even though the value itself is not printed here.
        const chanEl = el(child, "chan");
        const bpmEl = el(child, "bpm");
        structure.push({
          kind: "direction",
          chan: chanEl ? chanEl.getAttribute("value") : null,
          bpm: bpmEl ? Number(text(bpmEl)) : null,
        });
      }
    }
  };
  collect(el(score, "structure"));
  const sections = structure.filter((item) => item.kind === "section");

  // part id -> section id -> { annotations, lines, bowSpans, parenSpans, endings }
  const music = {};
  for (const pd of els(score, "part-data")) {
    const partId = pd.getAttribute("part");
    const partType = parts.find((p) => p.id === partId)?.type;
    music[partId] = {};
    for (const ref of els(pd, "section-ref")) {
      const lineEls = els(ref, "line");
      // Bow and parenthesis spans are invalid inside a lyric part, so there is
      // nothing to resolve there.
      const { bowSpans, parenSpans } =
        partType === "lyric" ? { bowSpans: [], parenSpans: [] } : resolveSpans(lineEls);

      music[partId][ref.getAttribute("section")] = {
        // Annotations here belong to this part alone, and render above its
        // first row in the section.
        annotations: els(ref, "annotation").map(annotation).filter(Boolean),
        lines: lineEls.map((line) => parseLine(line, partType)),
        bowSpans,
        parenSpans,
        // An ending renders below the section, detached from the line(s) it
        // replaces, so it carries its own annotation and its own spans.
        endings: els(ref, "ending").map((endingEl) => {
          const endingLineEls = els(endingEl, "line");
          const spans =
            partType === "lyric" ? { bowSpans: [], parenSpans: [] } : resolveSpans(endingLineEls);
          return {
            pass: (endingEl.getAttribute("pass") || "")
              .split(",")
              .map((n) => Number(n.trim()))
              .filter((n) => Number.isInteger(n)),
            annotations: els(endingEl, "annotation").map(annotation).filter(Boolean),
            lines: endingLineEls.map((line) => parseLine(line, partType)),
            bowSpans: spans.bowSpans,
            parenSpans: spans.parenSpans,
          };
        }),
      };
    }
  }

  return {
    version: score.getAttribute("version"),
    namespace: score.namespaceURI,
    title: text(el(header, "title")),
    composer: credit(el(header, "composer")),
    lyricist: credit(el(header, "lyricist")),
    arranger: credit(el(header, "arranger")),
    tuning: el(header, "tuning")?.getAttribute("reference") ?? null,
    license: text(el(header, "license")),
    parts,
    sections,
    structure,
    music,
  };
}
