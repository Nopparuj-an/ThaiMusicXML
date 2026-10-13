---
title: <chord>
description: "One chord symbol, written the way it should print, in a part whose type is chord. Symbols flush right against the end of the measure."
---

The `<chord>` element holds one chord symbol.

## Parent

[`<measure>`](/en/reference/elements/measure/), in a part whose [`type`](/en/reference/elements/part/) is `"chord"`.

## Content

Text, written the way it should print: `Am`, `G7`, `C/E`. Nothing parses it. v1.0 records the symbol the arranger typed and leaves root, quality, and bass note to whoever reads the page, which is also why no processor can transpose a chord part, search it by quality, or tell a typo from an unusual spelling.

Thai classical music is not built on a harmonic scheme, and a chord part does not give it one. It is for the arrangements that already have one: a piece scored for voice and guitar, a เพลงไทยสากล lead sheet, a teaching copy that writes the accompaniment down instead of leaving it to whoever is playing.

## Example

```xml
<!-- One chord in a four-beat measure: it lands on beat 4 -->
<measure number="1">
  <chord>Am</chord>
</measure>
```

```xml
<!-- Two chords in a four-beat measure: beats 3 and 4 -->
<measure number="2">
  <chord>Am</chord><chord>G</chord>
</measure>
```

## Counting

Items flush right. A measure of *n* items takes the last *n* beats, one item per beat, and the beats before them stay empty. So one chord in a four-beat measure is a chord on beat 4, and two are chords on beats 3 and 4.

The default falls out of how a measure is read. A beat arrives on its last slot and the measure travels toward its final note, so the end of the measure is where the harmony has to have got to, and that is the beat a lone symbol is making a claim about. See [`<measure>`'s Beats](/en/reference/elements/measure/#beats).

Anywhere else, pad with [`<rest>`](/en/reference/elements/rest/). A rest holds a beat and prints nothing, so trailing rests push the symbols before them earlier in the measure:

```xml
<!-- Four items, so all four beats are claimed: Am on beat 2, G on beat 4 -->
<measure number="3">
  <rest/><chord>Am</chord><rest/><chord>G</chord>
</measure>
```

```xml
<!-- Two items: Am on beat 3, nothing on beat 4 -->
<measure number="4">
  <chord>Am</chord><rest/>
</measure>
```

A leading rest changes nothing, since the run is flush right already. It is the rests after a symbol that move it.

## Where nothing is written

A chord part records changes rather than a chord per beat. A measure with no children at all means no change: whatever was last written carries on through it, and nothing prints. A `<rest>` says the same thing about a single beat.

This is where a chord row parts company with a lyric row. A rest in a lyric row is เอื้อน, something the singer is doing. A rest in a chord row is spacing and nothing more.

## Counting against the music

Every item claims a beat, which is why a chord measure may hold no more items than the measure has beats. A five-item chord measure over a four-beat measure has an item with nowhere to go, and a validator rejects it.

A [lyric part](/en/reference/elements/part/#part-types) has no such ceiling, and the difference is deliberate. Words often do not divide the way the melody does, so a lyric measure is free of the beat grid and says so by holding a count that does not match. A chord symbol is always a claim about a particular beat, so it stays on the grid.

Below the ceiling, a chord part is as exempt from the beat-count agreement as a lyric part is. It shares the line and measure grid with every other part and contributes nothing to what the beat count is. See [`<section-ref>`](/en/reference/elements/section-ref/#conformance).

## Conformance

- `<chord>` is valid only inside a `<measure>` in a part whose `type` is `"chord"`.
- A chord part's measures must contain only `<chord>` and `<rest>` children. `<note>`, `<group>`, `<syllable>`, `<bow>`, `<parenthesis>`, and `<link>` are not valid there.
- `<chord>` content must not be empty.
- A chord measure's item count must not exceed the beat count of the corresponding measures in the notated parts. It may be smaller, and it may be zero.
- A chord part must still agree with every other part on line count and on the number of measures in each line.
- A chord part must not carry `stack` or `row`.

## Rendering

Items sit on the beats they claim, flush right, in a row of their own. See [Chord rows](/en/reference/rendering/#chord-rows).
