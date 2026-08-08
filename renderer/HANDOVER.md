# Renderer handover

Where the renderer stands and what finishing it involves. Written at the end of
the session that built annotations and link curves; updated at the end of the
session that added pagination and the rest of the features below, and again at
the end of the session that closed the remaining gaps: the one real bug left
(octaves outside the Thai spellings), the two opt-in settings the spec named
but nothing implemented, and unit test coverage for everything Session 2 had
only verified by eyeballing a render; updated again at the end of the session
that replaced the literal นิคหิต/พินทุ octave-mark glyph with a drawn dot, and
again after the section-heading setting was cut back to a plain printed name.

## Progress log

- Session 1: grid, right-anchored beats, group tightening, break scale,
  per-instrument boxes, title band and credits, link curves, annotations,
  `<br>`, text wrapping.
- Session 2: pagination, endings, repeat brackets, bow spans and parentheses,
  lyric rows, and the instrument-name label column. Every item that was on the
  "What is left" list is implemented; see below for what is still worth
  treating as a first pass rather than a settled convention.
- Session 3: an audit against every schema element found one real default-
  behavior bug (octaves outside `-1`..`1` printed a bare, unmarked letter,
  indistinguishable from an exact one), fixed and then revised twice more
  after the author looked at renders of it, ending in a silent clamp; unit
  tests for endings, repeat brackets, bow/parenthesis spans, lyric row
  alignment, and label dedup, which Session 2 had only verified by
  rendering and looking; the two settings-table rows nothing implemented
  (`generateHeadings`, `showHeaderExtras`); `renderer/examples/*.txml` no
  longer duplicates the docs — a docs page now inlines the file itself at
  build time; a parenthesis span's `dim` attribute, parsed since Session 2
  but never actually wired to anything until now; a real bug that dimming
  work turned up, where a span resolving entirely inside one ending's own
  lines silently failed to draw at all; and the bow curve reworked from a
  separate tip-direction tick to the arc's own facing, with its amplitude
  fixed twice more after the author looked at renders of that too.
- Session 4: octave marks no longer render as the literal นิคหิต/พินทุ
  character set by the font. `glyph()` returns `{ text, dot }` and `layout()`
  draws the mark as its own small circle primitive instead of folding it
  into the pitch text — accurate to how a Thai sheet actually marks octave,
  which is a plain dot rather than either of those two orthographic
  diacritics. Rendering-only: the schema, `pitch` grammar, and `octave`
  attribute are unchanged.
- Session 5: `generateHeadings` became `generateSectionName` and lost both the
  ชั้น prefix and the "is there already a heading here" detection — it now
  prints a section's `name`, plainly, for every named section (see below).
  Then a cleanup pass with no behavior in it: `draw.mjs` groups its SVG output
  by `el.kind` rather than by substring-matching the markup it just wrote,
  `pnpm` is the package manager everywhere including inside `package.json`'s
  own `check`, `make check` delegates to that one definition instead of
  keeping a second list of steps that had already fallen a step behind, CI
  runs the unit tests (it never did), and `parse.mjs` finally has its own
  test file.

## Working practice

- **Do not auto-commit.** Stage, then let the author review. They commit and
  amend themselves.
- The author owns every musical and visual decision and judges output rather
  than code. Ask for a printed reference rather than guessing at a convention.
  Both link-curve corrections and both break-spacing corrections came from them
  comparing a render to print, and each one was a real defect.
- English first, per `AGENTS.md`. `CLAUDE.md` is a symlink to it, and the Edit
  tool refuses to write through the symlink.
- `pnpm run check` runs links, corpus, and 72 unit tests — the last of those
  globs `renderer/test/*.test.mjs`, so a new test file needs no script edit.
  `make check` and CI run the same steps. `npx astro build` instead of
  `astro check`, which is broken here.
- Schema and design changes need explicit sign-off before editing, then get
  applied across every affected file in one pass.

### Rendering something to look at

```
node renderer/render.mjs renderer/examples/example-khaek-borathes.txml /tmp/out.svg
```

