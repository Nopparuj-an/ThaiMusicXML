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
  pitchSize: 12,

  // Tall enough for the single-row link arc to sit under the notes without
  // meeting the rule below, allowing for พินทุ hanging under a letter.
  rowHeight: 22,

  // How much of the cell the run of symbols spans, the rest falling as equal
  // margins either side. OPEN. At 1 the columns divide the whole cell and the
  // margins come to half a column each.
  //
  // This sets the distance between beats, and so also the distance between a
  // beat and the group beside it. It does not reach inside a group, whose
  // symbols are held apart by minSymbolAdvance instead.
  spread: 0.7,

  // The link curve. A group marked link="true" gets one: reaching the other
  // rows of a stacked instrument, or arcing over its own notes where the
  // instrument has only one row. Always above the notes, never below, which is
  // where Thai scores put their curves.
  //
  // All of it OPEN, and all of it a multiple of the type size, so retuning
  // pitchSize carries the curve with it instead of leaving it behind.
  //
  // How far above the baseline a curve attaches. Both kinds share it, so an
  // arc and a connector leaving the same row start at the same height. It has
  // to clear the tallest thing over a letter, which is นิคหิต.
  linkTop: 0.85,

  // How far the connector steps off the first note's centre, so it starts at
  // that letter's corner rather than on top of it. Roughly half a letter.
  linkSideStep: 0.4,

  // How far the single-row arc bows above its own ends. A ceiling rather than a
  // fixed height: a short rowHeight leaves less than this and wins.
  linkRise: 0.45,

  linkStroke: 0.8,

  // How close a beat's own symbols sit, as a multiple of the type size rather
  // than a fraction of the cell. A group has to read as one fast gesture
  // instead of as separate beats, and the slack that leaves falls to its left
  // because the last symbol is pinned to the arrival.
  //
  // How close a beat's own symbols sit, as a fraction of a column. OPEN.
  groupTightness: 0.7,

  // The tightest two symbols may sit, as a multiple of the type size. This is
  // a floor, not a ceiling: a group packs to whichever of the two is looser, so
  // it is as tight as it can be without the letters touching.
  //
  // The floor has to be here because the room available depends on the
  // measure. A cell holding a group of three divides into six columns rather
  // than four, so the same fraction of a column is a much smaller distance,
  // and on a portrait page it is already close to the width of a letter.
  minSymbolAdvance: 0.52,

  // The break at each nesting level, innermost first.
  //
  // Which level draws which value is not fixed, because "Score layout" says to
  // skip any level with only one member and then give the innermost of what is
  // left no break at all, each level outward getting a larger one. So a solo
  // single-row score uses the first two of these and a mixed ensemble uses all
  // four, and the same list produces every arrangement in that table.
  //
  // OPEN as measurements.
  gapScale: [0, 8, 18, 30],

  // Annotations. These are the arranger's own words, so they print at reading
  // size rather than as headings: the renderer is not deciding that a section
  // heading matters more than a note about sound codes. OPEN.
  annotationSize: 11,
  annotationGap: 6,

  // Line spacing where an annotation is long enough to wrap, as a multiple of
  // its type size. OPEN.
  annotationLeading: 1.35,

  titleGap: 26,
  bandGap: 18,
};
