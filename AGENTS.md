# ThaiMusicXML

Unless specified otherwise, do everything in English version first.
This includes plan, commit message, issue description, and PR description.

## Development

- There are currently no XSD/RelaxNG yet, refer to TreeView in `elements/index.mdx` for the schema hierarchy.
- Conformance rules are prose, not code, live in ## Conformance sections on the relevant element page, there's no validator yet to enforce them.
- astro check is currently broken in this environment, use `npx astro build` instead.
- After editing docs, run `npm run check:links`. It resolves every internal link and `#anchor`, including the TreeView slugs, and exits non-zero on a break.
- For schema/design changes, propose and get explicit sign-off before editing; once confirmed, apply it across every affected file in one pass rather than incrementally.

## Normative vs non-normative

The reference is split three ways, and a statement belongs in exactly one of them:

- **Rules a document must satisfy** go in a `## Conformance` section on the element page, and are collected in `reference/conformance/index.md`.
- **How something is displayed** goes in `reference/rendering/index.md`, which is non-normative in full. The element page gets a short `## Rendering` section pointing at the relevant anchor, not the policy itself.
- **What an element means** stays in the element page's main prose.

Display policy does not belong in an element page's main prose. If the question is "should this print, and how", the answer lives in the rendering reference.

## Writing and translations

- Utilize `humanizer` (~/.agents/skills/humanizer) for natural writing.
- Refer to ราชบัณฑิตยสภา spelling for Thai words.

# Astro

## Development

Normally, the user will start dev server themself.
When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
