# Tutorial handover

The plan for growing the v0.1 tutorial from two pages to ten, written at the
end of the session that scoped it. The tutorial on disk is still
`1-hello_world.mdx` and `2-file_structure.mdx`, unchanged.

The full multi-instrument transcription of ลาวดวงเดือน now exists as
`renderer/examples/example-lao-duang-duean.txml`. Tutorial cuts are progressive
subsets of it; ฉิ่ง is added to cuts only (not the master) to demonstrate an
unpitched part. Page 5 borrows from แขกบรเทศ instead.

## Why the tutorial is being expanded

Two pages cover twenty-one elements between them. **Twelve elements never
appear in the tutorial at all**: `<group>`, `<bow>`, `<parenthesis>`,
`<ending>`, `<line-repeat>`, `<syllable>`, `<nathap>`, `<br>`, `<arranger>`,
`<lyricist>`, `<license>`, `<instrument-short-name>`. Neither do `stack`/`row`,
`type="lyric"`, or a score with more than one section.
`<instrument-short-name>` is in `tutorial2-file-structure.txml` today with no
explanation anywhere.

Three gaps beyond element coverage:

- **No conceptual orientation.** A newcomer, especially one arriving from
  MusicXML, brings assumptions this format breaks: notes have no duration, a
  rest is not silence, a beat arrives on its last slot, ชั้น is not tempo, the
  renderer generates almost nothing. All of it is in the reference, scattered
  across `group.md`, `bpm.md`, `chan.md`, and `rendering/index.md`. None of it
  is in the tutorial.
- **No tooling page.** Nothing tells a reader how to check their file. The
  RELAX NG schema, `check:corpus`, and the Playground are all built and
  unmentioned.
- **No exit.** Page 2 stops mid-subject on Ching notation, with no link
  onward and no map of where to go next.

The W3C MusicXML tutorial was the reference point. Three things make it work,
and two of them are already this tutorial's shape: every page is one rendered
image, one complete file, then that file explained in pieces; one piece
(*Après un rêve*) runs across several pages so each page is a visible diff; the
last page is a map rather than a lesson. The one not yet done is the running
piece — pages 1 and 2 currently switch from ลาวดวงเดือน to a generic "Example
Song", throwing away the continuity.

## Decisions taken

Settled with the author. Do not reopen these without asking.

- **Ten pages**, in the order below. Existing two keep their filenames and URLs.
- **The running piece is ลาวดวงเดือน**, transcribed in
  `example-lao-duang-duean.txml`. Tutorial cuts are progressive subsets of it.
- **It is สองชั้น.** `tutorial2-file-structure.txml` currently writes
  `<chan value="1"/>`, which the author confirmed is a mistake. The rewrite
  corrects it to `value="2"`. Twoชั้น ฉิ่ง pattern is one stroke per measure,
  alternating ฉิ่ง/ฉับ every measure: `rest, rest, rest, ฉิ่ง(0)` then
  `rest, rest, rest, ฉับ(1)`. ชั้นเดียว completes its cycle every measure:
  `rest, ฉิ่ง(0), rest, ฉับ(1)`.
- **ฉิ่ง is tutorial-only.** Not in the master score; added to cuts once to
  demonstrate an unpitched part.
- **`sound="x"` in khim** stays in the master; tutorial cuts do not mention it.
- **Page 5 uses แขกบรเทศ** for `<group>` and `link` demonstration. The running
  file has groups in the khim parts, but แขกบรเทศ gives richer pedagogical
  examples: 3-child groups with rests inside, 2-note groups, and
  `<group link="true">` across ฆ้องวงใหญ่ R/L rows.
- **`<br>` is in the master score** (spacing the description annotation from the
  direction block), so it is available for tutorial demonstration.
- **Page 3 is titled "The score model."**
- **Page 9 deliberately holds several unrelated features.** It was offered as a
  split into two tighter pages and the author declined; one page of uncommon
  independent things is what is wanted.
- **Metadata in the score:** `<tuning reference="khrueang-sai"/>`,
  `<license>PUBLIC DOMAIN</license>`, lyricist same as composer,
  `<arranger>` "รวบรวมและดัดแปลงจากหลายแหล่ง".
- **English first**, per `AGENTS.md`. Thai follows each batch after the author
  confirms the English.

## What the full score contains

`example-lao-duang-duean.txml` is a complete six-part transcription of
ลาวดวงเดือน covering every feature the tutorial needs. Pages 5 borrows from
แขกบรเทศ for richer `<group>` examples.

