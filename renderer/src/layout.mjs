// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Score model to positioned elements.
//
// This is where the specification actually lives. Everything that can be wrong
// in a way that still looks plausible is decided here: how a cell divides, and
// where inside it each symbol lands. The drawing stage receives coordinates and
// cannot get the music wrong because it never sees the music.
//
// Output is a flat list of primitives, which makes the whole layout a value
// that can be compared against a stored copy.

import { defaults } from "./settings.mjs";
import { wrapText } from "./text.mjs";

const NIKHAHIT = "ํ"; // octave="1", set above the letter
const PINTHU = "ฺ"; // octave="-1", set below it

// The five ชั้น levels <chan>'s Values table names, for a generated heading.
const CHAN_NAMES = { "0.5": "ครึ่งชั้น", 1: "ชั้นเดียว", 2: "สองชั้น", 3: "สามชั้น", 4: "สี่ชั้น" };

// Lexicographic order over a note's position indices - line, then measure,
// beat, slot - matching the document order resolveSpans() walks a part's
// lines in. Used to test whether a position falls inside a resolved span.
const comparePos = (a, b) =>
  a.lineIndex - b.lineIndex || a.measureIndex - b.measureIndex || a.beatIndex - b.beatIndex || a.slotIndex - b.slotIndex;

// ---------------------------------------------------------------------------
// The subdivision count
// ---------------------------------------------------------------------------

/**
 * Share count per beat for one measure, taken across every part playing it.
 *
 * "Count what each beat needs, taking the largest count across all parts."
 * The counts are summed and the cell divides into that many equal shares, so a
 * four-beat measure carrying one group of two divides into five rather than
 * into four.
 *
 * @param {number[][]} perPart slot counts per beat, one array per part
 * @returns {number[]} shares owed to each beat
 */
export function shares(perPart) {
  const beatCount = Math.max(0, ...perPart.map((b) => b.length));
  return Array.from({ length: beatCount }, (_, i) =>
    Math.max(1, ...perPart.map((b) => b[i] ?? 1)),
  );
}

/**
 * Where each of one part's symbols sits, measured in columns.
 *
 * A cell divides into as many columns as the shares add up to, numbered from 1.
 * Beats anchor to the right: a beat arrives on its last slot, so the shares it
 * holds are the run-up to it and every part's symbol for that beat lands
 * together on the last column of them.
 *
 * A beat carrying several symbols packs them tighter than a whole column apart,
 * so the run reads as one fast gesture rather than as separate beats, and the
 * slack that leaves falls to the left because the last symbol is pinned to the
 * arrival. Two parts subdividing one beat differently therefore meet on the
 * arrival and nowhere else, which is the only alignment the grid promises.
 *
 * Positions are columns rather than page coordinates so that this stays a
 * statement about where the music falls.
 *
 * @param {number[]} shareList output of shares()
 * @param {number[]} slotCounts this part's slot count per beat
 * @param {number} [tightness] how close a beat's own symbols sit, 1 being a
 *   full column apart
 * @returns {number[][]} column position per beat, per slot
 */
export function arrivals(shareList, slotCounts, tightness = 1) {
  let cursor = 0;
  return shareList.map((share, i) => {
    cursor += share;
    const arrival = cursor;
    const k = slotCounts[i] ?? 1;
    if (k === 1) return [arrival];
    const step = (share / k) * tightness;
    return Array.from({ length: k }, (_, j) => arrival - (k - 1 - j) * step);
  });
}

/**
 * Page x for a column position within a cell.
 *
 * The run of symbols centers in the cell rather than filling it, so the margin
 * left of the first symbol matches the one right of the last and the last note
 * clears the barline. Printed scores set it this way.
 */
// The two notes a link curve spans.
//
// A linked beat belongs to the instrument, not to one of its rows, so this
// reads every row of the stack together. Rests are skipped, and what is left is
// ordered by column, which is time order. "ฟ - -" under "- ซ ล" sounds ฟ ซ ล,
// so the run is bounded by ฟ and ล even though neither row holds both ends.
//
// Each row comes in as its slots, the column each slot fell on, and a vertical
// position where smaller is higher up the page. Returns null when fewer than
// two notes sound, since one note is not a run and there is nothing to span.
export function linkSpan(rows) {
  const sounding = [];
  for (const row of rows)
    row.slots.forEach((slot, i) => {
      if (slot.kind === "rest") return;
      sounding.push({ column: row.columns[i], y: row.y });
    });

  if (sounding.length < 2) return null;
  sounding.sort((a, b) => a.column - b.column);
  return { first: sounding[0], last: sounding.at(-1) };
}

export function columnX(column, total, cellLeft, cellWidth, spread) {
  const step = (cellWidth * spread) / total;
  return cellLeft + cellWidth / 2 + (column - (total + 1) / 2) * step;
}

// ---------------------------------------------------------------------------
// Glyphs
// ---------------------------------------------------------------------------

const THAI = /[฀-๿]/;

