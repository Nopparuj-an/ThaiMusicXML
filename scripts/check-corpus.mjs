#!/usr/bin/env node
// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Runs the conformance corpus in public/corpus against two layers of checking:
// the RELAX NG schema, via xmllint, and the rules that reach across a document
// and so cannot be expressed in a grammar.
//
//   node scripts/check-corpus.mjs
//
// Every file under valid/ must pass both layers. Every file under invalid/
// must be caught by at least one of them. Exits 1 when a file does not behave
// as its directory claims, so it can gate a commit or CI run.
//
// The rules implemented here are the "must" statements collected in
// https://thaimusicxml.anan.ovh/en/v1_0/reference/conformance/
// Warnings are printed but never fail the run.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { DOMParser } from "@xmldom/xmldom";

const NS = "https://thaimusicxml.anan.ovh/ns/1";
const SCHEMA = "public/schema/thaimusicxml-1.0.rng";
const CORPUS = "public/corpus";

const RECOMMENDED_NATHAP = ["ปรบไก่", "สองไม้", "ลาว", "เขมร", "มอญ"];
const RECOMMENDED_TUNING = [
  "pi-phat-mai-khaeng",
  "khrueang-sai",
  "c-major",
  "bb-major",
];

const THAI_OCTAVE_MODIFIER = /[ํฺ]/;

// ---------------------------------------------------------------- DOM helpers

const els = (node) =>
  Array.from(node.childNodes ?? []).filter((n) => n.nodeType === 1);
const kids = (node, name) => els(node).filter((n) => n.localName === name);
const kid = (node, name) => kids(node, name)[0];
const num = (el, name) => Number.parseInt(el.getAttribute(name), 10);

// Every descendant with this name, in document order, not descending into a
// match. Markers have no children, so this reaches the ones inside a <group>.
function inOrder(node, name) {
  const out = [];
  (function walk(n) {
    for (const c of els(n)) {
      if (c.localName === name) out.push(c);
      else walk(c);
    }
  })(node);
  return out;
}

function descendants(node, name) {
  const out = [];
  (function walk(n) {
    for (const c of els(n)) {
      if (c.localName === name) out.push(c);
      walk(c);
    }
  })(node);
  return out;
}

const BEAT_ELEMENTS = new Set(["note", "rest", "group"]);
const beats = (measure) => els(measure).filter((c) => BEAT_ELEMENTS.has(c.localName));

// Text directly inside an element, ignoring any <text> children.
const ownText = (el) =>
  Array.from(el.childNodes ?? [])
    .filter((n) => n.nodeType === 3)
    .map((n) => n.nodeValue)
    .join("");

// ------------------------------------------------------------------- context
//
// The lookups every rule below reads. Built once per document, purely - no
// validation happens here, only grouping - so a rule never has to re-derive
// what another rule already worked out, and a duplicate-id in the source
// document does not change which <part> or <section> a lookup here resolves
// to (first occurrence wins, silently), leaving duplicate detection itself to
// checkIdsAndReferences.

function buildContext(score, structure, ensemble) {
  const partDatas = kids(score, "part-data");
  const parts = kids(ensemble, "part");
  const sections = descendants(structure, "section");

  const partById = new Map();
  for (const p of parts) {
    const id = p.getAttribute("id");
    if (!partById.has(id)) partById.set(id, p);
  }

  const dataByPart = new Map();
  for (const pd of partDatas) {
    const ref = pd.getAttribute("part");
    if (!dataByPart.has(ref)) dataByPart.set(ref, pd);
  }

  return {
    score,
    structure,
    ensemble,
    partDatas,
    parts,
    sections,
    partById,
    dataByPart,
    stacks: buildStacks(parts),
    passCount: buildPassCount(structure),
  };
}

