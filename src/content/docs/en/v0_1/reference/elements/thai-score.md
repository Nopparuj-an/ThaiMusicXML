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

The namespace URI, not `version`. A future version carries a new namespace URI alongside its new `version` value, so the URI alone tells a processor whether it can read the document at all.

`version` is informational within a namespace it already understands. A processor that meets `https://thaimusicxml.anan.ovh/ns/0.1` with `version="0.2"` on it should carry on reading as 0.1 and warn, because the namespace is the part that was promised to change.

## Notes

- Must be the single root element of the document.
- The `version` attribute identifies which ThaiMusicXML schema the document conforms to.

## Conformance

- `<thai-score>` must be the single root element, carrying both `version` and the ThaiMusicXML namespace.
- A processor must reject a document whose root is in a namespace it does not implement.
- Validators should warn when `version` does not match the namespace it appears in, and must not reject on that alone.
