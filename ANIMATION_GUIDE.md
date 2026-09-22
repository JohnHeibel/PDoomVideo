# Animation guide (read this before painting a chapter)

This project renders a 156.6 s music video, "I'm Upping My P(doom)", as painted watercolor animation with p5.brush. Frames are rendered offline in headless Chrome, so speed matters less than quality, within a budget. The shot list is in [STORYBOARD.md](STORYBOARD.md). The user's direction: **cute, cartoony, fun colors, lively animation, something happening in every shot, be brave and ambitious.** 

## How a chapter works

Each chapter is one file in `src/ch/`, wrapped in an IIFE so its helpers stay private:

```js
// src/ch/c03_takeoff.js
(() => {
  const gym = t => { ... };                       // private helpers: any names, no collisions
  function stable(t, lt, dur) { ... }             // a shot
  function singularity(t, lt, dur) { ... }
  chapter('takeoff', 38.5, 59.0, [[38.5, stable], [41.5, singularity], ...]);
  CAST.basilisk = (x, y, s, t, o = {}) => { ... }; // only for guests the finale reuses
})();
```

- `chapter(name, start, end, shots)` registers the chapter. A shot fn is called as `fn(t, lt, dur)` (song time, time since shot start, shot length) and must paint the **entire frame**, background included. Cuts land on each shot's start time.
- **Frames render in parallel and out of order.** Every shot must be a pure function of `t`: no state that carries between frames, and no `Math.random()`. Use `hash(i)` for stable per-object randomness and `jit(a)` for hand-drawn jitter. `jit` is reseeded 12×/s, which makes the linework "boil" like hand-drawn animation, and that's wanted.
- Only edit your own chapter file. If a shared helper is missing, write it privately inside your IIFE. If you find a real bug in a shared file, report it; don't edit it. Shared files: core.js, clawd.js, cast.js, props.js, timeline.js, lyrics.js, studio.html, render.mjs.

## Canvas and layout

- 1920×1080, y points down, origin at top-left. Everything is drawn in this space unless a camera is active.
- **The karaoke bar covers the bottom band (about y 975–1070) whenever a lyric is showing.** Keep faces and key action above about y 960.
- The paper texture is already under every frame, and a paper grain and vignette are multiplied over the top.
- The timeline adds these automatically: karaoke, brush-wipe chapter breaks at 1.5 / 38.5 / 73.0 / 109.4 s, and a small corner P(doom) meter during chorus windows (hidden whenever your shot draws `meterProp`).

## Painting API (core.js)

`paint(pts, o)` paints one shape from a point list `[[x, y], ...]`:

| option | meaning |
|---|---|
| `wash, washOp` | flat colour (0–255). Use it for character colours and anything that must read solidly. |
| `fill, fillOp, bleed, tex, border` | watercolour fill with bleeding edges and pigment texture. Use it for backgrounds, glows, shading and pools of light. `bleed` ~.05–.3, `tex` ~.3–.9, `border` ~.2–.8. |
| `hatch: { d, a, o, b, c, w }` | hatching lines (dist, angle, `{rand, gradient}`, brush e.g. `'charcoal'` or `'HB'`, colour, weight). Nice for dry-brush texture; use sparingly. |
| `ink, sw, br` | outline colour (default ink), weight (~.4–2), brush (`'ink'` default, `'inkfine'`). **`ink: null` means no outline.** |
| `curv` | smooth the outline through the points (0–1) instead of straight segments. |

