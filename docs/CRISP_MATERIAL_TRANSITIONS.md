# Crisp Material Transition Design

## Purpose

This note captures an experimental direction for improving zoom-detail material
transitions in the terrain renderer.

The current terrain style is not photorealistic. At zoomed-out and mid-zoom
levels, the top-down terrain map has a visible pixel-art character. At close
zoom, material detail maps add high-frequency texture. Smooth linear blending
between material details can feel muddy or "wishy-washy", especially when the
base terrain is already stylized and pixel-sharp.

The goal is to explore material transition methods that preserve a sharper,
more intentional visual style.

## Problem With Smooth Detail Blending

A standard material splat blend mixes material colors continuously:

```glsl
color = dirt * wDirt + grass * wGrass + rock * wRock;
```

This is simple and stable, but it can cause issues for this project:

- Material identity becomes unclear in transition zones.
- High-frequency detail maps smear into each other.
- Transitions can resemble older muddy terrain blending.
- The result can conflict with the pixel-art-like macro terrain style.

The base splat/albedo map can remain smooth or painterly. The concern is mostly
with the close-zoom detail material layer.

## Direction: Dithered Material Selection

Instead of blending all material detail colors continuously, use splat weights as
probabilities and choose one material per fragment, map pixel, or detail sample.

For two materials:

```glsl
float n = noise(mapCoord);
float useGrass = step(n, grassWeight);
vec3 material = mix(dirtColor, grassColor, useGrass);
```

If grass has a weight of `0.4`, roughly 40% of samples become grass and 60%
remain dirt. The transition is spatial and crisp rather than blurry.

For multiple materials, use cumulative normalized weights:

```glsl
float n = noise(mapCoord);

if (n < w0) {
  material = mat0;
} else if (n < w0 + w1) {
  material = mat1;
} else if (n < w0 + w1 + w2) {
  material = mat2;
} else {
  material = mat3;
}
```

This produces a stippled or dithered material boundary while preserving hard
material identity at each sample.

## Noise Source

The dither/noise source should be stable in map space. Screen-space noise would
shimmer while panning or zooming.

Candidate sources:

- Blue-noise texture tiled in map space.
- Small ordered Bayer matrix in map pixel space.
- Hash noise from integer map/detail coordinates.

Blue noise is likely the best visual default:

- Less clumpy than white noise.
- Less visibly grid-like than Bayer dithering.
- Good for stylized and pixel-art-adjacent transitions.

A small `64x64` or `128x128` blue-noise texture should be enough for a first
experiment.

Example map-space sampling:

```glsl
vec2 noiseUv = floor(mapPixelCoord) / 64.0;
float n = texture(uBlueNoise, noiseUv).r;
```

For close-zoom detail, the noise could also be sampled in detail texel space if
finer transition granularity is desired.

## Preserve Base Terrain Coherence

The base terrain color map should remain the macro source of coherence.

Recommended split:

- Base terrain splat/albedo remains as authored.
- Detail material is selected crisply with dithered material choice.
- Selected detail is mixed into the base color using the existing zoom fade.

This keeps large-scale terrain color stable while making close-zoom material
identity sharper.

## Dominant Plus Accent Selection

Pure weighted random selection can become noisy if every small nonzero material
weight contributes visible speckles.

A better mode may be dominant-plus-accent:

1. Find the dominant material.
2. Allow secondary materials mostly near transition zones.
3. Use noise to place secondary material patches.
4. Suppress extremely small weights unless they exceed a threshold.

This preserves readable regions while still avoiding muddy blends.

Example behavior:

- `80% dirt / 20% grass`: mostly dirt with sparse grass patches.
- `52% dirt / 48% grass`: strong transition pattern.
- `95% dirt / 5% grass`: almost pure dirt.

## Quantized Weights

Quantizing material weights can reinforce the stylized look.

Example:

```glsl
w = round(w * 7.0) / 7.0;
```

or:

```glsl
w = round(w * 15.0) / 15.0;
```

This creates stepped, intentional transitions and pairs well with dithered
selection. It can also emulate lower-precision material encoding before building
actual packed splat textures.

## Priority Dither Without Material Height Maps

Height-based blending often looks good, but it requires per-material height maps.
To avoid that extra data cost, approximate the effect with material priority
values.

Example idea:

```glsl
score = weight + materialPriority + noise * noiseStrength;
```

Then choose the material with the highest score.

This allows authored transition tendencies:

- Rock breaks through grass.
- Snow sits over rock.
- Dirt fills low-priority gaps.

Example priorities:

```text
rock +0.05
grass +0.00
dirt -0.02
snow +0.03
```

This is not physically correct, but it may produce more intentional-looking
transitions than pure probability.

## Candidate Detail Blend Modes

A useful experiment would expose three modes in the detail material system:

1. `Smooth`
   Current weighted material blending.

2. `Dithered`
   Select one material using blue-noise cumulative weights.

3. `Priority Dither`
   Select one material using weight, material priority, and noise.

The third mode may fit the project best because it keeps transitions sharp while
allowing art-directed material behavior.

## Parameters To Expose

Potential controls for dev tuning:

- Detail blend mode: `smooth`, `dithered`, `priorityDither`.
- Dither strength.
- Transition noise scale.
- Weight quantization steps.
- Per-material priority.
- Minimum visible material weight threshold.

These should initially live in the existing zoom-detail material panel rather
than becoming a separate system.

## Packed Splat Texture Note

Packing two material weights into one 8-bit channel is possible only with up to
16 levels per material:

```text
16 * 16 = 256 combinations
```

A natural encoding is:

```text
packed = a + b * 16

a = packed % 16
b = floor(packed / 16)
```

This can represent eight material weights in a single RGBA texture if each
material uses `0..15` precision. It should be tested visually before committing,
because 16 levels may cause banding in smooth transitions.

An alternative is to use two RGBA splat textures for eight materials at full
8-bit precision. This costs another texture lookup but preserves blend quality
and simplifies authoring.

## Recommended First Experiment

Implement the visual test before changing asset formats:

1. Add shader-side weight quantization for current four-material detail splat.
2. Add dithered material selection using map-space blue noise or hash noise.
3. Compare `smooth`, `dithered`, and `priorityDither` modes.
4. If dithered transitions look good, evaluate packed 4-bit material weights.
5. If banding/noise is too visible, prefer a second splat texture over packed
   precision loss.

This keeps the experiment cheap and reversible while directly testing the visual
question.
