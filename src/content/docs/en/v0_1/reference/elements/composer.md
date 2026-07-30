---
title: <composer>
description: The composer or attribution of the piece
---

The `<composer>` element identifies the composer or attribution of the piece.

## Parent

[`<header>`](/en/v0_1/reference/elements/header/)

## Content

Either plain text or up to three [`<text>`](/en/v0_1/reference/elements/text/) children, one per alignment, the same content model [`<annotation>`](/en/v0_1/reference/elements/annotation/#content) uses. `align` is required on each and accepts `left`, `center`, or `right`, and each alignment may appear at most once.

Plain text renders centered. That differs from `<annotation>`, where plain text is left-aligned, because a credit sits under the title rather than in the body of the score.

The text prints exactly as written. Nothing is prefixed or appended, so a score reading `ผู้ประพันธ์ : พระประดิษฐไพเราะ` is one where the arranger typed that whole string. A tool reading this as metadata takes the same text, concatenating the `<text>` children left to right when there are several.

## Example

```xml
<header>
  <composer>Traditional</composer>
</header>
```

```xml
<!-- Right-aligned, with the label the arranger wants -->
<header>
  <composer>
    <text align="right">ผู้ประพันธ์ : พระประดิษฐไพเราะ</text>
  </composer>
</header>
```

## Notes

- Optional. Omit it if the composer is unknown or not applicable, rather than filling it with a placeholder.
- Use one `<composer>` element per composer when a piece has several.
- Renders in the title band. See [The title band](/en/v0_1/reference/rendering/#the-title-band).

## Conformance

- Where a `<composer>` has `<text>` children, they are its content and any sibling text is ignored. Validators should warn when the ignored text is not merely whitespace.
- At most one `<text>` child per `align` value.
