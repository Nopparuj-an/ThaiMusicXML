---
title: Conversion
description: How a ThaiMusicXML document maps to other notation and playback formats
---

This page defines how a conforming converter turns a ThaiMusicXML document into another format. v1.0 covers two export targets, **MusicXML** and **MIDI**; import, in either direction, is not addressed here. Nothing on this page applies to a renderer, validator, or player that never produces another format's file, and none of it changes what a ThaiMusicXML document is or whether it is valid. See [Conformance](/en/v1_0/reference/conformance/) for that.

Both targets fit a fixed-rate slot grid with no notated sustain into a model built around onsets and durations. Neither model is wrong; they describe the same sound differently. Every section below is a place where that fit is inexact and a choice has to be made. [Converter settings](#converter-settings) collects every one of those choices with the default this page specifies. MusicXML and MIDI export share one internal timing model, described first, so that a note's resolved pitch and duration is computed once and only its final encoding differs by target.

## Converter settings

| Decision | Default | Where |
| --- | --- | --- |
| Pitch reference when `<tuning>` is absent | `c-major` | [Pitch](#pitch) |
| Pitch reference when `<tuning>` is present | Use the declared `reference`; a command-line override may force one regardless | [Pitch](#pitch) |
| How far a note extends through trailing rests | Up to the end of its own measure, never tied into the next; in a stacked row, also capped at the next attack in any sibling row | [Rests](#rests) |
| MIDI tuning accuracy | Snap to 12-TET, the same pitch a note gets in the MusicXML export | [MIDI: pitch](#pitch-1) |
| MIDI patch for a pitched part | Lookup by `instrument-name` against a known-name table, generic patch on no match | [MIDI: instrument patches](#instrument-patches) |
| MIDI note for an unpitched `sound` code | Auto-assigned from a General MIDI percussion note, in order of first appearance; configurable | [MIDI: percussion](#percussion) |
| Time signature (MusicXML) | 2/4, one measure to the bar; one note slot per eighth note in a four-beat measure | [MusicXML: rhythm](#rhythm) |
| A measure whose beat count does not divide 2/4 exactly (MusicXML) | Exported at one eighth per slot, overrunning the bar, with a warning. Writing it as a measure-wide tuplet is not in v1.0 | [MusicXML: rhythm](#rhythm) |
| A measure whose beat count is not four (MIDI) | Tempo scaled for that measure so it still lasts two bpm beats | [MIDI: rhythm and tempo](#rhythm-and-tempo) |
| Silence in a MusicXML measure | One rest per stretch of it, broken where the beat falls; a measure nothing sounds in gets a single whole-measure rest | [MusicXML: rhythm](#rhythm) |
| Where a Thai measure's counted beat lands (MusicXML) | On the next measure's first beat: the music moves one note slot later, the barlines stay put; a command-line option leaves it where the source has it | [MusicXML: the counted beat](#the-counted-beat) |
| Measures at the front of a piece that no part plays in (MusicXML) | Kept; a command-line option drops them | [MusicXML: empty measures at the front](#empty-measures-at-the-front) |
| `<bow>` direction (`in`/`out`) in MusicXML | Dropped; only the slur itself carries over | [MusicXML: bowing](#bowing) |
| `<repeat>`, `<line-repeat>`, `<ending>` in MusicXML | Native MusicXML repeat barlines and endings; falls back to unrolling where a `<repeat>` wraps more than one section | [MusicXML: repeats and endings](#repeats-and-endings) |
| `<repeat>`, `<line-repeat>`, `<ending>` in MIDI | Unrolled into one linear sequence of events | [MIDI: repeats and endings](#repeats-and-endings-1) |
| Stacked instrument rows (`stack`/`row`) | Merged: one MusicXML part with one staff per row, one MIDI track/channel for the whole stack; a command-line option splits each row out on its own | [Stacked instruments](#stacked-instruments) |
| `<parenthesis>` (cued passage) in MIDI | Audible by default; `mute="true"` silences it | [MIDI: cued passages](#cued-passages) |
| `<link>` (gesture curve) | Dropped in both formats; it marks the page, not the sound | [Bowing](#bowing) |
| A `pitch`/`sound` value that doesn't match its part's declared type | Converts as a rest, with a warning, rather than sounding on the wrong kind of channel or notehead | [Unpitched and lyric parts](#unpitched-and-lyric-parts) |
| Lyric part pairing to a notated part (MusicXML only) | The first lyric part (ensemble order) pairs to the first notated part or stack; a command-line option states an explicit pairing, or turns lyric export off entirely | [Unpitched and lyric parts](#unpitched-and-lyric-parts) |

## Pitch

A `pitch` value names a degree of the Thai scale, not a frequency. See [`<tuning>`](/en/v1_0/reference/elements/tuning/). Both export targets need an absolute reference before they can write a pitch, and the mapping is diatonic and exact only in the sense that `<tuning>` already commits to: ด/1/D → C, ร/2/R → D, ม/3/M → E, ฟ/4/F → F, ซ/5/S → G, ล/6/L → A, ท/7/T → B, carrying whatever `octave` the note has. `reference="bb-major"` shifts the same mapping down a whole step. No other `reference` value has a defined mapping in v1.0; a converter that receives one should fall back to `c-major` and warn.

A score with no `<tuning>` converts as `c-major`, since `<tuning>` is optional and most scores omit it. A converter should warn when it does this, since the resulting key is a guess rather than something the file stated. A command-line override may force a specific reference regardless of what the file declares or omits, for producing a transposed part from the same source.

Thai tuning divides the octave into seven near-equal steps; no Western key matches it exactly, and this mapping does not attempt to. It picks the closest practical fit, the same way `<tuning>` itself does, for both a printed MusicXML pitch and a played MIDI note number.

## Rests

A [`<rest>`](/en/v1_0/reference/elements/rest/) means no new attack, not silence: the instrument's last note is still decaying. A converter extends the previous note's duration through consecutive rests to represent that, rather than treating the rest as an independent silent event.

The extension stops at the end of the note's own measure. A note never extends into the next measure to cover a rest, however many rests follow it there: the barline is where the written decay ends, whatever the instrument would still be doing acoustically. Any `<rest>` before a part's first note, or a `<rest>` where nothing has sounded yet, converts as an actual silence.

Where the extending note belongs to a [stacked](#stacked-instruments) row, the extension also stops at the next attack in any other row of that stack, not only its own. A stack is one physical instrument, so a decaying note stops mattering the moment either hand strikes again. This only shortens an extension that the row's own writing left open-ended: a rest was absorbed, or the row simply has nothing more written that measure. It never overrides a note whose own row's next note follows it with no gap: that spacing is the arranger's explicit choice, and a sibling row playing underneath or over it doesn't change it. This is why a fast passage in one row of a stack doesn't force a sustained note in the other row to cut short to match it, while a long-decaying note with nothing else written in its own row does stop where the other row's next note actually falls.

This resolved duration, pitch plus onset plus length in slots, is the shared unit both targets encode: MusicXML as a tied or lengthened note (see [Rhythm](#rhythm)), MIDI as a single note-on held for that length before its note-off (see [MIDI: rhythm and tempo](#rhythm-and-tempo)).

## Stacked instruments

A [`stack`](/en/v1_0/reference/elements/part/#stacked-instruments) is one physical instrument played by one performer across several rows, not several performers. A converter merges a stack's rows rather than giving each its own part or track: MusicXML gets one part with one staff per row, numbered in `row` order, the same way a piano's two hands share one part across two staves; MIDI gets one track and one channel for the whole stack, since MIDI channels are already polyphonic and the rows are genuinely simultaneous output from one instrument. Splitting them further would be a mixing choice, not a more accurate one.

Being one instrument also means the rows aren't resolved in isolation: see [Rests](#rests) for how an open-ended extension in one row is bounded by the other rows' attacks.

A command-line option splits a stack's rows into separate parts or tracks instead, for a user who wants to route or mute each row independently in a DAW or notation editor.

## MusicXML export

### Rhythm

Every measure converts to 2/4 time, which is one measure's worth of the [`<bpm>`](/en/v1_0/reference/elements/bpm/) beat: a bpm beat is half a measure, so a measure is two quarter notes. In the usual four-beat measure that puts one note slot on one eighth note.

A measure with some other beat count still fills its 2/4 bar, since a measure's length does not depend on how finely it is cut. Where that count divides the bar exactly - two beats to the quarter, eight to the sixteenth - the slots convert to those values directly. Where it does not, the bar needs a tuplet across the whole measure, which **v1.0's converter does not write**: it exports the measure at one eighth per slot, which makes that one bar longer than 2/4 and the piece longer than the source, and warns. A score whose measures all share a beat count, which is nearly all of them, never meets this.

A converted note's duration always reaches to the next attack rather than a fixed share of its own beat. [Rests](#rests) already needs this to fold a decaying instrument's silence into the note before it, and a [`<group>`](/en/v1_0/reference/elements/group/#where-the-children-fall) needs the same rule for a different reason: a beat arrives on its last slot, so a group's last member lands exactly where a plain note at that beat would, the same position the renderer's own page layout gives it, and the earlier members lead up to it, drawing their time from whatever preceded the group rather than from an equal share of the group's own beat. A group of *k* members therefore converts to *k* notes of unequal duration, not a Western tuplet of *k* equal ones: the members before the last one are short, spaced `1/k` of a beat apart, and the last one rings for as long as nothing else attacks, which can be a full beat or more.

**Every measure is written full.** Silence left over after the notes in it - before a part's first note, where a decay was cut short by [another row of the same stack](#stacked-instruments), or wherever a written [`<rest>`](/en/v1_0/reference/elements/rest/) had nothing before it to extend - becomes rests, so that a measure's contents add up to its own length. A stretch of silence is one rest of that length, not one rest per slot: the slot grid is how the source counts time, not how a rest is written. The one place a stretch does break is where the output's own beat falls, since a rest that straddles two beats hides where the second one starts - three slots of silence beginning on a bar's second eighth are an eighth rest and then a quarter rest, not one dotted quarter rest. A measure nothing sounds in at all is written as one whole-measure rest, the way an empty bar is normally engraved, rather than as whatever written values its length happens to decompose into.

Notes are not broken at the beat the way rests are: a note is written as the single value that fits it wherever one exists, dotted where that helps, and tied only where no single value will do - or where it crosses a barline, which the [counted beat](#the-counted-beat) shift can make happen to a note that fit inside its measure in the source.

### The counted beat

Thai music counts to the last beat of a measure; Western notation counts from the first. The same phrase therefore sits differently on the page in the two systems, and a measure-for-measure transcription puts the beat a Thai musician hears as the arrival on the weakest position of the Western bar.

A converter shifts the music one note slot later to correct this, so that each measure's last beat becomes the first beat of the next Western measure. The barlines don't move; everything written between them does. Three things follow from that: the first measure opens with an eighth rest, where the shift moved the music off; a note that reached its own barline in the source now crosses one, and is written as tied notes on either side of it; and the piece's own last counted beat needs one more measure to land in. That extra measure appears only when a note is actually struck on that beat - a note still ringing across the final barline is cut off there instead, exactly as a decay is already cut off at every other barline (see [Rests](#rests)), rather than buying a whole measure for a tie nobody plays.

This is on by default, since a printed Western score is what the export is for. A command-line option (`--no-downbeat-shift`) writes the music where the source puts it, for reading an export against its source measure by measure, or for a piece whose notation is already counted the Western way.

### Empty measures at the front

Measures at the front of a piece that no part plays a note in are kept, since they are in the source and may well be deliberate - a count-in, or an alignment with some other score. A command-line option (`--trim-leading-empty-measures`) drops them.

The count is taken across the whole ensemble, never part by part: the leading run of measures in which *nothing anywhere* sounds. Every part then loses the same measures and the parts stay aligned with each other, which is what makes this safe to do at all - a part that rests for its first eight measures while another plays through them keeps every one of them. Only the front of the piece is affected; an empty measure anywhere else is part of the music.

### Bowing

A [`<bow>`](/en/v1_0/reference/elements/bow/) span becomes a MusicXML slur across the same notes. `direction` (`in`/`out`) has no fixed up-bow/down-bow convention for the instruments ThaiMusicXML's bowing marks apply to, so a converter drops it rather than asserting one.

A [`<parenthesis>`](/en/v1_0/reference/elements/parenthesis/) span becomes a run of MusicXML cue notes. `dim` and `mute` are rendering and playback hints with no MusicXML equivalent and are dropped.

A [`<link>`](/en/v1_0/reference/elements/link/) span is dropped in both formats. It says the notes under it are one gesture, which is a statement about the page rather than about the sound: nothing in it changes a pitch, an onset, or a duration. Converting it to a slur would assert a phrasing the source never claimed, and the notes carry the gesture on their own.

### Metadata

[`<chan>`](/en/v1_0/reference/elements/chan/) and [`<nathap>`](/en/v1_0/reference/elements/nathap/) carry no timing on their own, see [What it does](/en/v1_0/reference/elements/chan/#what-it-does), and convert as text, not as anything that changes duration. An [`<annotation>`](/en/v1_0/reference/elements/annotation/) converts to a MusicXML direction carrying the same text at the same position.

### Repeats and endings

[`<repeat>`](/en/v1_0/reference/elements/repeat/), [`<line-repeat>`](/en/v1_0/reference/elements/line-repeat/), and [`<ending>`](/en/v1_0/reference/elements/ending/) convert to MusicXML repeat barlines and ending (volta) brackets rather than being unrolled into a single linear pass. A `<repeat times="n">` or `<line-repeat first last times>` becomes a forward/backward repeat barline pair around the measures it spans, with the matching `times` count; a `pass` list on `<ending>` becomes a volta bracket over the same numbers. This keeps a converted score looking like the source it came from instead of a flattened transcript, at the cost of resolving spans (including [`<bow>`](/en/v1_0/reference/elements/bow/#semantics) and [`<parenthesis>`](/en/v1_0/reference/elements/parenthesis/#semantics)) against whichever pass they fall in, the same resolution the elements themselves already require.

This native encoding only represents structures where a `<repeat>` wraps exactly one section, however deeply nested that wrapping is: [`<repeat>`'s own "Total pass count"](/en/v1_0/reference/elements/repeat/#total-pass-count) example nests a section in two `times="2"` repeats, and that collapses to one barline pair with `times="4"`. A `<repeat>` wrapping more than one section as siblings can play them in an order no single barline pair can express: `repeat×2{ repeat×2{A}, B }` plays A A B A A B, which a `times="4"` barline around A alone would misrepresent by playing it four times running. A converter falls back to fully unrolling that repeat's own scope into plain measures for a case like this, with a warning, rather than encoding an order the barline can't actually produce.

### Unpitched and lyric parts

A `sound` value on an unpitched [`<note>`](/en/v1_0/reference/elements/note/) is instrument-specific and has no defined mapping to a MusicXML notehead; a converter writes one unpitched notehead per distinct code appearing in the part and carries whatever [`<annotation>`](/en/v1_0/reference/elements/annotation/) explains the codes as a legend.

A `pitch` or `sound` value that doesn't match its part's declared type - a `sound`-bearing note in a part not declared `type="unpitched"`, or the reverse - is invalid per [`<note>`'s Conformance](/en/v1_0/reference/elements/note/#conformance), but a converter still has to do something with it rather than fail the whole document. It means nothing on either reading: not a real pitch, and not a percussion code on an instrument nobody declared unpitched. A converter converts it as a rest instead, with a warning, the same soft-violation handling this format uses elsewhere.

A [lyric part](/en/v1_0/reference/elements/part/#part-types) converts to MusicXML `<lyric>` elements attached to whichever notated part it is paired with. ThaiMusicXML keeps lyrics as an independent part rather than attached to one, so the format itself states no pairing; a converter has to pick one. Each syllable attaches to whichever note is actually sounding at its position first - not necessarily one that starts exactly there, since a decaying note can still be ringing (see [Rests](#rests)). Failing that (the syllable falls on real silence), it attaches to the nearest note before it instead, the same reasoning as a written-out rest: the words belong to whatever was last played. Failing that too (nothing has played yet), it falls back to the nearest note after it. Only a target part with no note anywhere leaves a syllable with nothing to attach to, dropped with a warning.

**Pairing.** With no further input, the first lyric part in ensemble order pairs to the first notated part or stack; any further lyric part is dropped, with a warning, since guessing a second pairing has no better basis than guessing the first. A command-line option (`--lyrics-map`) states an explicit pairing instead - by part id, or, for a paired stack, a specific row's id - and replaces the default guess entirely rather than adding to it. `--no-lyrics` turns lyric export off. This applies to MusicXML only; MIDI export does not carry lyrics in v1.0.

**Timing.** A syllable's position within its measure follows [`<syllable>`'s counting rule](/en/v1_0/reference/elements/syllable/#counting): item *i* of *n* lands at `beat count × i ÷ n`, which is exactly beat *i* when the item count matches the beat count, and spreads the items evenly across the measure otherwise - a defined time is needed either way for something to attach a `<lyric>` to, even where the source measure was written free of the beat grid. A `<rest>` in the lyric measure (เอื้อน: the vowel already being sung carries on) still occupies a slot in that spacing but contributes no `<lyric>` element of its own.

## MIDI export

### Pitch

MIDI export reuses the same degree-to-pitch mapping as MusicXML: every note snaps to the nearest 12-tone equal-tempered pitch rather than the true ~171-cent Thai scale step. A converter could instead hold Thai tuning exactly with per-note pitch bend, but bend is a per-channel MIDI property, which would force one channel per concurrently sounding voice, and most players and synths assume 12-TET anyway. Snapping keeps a MIDI file playable in any General MIDI synth and sounding like the same key as the MusicXML export of the same score, at the cost of true Thai intonation.

### Instrument patches

`instrument-name` is free text, so a converter matches it against a table of known Thai instrument names to a General MIDI patch. A part whose name matches nothing in the table gets one fixed generic patch and a warning, rather than a guess with no basis. The table is expected to grow as more instrument names are added to it; an unmatched name is a gap in the table, not a fault in the document.

| Instrument | General MIDI patch |
| --- | --- |
| ระนาดเอก (ranat ek) | Xylophone |
| ฆ้องวงใหญ่ (khong wong yai) | Vibraphone |
| ขิม (khim) | Dulcimer |
| จะเข้ (chakhe) | Koto |
| ซอด้วง (saw duang) | Violin |
| ซออู้ (saw u) | Cello |
| Anything unmatched | Xylophone, with a warning |

### Percussion

An unpitched part's `sound` codes are instrument-specific with no defined mapping to a General MIDI percussion note, so a converter assigns each distinct code appearing in the part a percussion note automatically, in the order the codes first appear, cycling through Acoustic Snare, Hand Clap, Closed Hi-Hat, Open Hi-Hat, Low Tom, High Tom, Cowbell, and Claves. A configuration file overrides specific assignments. This produces a playable file with no setup, at the cost of an arbitrary note choice until someone overrides it.

### Cued passages

A [`<parenthesis>`](/en/v1_0/reference/elements/parenthesis/) span sounds normally by default, even though it marks a passage this part is only cued for while another instrument actually carries it: most scores never set `mute`, and defaulting to silence would leave those cue passages simply missing from the MIDI file rather than doubled. `mute="true"` silences the span for a file that wants the more literal reading; `mute="false"` states the audible default explicitly. `dim` has no MIDI equivalent and is dropped.

### Rhythm and tempo

`<bpm>` sets a MIDI tempo (set-tempo meta event): one bpm beat is a quarter note in the same 2/4 framework the MusicXML export uses, so for the usual four-beat measure the numeric value carries over unchanged. Where a measure's beat count differs from four, its slots have to fit the same two bpm beats as any other measure, and MIDI has no measure-relative tempo to say so with, so the converter scales microseconds-per-quarter for that measure instead - `240000000 / (bpm × beats)` - and sets it back afterwards. The measures stay equal in length, which is what [`<bpm>`](/en/v1_0/reference/elements/bpm/#the-unit-being-counted) asks for, and no tuplet is needed because nothing is being engraved. Each resolved note (see [Rests](#rests)) becomes one note-on followed by a note-off after its full duration in slots, rather than a short strike left to a synth's own decay, since General MIDI patches vary widely in how long they ring on their own.

### Repeats and endings

Standard MIDI has no native repeat-barline or ending concept, so [`<repeat>`](/en/v1_0/reference/elements/repeat/), [`<line-repeat>`](/en/v1_0/reference/elements/line-repeat/), and [`<ending>`](/en/v1_0/reference/elements/ending/) are unrolled: a converter walks every pass a section actually plays and writes each one's notes as its own stretch of events, rather than one section's worth of events replayed by the sequencer. This is the opposite of the MusicXML approach, and follows from what the format can express rather than from a preference for one score's-worth of layout over another.

### Metadata

[`<chan>`](/en/v1_0/reference/elements/chan/), [`<nathap>`](/en/v1_0/reference/elements/nathap/), and [`<annotation>`](/en/v1_0/reference/elements/annotation/) carry no timing and convert to MIDI text or marker meta events at the same position, for an editor to display. A player that ignores meta events plays the file correctly regardless.

## Scope

v1.0 defines ThaiMusicXML to MusicXML and ThaiMusicXML to MIDI. Import, in either direction, is not addressed here.
