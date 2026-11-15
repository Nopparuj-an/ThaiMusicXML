# Renderer handoff

The rendering policy lives in `src/content/docs/en/reference/rendering/index.md`.
Follow `AGENTS.md` for design decisions and documentation changes; compare visual
changes with a printed reference and ask the author rather than guessing.

## Code

- `src/parse.mjs` reads XML and resolves bow, parenthesis, and link markers.
- `src/layout.mjs`, `grid.mjs`, `geometry.mjs`, `spans.mjs`, and `pager.mjs`
  turn the parsed score into page geometry. `text.mjs` estimates text widths
  and wraps text; Thai unbroken runs fall back to letter-level breaks.
- `src/draw.mjs` turns geometry into SVG; `settings.mjs` holds display settings.
- `render.mjs` is the CLI. `examples/` contains source scores, including visual
  stress fixtures. Tutorial and example pages embed these sources at build time.

The arranger supplies printed text; generated section names and header extras
are opt-in. Beats arrive at the last slot. Across parts, subdivisions use the
sum of each beat's maximum, not an LCM or an even division. Link spans consider
all sounding notes in a stack; sibling rows contribute whole beats because
their slot indices do not correspond. Lyrics do not determine subdivisions.
Lines and their part rows stay together across pages; the layout measures a
line before placing it.

## Testing

`pnpm run check:layout` runs the renderer tests. To inspect a real score:

```sh
pnpm run render renderer/examples/example-khaek-borathes.txml out.svg
```

Multi-page output uses numbered filenames (`out-1.svg`, `out-2.svg`, etc.);
check stderr for the actual paths. Inspect rendered output for visual changes,
not just test results. After changes that affect rendered documentation images,
follow the `render-docs-images` skill.

## Known limitations

- Endings print as separate grids. Span matching is not pass-aware across a
  regular line and an ending, and does not inherit span markers from unchanged
  measures within the ending's own grid.
- Text width is estimated, and Thai line breaking has no dictionary.
- Bow curve proportions remain a visual first pass; see `bowTop`, `bowRise`,
  and `bowStroke` in `settings.mjs` and `test-spans-and-endings.txml`.
