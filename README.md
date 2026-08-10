# ThaiMusicXML

An open, royalty-free digital notation standard for Thai traditional music (เพลงไทยเดิม/Phleng Thai Doem).

[![Apache 2.0 License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE.txt)

## About

ThaiMusicXML is an open, royalty-free file format for Thai traditional music (เพลงไทยเดิม/Phleng Thai Doem). It records the notation Thai musicians already read, in a form software can validate, search, print, and hand to another program without tying the score to one editor.

What the format records:

- The 7-tone scale ด ร ม ฟ ซ ล ท as scale degrees rather than fixed pitches. ด is the first degree wherever the ensemble is tuned, and the octave is a dot above or below the note.
- The grid: each line (บรรทัด) holds up to eight measures (ห้อง), and every instrument shares the same measure, so the beats (จังหวะ) line up down the page.
- A beat positioned at its end, so the last note lands on the beat and the notes before it lead in.
- A rest that means no new stroke rather than silence, since Thai instruments have no notated sustain.
- A row of its own for ฉิ่ง and other unpitched instruments, for lyrics (เนื้อร้อง), and for each hand of an instrument written across several rows, such as ฆ้องวงใหญ่. ชั้น and หน้าทับ are recorded alongside the piece.
- Curves above the notation: the bow (คันชัก) held in one direction across a run of notes, and the arc that ties a group into one gesture (สะบัด), which reaches across both rows of an instrument when the hands share the beat.
- Brackets around a passage that another instrument leads and the part waits out, and a repeat mark (ซ้ำ) in the margin beside the lines it covers.

A file stays close to what a musician reads on paper and still parses as data, so a score can be archived, corrected, and printed again long after the program that wrote it is gone.

## Development

This project is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build/).

```sh
pnpm install
pnpm dev
```

## Contributing

Contributions are welcome from software developers, ethnomusicologists, Thai traditional musicians, and technical writers.

## License

This project is licensed under the [Apache License 2.0](LICENSE.txt). See [NOTICE](NOTICE) for attribution and [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES.md) for the licenses of bundled dependencies, including the Sarabun font.
