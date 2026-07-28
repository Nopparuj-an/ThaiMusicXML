---
title: Rendering
description: Non-normative guidance for laying out and displaying a ThaiMusicXML score
---

Everything on this page is **non-normative**. It describes how a score is conventionally laid out and displayed, so that renderers agree with each other and with printed Thai scores. None of it affects whether a document is valid, and a processor that only reads or converts data can ignore all of it.

Where the spec leaves a display decision open, that is deliberate. The markup records what the music is; how it looks belongs to the renderer and its settings.

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

A four-beat measure where one beat carries a group of two is divided into five. That beat takes two fifths and the other three take one fifth each. A part that plays a single note on the grouped beat still gets the full two fifths for it, which is what keeps beat one of every part starting at the same position.

Within a group's share, the symbols sit closer together than adjacent beats do, so the group reads as one fast gesture rather than as separate beats. The extra whitespace falls at the group's edges.

A `<note>` with a `pitch` renders as its Thai pitch letter carrying its octave mark: นิคหิต above the letter for `octave="1"`, พินทุ below it for `octave="-1"`, and no mark for `octave="0"`.

A `<note>` in an unpitched part renders its `sound` string verbatim, whatever that string is. Sound codes are instrument-specific and the spec assigns them no glyphs, so what the author wrote is what appears in the cell. The same holds for a part whose sound values carry lyric syllables. A part using codes that need explaining should carry an [annotation](#annotations) saying what they mean.

A `<rest>` renders as a hyphen.

How thoroughly rests are printed is a house style choice, and printed scores differ. Some print a hyphen for every rest in every part. Others print them only in the part carrying the melody in that measure, leaving the following part's rests as blank space. Both are conventional and a renderer may offer either. The markup does not change either way: a `<rest>` records that no attack happens on that beat, not how the page shows it.

## The title band

The [`<title>`](/en/v0_1/reference/elements/title/) sits centered at the top of the first page. On a score written for one instrument, printed editions often set the [`<instrument-name>`](/en/v0_1/reference/elements/instrument-name/) beside the title in a smaller size.

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

On a solo score the [`<instrument-name>`](/en/v0_1/reference/elements/instrument-name/) sits beside the title, as ระนาดเอก does in ฉิ่งมุล่ง.

On an ensemble score it is not printed by default. Thai scores identify a part by its position in the stack, and repeating the name on every line would crowd the grid. The name is still doing work off the page: an editor uses it to label parts in its own interface, and to let a reader turn individual instruments on and off.

A renderer may offer to print names as a label column left of the first measure of each line, the way Western scores do. That is an option rather than the convention, and the labels take their width from the margin rather than from the eight cells.

Turn the labels on when any part is tacet somewhere in the score. A part that omits a [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) has no row in that section's grid at all, and the parts below it move up to close the gap. Position in the stack therefore stops identifying a part reliably, and the labels are what tell a reader which row is which.

## Section headings

A [`<section>`](/en/v0_1/reference/elements/section/) does not print a heading of its own. Its `name` labels the section for the file and for an editor's interface, and the ชั้น set by a [`<direction>`](/en/v0_1/reference/elements/direction/) governs playback. Neither reaches the page by itself.

The heading a reader sees comes from an [`<annotation>`](/en/v0_1/reference/elements/annotation/) the arranger put in `<structure>` before the section. `สามชั้น ท่อน ๑` is typed, not assembled from `name` and `<chan>`. Leaving it to the arranger keeps the wording theirs: which sections get a heading at all, whether the ชั้น is named, and how, are editorial decisions that vary between scores.

A renderer may offer to generate a heading from `name` and the ชั้น in force for a score whose annotations are sparse. Keep it off by default, or a score with headings already annotated ends up with two.

Numerals follow from the same split. Almost everything printed is text the arranger typed, reproduced as written, which is why `ท่อน ๑` keeps its Thai numeral without any rule about it. The only number a renderer generates on its own is the [repeat bracket](#repeat-brackets) count, and that defaults to Arabic.

## Score layout

A full score stacks one row per part. A two-handed instrument is a pair of parts joined by `pair` (see [`<part>`](/en/v0_1/reference/elements/part/)); the two hands read as one instrument.

Rows nest in four levels, from innermost to outermost:

1. The two hands of a pair.
2. The instruments playing one line, meaning every part's row for the same `<line number="N">`.
3. The lines of one section.
4. The sections of the score.

Skip any level that has only one member: a single-line instrument has no hand level, a solo score has no instrument level. Of the levels that remain, the innermost gets no break at all, and each level outward gets a larger one.

That produces the four common arrangements:

| Ensemble                         | Between hands | Between instruments | Between lines | Between sections |
| -------------------------------- | ------------- | ------------------- | ------------- | ---------------- |
| One single-line instrument       | n/a           | n/a                 | none          | small            |
| One two-handed instrument        | none          | n/a                 | small         | larger           |
| Several single-line instruments  | n/a           | none                | small         | larger           |
| Single-line and two-handed mixed | none          | small               | larger        | largest          |

## Repeat brackets

A [`<line-repeat>`](/en/v0_1/reference/elements/line-repeat/) renders as a bracket in the margin right of the grid, spanning the rows for lines `first` through `last` and labelled ซ้ำ. Repeating one line gives a short bracket beside that row; repeating a range gives a taller one covering all of them.

The bracket sits immediately right of the grid it covers rather than at a fixed margin position, so a span over seven-measure lines sits further left than one over eight-measure lines. Where a span mixes lengths, align it to the longest line in the span.

A bare ซ้ำ reads as playing the range twice, matching `times="2"`. That is what printed scores show and it needs no number.

Above two, drop ซ้ำ and label the bracket with the count alone: `3 ครั้ง` for `times="3"`. The count is the total number of plays, not the number of extra plays on top of the first, so `3 ครั้ง` and `times="3"` say the same thing. Use Arabic numerals by default. Renderers generating this label are writing text the author never typed, so the safe default is the unambiguous one, whatever numerals the surrounding score uses.

A [`<repeat>`](/en/v0_1/reference/elements/repeat/) in `<structure>` covers whole sections, so a line bracket cannot express it and a renderer prints nothing for it. The arranger writes the instruction as an [annotation](#annotations) instead: `กลับต้น` below and right of the grid, in the ฉิ่งมุล่ง example, for a repeat returning to the start of the piece.

Leaving it to the arranger is the only workable answer here. กลับต้น fits a repeat that wraps the whole piece and says nothing useful about one wrapping only the middle two sections, and a nested repeat has no short phrase at all. The wording depends on what is being repeated and from where, which is an editorial judgement rather than a lookup.

## Variant endings

An [`<ending>`](/en/v0_1/reference/elements/ending/) renders below the section it belongs to, not inside the grid. Print the ending's [`<annotation>`](/en/v0_1/reference/elements/annotation/) as a heading, then the replacement lines under it as their own grid, ruled and sized like any other.

Thai scores are usually written for one instrument, where an ending can sit under the section unlabelled and still be unambiguous. This spec allows any number of parts, and there the reader needs to be told which instrument the variant belongs to and when it applies. That is what the annotation carries, in the author's own words: `ขิม รอบสุดท้ายเปลี่ยนเป็น` names the instrument and the pass together. The `pass` attribute is what a player reads; the annotation is what a human reads. A renderer prints the annotation as written and does not try to generate the sentence from `pass`.

## Bow spans across a line break

Both bow directions render above the notes: `in` as a curve with both tips pointing down, `out` as a curve with both tips pointing up.

When a [`<bow>`](/en/v0_1/reference/elements/bow/) span crosses a `<line>` boundary, draw it as two arcs. One runs from the start marker to the end of its line, the other from the start of the next line to the stop marker. At the cut, render the tip parallel to the horizon instead of pointing up or down, signalling that the stroke continues onto the next line. The tips at the span's true start and true stop still follow `direction`.

## Linked groups

A [`<group>`](/en/v0_1/reference/elements/group/) with `link` draws a curve to whatever the paired hand plays on the same beat, showing that the two hands belong to one gesture. The connector carries no timing information: the group's subdivision already describes the rhythm.

## Cued passages

A [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/) span marks notes the part waits out while another instrument leads. The span is drawn with a `(` before its first symbol and a `)` after its last, which is what gives the element its name. The brackets always appear.

Two further treatments are optional and sit on top of the brackets rather than replacing them: showing the span in a less distinct color, and muting it on playback. Both are left to the renderer or player's own settings by default, and the `dim` and `mute` attributes override those settings for one span when the score needs to be explicit.

A span broken across a line break gets its `(` at the true start and its `)` at the true stop, so a line can open with bracketed notes and never close them.

## Octaves beyond the Thai spellings

Thai script has one nikhahit and one pinthu, so it can spell exactly three octaves: `-1`, `0`, and `1`. A [`<note>`](/en/v0_1/reference/elements/note/) may carry any integer `octave`, and values outside that range have no Thai spelling to display.

The spec does not dictate what to show for them. The `octave` value is authoritative and must be preserved for playback whatever the renderer displays. Renderers should make clear that the displayed note is not the whole story rather than showing a capped spelling as if it were exact, since a reader transcribing from the display would otherwise introduce a real error. How to do that, whether by falling back to numeric pitch, by marking the note, or some other way, is the renderer's decision.
