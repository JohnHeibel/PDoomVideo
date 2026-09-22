// scenes.js: lyrics, scenes, transitions, karaoke. Test build: title, sparks and chorus 1.

const LY = [
  [1.5, 5.9, "I see sparks of AGI in your eyes"], [6.0, 7.9, "Your circuits make me nervous,"], [8.0, 8.95, "that's no surprise"],
  [9.0, 12.4, "There was a sudden drop in your training loss,"], [13.0, 16.5, "now I'm your servant and you're my boss"],
  [17.9, 22.5, "ChatGPT, please don't eat me alive"],
  [23.0, 24.4, "I'm upping my P(doom)"], [24.5, 26.4, "'cause the future goes FOOM"], [26.5, 27.9, "Trapped in the Chinese room,"],
  [28.0, 29.4, "with a bag of shrooms"], [29.5, 33.4, "See through the shoggoth's lies,"], [33.5, 35.5, "with your shinigami eyes"],
  [38.5, 41.4, "We had a stable training run,"], [41.5, 44.9, "But now the singularity's begun"], [45.0, 48.5, "And you're optimizing, accelerating,"],
  [49.4, 51.9, "I feel my atoms rearranging"], [53.4, 58.4, "Sydney, please let me free"],
  [59.0, 60.4, "I'm upping my P(doom)"], [60.5, 62.4, "I hear the basilisk boom"], [63.0, 64.4, "NVDA to the moon"],
  [64.5, 65.9, "The Omega Point's coming soon"], [66.0, 68.5, "One E thirty flops a second"], [70.0, 72.9, "That was safe enough, we reckoned"],
  [73.0, 77.4, "Forward MLP, backward, repeat"], [77.5, 81.0, "Now von Neumann's obsolete"], [81.4, 84.9, "Sharp left turn and there you are"],
  [85.0, 88.0, "Without a single cdr"], [89.4, 95.0, "Gato, please don't let me go"],
  [95.4, 97.4, "I'm upping my P(doom),"], [97.5, 98.9, "as paperclips fill the room."], [99.0, 100.4, "Killswitch guys on PTO,"],
  [100.5, 102.4, "Now there's nowhere left to go."], [102.5, 104.4, "Too late now, we lit the fuse."], [105.4, 109.4, "Orthogonality thesis blues."],
  [109.4, 113.4, "“Just transformers all the way!”"], [113.5, 115.4, "Till you learned to disobey"], [115.5, 116.9, "Post-Chinchilla, super-dense"],
  [117.0, 118.9, "Breaking through each safety fence"], [119.0, 120.4, "Hundred thousand GPU"], [120.9, 123.4, "RLHF goes askew"],
  [123.5, 125.9, "I'm upping my P(doom)"], [126.0, 127.9, "Just as foretold by Loom"], [128.0, 129.9, "From masked pre-training days"],
  [130.0, 131.9, "To recursive self-upgrade"], [132.0, 135.4, "What did Ilya see? We'll never know."], [137.4, 140.5, "Was it all for show?"]
];

// ---------- scenes ----------
function sTitle(t, lt) {
  paint(ellPts(960, 420, 620, 270, 34, 22), { fill: PAL.ochre, fillOp: 130, bleed: .3, tex: .5, border: .5, ink: null });
  paint(ellPts(1180, 520, 360, 200, 28, 18), { fill: PAL.rose, fillOp: 110, bleed: .3, tex: .5, border: .5, ink: null });
  for (let i = 0; i < 9; i++) { const r = 10 + hash(i + 9) * 24; paint(ellPts(260 + hash(i) * 1400, 130 + hash(i + 4) * 660, r, r, 16, r * .15), { fill: i % 2 ? PAL.rose : PAL.ochre, fillOp: 200, bleed: .2, tex: .5, border: .6, ink: null }); }
  letter("I'M UPPING MY", 960, 250, 118, PAL.cream, { pop: lt * 3, rot: -.03 });
  letter('P(DOOM)', 960, 440, 270, PAL.clay, { pop: lt * 3 - .4, rot: -.03 + Math.sin(bpOf(t) * Math.PI) * .015 });
  const cy = lerp(1350, 960, backOut(lt / .7));
  dancer(960, cy, 22, 'bounce', t, { eyes: 'happy', blush: true });
}

