---
title: <arranger>
description: Who arranged this setting of the piece
---

The `<arranger>` element names whoever produced this particular setting of the piece.

Much of the repertoire is traditional, so a score often has no composer to name but a known arranger: the person who set it for this ensemble, expanded it to a different ชั้น, or wrote down a teacher's version.

## Parent

[`<header>`](/en/v0_1/reference/elements/header/)

## Content

Text.

## Example

```xml
<header>
  <title>แขกบรเทศ ชั้นเดียว</title>
  <arranger>Example Arranger</arranger>
</header>
```

## Notes

- Optional. Omit it when the arranger is unknown or the question does not apply.
- Use one `<arranger>` element per person when several worked on the setting.
