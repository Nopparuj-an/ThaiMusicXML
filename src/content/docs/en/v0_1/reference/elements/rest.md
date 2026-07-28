---
title: <rest>
description: A beat with no new attack
---

The `<rest>` element occupies one beat on which the instrument plays nothing new.

Thai instruments have no notated sustain. A `<rest>` means only that no note is struck, plucked, or bowed on that beat. Whatever the instrument was already sounding carries on according to its own physical decay: a ฆ้อง keeps ringing, a ระนาด damps quickly. The notation does not distinguish the two, and neither does this element.

## Parent

[`<measure>`](/en/v0_1/reference/elements/measure/) or [`<group>`](/en/v0_1/reference/elements/group/)

## Example

```xml
<rest/>
```

## Notes

- Self-closing element with no attributes.
- Each `<rest/>` occupies one beat, the same as a `<note>` in the same position. Inside a [`<group>`](/en/v0_1/reference/elements/group/) it takes an equal share of the group's single beat.
