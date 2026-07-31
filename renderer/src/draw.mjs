// Positioned elements to SVG.
//
// Deliberately stupid. It receives coordinates and emits shapes, and knows
// nothing about beats, parts or measures, so a layout bug cannot hide here.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defaults } from "./settings.mjs";

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// The SVG names "Sarabun" in font-family but, unlike the docs site, does
// nothing to make sure whatever opens the file actually has it: a bare
// font-family is only a request, and a viewer without Sarabun installed falls
// back to whatever "sans-serif" resolves to instead, silently. Embedding the
// same font `@fontsource/sarabun` already ships - and the same file
// text.mjs measures widths from - makes the SVG self-contained: correct in
// any browser or tool that reads @font-face, whether or not Sarabun happens
// to be installed system-wide. A viewer that ignores @font-face entirely is
// no worse off than before, since the font-family fallback chain is unchanged.
//
// Fontsource splits the family by script with no unicode-range, which is
// deliberate on their part rather than an oversight: same font-family and
// font-weight, and a browser tries each @font-face in the order given and
// uses the first one that actually has the glyph, the same per-glyph
// fallback a system font stack does. Thai and Latin are the two scripts a
// Thai score's text actually uses - the pitch letters and romanized spellings
// between them - so those are the two subsets loaded, at the two weights
// draw() emits: regular for everything, bold for the title.
function loadFontBase64(file) {
  const url = import.meta.resolve(`@fontsource/sarabun/files/${file}`);
  return readFileSync(fileURLToPath(url)).toString("base64");
}

const FONT_FACES = [
  ["sarabun-thai-400-normal.woff2", 400],
  ["sarabun-latin-400-normal.woff2", 400],
  ["sarabun-thai-700-normal.woff2", 700],
  ["sarabun-latin-700-normal.woff2", 700],
]
  .map(
    ([file, weight]) =>
      `    @font-face { font-family: "Sarabun"; font-weight: ${weight}; ` +
      `src: url(data:font/woff2;base64,${loadFontBase64(file)}) format("woff2"); }`,
  )
  .join("\n");

export function draw(page, options = {}) {
  const s = { ...defaults, ...options };

  const body = page.elements.map((el) => {
    if (el.kind === "line")
      return `  <line x1="${round(el.x1)}" y1="${round(el.y1)}" x2="${round(el.x2)}" y2="${round(el.y2)}"/>`;

    // An arc bowing up over the notes it marks.
    if (el.kind === "arc") {
      const mid = (el.x1 + el.x2) / 2;
      return (
        `  <path class="link" d="M ${round(el.x1)} ${round(el.y)}` +
        ` Q ${round(mid)} ${round(el.y - el.rise)} ${round(el.x2)} ${round(el.y)}"/>`
      );
    }

    // A connector arching over a run. Layout picks the control point, which
    // sits at one corner of the box the two ends span, so the stroke leaves one
    // note and arrives at the other along the arch instead of cutting straight
    // across as a diagonal.
    if (el.kind === "curve")
      return (
        `  <path class="link" d="M ${round(el.x1)} ${round(el.y1)}` +
        ` Q ${round(el.cx)} ${round(el.cy)} ${round(el.x2)} ${round(el.y2)}"/>`
      );

    const weight = el.weight ? ` font-weight="${el.weight}"` : "";
    const fill = el.dim ? ` fill="${s.dimColor}"` : "";
    return (
      `  <text x="${round(el.x)}" y="${round(el.y)}" font-size="${el.size}"` +
      ` text-anchor="${el.anchor}"${weight}${fill}>${escape(el.text)}</text>`
    );
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}"`,
    `     viewBox="0 0 ${page.width} ${page.height}" font-family="${s.fontFamily}">`,
    `  <defs>`,
    `    <style>`,
    FONT_FACES,
    `    </style>`,
    `  </defs>`,
    `  <rect width="100%" height="100%" fill="#fff"/>`,
    `  <g stroke="#000" stroke-width="0.7" fill="none">`,
    ...body.filter((l) => l.includes("<line")),
    `  </g>`,
    `  <g stroke="#000" stroke-width="${s.linkStroke}" fill="none" stroke-linecap="round">`,
    ...body.filter((l) => l.includes("<path")),
    `  </g>`,
    `  <g fill="#000" stroke="none">`,
    ...body.filter((l) => l.includes("<text")),
    `  </g>`,
    `</svg>`,
  ].join("\n");
}

const round = (n) => Math.round(n * 100) / 100;
