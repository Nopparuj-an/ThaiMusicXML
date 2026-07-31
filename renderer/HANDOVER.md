# Renderer handover

Where the renderer stands and what finishing it involves. Written at the end of
the session that built annotations and link curves; updated at the end of the
session that added pagination and the rest of the features below.

## Progress log

- Session 1: grid, right-anchored beats, group tightening, break scale,
  per-instrument boxes, title band and credits, link curves, annotations,
  `<br>`, text wrapping.
- Session 2: pagination, endings, repeat brackets, bow spans and parentheses,
  lyric rows, and the instrument-name label column. Every item that was on the
  "What is left" list is implemented; see below for what is still worth
  treating as a first pass rather than a settled convention.

## Working practice

- **Do not auto-commit.** Stage, then let the author review. They commit and
  amend themselves.
- The author owns every musical and visual decision and judges output rather
  than code. Ask for a printed reference rather than guessing at a convention.
  Both link-curve corrections and both break-spacing corrections came from them
  comparing a render to print, and each one was a real defect.
- English first, per `AGENTS.md`. `CLAUDE.md` is a symlink to it, and the Edit
  tool refuses to write through the symlink.
- `npm run check` runs links, corpus, and 25 unit tests. `npx astro build`
  instead of `astro check`, which is broken here.
- Schema and design changes need explicit sign-off before editing, then get
  applied across every affected file in one pass.

### Rendering something to look at

```
node renderer/render.mjs renderer/examples/khaek-borathes.txml /tmp/out.svg
```

A score spanning more than one page writes `/tmp/out-1.svg`, `/tmp/out-2.svg`,
and so on instead of `/tmp/out.svg` — check `stderr` for the names actually
written rather than assuming the one you asked for exists.

Then convert and crop to inspect, since reading an SVG tells you nothing about
whether it looks right:

```js
sharp(file, { density: 150 }).extract({ left, top, width, height }).png()
```

`density: 150` gives 2.083 px per point. To find something, grep the SVG for its
coordinates first and convert, rather than guessing at a crop.

## Shape of the code

Three stages, deliberately separated so a bug has one place to be.

- `parse.mjs` — XML to a plain object tree. No display decisions at all.
- `layout.mjs` — all the arithmetic. This is where the specification lives.
- `draw.mjs` — coordinates to SVG. Knows nothing about music. If it is making a
  decision, that decision is in the wrong file.
- `text.mjs` — width estimation and line breaking, needed because SVG text does
  not wrap.
- `settings.mjs` — every number. Anything the spec does not fix is marked
  `OPEN`, and those are starting points to be judged against print.

The author has retuned `pitchSize`, `rowHeight`, `spread`, and
`groupTightness` by hand. Treat their values as decisions, not defaults.

## What is implemented

Grid and measures, right-anchored beats, group tightening, the four-level break
scale, per-instrument boxes, title band and credits, link curves and arcs,
annotations in all three placements, `<br>`, text wrapping, pagination,
endings, repeat brackets, bow spans and parentheses, lyric rows, and the
instrument-name label column. That is everything `rendering/index.md`
describes except the typeface itself (Sarabun is set in `fontFamily`, but
nothing checks the font is actually installed wherever this runs) and octaves
outside `-1`..`1`, which have no Thai spelling and are left to `glyph()`
falling through to `pitch` unchanged — worth a look if a file ever uses one.

### Invariants worth not rediscovering

- **A beat arrives on its last slot.** The shares before it are the run-up. An
  engraver anchoring beats to their onset produces a grid that looks nearly
  right and lines the wrong notes up.
- **Cell division is max-of-subdivisions summed, not LCM and not even.**
- **Group spacing has a floor**, `minSymbolAdvance`, because a six-column cell
  on a portrait page is already about as wide as a letter. An earlier fix
  clamped the wrong way and silently disabled tightening entirely.
