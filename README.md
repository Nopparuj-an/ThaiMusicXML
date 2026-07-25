# ThaiMusicXML

An open, royalty-free digital notation standard for Thai traditional music (เพลงไทยเดิม/Phleng Thai Doem).

[![GPLv3 License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.txt)

## About

ThaiMusicXML is a lightweight XML schema designed specifically for Thai traditional music. It models native Thai primitives including 7-tone scales, 8-measure grid systems, and structural speed levels (ชั้น/Chan).

Western music theory does not natively map to Thai music. ThaiMusicXML addresses this by modeling:

- **7-Tone System** — Represented via solfège (ด, ร, ม, ฟ, ซ, ล, ท) or digits (1–7)
- **Octave Markers** — Represented via explicit attributes (low, middle, high) or native dot symbols

## Development

This project is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build/).

```sh
pnpm install
pnpm dev
```

## Contributing

We are looking for software developers, ethnomusicologists, Thai traditional musicians, and technical writers to help shape this standard.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE.txt).
