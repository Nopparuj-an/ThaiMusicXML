// Render a ThaiMusicXML file to SVG.
//
//   node renderer/render.mjs <score.txml> [out.svg]
//
// A score that overflows the page continues onto more of them; the file names
// gain a -2, -3, ... suffix when there is more than one. With no output path
// the SVG goes to stdout, which only works for a single page.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse } from "./src/parse.mjs";
import { layout } from "./src/layout.mjs";
import { draw } from "./src/draw.mjs";

const [input, output] = process.argv.slice(2);

if (!input) {
  console.error("usage: node renderer/render.mjs <score.txml> [out.svg]");
  process.exit(2);
}

const laidOut = layout(parse(readFileSync(input, "utf8")));
const svgs = laidOut.pages.map((page) =>
  draw({ width: laidOut.width, height: laidOut.height, elements: page.elements }),
);

if (!output) {
  if (svgs.length > 1) {
    console.error(`score spans ${svgs.length} pages; pass an output path`);
    process.exit(2);
  }
  process.stdout.write(svgs[0]);
} else if (svgs.length === 1) {
  writeFileSync(output, svgs[0]);
  console.error(`wrote ${output}`);
} else {
  const { dir, name, ext } = path.parse(output);
  svgs.forEach((svg, i) => {
    const file = path.join(dir, `${name}-${i + 1}${ext || ".svg"}`);
    writeFileSync(file, svg);
    console.error(`wrote ${file}`);
  });
}