`renderer/examples/*.txml` are named for where they surface in the docs:
`tutorial1-`/`tutorial2-` for the two tutorial pages, `example-` for
`reference/examples/`. `khaek-borathes-test.txml` is the exception — a dense,
deliberately-overloaded fixture for stress-testing a render by eye during
development, not linked from any doc page and not meant to be.

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
endings, repeat brackets, bow spans and parentheses, lyric rows, the
instrument-name label column, octaves beyond the Thai spellings, and the two
settings the table names but does not default on: a section's `name` printed
as a heading, and header extras (tuning/bpm/license) on the page. That is
everything `rendering/index.md` describes except the typeface itself (Sarabun
is set in `fontFamily`, but nothing checks the font is actually installed
wherever this runs).

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
- **An octave outside `-1`..`1` clamps silently to the nearest Thai mark**
  (`octave="2"` prints identically to `octave="1"`) rather than the bare,
  unmarked letter it used to print before this session, which is where the
  behavior started: Session 3's audit against every schema element found
  that bare letter indistinguishable from an exact octave-0 note, actual
  default behavior violating "Octaves beyond the Thai spellings"' "must not
  pass off a capped spelling as exact." Went through two further rounds
  after that fix landed, both the author's own call after inspecting a
  render rather than something derivable from the prose alone:

  1. A superscript signed digit (`ด⁺²`, `D⁻²`) — unambiguous, but visually
     cramped on a portrait cell's already-tight columns.
  2. The plain nikhahit/pinthu plus a trailing asterisk as a "there is more
     to this note" cue — closer to an ordinary note, satisfies the same
     "must not pass off as exact" sentence, but the author found the
     asterisks made a real sheet *harder* to read across a page than the
     thing they were warning about.
  3. **Current**: the plain mark, no cue at all. `octave` itself stays
     exact and is still what a player reads; only the page's display now
     genuinely does what the spec's sentence says not to. This is a
     considered exception to that sentence, not an oversight, and
     `rendering/index.md` is worth revisiting to say so explicitly if this
     holds up — it currently still reads as a hard "must not".
- **An octave mark is a drawn dot, not the literal นิคหิต/พินทุ character**
  (Session 4). It used to be rendered by appending the actual combining
  character to the pitch text and letting the embedded Sarabun font glyph-
  render it — accurate to the file's spelling, but not to how a Thai music
  sheet actually marks octave: those two characters are real orthographic
  diacritics with their own shape and meaning in running Thai text, not a
  music notation convention, and the author's call was that using them as
  the printed mark was a font-rendering shortcut rather than the accurate
  page.

  `glyph()` (`layout.mjs`) now returns `{ text, dot }` instead of a plain
  string. `dot` is `"above"`, `"below"`, or `null`; `layout()` pushes a
  separate `kind: "dot"` primitive — a small circle, positioned like any
  other primitive rather than measured through font metrics — instead of
  folding the mark into the text run. `draw.mjs` emits it as `<circle>`,
  filed alongside `<text>` in the same fill-only SVG group so `dim` behaves
  identically for both.

  This is rendering-only: the schema, `pitch`-value grammar, and `octave`
  attribute are untouched, and `pitch="ดํ"` is still exactly as valid as
  `pitch="ด" octave="1"` — `glyph()` now has to detect and strip an embedded
  modifier from `pitch` text itself (it previously only ever consulted
  `octave`, so a `pitch="ดํ"` note with no `octave` attribute worked only by
  accident, passing the raw embedded character straight through unstripped).
  Where both are present, the embedded modifier wins, per note.md's
  Conformance rule.

  The dot's size and offset from the baseline (`octaveDotRadius`,
  `octaveDotGapAbove`, `octaveDotGapBelow` in `settings.mjs`) are a first
  pass, not a settled convention, the same as `linkTop`/`bowRise` — worth
  checking against a printed page rather than derived from anything.
- **`generateSectionName` and `showHeaderExtras`** (both `settings.mjs`, both
  `false`) implement the two rows the settings table always documented but
  that had no code path at all: "a renderer may offer to print `name` as a
  section heading" and "a renderer may offer to show [`<tuning>`,
  `<license>`, `<bpm>`]." Both stayed unbuilt because the default is to show
  neither, which the renderer already achieved by simply never parsing
  `<direction>`, `<tuning>`, or `<license>` at all — the gap was the toggle,
  not the default.

  A generated name is spliced into the parsed `<structure>` sequence as an
  ordinary synthetic `annotation`, before `band`/`body` are split out,
  specifically so it flows through the exact same pagination and "text
  inside a break" machinery an author-typed heading does rather than adding
  a second code path next to it. It prints the section's `name` and nothing
  else, for every named section, unconditionally.

  **It used to do more, and the extra was cut in Session 5**: the heading
  combined the ชั้น in force (tracked by walking `<chan>` through the
  structure) with the name, and suppressed itself where the gap ahead of a
  section already held an annotation, on the reasoning that a score with
  headings already annotated should not end up with two. Both went. The
  suppression could not tell an authored heading from an unrelated
  annotation that happened to sit in the same gap, so it fired for the wrong
  reason as often as the right one — and once suppression is gone, "keep it
  off by default" is the whole of the protection against doubled text, which
  is what the setting being `false` already is. Turning it on for a score
  that writes its own headings prints both, by design and by the author's
  call.

  `showHeaderExtras` prints `<tuning>` and `<license>` from `<header>`, and
  `<bpm>` from whichever `<direction>` lands in the title band, as one small
  line under the credits. `<nathap>` is never included even when this is on:
  its own Rendering section says it is not printed, full stop, which is a
  stronger rule than "off by default." **Scoped deliberately**: a `<bpm>`
  inside a later `<direction>` — a tempo change partway through the piece —
  is parsed but is not displayed anywhere, since the spec's own placement
  language ("the title band") only really describes the single-direction-
  before-the-first-section shape every corpus example actually uses. `<chan>` is likewise still parsed onto every `direction`
  item and now read by nothing at all, the ชั้น tracking having been its
  only reader. Worth building if a real score ever puts a second `<bpm>` or
  a `<chan>` change mid-piece and wants it on the page.
