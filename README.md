# ThaiMusicXML

An open, royalty-free digital notation standard for Thai traditional music (เพลงไทยเดิม/Phleng Thai Doem).

[![Apache 2.0 License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE.txt)

## About

ThaiMusicXML is a lightweight XML schema for Thai traditional music. It models Thai musical concepts such as 7-tone scales, 8-measure grid systems, and structural speed levels (ชั้น/Chan).

Western music theory does not map directly to Thai music. ThaiMusicXML models:

- **7-Tone System**: Represented via solfège (ด, ร, ม, ฟ, ซ, ล, ท) or digits (1-7)
- **Octave Markers**: Represented via an `octave` integer attribute, or natively within `pitch` using นิคหิต/พินทุ. Either way renders as a small dot above or below the note

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
