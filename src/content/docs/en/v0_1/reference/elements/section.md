---
title: <section>
description: A named section of the score
---

The `<section>` element defines a named section of the score.

## Parent

[`<structure>`](/en/v0_1/reference/elements/structure/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `id` | Yes | ID | Unique identifier. Referenced by `<section-ref id="...">`. |
| `number` | Yes | integer | Section order within the score. |
| `name` | No | string | Human-readable label (e.g. `"ท่อน 1"`). |
| `repeat` | No | integer | How many times the section is played. Default: `1`. |

## Example

```xml
<section id="s1" number="1" name="ท่อน 1" repeat="2" />
```

## Notes

- Referenced by [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) in part data.