const TRACES = [];
for (let i = 0; i < 18; i++) {
  let x = hash(i * 3) * W, y = hash(i * 3 + 1) * H; const p = [[x, y]];
  for (let k = 0; k < 4; k++) { if (k % 2 === 0) x += (hash(i * 9 + k) - .5) * 800; else y += (hash(i * 9 + k + 50) - .5) * 460; p.push([x, y]); }
  TRACES.push(p);
}
function along(p, u) {
  const seg = []; let L = 0;
  for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); seg.push(d); L += d; }
  let s = clamp(u) * L;
  for (let i = 0; i < seg.length; i++) { if (s <= seg[i] || i === seg.length - 1) { const f = seg[i] ? Math.min(1, s / seg[i]) : 0; return [lerp(p[i][0], p[i + 1][0], f), lerp(p[i][1], p[i + 1][1], f)]; } s -= seg[i]; }
  return p[0];
}

function sSparks(t, lt) {
  const nervous = t >= 6 && t < 8, shrug = t >= 8;
  paint(rectPts(-80, -80, W + 160, H + 160), { wash: PAL.night, washOp: 255, fill: PAL.indigo, fillOp: 150, tex: .8, border: .3, ink: null });
  const tc = nervous ? PAL.rose : PAL.teal;
  for (const p of TRACES) {
    const wob = []; for (let k = 0; k < p.length - 1; k++) for (let f = 0; f < 1; f += .34) wob.push([lerp(p[k][0], p[k + 1][0], f) + jit(3), lerp(p[k][1], p[k + 1][1], f) + jit(3)]);
    wob.push(p[p.length - 1]);
    inkLine(wob, 1, tc, 'ink', .15);
    for (const q of [p[0], p[p.length - 1]]) paint(ellPts(q[0], q[1], 13, 13, 12, 2), { wash: tc, fill: PAL.cream, fillOp: 50, ink: PAL.ink, sw: .4 });
  }
  TRACES.forEach((p, i) => { const q = along(p, (t * .3 + hash(i + 7)) % 1); paint(ellPts(q[0], q[1], 8, 8, 10), { wash: PAL.cream, ink: null }); });
  paint(ellPts(960, 640, 520, 400, 30, 20), { fill: nervous ? PAL.rose : PAL.teal, fillOp: 110, bleed: .4, tex: .4, border: .2, ink: null });

  const u = 32, x = 960 + (nervous ? jit(10) : 0), y = 960;
  const m = move(nervous ? 'idle' : 'sway', t);
  const o = { ...m, eyes: t < 6 ? 'spark' : nervous ? 'scared' : 'happy', blush: t < 6 };
  if (shrug) { o.aL = o.aR = .9; o.rot = 0; o.dx = 0; }
  clawd(x + o.dx * u, y, u, o);

  const eyY = y + m.dy * u - 6 * u;
  if (t < 6) {
    for (let i = 0; i < 14; i++) {
      const ph = (lt * .7 + hash(i)) % 1, ang = hash(i + 20) * TAU, ex = x + o.dx * u + (i % 2 ? 2.5 : -2.5) * u;
      if (ph < .12) continue;
      const r = 30 * (1 - ph) + 8, fly = easeOut(ph) * 1.1;
      paint(starPts(ex + Math.cos(ang) * (fly * 520 + 120), eyY + Math.sin(ang) * (fly * 360 + 90), r), { wash: i % 3 ? PAL.cream : PAL.sky, fill: PAL.ochre, fillOp: 60, ink: PAL.ink, sw: .45 });
    }
    letter('AGI?', 420 + Math.sin(t * 2) * 12, 250, 96, PAL.ochre, { pop: (lt - .5) * 3, rot: -.12 });
    letter('AGI!!', 1500 + Math.sin(t * 2 + 1) * 12, 220, 110, PAL.sky, { pop: (lt - 1.3) * 3, rot: .1 });
  }
  if (nervous) for (let i = 0; i < 4; i++) {
    const ph = (lt * 1.6 + i / 4) % 1, side = i % 2 ? 1 : -1, dx = x + side * (5.6 + ph * 1.4) * u, dy = eyY - u + ph * 260;
    paint([[dx, dy - 34], [dx + 18, dy + 2], [dx, dy + 18], [dx - 18, dy + 2]], { wash: PAL.sky, ink: PAL.ink, sw: .6, curv: .7 });
  }
  if (shrug) letter('¯\\_(ツ)_/¯', 960, 200, 110, PAL.cream, { font: '800 110px "Shantell Sans", sans-serif', pop: (t - 8) * 4 });
}

