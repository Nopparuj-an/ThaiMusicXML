// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// The layout arithmetic, checked against expectations derived from the
// specification rather than from this renderer's own output.
//
// The two-part cases in "Where the children fall" on the <group> page are
// written as X and O rows, X marking a beat's arrival. Those become assertions
// about which column each symbol lands on, so the tests stay statements about
// where the music falls rather than about page geometry.

import { test } from "node:test";
import assert from "node:assert/strict";
import { shares, arrivals, columnX, linkSpan, layout, glyph, nudge, lyricFitSize } from "../src/layout.mjs";
import { parse } from "../src/parse.mjs";
import { defaults } from "../src/settings.mjs";
import { textReady, textWidth } from "../src/text.mjs";

await textReady();

const near = (actual, expected, note) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${note}: expected ${expected}, got ${actual}`,
  );

const flat = (rows) => rows.flat();

test("a measure of four plain beats divides into four", () => {
  assert.deepEqual(shares([[1, 1, 1, 1]]), [1, 1, 1, 1]);
});

test("a group of two makes a four-beat measure divide into five", () => {
  // "That beat takes two fifths and the other three take one fifth each."
  const shareList = shares([[1, 1, 2, 1]]);
  assert.deepEqual(shareList, [1, 1, 2, 1]);
  assert.equal(
    shareList.reduce((a, b) => a + b, 0),
    5,
  );
});

test("| -  -  - (ม ร ด) | puts the group on the last three of six columns", () => {
  const slots = [1, 1, 1, 3];
  assert.deepEqual(flat(arrivals(shares([slots]), slots)), [1, 2, 3, 4, 5, 6]);
});

test("| (ด ร) ม (ซ ล ท) (ดํ รํ) | divides into eight", () => {
  const slots = [2, 1, 3, 2];
  const shareList = shares([slots]);
  assert.equal(
    shareList.reduce((a, b) => a + b, 0),
    8,
  );
  assert.deepEqual(flat(arrivals(shareList, slots)), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("every beat's last slot lands on the arrival, never its first", () => {
  // Right-anchoring is the rule an engraver used to Western notation gets
  // wrong, so state it directly: the run-up belongs to the beat it leads to.
  const rows = arrivals(shares([[1, 1, 1, 3]]), [1, 1, 1, 3]);
  assert.equal(rows[3].at(-1), 6, "the measure's last symbol is on the last column");
  assert.ok(rows[3][0] > rows[2][0], "the group opens after the previous beat");
});

test("a part playing one note meets a group of three on the arrival", () => {
  // "A part that plays a single note on the grouped beat still gets the full
  // shares for it", and lands level with the group's last symbol.
  const shareList = shares([
    [1, 1, 1, 1],
    [1, 1, 1, 3],
  ]);
  assert.deepEqual(shareList, [1, 1, 1, 3]);

  const plain = arrivals(shareList, [1, 1, 1, 1]);
  const grouped = arrivals(shareList, [1, 1, 1, 3]);

  assert.equal(plain[3][0], 6, "the plain part's fourth note");
  assert.equal(grouped[3].at(-1), 6, "the group's last symbol");
});

test("two against three meet on the arrival and nowhere else", () => {
  const shareList = shares([
    [2, 1, 1, 1],
    [3, 1, 1, 1],
  ]);
  assert.deepEqual(shareList, [3, 1, 1, 1]);

  const two = arrivals(shareList, [2, 1, 1, 1])[0];
  const three = arrivals(shareList, [3, 1, 1, 1])[0];

  assert.equal(two.at(-1), 3, "the pair arrives");
  assert.equal(three.at(-1), 3, "the triple arrives");
  assert.ok(
    !two.slice(0, -1).some((a) => three.slice(0, -1).some((b) => Math.abs(a - b) < 1e-9)),
    "nothing before the arrival coincides",
  );
});

test("tightening a group moves its slack to the left, not its arrival", () => {
  // A group has to read as one gesture rather than as separate beats, which it
  // cannot do while its symbols sit as far apart as the beats around it.
  const shareList = shares([[1, 1, 1, 3]]);
  const loose = arrivals(shareList, [1, 1, 1, 3], 1)[3];
  const tight = arrivals(shareList, [1, 1, 1, 3], 0.6)[3];

  assert.equal(tight.at(-1), loose.at(-1), "the arrival does not move");
  assert.ok(tight[0] > loose[0], "the group's first symbol pulls right");
  assert.ok(
    tight[1] - tight[0] < loose[1] - loose[0],
    "its symbols sit closer than a column apart",
  );
});

test("the run of symbols centers in the cell", () => {
  // Printed scores leave matching margins either side, rather than pushing the
  // last note against the barline.
  const total = 4;
  const first = columnX(1, total, 0, 100, 1);
  const last = columnX(total, total, 0, 100, 1);

  near(first, 100 - last, "margins match");
  near((first + last) / 2, 50, "the run centers on the cell");
  near(columnX(2, total, 0, 100, 1) - first, 25, "columns are evenly spaced");
});

test("a beat no part subdivides still counts as one", () => {
  assert.deepEqual(shares([[], []]), []);
  assert.deepEqual(shares([[1, 1]]), [1, 1]);
});

// Octave marks.
//
// นิคหิต and พินทุ spell exactly three octaves. Outside that range the mark
// clamps to whichever side it is on: octave 2 reads the same as octave 1.
// The author's call, over a distinguishing mark that made the page harder to
// read - see HANDOVER.md.
//
// The mark itself is not drawn as the literal diacritic: glyph() strips
// whichever modifier is present (embedded in pitch, or implied by octave)
// and reports a plain "above"/"below" side instead, which layout() turns
// into a drawn dot. See "Octave marks" in reference/rendering.

const noteSlot = (octave, pitch = "ด") => ({ kind: "note", pitch, sound: null, octave });

test("an octave of -1, 0, or 1 gets a dot on the matching side, with the mark stripped from the text", () => {
  assert.deepEqual(glyph(noteSlot(0), defaults), { text: "ด", dot: null });
  assert.deepEqual(glyph(noteSlot(1), defaults), { text: "ด", dot: "above" });
  assert.deepEqual(glyph(noteSlot(-1), defaults), { text: "ด", dot: "below" });
});

test("an octave beyond -1..1 clamps to the same side as the nearest exact octave", () => {
  assert.deepEqual(glyph(noteSlot(2), defaults), glyph(noteSlot(1), defaults));
  assert.deepEqual(glyph(noteSlot(5), defaults), glyph(noteSlot(1), defaults));
  assert.deepEqual(glyph(noteSlot(-2), defaults), glyph(noteSlot(-1), defaults));
  assert.deepEqual(glyph(noteSlot(-5), defaults), glyph(noteSlot(-1), defaults));
});

test("a pitch spelled with the literal nikhahit/pinthu modifier gets the same dot, with no octave attribute needed", () => {
  assert.deepEqual(glyph(noteSlot(null, "ดํ"), defaults), { text: "ด", dot: "above" });
  assert.deepEqual(glyph(noteSlot(null, "ทฺ"), defaults), { text: "ท", dot: "below" });
});

test("a modifier embedded in pitch wins over a conflicting octave attribute", () => {
  // note.md's Conformance: "When pitch carries a Thai octave modifier, that
  // modifier determines the octave. An octave attribute on the same <note>
  // is ignored." Validators should warn on this combination, but a renderer
  // still has to pick one, and the modifier wins.
  assert.deepEqual(glyph(noteSlot(-1, "ดํ"), defaults), { text: "ด", dot: "above" });
});

// Pitch spelling.
//
// "source" (the default) leaves a note exactly as written, letter case
// aside - see "Which pitch spelling appears" in reference/rendering. Setting
// pitchSpelling re-spells every pitched note into that one spelling
// regardless of the file's own, per "A renderer may offer to display a score
// in a spelling other than the one it is written in".

test("pitchSpelling defaults to leaving a note in its own spelling", () => {
  assert.deepEqual(glyph(noteSlot(0, "ด"), defaults), { text: "ด", dot: null });
  assert.deepEqual(glyph(noteSlot(0, "D"), defaults), { text: "D", dot: null });
  assert.deepEqual(glyph(noteSlot(0, "1"), defaults), { text: "1", dot: null });
});

test("pitchSpelling re-spells a note regardless of which of the three it was written in", () => {
  for (const pitch of ["ด", "D", "d", "1"]) {
    assert.deepEqual(glyph(noteSlot(0, pitch), { ...defaults, pitchSpelling: "thai" }), { text: "ด", dot: null });
    assert.deepEqual(glyph(noteSlot(0, pitch), { ...defaults, pitchSpelling: "letter" }), { text: "D", dot: null });
    assert.deepEqual(glyph(noteSlot(0, pitch), { ...defaults, pitchSpelling: "number" }), { text: "1", dot: null });
  }
});

test("pitchCase still applies to a note re-spelled into letters, same as it does to a note already written as one", () => {
  const settings = { ...defaults, pitchSpelling: "letter", pitchCase: "upper" };
  assert.deepEqual(glyph(noteSlot(0, "ท"), settings), glyph(noteSlot(0, "t"), defaults));
});

test("pitchSpelling re-spelling happens after the octave modifier is stripped to a dot", () => {
  assert.deepEqual(glyph(noteSlot(null, "ดํ"), { ...defaults, pitchSpelling: "number" }), { text: "1", dot: "above" });
});

test("an octave mark renders as a drawn dot primitive, not text", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/1" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1">
        <note pitch="ด" octave="1"/><note pitch="ด" octave="-1"/><note pitch="ด"/>
      </measure></line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const dots = pages[0].elements.filter((el) => el.kind === "dot");
  const symbols = pages[0].elements.filter((el) => el.role === "symbol");

  assert.equal(dots.length, 2, "one dot for the raised note and one for the lowered note, none for the plain one");
  assert.ok(symbols.every((el) => el.text === "ด"), "the mark never ends up in the text itself");

  const [raised, lowered] = dots;
  assert.ok(raised.y < symbols[0].y, "the octave-1 dot sits above its letter's baseline");
  assert.ok(lowered.y > symbols[1].y, "the octave -1 dot sits below its letter's baseline");
  assert.equal(raised.x, symbols[0].x, "the dot centers on its letter");
});

// Link spans.
//
// A <link> span is written into a real document and read back off the laid-out
// page, so these stay statements about which notes the curve joins rather than
// about any one helper's signature. `linkSpan` itself only bounds a set of
// points; the rest-skipping and the reach into a stack's other rows live in
// the span pass, and that is what these exercise.

// One notated part per `rows` entry, each row a string of measure XML. Rows
// sharing a stack are declared adjacent and numbered from 1, as <part>
// requires.
const linkDoc = (rows, { stack = null } = {}) => `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/1" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble>${rows
    .map((_, i) => `<part id="P${i + 1}"${stack ? ` stack="${stack}" row="${i + 1}"` : ""}/>`)
    .join("")}</ensemble>
  ${rows
    .map(
      (measures, i) => `<part-data part="P${i + 1}"><section-ref section="s1">${measures}</section-ref></part-data>`,
    )
    .join("")}
