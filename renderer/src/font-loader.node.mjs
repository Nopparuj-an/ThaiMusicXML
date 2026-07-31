// Font bytes for the Node CLI: read straight off disk, the same file
// @fontsource/sarabun ships and pnpm already resolves.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export async function loadFontFile(file) {
  const url = import.meta.resolve(`@fontsource/sarabun/files/${file}`);
  const buffer = readFileSync(fileURLToPath(url));
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
