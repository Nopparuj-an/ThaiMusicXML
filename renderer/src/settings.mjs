// Renderer settings.
//
// The values the specification fixes come from the settings table in
// reference/rendering/index.md. The specification deliberately leaves the
// typographic measurements open, so every number below that it does not state
// is marked OPEN and is a starting point to be judged against a printed score,
// not a value derived from anything.

export const defaults = {
  // A4 portrait in points. OPEN.
  page: { width: 595.28, height: 841.89, margin: 42 },

  // Fixed by "The measure grid": the cell width is the usable width divided by
  // eight whatever a line actually holds.
  measuresPerRow: 8,

  // "A <rest> renders as a hyphen", and the default prints one for every rest
  // in every notated part.
  restGlyph: "-",
  printRests: "all",

  // "Case of romanized pitch letters: uppercase". Thai script is unaffected.
  pitchCase: "upper",

  // "Set a Thai score in Sarabun", with Noto Sans Thai as the stated fallback.
  fontFamily: "Sarabun, 'Noto Sans Thai', sans-serif",

  // OPEN, all of it.
  titleSize: 21,
  instrumentNameSize: 12,
  creditSize: 11,

  // Portrait cells are 64pt wide, and a beat carrying a group of three splits
  // one into six columns rather than four. That is what caps the type: much
  // above this and a dense measure has nowhere to put the extra width.
  pitchSize: 13,
  rowHeight: 25,

  // How much of the cell the run of symbols spans, the rest falling as equal
  // margins either side. OPEN. At 1 the columns divide the whole cell and the
  // margins come to half a column each.
  spread: 0.9,

  // How close a beat's own symbols sit, as a multiple of the type size rather
  // than a fraction of the cell. A group has to read as one fast gesture
  // instead of as separate beats, and the slack that leaves falls to its left
  // because the last symbol is pinned to the arrival.
  //
  // Measuring it in type rather than in columns is what keeps it safe: a cell
  // holding a group of three divides into six columns whatever the page is, so
  // a fixed fraction of a column collides with itself as soon as the type is
  // large or the cell is narrow. Layout clamps this to a full column, so a
  // crowded measure falls back to even spacing instead of overlapping. OPEN.
  groupSpacing: 0.82,

  // From the "Score layout" table. A solo single-row instrument takes no break
  // between lines and a small one between sections. OPEN as measurements.
  gaps: { row: 0, instrument: 8, line: 0, section: 18 },

  titleGap: 26,
  bandGap: 18,
};
