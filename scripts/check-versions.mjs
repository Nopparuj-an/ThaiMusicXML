// Checks the archived documentation versions listed in versions.config.mjs.
//
//   npm run check:versions
//
// For each archived version it checks that the archive is complete (docs in
// every locale, the saved sidebar, the marker folder the plugin looks for, the
// frozen schema) and that no archived page links out of its own version. The
// plugin rewrites markdown links when it archives, but not every kind of
// link, so a stray link would quietly send a reader of an old version to the
// current docs. Exits non-zero on a problem.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { locales, versions } from "../versions.config.mjs";

const DOCS = "src/content/docs";
const problems = [];
const problem = (where, what) => problems.push(`${where}\n  ${what}`);

function* docFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* docFiles(full);
    else if (/\.mdx?$/.test(entry.name)) yield full;
  }
}

function* allFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* allFiles(full);
    else yield full;
  }
}

// Absolute site paths: /en/..., /th/... not preceded by something that makes
// them part of a longer URL or file path.
const LOCALE_PATH = new RegExp(
  `(?<![A-Za-z0-9_.:/-])/(?:${locales.join("|")})/[^\\s"'\`<>)\\]#}]*`,
  "g",
);

for (const { slug, label } of versions) {
  const ver = label.replace(/^v/, "");

  // --- the archive is complete
  for (const locale of locales) {
    if (!existsSync(join(DOCS, locale, slug))) {
      problem(`${DOCS}/${locale}/${slug}`, "missing: run scripts/archive-version.mjs");
    }
  }
  if (!existsSync(join("src/content/versions", `${slug}.json`))) {
    problem(`src/content/versions/${slug}.json`, "missing: the saved sidebar of this version");
  }
  if (!existsSync(join(DOCS, slug, ".gitkeep"))) {
    problem(
      `${DOCS}/${slug}/.gitkeep`,
      "missing: without this folder git drops it, and the plugin regenerates the archive from the current docs",
    );
  }
  for (const ext of ["rng", "xsd"]) {
    const file = `public/schema/thaimusicxml-${ver}.${ext}`;
    if (!existsSync(file)) problem(file, "missing: the frozen schema of this version");
  }

  // --- no older archive nested inside this one
  for (const locale of locales) {
    for (const other of versions) {
      if (other.slug !== slug && existsSync(join(DOCS, locale, slug, other.slug))) {
        problem(
          `${DOCS}/${locale}/${slug}/${other.slug}`,
          `${other.label} is copied inside ${label}: the plugin does this on archiving, and it publishes every ${other.label} page twice`,
        );
      }
    }
  }

  // --- no image copies that nothing uses
  {
    const archived = locales
      .filter((l) => existsSync(join(DOCS, l, slug)))
      .flatMap((l) => [...docFiles(join(DOCS, l, slug))])
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    for (const file of allFiles("src/assets")) {
      const rel = file.split(sep).join("/");
      if (rel.includes(`/${slug}/`) && !archived.includes(rel.slice("src/assets/".length))) {
        problem(rel, `no ${label} page uses this copy`);
      }
    }
  }

  // --- no archived page links outside its version
  // Links into any archived version are fine: a page may point at the
  // version before it. Only links into the current docs are a leak.
  const own = new RegExp(
    `^/(?:${locales.join("|")})/(?:${versions.map((v) => v.slug).join("|")})(?:/|$)`,
  );
  const unprefixed = new RegExp(
    `(?<![A-Za-z0-9_.:/-])(?<!/(?:${locales.join("|")}))/${slug}/[^\\s"'\`<>)\\]#}]*`,
    "g",
  );
  for (const locale of locales) {
    const dir = join(DOCS, locale, slug);
    if (!existsSync(dir)) continue;
    for (const file of docFiles(dir)) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        const where = `${relative(".", file)}:${i + 1}`;
        for (const [path] of line.matchAll(LOCALE_PATH)) {
          // The playground is one page for every version.
          if (own.test(path) || /^\/[a-z]+\/playground\//.test(path)) continue;
          problem(where, `${path} leaves ${slug}; it would open the current docs`);
        }
        for (const [path] of line.matchAll(unprefixed)) {
          problem(where, `${path} is missing its locale; it would 404`);
        }
      });
    }
  }
}

if (problems.length === 0) {
  console.log(
    versions.length === 0
      ? "No archived versions."
      : `${versions.length} archived version(s) (${versions.map((v) => v.label).join(", ")}) are complete and self-contained.`,
  );
  process.exit(0);
}
console.error(problems.join("\n"));
console.error(`\n${problems.length} problem(s) in the archived versions.`);
process.exit(1);
