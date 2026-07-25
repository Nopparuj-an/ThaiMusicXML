# ThaiMusicXML

An open, royalty-free digital notation standard for Thai traditional music (เพลงไทยเดิม/Phleng Thai Doem).

[![GPLv3 License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.txt)

## About

ThaiMusicXML is a lightweight XML schema for Thai traditional music. It models Thai musical concepts such as 7-tone scales, 8-measure grid systems, and structural speed levels (ชั้น/Chan).

Western music theory does not map directly to Thai music. ThaiMusicXML models:

- **7-Tone System**: Represented via solfège (ด, ร, ม, ฟ, ซ, ล, ท) or digits (1-7)
- **Octave Markers**: Represented via explicit attributes (low, middle, high) or native dot symbols

## Development

This project is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build/).

```sh
pnpm install
pnpm dev
```

## Contributing

Contributions are welcome from software developers, ethnomusicologists, Thai traditional musicians, and technical writers.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE.txt).
