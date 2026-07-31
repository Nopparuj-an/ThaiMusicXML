// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Font bytes for the browser: static ?url imports so Vite bundles exactly
// these six files (the ones text.mjs measures with and draw.mjs embeds),
// fetched once and cached.

import thai400woff from "@fontsource/sarabun/files/sarabun-thai-400-normal.woff?url";
import latin400woff from "@fontsource/sarabun/files/sarabun-latin-400-normal.woff?url";
import thai400woff2 from "@fontsource/sarabun/files/sarabun-thai-400-normal.woff2?url";
import latin400woff2 from "@fontsource/sarabun/files/sarabun-latin-400-normal.woff2?url";
import thai700woff2 from "@fontsource/sarabun/files/sarabun-thai-700-normal.woff2?url";
import latin700woff2 from "@fontsource/sarabun/files/sarabun-latin-700-normal.woff2?url";

const URLS = {
  "sarabun-thai-400-normal.woff": thai400woff,
  "sarabun-latin-400-normal.woff": latin400woff,
  "sarabun-thai-400-normal.woff2": thai400woff2,
  "sarabun-latin-400-normal.woff2": latin400woff2,
  "sarabun-thai-700-normal.woff2": thai700woff2,
  "sarabun-latin-700-normal.woff2": latin700woff2,
};

export async function loadFontFile(file) {
  const response = await fetch(URLS[file]);
  return response.arrayBuffer();
}
