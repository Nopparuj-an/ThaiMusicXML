---
title: <thai-score>
description: Root element of a ThaiMusicXML document
sidebar:
  order: 2
---

The root element of every ThaiMusicXML document.

## Attributes

| Attribute | Required | Type    | Description                                            |
| --------- | -------- | ------- | ------------------------------------------------------ |
| `version` | Yes      | string  | ThaiMusicXML schema version (e.g. `"0.1"`)             |
| `xmlns`   | Yes      | anyURI  | The ThaiMusicXML namespace, `https://thaimusicxml.anan.ovh/ns/0.1` |

## Children

In order:

1. [`<header>`](/en/v0_1/reference/elements/header/) - score metadata
2. [`<structure>`](/en/v0_1/reference/elements/structure/) - score layout
3. [`<ensemble>`](/en/v0_1/reference/elements/ensemble/) - instrument list
4. [`<part-data>`](/en/v0_1/reference/elements/part-data/) - one or more, one per instrument

## Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/0.1" version="0.1">
  <header>...</header>
  <structure>...</structure>
  <ensemble>...</ensemble>
  <part-data part="P1">...</part-data>
</thai-score>
```

## Namespace

Every ThaiMusicXML document declares the namespace `https://thaimusicxml.anan.ovh/ns/0.1` on its root. Tools match elements by namespace and name, which keeps a ThaiMusicXML `<note>` distinct from a MusicXML one and lets a ThaiMusicXML score sit inside a larger XML document without collision.

The URI identifies the vocabulary. Nothing is required to fetch it.

## File type

| | |
| --- | --- |
| Extension | `.txml` |
| Media type | `application/vnd.thaimusicxml+xml` |
| Encoding | UTF-8 |

UTF-8 matters more here than in most formats, since `pitch` values and instrument names are routinely written in Thai script.

## Which one a processor dispatches on

The namespace URI, not `version`.

The URI names a compatibility boundary rather than a release. It changes when documents stop being readable by processors written for the version before it, and holds still otherwise, so a URI a processor already knows is a promise that it can read what follows.

Where that boundary falls follows semantic versioning. Through 0.x any release may break the one before it, so each carries its own URI: `https://thaimusicxml.anan.ovh/ns/0.1`, then `https://thaimusicxml.anan.ovh/ns/0.2`. From 1.0 the URI carries the major version alone, so `https://thaimusicxml.anan.ovh/ns/1` serves 1.0, 1.1 and 1.2 alike and only 2.0 mints a new one. Adding an optional element in a minor release then leaves the tools that already exist working.

`version` tells releases apart inside a boundary. A processor written for 1.0 that meets `version="1.3"` knows it may run into optional elements added after it was written, which is a reason to warn and carry on rather than stop. Through 0.x it says nothing the namespace has not already said, so a document in the 0.1 namespace carrying `version="0.2"` is read as 0.1 and draws a warning. The namespace is the part that was promised to change.

## Notes

- Must be the single root element of the document.
- The `version` attribute records which ThaiMusicXML release the document was written against. The namespace is what a processor dispatches on.

## Conformance

- `<thai-score>` must be the single root element, carrying both `version` and the ThaiMusicXML namespace.
- A processor must reject a document whose root is in a namespace it does not implement.
- Validators should warn when `version` does not match the namespace it appears in, and must not reject on that alone.
