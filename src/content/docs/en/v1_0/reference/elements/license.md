---
title: <license>
description: The terms the score is published under
---

The `<license>` element states the terms this score is published under.

The terms cover the score as a document, not the music. Traditional repertoire is generally not anyone's to license, but a transcription of it is a piece of work with an author, and a file that travels between people benefits from saying where it stands.

## Parent

[`<header>`](/en/v1_0/reference/elements/header/)

## Content

Text. A URL or a standard identifier is easier for tools to act on than a prose description.

## Example

```xml
<license>CC BY-SA 4.0</license>
```

```xml
<license>https://creativecommons.org/licenses/by-sa/4.0/</license>
```

## Notes

- Optional, and at most one per score.
- Leaving it out says nothing about the terms. It does not imply the score is in the public domain.

## Rendering

Licensing is not conventionally printed on a Thai score. See [The title band](/en/v1_0/reference/rendering/#the-title-band).
