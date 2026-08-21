---
title: Rendering
description: Non-normative guidance for laying out and displaying a ThaiMusicXML score
---

Everything on this page is **non-normative**. It describes how a score is conventionally laid out and displayed, so that renderers agree with each other and with printed Thai scores. None of it affects whether a document is valid, and a processor that only reads or converts data can ignore all of it.

Where the spec leaves a display decision open, that is deliberate. The markup records what the music is; how it looks belongs to the renderer and its settings. [Renderer settings](#renderer-settings) collects every one of those open decisions with the default to start from.

## Renderer settings

The table below lists each display decision this page leaves open, with the default a renderer starts from. A renderer may expose any of them to the user, and may expose none: the defaults on their own produce a conventional score.

None of these lives in the document. There is nowhere in a ThaiMusicXML file to write one and nothing to read one out of, and changing any of them leaves the markup untouched. Where a score genuinely needs one pinned down, the mechanism is a local attribute on the element concerned, the way `dim` and `mute` work on [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/). A document-wide display directive would end up fighting the reader's own preferences on every file they opened, which is why the format has none.

| Decision | Default | Where |
| --- | --- | --- |
| Which pitch spelling appears | Whichever of the three the file is written in | [Inside a measure](#inside-a-measure) |
| Case of romanized pitch letters | Uppercase | [Inside a measure](#inside-a-measure) |
| Octave mark shape and size | A small dot, drawn independent of the typeface | [Octave marks](#octave-marks) |
| How thoroughly rests print | A hyphen for every rest in every notated part, blank in a lyric row | [Inside a measure](#inside-a-measure) |
| Lyric row type size | Smaller than the notated rows | [Lyric rows](#lyric-rows) |
| What happens when the words do not fit | The syllables move off their beats first, then that measure sets smaller | [Words that do not fit](#words-that-do-not-fit) |
| Instrument-name labels | Top-right corner on a solo score; a deduplicated label column on an ensemble score | [Instrument names](#instrument-names) |
| `name` printed as a section heading | Off | [Section headings](#section-headings) |
| `<tuning>`, `<license>`, and `<bpm>` on the page | Off | [The title band](#the-title-band) |
| Numerals in labels the renderer writes itself | Arabic | [Section headings](#section-headings) |
| Dimming and muting a cued passage | The renderer's own preference, overridden per span by `dim` and `mute` | [Cued passages](#cued-passages) |
| Octaves outside `-1` to `1` | No default. The renderer decides, and must not pass off a capped spelling as exact | [Octaves beyond the Thai spellings](#octaves-beyond-the-thai-spellings) |
| Typeface | Sarabun | [Typeface](#typeface) |

### Typeface

Set a Thai score in **Sarabun**, published under the SIL Open Font License.

The octave marks are not what decides this: [Octave marks](#octave-marks) below are drawn as their own shape rather than set as diacritics in the font, so no face's own combining-character metrics are load-bearing here. What does decide it is the base letters themselves. Sarabun reads clearly at the sizes a pitch letter is set at, and its range of weights covers the size and emphasis steps the [title band](#the-title-band) and [score layout](#score-layout) ask for. The OFL also keeps embedding the face in an exported PDF straightforward.

Noto Sans Thai, also under the OFL, is an equally sound choice and is worth having as the fallback in a font stack. TH Sarabun New is the familiar face from Thai official documents and reads correctly, but it ships few styles and carries the GPL with a font exception rather than the OFL, which is more to reason about when a tool embeds it in files it hands to users.

## The measure grid

A [`<line>`](/en/v0_1/reference/elements/line/) renders as a row of cells, one cell per [`<measure>`](/en/v0_1/reference/elements/measure/), up to the eight-measure limit.

Every cell in the score is the same width. Set it once: take the page width, subtract the side margins, divide what is left by eight. Because the width never varies, measures line up in columns down the whole page regardless of what any individual line contains.

Two things follow from a fixed width, and both matter.

A line with fewer than eight measures does not stretch to fill the row. It renders left-aligned, and the ruling stops after its last measure, so a four-measure line occupies the left half of the row and leaves the right half blank.

A measure with more symbols in it does not get a wider cell. The symbols pack closer together instead.

Consecutive lines stack directly on top of each other and share a horizontal rule, forming one continuous grid. Where a score has several parts, each part gets its own row inside the line, in the order the [`<part>`](/en/v0_1/reference/elements/part/) elements appear in [`<ensemble>`](/en/v0_1/reference/elements/ensemble/). See [Score layout](#score-layout).

Printed scores rule the grid: a box around it, verticals between measures, horizontals between part rows. The `number` on a `<line>` or `<measure>` is not printed. It is there so the file can be read and checked, and the position on the page already says which line and measure you are looking at.

Where a section runs past the bottom margin it continues on the next page, keeping the same cell width. Do not split one line's part rows across a page: a line's rows belong together.

## Inside a measure

Beat positions line up vertically across every part playing the same measure, so the division is worked out for the measure as a whole rather than separately per part.

Count what each beat needs, taking the largest count across all parts. A beat every part plays as one [`<note>`](/en/v0_1/reference/elements/note/) or [`<rest>`](/en/v0_1/reference/elements/rest/) counts as one. A beat that any part subdivides with a [`<group>`](/en/v0_1/reference/elements/group/) counts as that group's number of children. Divide the cell into as many equal shares as the counts add up to, then give each beat the shares it counted for.

A four-beat measure where one beat carries a group of two is divided into five. That beat takes two fifths and the other three take one fifth each. A part that plays a single note on the grouped beat still gets the full two fifths for it.

### Beats anchor to the right

A beat arrives on its last slot rather than its first, so the shares a beat is given are the run-up to it and every part's note for that beat lands together at the far end of them. See [`<group>`](/en/v0_1/reference/elements/group/#where-the-children-fall), which is where that rule is stated.

A part playing one note where another plays a group of two puts that note level with the group's *second* symbol, not its first. The measure's last note sits at the cell's right-hand edge, and the measure reads backwards from there toward the ลูกตก it arrives on.

This is the deepest difference between laying out a Thai score and laying out a Western one. An engraver who anchors beats to their onset will produce a grid that looks nearly right and lines the wrong notes up.

### Two parts subdividing one beat differently

One part may play a group of two where another plays a group of three. The larger count wins the shares, three here, and each part then divides that width evenly among its own children.

The two parts meet on the beat's arrival and nowhere else inside it. That is correct rather than a compromise: two against three genuinely do not coincide, and the arrival is the only alignment the grid promises. Taking a common multiple instead would give that beat six shares out of nine in a four-beat measure, squeezing the other three beats into a third of the cell to make room for notes that still would not line up.

Within a group's share, the symbols sit closer together than adjacent beats do, so the group reads as one fast gesture rather than as separate beats. The extra whitespace falls to the left of the group, ahead of its first symbol, since its last symbol is pinned to the beat.

A `<note>` with a `pitch` renders as its pitch letter carrying its octave mark. See [Octave marks](#octave-marks) below.

Which of the three spellings appears is the file's decision rather than the renderer's. A score written in Thai script displays in Thai script, one written in numerals displays in numerals. The spellings are interchangeable and a renderer knows how to convert between them, but an author who wrote a teaching edition in numerals chose that, and re-spelling it on the way to the page would overrule them. This is why [`<note>`](/en/v0_1/reference/elements/note/) asks a generator to settle on one spelling per file. A renderer may offer to display a score in a spelling other than the one it is written in; the file keeps its own either way.

Letter case is not a fourth spelling. A romanized `pitch` may be written in either case, and which case appears on the page is the renderer's decision rather than the file's, defaulting to uppercase. `pitch="d"` and `pitch="D"` are the same note written two ways, so preserving the difference would be preserving nothing.

A `<note>` in an unpitched part renders its `sound` string verbatim, whatever that string is. Sound codes are instrument-specific and the spec assigns them no glyphs, so what the author wrote is what appears in the cell. A part using codes that need explaining should carry an [annotation](#annotations) saying what they mean.

A `<rest>` renders as a hyphen.

How thoroughly rests are printed is a house style choice, and printed scores differ. Some print a hyphen for every rest in every part. Others print them only in the part carrying the melody in that measure, leaving the following part's rests as blank space. Both are conventional and a renderer may offer either. The markup does not change either way: a `<rest>` records that no attack happens on that beat, not how the page shows it.

### Octave marks

An octave mark is a small dot beside the pitch letter: above for `octave="1"` (or a `pitch` spelled with นิคหิต), below for `octave="-1"` (or พินทุ), and no mark at all for `octave="0"`.

The dot is drawn as its own shape, not set as นิคหิต or พินทุ in the font. A Thai music sheet marks octave with a plain dot, not with either of those two characters: นิคหิต and พินทุ are combining characters with their own shape and meaning in running Thai text, and printing them literally where the sheet only means "up one octave" or "down one octave" does not match that convention. A file may still spell the octave with the literal modifier character (`pitch="ดํ"`, `pitch="ทฺ"`), documented at [Thai octave modifiers](/en/v0_1/reference/elements/note/#thai-octave-modifiers). That spelling renders identically to the equivalent `octave` attribute: only the source syntax differs, not the mark on the page.

## Lyric rows

A [lyric part](/en/v0_1/reference/elements/part/#part-types) renders as a row of text in the grid, ruled and sized like any other row, sitting wherever the part appears in [`<ensemble>`](/en/v0_1/reference/elements/ensemble/).

Where the syllables sit inside a cell comes from a count. A lyric measure holding exactly as many items as the measure has beats renders one item per beat, each under the beat it belongs to. A lyric measure holding any other number renders as a single group centered in the cell, its items evenly spaced among themselves and lined up with nothing.

The aligned form anchors the way everything else does, on [the beat's arrival](#beats-anchor-to-the-right). A syllable belonging to beat one sits under the position beat one lands on, which is the right-hand end of its share rather than the left, so the words line up with the notes above them.

The centered form does not anchor at all. That is the point of it: a run of syllables placed without reference to the beats is making no claim about which beat any of them falls on, so there is nothing for it to line up with and a renderer should not pin it to the arrivals.

The centered form is not a fallback for a badly written measure. A vocal line often does not divide the way the melody does, and three syllables across a four-beat measure say the words belong to that measure without claiming which beat each one lands on. Both forms can appear in the same score, measure by measure.

Lyric rows take no part in the [subdivision count](#inside-a-measure). That count divides a cell by what the notated parts need, so a lyric measure of three items in a four-beat measure divides nothing, and a lyric measure of ten does not squeeze the notes above it. The cell is sized by the music, and the words fit into what the music leaves.

That has a consequence worth planning for: a syllable is several times wider than a pitch letter, and nothing widens the cell to help. The items pack closer together, the way symbols do everywhere else in the grid. A renderer may also set the lyric row in a smaller size than the notated rows to buy the room back.

A `<rest>` in a lyric row prints as blank space rather than as the hyphen it takes in a notated part. A hyphen between two syllables reads as a broken word, which is not what the rest means. It means no new syllable starts there and the vowel already sounding carries on, which is เอื้อน.

### Words that do not fit

A cell sized by the music will not always hold the words that go under it. Two things can happen then, and this section sets the order they happen in.

The syllables move first. A word that would otherwise print on top of its neighbour shifts along the row into whatever space the cell has left, keeping the order it was written in, a clear gap from its neighbours, and both barlines. Where two collide they both move rather than the later one being shoved the whole way, so each ends up as near its own beat as the others allow. A syllable a few points off its arrival still reads as belonging to that beat; two syllables printed on top of each other read as nothing at all.

Where the words are wider than the cell however they are arranged, that measure sets in a smaller size. Per measure, not per row: the cells beside it keep the size the rest of the score is set in. The step between two neighbouring cells is visible, and it costs less than taking a whole line down for the sake of one measure of it.

Below some size the words stop being legible, so a renderer stops shrinking there and lets what is left overhang. A single word wider than a cell at that floor is past what layout can do for it, and the fix is the arranger's: write it as the syllables it is sung on.

## The title band

The [`<title>`](/en/v0_1/reference/elements/title/) sits centered at the top of the first page. On a score written for one instrument, the [`<instrument-name>`](/en/v0_1/reference/elements/instrument-name/) prints separately, in the top-right corner — see [Instrument names](#instrument-names).

Below it comes a band holding the credits from [`<header>`](/en/v0_1/reference/elements/header/), meaning [`<composer>`](/en/v0_1/reference/elements/composer/), [`<lyricist>`](/en/v0_1/reference/elements/lyricist/), and [`<arranger>`](/en/v0_1/reference/elements/arranger/), followed by any [`<annotation>`](/en/v0_1/reference/elements/annotation/) that appears in `<structure>` before the first section.

Credits print exactly as written and a renderer prefixes nothing. A score reading `ผู้ประพันธ์ : พระประดิษฐไพเราะ` on the right is one where the arranger typed that string into a right-aligned `<text>` child, label and all. Bare text with no `<text>` children centers. There is no generated `ผู้ประพันธ์ :`, in Thai or any other language, because a renderer that supplied one would print it twice on every score whose arranger had already written it out.

The `align` values do the positioning throughout the band, so the conventional layout of the หน้าทับ name on the left and the composer on the right comes from the markup rather than from a rule here.

Not everything in the header reaches the page. [`<tuning>`](/en/v0_1/reference/elements/tuning/), [`<license>`](/en/v0_1/reference/elements/license/), and [`<bpm>`](/en/v0_1/reference/elements/bpm/) are carried in the file for players and editors to read, and printed scores conventionally leave them off. A renderer may offer to show them, but no printed convention places them.

## Annotations

An `<annotation>` renders where its position in the document puts it, and there are three placements.

One in `<structure>` before the first section joins the [title band](#the-title-band).

One in `<structure>` between two sections renders as its own aligned row in the gap between those section blocks, using the same left, center, and right positions.

One inside a [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) or an [`<ending>`](/en/v0_1/reference/elements/ending/) belongs to one part, and renders above that part's first row in the section. Where a section carries both kinds, the score-wide annotations from `<structure>` come first, then the per-part ones in part order.

A [`<br>`](/en/v0_1/reference/elements/br/) adds vertical space at the point it appears, pushing what follows further down the page. One `<br>` is worth one blank line, and consecutive ones stack, so three in a row push three lines down. It works the way blank lines do in a text document and carries no musical meaning.

## Instrument names

On a solo score the [`<instrument-name>`](/en/v0_1/reference/elements/instrument-name/) prints in the top-right corner of the first page, level with the title rather than stacked under it. A centered subtitle position reads too much like a second header, the way a composer's name would if it were set that way instead of in the credits band.

On an ensemble score it prints as a label column left of the first measure of each line, the way Western scores do. Thai scores otherwise identify a part by its position in the stack, and that stops working once any part is tacet somewhere: a part that omits a [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) has no row in that section's grid at all, and the parts below it move up to close the gap. The label column is what tells a reader which row is which regardless.

A label does not repeat on every line, the way a Western score does not repeat a system's names when the instrumentation has not moved. It prints on the first grid line, on the first line of a page, and on the first line after the row lineup itself changes — which, since nothing else reorders rows, only a tacet part causes. Consecutive lines with the same parts in the same order print nothing.

Labels take their width from the margin rather than from the eight cells, so a long name never moves the grid. Where a part carries an [`<instrument-short-name>`](/en/v0_1/reference/elements/instrument-short-name/), the label column uses that instead of the full [`<instrument-name>`](/en/v0_1/reference/elements/instrument-name/), which stays reserved for the top-right corner and any other full-width use. A part with no short name uses its full name in the column regardless of whether it fits.

## Section headings

A [`<section>`](/en/v0_1/reference/elements/section/) does not print a heading of its own. Its `name` labels the section for the file and for an editor's interface, and the ชั้น set by a [`<direction>`](/en/v0_1/reference/elements/direction/) records the level for whatever reads the file. Neither reaches the page by itself.

The heading a reader sees comes from an [`<annotation>`](/en/v0_1/reference/elements/annotation/) the arranger put in `<structure>` before the section. `สามชั้น ท่อน ๑` is typed, not assembled from `name` and `<chan>`. Leaving it to the arranger keeps the wording theirs: which sections get a heading at all, whether the ชั้น is named, and how, are editorial decisions that vary between scores.

A renderer may offer to print `name` itself as a heading for a score whose annotations are sparse. Keep it off by default: the renderer has no way to tell an authored heading from an unrelated annotation, so turning this on for a score that already writes its own headings prints both.

Numerals follow from the same split. Almost everything printed is text the arranger typed, reproduced as written, which is why `ท่อน ๑` keeps its Thai numeral without any rule about it. The only number a renderer generates on its own is the [repeat bracket](#repeat-brackets) count, and that defaults to Arabic.

## Score layout

A full score stacks one row per part. Parts sharing a `stack` value are the rows of one instrument (see [`<part>`](/en/v0_1/reference/elements/part/)), ordered top to bottom by `row`, and read as one instrument however many rows they run to. Three is the most seen in practice.

Rows nest in four levels, from innermost to outermost:

1. The rows of one instrument.
2. The instruments playing one line, meaning every part's row for the same `<line number="N">`.
3. The lines of one section.
4. The sections of the score.

Skip any level that has only one member: a single-row instrument has no row level, a solo score has no instrument level. Of the levels that remain, the innermost gets no break at all, and each level outward gets a larger one.

That produces the four common arrangements:

| Ensemble                        | Between rows | Between instruments | Between lines | Between sections |
| ------------------------------- | ------------ | ------------------- | ------------- | ---------------- |
| One single-row instrument       | n/a          | n/a                 | none          | small            |
| One multi-row instrument        | none         | n/a                 | small         | larger           |
| Several single-row instruments  | n/a          | none                | small         | larger           |
| Single-row and multi-row mixed  | none         | small               | larger        | largest          |

A stack of three behaves no differently from a stack of two. The row level absorbs the extra row, and the breaks outside it are unchanged.

### Text inside a break

A break separates one grid from the next. Where an [annotation](#annotations) falls into one, the break is not simply drawn and then the text placed after it, because that pushes the text away from the grid it belongs to.

Text between two grids divides into two parts. Lines trailing the grid above belong to it and stay close to it, `กลับต้น` under the section it returns from being the case this exists for. The last line before the next grid is that grid's heading and belongs to it, so it stays close to the grid below. The break falls at the division between them.

Where only one line sits between two grids the division is above it, so a lone heading like `ท่อน ๒` keeps the full break above and sits tight on its own grid. Where a heading ends the [title band](#the-title-band), the same rule applies: it heads the first grid, and the break separating the header from the music falls above it rather than between it and the grid it names.

None of this changes the size of the break. A break interrupted by text is spent once, at the division, and not again on either side. Spending it more than once pushes the sections apart; spending less than all of it loses the separation between them entirely.

## Repeat brackets

A [`<line-repeat>`](/en/v0_1/reference/elements/line-repeat/) renders as a bracket in the margin right of the grid, spanning the rows for lines `first` through `last` and labelled ซ้ำ. Repeating one line gives a short bracket beside that row; repeating a range gives a taller one covering all of them.

The bracket sits immediately right of the grid it covers rather than at a fixed margin position, so a span over seven-measure lines sits further left than one over eight-measure lines. Where a span mixes lengths, align it to the longest line in the span.

A bare ซ้ำ reads as playing the range twice, matching `times="2"`. That is what printed scores show and it needs no number.

Above two, drop ซ้ำ and label the bracket with the count alone: `3 ครั้ง` for `times="3"`. The count is the total number of plays, not the number of extra plays on top of the first, so `3 ครั้ง` and `times="3"` say the same thing. Use Arabic numerals by default. Renderers generating this label are writing text the author never typed, so the safe default is the unambiguous one, whatever numerals the surrounding score uses.

A [`<repeat>`](/en/v0_1/reference/elements/repeat/) in `<structure>` covers whole sections, so a line bracket cannot express it and a renderer prints nothing for it. The arranger writes the instruction as an [annotation](#annotations) instead: `กลับต้น` below and right of the grid, in the ฉิ่งมุล่ง example, for a repeat returning to the start of the piece.

Leaving it to the arranger is the only workable answer here. กลับต้น fits a repeat that wraps the whole piece and says nothing useful about one wrapping only the middle two sections, and a nested repeat has no short phrase at all. The wording depends on what is being repeated and from where, which is an editorial judgement rather than a lookup.

## Variant endings

An [`<ending>`](/en/v0_1/reference/elements/ending/) renders below the section it belongs to, not inside the grid. Print the ending's [`<annotation>`](/en/v0_1/reference/elements/annotation/) as a heading, then the replacement lines under it as their own grid, ruled and sized like any other. A completely empty measure in that grid - a notated part's shorthand for "unchanged from the line being replaced", see [`<ending>`'s "Unchanged measures"](/en/v0_1/reference/elements/ending/#unchanged-measures) - prints as an empty cell rather than the notes it stands in for; a reader checks the base line above the ending for what that measure actually plays.

Thai scores are usually written for one instrument, where an ending can sit under the section unlabelled and still be unambiguous. This spec allows any number of parts, and there the reader needs to be told which instrument the variant belongs to and when it applies. That is what the annotation carries, in the author's own words: `ขิม รอบสุดท้ายเปลี่ยนเป็น` names the instrument and the pass together. The `pass` attribute is what a player reads; the annotation is what a human reads. A renderer prints the annotation as written and does not try to generate the sentence from `pass`.

## Bow spans across a line break

Both bow directions render above the notes: `in` as a curve with both tips pointing down, `out` as a curve with both tips pointing up.

When a [`<bow>`](/en/v0_1/reference/elements/bow/) span crosses a `<line>` boundary, draw it as two arcs. One runs from the start marker to the end of its line, the other from the start of the next line to the stop marker. At the cut, render the tip parallel to the horizon instead of pointing up or down, signalling that the stroke continues onto the next line. The tips at the span's true start and true stop still follow `direction`.

## Link spans

A [`<link>`](/en/v0_1/reference/elements/link/) span draws a curve marking its notes as one gesture. On an instrument notated across several rows the curve reaches the other rows too, showing that the rows belong together, and on a stack of three it reaches all of them. On a single-row instrument there is no other row to reach and the curve arcs over the span's own notes.

The curve carries no timing information either way: the notes already describe the rhythm. What it adds is certainty. A run is otherwise shown only by [its notes sitting closer together](#two-parts-subdividing-one-beat-differently), and a measure that divides into six columns leaves that spacing very little room, so a link is what an arranger reaches for when a gesture has to be unmistakable.

Find the two notes the curve reaches by reading the whole stack at once, not one row at a time. Collect every note the instrument sounds inside the span, ignoring rests, and take the first and the last. In the row that wrote the span, that is the notes between its two markers. In the instrument's other rows, it is every note they play in the beats the span covers. A slot in one row names no position in another, since one row may divide a beat in two where another divides it in three, so the beat is as fine as the correspondence goes.

Where an upper row plays `- ซ ล` against a lower row's `ฟ - -`, the instrument sounds ฟ ซ ล, so the curve runs from ฟ to ล even though neither row holds both ends of it. Anchoring instead to the edges of each beat would catch the rests sitting there and draw the curve backwards between two silences.

The two notes settle which way it turns. A run ending higher up the page than it began leaves the first note at that letter's upper left, rises, and comes in flat above the last one. A run ending lower leaves at the upper right, runs flat, and turns down onto the last note. Either way the curve arches over the notes it spans rather than cutting between them, and it steps off the first note by about half a letter so it starts at the corner rather than on top of it.

When a span crosses a `<line>` boundary, draw it as one segment per line, each running to the edge of the grid where it is cut. A span may leave a single note on one side of a cut and that side still gets its segment; what decides whether a curve appears at all is the span as a whole, and a span sounding fewer than two notes has no run to mark and draws nothing.

Curves go above the notes, never below. That holds for the same-row arc as much as for the cross-row connector, and it is not a matter of taste: printed Thai scores put every curve over the notation. The arc bows up from the same height the connector attaches at, so a row carrying one of each has both leaving at the same level. Its rise is clamped to the room the row leaves, unlike a [bow](#bow-spans-across-a-line-break), which is a stroke drawn over the passage and reaches into the gap above.

Where a link also carries a bow, the two curves land in the same place and simply overlap. Draw each as you would draw it alone. A gesture that is both linked and bowed is rare enough that keeping the two apart would cost more than it returns, and the strokes sit close enough in meaning that a reader loses nothing by seeing them share a space.

## Cued passages

A [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/) span marks notes the part waits out while another instrument leads. The span is drawn with a `(` before its first symbol and a `)` after its last, which is what gives the element its name. The brackets always appear.

Two further treatments are optional and sit on top of the brackets rather than replacing them: showing the span in a less distinct color, and muting it on playback. Both are left to the renderer or player's own settings by default, and the `dim` and `mute` attributes override those settings for one span when the score needs to be explicit.

A span broken across a line break gets its `(` at the true start and its `)` at the true stop, so a line can open with bracketed notes and never close them.

## Octaves beyond the Thai spellings

Thai script has one nikhahit and one pinthu, so it can spell exactly three octaves: `-1`, `0`, and `1`. A [`<note>`](/en/v0_1/reference/elements/note/) may carry any integer `octave`, and values outside that range have no Thai spelling to display.

The spec does not dictate what to show for them. The `octave` value is authoritative and must be preserved for playback whatever the renderer displays. Renderers should make clear that the displayed note is not the whole story rather than showing a capped spelling as if it were exact, since a reader transcribing from the display would otherwise introduce a real error. How to do that, whether by falling back to numeric pitch, by marking the note, or some other way, is the renderer's decision.
