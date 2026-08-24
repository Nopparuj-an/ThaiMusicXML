---
title: <ending>
description: A per-instrument variation played on specific repeat passes
---

The `<ending>` element replaces specific `<line>` elements on specific passes of a repeated section, so a part can play something different on a given pass without restructuring its `<section-ref>`.

## Parent

[`<section-ref>`](/en/v1_0/reference/elements/section-ref/)

## Attributes

| Attribute | Required | Type   | Description                                                                         |
| --------- | -------- | ------ | ------------------------------------------------------------------------------------ |
| `pass`    | Yes      | string | Comma-separated 1-based pass numbers this ending applies to, e.g. `"2"` or `"2,4"`. |

## Children

In order:

1. [`<annotation>`](/en/v1_0/reference/elements/annotation/) - one or more, describing the variation
2. [`<line>`](/en/v1_0/reference/elements/line/) - one or more

An ending renders below its section rather than in place, detached from the line it replaces. A reader needs to be told what they are looking at, which is why the annotation is required rather than optional. Name the instrument and the occasion in whatever words suit the score: `ขิม รอบสุดท้ายเปลี่ยนเป็น` does both. See [Variant endings](/en/v1_0/reference/rendering/#variant-endings).

## Semantics

Each `<line number="N">` inside an `<ending>` replaces line `N` for the passes listed in `pass`. A line with that number must already exist directly in the `<section-ref>`. An ending substitutes lines and nothing else: it cannot add a line or remove one, so the section keeps the same shape on every pass.

On a pass not covered by any `<ending>`, the part plays its regular `<line>` elements unchanged. A `<section-ref>` with no `<ending>` elements plays identically on every pass.

An ending replaces the end of a section. Its lines must run consecutively through to the section's last line, so a five-line section admits an ending over line 5, over lines 4 and 5, and so on up to all five, but never over line 3 alone. This is what the word means: a section that carried on normally after the variation would not be ending on it.

The `number` values stay absolute, counting from the start of the section the way [`<line>`](/en/v1_0/reference/elements/line/) numbers always do. They are then redundant with the rule above, which is deliberate. An author who miscounts writes a number that no line matches and gets an error, where a count of lines from the end would have silently replaced the wrong ones.

### Pass numbers

`pass` counts absolute passes of the section, straight through from its first play to its last, regardless of which layer of [`<repeat>`](/en/v1_0/reference/elements/repeat/) produced each one. A section nested in two `times="2"` repeats has a total pass count of 4, so `pass="4"` names its last play and `pass="2,4"` puts a different variation at two points across the four.

### Unchanged measures

An `<ending>` line has to restate every measure of the line it replaces, even where a variation on the last few beats is all that changes about it. Writing out the untouched ones in full is unnecessary work and an easy place for a copy to drift from its original, so a notated part may leave any of them empty instead: a bare `<measure number="N"></measure>`, with no children at all, means that measure is unchanged from the line being replaced. Only the measures that actually differ need real content.

This applies to notated parts only. A lyric part's empty measure already has its own meaning - nothing sung, เอื้อน carrying the previous vowel on - and that meaning doesn't change just because the empty measure happens to sit inside an `<ending>`.

An unchanged measure carries over everything in the original, markers included: a `<bow>` or `<parenthesis>` marker inside it is inherited along with the notes, the same as if the measure had been retyped verbatim. A resolved pass therefore reads an unchanged measure as the original's own content, not as a gap. See [Rendering](#rendering) for how it prints.

```xml
<line number="4">
  <measure number="1"><note pitch="ซ"/><note pitch="ล"/><note pitch="ด"/><note pitch="ม"/></measure>
  <measure number="2"><note pitch="ร"/><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/></measure>
</line>

<ending pass="2">
  <annotation>ลงเที่ยว 2 ห้องสุดท้ายเปลี่ยนเป็น</annotation>
  <line number="4">
    <measure number="1"></measure>
    <measure number="2"><note pitch="ร"/><note pitch="ด"/><note pitch="ด"/><note pitch="ล"/></measure>
  </line>
</ending>
```

Measure 1 plays ซ ล ด ม on every pass, exactly as line 4 above states it; only measure 2 actually varies on pass 2. This does not relax the requirement that an `<ending>` line have the same number of `<measure>` elements as the line it replaces - an empty measure is still a measure, just one that says "no change" instead of restating notes.

### Varying the words

A [lyric part](/en/v1_0/reference/elements/part/#part-types) takes an `<ending>` like any other part, and the same exemption follows it there. Its replacement line must have the same number of measures as the line it replaces, and that is the whole of it: how many [`<syllable>`](/en/v1_0/reference/elements/syllable/) and [`<rest>`](/en/v1_0/reference/elements/rest/) items each measure holds is the words' business, on the second pass as on the first.

```xml
<line number="1">
  <measure number="1"><syllable>ลาว</syllable><rest/></measure>
</line>

<ending pass="2">
  <annotation>เนื้อร้อง เที่ยวที่ 2</annotation>
  <line number="1">
    <measure number="1"><syllable>ดวง</syllable><syllable>เดือน</syllable></measure>
  </line>
</ending>
```

The "unchanged measure" shorthand above is the one thing that does not carry over. An empty measure in a lyric part already means nothing is sung there, and it keeps that meaning inside an `<ending>`.

### Spans across an overridden line

[`<bow>`](/en/v1_0/reference/elements/bow/), [`<parenthesis>`](/en/v1_0/reference/elements/parenthesis/), and [`<link>`](/en/v1_0/reference/elements/link/) markers pair up in the order the lines are read once a pass is resolved, which is not the same as their order in the file. An `<ending>` sits after all the regular lines in the document but stands in for one of them, so the two orders come apart wherever a span reaches into a line an ending overrides.

Resolve the pass first, then match. Take the lines the part actually plays on that pass, regular lines with the ending's substitutions in place - an unchanged measure resolving to the original's own content, per [Unchanged measures](#unchanged-measures) above - and pair each `start` with the next `stop` in that sequence. Each pass is matched on its own.

A span reaching into an overridden line therefore needs its `stop` in both versions of the line: once in the regular line for the passes that play it, and once in the ending's line for the passes that play that instead - unless the measure carrying it is left unchanged, in which case it comes along with the rest of that measure's inherited content and needs no separate restatement.

```xml
<section-ref section="s1">
  <line number="1">
    <measure number="1">
      <bow type="start" direction="out"/>
      <note pitch="ซ"/><note pitch="ล"/><note pitch="ดํ"/><note pitch="ล"/>
    </measure>
  </line>
  <line number="2">
    <measure number="1">
      <note pitch="ซ"/><note pitch="ม"/>
      <bow type="stop"/>
      <note pitch="ร"/><note pitch="ด"/>
    </measure>
  </line>

  <ending pass="2">
    <annotation>เที่ยวที่ 2 จบคันชักเร็วขึ้นหนึ่งตัว</annotation>
    <line number="2">
      <measure number="1">
        <note pitch="ซ"/>
        <bow type="stop"/>
        <note pitch="ม"/><note pitch="ร"/><note pitch="ด"/>
      </measure>
    </line>
  </ending>
</section-ref>
```

The bow opens in line 1 on both passes. Pass 1 closes it on the second note of line 2, pass 2 closes it one note earlier. Neither pass sees more than one `stop`, because neither pass plays both versions of line 2.

Leaving the `stop` out of the ending's line is an error, not a shorthand: that pass would end with the span still open.

## Rendering

An ending prints below its section, detached from the line it stands in for. An unchanged measure (see [Unchanged measures](#unchanged-measures) above) prints there as an empty cell rather than the notes it inherits - a reader checks the base line above for what actually plays. See [Variant endings](/en/v1_0/reference/rendering/#variant-endings).

## Conformance

- `<ending>` is only valid inside a `<section-ref>` whose section has a total pass count greater than `1`. See [`<repeat>`](/en/v1_0/reference/elements/repeat/#total-pass-count).
- Every value in `pass` must be an integer from `1` to the section's total pass count, listed in ascending order with no repeats.
- Each `<line number="N">` in an `<ending>` must match the `number` of a line already present in the enclosing `<section-ref>`.
- An `<ending>`'s lines must form a consecutive run ending on the section's last line, in ascending order. An ending over the middle of a section is invalid.
- An `<ending>` line must have the same number of `<measure>` elements as the line it replaces. In a notated part, corresponding measures must also have the same beat count - except that a completely empty measure in a notated part is always allowed regardless of the beat count it stands in for, meaning "unchanged"; see [Unchanged measures](#unchanged-measures). This preserves the [cross-part synchronization rule](/en/v1_0/reference/elements/section-ref/#conformance): on any given pass, once every part's endings are resolved, all parts referencing the section still agree on line count, measure count, and beat count. Only the notes inside a measure may vary, or the whole measure may be left unchanged.
- A [lyric part](/en/v1_0/reference/elements/part/#part-types) matches on measure count alone. Its measures hold as many items as the words need, in an ending as anywhere else, so there is no beat count to compare. See [Varying the words](#varying-the-words).
- Two `<ending>` elements in the same `<section-ref>` must not cover the same line number for the same pass.
- An `<ending>` must carry at least one `<annotation>`. An ending prints away from the line it replaces, so it needs a caption saying which part it belongs to and when it applies.

## Example

```xml
<part-data part="P1">
  <section-ref section="s1">
    <line number="1"><!-- ... --></line>
    <line number="2"><!-- ... --></line>
    <line number="3"><!-- ... --></line>

    <ending pass="2">
      <annotation>แทนที่บรรทัดสุดท้ายในเที่ยวที่ 2 (Replace last line on pass 2)</annotation>
      <line number="3"><!-- variation, same measure count as line 3 above --></line>
    </ending>
  </section-ref>
</part-data>

<part-data part="P2">
  <!-- No <ending>: this part plays the same three lines on every pass. -->
  <section-ref section="s1">
    <line number="1"><!-- ... --></line>
    <line number="2"><!-- ... --></line>
    <line number="3"><!-- ... --></line>
  </section-ref>
</part-data>
```