</thai-score>`;

const onLine = (n, measures) => `<line number="${n}">${measures}</line>`;
const onMeasure = (n, body) => `<measure number="${n}">${body}</measure>`;

const links = (doc) =>
  layout(parse(doc))
    .pages.flatMap((page) => page.elements)
    .filter((el) => el.role === "link");

// The x a span's two ends reach, whichever primitive carried them: a level run
// is an "arc" (x1/x2), a run across rows a "curve" (x1/x2 as well).
const ends = (el) => [el.x1, el.x2];

test("linkSpan bounds a set of points by x", () => {
  const span = linkSpan([
    { x: 30, y: 1 },
    { x: 10, y: 0 },
    { x: 20, y: 1 },
  ]);
  assert.deepEqual([span.first.x, span.last.x], [10, 30], "bounded by the outermost, whatever order they arrived in");
  assert.equal(span.first.y, 0, "each end keeps the row it came from");

  const alone = linkSpan([{ x: 10, y: 0 }]);
  assert.deepEqual([alone.first.x, alone.last.x], [10, 10], "one point bounds itself, for the far side of a line break");
  assert.equal(linkSpan([]), null);
});

test("a link span reaches past the beat it opens in", () => {
  // The case a boolean on <group> could not express: two groups under one
  // curve. The span has to end on ล in the second group, not on ม in the first.
  const doc = linkDoc([
    onLine(1, onMeasure(1, `<note pitch="ด"/><link type="start"/><group><note pitch="ร"/><note pitch="ม"/></group><group><note pitch="ซ"/><note pitch="ล"/></group><link type="stop"/><note pitch="ท"/>`)),
  ]);
  const symbols = layout(parse(doc)).pages[0].elements.filter((el) => el.role === "symbol");
  const [drawn] = links(doc);

  assert.equal(links(doc).length, 1);
  const at = (text) => symbols.find((el) => el.text === text).x;
  assert.deepEqual(ends(drawn), [at("ร"), at("ล")], "opens on ร in the first group and closes on ล in the second");
});

test("a span opening inside a group does not reach back over that group's earlier notes", () => {
  // The marker sits where the arranger put it. ด is written before it and
  // stays outside the gesture even though it shares the beat.
  const doc = linkDoc([
    onLine(1, onMeasure(1, `<group><note pitch="ด"/><link type="start"/><note pitch="ร"/></group><note pitch="ม"/><link type="stop"/><note pitch="ซ"/>`)),
  ]);
  const symbols = layout(parse(doc)).pages[0].elements.filter((el) => el.role === "symbol");
  const [drawn] = links(doc);
  const at = (text) => symbols.find((el) => el.text === text).x;

  assert.deepEqual(ends(drawn), [at("ร"), at("ม")]);
  assert.ok(drawn.x1 > at("ด"), "ด is left outside the curve");
});

test("the run is read across a stack's rows, not row by row", () => {
  // Khaek Borathes measure 3. ฟ ซ ล is one gesture the instrument plays, and
  // neither row holds both ends of it: the upper row opens on a rest and the
  // lower row ends on two. A renderer reading one row at a time cannot find
  // this span, and anchoring to the beat's own edges would catch those rests
  // and draw the curve backwards, between two silences.
  const doc = linkDoc(
    [
      onLine(1, onMeasure(1, `<note pitch="ด"/><link type="start"/><group><rest/><note pitch="ซ"/><note pitch="ล"/></group><link type="stop"/><note pitch="ร"/><note pitch="ม"/>`)),
      onLine(1, onMeasure(1, `<note pitch="ด"/><group><note pitch="ฟ"/><rest/><rest/></group><note pitch="ร"/><note pitch="ม"/>`)),
    ],
    { stack: "khong" },
  );
  const drawn = links(doc);
  const symbols = layout(parse(doc)).pages[0].elements.filter((el) => el.role === "symbol");
  const at = (text) => symbols.find((el) => el.text === text).x;

  assert.equal(drawn.length, 1, "the connection is declared on one side only and drawn once");
  assert.equal(drawn[0].kind, "curve", "the two ends sit in different rows, so it arches across");
  assert.equal(drawn[0].x2, at("ล"), "closes on ล in the upper row");
  // The stroke steps off ฟ's centre so it starts at that letter's corner
  // rather than on top of it, and it departs leftward because the run rises.
  assert.ok(
    drawn[0].x1 < at("ฟ") && at("ฟ") - drawn[0].x1 < defaults.pitchSize,
    "opens just off ฟ in the lower row, which no reading of the upper row alone would find",
  );
});

test("a sibling row contributes whole beats, since slot indices do not correspond", () => {
  // The lower row divides the second beat in three where the upper divides it
  // in two. There is no slot the two rows share, so the span reaches every
  // note the lower row plays in the beats it covers.
  const doc = linkDoc(
    [
      onLine(1, onMeasure(1, `<note pitch="ด"/><link type="start"/><group><note pitch="ร"/><note pitch="ม"/></group><link type="stop"/><note pitch="ซ"/><note pitch="ล"/>`)),
      onLine(1, onMeasure(1, `<note pitch="ด"/><group><note pitch="ท"/><note pitch="ล"/><note pitch="ซ"/></group><note pitch="ซ"/><note pitch="ล"/>`)),
    ],
    { stack: "khong" },
  );
  const [drawn] = links(doc);
  const symbols = layout(parse(doc)).pages[0].elements.filter((el) => el.role === "symbol");
  const lower = symbols.filter((el) => el.text === "ท");

  assert.equal(lower.length, 1);
  assert.ok(drawn.x1 <= lower[0].x + 1e-9, "the curve opens on the lower row's first note of that beat");
});

test("without a stack a span marks its own notes and stays level", () => {
  const doc = linkDoc([onLine(1, onMeasure(1, `<link type="start"/><group><note pitch="ด"/><note pitch="ร"/></group><link type="stop"/><note pitch="ม"/><note pitch="ซ"/><note pitch="ล"/>`))]);
  const [drawn] = links(doc);

  assert.equal(drawn.kind, "arc", "a level run gets an arc, not a connector");
  assert.ok(drawn.x2 > drawn.x1);
});

test("a span sounding fewer than two notes draws nothing", () => {
  const one = linkDoc([onLine(1, onMeasure(1, `<link type="start"/><note pitch="ด"/><link type="stop"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/>`))]);
  const none = linkDoc([onLine(1, onMeasure(1, `<link type="start"/><rest/><link type="stop"/><note pitch="ร"/><note pitch="ม"/><note pitch="ซ"/>`))]);

  assert.deepEqual(links(one), [], "one note is not a run");
  assert.deepEqual(links(none), [], "a rest is no attack, so there is nothing to reach");
});

test("a span crossing a line break draws one segment per line", () => {
  const doc = linkDoc([
    onLine(1, onMeasure(1, `<note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><link type="start"/><note pitch="ซ"/>`)) +
      onLine(2, onMeasure(1, `<note pitch="ล"/><link type="stop"/><note pitch="ท"/><note pitch="ดํ"/><note pitch="รํ"/>`)),
  ]);
  const drawn = links(doc);

  assert.equal(drawn.length, 2, "one segment on each line the span touches");
  assert.ok(drawn[0].x2 > drawn[0].x1 && drawn[1].x2 > drawn[1].x1, "neither segment collapses");
});

// Pagination.
//
// "Where a section runs past the bottom margin it continues on the next
// page... Do not split one line's part rows across a page: a line's rows
// belong together." A tiny page height forces a break after one grid line
// without needing a long score to prove it.

const NS = "https://thaimusicxml.anan.ovh/ns/1";

const score = (structureXml) => `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>${structureXml}</structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
    </section-ref>
    <section-ref section="s2">
      <line number="1"><measure number="1"><note pitch="ร"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;