| Page | Feature | Where it appears |
| ---- | ------- | ---------------- |
| 4 | Octave marks across a wide range | ระนาดเอก crosses ดํ/รํ in ท่อน 1 |
| 5 | Beats subdivided into two and three | แขกบรเทศ (borrowed) |
| 5 | `<group link="true">` reaching another row | แขกบรเทศ ฆ้องวงใหญ่ R/L |
| 6 | Several sections, and `<repeat>` | ท่อน 1, ท่อน 2, ท่อน 3, all repeated |
| 6 | `<ending pass="2">` | ท่อน 1 ลงเที่ยว 2 in all parts |
| 6 | `<line-repeat>` | ท่อน 2 (line 5), ท่อน 3 (lines 1–2, 4) |
| 7 | `stack`/`row` | ขิม 1/2/3 (`stack="khim"`) |
| 7 | A part that sits out a section | เนื้อร้อง ท่อน 2 lines 2–3 (all rests) |
| 8 | A lyric part (`type="lyric"`, `<syllable>`) | เนื้อร้อง throughout |
| 9 | `<bow>` spans | ซออู้ throughout |
| 9 | `<parenthesis dim="true">` | ระนาดเอก, ซออู้ in ท่อน 2 and 3 |
| 9 | `<nathap>` | `<nathap value="ลาว"/>` |
| 9 | `<br>` | Spacing the description annotation |
| 9 | Credits, tuning, license | Header metadata |

**Part roster**: เนื้อร้อง (lyric), ระนาดเอก, ซออู้, ขิม 1/2/3 stacked. ฉิ่ง is
added to tutorial cuts only, once, to demonstrate an unpitched part. Six rows is
about as tall as a docs image stays legible.

**`<group>` in the running file**: khim1 and khim3 have 2-note groups with
`link="true"` (e.g. `<group link="true"><note pitch="ร"/><note pitch="ด"/></group>`).
Page 5 uses แขกบรเทศ instead for richer examples: 3-child groups with rests
inside, and ฆ้องวงใหญ่ R/L demonstrating link across rows.

## The ten pages

### 1. Hello World — exists, light edit

Keep as is except: move the full pitch table out to page 4, leaving only the
notes ท่อน 1 actually uses. The page currently carries reference material that
slows a first read.

### 2. File Structure — exists, needs rewriting

Same teaching content and same section order, rebuilt on ท่อน 1 of the real
ลาวดวงเดือน plus a ฉิ่ง row, instead of the generic "Example Song" with
seven-measure lines. Corrects `<chan>` to `value="2"`. Gains a closing link to
page 3. Keeps the line/measure numbering rule short and links forward to page 6,
where it becomes load-bearing.

### 3. The score model — new

The orientation page. No full file; short snippets and one diagram. Everything
here exists in the reference already and needs collecting, not inventing.

- A measure is the fixed unit of time, and every part agrees on how many beats
  are in one.
- A note has no duration. It occupies one slot, and the slot is the duration.
- A rest is no attack, not silence. Thai instruments have no notated sustain, so
  a note ringing under a rest is the instrument behaving, not a notation.
- A beat arrives on its **last** slot. This is the one that trips everyone up,
  and it sets up page 5.
- ชั้น is not tempo. `<bpm>` fixes the slot rate and one bpm beat is two slots
  whatever the ชั้น.
- The renderer generates almost nothing. `section/@name`, `<composer>`,
  `<chan>`, `<repeat>` are metadata; what prints is what the arranger typed into
  an `<annotation>` or a credit.

Closes with a **coming from MusicXML** table: `<duration>`/`<divisions>` have no
counterpart, `<tie>` has none and why, `<part-list>` maps to `<ensemble>`, and
partwise/timewise has no equivalent because there is only one arrangement.

### 4. Notes, rests, and octaves — new

The pitch table moved here from page 1. Three interchangeable spellings per
degree and why (`1`, `D`, `ด` are one note). นิคหิต raises an octave, พินทุ
lowers one, both work with all three spellings. Octaves beyond what the Thai
spellings reach. `<rest>` revisited now that page 3 has said what it means.
`sound` on `type="unpitched"` parts, using the ฉิ่ง row from page 2.

`public/corpus/valid/pitch-spellings.txml` is a validated source for the drill
snippets.

### 5. Beats and subdivision — new

The highest-value page in the set. `<group>` is the concept most specific to
this format and the least guessable. Uses a purpose-built snippet from
แขกบรเทศ, not the running ลาวดวงเดือน file, because แขกบรเทศ gives richer
examples: 3-child groups with rests inside, 2-note groups, and
`<group link="true">` across ฆ้องวงใหญ่ R/L rows.

