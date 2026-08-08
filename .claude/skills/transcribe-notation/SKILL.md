---
name: transcribe-notation
description: Transcribe a Thai cipher-notation sheet (a scanned PDF/image of a piece written in ด ร ม ฟ ซ ล ท grid notation) into a ThaiMusicXML (.txml) file under renderer/examples/. Use when the user hands you a PDF, photo, or scan of Thai notation and asks you to notate, transcribe, or digitize a piece.
---

# Transcribing a notation sheet into ThaiMusicXML

This is a from-scratch pipeline: assume nothing about the source beyond "it's a
scan of Thai cipher notation." Work through the phases in order. Each phase has
a concrete check before moving to the next. Don't skip a check because the
data "looks obviously right" - dense grids are exactly where a single misread
character survives to the final file.

Read `CLAUDE.md` first if you haven't this session: it states the project's
design invariants (measure = fixed time unit, beats align across parts, "the
arranger writes it," no notated sustain) that this whole pipeline leans on.

## Phase 0: get the source readable

The Read tool can open a PDF directly, but a few things commonly block that.

**Find the file first if the user pasted an image instead of giving a path.**
In a Claude Code web/remote session, an image dropped straight into the chat
isn't at a path the user names - it's already been saved server-side. Before
asking the user to send it again, check:

```
ls -t /root/.claude/uploads/<session-id>/ 2>/dev/null
find /root/.claude/uploads -newer /path/to/some/recent/file -type f 2>/dev/null
```

(session id is in the scratchpad path in your system prompt). Only fall back
to asking the user for a file if nothing turns up there - a broad `find /`
across the whole filesystem is a last resort, not the first move.

**macOS only: `~/Downloads` blocks reads.** macOS blocks reading files under
`~/Downloads` (and similar TCC-protected folders) for this tool even when the
file's Unix permissions look fine (`cp`/`cat` fail with `Operation not
permitted`). This blocks the Read tool _and_ Bash's `cp`/`cat` identically,
and a sandbox override (`dangerouslyDisableSandbox`) doesn't help either -
TCC is an OS-level permission, not this tool's sandbox. Don't retry the copy
with different flags; ask the user to move or copy the file into the project
directory right away. This is a macOS-specific concern; it does not apply in
a Linux container (including most remote/web sessions), where an uploaded or
pasted file is already plainly readable once found.

**Dense grid pages need more resolution than the Read tool's default
rendering gives you, and often the tools to fix that aren't preinstalled.**
Check what's already on `PATH` before installing anything
(`which pdftoppm rsvg-convert magick python3`), then fill gaps with whatever
package manager the environment actually has:

```
# macOS
brew install poppler       # pdftoppm, pdfinfo
brew install imagemagick   # magick, for cropping
brew install librsvg       # rsvg-convert, for previewing rendered output later

# Debian/Ubuntu containers (most remote/web sessions) - needs sudo/root
apt-get install -y poppler-utils librsvg2-bin
# imagemagick is frequently absent and not worth installing just for this:
# Python + Pillow covers crop/resize/identify equally well and is usually
# already present or a one-line pip install away.
pip install pillow
```

Rasterize the pages you need at high DPI:

```
pdfinfo the-file.pdf                      # page count, sanity check
pdftoppm -png -r 300 -f <first> -l <last> the-file.pdf out/p
```

If the source is a multi-song booklet, read the first page or two at normal
resolution with the Read tool to find which page range holds the target
piece before committing to a full high-res pass.

## Phase 1: read the grid at full precision

A page of dense notation (small cells, many rows) will not read reliably at
one shot, even from a 300dpi render. Crop it into **overlapping horizontal
bands** so no row ever sits exactly on a crop boundary (a row split across two
crops is the single most common source of misread cells). Compute the overlap
_before_ the first crop - don't start by slicing the page into N equal,
non-overlapping bands and only add overlap after noticing a row got cut at a
boundary; that means re-cropping and re-reading every band a second time:

```
magick p-NN.png -crop <width>x1150+0+<i*950> +repage band_NN_<i>.png
```

Where `magick` isn't installed (common in Linux containers - see Phase 0),
Python + Pillow does the same crop/resize in a couple of lines and needs
nothing beyond `pip install pillow`:

```python
from PIL import Image
im = Image.open("p-NN.png")
c = im.crop((left, top, right, bottom))       # crop box in im's own pixels
c = c.resize((c.width * 2, c.height * 2), Image.LANCZOS)  # upscale to read
c.save("band_NN_i.png")
```

950px stride with a 1150px band height gives ~200px of overlap, enough that
a row cut at the bottom of one band shows up whole at the top of the next.
Adjust the numbers to the page's actual row height (measure it from one band
first) rather than trusting these defaults blindly. This banding is for dense
multi-row pages; a short piece with only a couple of rows can be cropped
directly per-row or per-cell without bothering with stride math at all.

**Crop coordinates are only valid for the file they were measured on.** The
Read tool's image preview reports "displayed at WxH, multiply by N to map to
the original" - that `N` describes the file you just read, not any other
file. If you crop from that image, coordinates are in _its_ pixel space; if
you then crop again from the crop (a common move when zooming into one
ambiguous cell), you need a fresh multiplier measured on the crop itself,
not the original page's. Carrying an old scale factor over to a new crop is
the single most common way to end up zoomed into the wrong cell.

Before generating a new crop, check whether one with the geometry you need
already exists from an earlier pass - don't regenerate and re-read a crop you
already made under a different filename.

Read each band with the Read tool and transcribe cell by cell. Do **not**
paraphrase or round off characters you're unsure of: Thai pitch letters
(ด ร ม ฟ ซ ล ท) are visually distinct from each other and from a rest dash
`-`; if a character is ambiguous, crop tighter around just that cell rather
than guessing.

**Check for octave modifiers explicitly.** Thai octave marks, nikhahit ` ํ`
(raise) and pinthu `ฺ` (lower), are small combining marks that are easy to
miss at low resolution and easy to confuse with unrelated vowel signs (สระอำ
looks similar to a consonant + nikhahit at a glance). Zoom into a few cells
per page specifically to confirm their presence or absence; don't assume a
piece stays in one register just because the first rows you read do. Cross-
check any mark you find against musical logic too: an octave jump should
make a melodic run smoother (resolving a leap that would otherwise be
awkward), not introduce one - if a mark doesn't make melodic sense at the
cell you read it in, that's a reason to re-crop and look again, not to move
on.

**Cross-validate by re-reading.** Thai classical pieces are highly formulaic:
short melodic cells recur, sometimes identically, across a piece. If two
independently-read bands produce byte-identical cell sequences, that's a
_good_ sign (confirms your reading), not a reason to suspect you copy-pasted
by mistake. Conversely, if a re-read of the same band produces a different
transcription than your first pass, that's the signal to slow down and crop
tighter. Don't silently pick one.

Don't reach for OCR (tesseract or similar) as a cross-check. It isn't trained
on this notation's stylized characters and combining marks, so a background
OCR pass just adds setup time without ever beating a careful visual read.

## Phase 2: work out the grid's structure

Before writing any XML, read `src/content/docs/en/v0_1/reference/elements/note.md`,
`part.md`, and `section-ref.md` (or the `th/` equivalents), and skim an
existing file in `renderer/examples/` (`example-khaek-borathes.txml` is a good
one: it has a stacked instrument, repeats, and octave modifiers all in one
file).

Key structural questions to resolve from evidence, not assumption:

- **What is one grid cell?** Usually one measure, with each character inside
  it one beat slot (commonly 4 characters = 4 beats = one `<bpm>` beat is two
  slots per CLAUDE.md, so 4 characters is 2 bpm-beats, a common สองชั้น
  measure). Confirm the beat count is consistent across the piece; it doesn't
  have to be 4, but it has to be whatever it is uniformly within a section
  (see `<section-ref>`'s conformance rule).
- **What do two stacked lines inside one cell mean?** Check instrument
  monophony first: a single-line melodic instrument (ซอ, ขลุ่ย, and other solo
  strings/winds) physically cannot produce two simultaneous hand-parts, so two
  printed rows for one of these are sequential lines - e.g. two passes of the
  melody, never stacked hands. Don't run the stacking test below on these.
  For two-handed instruments (ฆ้องวงใหญ่, ระนาด, etc.) the answer is almost
  always the two rows of one instrument (right hand over left), encoded with
  `<part stack="..." row="1">` / `row="2"`, matching `part.md`'s
  stacked-instrument example. Evidence for this over "two sequential measures
  stacked to save page width": the two rows frequently hold _different_ notes
  at the same beat position (not just different measures' worth of a single
  melody), and they coincide exactly at cadence points: heterophonic doubling
  between two hands, not two spans of one line. Matching an existing corpus
  file's convention for the same instrument (e.g.
  `example-khaek-borathes.txml` for ฆ้องวงใหญ่) counts as evidence too, not
  just note co-occurrence. If genuinely unsure, say so to the user as soon as
  you notice the ambiguity rather than waiting until the final summary; which
  hand is "R" vs "L" and what the two rows are for is a judgment call about
  the source, not something derivable from the schema alone.
- **Does the piece use octave modifiers?** Set per-note `pitch` accordingly
  (`ดํ`/`ดฺ` etc.). See Phase 1's check.
- **Is there a repeat/jump structure that doesn't fit `<repeat>`/`<ending>`
  cleanly?** Many หน้าพาทย์-style pieces are cued live rather than played to a
  fixed repeat count, and mark this with marginal notes like "second time
  starts here" or "return to the top, close with this passage" rather than a
  fixed structure. Don't force these into `<repeat>`/`<ending>`/`<line-repeat>`
  if the source doesn't actually specify a fixed pass count. Default to this
  over untangling a fixed structure yourself, even when one looks derivable -
  propose it upfront as your plan rather than waiting to be told it's fine.
  Instead: split into `<section>`s exactly at each marked branch point, and
  carry the original marker text verbatim as a `<structure>`-level
  `<annotation>` between the sections it separates. This matches the
  project's "the arranger writes it" principle: record what the source says,
  don't invent playback semantics it doesn't specify. The same goes for a
  title printed above a section or a separate grid on the page: carry it
  verbatim as a centered `<annotation>` immediately before that `<section>`,
  rather than dropping it for not being a piece-level `<title>`.

## Phase 3: generate the XML with a script, not by hand

For anything beyond a trivial piece, hand-typing `<note>`/`<rest>` runs is how
transcription errors survive into the file. Write a small Python (or Node)
script instead:

1. Encode your transcribed data as plain data structures: one list of
   sections, each a list of lines, each a list of measures, each measure a
   tuple of per-part strings (one character per beat, `-` for rest).
2. Add an assertion pass before generating XML: every measure string is the
   expected length, every character is either `-` or one of the seven valid
   pitch letters (`ดรมฟซลท`). This catches stray typos (a Latin `-` vs a Thai
   character that looks similar, an extra/missing character) immediately
   instead of after the fact.
3. Generate `<measure number="N">` elements by mapping `-` → `<rest/>` and
   any pitch character → `<note pitch="..."/>`.
4. Write the file to `renderer/examples/example-<slug>.txml`, following the
   naming convention of the existing files there.

Keep the generator script in your scratchpad, not the repo: it's a one-off
tool for this transcription, not project code.

## Phase 4: validate before calling it done

`node renderer/render.mjs` needs the repo's npm dependencies installed first.
On a fresh checkout (typical for a remote/web session container) `node_modules`
won't exist yet and the render fails cold with `ERR_MODULE_NOT_FOUND`. Check
before running it:

```
test -d node_modules || npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required here, not optional: this repo's `astro
check` toolchain has a peer-dependency conflict (`typescript@7` vs.
`@astrojs/check`'s `^5 || ^6` peer range) that makes a plain `npm install`
fail outright. This is unrelated to the render pipeline, which doesn't touch
Astro at all, but the install still needs the flag to complete.

Then run all three of these; each catches a different class of mistake:

```
xmllint --noout --relaxng public/schema/thaimusicxml-0.1.rng renderer/examples/example-<slug>.txml
mkdir -p renderer/out
node renderer/render.mjs renderer/examples/example-<slug>.txml renderer/out/example-<slug>.svg
rsvg-convert -w 1240 -o renderer/out/example-<slug>.png renderer/out/example-<slug>.svg   # single-page piece
rsvg-convert -w 1240 -o renderer/out/example-<slug>-1.png renderer/out/example-<slug>-1.svg   # if the renderer split it into numbered pages, repeat per page
```

`rsvg-convert` itself may need installing - see Phase 0's Linux/apt-get note.
Check `ls renderer/out/` after the render step to see whether it produced one
plain `.svg` (short piece, single page) or several numbered ones, and convert
accordingly rather than assuming the numbered form.

Then **read the rendered PNG(s) back** and compare them side by side against
the source scan, row for row. A schema pass and a clean render only prove the
file is well-formed and internally consistent. They don't prove you
transcribed the right notes. The visual diff against the source is the actual
correctness check. It also surfaces renderer bugs, not just transcription
mistakes (e.g. a single-note bow rendering as a collapsed dot instead of an
arc) - if something in the render looks wrong, check whether the renderer
mishandled a valid case before assuming your data is off.

`astro check` is broken in this environment; use `npx astro build` if you're
also touching docs pages, per `CLAUDE.md`.

## Phase 5: header and attribution

- `<title>` from the piece's printed name.
- `<composer>`: most traditional repertoire has none, `ไม่ปรากฏนามผู้แต่ง`
  (with a note like "เพลงหน้าพาทย์โบราณ" if that's the piece's category) is
  normal, not a gap to fill with a guess.
- `<arranger>`: credit the specific source booklet/transcriber if it names
  one, per `arranger.md` ("the person who ... wrote down a teacher's
  version"). If the source prints a name or studio credit that's ambiguous
  (not clearly a composer, arranger, or something else), default to
  `<arranger>` and flag the guess to the user rather than omitting the credit
  entirely - a flagged guess is correctable, a silently dropped credit isn't.
- Don't invent a `<direction>` (`<chan>`, `<bpm>`, `<nathap>`) the source
  doesn't specify. Omit it rather than asserting a tempo or ชั้น level you're
  not confident in. These are metadata, not required for the file to render
  or validate.

## When you're done

Summarize for the user: which instrument/part structure you inferred and why,
whether the source used octave modifiers, and how you handled any repeat/jump
markers that didn't fit `<repeat>`/`<ending>` cleanly. Flag any interpretive
judgment call explicitly rather than presenting it as settled fact. The user
generally knows the source material better than the schema can tell you.