/** The text a single slot puts on the page. */
export function glyph(slotValue, settings) {
  if (slotValue.kind === "rest")
    return settings.printRests === "none" ? "" : settings.restGlyph;

  // "A <note> in an unpitched part renders its sound string verbatim."
  if (slotValue.sound !== null) return slotValue.sound;

  let pitch = slotValue.pitch ?? "";
  if (!THAI.test(pitch) && settings.pitchCase === "upper") pitch = pitch.toUpperCase();

  // An octave attribute adds the mark the spelling does not already carry.
  // Outside -1..1 there is no Thai spelling to add, so the mark clamps to
  // whichever side it is on rather than growing an extra symbol - the
  // author's call, favoring a plain, readable page over flagging the
  // display as capped. See "Octaves beyond the Thai spellings".
  if (slotValue.octave >= 1) pitch += NIKHAHIT;
  else if (slotValue.octave <= -1) pitch += PINTHU;

  return pitch;
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

/**
 * Lay a parsed score out on a page.
 *
 * @param {object} score output of parse()
 * @param {object} [options] overrides on top of the settings defaults
 */
export function layout(score, options = {}) {
  const s = { ...defaults, ...options };

  // A score longer than one page continues on the next, keeping the same
  // margins and cell width. `activeSink` is whichever page is currently being
  // drawn into; `push` always targets it, so the rest of this function never
  // has to know which page it is on.
  const pages = [[]];
  let page = 0;
  let activeSink = pages[0];
  const push = (el) => activeSink.push(el);
  // For an element whose page was decided earlier - a repeat bracket or a
  // bow span, both drawn only once every line touching them is already laid
  // out and may be several lines, and pages, behind by then.
  const pushTo = (pageIndex, el) => pages[pageIndex].push(el);

  const left = s.page.margin;
  const right = s.page.width - s.page.margin;
  const cellWidth = (right - left) / s.measuresPerRow;

  // A part is drawn only where it actually has music, so a part that omits a
  // section has no row there and the parts below it close the gap.
  const playing = (sectionId) => score.parts.filter((p) => score.music[p.id]?.[sectionId]);

  const solo = score.parts.length === 1;

  // A solo score already carries its instrument name beside the title, so a
  // label column would only repeat it; an ensemble score always gets one,
  // since position in the stack alone cannot be trusted once any part is
  // tacet somewhere and the rows below it move up to close the gap.
  const showLabels = s.showLabels ?? !solo;

  // A label repeats only where it earns its keep: the first grid line, the
  // first one on a fresh page (a reader who just turned the page has lost the
  // run of identical lines behind them), or the first after the row lineup
  // itself changes - which, since nothing else reorders rows, only a tacet
  // part causes. Consecutive lines with the same parts in the same order
  // print nothing, the way a Western score does not repeat a system's names
  // when the instrumentation has not moved.
  let lastLabelRows = null;
  let lastLabelPage = null;

  // Which levels the score actually has. A level with one member is skipped, so
  // the breaks step outward from whichever level survives innermost.
  const instrumentOf = (p) => p.stack ?? `solo:${p.id}`;
  const instrumentCount = new Set(score.parts.map(instrumentOf)).size;
  const anyMultiRow = score.parts.some(
    (p) => p.stack && score.parts.filter((q) => q.stack === p.stack).length > 1,
  );

  const levels = [];
  if (anyMultiRow) levels.push("row");
  if (instrumentCount > 1) levels.push("instrument");
  levels.push("line", "section");

  const gap = {};
  levels.forEach((name, i) => {
    gap[name] = s.gapScale[i] ?? s.gapScale.at(-1);
  });
  for (const name of ["row", "instrument"]) gap[name] ??= 0;

  let y = s.page.margin + s.titleSize;

  // --- Title band ---------------------------------------------------------
  // The title centers at the top. On a solo score the instrument name prints
  // separately in the top-right corner, level with the title rather than
  // stacked under it as a centered subtitle would read - too much like a
  // second header, the way a composer's name would if it were set that way
  // instead of in the credits band. It takes no part in the vertical flow the
  // rest of the band uses, so it does not push the credits down.
  const centre = (left + right) / 2;
  push({
    kind: "text",
    x: centre,
    y,
    text: score.title,
    size: s.titleSize,
    weight: "bold",
    anchor: "middle",
    role: "title",
  });
  if (solo && score.parts[0].name) {
    push({
      kind: "text",
      x: right,
      y,
      text: score.parts[0].name,
      size: s.instrumentNameSize,
      anchor: "end",
      role: "instrument-name",
    });
  }

  // A break is held until something is actually drawn under it, then spent
  // once. Without that, text landing between two grids takes the gap on both
  // sides and a heading like ท่อน ๒ ends up stranded midway between the section
  // it names and the one above. Holding it means the large break falls above
  // the heading and the heading stays with its own grid.
  // What a capped spend does not use stays owed, so a trailing line taking its
  // small break does not swallow the section break behind it.
  let pending = 0;
  const spend = (cap = Infinity) => {
    const taken = Math.min(pending, cap);
    y += taken;
    pending -= taken;
  };

  // --- Pagination -----------------------------------------------------------
  //
  // "Where a section runs past the bottom margin it continues on the next
  // page... Do not split one line's part rows across a page: a line's rows
  // belong together." That rule generalizes to every atomic thing this
  // function places: an annotation block, a blank line, and a grid line each
  // move to a fresh page whole rather than being cut by the bottom margin.
  //
  // `ensureRoom` is checked before the pending break is spent, since spending
  // it is what actually commits the vertical position. The `y > pageTop`
  // guard is what stops a block taller than a whole page from looping forever:
  // once a break has already put it at the top of a fresh page, it is placed
  // there even if it still overflows, because there is nowhere else to put it.
  const pageTop = s.page.margin;
  const pageBottom = s.page.height - s.page.margin;
  const newPage = () => {
    page += 1;
    pages.push([]);
    activeSink = pages[page];
    y = pageTop;
    pending = 0;
  };
  const ensureRoom = (height, cap = Infinity) => {
    if (y > pageTop && y + Math.min(pending, cap) + height > pageBottom) newPage();
  };

  // An annotation prints its three alignments as one line, at the same left,
  // centre and right the grid uses. Plain text arrives as the left one.
  //
  // `extra` folds in the height of whatever this annotation heads, so a
  // heading and the grid it introduces move to a fresh page together rather
  // than leaving the heading stranded at the bottom of the one before.
  // `paginate` is off for a part's own annotation atop an instrument box: that
  // annotation is already inside a block measureLine() sized as a whole, so it
  // must not make its own, separate break.
  const annotationRow = (
    note,
    { heading = false, size = s.annotationSize, role = "annotation", extra = 0, paginate = true } = {},
  ) => {
    // Text wider than the grid wraps rather than running off the page. Each
    // alignment wraps against the full width, so a long one keeps its own edge
    // while the others stay where they are.
    const columns = [
      ["left", note.left, left, "start"],
      ["center", note.center, centre, "middle"],
      ["right", note.right, right, "end"],
    ]
      .filter(([, value]) => value)
      .map(([align, value, x, anchor]) => ({
        align,
        x,
        anchor,
        lines: wrapText(value, size, right - left),
      }));

    const step = size * s.annotationLeading;
    const deepest = Math.max(0, ...columns.map((c) => c.lines.length));
    const cap = heading ? Infinity : s.annotationGap;
    const height = size + Math.max(0, deepest - 1) * step;

    if (paginate) ensureRoom(height + extra, cap);

    // Only a heading takes the whole break. Anything else is trailing the grid
    // above and stays with it.
    spend(cap);

    y += size;
    for (const column of columns)
      column.lines.forEach((line, i) => {
        push({
          kind: "text",
          x: column.x,
          y: y + i * step,
          text: line,
          size,
          anchor: column.anchor,
          role: `${role}-${column.align}`,
        });
      });
    y += Math.max(0, deepest - 1) * step;
    // Whatever comes next belongs with this line, so hold a small break, or
    // whatever is still owed if that is larger.
    pending = Math.max(pending, s.annotationGap);
  };

  // A <br> is worth one blank line, the way it is in a text document.
  const blankLine = () => {
    const height = s.annotationSize + s.annotationGap;
    ensureRoom(height);
    spend();
    y += height;
  };

  // "A renderer may offer to generate a heading from name and the ชั้น in
  // force for a score whose annotations are sparse" - off by default, and
  // only where the gap ahead of a section is genuinely empty. Any authored
  // annotation there, found by walking back to the previous section or the
  // start of the document, already serves as that section's heading, so
  // "keep it off by default, or a score with headings already annotated
  // ends up with two" is applied gap by gap rather than to the whole score
  // at once.
  const structure = (() => {
    if (!s.generateHeadings) return score.structure;

    const hasHeading = (index) => {
      for (let j = index - 1; j >= 0; j--) {
        if (score.structure[j].kind === "annotation") return true;
        if (score.structure[j].kind === "section") return false;
      }
      return false;
    };

    const out = [];
    let chan = null;
    score.structure.forEach((item, index) => {
      if (item.kind === "direction" && item.chan) chan = item.chan;
      if (item.kind === "section" && item.name && !hasHeading(index)) {
        const chanName = CHAN_NAMES[chan];
        out.push({
          kind: "annotation",
          left: chanName ? `${chanName} ${item.name}` : item.name,
          center: null,
          right: null,
        });
      }
      out.push(item);
    });
    return out;
  })();

  // Annotations before the first section belong to the title band. Everything
  // from the first section on is the body, where an annotation renders in the
  // gap it sits in.
  const firstSection = structure.findIndex((item) => item.kind === "section");
  const band = firstSection === -1 ? structure : structure.slice(0, firstSection);
  const body = firstSection === -1 ? [] : structure.slice(firstSection);

  // Credits print exactly as written and the renderer prefixes nothing, so a
  // label like ผู้ประพันธ์ : is there only because the arranger typed it. The
  // align values do the positioning, which is what puts the composer on the
  // right in the conventional layout. Bare text centers.
  pending = s.annotationGap;
  for (const value of [score.composer, score.lyricist, score.arranger]) {
    if (!value) continue;
    annotationRow(value, { size: s.creditSize, role: "credit" });
  }

  let bandDrew = false;

  // "A renderer may offer to show them, but no printed convention places
  // them" - <tuning> and <license> from <header>, and <bpm> from whichever
  // <direction> falls in the title band (a later one, changing tempo partway
  // through the score, is left to the reading order it already has - see
  // HANDOVER.md). <nathap> is not offered here at all: its own Rendering
  // section says it is never printed, not an opt-in choice the way these
  // three are.
  if (s.showHeaderExtras) {
    const bandDirection = band.find((item) => item.kind === "direction");
    const extras = [score.tuning, bandDirection?.bpm ? `${bandDirection.bpm} bpm` : null, score.license].filter(
      Boolean,
    );
    if (extras.length > 0) {
      annotationRow(
        { left: extras.join(" · "), center: null, right: null },
        { size: s.headerExtraSize, role: "header-extra" },
      );
      bandDrew = true;
    }
  }

  for (const item of band) {
    if (item.kind === "br") blankLine();
    else if (item.kind === "annotation") annotationRow(item);
    else continue;
    bandDrew = true;
  }

  // The large break under the header separates it from the music, so it only
  // makes sense where the header is the last thing above the grid. An
  // annotation ending the band is a heading for the section right below it, and
  // keeps the small break it set for itself.
  if (!bandDrew) pending = s.titleGap;

  // --- The grid -----------------------------------------------------------
  //
  // A run of text between two grids splits in two. Lines trailing the grid
  // above belong to it and stay close to it, กลับต้น under the section it
  // returns from being the case this exists for. The last line before the next
  // grid is that grid's heading, and belongs to it. The break between sections
  // falls at the split, so it separates the two blocks rather than pushing
  // either line away from the grid it names.
  const headsNextGrid = (from) => {
    for (let j = from + 1; j < body.length; j++) {
      if (body[j].kind === "section") return true;
      if (body[j].kind === "annotation") return false;
    }
    return false;
  };

  // The first line a heading annotation is about to introduce, so its height
  // can be folded into that annotation's own pagination check. Without this a
  // heading can end up alone at the foot of a page with its grid pushed to the
  // one after, which is the stranding "Text inside a break" exists to avoid,
  // now also possible across a page break.
  const nextLineRows = (from) => {
    for (let j = from + 1; j < body.length; j++) {
      if (body[j].kind === "annotation") return null;
      if (body[j].kind !== "section") continue;
      const section = body[j];
      const parts = playing(section.id);
      if (parts.length === 0) return null;
      const rows = parts
        .map((p) => ({ part: p, line: score.music[p.id][section.id].lines[0] }))
        .filter((r) => r.line);
      return rows.length > 0 ? { rows, section } : null;
    }
    return null;
  };

  // Rows belonging to one instrument are ruled together as a single box. Parts
  // sharing a stack are that instrument's rows; a part without one is an
  // instrument on its own. The break between boxes is what tells a reader
  // where one instrument ends and the next begins.
  //
  // This is the one place box tops and bottoms are worked out, and so also the
  // one place a line's height comes from: measureLine() below calls it against
  // a scratch page to size a line before committing it to a position, and the
  // real drawing pass calls it again to place it for real.
  // `ownAnnotations` defaults from `lineIndex === 0`, which is right for the
  // section's regular lines, but an ending's own grid needs the two ideas
  // pulled apart: `lineIndex` there is the ending's own real line index
  // (0-based, needed so notePos/rowGeom keys line up with what
  // resolveSpans() recorded), while whether to reprint the section-ref's own
  // annotations must stay false regardless, since those belong to the
  // section's regular grid and already printed there. Callers rendering an
  // ending pass `ownAnnotations: false` explicitly rather than relying on the
  // default.
  const layBoxes = (rows, section, lineIndex, gridTop, { ownAnnotations = lineIndex === 0 } = {}) => {
    const boxes = [];
    for (const r of rows) {
      const key = instrumentOf(r.part);
      const open = boxes.at(-1);
      if (open && open.key === key) open.rows.push(r);
      else boxes.push({ key, rows: [r] });
    }

    let boxTop = gridTop;
    for (const box of boxes) {
      // A part's own annotations sit directly on top of that instrument's
      // box, which is where they can only be once instruments are ruled
      // separately. They belong to the section rather than to the line, so
      // they print once, above the first line of it.
      const notes = ownAnnotations
        ? box.rows.flatMap((r) => score.music[r.part.id][section.id].annotations)
        : [];
      if (notes.length > 0) {
        y = boxTop;
        // Clear of the instrument above, where there is one. The first box in
        // a line already has the break that opened it.
        pending = boxTop > gridTop ? s.annotationGap : 0;
        // paginate: false because this annotation is inside a block
        // measureLine() has already sized as a whole; it must not take its
        // own, separate page break.
        for (const note of notes) annotationRow(note, { paginate: false });
        spend(s.annotationGap);
        boxTop = y;
      }

      box.top = boxTop;
      box.rows.forEach((r, i) => {
        r.top = boxTop + i * s.rowHeight;
      });
      box.bottom = boxTop + box.rows.length * s.rowHeight;
      boxTop = box.bottom + gap.instrument;
    }

    return boxes;
  };

  // The height a line would take, worked out by laying it out at the top of a
  // throwaway page and reading off where it ended. Annotation heights do not
  // depend on where the page starts, so the number this returns is exact
  // rather than an estimate.
  const measureLine = (rows, section, lineIndex, boxOptions) => {
    const savedSink = activeSink;
    const savedY = y;
    const savedPending = pending;
    activeSink = [];
    y = 0;
    pending = 0;
    const boxes = layBoxes(rows, section, lineIndex, 0, boxOptions);
    const height = boxes.at(-1).bottom;
    activeSink = savedSink;
    y = savedY;
    pending = savedPending;
    return height;
  };

  const posKey = (partId, pos) => `${partId}:${pos.lineIndex}:${pos.measureIndex}:${pos.beatIndex}:${pos.slotIndex}`;

  // Draws one grid line whole - box ruling, symbols, and link curves - and
  // returns its geometry. `firstOfGroup` is the same first-line-inherits,
  // later-lines-take-gap.line rule the section loop always applied; endings
  // reuse it as a plain multi-line grid of their own.
  //
  // `notePos`/`rowGeom`, when given, record where every notated symbol and
  // row ended up, keyed by part id and this call's `lineIndex`. A bow or
  // parenthesis span reads them back once every line it touches has been
  // drawn, since a span can reach across lines a single call here never sees
  // at once.
  const renderGridLine = (
    rows,
    section,
    lineIndex,
    { firstOfGroup = false, notePos, rowGeom, labels = true, ownAnnotations, dimmed } = {},
  ) => {
    if (!firstOfGroup) pending = gap.line;

    const boxOptions = { ownAnnotations };
    ensureRoom(measureLine(rows, section, lineIndex, boxOptions));
    spend();

    const measureCount = Math.max(...rows.map((r) => r.line.measures.length));
    const gridRight = left + measureCount * cellWidth;
    const gridTop = y;

    const boxes = layBoxes(rows, section, lineIndex, gridTop, boxOptions);
    const gridBottom = boxes.at(-1).bottom;

    // A line shorter than eight measures is left-aligned and its ruling
    // stops after the last measure rather than stretching to fill the row.
    for (const box of boxes) {
      push({ kind: "line", x1: left, y1: box.top, x2: gridRight, y2: box.top });
      push({ kind: "line", x1: left, y1: box.bottom, x2: gridRight, y2: box.bottom });
      for (let m = 0; m <= measureCount; m++) {
        const mx = left + m * cellWidth;
        push({ kind: "line", x1: mx, y1: box.top, x2: mx, y2: box.bottom });
      }
      for (let r = 1; r < box.rows.length; r++) {
        const ry = box.top + r * s.rowHeight;
        push({ kind: "line", x1: left, y1: ry, x2: gridRight, y2: ry });
      }
    }

    // Labels take their width from the margin, not from the eight cells, so
    // they print left of the grid rather than moving it. Not offered for an
    // ending's own grid, which is already unambiguous - its heading names the
    // part - so a label would only repeat what the annotation already said.
    if (labels && showLabels) {
      const rowParts = rows.map((r) => r.part.id);
      const changed =
        page !== lastLabelPage ||
        !lastLabelRows ||
        rowParts.length !== lastLabelRows.length ||
        rowParts.some((id, i) => id !== lastLabelRows[i]);

      if (changed) {
        for (const r of rows) {
          // The label column has only the page margin to work with, so a
          // short name takes precedence where the part has one.
          const label = r.part.shortName ?? r.part.name;
          if (!label) continue;
          push({
            kind: "text",
            x: left - s.labelGap * s.pitchSize,
            y: r.top + s.rowHeight / 2 + s.labelSize / 3,
            text: label,
            size: s.labelSize,
            anchor: "end",
            role: "label",
          });
        }
        lastLabelRows = rowParts;
        lastLabelPage = page;
      }
    }

    if (rowGeom)
      for (const r of rows) {
        if (r.part.type === "lyric") continue;
        rowGeom.set(`${r.part.id}:${lineIndex}`, { top: r.top, left, right: gridRight, page });
      }

    // Symbols. The share count is worked out for the measure as a whole so
    // that beat positions line up vertically across every part playing it.
    // A lyric row takes no part in it - "Lyric rows take no part in the
    // subdivision count" - so it is excluded here and placed afterward
    // against the columns the notated rows already settled on.
    for (let m = 0; m < measureCount; m++) {
      const cellLeft = left + m * cellWidth;

      const perPart = rows
        .filter((r) => r.part.type !== "lyric")
        .map((r) => (r.line.measures[m]?.beats ?? []).map((b) => b.slots.length));
      const shareList = shares(perPart);
      const total = shareList.reduce((a, b) => a + b, 0);

      // Pack a beat's symbols as tightly as the type allows. The wanted
      // fraction of a column is the target; the legibility floor wins where a
      // crowded measure has made columns narrower than the letters standing
      // in them, which is what a group of three does on a portrait page.
      const columnWidth = (cellWidth * s.spread) / total;
      const floor = (s.minSymbolAdvance * s.pitchSize) / columnWidth;
      const tightness = Math.min(1, Math.max(s.groupTightness, floor));

      const x = (column) => columnX(column, total, cellLeft, cellWidth, s.spread);

      // One arrival column per beat: where a lyric measure's item count
      // matches, syllable i sits exactly where a plain note on beat i would.
      const beatArrivals = arrivals(shareList, shareList.map(() => 1)).map((c) => c[0]);

      // Place every row before drawing anything, because a link curve on one
      // row has to know where another row's symbols ended up.
      const placed = rows.map((r) => {
        const measure = r.line.measures[m];
        if (!measure) return null;
        if (r.part.type === "lyric") {
          return { part: r.part, measure, lyric: true, baseline: r.top + s.rowHeight / 2 + s.lyricSize / 3 };
        }
        return {
          part: r.part,
          measure,
          columns: arrivals(
            shareList,
            measure.beats.map((b) => b.slots.length),
            tightness,
          ),
          baseline: r.top + s.rowHeight / 2 + s.pitchSize / 3,
        };
      });

      for (const row of placed) {
        if (!row) continue;

        if (row.lyric) {
          // "A lyric measure holding exactly as many items as the measure
          // has beats renders one item per beat... Any other number renders
          // as a single group centered in the cell." A <rest> is เอื้อน and
          // prints as blank space, never the notated rows' hyphen.
          const items = row.measure.items;
          const n = items.length;
          if (n === 0) continue;
          const aligned = n === beatArrivals.length;
          const at = (i) =>
            aligned ? x(beatArrivals[i]) : columnX(i + 1, n, cellLeft, cellWidth, s.spread);
          items.forEach((item, i) => {
            if (item.kind !== "syllable") return;
            push({
              kind: "text",
              x: at(i),
              y: row.baseline,
              text: item.text,
              size: s.lyricSize,
              anchor: "middle",
              role: "lyric",
            });
          });
          continue;
        }

        row.measure.beats.forEach((beat, beatIndex) => {
          beat.slots.forEach((slotValue, slotIndex) => {
            const symbolX = x(row.columns[beatIndex][slotIndex]);
            if (notePos) notePos.set(posKey(row.part.id, { lineIndex, measureIndex: m, beatIndex, slotIndex }), symbolX);
            const text = glyph(slotValue, s);
            if (!text) return;
            const dim = dimmed?.(row.part.id, { lineIndex, measureIndex: m, beatIndex, slotIndex });
            push({
              kind: "text",
              x: symbolX,
              y: row.baseline,
              text,
              size: s.pitchSize,
              anchor: "middle",
              role: "symbol",
              ...(dim ? { dim: true } : {}),
            });
          });
        });
      }

      // Link curves, once the symbols they join are positioned. A lyric row
      // has no beats to link and takes no part in an instrument's link
      // curve either, even where it shares a stack.
      for (const row of placed) {
        if (!row || row.lyric) continue;
        row.measure.beats.forEach((beat, beatIndex) => {
          if (!beat.link) return;

          // The gesture is whatever the instrument sounds on this beat, so
          // read every row of the stack at once rather than a row at a time.
          const stackRows = row.part.stack
            ? placed.filter((o) => o && !o.lyric && o.part.stack === row.part.stack)
            : [row];

          const span = linkSpan(
            stackRows.map((o) => ({
              slots: o.measure.beats[beatIndex]?.slots ?? [],
              columns: o.columns[beatIndex] ?? [],
              y: o.baseline,
            })),
          );
          if (!span) return;

          const top = (note) => note.y - s.linkTop * s.pitchSize;
          const x1 = x(span.first.column);
          const x2 = x(span.last.column);

          if (span.first.y === span.last.y) {
            // A level run, so the curve only has to mark it. It bows above
            // the notes, taking whatever room the row leaves.
            const arcY = top(span.first);
            const rowTop = row.baseline - s.rowHeight / 2 - s.pitchSize / 3;
            push({
              kind: "arc",
              x1,
              x2,
              y: arcY,
              rise: Math.min(s.linkRise * s.pitchSize, arcY - rowTop - 1),
              role: "link",
            });
            return;
          }

          // Across rows the stroke arches over the run. Which way it turns
          // follows from where the two notes fell: a run ending higher up the
          // page leaves the first note upward and comes in flat above the
          // last, and one ending lower leaves flat and turns down. Either way
          // it stays above the notes rather than cutting between them.
          const rising = span.last.y < span.first.y;

          // Step off the first note's centre so the stroke starts at that
          // letter's corner, on the side it departs towards.
          const from = x1 + (rising ? -1 : 1) * s.linkSideStep * s.pitchSize;
          const y1 = top(span.first);
          const y2 = top(span.last);

          push({
            kind: "curve",
            x1: from,
            y1,
            x2,
            y2,
            cx: rising ? from : x2,
            cy: rising ? y2 : y1,
            role: "link",
          });
        });
      }
    }

    y = gridBottom;
    return { gridTop, gridBottom, gridRight, boxes, page };
  };

  // Bow and parenthesis spans, drawn once every line they touch has already
  // been placed. `notePos`/`rowGeom` come from the renderGridLine() calls
  // that drew those lines - the section's regular grid, or one ending's own
  // grid, each its own scope, since line numbering restarts inside an ending.
  const drawParenSpan = (part, span, notePos, rowGeom) => {
    const firstX = notePos.get(posKey(part.id, span.first));
    const lastX = notePos.get(posKey(part.id, span.last));
    const firstGeom = rowGeom.get(`${part.id}:${span.first.lineIndex}`);
    const lastGeom = rowGeom.get(`${part.id}:${span.last.lineIndex}`);
    if (firstX === undefined || lastX === undefined || !firstGeom || !lastGeom) return;

    // "The `(` before its first symbol and a `)` after its last." No further
    // decoration at a line break: unlike a bow, a cued passage does not need
    // a mark saying the span continues, since the brackets at its true ends
    // already say everything a reader needs.
    //
    // Dimming ("showing the span in a less distinct color") is on top of the
    // brackets, not instead of them - the brackets always appear regardless.
    // `dim` overrides the renderer's own default for this one span; the
    // notes themselves are dimmed where renderGridLine() drew them, via the
    // same `span.dim ?? s.dimParenthesisDefault` test.
    const dim = (span.dim ?? s.dimParenthesisDefault) ? { dim: true } : {};
    const step = s.linkSideStep * s.pitchSize;
    pushTo(firstGeom.page, {
      kind: "text",
      x: firstX - step,
      y: firstGeom.top + s.rowHeight / 2 + s.pitchSize / 3,
      text: "(",
      size: s.pitchSize,
      anchor: "middle",
      role: "parenthesis",
      ...dim,
    });
    pushTo(lastGeom.page, {
      kind: "text",
      x: lastX + step,
      y: lastGeom.top + s.rowHeight / 2 + s.pitchSize / 3,
      text: ")",
      size: s.pitchSize,
      anchor: "middle",
      role: "parenthesis",
      ...dim,
    });
  };

  // "Both bow directions render above the notes: `in` as a curve with both
  // tips pointing down, `out` as a curve with both tips pointing up." The
  // direction is the arc's own facing rather than a separate mark at the
  // tip: `in` domes up over the row (tips low, middle high, the same shape a
  // single-row link curve uses), `out` is that arc mirrored about the tips'
  // own height (tips high, middle low) - both entirely above the notes
  // either way. Drawn as one segment per line the span touches; a cut
  // mid-span gets the same facing as the rest of the span, since there is no
  // longer a separate tip mark to withhold there.
  //
  // The exact amplitude is a first pass rather than a settled convention:
  // see HANDOVER.md.
  const drawBowSpan = (part, span, notePos, rowGeom) => {
    const firstX = notePos.get(posKey(part.id, span.first));
    const lastX = notePos.get(posKey(part.id, span.last));
    const firstGeom = rowGeom.get(`${part.id}:${span.first.lineIndex}`);
    const lastGeom = rowGeom.get(`${part.id}:${span.last.lineIndex}`);
    if (firstX === undefined || lastX === undefined || !firstGeom || !lastGeom) return;

    const facesUp = span.direction === "in";
    const magnitude = s.bowRise * s.pitchSize;

    for (let li = span.first.lineIndex; li <= span.last.lineIndex; li++) {
      const geom = rowGeom.get(`${part.id}:${li}`);
      if (!geom) continue;

      const baseline = geom.top + s.rowHeight / 2 + s.pitchSize / 3;
      // "in" ties its tip height to a link curve's (linkTop), the same
      // shape either already uses. "out" needs its own, taller anchor
      // (bowTop) instead of that same height: it dips back down from the
      // tip by the same rise, and doing that from linkTop's height would
      // cut into the note glyphs (and marks like นิคหิต reaching up from
      // one) rather than clearing them.
      const arcY = baseline - (facesUp ? s.linkTop : s.bowTop) * s.pitchSize;
      const x1 = li === span.first.lineIndex ? firstX : geom.left;
      const x2 = li === span.last.lineIndex ? lastX : geom.right;

      // Unclamped, unlike a link curve: a bow marks a whole passage rather
      // than one beat, so it is expected to reach past its own row's ruling
      // into the gap above - that is what makes it read as a span rather
      // than a beat-sized grace mark, and it holds for "out" dipping down
      // toward the baseline just as much as for "in" rising up.
      const rise = facesUp ? magnitude : -magnitude;

      pushTo(geom.page, { kind: "arc", x1, x2, y: arcY, rise, role: "bow" });
    }
  };

  for (let index = 0; index < body.length; index++) {
    const item = body[index];
    if (item.kind === "br") {
      blankLine();
      continue;
    }
    if (item.kind === "direction") continue;
    if (item.kind === "annotation") {
      const heading = headsNextGrid(index);
      let extra = 0;
      if (heading) {
        const next = nextLineRows(index);
        if (next) extra = measureLine(next.rows, next.section, 0);
      }
      annotationRow(item, { heading, extra });
      continue;
    }

    const section = item;
    const parts = playing(section.id);
    if (parts.length === 0) continue;

    const lineCount = Math.max(
      ...parts.map((p) => score.music[p.id][section.id].lines.length),
    );

    // A position is dimmed where a resolved parenthesis span covers it and
    // that span's own `dim` (or, absent that, the renderer's own default)
    // says so. Read straight off the position indices resolveSpans()
    // recorded, so this needs no separate range bookkeeping of its own.
    const isDimmed = (partId, pos) =>
      (score.music[partId]?.[section.id]?.parenSpans ?? []).some(
        (sp) => (sp.dim ?? s.dimParenthesisDefault) && comparePos(sp.first, pos) <= 0 && comparePos(pos, sp.last) <= 0,
      );

    const notePos = new Map();
    const rowGeom = new Map();
    const lineBoxes = [];
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const rows = parts
        .map((p) => ({ part: p, line: score.music[p.id][section.id].lines[lineIndex] }))
        .filter((r) => r.line);
      lineBoxes.push(
        renderGridLine(rows, section, lineIndex, {
          firstOfGroup: lineIndex === 0,
          notePos,
          rowGeom,
          dimmed: isDimmed,
        }),
      );
    }

    for (const p of parts) {
      for (const span of score.music[p.id][section.id].bowSpans) drawBowSpan(p, span, notePos, rowGeom);
      for (const span of score.music[p.id][section.id].parenSpans) drawParenSpan(p, span, notePos, rowGeom);
    }

    // A line repeat prints as a bracket in the margin right of the grid,
    // aligned to the longest line the span covers. Where the covered lines
    // land on more than one page, split into one bracket per page - the same
    // "belongs together but a page break still falls between lines" the
    // grid itself follows.
    for (const lr of section.lineRepeats ?? []) {
      if (lr.times < 2) continue;
      const covered = lineBoxes.slice(lr.first - 1, lr.last);
      if (covered.length === 0) continue;

      const bracketX = Math.max(...covered.map((b) => b.gridRight)) + s.repeatBracketGap * s.pitchSize;
      const depth = s.repeatBracketDepth * s.pitchSize;
      const label = lr.times === 2 ? "ซ้ำ" : `${lr.times} ครั้ง`;

      let runStart = 0;
      for (let i = 1; i <= covered.length; i++) {
        if (i < covered.length && covered[i].page === covered[runStart].page) continue;
        const run = covered.slice(runStart, i);
        const top = run[0].gridTop;
        const bottom = run.at(-1).gridBottom;
        const pageIndex = run[0].page;

        pushTo(pageIndex, { kind: "line", x1: bracketX, y1: top, x2: bracketX, y2: bottom });
        pushTo(pageIndex, { kind: "line", x1: bracketX, y1: top, x2: bracketX - depth, y2: top });
        pushTo(pageIndex, { kind: "line", x1: bracketX, y1: bottom, x2: bracketX - depth, y2: bottom });
        pushTo(pageIndex, {
          kind: "text",
          x: bracketX + 2,
          y: (top + bottom) / 2 + s.repeatLabelSize / 3,
          text: label,
          size: s.repeatLabelSize,
          anchor: "start",
          role: "repeat-label",
        });
        runStart = i;
      }
    }

    // An ending renders below its section, detached from the line(s) it
    // replaces: its own annotation as a heading, then its replacement lines
    // as their own grid. `ownAnnotations: false` is passed explicitly rather
    // than relying on `lineIndex === 0`, since `lineIndex` here is the
    // ending's own real line index - needed so notePos/rowGeom keys line up
    // with the lineIndex resolveSpans() recorded for this ending's spans -
    // and that is genuinely 0 for an ending's first line. Conflating the two
    // used to mean a span opening and closing entirely inside one ending's
    // own lines silently failed to draw at all, since rowGeom was only ever
    // keyed under the pinned constant.
    for (const p of parts) {
      const endings = score.music[p.id][section.id].endings;
      endings.forEach((ending, endingIndex) => {
        if (ending.lines.length === 0) return;

        pending = endingIndex === 0 ? gap.section : gap.line;
        ending.annotations.forEach((note, i) => {
          const extra =
            i === 0 ? measureLine([{ part: p, line: ending.lines[0] }], section, 0, { ownAnnotations: false }) : 0;
          annotationRow(note, { heading: i === 0, extra });
        });

        const isEndingDimmed = (partId, pos) =>
          ending.parenSpans.some(
            (sp) => (sp.dim ?? s.dimParenthesisDefault) && comparePos(sp.first, pos) <= 0 && comparePos(pos, sp.last) <= 0,
          );

        const endingNotePos = new Map();
        const endingRowGeom = new Map();
        ending.lines.forEach((line, li) => {
          renderGridLine([{ part: p, line }], section, li, {
            firstOfGroup: li === 0,
            labels: false,
            ownAnnotations: false,
            notePos: endingNotePos,
            rowGeom: endingRowGeom,
            dimmed: isEndingDimmed,
          });
        });

        for (const span of ending.bowSpans) drawBowSpan(p, span, endingNotePos, endingRowGeom);
        for (const span of ending.parenSpans) drawParenSpan(p, span, endingNotePos, endingRowGeom);
      });
    }

    pending = gap.section;
  }

  return {
    width: s.page.width,
    height: s.page.height,
    cellWidth,
    pages: pages.map((elements) => ({ elements })),
  };
}
