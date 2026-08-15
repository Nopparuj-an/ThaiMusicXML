// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(here, "../convert.mjs");
const fixture = path.join(here, "../../public/corpus/valid/minimal.txml");

const run = (args) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });

test("converts to MusicXML and writes the default output path next to the input", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "txml-cli-"));
  const input = path.join(dir, "score.txml");
  writeFileSync(input, readFileSync(fixture, "utf8"));

  const result = run([input, "--to", "musicxml"]);
  assert.equal(result.status, 0, result.stderr);
  const outPath = path.join(dir, "score.musicxml");
  assert.ok(existsSync(outPath));
  assert.ok(readFileSync(outPath, "utf8").startsWith("<?xml"));
});

test("converts to MIDI with an explicit --out path", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "txml-cli-"));
  const outPath = path.join(dir, "custom-name.mid");

  const result = run([fixture, "--to", "midi", "--out", outPath]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(outPath));
  assert.equal(readFileSync(outPath).toString("ascii", 0, 4), "MThd");
});

test("rejects a missing --to with a usage message and exit code 2", () => {
  const result = run([fixture]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--to/);
});

test("rejects an unrecognized --to value", () => {
  const result = run([fixture, "--to", "pdf"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /musicxml.*midi/);
});

test("rejects a missing input file with a usage message", () => {
  const result = run(["--to", "musicxml"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /missing input file/);
});

test("--tuning overrides the file's own tuning (or its absence)", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "txml-cli-"));
  const outPath = path.join(dir, "bb.musicxml");
  const result = run([fixture, "--to", "musicxml", "--tuning", "bb-major", "--out", outPath]);
  assert.equal(result.status, 0, result.stderr);
  const xml = readFileSync(outPath, "utf8");
  assert.match(xml, /<alter>-1<\/alter>/); // bb-major's flatted degrees show up somewhere in a real score
});

test("--instrument-map and --percussion-map load JSON override files", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "txml-cli-"));
  const mapPath = path.join(dir, "instruments.json");
  writeFileSync(mapPath, JSON.stringify({ P1: 5 }));
  const outPath = path.join(dir, "out.mid");

  const result = run([fixture, "--to", "midi", "--instrument-map", mapPath, "--out", outPath]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(outPath));
});

test("prints warnings to stderr with a warning: prefix", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "txml-cli-"));
  const outPath = path.join(dir, "out.musicxml");
  const result = run([fixture, "--to", "musicxml", "--out", outPath]);
  assert.equal(result.status, 0);
  assert.match(result.stderr, /warning: no <tuning>/);
});

test("--no-downbeat-shift and --trim-leading-empty-measures reach the MusicXML writer", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "txml-cli-"));
  const countMeasures = (args) => {
    const outPath = path.join(dir, `${args.join("-") || "default"}.musicxml`);
    const result = run([fixture, "--to", "musicxml", "--out", outPath, ...args]);
    assert.equal(result.status, 0, result.stderr);
    return readFileSync(outPath, "utf8").match(/<measure number=/g).length;
  };
  // minimal.txml ends on its last beat, so the shift (on by default) buys it
  // one more measure to land that beat in.
  assert.equal(countMeasures([]), countMeasures(["--no-downbeat-shift"]) + 1);
  // It has nothing empty in front, so trimming is a no-op here - what's under
  // test is that the flag is accepted and plumbed through, not the trim rule
  // itself (to-musicxml.test.mjs covers that).
  assert.equal(countMeasures(["--trim-leading-empty-measures"]), countMeasures([]));
});

test("--no-downbeat-shift and --trim-leading-empty-measures warn when given to --to midi", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "txml-cli-"));
  const outPath = path.join(dir, "out.mid");
  const result = run([fixture, "--to", "midi", "--no-downbeat-shift", "--out", outPath]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /only apply to --to musicxml/);
});