const tinyPage = { page: { width: 595.28, height: 110, marginSide: 20, marginTop: 20, marginBottom: 20 } };

const textsOn = (page) =>
  page.elements.filter((el) => el.kind === "text").map((el) => el.text);

test("a score that fits on one page produces one page", () => {
  const doc = score('<section id="s1" name="s1"/>');
  const { pages } = layout(parse(doc), tinyPage);
  assert.equal(pages.length, 1);
});

test("page.infinite skips pagination: content that would overflow a fixed page stays on one, sized to fit it", () => {
  const doc = score('<section id="s1" name="s1"/><section id="s2" name="s2"/>');
  const infinitePage = { page: { ...tinyPage.page, infinite: true } };

  const paginated = layout(parse(doc), tinyPage);
  assert.equal(paginated.pages.length, 2, "sanity check: this content does overflow the fixed tiny page");

  const { pages, height } = layout(parse(doc), infinitePage);
  assert.equal(pages.length, 1, "infinite mode never breaks to a second page");
  assert.ok(textsOn(pages[0]).includes("ร"), "section 2's note still prints, on the same page");
  assert.ok(
    height > infinitePage.page.height,
    "the returned height grows past the nominal starting value to fit the content",
  );

  const bottom = Math.max(...pages[0].elements.map((el) => (el.kind === "line" ? Math.max(el.y1, el.y2) : el.y)));
  near(height, bottom + infinitePage.page.marginBottom, "the page ends exactly one bottom margin past the content");
});