// Parts sharing a <part> stack="", grouped by that name with each member's
// position in <ensemble> and its own row attribute alongside it.
function buildStacks(parts) {
  const stacks = new Map();
  parts.forEach((p, index) => {
    if (!p.hasAttribute("stack")) return;
    const name = p.getAttribute("stack");
    if (!stacks.has(name)) stacks.set(name, []);
    stacks.get(name).push({ part: p, index, row: num(p, "row") });
  });
  return stacks;
}

// A section's total pass count is the product of the times values enclosing it.
function buildPassCount(structure) {
  const passCount = new Map();
  (function walk(node, factor) {
    for (const el of els(node)) {
      if (el.localName === "section") passCount.set(el.getAttribute("id"), factor);
      else if (el.localName === "repeat") {
        const t = el.hasAttribute("times") ? num(el, "times") : 1;
        walk(el, factor * (Number.isFinite(t) && t > 0 ? t : 1));
      }
    }
  })(structure, 1);
  return passCount;
}

// ------------------------------------------------------------------ the rules
//
// Each rule is independent: given the shared context, it pushes its own
// errors and warnings and touches nothing another rule depends on. Order
// among them does not matter for correctness, only for the order failures
// print in - run in checkRules() below, in the same order the conformance
// page collects them.

function checkVersion(score, warn) {
  const version = score.getAttribute("version");
  if (version && version !== "1.0")
    warn(`version="${version}" does not match the expected version 1.0`);
}

function checkIdsAndReferences(ctx, err) {
  const seenPartIds = new Set();
  for (const p of ctx.parts) {
    const id = p.getAttribute("id");
    if (seenPartIds.has(id)) err(`duplicate part id "${id}"`);
    seenPartIds.add(id);
  }

  const seenSectionIds = new Set();
  for (const s of ctx.sections) {
    const id = s.getAttribute("id");
    if (seenSectionIds.has(id)) err(`duplicate section id "${id}"`);
    seenSectionIds.add(id);
  }

  const seenPartDataRefs = new Set();
  for (const pd of ctx.partDatas) {
    const ref = pd.getAttribute("part");
    if (!ctx.partById.has(ref)) err(`<part-data part="${ref}"> references no <part>`);
    if (seenPartDataRefs.has(ref)) err(`more than one <part-data> for part "${ref}"`);
    seenPartDataRefs.add(ref);
  }
  for (const id of ctx.partById.keys())
    if (!ctx.dataByPart.has(id)) err(`part "${id}" has no <part-data>`);

  for (const pd of ctx.partDatas) {
    const seen = new Set();
    for (const sr of kids(pd, "section-ref")) {
      const ref = sr.getAttribute("section");
      if (!seenSectionIds.has(ref))
        err(`<section-ref section="${ref}"> references no <section>`);
      if (seen.has(ref))
        err(`part "${pd.getAttribute("part")}" references section "${ref}" twice`);
      seen.add(ref);
    }
  }
}

function checkRepeatsHaveSections(ctx, err) {
  for (const rep of descendants(ctx.structure, "repeat"))
    if (descendants(rep, "section").length === 0)
      err("a <repeat> contains no <section>, so it has nothing to play");
}

function checkDirections(ctx, err, warn) {
  for (const n of descendants(ctx.structure, "nathap")) {
    const v = n.getAttribute("value");
    if (!RECOMMENDED_NATHAP.includes(v))
      warn(`nathap value "${v}" is outside the recommended list`);
  }
  const tuning = descendants(ctx.score, "tuning")[0];
  if (tuning && !RECOMMENDED_TUNING.includes(tuning.getAttribute("reference")))
    warn(
      `tuning reference "${tuning.getAttribute("reference")}" is outside the recommended list`,
    );
}

