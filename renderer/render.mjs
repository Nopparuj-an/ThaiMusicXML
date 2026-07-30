// Render a ThaiMusicXML file to SVG.
//
//   node renderer/render.mjs <score.txml> [out.svg]
//
// With no output path the SVG goes to stdout.

import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "./src/parse.mjs";
import { layout } from "./src/layout.mjs";
import { draw } from "./src/draw.mjs";

const [input, output] = process.argv.slice(2);

if (!input) {
  console.error("usage: node renderer/render.mjs <score.txml> [out.svg]");
  process.exit(2);
}

const svg = draw(layout(parse(readFileSync(input, "utf8"))));

if (output) {
  writeFileSync(output, svg);
  console.error(`wrote ${output}`);
} else {
  process.stdout.write(svg);
}
