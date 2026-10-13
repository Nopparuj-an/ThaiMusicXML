// Redirects for the version selector.
//
// The selector sends a reader to the same page in another version. When that
// page does not exist there (a page added after the version was archived, or
// one removed since), the URL would be a 404. This builds a redirect to that
// version's introduction for every such page, so switching versions always
// lands somewhere, and it covers every pair of versions without a list to
// maintain. Used by astro.config.mjs; scripts/check-versions.mjs reads the same
// data.

import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { locales, retired, versions } from "../versions.config.mjs";

const DOCS = fileURLToPath(new URL("../src/content/docs/", import.meta.url));
const DOC_FILE = /\.mdx?$/;
const LANDING = "introduction";

// URL path of every page under `dir`, "" for the home page of the tree.
// `skip` names top-level folders that belong to another tree.
function pagesIn(dir, skip = new Set()) {
  const out = new Set();
  (function walk(d) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        if (d === dir && skip.has(entry.name)) continue;
        walk(full);
      } else if (DOC_FILE.test(entry.name)) {
        const rel = relative(dir, full).split(sep).join("/").replace(DOC_FILE, "");
        out.add(rel === "index" ? "" : rel.replace(/\/index$/, ""));
      }
    }
  })(dir);
  return out;
}

export function versionRedirects() {
  const redirects = {};
  const archiveSlugs = new Set(versions.map((v) => v.slug));

  for (const locale of locales) {
    const localeDir = join(DOCS, locale);
    if (!existsSync(localeDir)) continue;

    // The current docs are the tree with no version segment.
    const trees = [{ base: "", pages: pagesIn(localeDir, archiveSlugs) }];
    for (const { slug } of versions) {
      const dir = join(localeDir, slug);
      if (existsSync(dir)) trees.push({ base: slug, pages: pagesIn(dir) });
    }

    const everything = new Set(trees.flatMap((t) => [...t.pages]));
    for (const { base, pages } of trees) {
      const prefix = base ? `/${locale}/${base}` : `/${locale}`;
      const landing = pages.has(LANDING) ? `${prefix}/${LANDING}/` : `${prefix}/`;

      // /<locale>/<version>/ was the version's introduction before versions
      // were archived, and an archive has no home page of its own.
      if (base) redirects[prefix] = landing;

      for (const page of everything) {
        if (page === "" || pages.has(page)) continue;
        redirects[`${prefix}/${page}`] = landing;
      }
    }

    // A retired segment points at the current docs, not at an archive: the
    // archives are noindex, and the current page is the one worth ranking.
    const current = trees[0].pages;
    const currentLanding = current.has(LANDING) ? `/${locale}/${LANDING}/` : `/${locale}/`;
    for (const { slug, pagesFrom } of retired) {
      const dir = join(localeDir, pagesFrom);
      if (!existsSync(dir)) continue;
      redirects[`/${locale}/${slug}`] = currentLanding;
      for (const page of pagesIn(dir)) {
        if (page === "") continue;
        redirects[`/${locale}/${slug}/${page}`] = current.has(page) ? `/${locale}/${page}/` : currentLanding;
      }
    }
  }
  return redirects;
}