- A `<group>` occupies exactly one beat, divided evenly among its children.
- **The X/O diagram from `group.md`** — the final child lands on the beat and
  the earlier ones space backwards from it. This is where Thai subdivision parts
  company with Western subdivision and the page should be blunt about it.
- Why a group can never cross a measure or line boundary: the arithmetic does
  not allow it.
- `link` in both cases: reaching another row on a stacked instrument, and
  marking the group's own notes on a single-row score.
- Two parts subdividing the same beat differently, and how the grid stays
  aligned.

### 6. Sections, repeats, and endings — new

Several `<section>`s, and that section order comes from document position rather
than an attribute. Line and measure numbers are local to their parent, and
repeating a section renumbers nothing. Nested `<repeat>` and how counts
multiply. `<line-repeat first last times>`. `<ending pass="2">` substituting a
single differing line.

All of these appear naturally in ลาวดวงเดือน: ท่อน 1/2/3 each wrapped in
`<repeat times="2">`, `<ending pass="2">` in ท่อน 1, and `<line-repeat>` in
ท่อน 2 (line 5) and ท่อน 3 (lines 1–2, 4).

### 7. Ensembles and stacked instruments — new

Several `<part>`s and the `<part-data>` answering each one. `stack` and `row`
joining ขิม 1, ขิม 2, and ขิม 3 into one instrument of three rows — rows are
registers, not hands. `<instrument-short-name>`, which the tutorial has never
explained. A part that omits a section it does not play
(`public/corpus/valid/section-omitted-by-part.txml`). Why every part must agree
on beat count per measure, and the one exemption.

### 8. Lyrics — new

`type="lyric"` is an ordinary part taking its own row. `<syllable>` holds one
syllable because Thai is sung a syllable at a time. A `<rest>` in a lyric
measure is เอื้อน, the same reading as an instrumental rest. **The counting
rule**: match the measure's beat count and each item takes a beat; write any
other number and the run centres in the cell. Both are ordinary ways to write a
vocal line.

`syllable.md` already uses ละ / หนอ and ดวง / เดือน in its examples, so the
reference is effectively assuming this piece already. The words are public
domain.

### 9. Marking the score — new

Everything that makes a file print like a real sheet rather than a bare grid.
Deliberately several independent subjects on one page, per the author's call.

- `<bow type="start|stop" direction>` spans, including one crossing a measure
  boundary and a single-note span. From ซออู้.
- `<parenthesis dim="true">` marking cued passages. From ระนาดเอก and ซออู้
  in ท่อน 2 and 3.
- Spans crossing `<group>`, `<measure>`, and `<line>` boundaries freely, and
  having zero duration.
- `<br>` opening vertical space. Demonstrated from the master score where it
  spaces the description annotation.
- `<annotation>` with `<text align>` for left/centre/right headings, stating the
  design invariant plainly: **if you want it printed, you type it.** A section's
  `name` stays internal to the file.
- Credits: `<lyricist>`, `<arranger>`, `<tuning>`, `<license>`. All present in
  the master score header.

`example-chuen-chumnum.txml` demonstrates the invariant rather than asserting
it: centre-aligned annotations act as printed headings over `<section>`s whose
`name` never reaches the page.

### 10. Validating and going further — new

Validate against `public/schema/thaimusicxml-0.1.rng`, with a real command. What
the grammar cannot express, and that `scripts/check-corpus.mjs` carries those
rules. The Playground for editing and rendering in the browser. What a
conforming processor must warn about rather than reject. Then the map out:
Elements, Examples, Conformance, Rendering, Roadmap, and how to contribute a
transcription.

## Conventions for every page

1. **A "what changed" opener** — one or two sentences naming the diff from the
   previous page, so the reader knows what to look for in the image.
2. **Rendered image, then complete file, then chunk-by-chunk walkthrough.**
   Already the shape of pages 1 and 2.
3. **A recap box** at the end listing the elements introduced, each linked to
   its reference page. Page 1 has a forward link today; page 2 has nothing.
4. **A "try it in the Playground" link** so the reader can edit what they read.

## Implementation work this needs

### Sidebar order — do this before adding page 10

The tutorial sidebar is `autogenerate`. Starlight sorts an autogenerated group
by `sidebar.order` frontmatter, falling back to `Intl.Collator.compare` on the
slug (`utils/navigation.ts`, `sortDirEntries`/`getOrder`). That collator is not
numeric, so **`10-validating…` sorts before `2-file_structure`**. Verified in
the installed 0.41.4, not assumed.

