---
title: Overview
description: ThaiMusicXML v0.1 Roadmap
---

## Version v0.1 (Development Phase)

ThaiMusicXML v0.1 is the first version. The standard is being defined and implemented, focusing on core concepts and basic functionality.

### Scope

- Core schema for Thai music representation (7-tone scales, 8-measure grid, ชั้น levels)
- Basic element support: notes, rests, measures, lines, sections, parts

### Not covered in v0.1

These are known gaps, deferred to a later version rather than overlooked. A v0.1 document can only record them as free-form `<annotation>` text.

- **หน้าทับ and percussion patterns.** No structured representation of the rhythmic cycle. Instruments such as ตะโพน and กลองแขก can be written out as unpitched parts, but the cycle itself is not modelled.
- **Vocals.** No element for เนื้อร้อง, lyric alignment, or เอื้อน.
- **Ornamentation.** Techniques such as กรอ and สะบัด have no dedicated markup. `<group>` covers subdivision only.
- **Simultaneous pitches within one part.** A `<note>` carries one pitch, so คู่แปด and similar intervals cannot be written on a single line. Instruments that need more than one line split across a `stack` of parts instead.
- **ทาง.** [`<tuning>`](/en/v0_1/reference/elements/tuning/) fixes what pitch ด sounds at, but there is no element for the ทาง a piece is played in.

### Next steps

- Continue core development and feature implementation
- Develop validator and parsers based on the core schema
- Develop a renderer
- Gather community feedback
- Prepare for future versions

---
