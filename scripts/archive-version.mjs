// Archives the current docs as a frozen version. See RELEASING.md.
//
//   node scripts/archive-version.mjs v1_1 v1.1
//
// Run it when the next version is about to replace the current one, on the
// commit that is tagged as the release (v1.1.0), before merging any of the next
// version's work. It
//   1. adds the version to versions.config.mjs,
//   2. lets starlight-versions copy the current docs into <locale>/<slug>/,
//   3. repairs what that copy gets wrong (see the steps below),
//   4. freezes the rolling schema as thaimusicxml-<version>.rng/.xsd,
//   5. checks the result.
// It changes files and does not commit. Review the diff, then commit it.

import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, sep } from "node:path";
import { locales, versions } from "../versions.config.mjs";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [slug, label] = args.filter((a) => !a.startsWith("--"));

const DOCS = "src/content/docs";
const SCHEMA_DIR = "public/schema";
const PLAYGROUND_XSD = "src/playground";

function fail(message) {
  console.error(`\nerror: ${message}`);
  process.exit(1);
}
const step = (n, text) => console.log(`\n[${n}] ${text}`);
const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();

// ------------------------------------------------------------------ arguments

if (!/^v\d+_\d+$/.test(slug ?? "") || !/^v\d+\.\d+$/.test(label ?? "") || label.replace(".", "_") !== slug) {
  fail("usage: node scripts/archive-version.mjs <slug> <label> [--allow-untagged] [--allow-dirty]\n  e.g. node scripts/archive-version.mjs v1_1 v1.1");
}
const ver = label.slice(1); // 1.1
const major = ver.split(".")[0]; // 1
const tag = `${label}.0`; // v1.1.0
const rolling = `thaimusicxml-${major}.x`;
const frozen = `thaimusicxml-${ver}`;

if (versions.some((v) => v.slug === slug) || locales.some((l) => existsSync(join(DOCS, l, slug)))) {
  fail(`${label} is already archived.`);
}
if (!flags.has("--allow-dirty") && git("status", "--porcelain")) {
  fail("the working tree has uncommitted changes. Commit or stash them first (or pass --allow-dirty).");
}
if (!flags.has("--allow-untagged") && !git("tag", "--points-at", "HEAD").split("\n").includes(tag)) {
  fail(
    `HEAD is not tagged ${tag}. The archive is a snapshot of the docs as they are right now, so run this on the released commit, ` +
      `before merging the next version's work. (--allow-untagged to override.)`,
  );
}
for (const f of [`${SCHEMA_DIR}/${frozen}.rng`, `${SCHEMA_DIR}/${frozen}.xsd`]) {
  if (existsSync(f)) fail(`${f} already exists.`);
}
for (const f of [`${SCHEMA_DIR}/${rolling}.rng`, `${SCHEMA_DIR}/${rolling}.xsd`]) {
  if (!existsSync(f)) fail(`${f} is missing: nothing to freeze.`);
}

const walkDocs = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkDocs(join(dir, e.name)) : /\.mdx?$/.test(e.name) ? [join(dir, e.name)] : [],
  );
const walkFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkFiles(join(dir, e.name)) : [join(dir, e.name)],
  );
const edit = (file, fn) => {
  const before = readFileSync(file, "utf8");
  const after = fn(before);
  if (after !== before) writeFileSync(file, after);
  return after !== before;
};

// ------------------------------------------------------------ 1. the config

step(1, `adding ${label} to versions.config.mjs`);
{
  const entries = [{ slug, label }, ...versions]
    .map((v) => `  { slug: "${v.slug}", label: "${v.label}" },`)
    .join("\n");
  edit("versions.config.mjs", (s) =>
    s.replace(/export const versions = \[[\s\S]*?\];/, `export const versions = [\n${entries}\n];`),
  );
}

// ------------------------------------------------ 2. let the plugin copy it

step(2, "building once so starlight-versions copies the docs");
{
  // The plugin copies the docs when it sees a version with no folder under
  // src/content/docs. The build that follows can still fail on the copy it
  // just made, which step 3 repairs, so only the copy itself is required.
  const r = spawnSync("npx", ["astro", "build"], { stdio: "ignore" });
  if (!locales.every((l) => existsSync(join(DOCS, l, slug)))) {
    fail(`the plugin did not create ${DOCS}/<locale>/${slug}. Run "npx astro build" to see why.`);
  }
  console.log(r.status === 0 ? "  copied; build passed" : "  copied; the build of the raw copy failed, as expected before the repairs");
}

