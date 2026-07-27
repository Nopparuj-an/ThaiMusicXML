# ThaiMusicXML

Unless specified otherwise, do everything in English version first.
This includes plan, commit message, issue description, and PR description.

## Development

- There are currently no XSD/RelaxNG yet, refer to TreeView in `elements/index.mdx` for the schema hierarchy.
- Conformance rules are prose, not code, live in ## Conformance sections on the relevant element page, there's no validator yet to enforce them.
- astro check is currently broken in this environment, use `npx astro build` instead.
- For schema/design changes, propose and get explicit sign-off before editing; once confirmed, apply it across every affected file in one pass rather than incrementally.

## Writing and translations

- Utilize `humanizer` skill for natural writing.
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
