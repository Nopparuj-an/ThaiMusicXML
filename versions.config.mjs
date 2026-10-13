// Archived documentation versions. Read by astro.config.mjs and
// scripts/check-versions.mjs, and rewritten by scripts/archive-version.mjs, so
// keep it to plain data. See RELEASING.md.

// Locales that carry an archive of every version.
export const locales = ["en", "th"];

// Archived versions, newest first. `slug` is the URL segment and the folder
// name (v1_0 -> /en/v1_0/...); `label` is what the version selector shows.
export const versions = [{ slug: "v1_0", label: "v1.0" }];
