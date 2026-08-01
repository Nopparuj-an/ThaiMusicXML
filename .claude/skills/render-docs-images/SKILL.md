---
name: render-docs-images
description: Rerender the rendered-score PNGs embedded in the docs (tutorial and reference/examples pages) after a renderer change (layout, draw, glyphs, spacing, etc.). Use when asked to "rerender docs images", "update the doc screenshots", or after any change to renderer/src/draw.mjs, renderer/src/layout.mjs, or fonts that could change visual output.
---

# Rerendering docs images

The docs embed static PNGs of rendered scores (Starlight/Astro can't render
`.txml` live). When the renderer's visual output changes, these go stale and
need to be regenerated from their source `.txml` files.

Don't hardcode which pages have images or which `.txml` backs each one - the
docs gain and lose examples over time. Discover the current set each run.

## The render script

`renderer/src/render-doc-image.mjs` does the whole job: parse → layout → draw
→ rasterize with `sharp` → autocrop to content height (keeping the page's
full left/right margin). Don't reinvent this - it already exists.

```
node renderer/src/render-doc-image.mjs <input.txml> <out.png>
```

Only page 1 is rendered; if the score spans multiple pages the script prints
a warning to stderr and continues.

## Discovering the source → output pairs

Every docs page with a rendered-score image follows the same pattern: an
`![...](...image.png)` right above (or near) an `<ExampleXml file="....txml" />`
(see `src/components/ExampleXml.astro`, which inlines the same file as a code
block). That pairing is the source of truth - re-derive it, don't recall it
from a past run:

1. Find the image references:
   ```
   grep -rl 'assets/docs/.*image\.png' src/content/docs
   ```
2. For each mdx/md file found, read it and pull out both the resolved image
   path (resolve the relative `../../..` from the file's own location against
   `src/assets/docs/...`) and the `file="..."` value from the nearby
   `<ExampleXml>` tag in the same file.
3. The asset path is locale-independent - `en` and `th` pages for the same
   doc point at the same file under `src/assets/docs/`, so dedupe by output
   path (rendering once updates both languages). If a page's image doesn't
   have a same-directory `en`/`th` counterpart at the exact same asset path,
   don't assume - check both locale files for that doc.
4. If a page has an image but no `<ExampleXml>` nearby, don't guess the
   source file - ask, or check the mdx prose for which example it refers to.

## Steps

1. Build the pairs list as above.
2. Run the script once per unique output path:
   ```
   node renderer/src/render-doc-image.mjs renderer/examples/<source>.txml <resolved-output-path>
   ```
3. Read each regenerated PNG with the Read tool to eyeball it - check the
   change you made actually shows up as expected and nothing else broke
   (text overlap, clipped rows, wrong glyphs, wrong page count warning).
4. `git status` / `git diff --stat` to confirm only expected image files
   changed. No doc text or links change here, so `npm run check:links` isn't
   needed unless mdx content was also touched.
