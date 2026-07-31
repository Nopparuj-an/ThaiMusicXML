// Measuring and breaking annotation text.
//
// The widths are estimates, so these assert relationships that any reasonable
// estimate has to satisfy rather than particular numbers. A test pinned to an
// exact width would only be measuring the guess.

import { test } from "node:test";
import assert from "node:assert/strict";
import { textWidth, clusters, wrapText, textReady } from "../src/text.mjs";

await textReady();

const SIZE = 11;
const fits = (lines, width) =>
  lines.every((line) => textWidth(line, SIZE) <= width + 1e-9);

test("a mark above or below a letter adds no width", () => {
  // ท่อน sets no wider than ทอน: the ่ hangs over the ท rather than beside it.
  assert.equal(textWidth("ท่อน", SIZE), textWidth("ทอน", SIZE));
  assert.ok(textWidth("ทฺ", SIZE) === textWidth("ท", SIZE), "พินทุ takes no width");
});

test("a letter keeps the marks that hang off it", () => {
  assert.deepEqual(clusters("ท่อน"), ["ท่", "อ", "น"]);
  assert.deepEqual(clusters("ดํ"), ["ดํ"]);
});

test("text that already fits is left alone", () => {
  assert.deepEqual(wrapText("กลับต้น", SIZE, 500), ["กลับต้น"]);
  assert.deepEqual(wrapText("", SIZE, 500), []);
});

test("a long line breaks at spaces", () => {
  const source = "the arranger writes the instruction as an annotation instead";
  const width = 120;
  const lines = wrapText(source, SIZE, width);

  assert.ok(lines.length > 1, "it wraps");
  assert.ok(fits(lines, width), "every line fits the measure");
  assert.equal(lines.join(" "), source, "no text is lost or added");
});

test("an unbroken run wider than the measure still fits on the page", () => {
  // Thai writes no space between words, so a long phrase offers nothing to
  // break at. Breaking by letter is wrong about where the words end, but the
  // alternative is text running off the page.
  const source = "หน้าทับปรบไก่สองชั้นสำหรับระนาดเอกและฆ้องวงใหญ่";
  const width = 60;
  const lines = wrapText(source, SIZE, width);

  assert.ok(lines.length > 1, "it wraps");
  assert.ok(fits(lines, width), "every line fits the measure");
  assert.equal(lines.join(""), source, "no text is lost or added");
});

test("a break never strands a mark at the start of a line", () => {
  const source = "ท่อนที่หนึ่งซ้ำสองรอบแล้วกลับต้นทันที";
  for (const width of [30, 45, 70, 110]) {
    for (const line of wrapText(source, SIZE, width))
      assert.ok(
        textWidth(line[0], SIZE) > 0,
        `line "${line}" at width ${width} opens on a mark`,
      );
  }
});

test("a measure too narrow for one letter still terminates", () => {
  const lines = wrapText("ระนาดเอก", SIZE, 1);
  assert.ok(lines.length > 0);
  assert.equal(lines.join(""), "ระนาดเอก");
});
