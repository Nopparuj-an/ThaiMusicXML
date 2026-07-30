---
title: <lyricist>
description: The writer of the piece's lyrics
---

The `<lyricist>` element names whoever wrote the words to the piece.

## Parent

[`<header>`](/en/v0_1/reference/elements/header/)

## Content

Either plain text or up to three [`<text>`](/en/v0_1/reference/elements/text/) children, one per alignment, the same content model [`<annotation>`](/en/v0_1/reference/elements/annotation/#content) uses. `align` is required on each and accepts `left`, `center`, or `right`, and each alignment may appear at most once.

Plain text renders centered. That differs from `<annotation>`, where plain text is left-aligned, because a credit sits under the title rather than in the body of the score.

The text prints exactly as written. Nothing is prefixed or appended, so a score reading `ผู้แต่งคำร้อง : Example Lyricist` is one where the arranger typed that whole string. A tool reading this as metadata takes the same text, concatenating the `<text>` children left to right when there are several.

## Example

```xml
<header>
  <lyricist>Example Lyricist</lyricist>
</header>
```

```xml
<!-- Right-aligned, with the label the arranger wants -->
<header>
  <lyricist>
    <text align="right">ผู้แต่งคำร้อง : Example Lyricist</text>
  </lyricist>
</header>
```

## Notes

- Optional. Omit it for instrumental pieces, or when the lyricist is unknown, rather than filling it with a placeholder.
- Use one `<lyricist>` element per person when a piece has several.
- This names the writer only. The words themselves go in a [lyric part](/en/v0_1/reference/elements/part/#part-types), as [`<syllable>`](/en/v0_1/reference/elements/syllable/) elements on the grid.
- Renders in the title band. See [The title band](/en/v0_1/reference/rendering/#the-title-band).

## Conformance

- Where a `<lyricist>` has `<text>` children, they are its content and any sibling text is ignored. Validators should warn when the ignored text is not merely whitespace.
- At most one `<text>` child per `align` value.