function checkStacks(ctx, err) {
  for (const [name, members] of ctx.stacks) {
    if (members.length < 2)
      err(`stack "${name}" has one part; a single-row instrument carries neither stack nor row`);

    const rows = members.map((m) => m.row).sort((a, b) => a - b);
    const contiguous = rows.every((r, i) => r === i + 1);
    if (!contiguous)
      err(`stack "${name}" rows are ${rows.join(", ")}; they must run from 1 upward with no gaps or repeats`);

    const positions = members.map((m) => m.index);
    const span = Math.max(...positions) - Math.min(...positions) + 1;
    if (span !== members.length)
      err(`stack "${name}" parts are not adjacent in <ensemble>`);
    else {
      const byPosition = [...members].sort((a, b) => a.index - b.index);
      if (byPosition.some((m, i) => m.row !== i + 1))
        err(`stack "${name}" parts are not in ascending row order in <ensemble>`);
    }
  }
}

function checkLineRepeats(ctx, err) {
  const lineCountFor = new Map();
  for (const pd of ctx.partDatas)
    for (const sr of kids(pd, "section-ref")) {
      const ref = sr.getAttribute("section");
      if (!lineCountFor.has(ref)) lineCountFor.set(ref, kids(sr, "line").length);
    }

  for (const section of ctx.sections) {
    const id = section.getAttribute("id");
    const ranges = kids(section, "line-repeat").map((lr) => ({
      first: num(lr, "first"),
      last: num(lr, "last"),
    }));

    for (const r of ranges) {
      if (r.first > r.last)
        err(`<line-repeat first="${r.first}" last="${r.last}"> in section "${id}": first is after last`);
      const lines = lineCountFor.get(id);
      // A section no part references has no line count to check against.
      if (lines !== undefined && r.last > lines)
        err(`<line-repeat last="${r.last}"> in section "${id}" exceeds its ${lines} line(s)`);
    }

    for (let i = 0; i < ranges.length; i++)
      for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i];
        const b = ranges[j];
        if (a.first === b.first && a.last === b.last) {
          err(`two <line-repeat> elements in section "${id}" cover the identical range ${a.first}-${a.last}; combine them into one with a higher times`);
          continue;
        }
        const disjoint = a.last < b.first || b.last < a.first;
        const nested =
          (a.first <= b.first && b.last <= a.last) ||
          (b.first <= a.first && a.last <= b.last);
        if (!disjoint && !nested)
          err(`<line-repeat> ranges ${a.first}-${a.last} and ${b.first}-${b.last} in section "${id}" partially overlap`);
      }
  }
}

function checkAlignedText(ctx, err, warn) {
  for (const name of ["annotation", "composer", "lyricist", "arranger"])
    for (const parent of descendants(ctx.score, name)) {
      const runs = kids(parent, "text");
      const seen = new Set();
      for (const t of runs) {
        const align = t.getAttribute("align");
        if (seen.has(align))
          err(`<${name}> has more than one <text align="${align}">`);
        seen.add(align);
      }
      if (runs.length && ownText(parent).trim())
        warn(`<${name}> has <text> children, so its sibling text is discarded`);
    }
}

// Lines, measures, and what a measure may hold - the shape a lyric part's
// data and a notated part's data each have to have.
function checkPartDataShape(ctx, err, warn) {
  for (const pd of ctx.partDatas) {
    const part = ctx.partById.get(pd.getAttribute("part"));
    const type = part?.getAttribute("type") || "pitched";
    const lyric = type === "lyric";

    for (const sr of kids(pd, "section-ref")) {
      const lines = kids(sr, "line");

      lines.forEach((line, i) => {
        if (num(line, "number") !== i + 1)
          err(`line number ${line.getAttribute("number")} does not match its position ${i + 1}`);

        kids(line, "measure").forEach((measure, j) => {
          if (num(measure, "number") !== j + 1)
            err(`measure number ${measure.getAttribute("number")} does not match its position ${j + 1}`);

          for (const child of els(measure)) {
            const ok = lyric
              ? ["syllable", "rest"].includes(child.localName)
              : ["note", "rest", "group", "bow", "parenthesis", "link"].includes(child.localName);
            if (!ok)
              err(`<${child.localName}> is not valid in a measure of a ${type} part`);
          }

          if (!lyric && beats(measure).length === 0)
            err("a measure in a pitched or unpitched part holds no beats");
        });
      });

      // Notes
      for (const note of descendants(sr, "note")) {
        const pitch = note.getAttribute("pitch");
        if (note.hasAttribute("octave")) {
          if (note.hasAttribute("sound"))
            warn("octave on a note that uses sound has no effect and is discarded");
          else if (pitch && THAI_OCTAVE_MODIFIER.test(pitch))
            warn(`octave alongside the Thai modifier in pitch="${pitch}" is redundant and ignored`);
        }
      }

      // Link spans
      //
      // With no stack the curve marks the span's own notes, so there is no
      // other row it has to be able to reach. With one, there has to be a row
      // there to reach: a lyric measure holds words rather than beats.
      if (part?.hasAttribute("stack") && inOrder(sr, "link").length > 0) {
        const stack = part.getAttribute("stack");
        const others = (ctx.stacks.get(stack) ?? []).filter((m) => m.part !== part);
        const notated = others.some(
          (m) => (m.part.getAttribute("type") || "pitched") !== "lyric",
        );
        if (!notated)
          err(`a link span in stack "${stack}", which has no other notated row`);
      }
    }
  }
}

