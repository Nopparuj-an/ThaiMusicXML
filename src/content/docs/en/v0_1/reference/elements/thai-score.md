---
title: <thai-score>
description: Root element of a ThaiMusicXML document
sidebar:
  order: 2
---

The root element of every ThaiMusicXML document.

## Attributes

| Attribute | Required | Type   | Description                                |
| --------- | -------- | ------ | ------------------------------------------ |
| `version` | Yes      | string | ThaiMusicXML schema version (e.g. `"0.1"`) |

## Children

In order:

1. [`<header>`](/en/v0_1/reference/elements/header/) - score metadata
2. [`<ensemble>`](/en/v0_1/reference/elements/ensemble/) - instrument list
3. [`<part-data>`](/en/v0_1/reference/elements/part-data/) - one or more, one per instrument

## Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<thai-score version="0.1">
  <header>...</header>
  <ensemble>...</ensemble>
  <part-data id="P1">...</part-data>
</thai-score>
```

## Notes

- Must be the single root element of the document.
- The `version` attribute identifies which ThaiMusicXML schema the document conforms to.