- **A link curve spans the first and last sounding notes across the whole
  stack**, rests skipped. `ฟ - -` under `- ซ ล` sounds ฟ ซ ล, and neither row
  holds both ends. Reading one row at a time gets this wrong, which is what
  `linkSpan`'s tests pin down.

  The attribute sits on a `<group>`, but resolving it reaches all the way out:
  every part sharing the stack, the same `<section-ref>`, the same line, the
  same measure, the same beat. Anything touching link placement has to keep
  that whole chain lined up, and the sibling rows have to be positioned before
  the curve can be drawn. That is why `layout.mjs` places every row of a
  measure first and only then emits curves.
- **Curves go above the notes, never below.** Thai scores do not put them below.
- **Breaks are owed, not spent immediately.** A run of text between two grids
  splits: lines trailing the grid above stay with it, the last line before the
  next grid is that grid's heading, and the break falls at the split. A capped
  spend carries its remainder forward, or the section break vanishes. This is
  now written up in `rendering/index.md` §Text inside a break, which exists
  because getting it wrong produced two separate bugs in two rounds.
- **A page break falls only between grid lines**, per `rendering/index.md`:
  "Do not split one line's part rows across a page: a line's rows belong
  together." `layout()` now returns `{ width, height, cellWidth, pages }`
  instead of a flat `elements` array; `draw()` is unchanged and is called once
  per page. `render.mjs` writes `<name>-1.svg`, `<name>-2.svg`, ... when there
  is more than one page, or the bare output path when there is exactly one, so
  a single-page score's filename is unaffected. Stdout only works for a
  single-page score; a multi-page one to stdout is a hard error, since there is
  nowhere to put a second page.

  A line's height is worked out by laying it out once against a throwaway
  page (`measureLine`, backed by the same `layBoxes` the real drawing pass
  uses) before it is committed to a position, so the fit check and the actual
  height can never disagree. A heading annotation folds the height of the grid
  it introduces into its own fit check (`extra` on `annotationRow`), so the two
  move to a fresh page together rather than stranding the heading at the foot
  of the one before — the page-break version of the same stranding "Text
  inside a break" already had to solve once.
- **Endings, and any per-part grid that is not the section's main one, reuse
  `renderGridLine`** (factored out of the old inline per-line code this
  session) rather than duplicating box/ruling/symbol/curve logic. It takes an
  explicit `lineIndex`; endings always pass `1` regardless of which of their
  own lines they are on, so `layBoxes`'s "is this the section's first line"
  check for a part's own annotations never fires a second time underneath an
  ending. `measureLine` and pagination both fall out of calling the same
  function rather than needing their own version of it.
- **Bow and parenthesis spans are resolved at parse time** (`resolveSpans` in
  `parse.mjs`), walking a part's `<line>` elements in document order and
  matching `start`/`stop` by a simple open/closed flag — spans "cannot nest or
  overlap" per the element pages, so no stack is needed. What comes out is a
  position (`lineIndex`/`measureIndex`/`beatIndex`/`slotIndex`, all array
  indices into the parsed shape) for each span's first and last note, not
  coordinates — `layout.mjs` resolves those once the lines they fall in have
  actually been placed, since a span can cross a line (and so, now, a page).
  A bow's curve is drawn one segment per line it touches (`drawBowSpan`), with
  a directional tick only at the true start and stop; a parenthesis just
  brackets its two ends (`drawParenSpan`), no segmenting needed since there is
  nothing to draw at a line break.

  **Not resolved**: pass-aware span matching across an `<ending>`. Per
  `<ending>`'s "Spans across an overridden line", a span can open in a
  section-ref's regular lines and close inside an ending's replacement line,
  which needs the pass resolved before matching. This renderer does not
  simulate passes — every `<ending>` prints once, unconditionally, as its own
  detached grid — so spans are matched separately within the regular lines and
  separately within each ending's own lines. A marker an ending leaves
  dangling (its matching `start` sits only in the regular line it replaces)
  is silently unmatched rather than drawn. Rare in practice; worth fixing if a
  real score hits it.
- **Lyric rows are excluded from the subdivision count** (`shares()` only sees
  notated parts) and placed afterward against the columns those parts already
  settled on: one syllable per beat-arrival where the item count matches the
  beat count, or centered as one group across the whole cell where it does
  not. A `<rest>` prints as blank space there, never the notated rows' hyphen.
  Lyric rows also take no part in a stack's link curve, even when `stack` is
  set on the lyric part itself.