// Endings, and the bow/parenthesis/link spans that have to nest and close
// cleanly within each pass an ending resolves to - both walk the same per-section-ref
// pass/line/ending values, so they share one rule rather than recomputing them
// twice.
function checkEndingsAndSpans(ctx, err) {
  for (const pd of ctx.partDatas)
    for (const sr of kids(pd, "section-ref")) {
      const part = ctx.partById.get(pd.getAttribute("part"));
      const lyric = (part?.getAttribute("type") || "pitched") === "lyric";
      const sectionId = sr.getAttribute("section");
      const total = ctx.passCount.get(sectionId) ?? 1;
      const lines = kids(sr, "line");
      const byNumber = new Map(lines.map((l) => [num(l, "number"), l]));
      const endings = kids(sr, "ending");
      const claimed = new Set(); // "pass:line"

      for (const ending of endings) {
        if (total <= 1)
          err(`<ending> in section "${sectionId}", whose total pass count is ${total}`);

        const raw = (ending.getAttribute("pass") || "").split(",");
        const passes = raw.map((s) => Number.parseInt(s, 10));
        for (const p of passes)
          if (!(p >= 1 && p <= total))
            err(`ending pass ${p} is outside the 1 to ${total} passes of section "${sectionId}"`);
        for (let i = 1; i < passes.length; i++)
          if (passes[i] <= passes[i - 1])
            err(`ending pass list "${ending.getAttribute("pass")}" is not ascending with no repeats`);

        const numbers = kids(ending, "line").map((l) => num(l, "number"));
        for (const n of numbers)
          if (!byNumber.has(n))
            err(`<ending> replaces line ${n}, which the section-ref does not have`);

        // An ending replaces the end of a section: a consecutive ascending run
        // through to the last line.
        const ascending = numbers.every((n, i) => i === 0 || n === numbers[i - 1] + 1);
        const lastLine = lines.length ? num(lines[lines.length - 1], "number") : 0;
        if (!ascending || numbers[numbers.length - 1] !== lastLine)
          err(`<ending> lines ${numbers.join(", ")} are not a consecutive run ending on line ${lastLine}`);

        for (const line of kids(ending, "line")) {
          const original = byNumber.get(num(line, "number"));
          if (!original) continue;
          const a = kids(line, "measure");
          const b = kids(original, "measure");
          if (a.length !== b.length) {
            err(`<ending> line ${line.getAttribute("number")} has ${a.length} measure(s) where the line it replaces has ${b.length}`);
            continue;
          }
          a.forEach((measure, i) => {
            // A completely empty measure in a notated part's ending means
            // "unchanged from the line being replaced" - see ending.md's
            // "Unchanged measures" - not a real zero-beat measure to compare.
            if (!lyric && beats(measure).length === 0) return;
            if (beats(measure).length !== beats(b[i]).length)
              err(`<ending> line ${line.getAttribute("number")} measure ${i + 1} has ${beats(measure).length} beat(s) where the line it replaces has ${beats(b[i]).length}`);
          });
        }

        for (const p of passes)
          for (const n of numbers) {
            const key = `${p}:${n}`;
            if (claimed.has(key))
              err(`two <ending> elements cover line ${n} on pass ${p}`);
            claimed.add(key);
          }
      }

      // Spans, matched within each resolved pass. An empty measure in a
      // notated part's ending inherits the base line's own measure - markers
      // included - so span matching walks the merged (not the literal)
      // content, same as ending.md's "Unchanged measures" and "Spans across
      // an overridden line" both require.
      for (let pass = 1; pass <= total; pass++) {
        const override = new Map();
        for (const ending of endings) {
          const passes = (ending.getAttribute("pass") || "")
            .split(",")
            .map((s) => Number.parseInt(s, 10));
          if (!passes.includes(pass)) continue;
          for (const l of kids(ending, "line")) override.set(num(l, "number"), l);
        }
        const resolvedMeasures = lines.flatMap((line) => {
          const baseMeasures = kids(line, "measure");
          const overrideLine = override.get(num(line, "number"));
          if (!overrideLine) return baseMeasures;
          return kids(overrideLine, "measure").map((measure, i) =>
            !lyric && beats(measure).length === 0 ? baseMeasures[i] : measure,
          );
        });

        for (const kind of ["bow", "parenthesis", "link"]) {
          let open = false;
          for (const measure of resolvedMeasures)
            for (const marker of inOrder(measure, kind)) {
              if (marker.getAttribute("type") === "start") {
                if (open)
                  err(`a ${kind} span opens on pass ${pass} while another is still open; spans cannot nest or overlap`);
                open = true;
              } else {
                if (!open)
                  err(`a ${kind} stop on pass ${pass} closes no open span`);
                open = false;
              }
            }
          if (open)
            err(`a ${kind} span is left open at the end of pass ${pass} of section "${sectionId}"`);
        }
      }
    }
}