Renaming to `01-`, `02-` would fix the sort and change live URLs. Instead add
explicit `sidebar: { order: N }` frontmatter to all ten pages and leave the
filenames alone. No URL breakage, and inserting a page later needs no renaming.

### Showing part of a large score

A six-part ลาวดวงเดือน is a few hundred lines. Page 1 cannot open with it, and
`ExampleXml.astro` inlines whole files only.

**Progressive tutorial cuts.** Each tutorial file is a complete valid document
holding a subset of the master's parts and sections. `ExampleXml` inlines them
whole with no changes needed, and rendering each one gives that page's image
directly.

| File | Page | Holds |
| ---- | ---- | ----- |
| `tutorial1-hello-world.txml` | 1 | ระนาดเอก, ท่อน 1 (exists, unchanged) |
| `tutorial2-file-structure.txml` | 2 | adds ฉิ่ง (tutorial-only), `<composer>`, `<direction>`, `<repeat>`, annotations |
| `tutorial4-notes-and-octaves.txml` | 4 | adds ท่อน 2, which carries the octave range |
| `tutorial7-ensemble.txml` | 7 | adds the three ขิม rows |
| `tutorial8-lyrics.txml` | 8 | adds the lyric part |

Page 5 uses a แขกบรเทศ snippet rather than a cut. Pages 6 and 9 use cuts of
the running file (all features appear naturally). Pages 3 and 10 need no file.

ฉิ่ง appears once in tutorial2 to demonstrate an unpitched part; it is not in
the master score. The สองชั้น ฉิ่ง pattern is used (`rest, rest, rest, ฉิ่ง(0)`
/ `rest, rest, rest, ฉับ(1)`).

### Other

- The full score gets its own page under Reference → Examples, alongside the
  existing four, following `chomsurang.mdx`'s shape. Note that a score spanning
  more than one page renders to `-1.svg`, `-2.svg`, so that page may need more
  than the single `image.png` the other four use.
- Per-page images come from the cuts, not the master, so they stay short.
- New `.txml` files land in `renderer/examples/` and are picked up by
  `make render_example` and the `render-docs-images` skill. They have to render
  cleanly, not merely validate.

## File inventory

Per new page: an English `.mdx`, a Thai `.mdx`, usually a `.txml` in
`renderer/examples/`, and a rendered PNG under
`src/assets/docs/v0_1/tutorial/<page>/`. Eight new pages is roughly 32 files,
plus the master score and its Examples page.

## Delivery order

The score exists, so the original blocking dependency is gone.

1. **The `sidebar.order` frontmatter pass** across all pages.
2. **The master score's Examples page.** Follow `chomsurang.mdx`'s shape.
3. **Page 2 rewrite, then page 4.** Establishes the running file and the cuts.
4. **Pages 5 and 6.** The hard mechanics.
5. **Pages 7, 8, 9.** Remaining coverage.
6. **Pages 3 and 10.** These can land at any point; page 3 early is useful.

Each batch lands complete in English before the next starts. Thai follows once
the author confirms the English.

## Working practice

Same as `renderer/HANDOVER.md`, which is worth reading before touching anything
that renders.

- **Do not auto-commit.** Stage and let the author review.
- **The author owns every musical and visual decision.** Ask for a printed
  reference rather than guessing at a convention.
- `pnpm run check` runs links, corpus, and the unit tests. `npx astro build`
  instead of `astro check`, which is broken in this environment.
- **`npm run check:links` after any docs edit.** It resolves every internal
  link and `#anchor` including TreeView slugs, and exits non-zero on a break.
  Ten new pages cross-linking into the element reference will exercise it.
- Where a statement goes, per `AGENTS.md`: rules a document must satisfy go in
  `## Conformance` on the element page; how something displays goes in
  `reference/rendering/index.md`; what an element means goes in the element
  page's main prose. **The tutorial explains and demonstrates; it does not
  become a third place a rule lives.** Where a tutorial page needs a rule, it
  links to the page that owns it.
- Use the `humanizer` skill on both the English and the Thai.
- ราชบัณฑิตยสภา spelling for Thai.

## Still open

- **Cuts are hand-maintained.** Each tutorial `.txml` is edited directly; no
  generator script. When the master changes, update the affected cuts by hand.
  Keep snippets intelligent — only include what matters for that page, crop
  lines and parts to the relevant section rather than copying the full score.
- **The full score's Examples page.** Show only the relevant portion in the
  rendered image rather than the entire score. Same principle: be intelligent
  about what to include.
