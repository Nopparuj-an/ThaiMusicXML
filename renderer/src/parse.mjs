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

import { DOMParser } from "@xmldom/xmldom";

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

/** A measure's children become beats of one or more slots each. */
function beats(measure) {
  const out = [];
  for (const child of Array.from(measure.childNodes)) {
    if (child.nodeType !== 1) continue;
    if (child.localName === "group") {
      const slots = Array.from(child.childNodes)
        .filter((n) => n.nodeType === 1)
        .map(slot);
      out.push({ slots, group: true, link: child.getAttribute("link") === "true" });
    } else if (child.localName === "note" || child.localName === "rest") {
      out.push({ slots: [slot(child)], group: false, link: false });
    }
  }
  return out;
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
  }));

  // Sections in the order <structure> lays them out. A <repeat> contributes the
  // sections it wraps; the repeat itself prints nothing (see "Repeat brackets").
  const sections = [];
  const collect = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType !== 1) continue;
      if (child.localName === "section")
        sections.push({ id: child.getAttribute("id"), name: child.getAttribute("name") });
      else if (child.localName === "repeat") collect(child);
    }
  };
  collect(el(score, "structure"));

  // part id -> section id -> lines
  const music = {};
  for (const pd of els(score, "part-data")) {
    const partId = pd.getAttribute("part");
    music[partId] = {};
    for (const ref of els(pd, "section-ref")) {
      music[partId][ref.getAttribute("section")] = els(ref, "line").map((line) => ({
        number: Number(line.getAttribute("number")),
        measures: els(line, "measure").map((m) => ({
          number: Number(m.getAttribute("number")),
          beats: beats(m),
        })),
      }));
    }
  }

  return {
    version: score.getAttribute("version"),
    namespace: score.namespaceURI,
    title: text(el(header, "title")),
    composer: text(el(header, "composer")),
    lyricist: text(el(header, "lyricist")),
    arranger: text(el(header, "arranger")),
    parts,
    sections,
    music,
  };
}
