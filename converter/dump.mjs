// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Print the resolved note timeline for a score, for eyeballing against the
// source: one line per resolved note or rest, tagged with the <line> and
// <measure> it came from so it can be cross-referenced by hand.
//
//   node converter/dump.mjs <score.txml> [partId]
//
// With no partId, every part is dumped in turn.

import { readFileSync } from "node:fs";
import { resolve } from "./src/resolve.mjs";

const [input, onlyPart] = process.argv.slice(2);

if (!input) {
  console.error("usage: node converter/dump.mjs <score.txml> [partId]");
  process.exit(2);
}

const doc = resolve(readFileSync(input, "utf8"));
const sections = doc.playOrder.filter((item) => item.kind === "section");

const num = (f) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

const label = (note) =>
  note.rest ? "-" : note.sound !== null && note.sound !== undefined ? `sound=${note.sound}` : note.pitch + (note.octave ? `[${note.octave}]` : "");

for (const part of doc.parts) {
  if (onlyPart && part.id !== onlyPart) continue;
  console.log(`\n== ${part.id} ${part.name ?? ""} ==`);
  for (const { id: sectionId, totalPasses } of sections) {
    const resolved = doc.resolveSection(part.id, sectionId, totalPasses);
    if (!resolved) continue; // this part does not reference this section
    for (const { pass, notes } of resolved.passes) {
      console.log(`-- section ${sectionId}, pass ${pass}/${totalPasses} --`);
      for (const note of notes) {
        console.log(
          `  line ${note.line} measure ${note.measure}  onset ${num(note.onset).padEnd(6)} dur ${num(note.duration).padEnd(6)} ${label(note)}`,
        );
      }
    }
  }
}
