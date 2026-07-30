# Renderer handover

Where the renderer stands and what finishing it involves. Written at the end of
the session that built annotations and link curves.

## Working practice

- **Do not auto-commit.** Stage, then let the author review. They commit and
  amend themselves.
- The author owns every musical and visual decision and judges output rather
  than code. Ask for a printed reference rather than guessing at a convention.
  Both link-curve corrections and both break-spacing corrections came from them
  comparing a render to print, and each one was a real defect.
- English first, per `AGENTS.md`. `CLAUDE.md` is a symlink to it, and the Edit
  tool refuses to write through the symlink.
- `npm run check` runs links, corpus, and 22 unit tests. `npx astro build`
  instead of `astro check`, which is broken here.
- Schema and design changes need explicit sign-off before editing, then get
  applied across every affected file in one pass.

### Rendering something to look at

```
node renderer/render.mjs renderer/examples/khaek-borathes.txml /tmp/out.svg
```

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
annotations in all three placements, `<br>`, and text wrapping.

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

## What is left, in the order I would take it

### 1. Endings

`rendering/index.md` §Variant endings. An `<ending>` renders below the section
it belongs to, not inside the grid: print its `<annotation>` as a heading, then
the replacement lines under it as their own grid, ruled and sized like any
other. `parse.mjs` does not read `<ending>` at all yet. The annotation carries
which instrument and which pass in the author's words; do not generate that
sentence from `pass`.

### 2. Repeat brackets

`rendering/index.md` §Repeat brackets. A `<line-repeat>` is a bracket in the
margin right of the grid, spanning lines `first` through `last`, labelled ซ้ำ.
It sits immediately right of the grid it covers rather than at a fixed margin
position, so it moves with a seven-measure line, and aligns to the longest line
where a span mixes lengths. A bare ซ้ำ means twice and needs no number.

A `<repeat>` in `<structure>` prints nothing. The arranger writes กลับต้น as an
annotation instead. That already works.

### 3. Bow spans and parentheses

Both are zero-duration markers inside a measure or group. `parse.mjs` filters
them out of slots already, so they do not disturb the division, but it also
discards them, so they need reading before they can be drawn. Bow spans sit
above the notes and can cross line breaks.

A linked group carrying a bow puts both curves in the same place. The author
settled this: they overlap, and each is drawn as it would be alone. Do not add
logic to separate them. The combination is rare and the strokes are close
enough in meaning that sharing a space costs a reader nothing.

### 4. Lyric rows

A lyric part carries words rather than beats, so its row is not a measure grid
and does not divide into columns. Check `part.md` for how it aligns.

### 5. Instrument name label column

Small and independent. Off by default and correct that way: an ensemble score
identifies a part by its position in the stack. Turn it on when any part is
tacet somewhere, because a part that omits a `<section-ref>` has no row there
and position stops identifying parts reliably. Labels take their width from the
margin, not from the eight cells.

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