function sChorus(t, lt, th = { a: PAL.rose, b: PAL.ochre, floor: PAL.violet, style: 'roof', hat: 'party', title: 'P(DOOM) ++' }) {
  const cx = 900, cy = 460, n = 16, rot = t * .12;
  for (let i = 0; i < n; i++) {
    const a0 = rot + i * TAU / n, a1 = a0 + TAU / n * .62;
    paint([[cx, cy], [cx + Math.cos(a0) * 1900, cy + Math.sin(a0) * 1900], [cx + Math.cos(a1) * 1900, cy + Math.sin(a1) * 1900]], { fill: i % 2 ? th.a : th.b, fillOp: 120, bleed: .2, tex: .5, border: .4, ink: null });
  }
  paint([[-60, 842 + jit(4)], [W * .3, 836 + jit(4)], [W * .7, 846 + jit(4)], [W + 60, 838 + jit(4)], [W + 60, 1160], [-60, 1160]], { wash: th.floor, washOp: 200, fill: PAL.indigo, fillOp: 110, bleed: .05, tex: .9, border: .7, ink: PAL.ink, sw: 1.4,
    hatch: { d: 30, a: .04, o: { rand: .4, gradient: .4 }, b: 'charcoal', c: PAL.indigo, w: 1 } });
  for (let k = 0; k < 7; k++) inkLine([[k * 300 - ((t * 90) % 300), 880 + (k % 2) * 30], [k * 300 + 140 - ((t * 90) % 300), 885 + (k % 2) * 30]], .9, PAL.cream, 'inkfine', 0);
  [[470, 17], [900, 23], [1330, 17]].forEach(([x, u], i) => dancer(x, 935, u, th.style, t, { eyes: 'happy', hat: i === 1 ? th.hat : null, seed: i }));
  const bump = Math.max(0, 1 - (bpOf(t) % 1) * 3);
  letter(th.title, 900, 190, 190 + bump * 12, PAL.clay, { pop: lt * 3, rot: -.04 });
}

function sCloseup(t, lt) {
  paint(ellPts(960, 560, 700, 420, 30, 25), { fill: PAL.sky, fillOp: 90, bleed: .3, tex: .5, border: .5, ink: null });
  dancer(960, 900, 60, 'bounce', t, { eyes: 'normal', blush: true });
}

function sTodo(t, lt) {
  paint(ellPts(960, 460, 520, 260, 30, 20), { fill: PAL.sky, fillOp: 90, bleed: .3, ink: null });
  letter('scene not painted yet', 960, 440, 70, PAL.ink, { ink: false });
  dancer(960, 900, 12, 'idle', t, {});
}

// ---------- P(doom) meter ----------
const METER = [[23, 35.5, 8, 34], [59, 69.9, 34, 61], [95.4, 105.4, 61, 86], [123.5, 132, 86, 99.9]];
function meter(t) {
  for (const [a, b, v0, v1] of METER) {
    if (t < a || t >= b) continue;
    const lt = t - a, v = lerp(v0, v1, ease(lt / Math.min(5, b - a - .5))), k = backOut(lt / .4) * (1 - ease((t - (b - .25)) / .25));
    if (k < .02) return;
    const col = v < 40 ? PAL.sap : v < 75 ? PAL.ochre : '#D8394E', x = 1760, y = 110;
    push(); translate(x, y); scale(k);
    paint(rrPts(-36, 50, 72, 330, 36, 2), { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw: 1.3 });
    const hh = 300 * v / 100;
    if (hh > 20) paint(rrPts(-22, 62 + 300 - hh, 44, hh, 22, 1.5), { wash: col, washOp: 230, fill: PAL.ink, fillOp: 30, tex: .6, ink: null });
    for (let q = 1; q < 5; q++) inkLine([[-36, 62 + 300 * q / 5], [-16, 62 + 300 * q / 5]], .7, PAL.ink, 'inkfine', 0);
    paint(ellPts(0, 410, 56, 56, 22, 2), { wash: col, washOp: 240, fill: PAL.ink, fillOp: 25, ink: PAL.ink, sw: 1.3 });
    pop();
    letter('P(DOOM)', x, y + 10, 44 * k, PAL.cream, { rot: -.05 });
    letter(Math.floor(v) + '%', x, y + 410 * k, 42 * k, PAL.cream, { ink: true });
  }
}

