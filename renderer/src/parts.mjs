// Copyright 2026 Nopparuj Ananvoranich
// SPDX-License-Identifier: Apache-2.0

// What a part's type says about the shape of its data.
//
// Two of the four types hold text rather than music: a lyric part's measures
// hold <syllable> items and a chord part's hold <chord> items, both alongside
// <rest>. Neither divides into beats, so both are excluded wherever the layout
// counts beats, rules a stack together, or resolves a span. See part.md's
// "Text parts".

export const isTextPart = (type) => type === "lyric" || type === "chord";
