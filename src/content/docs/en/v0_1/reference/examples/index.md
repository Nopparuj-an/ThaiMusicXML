---
title: ∙ Examples
description: Examples for ThaiMusicXML
---

Full scores demonstrating ThaiMusicXML concepts in context.

## [Khaek Borathes](/en/v0_1/reference/examples/khaek-borathes/)

A three-instrument piece (ระนาดเอก, ฆ้องวงใหญ่ R, ฆ้องวงใหญ่ L) covering:

- [`<header>`](/en/v0_1/reference/elements/header/) with a `<title>`
- [`<direction>`](/en/v0_1/reference/elements/direction/) setting [`<chan>`](/en/v0_1/reference/elements/chan/) and [`<bpm>`](/en/v0_1/reference/elements/bpm/)
- [`<repeat>`](/en/v0_1/reference/elements/repeat/) wrapping a [`<section>`](/en/v0_1/reference/elements/section/) to play it twice
- [`<ensemble>`](/en/v0_1/reference/elements/ensemble/), [`<part>`](/en/v0_1/reference/elements/part/), and [`<part-data>`](/en/v0_1/reference/elements/part-data/) for multiple instruments sharing the same sections
- `<part>`'s `stack` and `row` attributes joining ฆ้องวงใหญ่ R and L as the two rows of one instrument
- Multi-line [`<section-ref>`](/en/v0_1/reference/elements/section-ref/) content kept in sync across parts
- [`<note>`](/en/v0_1/reference/elements/note/) pitches using Thai octave modifiers (nikhahit and pinthu)
- [`<rest>`](/en/v0_1/reference/elements/rest/)
- [`<group>`](/en/v0_1/reference/elements/group/) subdividing a beat into three, with `link` joining a group to the other row's beat
