# ThaiMusicXML

When editing docs content, update the English and Thai pages.
Although confirm English version with the user first before writing Thai.

## Development

- Schema is `public/schema/thaimusicxml-1.x.rng` (RELAX NG, rolling: always the latest v1.x; `thaimusicxml-1.0.rng` is frozen and never edited); TreeView in `elements/index.mdx` mirrors the same hierarchy.
- Conformance rules are prose, in ## Conformance sections on the relevant element page. The grammar covers what it can; the rest live in `scripts/check-corpus.mjs`, run over `public/corpus/` by `npm run check:corpus`.
- `astro check` does not support the installed TypeScript 7; use `pnpm run build` to verify the build. This does not replace type checking.
- Docs are versioned: the root is the latest, older versions are frozen archives under `<locale>/<version>/`. Never edit an archive to carry new work. Releasing and archiving: see `RELEASING.md` (`pnpm run archive:version`); `npm run check:versions` verifies the archives.
- After editing docs, run `npm run check:links`. It resolves every internal link and `#anchor`, including the TreeView slugs, and exits non-zero on a break.
- For schema/design changes, propose and get explicit sign-off before editing; once confirmed, apply it across every affected file in one pass rather than incrementally.

## Design invariants

- The renderer generates almost nothing. Structured fields (`section/@name`, `<composer>`, `<chan>`, `<repeat>`) are metadata for files and editors; what prints is text the arranger typed into an `<annotation>` or a credit. Default answer to any "should this print, and how" is "the arranger writes it". Generated labels are opt-in settings at most.
- A measure is the fixed time unit. Every part agrees on beat count per measure.
- Beats align vertically across parts. Cell width divides by the summed maximum subdivision per beat across all parts, not evenly by beat.
- One `<bpm>` beat is half a measure. Every measure lasts the same time whatever its beat count, and tempo is independent of ชั้น.
- Thai instruments have no notated sustain. A rest is no attack, not silence.

## Where a statement goes

- Rules a document must satisfy: `## Conformance` on the element page, collected in `reference/conformance/index.md`.
- How something displays: `reference/rendering/index.md`, non-normative in full. The element page gets only a short `## Rendering` pointer, never the policy.
- What an element means: the element page's main prose.

## Writing and translations

- Utilize `humanizer` (~/.agents/skills/humanizer) for natural writing, on both the English and the Thai text.
- Refer to ราชบัณฑิตยสภา spelling for Thai words.

# Astro

## Development

Normally, the user starts the dev server. If needed, run `pnpm dev` using the agent harness's background-process support and use the harness to manage it.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
