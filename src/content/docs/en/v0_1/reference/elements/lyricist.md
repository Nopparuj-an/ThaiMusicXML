---
title: <lyricist>
description: The writer of the piece's lyrics
---

The `<lyricist>` element names whoever wrote the words to the piece.

## Parent

[`<header>`](/en/v0_1/reference/elements/header/)

## Content

Text.

## Example

```xml
<header>
  <title>Example Song</title>
  <lyricist>Example Lyricist</lyricist>
</header>
```

## Notes

- Optional. Omit it for instrumental pieces, or when the lyricist is unknown, rather than filling it with a placeholder.
- Use one `<lyricist>` element per person when a piece has several.
- This names the writer only. ThaiMusicXML v0.1 has no element for the lyrics themselves.