Other helpers:
- **Geometry:** `rectPts(x, y, w, h, jitter)`, `ellPts(cx, cy, rx, ry, n, jitter, rot)`, `rrPts(x, y, w, h, r, jitter)` (rounded rectangle), `starPts(cx, cy, r, inner, n, rot)`, `heartPts(cx, cy, r)`.
- **Lines:** `inkLine(pts, sw, colour, brush = 'ink', curvature)` draws a stroke along a path. Brushes: `'ink'`, `'inkfine'`, `'dry'` (bristly), plus built-ins `'2B'`, `'HB'`, `'charcoal'`, `'marker'`, `'spray'`, `'rotring'`, `'cpencil'`, `'pen'`.
- **Transforms:** p5 `push()/pop()/translate()/rotate()/scale()` work with all brush calls.
- **Palette** `PAL`: `paper, ink, clay, clayDk, clayLt, night, indigo, rose, ochre, sap, teal, violet, cream, sky`. `mixCol(a, b, k)` mixes two hex colours. Any hex colour is fine; stay harmonious (soft, warm, watercolour). Avoid pure black and pure white: use `PAL.ink` / `PAL.night` and `PAL.cream`.
- **Timing:** `bpOf(t)` gives the beat position (88 BPM, beat = 0.682 s, bar = 2.73 s). Also:
  - `beatN(t)` integer beat number.
  - `pulse(t, k)` is 1 on each beat and decays; `pulse2` does the same on eighths. Use them for hits.
  - `seg(t, a, b)` is 0..1 progress through [a, b].
  - `kf(t, [[t0, v0], [t1, v1], ...], easeFn)` interpolates keyframes; values may be arrays.
  - Easings: `ease` (smoothstep), `easeOut`, `easeIn`, `backOut` (overshoot), `elasticOut`. Also `lerp`, `clamp`, `frac`, `wob(t, freq, phase)`, `hash(i)`, `TAU`.
- **Camera:** `camBegin(cx, cy, zoom, rot)` puts world point (cx, cy) at screen centre; `camEnd()` restores. Use it for pushes, pans, tilts, whips and zoom-outs. `shakeXY(t, amount)` gives [dx, dy] shake to add to cx/cy on hits. One level only; always pair it with `camEnd()`.
- **Lettering** (Permanent Marker, with an ink drop-shadow). Letters are placed through the active camera automatically, but not through your own `push/translate`, so give letter coordinates in world space.
  - `letter(txt, x, y, size, colour, { pop, rot, alpha, ink:false, stroke, font, align, screen:true })`. `pop` is 0..1 appear progress with overshoot.
  - `sfx(txt, x, y, size, colour, age, { life, rot })` is a comic sound effect that pops in, wobbles and fades out.
  - Letters are composited onto the painting at `flushLetters()`. That runs automatically after your shot, so anything painted later (wipes) covers them. Call `flushLetters()` yourself mid-shot if you need paint over a letter.
- **Full-frame effects** (screen space, outside the camera):
  - `flash(k, colour)` paints a full-frame wash at strength k.
  - `iris(cx, cy, r, colour)` paints everything outside a circle.
  - `irisShape(pts, colour)` paints everything outside any star-shaped outline (mouth-shaped reveals, hearts, keyholes).

## Characters

**Clawd**: `clawd(x, y, u, o)`. (x, y) is the ground point between its feet; `u` is the unit. The body is 10u wide × 6u tall, and 8u tall with legs.
- **Pose:** `dy` (body units, negative = up), `sq` (squash; negative stretches), `rot`, `flip`, `sx`/`sy`, `aL`/`aR` (arm angles: 0 = out sideways, positive = raised, negative = down), `walk` (phase), `noLegs`, `noShadow`.
- **Face:** `eyes`: normal, look (+ `lookX`/`lookY` −1..1), happy, closed, wink, narrow, angry, scared, spark (stars), red, heart, x, swirl, dot, shades. `mouth`: o, O, smile, grin, flat, wobble, cat. `blush`.
- **Colour:** `col`/`dk`/`lt` override the body colours (e.g. pale when scared, rosy when in love).
- **Hats:** party, hard, crown, halo, wizard, hood, top, fedora, band, sweatband, cat (ears + whiskers), masq (masquerade mask), mask, bowtie.
- **Lunchbox mouth:** `lid` 0..1 hinges the top of the body open with teeth.
- **Hooks:** `draw(u, sw)` draws accessories in body-local space (body spans x −5u..5u, y −8u..−2u). `armL(u, sw)` / `armR(u, sw)` are called at the arm tip in arm space (+x = outward along the arm), for holding props.
- **Emote:** `emote` + `emoteK` pops a reaction mark by the head: sweat, spark, heart, anger, music, swirl, zzz, !, ?, !?, !!.
- **Mood changes:** never snap between faces. Use `mood(t, [[t0, 'normal'], [t1, 'scared', 'sweat'], [t2, 'happy', 'heart']])`. It returns `{ eyes, squint, take, emote, emoteK }`; spread it into `clawd()` for a blink-squash-and-pop change.
- **Dancing:** `move(style, t, seed)` returns beat-synced pose offsets: bounce, hop, roof (arms up), sway, spin, wave, walk, run, idle, stomp, shimmy, mix. `dancer(x, y, u, style, t, extra)` = `clawd` + `move`.
- **Size guide:** tiny u≈6–10, normal u≈16–22, hero/close-up u≈30–60. In chorus and dance shots the lead Clawd should be big (roughly 40% of frame height).

