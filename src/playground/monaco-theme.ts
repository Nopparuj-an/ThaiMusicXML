// Monaco's theme API takes concrete colors, not CSS custom properties, so
// this page's own syntax palette lives here as plain numbers (the values
// that used to sit in the CodeMirror-era --cm-* custom properties) rather
// than as CSS this module reads back. Starlight's own --sl-color-* tokens
// are different: those are genuinely the site's, tuned by its accent-color
// config and possibly changed on upgrade, so those ARE read live off the
// document rather than copied here - resolveCssColor is what makes that
// possible, since a custom property's own computed value stays whatever
// literal string was written ("hsl(...)") and only a real CSS color
// property forces the browser to serialize it to rgb().
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function resolveCssColor(varName: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  const probe = document.createElement("span");
  probe.style.color = raw;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  const nums = rgb.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return nums
    .slice(0, 3)
    .map((n) => Math.round(n).toString(16).padStart(2, "0"))
    .join("");
}

interface SyntaxPalette {
  punct: string;
  tag: string;
  attr: string;
  value: string;
  comment: string;
  meta: string;
  gutterText: string;
  activeLine: string;
  selection: string;
  match: string;
  cursor: string;
}

const PALETTE: Record<"dark" | "light", SyntaxPalette> = {
  dark: {
    punct: hslToHex(224, 12, 65),
    tag: hslToHex(205, 70, 72),
    attr: hslToHex(280, 55, 80),
    value: hslToHex(140, 45, 70),
    comment: hslToHex(224, 10, 60),
    meta: hslToHex(38, 70, 70),
    gutterText: hslToHex(224, 10, 55),
    activeLine: hslToHex(224, 14, 21),
    selection: hslToHex(224, 40, 36),
    match: hslToHex(224, 20, 32),
    cursor: hslToHex(205, 85, 72),
  },
  light: {
    punct: hslToHex(224, 10, 38),
    tag: hslToHex(211, 70, 34),
    attr: hslToHex(283, 45, 40),
    value: hslToHex(152, 62, 25),
    comment: hslToHex(224, 9, 40),
    meta: hslToHex(28, 70, 32),
    gutterText: hslToHex(224, 8, 50),
    activeLine: hslToHex(224, 25, 93),
    selection: hslToHex(224, 70, 85),
    match: hslToHex(224, 45, 84),
    cursor: hslToHex(211, 80, 42),
  },
};

const THEME_NAME = "thaimusicxml";

function currentSiteTheme(): "dark" | "light" {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

// @lezer/xml's old tag set had a fallback "invalid" token for a mismatched
// close tag; Monaco's xml Monarch tokenizer has no equivalent, so there is
// no invalid-token rule to carry over here.
function applyMonacoTheme(monaco: typeof Monaco): void {
  const site = currentSiteTheme();
  const cm = PALETTE[site];
  const bg = resolveCssColor("--sl-color-bg-nav");
  const fg = resolveCssColor("--sl-color-text");
  const hairline = resolveCssColor("--sl-color-hairline");
  const accent = resolveCssColor("--sl-color-text-accent");

  monaco.editor.defineTheme(THEME_NAME, {
    base: site === "dark" ? "vs-dark" : "vs",
    inherit: false,
    rules: [
      { token: "delimiter.xml", foreground: cm.punct },
      { token: "tag.xml", foreground: cm.tag },
      { token: "metatag.xml", foreground: cm.meta },
      { token: "attribute.name.xml", foreground: cm.attr },
      { token: "attribute.value.xml", foreground: cm.value },
      { token: "string.escape.xml", foreground: cm.value },
      { token: "comment.xml", foreground: cm.comment, fontStyle: "italic" },
      {
        token: "comment.content.xml",
        foreground: cm.comment,
        fontStyle: "italic",
      },
      { token: "delimiter.cdata.xml", foreground: cm.meta },
    ],
    colors: {
      "editor.background": `#${bg}`,
      "editor.foreground": `#${fg}`,
      "editorLineNumber.foreground": `#${cm.gutterText}`,
      "editorLineNumber.activeForeground": `#${fg}`,
      "editorGutter.background": `#${bg}`,
      "editor.lineHighlightBackground": `#${cm.activeLine}`,
      "editor.selectionBackground": `#${cm.selection}`,
      "editor.selectionHighlightBackground": `#${cm.match}`,
      "editorCursor.foreground": `#${cm.cursor}`,
      "editorBracketMatch.background": `#${cm.match}`,
      "editorBracketMatch.border": `#${cm.match}`,
      "editorWidget.background": `#${bg}`,
      "editorWidget.border": `#${hairline}`,
      "editorHoverWidget.background": `#${bg}`,
      "editorHoverWidget.border": `#${hairline}`,
      "editorSuggestWidget.background": `#${bg}`,
      "editorSuggestWidget.border": `#${hairline}`,
      "editorSuggestWidget.selectedBackground": `#${cm.selection}`,
      "editorSuggestWidget.highlightForeground": `#${accent}`,
      "list.hoverBackground": `#${cm.match}`,
      "editor.findMatchBackground": `#${cm.selection}`,
      "editor.findMatchHighlightBackground": `#${cm.match}`,
      "scrollbarSlider.background": `#${hairline}80`,
      "scrollbarSlider.hoverBackground": `#${accent}80`,
    },
  });
  monaco.editor.setTheme(THEME_NAME);
}

// Applies the theme immediately, then keeps it in sync with Starlight's own
// toggle - which sets document.documentElement.dataset.theme directly, with
// no change event of its own (see ThemeProvider.astro / ThemeSelect.astro) -
// so a MutationObserver on that one attribute is the only way to hear it.
export function initMonacoTheme(monaco: typeof Monaco): void {
  applyMonacoTheme(monaco);
  new MutationObserver(() => applyMonacoTheme(monaco)).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] },
  );
}