function checkCrossPartAgreement(ctx, err) {
  const bySection = new Map();
  for (const pd of ctx.partDatas) {
    const part = ctx.partById.get(pd.getAttribute("part"));
    const lyric = (part?.getAttribute("type") || "pitched") === "lyric";
    for (const sr of kids(pd, "section-ref")) {
      const id = sr.getAttribute("section");
      if (!bySection.has(id)) bySection.set(id, []);
      bySection.get(id).push({ sr, lyric, part: pd.getAttribute("part") });
    }
  }

  for (const [id, refs] of bySection) {
    if (refs.length < 2) continue;
    const [first, ...rest] = refs;
    const firstLines = kids(first.sr, "line");

    for (const other of rest) {
      const otherLines = kids(other.sr, "line");
      if (otherLines.length !== firstLines.length) {
        err(`section "${id}": part "${other.part}" has ${otherLines.length} line(s) where part "${first.part}" has ${firstLines.length}`);
        continue;
      }
      firstLines.forEach((line, i) => {
        const a = kids(line, "measure");
        const b = kids(otherLines[i], "measure");
        if (a.length !== b.length) {
          err(`section "${id}" line ${i + 1}: part "${other.part}" has ${b.length} measure(s) where part "${first.part}" has ${a.length}`);
          return;
        }
        // A lyric part holds as many items as the words need, so it takes no
        // part in the beat-count comparison on either side.
        if (first.lyric || other.lyric) return;
        a.forEach((measure, j) => {
          if (beats(measure).length !== beats(b[j]).length)
            err(`section "${id}" line ${i + 1} measure ${j + 1}: part "${other.part}" has ${beats(b[j]).length} beat(s) where part "${first.part}" has ${beats(measure).length}`);
        });
      });
    }
  }
}

