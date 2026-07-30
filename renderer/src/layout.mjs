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

const NIKHAHIT = "ํ"; // octave="1", set above the letter
const PINTHU = "ฺ"; // octave="-1", set below it

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
  if (slotValue.octave === 1) pitch += NIKHAHIT;
  else if (slotValue.octave === -1) pitch += PINTHU;

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
  const elements = [];

  const left = s.page.margin;
  const right = s.page.width - s.page.margin;
  const cellWidth = (right - left) / s.measuresPerRow;

  // A part is drawn only where it actually has music, so a part that omits a
  // section has no row there and the parts below it close the gap.
  const playing = (sectionId) => score.parts.filter((p) => score.music[p.id]?.[sectionId]);

  const solo = score.parts.length === 1;
  const multiRow = score.parts.some((p) => p.stack);

  let y = s.page.margin + s.titleSize;

  // --- Title band ---------------------------------------------------------
  // The title centers at the top. On a solo score the instrument name sits
  // beside it in a smaller size, which is the default for name labels.
  const centre = (left + right) / 2;
  if (solo && score.parts[0].name) {
    elements.push({
      kind: "text",
      x: centre,
      y,
      text: score.title,
      size: s.titleSize,
      weight: "bold",
      anchor: "middle",
      role: "title",
    });
    elements.push({
      kind: "text",
      x: centre,
      y: y + s.instrumentNameSize + 6,
      text: score.parts[0].name,
      size: s.instrumentNameSize,
      anchor: "middle",
      role: "instrument-name",
    });
    y += s.instrumentNameSize + 6;
  } else {
    elements.push({
      kind: "text",
      x: centre,
      y,
      text: score.title,
      size: s.titleSize,
      weight: "bold",
      anchor: "middle",
      role: "title",
    });
  }

  // Credits print exactly as written. The renderer prefixes nothing.
  for (const [role, value] of [
    ["composer", score.composer],
    ["lyricist", score.lyricist],
    ["arranger", score.arranger],
  ]) {
    if (!value) continue;
    y += s.creditSize + 6;
    elements.push({
      kind: "text",
      x: centre,
      y,
      text: value,
      size: s.creditSize,
      anchor: "middle",
      role,
    });
  }

  y += s.titleGap;

  // --- The grid -----------------------------------------------------------
  const gapBetweenLines = multiRow ? s.gaps.line || s.gaps.instrument : s.gaps.line;

  score.sections.forEach((section, sectionIndex) => {
    const parts = playing(section.id);
    if (parts.length === 0) return;
    if (sectionIndex > 0) y += s.gaps.section;

    const lineCount = Math.max(
      ...parts.map((p) => score.music[p.id][section.id].length),
    );

    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      if (lineIndex > 0) y += gapBetweenLines;

      const rows = parts
        .map((p) => ({ part: p, line: score.music[p.id][section.id][lineIndex] }))
        .filter((r) => r.line);

      const measureCount = Math.max(...rows.map((r) => r.line.measures.length));
      const gridRight = left + measureCount * cellWidth;
      const gridTop = y;
      const gridBottom = y + rows.length * s.rowHeight;

      // A line shorter than eight measures is left-aligned and its ruling
      // stops after the last measure rather than stretching to fill the row.
      elements.push({ kind: "line", x1: left, y1: gridTop, x2: gridRight, y2: gridTop });
      elements.push({
        kind: "line",
        x1: left,
        y1: gridBottom,
        x2: gridRight,
        y2: gridBottom,
      });
      for (let m = 0; m <= measureCount; m++) {
        const x = left + m * cellWidth;
        elements.push({ kind: "line", x1: x, y1: gridTop, x2: x, y2: gridBottom });
      }
      for (let r = 1; r < rows.length; r++) {
        const ry = gridTop + r * s.rowHeight;
        elements.push({ kind: "line", x1: left, y1: ry, x2: gridRight, y2: ry });
      }

      // Symbols. The share count is worked out for the measure as a whole so
      // that beat positions line up vertically across every part playing it.
      for (let m = 0; m < measureCount; m++) {
        const cellLeft = left + m * cellWidth;

        const perPart = rows.map((r) =>
          (r.line.measures[m]?.beats ?? []).map((b) => b.slots.length),
        );
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

        // Place every row before drawing anything, because a link curve on one
        // row has to know where another row's symbols ended up.
        const placed = rows.map((r, rowIndex) => {
          const measure = r.line.measures[m];
          if (!measure) return null;
          return {
            part: r.part,
            measure,
            columns: arrivals(
              shareList,
              measure.beats.map((b) => b.slots.length),
              tightness,
            ),
            baseline:
              gridTop + rowIndex * s.rowHeight + s.rowHeight / 2 + s.pitchSize / 3,
          };
        });

        for (const row of placed) {
          if (!row) continue;
          row.measure.beats.forEach((beat, beatIndex) => {
            beat.slots.forEach((slotValue, slotIndex) => {
              const text = glyph(slotValue, s);
              if (!text) return;
              elements.push({
                kind: "text",
                x: x(row.columns[beatIndex][slotIndex]),
                y: row.baseline,
                text,
                size: s.pitchSize,
                anchor: "middle",
                role: "symbol",
              });
            });
          });
        }

        // Link curves, once the symbols they join are positioned.
        for (const row of placed) {
          if (!row) continue;
          row.measure.beats.forEach((beat, beatIndex) => {
            if (!beat.link) return;

            // The gesture is whatever the instrument sounds on this beat, so
            // read every row of the stack at once rather than a row at a time.
            const stackRows = row.part.stack
              ? placed.filter((o) => o && o.part.stack === row.part.stack)
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
              const y = top(span.first);
              const rowTop = row.baseline - s.rowHeight / 2 - s.pitchSize / 3;
              elements.push({
                kind: "arc",
                x1,
                x2,
                y,
                rise: Math.min(s.linkRise * s.pitchSize, y - rowTop - 1),
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

            elements.push({
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
    }
  });

  return { width: s.page.width, height: s.page.height, cellWidth, elements };
}
