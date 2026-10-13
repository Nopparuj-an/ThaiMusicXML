// Archived documentation versions. Read by astro.config.mjs and
// scripts/check-versions.mjs, and rewritten by scripts/archive-version.mjs, so
// keep it to plain data. See RELEASING.md.

// Locales that carry an archive of every version.
export const locales = ["en", "th"];

// Archived versions, newest first. `slug` is the URL segment and the folder
// name (v1_0 -> /en/v1_0/...); `label` is what the version selector shows.
export const versions = [{ slug: "v1_0", label: "v1.0" }];

// URL segments the docs used to live under and no longer do. Search engines
// still have them indexed, so each page redirects to the same page in the
// current docs. `pagesFrom` names the archive that has the same set of pages
// (v0_1 was renamed to v1_0 one-for-one).
export const retired = [{ slug: "v0_1", pagesFrom: "v1_0" }];
