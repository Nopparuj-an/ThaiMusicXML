---
title: <bpm>
description: Sets the tempo in beats per minute
---

The `<bpm>` element sets the tempo in beats per minute.

## Parent

[`<direction>`](/en/v1_0/reference/elements/direction/)

## The unit being counted

One bpm beat is **half a measure**. A measure is two bpm beats, so at `<bpm>90</bpm>` the score plays forty-five measures a minute whatever those measures hold.

The unit is the measure rather than the note slot because the measure is what holds still. Every part agrees on how many beats a measure has (see [`<measure>`](/en/v1_0/reference/elements/measure/#beats)), but that count is a property of the measure, not of the piece: a measure of five beats and a measure of four take the same time, and the five share it out among more slots. Tying the tempo to the slot instead would make the five-beat measure a quarter longer than its neighbours, which is not what a ห้อง is.

The half is there because a measure is not the pulse either. Tapping once per measure gives half the number a musician would call the tempo, and tapping every slot of a four-slot measure gives twice it. Half a measure is the unit that lands on the scale people actually name, and in the common four-beat measure it is exactly two note slots.

## Walking the slots

In a measure of `b` beats, one slot lasts `60 / (bpm × b) × 2` seconds - the measure's own two bpm beats divided among its slots. The usual four-beat measure puts that at `30 / bpm` per slot, a third of a second at `<bpm>90</bpm>`.

Attacks fall a uniform slot apart within a measure unless a [`<group>`](/en/v1_0/reference/elements/group/) intervenes, so a player walks that measure's slots at its own interval and subdivides each group backwards inside one of them. Beat `n` arrives `n` slots from the measure's leading edge, which puts the measure's last note on its closing boundary. See [Where the children fall](/en/v1_0/reference/elements/group/#where-the-children-fall).

A measure whose beat count differs from its neighbours' is where the two readings come apart, and it is worth being exact about: the measure keeps its length and its slots run faster. Four measures of four beats and one of five, at `<bpm>60</bpm>`, take ten seconds together - two seconds each - not ten and a half.

One consequence of arrivals falling at the end of their slots: a piece's first note sounds one slot after nominal zero rather than at it, that slot being its own measure's. Nothing in a ThaiMusicXML file sits on an absolute timeline, so the offset costs nothing and a player may simply start at the first note. It matters only when synchronizing against an external clock, where the leading edge of the first measure is the reference and the first note is one slot later.

## Relationship to ชั้น

Tempo and [`<chan>`](/en/v1_0/reference/elements/chan/) are independent. Changing ชั้น at a fixed `<bpm>` does not speed the music up or slow it down.

The bpm beat is fixed at half a measure whatever the ชั้น, and expanding a piece to a higher ชั้น spreads the melody over more measures rather than packing more beats into each one, so the notes keep their rate through the change. What moves is the ฉิ่ง. Going from ชั้นเดียว to สองชั้น stretches the melody over twice as many measures, and the ฉิ่ง cycle stretches with it, so the strokes arrive half as often. The song plays at the same speed with a sparser cycle underneath it.

## Content

Integer.

## Example

```xml
<bpm>90</bpm>
```

Ninety pulses a minute, so forty-five measures a minute. At the usual four beats to the measure that is 180 note slots a minute; a measure of five beats in the same score still takes its 1.33 seconds, fitting five slots into them.

## Conformance

- Content must be a positive integer.
- One bpm beat is half a measure. A measure lasts the same time whatever its beat count, and its slots divide that time evenly among themselves.

## Rendering

Tempo is not conventionally printed on a Thai score. The value is carried for players and editors to read. See [The title band](/en/v1_0/reference/rendering/#the-title-band).