test("a line too tall for what remains moves whole to the next page", () => {
  const doc = score('<section id="s1" name="s1"/><section id="s2" name="s2"/>');
  const { pages } = layout(parse(doc), tinyPage);

  assert.equal(pages.length, 2, "the second section did not fit and moved on");
  assert.ok(!textsOn(pages[0]).includes("ร"), "section 2's note is not on page 1");
  assert.ok(textsOn(pages[1]).includes("ร"), "it is on page 2 instead");

  // Nothing on the first page was cut by the bottom margin.
  const bottom = tinyPage.page.height - tinyPage.page.marginBottom;
  for (const el of pages[0].elements) {
    const y = el.kind === "line" ? Math.max(el.y1, el.y2) : el.y;
    assert.ok(y <= bottom + 1e-9, `an element at y=${y} sits past the bottom margin`);
  }
});

test("side, top, and bottom margins are independent of one another", () => {
  const doc = score('<section id="s1" name="s1"/>');

  const base = layout(parse(doc), { page: { ...defaults.page, marginSide: 40, marginTop: 40, marginBottom: 40 } });
  const wideSide = layout(parse(doc), { page: { ...defaults.page, marginSide: 80, marginTop: 40, marginBottom: 40 } });
  const tallTop = layout(parse(doc), { page: { ...defaults.page, marginSide: 40, marginTop: 90, marginBottom: 40 } });

  const gridLeft = (laidOut) =>
    Math.min(...laidOut.pages[0].elements.filter((el) => el.kind === "line").map((el) => Math.min(el.x1, el.x2)));
  const titleY = (laidOut) => laidOut.pages[0].elements.find((el) => el.role === "title").y;

  assert.ok(gridLeft(wideSide) > gridLeft(base), "widening the side margin alone pushes the grid in");
  assert.equal(titleY(wideSide), titleY(base), "...without moving the title, which only the top margin controls");

  assert.ok(titleY(tallTop) > titleY(base), "raising the top margin alone pushes the title down");
  assert.equal(gridLeft(tallTop), gridLeft(base), "...without moving the grid left edge, which the side margin controls");
});

test("a heading annotation moves with the grid it introduces", () => {
  // ท่อน 2 heads section s2 per "Text inside a break", so if s2's grid has to
  // move to a fresh page, the heading must go with it rather than being left
  // alone at the foot of the page before.
  const doc = score(
    '<section id="s1" name="s1"/><annotation>ท่อน 2</annotation><section id="s2" name="s2"/>',
  );
  const { pages } = layout(parse(doc), tinyPage);

  const headingPage = pages.findIndex((p) => textsOn(p).includes("ท่อน 2"));
  const gridPage = pages.findIndex((p) => textsOn(p).includes("ร"));

  assert.ok(headingPage > 0, "the heading did not fit trailing section 1");
  assert.equal(headingPage, gridPage, "the heading and its grid share a page");
});

