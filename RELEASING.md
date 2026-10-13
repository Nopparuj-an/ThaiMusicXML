# Releasing and archiving versions

The docs at the root (`/en/…`, `/th/…`) are always the **latest** version, and
`main` is what is deployed. An older version is frozen as an **archive** under
`/<locale>/<version>/` (for example `/en/v1_0/…`) by starlight-versions. The
schema works the same way: `public/schema/thaimusicxml-1.x.rng` is the rolling
latest 1.x, and each release gets a frozen `thaimusicxml-<version>.rng`.

An archive is a snapshot of the docs at one moment, so it must be taken from the
released commit, before the next version's changes are merged.

## Releasing a version

1. Merge the work to `main`. It is live as the latest docs straight away.
2. When you consider it released, tag that commit (`git tag v1.1.0 && git push --tags`).
   Nothing is archived yet: the latest docs are the release.

## When the next version replaces it

Say 1.1 is the latest and 1.2 is ready to merge.

1. Keep 1.2 on its own branch until step 4. `main` must still be at the `v1.1.0` commit.
2. On `main`, run `pnpm run archive:version v1_1 v1.1`. The script refuses unless
   `HEAD` is tagged `v1.1.0` and the working tree is clean.
3. Review the diff and commit it (`docs: archive v1.1`), then push or merge it to `main`.
4. Now merge the 1.2 branch. Its changes land on the root docs; the archive is untouched.
5. Tag `v1.2.0` once it is the release.

The script adds the version to `versions.config.mjs`, lets the plugin copy the
docs, repairs what the plugin gets wrong (the copied home page, the saved
sidebar, links to the playground and static files, `<TreeView base>` props, the
older archive copied inside the new one, unused image copies), freezes the
schema as `thaimusicxml-1.1.rng`/`.xsd`, then runs the build and the checks.
It changes files and never commits.

## By hand

- The archived schema pages (`reference/schema.mdx` and `tutorial/10-validating.mdx`
  under the new archive) still name the rolling `thaimusicxml-1.x.rng`. Point them
  at the frozen file if that version should show its own schema.
- Link the new latest introduction to the version before it, if you want that.

## Checks

`pnpm run check:versions` (also in CI and `pnpm run check`) verifies every
archive: it exists in each locale, has its saved sidebar, its marker folder and
its frozen schema, has no older archive nested inside it and no unused image
copies, and no page links out of the version. The corpus check also confirms
the rolling grammar still accepts everything each frozen grammar accepts.

A page that exists in one version but not another needs nothing: the build
redirects it to the other version's introduction, so the version selector never
lands on a 404 (`scripts/version-redirects.mjs`).

## Things to know

- Keep `src/content/docs/<version>/.gitkeep`. The plugin treats a version as new
  when that folder is missing, and git drops an empty folder, so without the file
  every fresh clone archives the current docs again.
- If the script fails partway, `git restore .` and remove the untracked
  `versions`/archive folders it created (`git status` lists them), then run it again.
- The archive is plain files after this. Fixing a typo in an old version means
  editing its folder; the script never regenerates one.
