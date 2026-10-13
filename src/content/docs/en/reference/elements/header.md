---
title: <header>
description: "Score metadata: what the piece is called, who is behind it, what tuning it is written against, and the terms it is published under."
---

The `<header>` element contains score metadata: what the piece is called, who is behind it, what tuning it is written against, and what terms it is published under.

## Parent

[`<thai-score>`](/en/reference/elements/thai-score/)

## Children

In order:

1. [`<title>`](/en/reference/elements/title/) - exactly one
2. [`<composer>`](/en/reference/elements/composer/) - zero or more, one per composer
3. [`<lyricist>`](/en/reference/elements/lyricist/) - zero or more, one per lyricist
4. [`<arranger>`](/en/reference/elements/arranger/) - zero or more, one per arranger
5. [`<tuning>`](/en/reference/elements/tuning/) - zero or one
6. [`<license>`](/en/reference/elements/license/) - zero or one

Only `<title>` is required. Much of the repertoire is traditional, so a score with nobody to credit is normal rather than incomplete.

## Example

```xml
<header>
  <title>Lao Duang Duen</title>
  <composer>Traditional</composer>
  <tuning reference="c-major" />
</header>
```

```xml
<header>
  <title>Example Song</title>
  <composer>Example Composer</composer>
  <lyricist>Example Lyricist</lyricist>
  <arranger>Example Arranger</arranger>
  <tuning reference="khrueang-sai" />
  <license>CC BY-SA 4.0</license>
</header>
```
