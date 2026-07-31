# Third-Party Notices

ThaiMusicXML is licensed under the [Apache License 2.0](LICENSE.txt). It also
uses third-party software under its own license terms, listed below.

## Font

### Sarabun

> Copyright 2018 The Sarabun Project Authors (https://github.com/cadsondemak/Sarabun)
>
> This Font Software is licensed under the SIL Open Font License, Version 1.1.
> This license is available with a FAQ at: https://openfontlicense.org

Sarabun is the notation typeface (see [Typeface](https://github.com/Nopparuj-an/ThaiMusicXML/blob/main/src/content/docs/en/v0_1/reference/rendering/index.md#typeface)).
Its font data is embedded directly into every SVG the renderer produces, and
served by the docs site. The full license text ships with the
`@fontsource/sarabun` package (`node_modules/@fontsource/sarabun/LICENSE`).

## JavaScript libraries bundled into the built site and playground

These ship as part of the built site or the in-browser playground, under the
MIT License:

- **Astro** — Copyright (c) 2021 Fred K. Schott — https://github.com/withastro/astro
- **@astrojs/starlight** — Copyright (c) 2023 Astro contributors — https://github.com/withastro/starlight
- **astro-expressive-code** — Copyright (c) 2023 Tibor Schiemann — https://github.com/expressive-code/expressive-code
- **CodeMirror** (`codemirror`, `@codemirror/lang-xml`, `@codemirror/language`) — Copyright (C) 2018-2021 by Marijn Haverbeke and others — https://codemirror.net
- **@lezer/highlight** — Copyright (C) 2018 by Marijn Haverbeke and others — https://lezer.codemirror.net
- **opentype.js** — Copyright (c) 2020 Frederik De Bleser — https://github.com/opentypejs/opentype.js

Each package's full MIT license text ships in its own npm distribution
(`node_modules/<package>/LICENSE`) and reads, in substance:

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to
> deal in the Software without restriction, including without limitation the
> rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
> sell copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
> FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
> DEALINGS IN THE SOFTWARE.

## Node.js CLI tooling (build-time only, not shipped to browsers)

- **@xmldom/xmldom** — MIT — used by the standalone renderer CLI (`npm run render`) to parse XML outside the browser.
- **sharp** — Apache License 2.0 — used at build time for image processing; its output, not its code, ends up in the built site.