// Independent of one another - each reads only ctx and its own local state -
// so this list is the whole of what a document is checked against, run in
// the order the conformance page collects them.
const RULES = [
  checkIdsAndReferences,
  checkRepeatsHaveSections,
  checkDirections,
  checkStacks,
  checkLineRepeats,
  checkAlignedText,
  checkPartDataShape,
  checkEndingsAndSpans,
  checkCrossPartAgreement,
];

function checkRules(doc) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  const score = doc.documentElement;
  if (!score || score.namespaceURI !== NS) {
    err(`root is not a <thai-score> in ${NS}`);
    return { errors, warnings };
  }

  checkVersion(score, warn);

  const structure = kid(score, "structure");
  const ensemble = kid(score, "ensemble");
  if (!structure || !ensemble) return { errors, warnings };

  const ctx = buildContext(score, structure, ensemble);
  for (const rule of RULES) rule(ctx, err, warn);

  return { errors, warnings };
}

// ------------------------------------------------------------------ the runner

function schemaCheck(file) {
  try {
    execFileSync("xmllint", ["--noout", "--relaxng", SCHEMA, file], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    return null;
  } catch (e) {
    const out = (e.stderr?.toString() ?? "").trim();
    return out.split("\n").find((l) => l.includes("Relax-NG") || l.includes(file)) ?? "does not validate";
  }
}

// The description each invalid file carries, so a failure report says what the
// file was meant to demonstrate.
function purpose(source) {
  return source.match(/<!--\s*INVALID:\s*([\s\S]*?)-->/)?.[1].replace(/\s+/g, " ").trim();
}

if (!existsSync(SCHEMA) || !existsSync(CORPUS)) {
  console.error("Run this from the repository root.");
  process.exit(1);
}

try {
  execFileSync("xmllint", ["--version"], { stdio: "ignore" });
} catch {
  console.error("xmllint is not on PATH. It ships with macOS and comes from libxml2-utils on Debian and Ubuntu.");
  process.exit(1);
}

// --explain reports, for each invalid file, which layer rejected it and why,
// so the corpus can be checked against what each file was written to prove.
const explain = process.argv.includes("--explain");

const parser = new DOMParser({
  onError: () => {}, // well-formedness surfaces through xmllint instead
});
const failures = [];
let checked = 0;
let warned = 0;

for (const expectation of ["valid", "invalid"]) {
  const dir = join(CORPUS, expectation);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((n) => n.endsWith(".txml")).sort()) {
    const file = join(dir, name);
    const source = readFileSync(file, "utf8");
    checked++;

    const schemaError = schemaCheck(file);
    const doc = parser.parseFromString(source, "text/xml");
    const { errors, warnings } = doc?.documentElement
      ? checkRules(doc)
      : { errors: ["not well-formed XML"], warnings: [] };

    if (expectation === "valid") {
      if (schemaError) failures.push({ file, reason: `schema: ${schemaError}` });
      for (const e of errors) failures.push({ file, reason: `rules: ${e}` });
      for (const w of warnings) {
        console.warn(`  warning  ${file}: ${w}`);
        warned++;
      }
    } else if (!schemaError && errors.length === 0) {
      failures.push({
        file,
        reason: `expected to be rejected, but both layers accepted it — ${purpose(source) ?? "no description"}`,
      });
    } else if (explain) {
      const layer = schemaError ? "schema" : "rules ";
      console.log(`  ${layer}  ${name}`);
      console.log(`           want: ${purpose(source) ?? "no description"}`);
      console.log(`           got:  ${schemaError ?? errors[0]}`);
      if (errors.length > 1) console.log(`           (+${errors.length - 1} more)`);
    }
  }
}

if (failures.length === 0) {
  console.log(
    `${checked} corpus file(s) behaved as expected${warned ? `, ${warned} warning(s)` : ""}.`,
  );
  process.exit(0);
}

let current = null;
for (const { file, reason } of failures) {
  if (file !== current) console.error(`\n${(current = file)}`);
  console.error(`  ${reason}`);
}
console.error(`\n${failures.length} corpus failure(s).`);
process.exit(1);
