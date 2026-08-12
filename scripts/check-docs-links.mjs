#!/usr/bin/env node
// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Checks internal documentation links: that every /<locale>/... markdown link
// resolves to a page, and that every #anchor resolves to a heading on it.
//
//   node scripts/check-docs-links.mjs
//
// Exits 1 when something is broken, so it can gate a commit or CI run.
// This does not need a build; it reads the content collection directly.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const DOCS = "src/content/docs";
const PAGES = "src/pages";
const DEFAULT_LOCALE = "en";
const TREEVIEW = join(DOCS, DEFAULT_LOCALE, "v0_1/reference/elements/index.mdx");

// github-slugger's algorithm: lowercase, drop a fixed punctuation set, spaces
// to hyphens. It leaves non-Latin scripts alone, which is what keeps Thai
// headings such as "Relationship to ชั้น" linkable.
//
// The ranges below are copied character-for-character from github-slugger's
// own regex rather than rewritten as \uXXXX escapes, so this stays an exact
// match for its behavior; that includes literal Unicode space characters,
// which the eslint-disable below is for.
// eslint-disable-next-line no-irregular-whitespace
const PUNCTUATION = /[ -⁯⸀-⹿\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;

function slugify(heading) {
  // Explicit {#id} overrides the auto-generated slug
  const explicit = heading.match(/\{#([^}]+)\}$/);
  if (explicit) return explicit[1];
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links keep their text
    .replace(/[*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(PUNCTUATION, "")
    .replace(/\s+/g, "-");
}

// Fenced code holds example markup, so links and "# comments" inside it are
// not references and must not be collected or checked.
const stripFences = (src) => src.replace(/^```[\s\S]*?^```/gm, "");

function walk(dir, pattern = /\.mdx?$/) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? walk(path, pattern)
      : pattern.test(path)
        ? [path]
        : [];
  });
}

function pageSlug(path) {
  const rel = relative(DOCS, path).split(sep).join("/");
  return "/" + rel.replace(/\.mdx?$/, "").replace(/(^|\/)index$/, "");
}

if (!existsSync(DOCS)) {
  console.error(`No ${DOCS} directory. Run this from the repository root.`);
  process.exit(1);
}

const files = walk(DOCS);
const pages = new Map(); // slug -> Set of anchors

for (const file of files) {
  const body = stripFences(readFileSync(file, "utf8"));
  const anchors = new Set(
    [...body.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((m) => slugify(m[1])),
  );
  pages.set(pageSlug(file).replace(/\/$/, ""), anchors);
}

// Astro pages outside the content collection (e.g. the Playground) are
// routes too, just with no headings to check anchors against. A [lang]
// segment is Astro's dynamic-route syntax (getStaticPaths emits one page
// per locale) rather than a literal path piece, so it expands to each
// locale instead of being registered as its own broken-looking slug.
const LOCALES = ["en", "th"];

if (existsSync(PAGES)) {
  for (const file of walk(PAGES, /\.astro$/)) {
    const rel = relative(PAGES, file).split(sep).join("/");
    const rawSlug =
      "/" + rel.replace(/\.astro$/, "").replace(/(^|\/)index$/, "");
    const slugs = rawSlug.includes("[lang]")
      ? LOCALES.map((locale) => rawSlug.replace("[lang]", locale))
      : [rawSlug];
    for (const slug of slugs) {
      const key = slug.replace(/\/$/, "");
      if (!pages.has(key)) pages.set(key, new Set());
    }
  }
}

// A locale that has not been translated yet falls back to the default one, so
// /th/foo is valid whenever /en/foo exists.
function resolve(slug) {
  if (pages.has(slug)) return slug;
  const fallback = slug.replace(
    new RegExp(`^/[^/]+/`),
    `/${DEFAULT_LOCALE}/`,
  );
  return pages.has(fallback) ? fallback : null;
}

const problems = [];
const report = (file, link, reason) => problems.push({ file, link, reason });

for (const file of files) {
  const body = stripFences(readFileSync(file, "utf8"));
  for (const [, link] of body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const [rawPath, anchor] = link.split("#");
    const slug = rawPath.replace(/\/$/, "");
    const target = resolve(slug);
    if (!target) report(file, link, "no such page");
    else if (anchor && !pages.get(target).has(anchor))
      report(file, link, "no such heading on that page");
  }
}

// The element hierarchy is a JSX component rather than markdown, so its slugs
// escape the check above. A node pointing at a page that does not exist has
// been a real bug here before.
if (existsSync(TREEVIEW)) {
  const src = readFileSync(TREEVIEW, "utf8");
  const base = src.match(/base=["'`]([^"'`]+)["'`]/)?.[1];
  if (base) {
    for (const [, slug] of src.matchAll(/\bslug:\s*["']([^"']+)["']/g)) {
      const link = `${base}/${slug}`;
      const [path, anchor] = link.split("#");
      const target = resolve(path.replace(/\/$/, ""));
      if (!target) report(TREEVIEW, link, "TreeView node has no page");
      else if (anchor && !pages.get(target).has(anchor))
        report(TREEVIEW, link, "TreeView node has no such heading");
    }
  }
}

if (problems.length === 0) {
  console.log(`${pages.size} pages, no broken links.`);
  process.exit(0);
}

let current = null;
for (const { file, link, reason } of problems) {
  if (file !== current) console.error(`\n${(current = file)}`);
  console.error(`  ${link}  (${reason})`);
}
console.error(`\n${problems.length} broken link(s).`);
process.exit(1);
