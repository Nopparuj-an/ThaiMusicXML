---
title: About ThaiMusicXML
description: About ThaiMusicXML
---

## Project Vision

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

## Technical Inspiration & Acknowledgments

### MusicXML

ThaiMusicXML does not use or fork code from MusicXML. It was heavily inspired by the [MusicXML standard](https://www.w3.org/2021/06/musicxml40/), maintained by the W3C Music Notation Community Group.

MusicXML showed that an open, text-based XML standard can connect incompatible music software. ThaiMusicXML follows its approach to open documentation, vendor neutrality, and community governance for Thai music.

### The Thai Music Tradition

We express our deepest respect and gratitude to the masters, scholars, and musicians who have preserved Phleng Thai Doem across generations. This standard was created with the intention to make Thai musical heritage easier for software developers, researchers, and students to use.

## License

ThaiMusicXML is released under the [Apache License 2.0](https://github.com/Nopparuj-an/ThaiMusicXML/blob/main/LICENSE.txt) - free to use, adapt, and ship with your applications, even inside closed-source commercial software. All we ask is that you keep our name in the credits (see [NOTICE](https://github.com/Nopparuj-an/ThaiMusicXML/blob/main/NOTICE)) when you pass files along. The license also covers patents, protecting contributors and adopters alike. The linked files have the exact terms, if you ever need them.

## Contributions

### Help Improve ThaiMusicXML

Contributions are welcome from software developers, ethnomusicologists, Thai traditional musicians, and technical writers.

If you contribute to the specification, write parsers or renderers, or maintain the schema and documentation, you are welcome to add your name to this list.

### Maintainers

| Maintainer            | Profile                                  | Affiliation |
| --------------------- | ---------------------------------------- | ----------- |
| Nopparuj Ananvoranich | [GitHub](https://github.com/Nopparuj-an) | Independent |
