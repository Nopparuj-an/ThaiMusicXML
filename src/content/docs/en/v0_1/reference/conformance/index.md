---
title: ★ Conformance
description: What it means for a document or a processor to conform to ThaiMusicXML v0.1
---

This page defines what conformance means in ThaiMusicXML v0.1 and collects the rules that the element pages state individually.

## Requirement keywords

The keywords **must**, **must not**, **should**, **should not**, and **may** carry their usual specification meanings:

- **must** and **must not** are absolute requirements. A document that breaks one is not a ThaiMusicXML document.
- **should** and **should not** describe behaviour with good reasons behind it. Ignore them only with the full implications understood.
- **may** marks something genuinely optional. A processor that does not implement it stays conforming.

## Conforming document

A conforming ThaiMusicXML v0.1 document:

1. Is a well-formed XML document.
2. Has a single [`<thai-score>`](/en/v0_1/reference/elements/thai-score/) root carrying `version="0.1"` and the ThaiMusicXML namespace.
3. Satisfies every **must** rule on every element page.

A [RELAX NG schema](/en/v0_1/reference/schema/) states the rules a grammar can reach. The rest stay prose, and checking them takes a second pass over the document.

## Conforming processor

A processor is anything that reads ThaiMusicXML: a validator, a renderer, a player, a converter.

A conforming processor must reject documents that break a **must** rule, or report the violation clearly if it chooses to carry on. It must not silently repair one. Where a rule says validators **should warn**, a processor is expected to accept the document and say something.

A processor may ignore anything it has no use for. A validator with no audio output can skip [`<tuning>`](/en/v0_1/reference/elements/tuning/); a converter with no display can skip everything in the [Rendering](/en/v0_1/reference/rendering/) reference.

### Warn on anything discarded

Several rules in this spec resolve a conflict by ignoring one side of it rather than rejecting the document. Wherever that happens, a validator should warn.

The author wrote something, and the file behaves as though they had not. That is worth a word even when it is harmless, because the alternative is a document that validates clean while quietly not saying what its author meant. `octave` beside a Thai octave modifier, `octave` on a note using `sound`, and text sitting beside `<text>` children are all cases of it.

This is a general principle rather than a rule of its own. Where a specific element page states the warning, that page is the authority.

## Lexical types

The element pages name a type for each attribute. This section says what those names accept, so that two parsers written from this spec agree on what a legal value looks like.

### Booleans

`true`, `false`, `1`, and `0`, matched by value. `link="1"` and `link="true"` are the same. Nothing else is accepted.

### Integers

An optional sign followed by digits. `octave` takes any integer; `times`, `first`, `last`, `number`, `row`, and the content of `<bpm>` take positive ones, with the bounds each element page gives.

### Enumerations

[`<chan>`](/en/v0_1/reference/elements/chan/)'s `value` is a closed enumeration, matched exactly as written: `0.5`, `1`, `2`, `3`, `4`, and neither `0.50` nor `.5`. Its five levels are the whole set, so anything else is an error.

[`<nathap>`](/en/v0_1/reference/elements/nathap/)'s `value` and [`<tuning>`](/en/v0_1/reference/elements/tuning/)'s `reference` are open. Both take any non-empty string, and both publish a recommended list. A validator warns on a value outside that list and must not reject it, which catches a misspelling of a known name without turning an unusual one into an invalid document.

### `pitch`

One base-note character, optionally followed by one Thai octave modifier.

| Degree | Numeric | Thai | Thai code point | Romanized |
| ------ | ------- | ---- | --------------- | --------- |
| 1 | `1` | ด | U+0E14 | `D` or `d` |
| 2 | `2` | ร | U+0E23 | `R` or `r` |
| 3 | `3` | ม | U+0E21 | `M` or `m` |
| 4 | `4` | ฟ | U+0E1F | `F` or `f` |
| 5 | `5` | ซ | U+0E0B | `S` or `s` |
| 6 | `6` | ล | U+0E25 | `L` or `l` |
| 7 | `7` | ท | U+0E17 | `T` or `t` |

