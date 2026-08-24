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
| `version` | Yes      | string  | ThaiMusicXML schema version (e.g. `"1.0"`)             |
| `xmlns`   | Yes      | anyURI  | The ThaiMusicXML namespace, `https://thaimusicxml.anan.ovh/ns/1` |

## Children

In order:

1. [`<header>`](/en/v1_0/reference/elements/header/) - score metadata
2. [`<structure>`](/en/v1_0/reference/elements/structure/) - score layout
3. [`<ensemble>`](/en/v1_0/reference/elements/ensemble/) - instrument list
4. [`<part-data>`](/en/v1_0/reference/elements/part-data/) - one or more, one per instrument
5. Zero or more foreign-namespace extension elements - a third-party tool's own state, see [Extensions](#extensions) below

## Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/1" version="1.0">
  <header>...</header>
  <structure>...</structure>
  <ensemble>...</ensemble>
  <part-data part="P1">...</part-data>
</thai-score>
```

## Namespace

Every ThaiMusicXML document declares the namespace `https://thaimusicxml.anan.ovh/ns/1` on its root. Tools match elements by namespace and name, which keeps a ThaiMusicXML `<note>` distinct from a MusicXML one and lets a ThaiMusicXML score sit inside a larger XML document without collision.

The URI identifies the vocabulary. Nothing is required to fetch it.

## Extensions

`<thai-score>` accepts foreign-namespace elements after the last `<part-data>`, an escape hatch for a third-party tool - an editor, say - to carry its own state alongside the score without forking the format. Each must declare its own namespace, at every depth, not only at the top: ThaiMusicXML's own namespace and no namespace at all are both excluded throughout the extension, so nothing inside it can ever be mistaken for native markup. Declaring a default namespace once, on the extension's own root, covers every unprefixed element beneath it.

```xml
<thai-score xmlns="https://thaimusicxml.anan.ovh/ns/1" version="1.0">
  <header>...</header>
  <structure>...</structure>
  <ensemble>...</ensemble>
  <part-data part="P1">...</part-data>
  <nts:editor xmlns:nts="https://example.com/nts/1" xmlns="https://example.com/nts/1" version="1">
    <cursor note="n1"/>
  </nts:editor>
</thai-score>
```

The `id` attribute available on [`<line>`](/en/v1_0/reference/elements/line/), [`<measure>`](/en/v1_0/reference/elements/measure/), [`<note>`](/en/v1_0/reference/elements/note/), [`<rest>`](/en/v1_0/reference/elements/rest/), and [`<group>`](/en/v1_0/reference/elements/group/) exists for this: a stable handle an extension can point at, such as `note="n1"` above, without ThaiMusicXML itself needing to know what points at it. See [Foreign-namespace extensions](/en/v1_0/reference/conformance/#foreign-namespace-extensions) in the Conformance reference for the full rules.

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
- A foreign-namespace extension element after the last `<part-data>` must declare a real namespace, neither ThaiMusicXML's own nor no namespace at all.
- A processor must preserve an extension element it does not recognize, unchanged, across a round trip, and must not let one affect how the document renders or plays.