- **Instrument names split into two, unrelated defaults, corrected mid-session
  after the first pass got both wrong.** A solo score's name does not stack
  under the title as a centered subtitle any more — it prints in the
  top-right corner, level with the title (`y` shared with the title's own
  push, `x: right`, `anchor: "end"`), and no longer consumes vertical flow, so
  the credits band closed the gap the old subtitle line used to hold. An
  ensemble score's label column now defaults **on** always (`showLabels: s.showLabels ?? !solo`),
  not just when a part is tacet — tacet was the reason labels are load-bearing
  at all, but the author wanted the column on the first line regardless, the
  way a Western score prints names once even when nothing is ever tacet.
  Labels print left of the grid, in the margin, and never change
  `left`/`cellWidth` — "take their width from the margin rather than from the
  eight cells" is taken literally. A label reprints only on the first grid
  line, the first line of a fresh page, or the first line after the row
  lineup changes (`lastLabelRows`/`lastLabelPage` in `layout()`) —
  consecutive lines with the same parts in the same order print nothing.
- **`<instrument-short-name>`** is a new optional element (schema, parse.mjs,
  `part.shortName`) sibling to `<instrument-name>`, added this session because
  the label column has only the page margin to work with and full names
  routinely ran off the physical page edge at the default margin/labelSize
  pairing. The label column prefers it (`r.part.shortName ?? r.part.name`);
  everywhere else — the top-right solo placement included — always uses the
  full `<instrument-name>`, which has room. `stacked-instrument.txml` in the
  corpus now carries short names on both rows as the worked example. The
  default 42pt margin can still be too narrow for a *full* name in the
  top-right corner or a label column on a part with no short name; that
  pairing is still worth revisiting against a printed score, same as before.

## First pass, not settled

Everything above is implemented and checked against `npm run check`, but two
pieces are genuinely a first guess rather than something verified against
print, the way both link-curve rounds and both break-spacing rounds needed a
real comparison to land right:

- **The bow curve's shape.** `in`/`out` direction is drawn as a shallow arc
  (the same primitive the single-row link curve uses) with a short tick at the
  true start and stop pointing down or up, and no tick at a line-break cut.
  The spec's own wording — "a curve with both tips pointing down" / "pointing
  up" — is consistent with more than one actual shape, and this is the one
  that seemed most defensible without a printed reference. `bowTickLength` and
  `bowStroke` in `settings.mjs` are marked `OPEN` for this reason; treat a
  correction here as expected, not a regression.
- **The repeat bracket and its label's exact proportions**
  (`repeatBracketGap`, `repeatBracketDepth`, `repeatLabelSize`), same reason:
  built to the prose description (a bracket in the margin, ticks at top and
  bottom, ซ้ำ or "N ครั้ง" beside it) without a printed score to hold it
  against.

## Loose ends

- **`renderer/examples/*.txml` duplicate the docs markdown** and can drift.
  `CorpusTable.astro` solves the same problem by generating from files;
  pointing the tutorial and example pages at these would close it.
- **Text widths in `text.mjs` are estimates**, not font metrics. They only have
  to be close enough that text does not run off the page. Thai line breaking
  falls back to letters for an unbroken run, which is wrong about where words
  end and would need a dictionary to do properly.
- **Nathap and tuning warning lists** are duplicated between the element pages
  and `check-corpus.mjs`. The author said they would handle it.
- **Endings, repeat brackets, bow/parenthesis spans, lyric rows, labels, and
  pagination are verified by rendering and eyeballing, not by unit tests.**
  The existing `layout.test.mjs` tests are all pure-function tests (`shares`,
  `arrivals`, `linkSpan`, `columnX`) plus the three pagination tests added
  this session, which go through `parse()` + `layout()` on small inline XML
  and assert on `pages`. The same pattern — a tiny inline score, a tiny page
  where useful, assertions on which page or coordinate something landed on —
  would work for `resolveSpans()` and the lyric aligned/centered split too;
  neither is exported from `parse.mjs` yet, which is the first thing that
  would need to change.
