---
title: <br>
description: Line break
---

The `<br>` element indicates a line break.

## Parents

- [`<structure>`](/en/v1_0/reference/elements/structure/)
- [`<repeat>`](/en/v1_0/reference/elements/repeat/)

## Example

```xml
<structure>
  <annotation>Line 1</annotation>
  <br/>
  <annotation>Line 2</annotation>
</structure>
```

## Notes

- Self-closing element with no attributes.
- A `<br>` adds vertical space at the point it appears, pushing what follows further down the page, the way a blank line does in a text document. Consecutive `<br>` elements stack. See [Annotations](/en/v1_0/reference/rendering/#annotations).
