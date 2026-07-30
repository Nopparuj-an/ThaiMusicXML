// Positioned elements to SVG.
//
// Deliberately stupid. It receives coordinates and emits shapes, and knows
// nothing about beats, parts or measures, so a layout bug cannot hide here.

import { defaults } from "./settings.mjs";

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function draw(page, options = {}) {
  const s = { ...defaults, ...options };

  const body = page.elements.map((el) => {
    if (el.kind === "line")
      return `  <line x1="${round(el.x1)}" y1="${round(el.y1)}" x2="${round(el.x2)}" y2="${round(el.y2)}"/>`;

    const weight = el.weight ? ` font-weight="${el.weight}"` : "";
    return (
      `  <text x="${round(el.x)}" y="${round(el.y)}" font-size="${el.size}"` +
      ` text-anchor="${el.anchor}"${weight}>${escape(el.text)}</text>`
    );
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}"`,
    `     viewBox="0 0 ${page.width} ${page.height}" font-family="${s.fontFamily}">`,
    `  <rect width="100%" height="100%" fill="#fff"/>`,
    `  <g stroke="#000" stroke-width="0.7" fill="none">`,
    ...body.filter((l) => l.includes("<line")),
    `  </g>`,
    `  <g fill="#000" stroke="none">`,
    ...body.filter((l) => l.includes("<text")),
    `  </g>`,
    `</svg>`,
  ].join("\n");
}

const round = (n) => Math.round(n * 100) / 100;
