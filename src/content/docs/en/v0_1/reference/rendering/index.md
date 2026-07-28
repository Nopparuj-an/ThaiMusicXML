---
title: ★ Rendering
description: Non-normative guidance for laying out and displaying a ThaiMusicXML score
---

Everything on this page is **non-normative**. It describes how a score is conventionally laid out and displayed, so that renderers agree with each other and with printed Thai scores. None of it affects whether a document is valid, and a processor that only reads or converts data can ignore all of it.

Where the spec leaves a display decision open, that is deliberate. The markup records what the music is; how it looks belongs to the renderer and its settings.

## Score layout

A full score stacks one row per part. A two-handed instrument is a pair of parts joined by `pair` (see [`<part>`](/en/v0_1/reference/elements/part/)); the two hands read as one instrument.

Rows nest in four levels, from innermost to outermost:

1. The two hands of a pair.
2. The instruments playing one line, meaning every part's row for the same `<line number="N">`.
3. The lines of one section.
4. The sections of the score.

Skip any level that has only one member: a single-line instrument has no hand level, a solo score has no instrument level. Of the levels that remain, the innermost gets no break at all, and each level outward gets a larger one.

That produces the four common arrangements:

| Ensemble | Between hands | Between instruments | Between lines | Between sections |
| -------- | ------------- | ------------------- | ------------- | ---------------- |
| One single-line instrument | n/a | n/a | none | small |
| One two-handed instrument | none | n/a | small | larger |
| Several single-line instruments | n/a | none | small | larger |
| Single-line and two-handed mixed | none | small | larger | largest |

## Bow spans across a line break

Both bow directions render above the notes: `in` as a curve with both tips pointing down, `out` as a curve with both tips pointing up.

When a [`<bow>`](/en/v0_1/reference/elements/bow/) span crosses a `<line>` boundary, draw it as two arcs. One runs from the start marker to the end of its line, the other from the start of the next line to the stop marker. At the cut, render the tip parallel to the horizon instead of pointing up or down, signalling that the stroke continues onto the next line. The tips at the span's true start and true stop still follow `direction`.

## Linked groups

A [`<group>`](/en/v0_1/reference/elements/group/) with `link` draws a curve to whatever the paired hand plays on the same beat, showing that the two hands belong to one gesture. The connector carries no timing information: the group's subdivision already describes the rhythm.

## Cued passages

A [`<parenthesis>`](/en/v0_1/reference/elements/parenthesis/) span marks notes the part waits out while another instrument leads. Whether to show it in a less distinct color, and whether to mute it on playback, is left to the renderer or player's own settings. The `dim` and `mute` attributes override those settings for one span when the score needs to be explicit.

## Octaves beyond the Thai spellings

Thai script has one nikhahit and one pinthu, so it can spell exactly three octaves: `-1`, `0`, and `1`. A [`<note>`](/en/v0_1/reference/elements/note/) may carry any integer `octave`, and values outside that range have no Thai spelling to display.

The spec does not dictate what to show for them. The `octave` value is authoritative and must be preserved for playback whatever the renderer displays. Renderers should make clear that the displayed note is not the whole story rather than showing a capped spelling as if it were exact, since a reader transcribing from the display would otherwise introduce a real error. How to do that, whether by falling back to numeric pitch, by marking the note, or some other way, is the renderer's decision.
