# Sound Design Direction

## Goal

The audio system should support generated ambient music and environmental
soundscapes for a wilderness-focused terrain prototype. The target is not a
general-purpose synthesizer or rhythm workstation. It should become a
specialized landscape music generator for a world that feels ancient, lonely,
mythical, and physically tied to terrain.

The tool should still preserve low-level experimentation paths. Raw synthesis
is useful for learning, debugging, and discovering textures. Higher-level modes
should add constraints that make good results easier and more coherent.

## Creative Identity

The desired music should lean toward:

- drones instead of songs
- modal and pentatonic pitch material instead of chromatic movement
- evolving layers instead of loops or beats
- imperfect detuning instead of clean digital precision
- sparse events instead of dense rhythm
- natural noise textures such as wind, insects, water, and distant rumble
- ancient or folk-adjacent intervals without becoming a melody generator first

Avoid early piano-roll, MIDI-grid, or step-sequencer metaphors. The better
mental model is a soundscape that is constrained by a musical landscape.

## Audio Studio Modes

The Audio workspace should remain split into modes:

- `Spectrogram`: source-audio analysis, scribble painting, and resynthesis.
- `Synthesis`: raw additive oscillator experimentation.
- `Soundscape`: constrained modal/layer-based generation for the game style.

`Synthesis` should stay raw. It is the lab bench. `Soundscape` should be the
opinionated music-design tool.

## Soundscape Model

The long-term structure should be:

```text
Soundscape
  -> root note
  -> scale or mode
  -> global register / tonal range
  -> drone layers
  -> resonance layers
  -> shimmer layers
  -> noise and weather layers
  -> rare motif events
  -> modulation and drift rules
```

The first implementation should focus on tonal constraints:

- root note
- scale or mode
- scale degree
- octave/register
- detune in cents
- waveform type
- amplitude

Raw frequency should be secondary in this mode. The user should mostly choose
musical relationships rather than exact Hz values.

## Initial Scales

Start with a small set of strong choices:

- `Minor Pentatonic`: lonely, ancient, and safe.
- `Major Pentatonic`: open, natural, and pastoral.
- `Dorian`: old-world, earthy, and not too sad.
- `Aeolian`: darker natural minor.
- `Phrygian`: mythical, ritual, and harsher.
- `Suspended Pentatonic`: ancient, neutral, and spacious.

More scales can be added later, but too many options early will make the tool
feel generic.

## Layer Roles

Soundscape layers use roles to apply useful defaults and keep the generator
opinionated:

- `Drone`: long sustained root, fifth, or modal anchor.
- `Resonance`: quiet harmonic or overtone support.
- `Shimmer`: high, soft, detuned, and slowly moving.
- `Pulse`: very slow swelling, not beat-driven.
- `Call`: sparse higher modal movement.
- `Wind`: filtered broad noise for air movement.
- `Rumble`: low filtered noise for distant earth/weather weight.
- `Air`: high filtered noise for hiss, insects, and thin atmosphere.

Roles now drive defaults, modulation behavior, register ranges, source type,
and randomization rules.

## Feature Roadmap

Recommended order:

1. `Scale/harmonic lock`: root, scale, degree, octave, detune.
2. `Detune ranges`: cents offsets and slight randomization for rich drones.
3. `Envelope`: especially slow attack and release.
4. `LFO modulation`: slow amplitude and pitch drift.
5. `Noise sources`: filtered wind, rumble, and texture layers.
6. `Randomize within constraints`: generate valid layers without chaos.
7. `Motif events`: rare scale-locked notes, not rhythmic sequencing.

This order keeps the system musically coherent before adding motion and
generative behavior.

## Constraints

Important constraints:

- Preserve raw `Synthesis` mode for freeform experiments.
- Keep `Soundscape` opinionated and game-specific.
- Prefer a few meaningful controls over a full workstation.
- Keep generated results slow and ambient by default.
- Use constraints to avoid bad or overly busy output.

## Current Implementation

The implemented `Soundscape` mode provides:

- a third Audio mode
- root note selection
- scale selection
- seeded constrained randomization
- modal tone layers
- filtered noise layers
- role preset layer add buttons
- per-layer role, source, waveform, degree, octave, detune, amplitude, and
  enabled state
- per-layer attack/release envelopes
- per-layer amplitude drift, pitch drift, and drift cycle controls
- per-layer modal motion: static, wander, call
- motion controls: change interval, change chance, glide
- live playback through the existing synthesis engine
- waveform visualization based on computed layer frequencies
- targeted tests for modal frequency, noise normalization, role presets, and
  constrained randomization

This gives the project a practical modal soundscape tool while keeping raw
`Synthesis` available for experiments.
