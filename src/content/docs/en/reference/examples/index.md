---
title: ∙ Examples
description: "Complete ThaiMusicXML scores of real repertoire, each one annotated with the elements and concepts it demonstrates."
---

Full scores demonstrating ThaiMusicXML concepts in context.

## [Khaek Borathes](/en/reference/examples/khaek-borathes/)

A three-instrument piece (ระนาดเอก, ฆ้องวงใหญ่) covering:

- [`<header>`](/en/reference/elements/header/) with a `<title>`
- [`<direction>`](/en/reference/elements/direction/) setting [`<chan>`](/en/reference/elements/chan/) and [`<bpm>`](/en/reference/elements/bpm/)
- [`<repeat>`](/en/reference/elements/repeat/) wrapping a [`<section>`](/en/reference/elements/section/) to play it twice
- [`<ensemble>`](/en/reference/elements/ensemble/), [`<part>`](/en/reference/elements/part/), and [`<part-data>`](/en/reference/elements/part-data/) for multiple instruments sharing the same sections
- `<part>`'s `stack` and `row` attributes joining ฆ้องวงใหญ่ R and L as the two rows of one instrument
- Multi-line [`<section-ref>`](/en/reference/elements/section-ref/) content kept in sync across parts
- [`<note>`](/en/reference/elements/note/) pitches using Thai octave modifiers (nikhahit and pinthu)
- [`<rest>`](/en/reference/elements/rest/)
- [`<group>`](/en/reference/elements/group/) subdividing a beat into three, with a [`<link>`](/en/reference/elements/link/) span joining a run to the other row's notes

## [Sathukan](/en/reference/examples/sathukan/)

A two-row ฆ้องวงใหญ่ transcription of the หน้าพาทย์ piece สาธุการ, covering:

- Four [`<section>`](/en/reference/elements/section/)s split at a source's live-cued branch points, each transition carried as an [`<annotation>`](/en/reference/elements/annotation/) rather than an encoded repeat
- `<part>`'s `stack` and `row` attributes joining ฆ้องวงใหญ่ R and L as the two rows of one instrument
- A long score written entirely without Thai octave modifiers
- [`<rest>`](/en/reference/elements/rest/) with no [`<direction>`](/en/reference/elements/direction/) set at all

## [Chuen Chumnum - Klum Dontri](/en/reference/examples/chuen-chumnum/)

A single-part ซออู้ score holding two short สองชั้น pieces, covering:

- [`<direction>`](/en/reference/elements/direction/) setting only [`<chan>`](/en/reference/elements/chan/), with no [`<bpm>`](/en/reference/elements/bpm/)
- Two pieces in one file as two [`<section>`](/en/reference/elements/section/)s, each `name` staying internal to the file while the printed heading comes from a center-aligned [`<annotation>`](/en/reference/elements/annotation/) in `<structure>`
- [`<br>`](/en/reference/elements/br/) opening space before each heading
- [`<note>`](/en/reference/elements/note/) pitches using only the nikhahit octave modifier, with no pinthu
- [`<bow>`](/en/reference/elements/bow/) spans marking continuous bow strokes, including a single-note span and one crossing a measure boundary

## [Homrong Chom Surang](/en/reference/examples/chomsurang/)

A single-line score for the โหมโรง piece โหมโรงจอมสุรางค์, covering:

- [`<repeat times="2">`](/en/reference/elements/repeat/) wrapping a section, with [`<ending pass="2">`](/en/reference/elements/ending/) substituting just its last line
- [`<parenthesis>`](/en/reference/elements/parenthesis/) spans with `dim="true"`, marking bracketed passages from the source as cued rather than played
- [`<group>`](/en/reference/elements/group/) subdividing a beat into two in one measure and into three in another
- An empty [`<instrument-name>`](/en/reference/elements/instrument-name/) for a line the source does not attribute to any instrument