**The Researcher**: `researcher(x, y, s, o)`, the singer. A small human: lab coat, round glasses, scribbly hair. About 13.2s tall; `s ≈ 0.75u` makes their head level with Clawd's eyes.
- **Pose:** `dy`, `sq`, `rot`, `flip`, `spin`, `aL`/`aR` (same convention as Clawd; about −1.25 hangs), `walk` or `run` (phase), `sit`, `back` (seen from behind).
- **Face:** `eyes`: dot, wide, star, swirl, closed, sad, x, heart, look. `brows`: worried, angry, up. `mouth`: smile, o, O, flat, wobble, grin. Also `hairUp` 0..1, `glassesTilt`, `bowtie`, `blush`, `squint` (from `mood`), `emote`/`emoteK`.
- **Hooks:** `draw(s, sw)` and `handL(s, sw)` / `handR(s, sw)` (called at the hand centre, for clipboards, mugs, trays and so on).
- `researcherDancer(x, y, s, style, t, extra)` makes them dance with `move()`.

Troupe Clawds are just more `clawd()` calls in hats. Guest monsters are drawn by whichever chapter introduces them, and exported on `CAST` for the finale.

## Props (props.js): the recurring theatre set

- `stageBack(t, o)` draws the backdrop (default: rotating watercolour sunburst in `o.a`/`o.b`; `o.backdrop(t)` replaces it) and the wooden floor from y 800. `o.spots = [[x, colour], ...]` adds spotlight cones.
- `stageFront(t, o)` draws the side curtains and valance (paint it last). `o.curtain` 0..1 closes them; `o.alarm` 0..1 adds a red siren wash.
- `meterProp(x, y, s, v, o)`: the P(doom) thermometer standing on the floor (s = 1 is about 560 px tall). Pass `v = pdoomAt(t)`. `o.cracked` 0..1, `o.glow`.
- `pumpProp(x, y, s, h, hoseTo)`: bicycle pump, handle height h (0..1). `pumpH(t)` drives h so the down-stroke lands on every beat.
- `sunburst(cx, cy, a, b, rot, n, r, op)`, `spotlight(x, colour)`.

## Style rules

- **Look:** hand-painted watercolour and ink, like a picture book. Characters get flat `wash` colour plus ink outlines (sw about 0.8–1.6 depending on size). Backgrounds are soft watercolour `fill` shapes, usually with no outline or a thin one. Glows and light are low-opacity fills. Texture comes from fills and occasional hatch, not from noise.
- **Colour:** each chapter has its palette in STORYBOARD.md. Keep it fun and saturated but soft. Contrast between character and background must be clear.
- **Motion:** everything moves: cameras drift or push, characters bounce on the beat (`pulse`, `move`), and hits land on beats. Use squash and stretch, anticipation and overshoot (`backOut`, `elasticOut`). Put the important action within a shot on beat times (beats fall at `0.21 + n × 0.682` s).
- **Readability:** one clear focal action per shot, with a big silhouette. Shots are short (1.4–4 s), so the gag must read instantly.
- **Performance:** aim for ≤ 2.5 s per frame and never more than about 4 s. The render log prints ms/frame. Cost comes from the number of `fill` shapes and strokes: hundreds are fine, thousands are not. Prefer fewer, bigger shapes.

## Checking your work

Run from the project root (the renderer uses the real GPU; several agents can render at once):

```
node render.mjs --sheet=38.6,39.3,40.1,40.9,41.6,42.3 --cols=3 --w=640 --out=out/check/c03_a.jpg
node render.mjs --stills=39.5,43.2 --out=out/check/c03_full
```

A sheet puts several times on one image (it prints ms per frame); open it with the Read tool and look carefully. Check:
- the first and last frames of every shot, and a few in between;
- that motion reads across consecutive times (e.g. every 0.1 s around a hit);
- transitions into and out of your chapter;
- that nothing important sits under the karaoke band.

Iterate until each shot looks good: charming, readable, lively, on-model. Fix whatever looks off: scale, contrast, clutter, stiffness.