// Repeat brackets.
//
// "line-repeat" only draws a bracket for times >= 2: a bare ซ้ำ for times="2",
// "N ครั้ง" above that, and nothing at all for the default of 1, which is not
// a repeat.

const byRole = (page, role) => page.elements.filter((el) => el.role === role);

test("a line-repeat brackets its range, a bare one reading as ซ้ำ and a longer one as its own count", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>
    <section id="s1" name="s1">
      <line-repeat first="1" last="1" times="2"/>
      <line-repeat first="2" last="2"/>
      <line-repeat first="3" last="4" times="3"/>
    </section>
  </structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      <line number="2"><measure number="1"><note pitch="ร"/></measure></line>
      <line number="3"><measure number="1"><note pitch="ม"/></measure></line>
      <line number="4"><measure number="1"><note pitch="ฟ"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const labels = byRole(pages[0], "repeat-label").map((el) => el.text);

  assert.deepEqual(labels.sort(), ["3 ครั้ง", "ซ้ำ", "ซ้ำ"], "a bare line-repeat is worth two plays, the same as times=2");

  const gridRight = defaults.page.marginSide + (defaults.page.width - 2 * defaults.page.marginSide) / 8;
  for (const el of byRole(pages[0], "repeat-label")) {
    assert.ok(el.x > gridRight, "the bracket sits right of the grid, not inside it");
  }
});

// Variant endings.
//
// An ending renders below its section as its own detached grid, with its own
// annotation as heading. lineIndex is pinned to 1 when an ending draws so
// that a part's own section-ref annotation - which only prints when
// layBoxes() sees lineIndex 0 - cannot fire a second time underneath it.

test("an ending prints its own heading and grid below the section, without repeating the part's own annotation", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>
    <repeat times="2">
      <section id="s1" name="s1"/>
    </repeat>
  </structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <annotation>คำอธิบาย</annotation>
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      <ending pass="2">
        <annotation>จบครั้งที่ ๒</annotation>
        <line number="1"><measure number="1"><note pitch="ล"/></measure></line>
      </ending>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const texts = textsOn(pages[0]);

  const partAnnotationCount = texts.filter((t) => t === "คำอธิบาย").length;
  assert.equal(partAnnotationCount, 1, "the section-ref annotation prints once, not once per ending too");

  assert.ok(texts.includes("จบครั้งที่ ๒"), "the ending's own annotation prints as its heading");
  assert.ok(texts.includes("ด") && texts.includes("ล"), "both the section's note and the ending's replacement note print");

  const mainNoteY = byRole(pages[0], "symbol").find((el) => el.text === "ด").y;
  const endingNoteY = byRole(pages[0], "symbol").find((el) => el.text === "ล").y;
  assert.ok(endingNoteY > mainNoteY, "the ending's grid sits below the section's own grid");
});

test("two parts sharing the same ending print its heading once and rule one combined grid, not one per part", () => {
  // Regression: the endings loop used to run once per part, each iteration
  // printing that part's own copy of the heading and drawing its own
  // detached grid - so two parts with the same ending looked like two
  // separate little sections stacked underneath each other.
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>
    <repeat times="2">
      <section id="s1" name="s1"/>
    </repeat>
  </structure>
  <ensemble>
    <part id="P1"/>
    <part id="P2"/>
  </ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      <ending pass="2">
        <annotation>ลง</annotation>
        <line number="1"><measure number="1"><note pitch="ล"/></measure></line>
      </ending>
    </section-ref>
  </part-data>
  <part-data part="P2">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ร"/></measure></line>
      <ending pass="2">
        <annotation>ลง</annotation>
        <line number="1"><measure number="1"><note pitch="ซ"/></measure></line>
      </ending>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const texts = textsOn(pages[0]);

  assert.equal(texts.filter((t) => t === "ลง").length, 1, "the shared heading prints once, not once per part");

  const endingNotes = byRole(pages[0], "symbol").filter((el) => el.text === "ล" || el.text === "ซ");
  assert.equal(endingNotes.length, 2, "both parts' replacement notes still print");
  // Two un-stacked parts on one combined grid sit exactly one rowHeight apart
  // (gap.instrument is 0 for a two-instrument ensemble at the default
  // gapScale). Stacked as two separate detached grids instead, they would be
  // a heading's worth of annotation plus a section-sized gap apart.
  near(
    Math.abs(endingNotes[1].y - endingNotes[0].y),
    defaults.rowHeight,
    "both parts' ending rows sit one rowHeight apart on a single combined grid",
  );
});

// Bow and parenthesis spans.

