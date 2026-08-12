// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Convert a ThaiMusicXML document to MusicXML or MIDI. See
// reference/conversion in the docs for the mapping policy this implements.
//
//   node converter/convert.mjs <score.txml> --to musicxml|midi [options]
//
// Options:
//   --out <path>              Output file. Defaults to the input's own name
//                              with .musicxml or .mid, next to it.
//   --tuning <reference>      Override <tuning> or its absence (e.g. c-major,
//                              bb-major), regardless of what the file declares.
//   --split-stacks            Give each stacked row its own part/track
//                              instead of merging them into one.
//   --instrument-map <file>   JSON file overriding MIDI General MIDI patch
//                              lookup: { "substring of instrument-name": 41 },
//                              program numbers 1-indexed as GM names them.
//   --percussion-map <file>   JSON file overriding MIDI percussion notes:
//                              { "sound code": 38 }.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { resolve } from "./src/resolve.mjs";
import { toMusicXml } from "./src/to-musicxml.mjs";
import { toMidi } from "./src/to-midi.mjs";

function usage(message) {
  if (message) console.error(`error: ${message}\n`);
  console.error(
    "usage: node converter/convert.mjs <score.txml> --to musicxml|midi [--out <path>] [--tuning <reference>] [--split-stacks] [--instrument-map <file>] [--percussion-map <file>]",
  );
  process.exit(2);
}

function parseArgs(argv) {
  const options = { splitStacks: false };
  let input = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--to":
        options.to = argv[++i];
        break;
      case "--out":
        options.out = argv[++i];
        break;
      case "--tuning":
        options.tuning = argv[++i];
        break;
      case "--split-stacks":
        options.splitStacks = true;
        break;
      case "--instrument-map":
        options.instrumentMap = JSON.parse(readFileSync(argv[++i], "utf8"));
        break;
      case "--percussion-map":
        options.percussionMap = JSON.parse(readFileSync(argv[++i], "utf8"));
        break;
      default:
        if (arg.startsWith("--")) usage(`unrecognized option "${arg}"`);
        else if (input) usage(`unexpected extra argument "${arg}"`);
        else input = arg;
    }
  }
  return { input, options };
}

const { input, options } = parseArgs(process.argv.slice(2));

if (!input) usage("missing input file");
if (options.to !== "musicxml" && options.to !== "midi") usage('--to must be "musicxml" or "midi"');

const warn = (message) => console.error(`warning: ${message}`);
const doc = resolve(readFileSync(input, "utf8"));

const { dir, name } = path.parse(input);
const defaultOut = path.join(dir, `${name}.${options.to === "musicxml" ? "musicxml" : "mid"}`);
const out = options.out ?? defaultOut;

if (options.to === "musicxml") {
  const xml = toMusicXml(doc, { tuning: options.tuning, splitStacks: options.splitStacks, warn });
  writeFileSync(out, xml, "utf8");
} else {
  const buf = toMidi(doc, {
    tuning: options.tuning,
    splitStacks: options.splitStacks,
    instrumentMap: options.instrumentMap,
    percussionMap: options.percussionMap,
    warn,
  });
  writeFileSync(out, buf);
}

console.error(`wrote ${out}`);
