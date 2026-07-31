// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Render a .txml (file path or inline XML string) to a PNG for docs, cropped
// to content height but keeping the page's full left/right margin in place
// (even where a short line leaves it blank) since that margin is part of the
// page's look, not incidental whitespace.
//
//   node render-doc-image.mjs <input.txml|--inline> <out.png>
//
// Reads XML from stdin when the input arg is "--inline".

import { readFileSync } from "node:fs";
import sharp from "sharp";
import { parse } from "./parse.mjs";
import { layout } from "./layout.mjs";
import { draw } from "./draw.mjs";
import { ready } from "./ready.mjs";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node renderer/src/render-doc-image.mjs <input.txml|--inline> <out.png>");
  process.exit(2);
}

await ready();
const source = input === "--inline" ? readFileSync(0, "utf8") : readFileSync(input, "utf8");
const laidOut = layout(parse(source));
if (laidOut.pages.length > 1) {
  console.error(`warning: ${laidOut.pages.length} pages, only rendering page 1`);
}
const svg = draw({ width: laidOut.width, height: laidOut.height, elements: laidOut.pages[0].elements });

const density = 150;
const PAD = 24;

const flattened = sharp(Buffer.from(svg), { density }).flatten({ background: "#ffffff" });
const { data, info } = await flattened.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

let minRow = height;
let maxRow = -1;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
      if (y < minRow) minRow = y;
      if (y > maxRow) maxRow = y;
      break;
    }
  }
}

const top = Math.max(0, minRow - PAD);
const bottom = Math.min(height, maxRow + 1 + PAD);
await sharp(data, { raw: { width, height, channels } })
  .extract({ left: 0, top, width, height: bottom - top })
  .png()
  .toFile(output);

console.error(`wrote ${output}`);