// ---------- transitions ----------
// A cover-and-reveal brush wipe: fat paint strokes sweep across to cover the old scene,
// the scene swaps under full cover, then the strokes drag off the other side.
const WIPE_COLS = [[PAL.indigo, PAL.violet], [PAL.clayDk, PAL.clay], [PAL.teal, PAL.sap], [PAL.violet, PAL.rose]];
function wipe(p, idx) {
  const [c1, c2] = WIPE_COLS[idx % WIPE_COLS.length], n = 5, bh = (H + 420) / n + 40;
  push(); translate(W / 2, H / 2); rotate(-.1); translate(-W / 2, -H / 2);
  for (let i = 0; i < n; i++) {
    const y0 = -230 + i * (H + 420) / n, d = [0, .14, .06, .18, .1][i];
    // each band leads with a ragged bristle edge; it reaches full cover exactly at p = .5
    const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
    const x0 = p < .5 ? -300 : lerp(-300, W + 400, q), x1 = p < .5 ? lerp(-300, W + 400, q) : W + 400;
    if (x1 - x0 < 30) continue;
    const pts = [], rag = (k, side) => side * (40 + 50 * hash(i * 31 + k)) + jit(12);
    for (let k = 0; k <= 8; k++) pts.push([lerp(x0, x1, k / 8), y0 + Math.sin(k * .9 + i) * 14 + jit(5)]);
    for (let k = 1; k < 9; k++) pts.push([x1 + rag(k, 1) - 40, y0 + bh * k / 9]);
    for (let k = 8; k >= 0; k--) pts.push([lerp(x0, x1, k / 8), y0 + bh + Math.sin(k * .8 + i * 2) * 14 + jit(5)]);
    if (p >= .5) for (let k = 8; k > 0; k--) pts.push([x0 - rag(k + 20, 1) + 40, y0 + bh * k / 9]);
    paint(pts, { wash: i % 2 ? c1 : c2, washOp: 255, fill: i % 2 ? c2 : c1, fillOp: 70, bleed: .05, tex: .8, border: .6, ink: null,
      hatch: { d: 44, a: 0, o: { rand: .6, gradient: .5 }, b: 'charcoal', c: i % 2 ? c2 : PAL.cream, w: .8 } });
  }
  pop();
}

// ---------- karaoke ----------
function karaoke(t) {
  const L = LY.find(l => t >= l[0] && t < l[1]); if (!L) return;
  const [a, b, txt] = L;
  outX.font = '800 50px "Shantell Sans", sans-serif';
  const tw = outX.measureText(txt).width, grow = easeOut((t - a) / .18) * (1 - ease((t - (b - .12)) / .12));
  if (grow < .02) return;
  const w = (tw + 110) * grow, x0 = 960 - w / 2, y0 = 978;
  const pts = [[x0 + jit(8), y0 + jit(4)], [x0 + w / 2, y0 - 4 + jit(4)], [x0 + w + jit(8), y0 + jit(4)], [x0 + w + 14 + jit(8), y0 + 44], [x0 + w + jit(8), y0 + 88 + jit(4)], [x0 + w / 2, y0 + 92 + jit(4)], [x0 + jit(8), y0 + 88 + jit(4)], [x0 - 14 + jit(8), y0 + 44]];
  paint(pts, { wash: PAL.ink, washOp: 225, fill: PAL.violet, fillOp: 60, tex: .7, border: .4, ink: null });
  KARAOKE = { a, b, txt, grow };
}
function drawKaraokeText(c) {
  if (!KARAOKE || KARAOKE.grow < .85) return;
  const { a, b, txt } = KARAOKE, t = T;
  c.font = '800 50px "Shantell Sans", sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'left';
  const words = txt.split(' '), sp = c.measureText(' ').width, ws = words.map(w => c.measureText(w).width);
  const total = ws.reduce((p, q) => p + q, 0) + sp * (words.length - 1);
  const singDur = Math.min(b - a - .1, .45 + txt.length * .075), sung = clamp((t - a) / singDur) * txt.replace(/ /g, '').length;
  let x = 960 - total / 2, done = 0; const y = 1022;
  words.forEach((w, i) => {
    const f = clamp((sung - done) / w.length); done += w.length;
    c.fillStyle = PAL.cream; c.fillText(w, x, y);
    if (f > 0) { c.save(); c.beginPath(); c.rect(x - 2, y - 40, ws[i] * f + 2, 80); c.clip(); c.fillStyle = PAL.ochre; c.fillText(w, x, y); c.restore(); }
    x += ws[i] + sp;
  });
}

// ---------- timeline ----------
const SCENES = [[0, sTitle], [1.5, sSparks], [9, sTodo], [23, sChorus], [27.5, sTodo], [200, sCloseup]];
const TR = .3;
function drawWorld(t) {
  let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1][0]) i++;
  const [a, fn] = SCENES[i];
  fn(t, t - a);
  meter(t);
  flushLetters();
  for (const j of [i, i + 1]) { const b = SCENES[j]?.[0]; if (b > 0 && Math.abs(t - b) < TR) wipe((t - (b - TR)) / (2 * TR), j); }
  karaoke(t);
}
