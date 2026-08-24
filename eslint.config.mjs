// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Recommended rules only, no stylistic ones: this codebase already has a
// deliberate prose-comment style and no prior formatter, so the point of
// linting here is to catch real mistakes - an undefined reference, an
// unused binding - rather than to impose a house style nobody has agreed
// to yet.
//
// Plain JS only, for now: this project runs Astro's own TypeScript 7
// preview (see package.json's "typescript": "^7.0.2", and @astrojs/check's
// matching peer warning), and typescript-eslint 8.x hard-throws on import
// against anything past TS 6 - see
// https://github.com/typescript-eslint/typescript-eslint/issues/10940.
// *.ts and *.astro are excluded below until that lands; the renderer and
// the corpus/link checkers - where the "no linter at all" gap actually was
// - are plain JS already and get linted in full.

import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "renderer/out/**",
      // Typed - see the note above.
      "src/**/*.ts",
      "**/*.astro",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // These load in a browser (the docs playground, and draw.mjs's own
    // font-loading split), not under Node.
    files: ["renderer/src/*.browser.mjs", "scripts/render-doc-image.mjs"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    rules: {
      // The renderer and the corpus checker both use a leading `_` on a
      // handful of intentionally-unused destructured values (map/filter
      // callbacks that only need a later argument); allow that pattern
      // rather than ignoring unused vars entirely.
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];
