// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Bow and parenthesis spans, drawn once every line they touch has already
// been placed. `notePos`/`rowGeom` come from the renderGridLine() calls
// (grid.mjs) that drew those lines - the section's regular grid, or one
// ending's own grid, each its own scope, since line numbering restarts
// inside an ending.

import { posKey } from "./pos.mjs";

/**
 * @param {object} deps
 * @param {object} deps.pager the pagination cursor - pager.mjs's createPager()
 * @param {object} deps.settings merged renderer settings
 * @returns {{drawParenSpan: Function, drawBowSpan: Function}}
 */
export function createSpanRenderer({ pager, settings: s }) {
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
    pager.pushTo(firstGeom.page, {
      kind: "text",
      x: firstX - step,
      y: firstGeom.top + s.rowHeight / 2 + s.pitchSize / 3,
      text: "(",
      size: s.pitchSize,
      anchor: "middle",
      role: "parenthesis",
      ...dim,
    });
    pager.pushTo(lastGeom.page, {
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
    let firstX = notePos.get(posKey(part.id, span.first));
    let lastX = notePos.get(posKey(part.id, span.last));
    const firstGeom = rowGeom.get(`${part.id}:${span.first.lineIndex}`);
    const lastGeom = rowGeom.get(`${part.id}:${span.last.lineIndex}`);
    if (firstX === undefined || lastX === undefined || !firstGeom || !lastGeom) return;

    // A span that opens and closes around a single note - a bow direction
    // marked on one note rather than a passage - has span.first and
    // span.last resolve to that same note, so firstX and lastX land on the
    // same point. Left alone, the arc below collapses to a zero-width path
    // (a spike, not a curve). Spread it symmetrically around the note by a
    // fixed minimum width instead, so a one-note bow still reads as a small
    // arc rather than a dot.
    if (posKey(part.id, span.first) === posKey(part.id, span.last)) {
      const half = (s.bowMinSpan * s.pitchSize) / 2;
      firstX -= half;
      lastX += half;
    }

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

      pager.pushTo(geom.page, { kind: "arc", x1, x2, y: arcY, rise, role: "bow" });
    }
  };

  return { drawParenSpan, drawBowSpan };
}
