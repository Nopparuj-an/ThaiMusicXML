---
title: <line>
description: A musical line (phrase) within a section
---

The `<line>` element contains a musical line or phrase within a section.

## Parent

[`<section-ref>`](/en/v0_1/reference/elements/section-ref/)

## Attributes

| Attribute | Required | Type | Description |
|-----------|----------|------|-------------|
| `number` | Yes | integer | Line number within the section. |

## Children

One or more [`<measure>`](/en/v0_1/reference/elements/measure/) elements.

## Example

```xml
<line number="1">
  <measure number="1"><note pitch="ด"/><note pitch="ร"/><note pitch="ม"/><note pitch="ร"/></measure>
  <measure number="2"><note pitch="ซ"/><note pitch="ม"/><note pitch="ร"/><note pitch="ด"/></measure>
</line>
```
