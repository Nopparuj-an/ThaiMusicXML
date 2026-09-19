// Maps each docs source file to the commit date that last touched it, so the
// sitemap can carry <lastmod>. Starlight's `lastUpdated` already derives page
// dates from git the same way; this keeps the two in agreement.
//
// One `git log` pass builds the whole map. Walking per-file would mean a
// separate git invocation for every page.

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

let cache;

export function docLastmod() {
  if (cache) return cache;
  cache = new Map();

  let log;
  try {
    log = execFileSync(
      "git",
      ["log", "--pretty=format:@%cI", "--name-only", "--no-merges", "--", "src", "renderer/examples"],
      { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
  } catch {
    // Not a git checkout (shallow CI clone, tarball export). Omitting lastmod
    // is valid; a wrong one is worse than none.
    return cache;
  }

  let current = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("@")) current = line.slice(1);
    else if (line && current && !cache.has(line)) cache.set(line, current);
  }
  return cache;
}

// https://site/en/v1_0/reference/elements/note/ -> the file that produced it
export function lastmodForUrl(url, site) {
  const map = docLastmod();
  const path = url.replace(site, "").replace(/^\/|\/$/g, "");
  if (!path) return undefined;

  const [lang, ...rest] = path.split("/");
  const slug = rest.join("/");

  const candidates =
    slug === "playground"
      ? ["src/pages/[lang]/playground.astro"]
      : [
          `src/content/docs/${lang}/${slug}.md`,
          `src/content/docs/${lang}/${slug}.mdx`,
          `src/content/docs/${lang}/${slug}/index.md`,
          `src/content/docs/${lang}/${slug}/index.mdx`,
          `src/content/docs/${lang}/index.mdx`,
          `src/content/docs/${lang}/index.md`,
        ];

  for (const candidate of candidates) {
    const hit = map.get(candidate);
    if (hit) return hit;
  }
  return undefined;
}
