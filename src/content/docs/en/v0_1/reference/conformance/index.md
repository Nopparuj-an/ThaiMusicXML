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

There is no XSD or RelaxNG schema for v0.1. The rules are prose, and no validator enforces them yet.

## Conforming processor

A processor is anything that reads ThaiMusicXML: a validator, a renderer, a player, a converter.

A conforming processor must reject documents that break a **must** rule, or report the violation clearly if it chooses to carry on. It must not silently repair one. Where a rule says validators **should warn**, a processor is expected to accept the document and say something.

A processor may ignore anything it has no use for. A validator with no audio output can skip [`<tuning>`](/en/v0_1/reference/elements/tuning/); a converter with no display can skip everything in the [Rendering](/en/v0_1/reference/rendering/) reference.

## Rules by area

### Document shape

- `<thai-score>` must be the single root element, carrying `version` and the namespace.
- Its children appear in order: `<header>`, `<structure>`, `<ensemble>`, then one or more `<part-data>`.
- `<header>` must contain exactly one `<title>`. Everything else in the header is optional, and `<tuning>` and `<license>` appear at most once each.

### Identity and reference

- Every `<part>` must have exactly one `<part-data>` referencing it through `part`.
- Every `<section-ref>` must reference a `<section>` that exists in `<structure>` through `section`.
- `<part-data>` elements may appear in any order. A `<part-data>` must not reference the same section twice, and need not reference every section.
- A `<part>` with `stack` must also have `row`, and vice versa. A `stack` value must be shared by at least two parts, their `row` values must run from `1` upward with no gaps or repeats, and they must be adjacent in `<ensemble>` in ascending `row` order.

### Timing

- All `<section-ref>` elements referencing the same `<section>` must agree on line count, on measure count per line, and on beat count per measure. Validators must reject documents that violate this.
- A `type="lyric"` part is bound by line count and measure count per line, and exempt from beat count per measure. Its measures hold any number of items, and it is excluded from the comparison other parts are held to.
- A `<line>` must hold one to eight `<measure>` elements.
- `number` on `<line>` and `<measure>` must match position, counting from `1`, in ascending order.
- A `<group>` must hold at least two `<note>` or `<rest>` children, and must not contain another `<group>`.

### Repetition

- `times` on `<repeat>` and `<line-repeat>` must be an integer of `1` or greater.
- A `<repeat>` must contain at least one `<section>`, directly or nested.
- `<line-repeat>` requires both `first` and `last`, with `first` no greater than `last`, and `last` no greater than the section's line count.
- Two `<line-repeat>` ranges in one section must be properly nested or wholly disjoint.
- `<ending>` is valid only when the section's total pass count exceeds `1`. Every `pass` value must fall within that count, every `<line number="N">` must replace an existing line, and the replacement must match the original's measure and beat counts.
- Every `<ending>` must carry at least one `<annotation>` captioning the variation.

### Notes and pitch

- `type` on a `<part>` must be `"pitched"`, `"unpitched"`, or `"lyric"`. Validators must reject any other value.
- A measure's children must match its part's `type`: `<note>`, `<rest>`, and `<group>` in a pitched or unpitched part, `<syllable>` and `<rest>` in a lyric part. `<note>`, `<group>`, `<bow>`, and `<parenthesis>` are not valid in a lyric part, and `<syllable>` is not valid outside one.
- A note in a `pitched` part uses `pitch`; one in an `unpitched` part uses `sound`. The two are mutually exclusive.
- `pitch` must be one of the seven base-note characters in any of the three spellings, optionally followed by one Thai octave modifier. Validators must reject any other value.
- When `pitch` carries a Thai octave modifier, that modifier wins and `octave` is ignored. Validators should warn rather than reject.
- `<chan>`'s `value` must be one of the five listed levels. Validators must reject any other value.
- `<bpm>` content must be a positive integer.

### Span markers

- `<bow>` and `<parenthesis>` markers pair by playback order, so spans are checked per resolved pass. Resolve the section's `<ending>` substitutions for a pass, then match within the lines that pass actually plays. See [Spans across an overridden line](/en/v0_1/reference/elements/ending/#spans-across-an-overridden-line).
- On every resolved pass, a `type="start"` must be closed by a matching `type="stop"` before another `start` appears. Spans cannot nest or overlap.
- On every resolved pass, each `start` must have a matching `stop` within the same `<section-ref>`. A span left open at the end of a pass is invalid even if another pass closes it, and spans cannot cross section boundaries.
- `direction` is required on `<bow type="start">` and must not appear on `type="stop"`.
- `dim` and `mute` are valid only on `<parenthesis type="start">`.

### Annotations

- An `<annotation>` must not mix plain text with `<text>` children, and may hold at most one `<text>` per `align` value.
- `<composer>`, `<lyricist>`, and `<arranger>` follow the same rule: no mixing plain text with `<text>` children, at most one `<text>` per `align` value. Their plain-text default is centered rather than left.
