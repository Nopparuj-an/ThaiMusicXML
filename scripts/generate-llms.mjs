// Generates public/llms.txt and public/llms-full.txt from the English docs.
// Runs as part of `npm run build`; commit the output so the repo matches a build.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const docsDir = join(root, "src", "content", "docs", "en");
const site = "https://thaimusicxml.anan.ovh";

// Sidebar order, so llms.txt reads in the same order as the site navigation.
const groups = [
  { heading: "Getting started", match: (p) => p === "index" || p === "v1_0" },
  { heading: "Tutorial", match: (p) => p.startsWith("v1_0/tutorial") },
  { heading: "Elements", match: (p) => p.startsWith("v1_0/reference/elements") },
  { heading: "Examples", match: (p) => p.startsWith("v1_0/reference/examples") },
  { heading: "Reference", match: (p) => p.startsWith("v1_0/reference") },
  { heading: "Updates", match: (p) => p.startsWith("v1_0/updates") },
  { heading: "Project", match: (p) => p.startsWith("about") },
];

// Sidebar titles carry decoration (★, ∙) that means nothing outside the nav.
const cleanTitle = (t) => t.replace(/^[\u2605\u2219\u2022\u00b7]\s*/, "");

// "10-validating" must sort after "2-file_structure", not before it.
const naturalSort = (a, b) =>
  a.slug.localeCompare(b.slug, "en", { numeric: true, sensitivity: "base" });

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function frontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    // Only top-level scalars matter here (title, description).
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv && kv[2] !== "") data[kv[1]] = kv[2].replace(/^["'](.*)["']$/, "$1").trim();
  }
  return { data, body: raw.slice(match[0].length) };
}

// src/content/docs/en/v1_0/reference/elements/note.md -> v1_0/reference/elements/note
function toSlug(file) {
  return relative(docsDir, file)
    .split(sep)
    .join("/")
    .replace(/\.mdx?$/, "")
    .replace(/(^|\/)index$/, "")
    .replace(/\/$/, "") || "index";
}

const urlFor = (slug) => (slug === "index" ? `${site}/en/` : `${site}/en/${slug}/`);

// <ExampleXml file="x.txml" /> renders a real file from renderer/examples/.
// Stripping it as a component would drop the example itself, so inline it.
const examplesDir = join(root, "renderer", "examples");
async function inlineExamples(body) {
  const refs = [...body.matchAll(/<ExampleXml\s+file=["']([^"']+)["']\s*\/>/g)];
  let out = body;
  for (const [tag, file] of refs) {
    let xml;
    try {
      xml = (await readFile(join(examplesDir, file), "utf8")).trimEnd();
    } catch {
      throw new Error(`generate-llms: no renderer/examples/${file}`);
    }
    out = out.replace(tag, `\`\`\`xml\n${xml}\n\`\`\``);
  }
  return out;
}

// MDX imports, component tags, and build-resolved image paths are machinery,
// not prose. Image URLs in particular are hashed at build time, so the paths
// written here would not resolve for anyone reading this file.
function stripMdx(body) {
  return body
    .replace(/^import\s+.*?from\s+["'].*?["'];?\s*$/gm, "")
    .replace(/^\s*!\[[^\]]*\]\([^)]*\)\s*$/gm, "")
    .replace(/^\s*<\/?[A-Z][\w.]*(\s[\s\S]*?)?\/?>\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const files = await walk(docsDir);
const pages = [];
for (const file of files) {
  const raw = await readFile(file, "utf8");
  const { data, body } = frontmatter(raw);
  const slug = toSlug(file);
  pages.push({
    slug,
    url: urlFor(slug),
    title: cleanTitle(data.title ?? slug),
    description: data.description ?? "",
    body: stripMdx(await inlineExamples(body)),
  });
}
pages.sort(naturalSort);

// The Playground is an Astro page, not a content entry, so it is listed by hand.
const playground = {
  slug: "playground",
  url: `${site}/en/playground/`,
  title: "Playground",
  description: "Write and validate ThaiMusicXML in the browser, with live score rendering",
};

const intro = `# ThaiMusicXML

> An open, royalty-free XML file format for Thai traditional music (เพลงไทยเดิม / Phleng Thai Doem).

ThaiMusicXML records the notation Thai musicians already read - the 7-tone scale (ด ร ม ฟ ซ ล ท) as
scale degrees rather than fixed pitches, the beat grid that aligns every instrument down the page,
rests that mean "no new stroke" rather than silence, unpitched rows for ฉิ่ง and other percussion,
lyrics, bow and gesture curves, cued passages, and repeat marks - in a form software can validate,
search, print, and hand to another program without tying the score to any one editor. It is
published under Apache License 2.0.

Documentation is available in English (\`/en/\`) and Thai (\`/th/\`). Every URL below is the English
page; swap \`/en/\` for \`/th/\` for the Thai translation.
`;

const lines = [intro];
const listed = new Set();

for (const group of groups) {
  const members = pages.filter((p) => !listed.has(p.slug) && group.match(p.slug));
  if (group.heading === "Getting started") members.push(playground);
  if (members.length === 0) continue;
  lines.push(`## ${group.heading}\n`);
  for (const page of members) {
    listed.add(page.slug);
    lines.push(`- [${page.title}](${page.url})${page.description ? `: ${page.description}` : ""}`);
  }
  lines.push("");
}

lines.push(`## Optional

- [Full documentation as a single file](${site}/llms-full.txt): every English page above, in full
- [Thai documentation](${site}/th/): the same specification in Thai
- [Sitemap](${site}/sitemap-index.xml): every URL in both languages
- [GitHub repository](https://github.com/Nopparuj-an/ThaiMusicXML): schema, source, issues, and edit history
- [RELAX NG schema](${site}/schema/thaimusicxml-1.0.rng): the normative grammar for v1.0
`);

await writeFile(join(root, "public", "llms.txt"), lines.join("\n"), "utf8");

const full = [
  intro,
  "\n---\n",
  ...pages.map((p) => `\n# ${p.title}\n\nSource: ${p.url}\n\n${p.body}\n\n---\n`),
].join("\n");

await writeFile(join(root, "public", "llms-full.txt"), full, "utf8");

console.log(
  `llms.txt: ${listed.size} pages indexed\nllms-full.txt: ${pages.length} pages, ${(full.length / 1024).toFixed(0)} KB`,
);