- **Every eyeballed-only feature from Session 2 now has unit tests**:
  endings (an ending's own annotation heading, and that it does not
  re-print the section-ref's own annotation underneath it), repeat brackets
  (label text for `times=2` vs. above, and that `times=1` draws nothing),
  bow and parenthesis spans (position resolution at the true start/stop
  rather than a marker's document-order neighbour, one arc per line a bow
  touches with a tick only at the true ends, and that a parenthesis adds no
  extra decoration at a line-break cut), lyric rows (the aligned and
  centered split, and that a lyric `<rest>` is blank rather than the
  notated rows' hyphen), and label dedup (first line, page turn, lineup
  change). `renderer/test/layout.test.mjs` still needed no new exports from
  `parse.mjs` to do it — a bow/parenthesis span is tested by reading
  `parse(doc).music[part][section].bowSpans` straight off `parse()`'s own
  return value rather than calling `resolveSpans()` in isolation.
- **`parse.mjs` has its own tests** (`renderer/test/parse.test.mjs`, Session
  5). It had none before: the layout tests reached through it, and
  `check-corpus.mjs` checks documents against the schema and the prose rules
  rather than checking this reader's reading of them, so nothing pinned the
  tree `parse()` actually returns. Most of the file is `resolveSpans`, which
  is where the state lives — a marker's meaning depends on notes it does not
  sit beside, and on which run of `<line>` elements it is matched within.
  The documented limitations are pinned as tests too, so the day one of them
  is fixed the test that says "silently unmatched" is what fails and asks to
  be rewritten. Same access route as the layout tests: everything goes
  through `parse()`'s return value, and `resolveSpans` stays unexported.
- **The tutorial and example doc pages no longer hand-copy a `.txml` file
  into a fenced code block.** `src/components/ExampleXml.astro` reads the
  named file from `renderer/examples/` at build time (`import.meta.glob`,
  the same pattern `CorpusTable.astro` already used for the corpus) and
  renders it through `astro-expressive-code`'s `<Code>` component, so the
  block on the page is always exactly the file that actually renders.
  Needed adding `astro-expressive-code` as a direct dependency — it was
  already resolvable as a transitive one via `@astrojs/starlight`, this
  just makes importing it from project code legal under pnpm's strict
  linking — and converting the three affected pages from `.md` to `.mdx`,
  since a component only renders inside MDX. This is why the files got
  renamed: `renderer/examples/lao-duang-duen.txml` →
  `tutorial1-hello-world.txml`, `example-song.txml` →
  `tutorial2-file-structure.txml`, `khaek-borathes.txml` →
  `example-khaek-borathes.txml`. The smaller illustrative fragments further
  down each tutorial page (`## Header`, `## Structure`, ...) are still
  hand-written prose excerpts, not derived from the file — only the one
  "complete file" block near the top of each page pulls from disk.
- **A parenthesis span's `dim` now actually dims something.** It was parsed
  since Session 2 (`openParen.dim`/`.mute` in `parse.mjs`) but never read
  anywhere in `layout.mjs` — the attribute existed and did nothing. Dimming
  now covers both the notes the span covers and its own brackets: every
  `role: "symbol"` push inside `renderGridLine()` checks a `dimmed(partId,
  pos)` predicate the caller builds once per section (or once per ending)
  from that scope's own `parenSpans`, using a plain lexicographic compare
  over `{lineIndex, measureIndex, beatIndex, slotIndex}` (`comparePos`) to
  test whether a position falls between a span's `first` and `last`.
  `drawParenSpan()` makes the same `span.dim ?? s.dimParenthesisDefault`
  check directly, since it already has the span in hand. A dimmed element
  gets `dim: true`; `draw.mjs` renders that as an explicit `fill`
  (`s.dimColor`) overriding the text group's default black. `mute` still
  does nothing and is not meant to — it is a playback instruction, and this
  renderer only ever produces static SVG.

  Wiring this up found a real, separate bug: `renderGridLine()`'s ending
  call always passed the constant `lineIndex: 1` (to keep `layBoxes()` from
  re-printing the section-ref's own annotations under the ending), but that
  same `lineIndex` also keys `notePos`/`rowGeom`, which need the ending's
  own *real*, 0-based line index to match what `resolveSpans()` recorded.
  A span opening and closing entirely inside one ending's own lines was
  silently failing to draw at all — `rowGeom.get(partId:0)` returning
  `undefined` when the only entry on record was `partId:1`. Fixed by
  pulling the two concerns apart: `layBoxes()`/`measureLine()` now take an
  explicit `ownAnnotations` option (defaulting to the old `lineIndex === 0`
  everywhere else), and the ending loop passes the real `li` as `lineIndex`
  with `ownAnnotations: false` set explicitly instead of relying on a
  pinned constant to imply both at once.
- **Bow direction is the arc's own facing, not a separate mark at the tip
  — reworked from Session 2's first pass after the author looked at a
  render.** The original reading of "a curve with both tips pointing down/
  up" added a short straight tick at the true start and stop, on top of the
  same shallow dome every direction used. That put two different signals in
  one mark and got flagged on sight: the ticks looked wrong, and asking
  "which way is this bow drawn" secretly meant "which way does the tick
  point", not "which way does the arc bow." `drawBowSpan()` now drops the
  tick entirely and lets direction flip which way the arc itself curves:
  `in` domes up toward the row above (`rise` positive), `out` is that same
  arc mirrored — dipping down toward the row's own notes instead (`rise`
  negative) — with no other difference in how either is drawn. A cut
  mid-span (a bow crossing a page or line break) gets the same facing as
  the rest of its span; there is no longer a separate tip mark to withhold
  there the way the tick version had one.

  Getting the amplitude right took two more rounds after that, both driven
  by the same "looked at a render" loop:
  - The rise used to inherit the *link curve's* clamp
    (`arcY - geom.top - 1`), which for a single-row instrument caps out
    around 3-4pt regardless of any rise setting — the actual reason the
    first arcs looked flat, not that the setting itself was too small. Bow
    spans are no longer clamped to their own row's height at all: a bow
    marks a whole passage, not one beat, and is expected to reach past its
    own row's ruling into the gap above.
  - "out"'s dip used the same tip height as "in" (`linkTop`), which left
    only about 1pt of clearance above the baseline once `bowRise` grew —
    close enough to read as cutting through the note glyphs (and a นิคหิต
    reaching up from one). "out" now anchors to its own, taller `bowTop`
    instead; "in" still uses `linkTop`, unchanged, since that half was
    already confirmed correct and didn't need moving.

  `bowTop`, `bowRise`, and `bowStroke` in `settings.mjs` are still marked
  `OPEN` for this reason; treat a further correction here as expected, not
  a regression. `renderer/examples/spans-and-endings-test.txml` is a
  standing fixture for this exact shape (both directions, one within a
  line and one crossing a line break) — regenerate it via
  `renderer/src/render-doc-image.mjs` rather than re-describing the shape
  from scratch if this needs another look.

  One thing worth remembering about *testing* this: a `<bow type="stop"/>`
  closes on the note immediately before it in document order, not on
  whichever line it happens to sit on. Placed at the very start of a line,
  before that line's first note, the span it closes never actually reaches
  that line at all — it closes on the *previous* line's last note instead.
  A fixture meant to demonstrate a bow crossing a line break needs at least
  one note ahead of the stop marker on the line it is meant to land in, or
  the crossing never happens. This is exactly what the earlier
  `spans-and-endings-test.txml` got wrong the first time it was written.

## First pass, not settled

Everything above is implemented and checked against `npm run check`. The
repeat bracket's proportions (`repeatBracketGap`, `repeatBracketDepth`,
`repeatLabelSize`) were the other item in this section as of Session 2, built
to the prose description without a printed score to hold them against; the
author looked at `spans-and-endings-test.txml`'s rendering of one in Session
3 and confirmed the proportions as they stand, so that one moves to settled.
One piece remains genuinely a first guess rather than something verified
against print, the way both link-curve rounds and both break-spacing rounds
needed a real comparison to land right:

- **The bow curve's shape and amplitude** (`bowTop`, `bowRise`,
  `bowStroke` in `settings.mjs`), covered in detail above. Direction as the
  arc's own facing rather than a tip mark, and the amplitude fix, both came
  from the author looking at a render rather than from the prose alone —
  expect more rounds of this the same way link curves and break spacing
  needed more than one round each to land.

## Loose ends

- **Text widths in `text.mjs` are estimates**, not font metrics. They only have
  to be close enough that text does not run off the page. Thai line breaking
  falls back to letters for an unbroken run, which is wrong about where words
  end and would need a dictionary to do properly.
- **Nathap and tuning warning lists** are duplicated between the element pages
  and `check-corpus.mjs`. The author said they would handle it.
