---
title: <arranger>
description: Who arranged this setting of the piece
---

The `<arranger>` element names whoever produced this particular setting of the piece.

Much of the repertoire is traditional, so a score often has no composer to name but a known arranger: the person who set it for this ensemble, expanded it to a different ชั้น, or wrote down a teacher's version.

## Parent

[`<header>`](/en/v0_1/reference/elements/header/)

## Content

Either plain text or up to three [`<text>`](/en/v0_1/reference/elements/text/) children, one per alignment, the same content model [`<annotation>`](/en/v0_1/reference/elements/annotation/#content) uses. `align` is required on each and accepts `left`, `center`, or `right`, and each alignment may appear at most once.

Plain text renders centered. That differs from `<annotation>`, where plain text is left-aligned, because a credit sits under the title rather than in the body of the score.

The text prints exactly as written. Nothing is prefixed or appended, so a score reading `ผู้เรียบเรียง : Example Arranger` is one where the arranger typed that whole string. A tool reading this as metadata takes the same text, concatenating the `<text>` children left to right when there are several.

## Example

```xml
<header>
  <arranger>Example Arranger</arranger>
</header>
```

```xml
<!-- Right-aligned, with the label the arranger wants -->
<header>
  <arranger>
    <text align="right">ผู้เรียบเรียง : Example Arranger</text>
  </arranger>
</header>
```

## Notes

- Optional. Omit it when the arranger is unknown or the question does not apply.
- Use one `<arranger>` element per person when several worked on the setting.
- Renders in the title band. See [The title band](/en/v0_1/reference/rendering/#the-title-band).

## Conformance

- Where an `<arranger>` has `<text>` children, they are its content and any sibling text is ignored. Validators should warn when the ignored text is not merely whitespace.
- At most one `<text>` child per `align` value.
