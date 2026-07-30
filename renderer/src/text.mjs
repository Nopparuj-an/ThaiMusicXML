// Estimating how wide a string sets, and breaking it to fit a measure.
//
// SVG text does not wrap, so the renderer has to do it, and doing it needs
// widths. There is no font here to ask for metrics, so these are estimates
// keyed to the type size. They only have to be close enough: an annotation that
// wraps a word earlier than it had to is a blemish, one that runs off the page
// is not readable at all.

// Marks sitting above or below a letter: สระ, วรรณยุกต์, พินทุ, ทัณฑฆาต. They
// take no width of their own, so a string full of them is far narrower than its
// length suggests.
const COMBINING = /[ัิ-ฺ็-๎]/;

const THAI = /[฀-๿]/;
const NARROW = /[iljtIf.,;:!'|()[\]{}]/;
const WIDE = /[mwMW@]/;

export function charWidth(ch, size) {
  if (COMBINING.test(ch)) return 0;
  if (ch === " ") return size * 0.26;
  if (THAI.test(ch)) return size * 0.54;
  if (NARROW.test(ch)) return size * 0.3;
  if (WIDE.test(ch)) return size * 0.85;
  if (ch >= "A" && ch <= "Z") return size * 0.66;
  return size * 0.52;
}

export const textWidth = (str, size) =>
  Array.from(str).reduce((total, ch) => total + charWidth(ch, size), 0);

/**
 * A base letter with whatever marks hang off it. Breaking a line between a
 * letter and its own วรรณยุกต์ would leave the mark stranded at the start of the
 * next line, so the two never come apart.
 */
export function clusters(str) {
  const out = [];
  for (const ch of str) {
    if (out.length > 0 && COMBINING.test(ch)) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

/** The lines a string breaks into to fit within maxWidth. */
export function wrapText(str, size, maxWidth) {
  const source = String(str ?? "").trim();
  if (!source) return [];
  if (!(maxWidth > 0)) return [source];
  if (textWidth(source, size) <= maxWidth) return [source];

  // Thai puts spaces between phrases rather than between every word, and Latin
  // puts them between words. Either way a space is the one place a break is
  // certainly safe, so those come first.
  const chunks = source.split(/(\s+)/).filter((chunk) => chunk !== "");

  const lines = [];
  let line = "";
  const flush = () => {
    if (line.trim()) lines.push(line.trim());
    line = "";
  };

  for (const chunk of chunks) {
    if (/^\s+$/.test(chunk)) {
      if (line) line += " ";
      continue;
    }

    if (textWidth(line + chunk, size) <= maxWidth) {
      line += chunk;
      continue;
    }

    flush();

    if (textWidth(chunk, size) <= maxWidth) {
      line = chunk;
      continue;
    }

    // One run wider than the whole measure, which is what an unbroken stretch
    // of Thai gives, since there is nothing in it to break at. Falling back to
    // letters is wrong about where Thai words end, but it keeps the text on the
    // page, and reading it needs no more than that.
    for (const cluster of clusters(chunk)) {
      if (line && textWidth(line + cluster, size) > maxWidth) flush();
      line += cluster;
    }
  }

  flush();
  return lines.length > 0 ? lines : [source];
}