test("a bow span crossing a line resolves to the notes at its true start and stop, not the markers' neighbours", () => {
  // Start falls before ด, stop falls before ฟ (after ม), so the span is
  // ด..ม even though ฟ is the next note written after the stop marker.
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1">
        <measure number="1">
          <bow type="start" direction="in"/>
          <note pitch="ด"/>
          <note pitch="ร"/>
        </measure>
      </line>
      <line number="2">
        <measure number="1">
          <note pitch="ม"/>
          <bow type="stop"/>
          <note pitch="ฟ"/>
        </measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>`;
  const spans = parse(doc).music.P1.s1.bowSpans;

  assert.equal(spans.length, 1);
  assert.equal(spans[0].direction, "in");
  assert.deepEqual(spans[0].first, { lineIndex: 0, measureIndex: 0, beatIndex: 0, slotIndex: 0 });
  assert.deepEqual(spans[0].last, { lineIndex: 1, measureIndex: 0, beatIndex: 0, slotIndex: 0 });
});

test("a bow span crossing a line break draws one arc per line, same facing on every segment", () => {
  const crossingScore = (direction) => `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1">
        <measure number="1">
          <bow type="start" direction="${direction}"/>
          <note pitch="ด"/>
        </measure>
      </line>
      <line number="2">
        <measure number="1">
          <note pitch="ร"/>
          <bow type="stop"/>
        </measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>`;

  // "in": regression coverage for a real fixture bug caught this session -
  // a <bow type="stop"/> placed before any note in its own line closes on
  // the *previous* line's last note (per "true start and true stop, not
  // the marker's neighbours"), so a span meant to cross a line break needs
  // at least one note ahead of the stop marker on the line it lands in, or
  // it never actually reaches that line at all.
  const inArcs = byRole(layout(parse(crossingScore("in"))).pages[0], "bow");
  assert.equal(inArcs.length, 2, "one arc segment per line the span touches");
  for (const arc of inArcs) assert.ok(arc.rise > 0, "\"in\" domes up on every segment, cut or not");

  // "out": the same crossing, mirrored. Both segments keep the facing
  // throughout, not just at the segment nearest either true end.
  const outArcs = byRole(layout(parse(crossingScore("out"))).pages[0], "bow");
  assert.equal(outArcs.length, 2, "one arc segment per line here too");
  for (const arc of outArcs) assert.ok(arc.rise < 0, "\"out\" dips on every segment, cut or not");
});

test("bow direction is the arc's own facing, not a separate tip mark: \"in\" domes up, \"out\" is the same arc mirrored", () => {
  const bowScore = (direction) => `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1">
        <measure number="1">
          <bow type="start" direction="${direction}"/>
          <note pitch="ด"/><note pitch="ร"/>
          <bow type="stop"/>
        </measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>`;

  const inArc = byRole(layout(parse(bowScore("in"))).pages[0], "bow")[0];
  const outArc = byRole(layout(parse(bowScore("out"))).pages[0], "bow")[0];

  assert.ok(inArc.rise > 0, "\"in\" domes up: the middle sits above the tips");
  assert.ok(outArc.rise < 0, "\"out\" mirrors it: the middle dips down, toward the row's own notes");
  assert.equal(inArc.rise, -outArc.rise, "same amplitude, opposite facing");

  // No separate tick/direction mark of any kind - the arc's own facing is
  // the whole signal. Only grid ruling (rowHeight-tall verticals) should be
  // among the "line" elements; nothing bow-specific.
  const nonGridLines = layout(parse(bowScore("in")))
    .pages[0].elements.filter((el) => el.kind === "line" && el.x1 === el.x2 && el.y2 - el.y1 !== defaults.rowHeight);
  assert.equal(nonGridLines.length, 0, "no tick or other mark beyond the arc itself");
});

test("a parenthesis span dims its notes and its brackets, on when dim=true or the renderer default is on, off otherwise", () => {
  const parenScore = (dimAttr) => `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1">
        <measure number="1">
          <parenthesis type="start"${dimAttr}/>
          <note pitch="ด"/><note pitch="ร"/>
          <parenthesis type="stop"/>
        </measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>`;

  const undimmed = layout(parse(parenScore(""))).pages[0];
  assert.ok(byRole(undimmed, "symbol").every((el) => !el.dim), "no dim by default, no dim attribute");
  assert.ok(byRole(undimmed, "parenthesis").every((el) => !el.dim));

  const explicit = layout(parse(parenScore(' dim="true"'))).pages[0];
  assert.ok(
    byRole(explicit, "symbol").filter((el) => ["ด", "ร"].includes(el.text)).every((el) => el.dim),
    "dim=\"true\" dims every note the span covers",
  );
  assert.ok(byRole(explicit, "parenthesis").every((el) => el.dim), "and both brackets too");

  const byDefault = layout(parse(parenScore("")), { dimParenthesisDefault: true }).pages[0];
  assert.ok(
    byRole(byDefault, "symbol").filter((el) => ["ด", "ร"].includes(el.text)).every((el) => el.dim),
    "the renderer's own default dims a span with no explicit dim attribute at all",
  );

  const overridden = layout(parse(parenScore(' dim="false"')), { dimParenthesisDefault: true }).pages[0];
  assert.ok(
    byRole(overridden, "symbol").filter((el) => ["ด", "ร"].includes(el.text)).every((el) => !el.dim),
    "dim=\"false\" overrides the renderer's own default back off for this one span",
  );
});

test("a span entirely inside a single-line ending still resolves and draws", () => {
  // Regression: renderGridLine() used to pin every ending line to the same
  // constant lineIndex for notePos/rowGeom bookkeeping, which never matched
  // the real, 0-based lineIndex resolveSpans() recorded for a span opening
  // and closing inside the ending's own lines - so it silently failed to
  // draw at all.
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>
    <repeat times="2">
      <section id="s1" name="s1"/>
    </repeat>
  </structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      <ending pass="2">
        <line number="1">
          <measure number="1">
            <parenthesis type="start" dim="true"/>
            <note pitch="ล"/><note pitch="ซ"/>
            <parenthesis type="stop"/>
          </measure>
        </line>
      </ending>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const marks = byRole(pages[0], "parenthesis");

  assert.equal(marks.length, 2, "the ending's own span resolves and draws");
  assert.ok(marks.every((m) => m.dim), "and picks up its dim attribute");
});

test("a parenthesis span crossing a line break brackets only its true ends", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1">
        <measure number="1">
          <parenthesis type="start"/>
          <note pitch="ด"/>
        </measure>
      </line>
      <line number="2">
        <measure number="1">
          <note pitch="ร"/>
          <parenthesis type="stop"/>
        </measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const marks = byRole(pages[0], "parenthesis");

  assert.equal(marks.length, 2, "the true start and true stop only, nothing extra at the line break");
  assert.deepEqual(
    marks.map((m) => m.text).sort(),
    ["(", ")"],
  );
});

// Lyric rows.

test("a lyric measure matching the beat count aligns to the beats' own arrivals", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble>
    <part id="P1"/>
    <part id="P2" type="lyric"/>
  </ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1">
        <measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ฟ"/></measure>
      </line>
    </section-ref>
  </part-data>
  <part-data part="P2">
    <section-ref section="s1">
      <line number="1">
        <measure number="1"><syllable>a</syllable><syllable>b</syllable><syllable>c</syllable><syllable>d</syllable></measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const notes = byRole(pages[0], "symbol");
  const syllables = byRole(pages[0], "lyric");

  assert.equal(syllables.length, 4);
  ["a", "b", "c", "d"].forEach((text, i) => {
    const note = notes[i];
    const syllable = syllables.find((s) => s.text === text);
    near(syllable.x, note.x, `syllable ${text} lines up with beat ${i + 1}`);
  });
});

test("a lyric measure not matching the beat count centers as one group, and a lyric rest is blank rather than a hyphen", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble>
    <part id="P1"/>
    <part id="P2" type="lyric"/>
  </ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1">
        <measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ฟ"/></measure>
      </line>
    </section-ref>
  </part-data>
  <part-data part="P2">
    <section-ref section="s1">
      <line number="1">
        <measure number="1"><syllable>x</syllable><rest/><syllable>z</syllable></measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const syllables = byRole(pages[0], "lyric");

  assert.deepEqual(syllables.map((s) => s.text), ["x", "z"], "the rest contributes no hyphen, just a gap");

  const left = defaults.page.marginSide;
  const cellWidth = (defaults.page.width - 2 * left) / 8;
  const expectedFirst = columnX(1, 3, left, cellWidth, defaults.spread);
  const expectedLast = columnX(3, 3, left, cellWidth, defaults.spread);

  near(syllables[0].x, expectedFirst, "x sits at the first of three evenly centered slots");
  near(syllables[1].x, expectedLast, "z sits at the last of three, skipping the rest's own slot");

  const noteArrival = byRole(pages[0], "symbol")[0].x;
  assert.notEqual(syllables[0].x, noteArrival, "the centered group makes no claim on any beat's arrival");
});

// Fitting words into a cell.

test("boxes already clear of each other are left where they were", () => {
  assert.deepEqual(nudge([10, 30, 50], [4, 4, 4], 1, 0, 100), [10, 30, 50]);
});

test("two boxes in the same place part evenly, each giving half the ground", () => {
  const xs = nudge([20, 20], [4, 4], 2, 0, 100);
  near(xs[0], 17, "the first backs off by half the overlap");
  near(xs[1], 23, "and the second by the other half");
  near(xs[1] - xs[0], 6, "which leaves them exactly the gap apart");
});

test("a run pushed past the cell's edge slides back inside whole", () => {
  const xs = nudge([95, 96], [10, 10], 2, 0, 100);
  near(xs[1] - xs[0], 12, "the spacing survives the slide");
  assert.ok(xs[1] + 5 <= 100 + 1e-9, "the last box ends inside the right edge");
});

test("a run wider than the cell overhangs both edges equally rather than one", () => {
  const xs = nudge([10, 20], [40, 40], 2, 0, 50);
  near((xs[0] + xs[1]) / 2, 25, "what will not fit is centered on the cell");
});

test("the fitted size is the one that fills the cell exactly, gaps and padding included", () => {
  const s = defaults;
  const size = lyricFitSize(["กก", "ขข"], 100, s);
  const used =
    textWidth("กก", size) + textWidth("ขข", size) + s.lyricGap * size + 2 * s.lyricPad * size;
  near(used, 100, "the words, the gap between them and both margins add up to the cell");
  assert.equal(lyricFitSize([], 100, s), Infinity, "a measure with no words constrains nothing");
});

test("syllables too wide for their beats shift apart, and shrink only where shifting cannot save them", () => {
  const words = ["เพราะ", "เสียง", "เพลง", "เพลิน"];
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble>
    <part id="P1"/>
    <part id="P2" type="lyric"/>
  </ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1">
        <measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ฟ"/></measure>
        <measure number="2"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ฟ"/></measure>
      </line>
    </section-ref>
  </part-data>
  <part-data part="P2">
    <section-ref section="s1">
      <line number="1">
        <measure number="1"><syllable>ละ</syllable><syllable>หนอ</syllable><rest/><rest/></measure>
        <measure number="2">${words.map((w) => `<syllable>${w}</syllable>`).join("")}</measure>
      </line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const syllables = byRole(pages[0], "lyric");
  const s = defaults;
  const cellLeft = s.page.marginSide;
  const cellWidth = (s.page.width - 2 * cellLeft) / 8;

  const easy = syllables.filter((t) => !words.includes(t.text));
  assert.equal(easy.length, 2);
  for (const t of easy) assert.equal(t.size, s.lyricSize, "a measure with room keeps the full size");

  const crowded = syllables.filter((t) => words.includes(t.text));
  assert.equal(crowded.length, 4);
  assert.ok(crowded[0].size < s.lyricSize, "the packed measure sets smaller to fit");
  assert.ok(crowded[0].size >= s.lyricMinSize, "but never past the legibility floor");

  // Nothing overlaps and nothing crosses a barline, which is the whole point.
  const half = (t) => textWidth(t.text, t.size) / 2;
  for (const t of syllables) {
    const cell = t.x < cellLeft + cellWidth ? cellLeft : cellLeft + cellWidth;
    assert.ok(t.x - half(t) >= cell - 1e-9, `${t.text} clears the barline on its left`);
    assert.ok(t.x + half(t) <= cell + cellWidth + 1e-9, `${t.text} clears the barline on its right`);
  }
  for (let i = 1; i < crowded.length; i++) {
    const gap = crowded[i].x - half(crowded[i]) - (crowded[i - 1].x + half(crowded[i - 1]));
    assert.ok(gap >= s.lyricGap * crowded[i].size - 1e-9, "neighbouring words keep clear of each other");
  }
});

// Instrument-name labels.

test("a label reprints only on the first line, a fresh page, or a lineup change", () => {
  // P2 has only two lines in this section, so line 3's lineup drops to P1
  // alone - the only thing, short of a page turn, that can change it.
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble>
    <part id="P1"><instrument-name>หนึ่ง</instrument-name></part>
    <part id="P2"><instrument-name>สอง</instrument-name></part>
  </ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      <line number="2"><measure number="1"><note pitch="ร"/></measure></line>
      <line number="3"><measure number="1"><note pitch="ม"/></measure></line>
    </section-ref>
  </part-data>
  <part-data part="P2">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ล"/></measure></line>
      <line number="2"><measure number="1"><note pitch="ท"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  const labels = byRole(pages[0], "label");

  // Line 1: both print (first line). Line 2: same lineup, neither reprints.
  // Line 3: P2 has dropped out, so P1 alone reprints.
  assert.equal(labels.length, 3, "2 on the first line + 0 on the second + 1 on the changed third");
  assert.equal(labels.filter((l) => l.text === "หนึ่ง").length, 2, "P1 prints on line 1 and again on line 3");
  assert.equal(labels.filter((l) => l.text === "สอง").length, 1, "P2 prints only on line 1, never tacet");
});

test("a label reprints on the first line of a fresh page even where the lineup has not changed", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble>
    <part id="P1"><instrument-name>หนึ่ง</instrument-name></part>
    <part id="P2"><instrument-name>สอง</instrument-name></part>
  </ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
      <line number="2"><measure number="1"><note pitch="ร"/></measure></line>
    </section-ref>
  </part-data>
  <part-data part="P2">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ล"/></measure></line>
      <line number="2"><measure number="1"><note pitch="ท"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc), { page: { width: 595.28, height: 170, marginSide: 20, marginTop: 20, marginBottom: 20 } });

  assert.equal(pages.length, 2, "the two-row second line forced a page break");
  assert.equal(byRole(pages[0], "label").length, 2, "both labels print on the first page");
  assert.equal(byRole(pages[1], "label").length, 2, "and both reprint on the fresh page, same lineup or not");
});

test("showLabels: false hides a solo score's top-right instrument name too, not just an ensemble's label column", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure><section id="s1" name="s1"/></structure>
  <ensemble><part id="P1"><instrument-name>หนึ่ง</instrument-name></part></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;

  const shown = layout(parse(doc));
  assert.equal(byRole(shown.pages[0], "instrument-name").length, 1, "prints by default, same as before");

  const hidden = layout(parse(doc), { showLabels: false });
  assert.equal(byRole(hidden.pages[0], "instrument-name").length, 0, "showLabels: false suppresses it");

  const forced = layout(parse(doc), { showLabels: true });
  assert.equal(byRole(forced.pages[0], "instrument-name").length, 1, "showLabels: true still shows it");
});

// Generated headings and header extras: both off by default, opt-in only.

test("generateSectionName is off by default, so a bare section prints no heading at all", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>
    <section id="s1" name="ท่อน 1"/>
  </structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc));
  assert.ok(!textsOn(pages[0]).some((t) => t.includes("ท่อน 1")), "nothing generates the heading unasked");
});

test("generateSectionName prints a section's plain name for every named section, even one that already has an authored annotation", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>
    <section id="s1" name="ท่อน 1"/>
    <annotation>เขียนเอง</annotation>
    <section id="s2" name="ท่อน 2"/>
  </structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
    </section-ref>
    <section-ref section="s2">
      <line number="1"><measure number="1"><note pitch="ร"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc), { generateSectionName: true });
  const texts = textsOn(pages[0]);

  assert.ok(texts.includes("ท่อน 1"), "s1's empty gap gets its plain name printed, with no ชั้น prefix");
  assert.ok(texts.includes("เขียนเอง"), "s2's authored annotation still prints");
  assert.ok(texts.includes("ท่อน 2"), "s2 gets its own name printed too - there is no detection of an existing heading");
});

test("an unrelated annotation sitting directly before a section does not suppress that section's generated name", () => {
  // Regression: hasHeading() used to treat any annotation immediately ahead
  // of a section as though it were that section's own heading, suppressing
  // the generated name even when the annotation was unrelated. Detection is
  // gone now, so the name always prints alongside whatever else is there.
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header><title>ทดสอบ</title></header>
  <structure>
    <annotation>หน้าทับปรบไก่</annotation>
    <section id="s1" name="ท่อน 1"/>
  </structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;
  const { pages } = layout(parse(doc), { generateSectionName: true });
  const texts = textsOn(pages[0]);

  assert.ok(texts.includes("หน้าทับปรบไก่"), "the unrelated annotation still prints where it was written");
  assert.ok(texts.includes("ท่อน 1"), "s1 still gets its own generated name");
});

test("showHeaderExtras is off by default, and prints tuning, bpm, and license but never nathap when on", () => {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="${NS}" version="1.0">
  <header>
    <title>ทดสอบ</title>
    <tuning reference="c-major"/>
    <license>CC BY-SA 4.0</license>
  </header>
  <structure>
    <direction><nathap value="ปรบไก่"/><bpm>90</bpm></direction>
    <section id="s1" name="s1"/>
  </structure>
  <ensemble><part id="P1"/></ensemble>
  <part-data part="P1">
    <section-ref section="s1">
      <line number="1"><measure number="1"><note pitch="ด"/></measure></line>
    </section-ref>
  </part-data>
</thai-score>`;

  const off = layout(parse(doc));
  assert.ok(!textsOn(off.pages[0]).some((t) => t.includes("c-major")), "off by default");

  const on = layout(parse(doc), { showHeaderExtras: true });
  const extra = byRole(on.pages[0], "header-extra-left")[0]?.text;
  assert.ok(extra?.includes("c-major"), "tuning shows when on");
  assert.ok(extra?.includes("90 bpm"), "bpm shows when on");
  assert.ok(extra?.includes("CC BY-SA 4.0"), "license shows when on");
  assert.ok(!extra?.includes("ปรบไก่"), "nathap never shows: its Rendering section forbids it outright");
});