// ------------------------------------------------ 3. repair what it gets wrong

step(3, "repairing the copy");

// The plugin also copies the earlier archives into the new one
// (<locale>/v1_1/v1_0/...), which would publish every old page a second time
// under the new version and in its search results.
for (const l of locales) {
  for (const old of versions) {
    const nested = join(DOCS, l, slug, old.slug);
    if (existsSync(nested)) {
      rmSync(nested, { recursive: true });
      console.log(`  removed the nested copy of ${old.label} in ${nested}`);
    }
  }
}

// The archive has no home page: /<locale>/<slug>/ redirects to its
// introduction (see scripts/version-redirects.mjs), and a copied home would
// take that URL over.
for (const l of locales) {
  for (const home of ["index.mdx", "index.md"]) {
    const f = join(DOCS, l, slug, home);
    if (existsSync(f)) {
      rmSync(f);
      console.log(`  removed the copied home page ${f}`);
    }
  }
}

// The saved sidebar still lists the home page by slug, which no longer exists
// in the archive. Send it to the site root instead.
{
  const f = `src/content/versions/${slug}.json`;
  const data = JSON.parse(readFileSync(f, "utf8"));
  let patched = 0;
  const walk = (items) =>
    items.forEach((item) => {
      if (item.slug === "index") {
        delete item.slug;
        item.link = "/";
        patched++;
      }
      if (item.items) walk(item.items);
    });
  walk(data.sidebar);
  if (patched) writeFileSync(f, JSON.stringify(data, null, 2) + "\n");
  console.log(`  sidebar: ${patched} home entry sent to the site root`);
}

// The plugin rewrites markdown links into the version, but gets some wrong:
// links to pages that are not versioned (the playground, the schema and corpus
// static files), links between locales, and component props such as
// <TreeView base="...">. check:versions flags whatever this misses.
{
  const alt = locales.join("|");
  let files = 0;
  for (const l of locales) {
    for (const file of walkDocs(join(DOCS, l, slug))) {
      const changed = edit(file, (s) =>
        s
          // /en/v1_1/playground/ -> /en/playground/
          .replace(new RegExp(`/(${alt})/${slug}/playground/`, "g"), "/$1/playground/")
          // /v1_1/schema/x -> /schema/x (static files in public/)
          .replace(new RegExp(`/${slug}/(schema|corpus)/`, "g"), "/$1/")
          // /v1_1/en/page -> /en/v1_1/page (a link to the other locale)
          .replace(new RegExp(`(?<![\\w/])/${slug}/(${alt})/`, "g"), `/$1/${slug}/`)
          // /en/v1_1/v1_0/x -> /en/v1_0/x (a link to an earlier archive stays put)
          .replace(new RegExp(`/(${alt})/${slug}/(${versions.map((v) => v.slug).join("|")})(?=/|$)`, "g"), "/$1/$2")
          // base="/en/reference/elements" -> base="/en/v1_1/reference/elements"
          .replace(new RegExp(`(base=")/(${alt})/(?!${slug}/)`, "g"), `$1/$2/${slug}/`),
      );
      if (changed) files++;
    }
  }
  console.log(`  rewrote links in ${files} archived page(s)`);
}

// The plugin copies images into <name>/<slug>/ next to the originals. Keep the
// ones an archived page uses; the rest are copies for pages removed above (the
// nested older archive, the home page).
{
  const archived = locales
    .flatMap((l) => walkDocs(join(DOCS, l, slug)))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  let pruned = 0;
  for (const file of walkFiles("src/assets")) {
    const rel = file.split(sep).join("/");
    if (!rel.includes(`/${slug}/`)) continue;
    if (!archived.includes(rel.slice("src/assets/".length))) {
      rmSync(file);
      pruned++;
    }
  }
  const prune = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) prune(join(dir, e.name));
    }
    if (dir !== "src/assets" && readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
  };
  prune("src/assets");
  console.log(`  removed ${pruned} image copy(ies) no archived page uses`);
}

