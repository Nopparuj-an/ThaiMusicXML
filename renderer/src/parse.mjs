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
        });
      else if (child.localName === "annotation") {
        const note = annotation(child);
        if (note) structure.push({ kind: "annotation", ...note });
      } else if (child.localName === "br") structure.push({ kind: "br" });
      else if (child.localName === "repeat") collect(child);
    }
  };
  collect(el(score, "structure"));
  const sections = structure.filter((item) => item.kind === "section");

  // part id -> section id -> { annotations, lines }
  const music = {};
  for (const pd of els(score, "part-data")) {
    const partId = pd.getAttribute("part");
    music[partId] = {};
    for (const ref of els(pd, "section-ref")) {
      music[partId][ref.getAttribute("section")] = {
        // Annotations here belong to this part alone, and render above its
        // first row in the section.
        annotations: els(ref, "annotation").map(annotation).filter(Boolean),
        lines: els(ref, "line").map((line) => ({
          number: Number(line.getAttribute("number")),
          measures: els(line, "measure").map((m) => ({
            number: Number(m.getAttribute("number")),
            beats: beats(m),
          })),
        })),
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
    parts,
    sections,
    structure,
    music,
  };
}
