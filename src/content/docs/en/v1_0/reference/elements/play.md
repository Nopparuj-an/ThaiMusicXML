---
title: <play>
description: Plays a section again later in the piece, without a second copy of its music
---

The `<play>` element plays a section again at a later point in the score.

[`<section>`](/en/v1_0/reference/elements/section/) declares that a section exists and takes its first place in the play order. `<play>` takes another one. The music itself stays where it was written, in that section's [`<section-ref>`](/en/v1_0/reference/elements/section-ref/) content, and is not copied.

## Parents

- [`<structure>`](/en/v1_0/reference/elements/structure/)
- [`<repeat>`](/en/v1_0/reference/elements/repeat/)

## Attributes

| Attribute | Required | Type  | Description                                         |
| --------- | -------- | ----- | --------------------------------------------------- |
| `section` | Yes      | IDREF | References a `<section id="...">` in `<structure>`. |

## Children

None.

## Semantics

A `<play>` adds one play of the section it names, at the point where it sits. This is what makes ABA form writable: ท่อน 1, ท่อน 2, then ท่อน 1 again.

```xml
<structure>
  <section id="s1" name="ท่อน 1"/>
  <section id="s2" name="ท่อน 2"/>
  <annotation>กลับต้น</annotation>
  <play section="s1"/>
</structure>
```

The alternative, a second `<section>` holding a copy of the same lines, says something different and worse: it claims the piece has two sections that happen to be identical, gives every part a second set of notes to keep in step with the first, and prints the music twice on a page where a reader expects กลับต้น.

A `<repeat>` covers the case where the same run plays twice in a row. `<play>` covers the case where a section comes back after something else, which no `<repeat>` around a contiguous run can express.

### Pass numbers

A `<play>` adds to the section's total pass count, and passes are counted absolutely across every play of that section wherever it falls. In the example above ท่อน 1 has two passes: the first where it is declared, the second at the `<play>`. An [`<ending>`](/en/v1_0/reference/elements/ending/) with `pass="2"` therefore varies the return and not the first time through, which is the usual reason a piece returns at all.

Plays inside a `<repeat>` count the same way. `<play>` inside a `times="2"` repeat contributes two of them.

## Notes

- `<play>` does not declare a section, so a section still has exactly one `<section>` element and exactly one place its `name` and [`<line-repeat>`](/en/v1_0/reference/elements/line-repeat/) children are written.
- A `<repeat>` whose only content is `<play>` elements is fine. It has something to play.
- Nothing stops a `<play>` naming a section that has not been declared yet in document order, but the two orders will not match, and reading the score becomes harder than it needs to be.

## Conformance

- `section` is required and must reference a `<section>` declared in `<structure>`.
- `<play>` has no children.
- Each `<play>` adds one play of its section to the total pass count, multiplied by the `times` of every `<repeat>` enclosing it. See [`<repeat>`](/en/v1_0/reference/elements/repeat/#total-pass-count).

## Rendering

A `<play>` prints nothing. The section's grid is already on the page where it was declared, and a return to it is written by the arranger as an [`<annotation>`](/en/v1_0/reference/elements/annotation/) such as `กลับต้น`. See [Repeat brackets](/en/v1_0/reference/rendering/#repeat-brackets).
