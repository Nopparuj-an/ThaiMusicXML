# Converter handoff

Conversion policy is documented in
`src/content/docs/en/reference/conversion/index.md`. Schema or design changes
need the author's approval as described in `AGENTS.md`.

## Code

- `src/resolve.mjs` reuses the renderer parser, resolves repeats and endings,
  and produces exact note and lyric timelines. `fraction.mjs` supplies the
  rational arithmetic used for timing.
- `src/pitch.mjs` resolves tuning and pitch for both formats.
- `src/to-musicxml.mjs` writes MusicXML; `musicxml-durations.mjs` decomposes
  durations and tuplets. `src/to-midi.mjs` writes Standard MIDI files.
- `src/ensemble-groups.mjs` shares stack grouping between both writers.
- `convert.mjs` is the CLI; its header lists options. `dump.mjs` prints resolved
  timelines for checking real scores: `node converter/dump.mjs <score.txml> [partId]`.

Resolved notes do not cross their source measure boundary. A rest extends the
previous note within that measure; a sibling row's attack can cap an open-ended
note in the same stack. Missing sections still advance the part's timeline.
Empty notated ending measures inherit the base measure. The MusicXML writer
recuts events against the output measure grid and sizes divisions from the
recut durations. Its default downbeat shift and optional leading-empty-measure
trim apply to lyrics as well as notes.

## Testing

`pnpm run check:convert` runs converter tests, including conversion of real
examples and corpus fixtures. For timing or notation changes, inspect the
original reported case with `dump.mjs` and open exported files in a notation
program or DAW; passing synthetic tests alone does not establish visual or
playback correctness.

## Known limitations

- MusicXML currently unrolls repeats instead of writing native repeat barlines
  and volta endings. MIDI also unrolls repeats.
- MIDI skips lyrics; MusicXML pairs the first lyric part by default and supports
  explicit pairing. Unpitched MusicXML noteheads use a placeholder position.
- After the MusicXML downbeat shift, an extended open-ended note is not capped
  by a sibling stack row's attack in the newly reached measure.
- `example-lao-duang-duean.txml` contains `sound="x"` notes in pitched khim
  parts. The converter warns and outputs rests for type mismatches; verify the
  source with the author before changing the notes.