// The folder the plugin looks for to know the version already exists. It is
// empty under i18n (the content lives under <locale>/<slug>/), and git does
// not keep an empty folder, so without this every fresh clone re-archives.
{
  mkdirSync(join(DOCS, slug), { recursive: true });
  writeFileSync(join(DOCS, slug, ".gitkeep"), "");
}

// ------------------------------------------------------ 4. freeze the schema

step(4, `freezing ${rolling} as ${frozen}`);
{
  const url = "https://thaimusicxml.anan.ovh";
  for (const ext of ["rng", "xsd"]) {
    const from = `${SCHEMA_DIR}/${rolling}.${ext}`;
    const to = `${SCHEMA_DIR}/${frozen}.${ext}`;
    let text = readFileSync(from, "utf8");
    text = text
      // the header paragraph that says the file is rolling
      .replace(
        /ThaiMusicXML v\d+\.x - RELAX NG schema\n[ \t]*\n[\s\S]*?\n(?=[ \t]*\n| {2}Validate)/,
        `ThaiMusicXML v${ver} - RELAX NG schema (frozen)\n\n  This file is the v${ver} grammar exactly as released and will not change.\n  ${rolling}.rng is the rolling grammar for the latest v${major}.x.\n`,
      )
      .replaceAll(`${rolling}.rng score.txml`, `${frozen}.rng score.txml`)
      .replaceAll(`${url}/en/reference/conformance/`, `${url}/en/${slug}/reference/conformance/`)
      .replaceAll(`anywhere else in v${major}.x.`, `anywhere else in v${ver}.`);
    writeFileSync(to, text);
    const stray = (text.match(new RegExp(`v${major}\\.x`, "g")) ?? []).length - 1;
    console.log(`  wrote ${to}` + (stray > 0 && ext === "rng" ? ` (${stray} other "v${major}.x" mention(s) left in it: check them)` : ""));
  }

  // The rolling files list the frozen ones in their header.
  const frozenList = readdirSync(SCHEMA_DIR)
    .filter((f) => new RegExp(`^thaimusicxml-${major}\\.\\d+\\.rng$`).test(f))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const sentence =
    frozenList.length === 1
      ? `${frozenList[0]} is the frozen v${frozenList[0].match(/-(\d+\.\d+)\./)[1]} grammar.`
      : `Frozen grammars: ${frozenList.join(", ")}.`;
  for (const f of [
    `${SCHEMA_DIR}/${rolling}.rng`,
    `${SCHEMA_DIR}/${rolling}.xsd`,
    `${PLAYGROUND_XSD}/${rolling}.xsd`,
  ]) {
    if (existsSync(f)) {
      edit(f, (s) =>
        s.replace(/ {2}thaimusicxml-[^\n]*(?:frozen[^\n]*grammar\.|Frozen grammars:[^\n]*\.)/, `  ${sentence}`),
      );
    }
  }
}

// ----------------------------------------------------------------- 5. check

step(5, "checking");
let ok = true;
for (const [name, bin, cmd] of [
  ["build", "npx", ["astro", "build"]],
  ["check:links", "node", ["scripts/check-docs-links.mjs"]],
  ["check:versions", "node", ["scripts/check-versions.mjs"]],
  ["check:corpus", "node", ["scripts/check-corpus.mjs"]],
]) {
  const r = spawnSync(bin, cmd, { encoding: "utf8" });
  const last = (r.stdout + r.stderr).trim().split("\n").filter((l) => !/warning/.test(l)).slice(-1)[0] ?? "";
  console.log(`  ${r.status === 0 ? "ok  " : "FAIL"} ${name}  ${r.status === 0 ? "" : last}`);
  if (r.status !== 0) ok = false;
}

console.log(`\n${ok ? "Done." : "Done, but a check failed: look into it before committing."} Review with "git status", then commit.`);
console.log(`Still by hand: the archived schema pages (${DOCS}/<locale>/${slug}/reference/schema.mdx, tutorial/10-validating.mdx) link the`);
console.log(`rolling ${rolling}.rng; point them at ${frozen}.rng if this version should show its own frozen schema.`);
console.log(`Tag ${tag} if you have not, and start the next version's work only after this commit.`);
process.exit(ok ? 0 : 1);
