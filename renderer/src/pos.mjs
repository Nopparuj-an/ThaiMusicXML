// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// Where a part's symbol lives, addressed independently of page coordinates.
// The grid pass (grid.mjs) records one of these for every symbol it places;
// the span pass (spans.mjs) reads them back to find where a bow or
// parenthesis marker's true ends landed, once every line the span touches has
// already been drawn.
export const posKey = (partId, pos) =>
  `${partId}:${pos.lineIndex}:${pos.measureIndex}:${pos.beatIndex}:${pos.slotIndex}`;
