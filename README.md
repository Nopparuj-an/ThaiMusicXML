# ThaiMusicXML

**An open digital notation standard for Thai traditional music.**

[![Apache 2.0 License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE.txt)
[![Documentation](https://img.shields.io/badge/docs-thaimusicxml.anan.ovh-blue)](https://thaimusicxml.anan.ovh/en/)

---

## What is ThaiMusicXML?

ThaiMusicXML is a free, open file format for Thai traditional music (เพลงไทยเดิม). It records the notation the way Thai musicians expects (the 7-tone scale, the beat grid, curves, ornaments, and instrument parts) in a structured form that software can validate, search, and print without tying the score to any one editor.

A ThaiMusicXML file is plain XML. It opens in a text editor, survives indefinitely without the program that created it, and can be processed by tools written in any language.

---

## Who is this for?

**Musicians and arrangers**: preserve your arrangements in a format that any future software can open, print, or convert, rather than locking them inside a proprietary file.

**Developers**: build editors, renderers, converters, and search tools for Thai music on a documented, schema-validated standard with an Apache 2.0 license. No royalties, no restrictions.

**Researchers and educators**: archive, analyse, and share scores as structured data. Search by instrument, ท่อน, ชั้น, or any other field without OCR or manual tagging.

---

## What the format captures

- The 7-tone scale **ด ร ม ฟ ซ ล ท** as scale degrees, not fixed pitches: ด is always the first degree wherever the ensemble is tuned, with octave dots above or below the note.
- The beat grid: each line (บรรทัด) holds up to eight measures (ห้อง), and every instrument shares the same measure so beats (จังหวะ) align down the page.
- A beat positioned at its end: the last note falls on the beat, the notes before it lead in.
- Rests as _no new stroke_, not silence, since Thai instruments have no notated sustain.
- Dedicated rows for ฉิ่ง and other unpitched instruments, lyrics (เนื้อร้อง), and each hand of multi-row instruments such as ฆ้องวงใหญ่. ชั้น and หน้าทับ are recorded alongside the piece.
- Bow curves (คันชัก) and gesture arcs (สะบัด) above the notation, spanning both rows of an instrument when the hands share a beat.
- Brackets for cued passages and repeat marks (ซ้ำ) in the margin.

---

## Documentation & Playground

Full specification, tutorials, and an interactive playground are at **[thaimusicxml.anan.ovh](https://thaimusicxml.anan.ovh/en/)**.

---

## Development

This repository contains the specification documentation, built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build/).

```sh
pnpm install
pnpm dev
```

The schema lives at `public/schema/thaimusicxml-1.0.rng` (RELAX NG). Corpus examples are in `public/corpus/` and can be validated with:

```sh
npm run check:corpus
```

---

## Contributing

Contributions are welcome from software developers, ethnomusicologists, Thai traditional musicians, and technical writers. You can help by:

- Reporting ambiguities or errors in the specification
- Writing parsers, renderers, or converters
- Adding corpus examples (real scores in ThaiMusicXML format)
- Improving documentation in English or Thai

See [About > Contributions](https://thaimusicxml.anan.ovh/en/about/) for how to get your name listed as a contributor.

---

## License

Licensed under the [Apache License 2.0](LICENSE.txt): free to use, adapt, and ship inside any application, open or closed source. See [NOTICE](NOTICE) for attribution requirements and [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES.md) for bundled dependency licenses.