The two modifiers are นิคหิต U+0E4D, raising an octave, and พินทุ U+0E3A, lowering one. Either attaches to any of the three spellings.

Match on the code points. Both modifiers are combining characters, so in rendered prose they sit on top of whatever precedes them, cannot be distinguished by eye from several lookalikes, and cannot be copied out of a web page reliably.

Normalization is not a concern. Thai has no canonical compositions, so a `pitch` value is the same sequence of code points under NFC, under NFD, and as authored. No normalization pass is needed before matching.

### `pass`

Comma-separated integers, in ascending order, with no repeats: `2` and `2,4` are well formed, `4,2` and `2,2` are not. See [`<ending>`](/en/v0_1/reference/elements/ending/#conformance) for the bounds.

### `id` and `IDREF`

An `id` must be unique among elements of its own kind. `<part id="…">` values must be unique across all parts and `<section id="…">` values unique across all sections, but the two sets are independent, so a `<part id="1">` and a `<section id="1">` may both exist and refer to different things. An IDREF resolves within the kind its attribute names: `part` on [`<part-data>`](/en/v0_1/reference/elements/part-data/) finds a `<part>`, `section` on [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) finds a `<section>`.

### Text and mixed content

Where an element takes either plain text or [`<text>`](/en/v0_1/reference/elements/text/) children — [`<annotation>`](/en/v0_1/reference/elements/annotation/), [`<composer>`](/en/v0_1/reference/elements/composer/), [`<lyricist>`](/en/v0_1/reference/elements/lyricist/), [`<arranger>`](/en/v0_1/reference/elements/arranger/) — the `<text>` children win. Any text beside them is ignored, which is what allows the element to be indented over several lines without its own formatting becoming content. Ignored text that is not merely whitespace draws a warning.

## Rules by area

### Document shape

- `<thai-score>` must be the single root element, carrying `version` and the namespace.
- A processor must reject a document whose root is in a namespace it does not implement. The namespace URI names the compatibility boundary: through 0.x each release carries its own, and from 1.0 the URI carries the major version alone. `version` tells releases apart within a boundary and is informational to a processor that already understands the namespace, so a mismatch between the two draws a warning rather than a rejection.
- Its children appear in order: `<header>`, `<structure>`, `<ensemble>`, then one or more `<part-data>`.
- `<header>` must contain exactly one `<title>`. Everything else in the header is optional, and `<tuning>` and `<license>` appear at most once each.
- `<nathap>`, `<chan>`, and `<bpm>` are each optional within a `<direction>` and appear at most once each, in any order.

### Identity and reference

- Every `<part>` must have exactly one `<part-data>` referencing it through `part`.
- Every `<section-ref>` must reference a `<section>` that exists in `<structure>` through `section`.
- `<part-data>` elements may appear in any order. A `<part-data>` must not reference the same section twice, and need not reference every section.
- A `<section>` that no `<part-data>` references has no music. It is not played, contributes no rows to the page, and the rules below that count its lines and measures do not apply to it.
- A `<part>` with `stack` must also have `row`, and vice versa. A `stack` value must be shared by at least two parts, their `row` values must run from `1` upward with no gaps or repeats, and they must be adjacent in `<ensemble>` in ascending `row` order.

### Timing

- All `<section-ref>` elements referencing the same `<section>` must agree on line count, on measure count per line, and on beat count per measure. Validators must reject documents that violate this.
- A `type="lyric"` part is bound by line count and measure count per line, and exempt from beat count per measure. Its measures hold any number of items, and it is excluded from the comparison other parts are held to.
- A `<line>` must hold one to eight `<measure>` elements.
- `number` on `<line>` and `<measure>` must match position, counting from `1`, in ascending order.
- A measure in a pitched or unpitched part must hold at least one `<note>`, `<rest>`, or `<group>`. A lyric measure may be empty.
- A `<group>` must hold at least two `<note>` or `<rest>` children, and must not contain another `<group>`.
- A beat arrives on its last slot, so a `<group>`'s final child falls on the beat and the earlier ones space backwards from it within the beat's own span. A group can never reach outside its beat, and so never outside its measure. See [`<group>`](/en/v0_1/reference/elements/group/#why-a-group-cannot-leave-its-measure).

### Repetition

- `times` on `<repeat>` and `<line-repeat>` must be an integer of `1` or greater.
- A `<repeat>` must contain at least one `<section>`, directly or nested.
- `<line-repeat>` requires both `first` and `last`, with `first` no greater than `last`, and `last` no greater than the section's line count.
- Two `<line-repeat>` ranges in one section must be properly nested or wholly disjoint.
- `<ending>` is valid only when the section's total pass count exceeds `1`. Every `pass` value must fall within that count, every `<line number="N">` must replace an existing line, and the replacement must match the original's measure and beat counts.
- An `<ending>`'s lines must form a consecutive run ending on the section's last line. An ending over the middle of a section is invalid, since the section would carry on normally afterwards and so would not be ending on the variation.
- Every `<ending>` must carry at least one `<annotation>` captioning the variation.

### Notes and pitch

- `type` on a `<part>` must be `"pitched"`, `"unpitched"`, or `"lyric"`. Validators must reject any other value.
- A measure's children must match its part's `type`: `<note>`, `<rest>`, and `<group>` in a pitched or unpitched part, `<syllable>` and `<rest>` in a lyric part. `<note>`, `<group>`, `<bow>`, and `<parenthesis>` are not valid in a lyric part, and `<syllable>` is not valid outside one.
- A note in a `pitched` part uses `pitch`; one in an `unpitched` part uses `sound`. The two are mutually exclusive.
- `pitch` must be one of the seven base-note characters in any of the three spellings, optionally followed by one Thai octave modifier. Validators must reject any other value. See [Lexical types](#pitch).
- A romanized base note may be written in upper or lower case. Case carries no meaning, and the renderer decides which case appears on the page.
- When `pitch` carries a Thai octave modifier, that modifier wins and `octave` is ignored. Validators should warn rather than reject.
- `<chan>`'s `value` must be one of the five listed levels, matched exactly. Validators must reject any other value.
- `<nathap>`'s `value` and `<tuning>`'s `reference` accept any non-empty string. Validators should warn on a value outside the recommended list on the element's page, and must not reject it.
- `<bpm>` content must be a positive integer.
- `link` is valid on any `<group>`. Where the containing `<part>` has a `stack`, at least one other row in that stack must be a notated part, since a stack whose other rows are all lyric has no beat position for the connector to reach. Where the part has no `stack`, the curve marks the group's own notes and there is nothing further to satisfy.

### Span markers

- `<bow>` and `<parenthesis>` markers pair in document order within a resolved pass. Resolve the section's `<ending>` substitutions for a pass, then match within the lines that pass actually plays. See [Spans across an overridden line](/en/v0_1/reference/elements/ending/#spans-across-an-overridden-line).
- A `<line-repeat>` does not affect matching. The lines are read once, in the order they are written, however many times playback runs through them.
- On every resolved pass, a `type="start"` must be closed by a matching `type="stop"` before another `start` appears. Spans cannot nest or overlap.
- On every resolved pass, each `start` must have a matching `stop` within the same `<section-ref>`. A span left open at the end of a pass is invalid even if another pass closes it, and spans cannot cross section boundaries.
- `direction` is required on `<bow type="start">` and must not appear on `type="stop"`.
- `dim` and `mute` are valid only on `<parenthesis type="start">`.

### Annotations

- `align` is required on every `<text>` and must be `"left"`, `"center"`, or `"right"`. A `<text>` must hold text only, with no child elements.
- An `<annotation>` may hold at most one `<text>` per `align` value. Where it has `<text>` children they are its content, and any text beside them is ignored with a warning.
- `<composer>`, `<lyricist>`, and `<arranger>` follow the same rule. Their plain-text default is centered rather than left.
- An `<annotation>` or `<br>` inside a `<repeat>` is printed once, at its position in the document, and is not repeated per pass. A `<direction>` is re-read on every pass.
