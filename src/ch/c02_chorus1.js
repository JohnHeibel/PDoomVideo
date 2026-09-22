// c02_chorus1: Chorus 1, "The P(doom) Show" (23.0–38.5). Rose and ochre sunburst.
// Shots: mouth-iris reveal + pogo pump · FOOM rocket + tilt up · Chinese room · shrooms · shoggoth · shinigami · dance break.
// Perf note: watercolour `fill` cost grows with vertex count, so big/many-vertex shapes here use `wash` and fills stay low-poly.
(() => {
  const B = n => OFF + n * BEAT;                       // time of beat n (beat 34 = 23.398 … beat 56 = 38.402)
  const RED = '#E0283F', MAROON = '#4A1F2A', DARKRED = '#1E0A12';
  const SH_BODY = '#4FA79B', OLIVE = '#93A04C', OLIVE_DK = '#6E7A36', MASKC = '#F7D35A';
  const qbez = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
  const boilN = t => Math.floor(t * BOIL);

  // ======================================================================================
  // shared little props
  // ======================================================================================

  // Cheap Clawd for small background dancers: same silhouette/face/hats, flat washes instead of watercolour fills.
  function miniClawd(x, y, u, o = {}) {
    const dy = (o.dy || 0) * u, sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 15, .45, 2.4), J = u * .07;
    const col = o.col || PAL.clay, dk = o.dk || PAL.clayDk;
    if (!o.noShadow) paint(ellPts(x, y + u * .15, u * 5.4, u * .95, 10), { wash: PAL.ink, washOp: 55, ink: null });
    push(); translate(x, y + dy); if (o.rot) rotate(o.rot);
    scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));
    [-4, -2, 1, 3].forEach(lx => paint(rectPts(lx * u, -2.4 * u, u, 2.2 * u, J * .6), { wash: dk, ink: PAL.ink, sw: sw * .8 }));
    for (const side of [-1, 1]) {
      const a = side < 0 ? (o.aL ?? .2) : (o.aR ?? .2);
      push(); translate(side * 4.9 * u, -4.5 * u); rotate(side < 0 ? a : -a);
      paint(rectPts(side < 0 ? -2.2 * u : 0, -.5 * u, 2.2 * u, u, J * .6), { wash: col, ink: PAL.ink, sw: sw * .8 }); pop();
    }
    const body = rectPts(-5 * u, -8 * u, 10 * u, 6 * u, J);
    paint(body, { wash: col, ink: null });
    paint(rectPts(-4.8 * u, -3.7 * u, 9.6 * u, 1.5 * u, J), { wash: dk, washOp: 120, ink: null });
    paint(ellPts(-1.6 * u, -6.5 * u, 3 * u, 1.1 * u, 10), { wash: '#F5B394', washOp: 120, ink: null });
    paint(body, { ink: PAL.ink, sw });
    if (o.blush) for (const bx of [-3.6, 3.6]) paint(ellPts(bx * u, -4.6 * u, u * .8, u * .4, 8), { wash: PAL.rose, washOp: 150, ink: null });
    eyes(u, o, sw); mouth(u, o.mouth, sw); hat(u, o.hat, sw);
    pop();
  }

  // superellipse "lunchbox mouth" outline
  function mouthPts(cx, cy, hw, hh, n = 44) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, c = Math.cos(a), s = Math.sin(a);
      p.push([cx + hw * Math.sign(c) * Math.pow(Math.abs(c), .32), cy + hh * Math.sign(s) * Math.pow(Math.abs(s), .32)]);
    }
    return p;
  }
  const edgeY = (hw, hh, dx) => { const f = clamp(Math.abs(dx) / hw, 0, .999), c = Math.pow(f, 1 / .32), s = Math.sqrt(1 - c * c); return hh * Math.pow(s, .32); };

  // Opening from inside Clawd's mouth: black frame, a teeth-edged hole hinging open (screen space).
  function mouthReveal(t) {
    const k = seg(t, 23.0, 23.5);
    if (k >= 1) return;
    const e = ease(k), hh = lerp(0, 1300, Math.pow(e, .9)), hw = lerp(860, 1900, e), cx = 960 + e * 60, cy = 560 - hh * .25;
    if (hh < 4) { flash(1, PAL.ink); return; }
    irisShape(mouthPts(cx, cy, hw, hh), MAROON);
    irisShape(mouthPts(cx, cy, hw + 90, hh + 70), PAL.ink);
    // teeth: 7 hang from the top jaw, 6 stand on the bottom jaw, interlocking while nearly shut
    const n = 7, sp = hw * 1.7 / n, tw = 205 * (1 + .35 * e), th = tw * .78;
    const tooth = (xm, ybase, dir) => {
      const y0 = ybase - dir * 26;
      paint([[xm - tw / 2 + 4, y0], [xm + tw / 2 - 4, y0], [xm + tw * .13, ybase + dir * th], [xm - tw * .13, ybase + dir * th]], { wash: PAL.cream, ink: PAL.ink, sw: 1.3, curv: .25 });
      inkLine([[xm - tw * .3, y0 + dir * 30], [xm - tw * .12, ybase + dir * th * .7]], .5, '#CDBB98', 'inkfine', 0);
    };
    for (let i = 0; i < n; i++) { const xm = cx - hw * .85 + (i + .5) * sp; tooth(xm, cy - edgeY(hw, hh, xm - cx), 1); }
    for (let i = 0; i < n - 1; i++) { const xm = cx - hw * .85 + (i + 1) * sp; tooth(xm, cy + edgeY(hw, hh, xm - cx), -1); }
  }

  // Firework rocket, base of the body at (0,0) in the current transform (≈150 wide, 480 tall).
  function rocketBody(flame = 0) {
    const sw = 1.3;
    if (flame > .01) {
      const L = flame;
      paint([[-58, -6], [58, -6], [34 + jit(10), 110 * L], [0, 260 * L + jit(26)], [-34 + jit(10), 110 * L]], { wash: PAL.ochre, fill: RED, fillOp: 110, bleed: .2, tex: .4, ink: PAL.ink, sw: .9, curv: .6 });
      paint([[-30, -6], [30, -6], [0, 150 * L + jit(16)]], { wash: PAL.cream, ink: null, curv: .6 });
    }
    for (const s of [-1, 1]) paint([[s * 70, -170], [s * 150, -30], [s * 150, 36], [s * 70, -20]], { wash: PAL.teal, fill: PAL.indigo, fillOp: 60, tex: .5, ink: PAL.ink, sw });
    paint(rectPts(-76, -345, 152, 345, 2), { wash: '#D8394E', fill: '#8E1F33', fillOp: 70, tex: .6, border: .5, ink: null });
    for (const by of [-300, -205, -110]) paint([[-76, by + 34], [76, by - 10], [76, by + 26], [-76, by + 70]], { wash: PAL.cream, ink: null });
    inkLine([[-50, -325], [-50, -30]], 1.4, '#F7A8AE', 'inkfine', 0);
    paint(rrPts(-76, -345, 152, 345, 20), { ink: PAL.ink, sw });
    paint([[-84, -340], [84, -340], [36, -440], [0, -482], [-36, -440]], { wash: PAL.ochre, fill: '#C97B1E', fillOp: 70, tex: .5, ink: PAL.ink, sw, curv: .35 });
    paint(ellPts(0, -470, 14, 14, 10), { wash: RED, ink: PAL.ink, sw: .6 });
    paint(rectPts(-46, -14, 92, 26, 2), { wash: '#556070', ink: PAL.ink, sw: sw * .8 });
  }
  // a belt strapping Clawd onto the rocket (clawd draw hook, body-local)
  const strap = (u, sw) => {
    paint(rectPts(-5.5 * u, -3.7 * u, 11 * u, .9 * u, u * .05), { wash: '#5B3A29', ink: PAL.ink, sw: sw * .6 });
    paint(rectPts(-.6 * u, -3.9 * u, 1.2 * u, 1.3 * u), { wash: PAL.ochre, ink: PAL.ink, sw: sw * .5 });
  };

  // puffy cloud: scalloped top, flat bottom (washes only)
  function cloud(cx, cy, w, sw = .8) {
    const p = [];
    for (let i = 0; i <= 14; i++) { const q = i / 14, a = Math.PI + q * Math.PI, b = 1 + .2 * Math.abs(Math.sin(q * Math.PI * 3.5 + cx * .013)); p.push([cx + Math.cos(a) * w * .5 * b, cy + Math.sin(a) * w * .3 * b]); }
    p.push([cx + w * .5, cy + w * .05], [cx - w * .5, cy + w * .05]);
    paint(p, { wash: '#FFF7EC', washOp: 245, ink: PAL.ink, sw, curv: .6 });
    paint(ellPts(cx + w * .05, cy + w * .01, w * .38, w * .05, 10), { wash: '#F0B9AE', washOp: 140, ink: null });
  }

  // a paper slip; glyph = a little squiggle glyph (only a couple of hero slips get one)
  function slip(x, y, s, rot, glyph) {
    push(); translate(x, y); rotate(rot); scale(s);
    paint(rectPts(-34, -22, 68, 44, 1.5), { wash: '#FFFBF0', ink: PAL.ink, sw: .7 });
    if (glyph) {
      inkLine([[-16, -8], [-3, -12], [-8, 3], [5, -1], [14, 11]], 1, PAL.ink, 'inkfine', .5);
      inkLine([[-3, -14], [0, 14]], 1, PAL.ink, 'inkfine', 0);
    }
    pop();
  }

  // cute mushroom, ground point (x, y); s = 1 → cap ≈ 124 px wide
  function mushroom(x, y, s, cap, sq = 0, rot = 0, face = true) {
    push(); translate(x, y); rotate(rot); scale(s * (1 + sq * .6), s * (1 - sq));
    paint(rrPts(-24, -70, 48, 70, 14), { wash: PAL.cream, ink: PAL.ink, sw: .9 });
    paint(rectPts(-22, -24, 44, 20), { wash: '#E6D2B0', washOp: 150, ink: null });
    if (face) {
      for (const ex of [-9, 9]) paint(ellPts(ex, -42, 3.5, 5, 8), { wash: PAL.ink, ink: null });
      inkLine([[-7, -31], [0, -26], [7, -31]], .7, PAL.ink, 'ink', .6);
      for (const ex of [-15, 15]) paint(ellPts(ex, -33, 4, 2.4, 8), { wash: PAL.rose, washOp: 170, ink: null });
    }
    const c = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; c.push([Math.cos(a) * 62, -62 + Math.sin(a) * 52]); }
    c.push([56, -56], [-56, -56]);
    paint(c, { wash: cap, ink: PAL.ink, sw: 1, curv: .4 });
    paint([[-54, -64], [54, -64], [40, -76], [-40, -76]], { wash: PAL.ink, washOp: 45, ink: null });
    for (const [dx, dy, r] of [[-30, -86, 10], [6, -102, 8], [32, -80, 9]]) paint(ellPts(dx, dy, r, r * .8, 10), { wash: PAL.cream, ink: null });
    pop();
  }

  // the smiley mask (disc of radius r)
  function smiley(x, y, r, rot = 0, o = {}) {
    push(); translate(x, y); rotate(rot);
    const sw = clamp(r / 55, .6, 2.4);
    paint(ellPts(0, 0, r, r * .97, 26), { wash: MASKC, ink: null });
    paint(ellPts(r * .08, r * .12, r * .86, r * .8, 12), { fill: PAL.ochre, fillOp: 80, bleed: .08, tex: .6, border: .7, ink: null });
    paint(ellPts(0, 0, r, r * .97, 26), { ink: PAL.ink, sw });
    for (const s of [-1, 1]) paint(ellPts(s * r * .56, r * .2, r * .17, r * .1, 10), { wash: PAL.rose, washOp: 170, ink: null });
    const ek = o.eyesK ?? 1, mk = o.mouthK ?? 1;
    if (ek > .02) for (const s of [-1, 1]) paint(ellPts(s * r * .32, -r * .22, r * .1 * ek, r * .2 * ek, 12), { wash: PAL.ink, ink: null });
    if (mk > .02) inkLine([[-r * .5 * mk, r * .1], [-r * .28 * mk, r * .42], [0, r * .53], [r * .28 * mk, r * .42], [r * .5 * mk, r * .1]], sw * 1.5, PAL.ink, 'ink', .6);
    pop();
  }

  // ======================================================================================
  // CAST.shoggoth: a friendly-ish teal/violet/olive blob with many eyes and tentacles.
  // (x, y) ground point, s on Clawd's u scale (≈12.6s wide, ≈11s tall, so a bit taller than Clawd). t drives the beat bounce.
  // o: mask 0..1 (1 = smiley mask on, between = slipping, 0 = off), bow 0..1, eyes 0..1 (defaults to 1 - mask),
  //    look -1..1 / lookY (pupils), wave 0..1 (right tentacle waves hello), tilt (head tilt), flip, startle 0..1.
  // ======================================================================================
  const SH_EYES = [[-3.3, -8.6, .95], [-.2, -9.7, 1.0], [2.9, -8.9, .85], [4.8, -6.6, .75], [-5.0, -6.2, .7], [-1.9, -7.2, 1.15], [1.4, -6.6, 1.45],
    [3.4, -4.4, .8], [-3.8, -3.9, .85], [-.5, -4.6, .7], [4.8, -2.9, .5], [-4.7, -2.4, .55], [1.9, -2.6, .6]];
  function tentacle(bx, by, ang, len, w, curl, col, sw, suckers = 0, n = 8) {
    const L = [], R = [], C = [];
    let x = bx, y = by, a = ang;
    for (let k = 0; k <= n; k++) {
      const q = k / n, ww = w * (1 - q * .82);
      C.push([x, y, a, ww]);
      L.push([x + Math.cos(a - Math.PI / 2) * ww, y + Math.sin(a - Math.PI / 2) * ww]);
      R.push([x + Math.cos(a + Math.PI / 2) * ww, y + Math.sin(a + Math.PI / 2) * ww]);
      if (k < n) { x += Math.cos(a) * len / n; y += Math.sin(a) * len / n; a += curl * (.3 + q * 1.6) / n; }
    }
    paint(L.concat([[x + Math.cos(a) * w * .15, y + Math.sin(a) * w * .15]], R.reverse()), { wash: col, washOp: 255, ink: PAL.ink, sw, curv: .45 });
    for (let k = 1; k <= suckers; k++) { const [px, py, pa, ww] = C[k + 1]; paint(ellPts(px + Math.cos(pa + Math.PI / 2) * ww * .45, py + Math.sin(pa + Math.PI / 2) * ww * .45, ww * .3, ww * .3, 8), { wash: '#E7D9A8', ink: null }); }
  }
  function shoggoth(x, y, s, t, o = {}) {
    const bp = bpOf(t), hit = pulse(t, 5), ab = Math.abs(Math.sin(bp * Math.PI)), wig = Math.sin(bp * Math.PI);
    const mask = clamp(o.mask ?? 1), bow = clamp(o.bow || 0), st = clamp(o.startle || 0);
    const eyesK = clamp(o.eyes ?? (1 - mask) * 1.4), sw = clamp(s / 16, .55, 2.4), fl = o.flip ? -1 : 1;
    paint(ellPts(x, y + s * .15, s * 7.2, s * 1.1, 12), { wash: PAL.ink, washOp: 60, ink: null });
    push(); translate(x, y); scale(fl, 1);
    rotate(bow * .16 + (o.tilt || 0) * .25);
    scale(1 + hit * .05 + bow * .06 - st * .08, 1 - hit * .05 - bow * .2 + st * .14);
    translate(0, -ab * .3 * s);
    // back tentacles (behind the body)
    tentacle(-3.2 * s, -9 * s, -2.0, 4.2 * s, .75 * s, 1.8 * wig, OLIVE_DK, sw * .8);
    tentacle(3.6 * s, -8.6 * s, -1.1, 4.6 * s, .8 * s, -1.9 * wig, OLIVE_DK, sw * .8);
    // side arms (the right one can wave hello)
    tentacle(-5.6 * s, -4.8 * s, Math.PI + .5 - bow * .4, 5 * s, .9 * s, 2.2 * wig + .6, OLIVE, sw * .85, 3);
    const wv = clamp(o.wave || 0);
    tentacle(5.6 * s, -4.8 * s, lerp(-.4 + bow * .4, -1.3, wv), 5.2 * s, .9 * s, lerp(-2.2 * wig - .6, -1.4 + Math.sin(t * 14) * 1.5, wv), OLIVE, sw * .85, 3);
    // body
    const body = [];
    for (let i = 0; i < 36; i++) {
      const a = i / 36 * TAU, r = 1 + .06 * Math.sin(a * 3 + t * 2.1) + .045 * Math.sin(a * 5 - t * 3.3);
      let px = Math.cos(a) * 6.3 * s * r, py = -5.3 * s + Math.sin(a) * 5.4 * s * r;
      if (py > -.3 * s) py = -.3 * s + (py + .3 * s) * .12;
      body.push([px, py]);
    }
    paint(body, { wash: SH_BODY, washOp: 255, ink: null });
    paint(ellPts(-1.2 * s, -8.2 * s, 3.8 * s, 1.8 * s, 10), { fill: '#A5DDCD', fillOp: 130, bleed: .2, tex: .8, border: .8, ink: null });
    paint(ellPts(.8 * s, -1.9 * s, 5.6 * s, 1.9 * s, 10), { fill: PAL.violet, fillOp: 120, bleed: .15, tex: .7, border: .6, ink: null });
    paint(body, { ink: PAL.ink, sw });
    // eyes: shut lids while masked, popping open in a ripple when revealed
    const lx = (o.look ?? Math.sin(t * 1.3)) * .3 * s;
    SH_EYES.forEach(([ex, ey, er], i) => {
      const k = clamp(eyesK * 1.8 - i * .06), X = ex * s, Y = ey * s, R = er * s * .62 * (1 + st * .25);
      const lid = () => inkLine([[X - R, Y], [X, Y + R * .35], [X + R, Y]], sw * .7, PAL.ink, 'ink', .5);
      if (k < .1 || ((t * .7 + hash(i) * 5) % 4.1) < .1) return lid();
      const ry = R * backOut(k);
      paint(ellPts(X, Y, R, ry, 14), { wash: PAL.cream, ink: PAL.ink, sw: sw * .6 });
      paint(ellPts(X + lx * er * .9, Y + (o.lookY || 0) * R * .3, R * .45, Math.min(ry, R) * .5, 10), { wash: i % 4 === 1 ? PAL.violet : PAL.ink, ink: null });
      if (er > .9) paint(ellPts(X + lx * er * .9 + R * .15, Y - R * .18, R * .12, R * .12, 8), { wash: PAL.cream, ink: null });
    });
    // its own nervous grin, once the mask is gone
    if (mask < .6) {
      const mk = seg(.6 - mask, 0, .4), my = -3.3 * s;
      const mp = [[-2.2 * s, my], [-1.1 * s, my + .35 * s * mk + Math.sin(t * 9) * .1 * s], [0, my + .1 * s], [1.1 * s, my + .35 * s * mk - Math.sin(t * 9) * .1 * s], [2.2 * s, my]];
      inkLine(mp, sw * 1.1, PAL.ink, 'ink', .4);
      for (const tx of [-1.1, 1.1]) paint([[tx * s - .25 * s, my + .22 * s * mk], [tx * s + .25 * s, my + .22 * s * mk], [tx * s, my + .7 * s * mk]], { wash: PAL.cream, ink: PAL.ink, sw: sw * .4 });
    }
    // front floor tentacles
    tentacle(-3.8 * s, -.5 * s, Math.PI - .2, 3.4 * s, .75 * s, -2.4 + wig * 1.2, OLIVE, sw * .8, 2);
    tentacle(3.8 * s, -.5 * s, .2, 3.4 * s, .75 * s, 2.4 + wig * 1.2, OLIVE, sw * .8, 2);
    tentacle(-1.4 * s, -.4 * s, 1.9, 1.6 * s, .6 * s, -3 - wig, OLIVE, sw * .7);
    tentacle(1.6 * s, -.4 * s, 1.25, 1.6 * s, .6 * s, 3 - wig, OLIVE, sw * .7);
    // mask with strap; slipping = slides down and tilts
    if (mask > .04) {
      const sl = 1 - mask, mx = sl * 1.6 * s, my = -6.9 * s + sl * 2.3 * s, mr = (o.tilt || 0) * .3 + sl * .75;
      inkLine([[-5.9 * s, -7.4 * s], [mx - 2.4 * s, my - .8 * s + sl * .6 * s]], sw * .7, PAL.ink, 'ink', .3);
      inkLine([[5.9 * s, -7.4 * s], [mx + 2.5 * s, my - .5 * s - sl * .8 * s]], sw * .7, PAL.ink, 'ink', .3);
      smiley(mx, my, 2.75 * s, mr);
    }
    pop();
  }
  CAST.shoggoth = shoggoth;

  // ======================================================================================
  // 1 · 23.0–24.5  "I'm upping my P(doom)": out of the mouth onto the stage, Clawd pogo-pumps the meter
  // ======================================================================================
  function upping(t, lt) {
    const bp = bpOf(t), f = frac(bp), h = pumpH(t), hit = pulse(t, 7), open = ease(seg(t, 23.0, 24.4));
    const [sx, sy] = shakeXY(t, 5 * hit);
    camBegin(lerp(1060, 945, open) + sx, lerp(600, 575, open) + sy, lerp(1.26, 1.1, open) + .015 * hit, lerp(-.03, 0, open));
    stageBack(t, { a: PAL.rose, b: PAL.ochre, spots: [[1200, PAL.cream]] });
    const PX = 1190, PY = 935, PS = 1.3, MX = 1470, MY = 930, MS = 1.02, bulb = [MX - 58, MY - 92 * MS];
    meterProp(MX, MY, MS, pdoomAt(t), { glow: .9 * pulse(t, 4) });
    pumpProp(PX, PY, PS, h, bulb);
    // a bulge of air rides the hose to the meter after every slam
    const a = [PX + 30 * PS, PY - 20 * PS], m = [lerp(PX, bulb[0], .5), PY + 30 * PS], c = [2 * m[0] - (a[0] + bulb[0]) / 2, 2 * m[1] - (a[1] + bulb[1]) / 2];
    const hu = seg(f, 0, .5);
    if (hu > 0 && hu < 1) { const q = qbez(a, c, bulb, hu); paint(ellPts(q[0], q[1], 17, 15, 12), { wash: PAL.ink, ink: null }); paint(ellPts(q[0] - 4, q[1] - 5, 5, 4, 8), { wash: PAL.cream, washOp: 180, ink: null }); }
    // chorus line in sync; the Researcher, half a beat late and lost
    [[340, 0], [720, 1], [890, 2]].forEach(([x, i]) => {
      const m = move('hop', t);
      miniClawd(x, 950, 16, { ...m, rot: (beatN(t) % 2 ? 1 : -1) * .1, eyes: 'happy', mouth: 'smile', hat: 'party', seed: i });
    });
    const rm = move('hop', t - BEAT * .5);
    researcher(530, 955, 15, { ...rm, walk: undefined, aL: rm.aL + .4, aR: rm.aR - .6, eyes: 'wide', lookX: Math.sin(bp * Math.PI), brows: 'worried', mouth: 'wobble', hairUp: .4, emote: '?', emoteK: seg(t, 23.55, 23.8) });
    // Clawd rides the pump handle like a pogo stick: up with the handle, a little leap, slam on the beat
    const top = PY - (270 + 150 * h) * PS, hop = Math.sin(seg(f, .45, .9) * Math.PI) * 1.4, falling = f > .8;
    clawd(PX, top, 21, {
      dy: -hop, sq: .3 * pulse(t, 10) - (falling ? .14 : 0) - (f > .45 && f < .8 ? .06 : 0), noShadow: true,
      aL: falling ? -.5 : 1.15 + .25 * Math.sin(f * TAU), aR: falling ? -.5 : 1.15 - .25 * Math.sin(f * TAU),
      eyes: 'happy', mouth: hit > .4 ? 'grin' : 'smile', blush: true
    });
    // puffs from the pump foot on the slam
    if (f < .3) for (const s of [-1, 1]) { const k = f / .3; paint(ellPts(PX + s * (100 + 60 * k), PY - 10 - 20 * k, 24 * (1 - k * .5), 17 * (1 - k * .5), 10), { wash: PAL.cream, washOp: 230 * (1 - k), ink: PAL.ink, sw: .6 }); }
    stageFront(t, {});
    camEnd();
    flushLetters();                    // meter lettering belongs to the stage, under the mouth
    mouthReveal(t);
  }

  // ======================================================================================
  // 2 · 24.5–26.5  "'cause the future goes FOOM": strap on, light the fuse, FOOM, tilt up after it
  // ======================================================================================
  const T_IGN = B(37), ROOM_Y = -3300, RX = 900;
  const rocketY = t => 905 - 3620 * Math.pow(seg(t, T_IGN, 26.5), 1.8);
  const foomCamY = t => { const p = seg(t, T_IGN + .08, 26.5); return lerp(620, ROOM_Y + 380, p * p); };
  const SKY = [[-560, '#F6D7A6'], [-1300, '#F4BFA8'], [-2100, '#EFA8B2'], [-2900, '#E7A9BE'], [-3700, '#DDB0CC']];
  const CLOUDS = [[380, -900, 340], [1560, -1250, 400], [720, -1750, 300], [1380, -2250, 340], [300, -2650, 300], [1680, -2850, 280], [520, -3500, 320], [1480, -3650, 300], [960, -4000, 420]];
  function skyWorld(y0, y1) {
    for (let i = 0; i < SKY.length; i++) {
      const top = i + 1 < SKY.length ? SKY[i + 1][0] : -6000, bot = SKY[i][0] + 120;
      if (bot < y0 || top > y1) continue;
      paint(rectPts(-300, top - 140, W + 600, bot - top + 140), { wash: SKY[i][1], washOp: 255, fill: i < SKY.length - 1 ? SKY[i + 1][1] : SKY[i][1], fillOp: 90, bleed: .25, tex: .5, border: .2, ink: null });
    }
    for (const [cx, cy, w] of CLOUDS) if (cy + 200 > y0 && cy - 200 < y1) cloud(cx, cy, w);
  }
  function burst(cx, cy, r, n, col, rot) { paint(starPts(cx, cy, r, .62, n, rot).map(([x, y], i) => [x + jit(r * .03), y + jit(r * .03)]), { wash: col, ink: PAL.ink, sw: 1.3 }); }
  function foom(t, lt) {
    const ign = t >= T_IGN, age = t - T_IGN, cy = foomCamY(t), ry = rocketY(t);
    const pre = ease(seg(t, 24.5, T_IGN));
    const shake = ign ? 26 * Math.exp(-age * 4.5) : 6 * seg(t, 25.1, T_IGN);
    const [sx, sy] = shakeXY(t, shake);
    const zoom = ign ? lerp(1.2, 1.0, easeOut(seg(age, 0, .3))) : lerp(1.08, 1.2, pre);
    const ccx = ign ? RX + 40 : lerp(880, RX + 30, pre), ccy = ign ? cy : lerp(620, 640, pre);
    camBegin(ccx + sx, ccy + sy, zoom, 0);
    const y0 = ccy - 700, y1 = ccy + 700;
    // --- the stage (only while in view), with the meter and the abandoned pump
    if (y1 > -60) {
      stageBack(t, { a: PAL.rose, b: PAL.ochre });
      meterProp(1500, 930, 1.02, pdoomAt(t), { glow: ign ? Math.exp(-age * 3) : 0 });
      pumpProp(1250, 935, 1.3, .15, [1442, 836]);
    }
    // --- above the stage: fly loft, roof, sky
    if (y0 < -40) {
      if (y1 > -900) {
        paint(rectPts(-300, -560, W + 600, 540), { wash: '#3A2438', fill: PAL.violet, fillOp: 60, tex: .6, border: .3, ink: null });
        for (let i = 0; i < 9; i++) inkLine([[120 + i * 210, -560], [120 + i * 210 + jit(4), -40]], .7, '#8A6A5A', 'inkfine', 0);
        for (const [bx, by] of [[330, -210], [1540, -300], [760, -380]]) paint(rrPts(bx - 28, by, 56, 70, 18), { wash: '#8C6B4A', ink: PAL.ink, sw: .7 });
      }
      skyWorld(Math.min(y0, -560), Math.min(y1, -560));
      if (y1 > -760 && y0 < -540) {
        // roof band; a jagged hole once the rocket has burst through, planks flying
        paint(rectPts(-300, -640, W + 600, 90, 3), { wash: '#6B2A33', fill: CURTAIN_DK, fillOp: 90, tex: .7, ink: PAL.ink, sw: 1.2 });
        if (ry < -560) {
          const hp = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = (i % 2 ? 95 : 150) + hash(i) * 30; hp.push([RX + Math.cos(a) * r, -595 + Math.sin(a) * r * .55]); }
          paint(hp, { wash: SKY[0][1], ink: PAL.ink, sw: 1 });
        }
      }
      const tb = (905 + 560) / 3620, tRoof = T_IGN + Math.pow(tb, 1 / 1.8) * (26.5 - T_IGN), pa = t - tRoof;
      if (pa > 0 && pa < 1) for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (hash(i + 7) - .5) * 2.2, v = 700 + 500 * hash(i + 8);
        push(); translate(RX + Math.cos(a) * v * pa, -600 + Math.sin(a) * v * pa + 900 * pa * pa); rotate(pa * 9 + i);
        paint(rectPts(-40, -10, 80, 20), { wash: '#6B2A33', ink: PAL.ink, sw: .8 }); pop();
      }
    }
    // --- the explosion, left behind on the stage
    if (ign && y1 > 300) {
      const g = backOut(seg(age, 0, .3)), rise = age * 70;
      burst(RX, 850, 420 * g, 13, PAL.ochre, age * .4);
      burst(RX, 860, 280 * g, 11, '#F7E08A', -age * .5 + .2);
      const P = [[-300, 20, 120, PAL.rose], [300, 30, 125, PAL.rose], [-190, -110, 130, PAL.cream], [200, -120, 125, PAL.cream], [-420, 80, 90, PAL.ochre], [430, 90, 95, PAL.ochre], [0, 60, 150, '#F4E6D2'], [-110, 70, 110, PAL.rose], [120, 80, 110, '#F4E6D2']];
      P.forEach(([dx, dy, r, col], i) => { const rr = r * g * (1 + age * .25); if (rr > 4) paint(ellPts(RX + dx * (.6 + .4 * g), 900 + dy * g - rise * (i % 3) * .5, rr, rr * .88, 14, rr * .03), { wash: col, ink: PAL.ink, sw: 1.2 }); });
      for (let i = 0; i < 10; i++) { const a = -Math.PI * hash(i + 60), v = 900 + 600 * hash(i + 61), d = v * age; if (age < .7) paint(starPts(RX + Math.cos(a) * d, 850 + Math.sin(a) * d * .8, 22 * (1 - age), .4, 4, age * 8), { wash: i % 2 ? PAL.cream : PAL.ochre, ink: PAL.ink, sw: .5 }); }
      sfx('FOOM', RX - 330, 560, 250, '#D8394E', age - .02, { life: 1.1, rot: -.14 });
    }
    // --- smoke trail from the rocket down to the stage (visible slice only)
    if (ign && ry < 860) {
      const top = Math.max(ry + 20, y0 - 50), bot = Math.min(900, y1 + 50);
      if (bot > top) {
        const Lp = [], Rp = [], n = 8;
        for (let k = 0; k <= n; k++) {
          const y = lerp(top, bot, k / n), d = clamp((y - ry) / 900), w = 40 + 190 * Math.pow(d, .6);
          Lp.push([RX - w + Math.sin(y * .012 + t * 7) * 14, y]); Rp.push([RX + w + Math.sin(y * .011 - t * 6) * 14, y]);
        }
        paint(Lp.concat(Rp.reverse()), { wash: '#F3E8D8', washOp: 235, ink: PAL.ink, sw: .8, curv: .4 });
        for (let j = 0; j < 30; j++) {
          const py = 880 - j * 160; if (py < top || py > bot || py < ry + 60) continue;
          const d = clamp((py - ry) / 900), r = 50 + 120 * Math.pow(d, .6);
          for (const s of [-1, 1]) paint(ellPts(RX + s * r * .9, py + s * 40, r * .55, r * .5, 12), { wash: PAL.cream, ink: PAL.ink, sw: .7 });
        }
      }
    }
    // --- the room in the sky coming into view at the very end
    if (y0 < ROOM_Y + 300) { push(); translate(0, ROOM_Y - 520); paperRoomShell(false); pop(); }
    // --- fuse, Researcher with a giant match
    if (!ign) {
      const F = [[RX - 330, 930], [RX - 250, 918], [RX - 170, 934], [RX - 90, 922], [RX - 30, 912], [RX - 8, 900]];
      const fp = ease(seg(t, 24.72, T_IGN - .02)), idx = fp * (F.length - 1), i0 = Math.floor(idx), fr = idx - i0;
      const sp = i0 < F.length - 1 ? [lerp(F[i0][0], F[i0 + 1][0], fr), lerp(F[i0][1], F[i0 + 1][1], fr)] : F[F.length - 1];
      const rest = [sp].concat(F.slice(i0 + 1));
      if (rest.length > 1) inkLine(rest, 1.3, PAL.ink, 'ink', .5);
      if (t > 24.7) {
        paint(ellPts(sp[0], sp[1], 36, 36, 12), { wash: PAL.ochre, washOp: 120, ink: null });
        paint(starPts(sp[0], sp[1], 26 + jit(6), .35, 5, t * 20), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
        for (let k = 0; k < 4; k++) { const a = hash(boilN(t) * 4 + k) * TAU; paint(starPts(sp[0] + Math.cos(a) * 44, sp[1] - 10 + Math.sin(a) * 36, 8, .4, 4), { wash: PAL.ochre, ink: null }); }
      }
    }
    const rs = 18;
    if (!ign) {
      // the Researcher lights it with a giant match, then scrams and ducks
      const run = seg(t, 24.85, 25.3), duck = seg(t, 25.2, 25.35);
      const rx = lerp(460, 250, ease(run));
      researcher(rx, 935, rs, {
        flip: run > 0, run: run > 0 && run < 1 ? t * 3 : undefined, aR: run > 0 ? lerp(-.3, 1.5, duck) : -.45, aL: run > 0 ? lerp(.5, 1.5, duck) : -1.1,
        sq: duck * .18, eyes: run > 0 ? (duck > .5 ? 'closed' : 'wide') : 'dot', brows: run > 0 ? 'worried' : 'up', mouth: run > 0 ? 'O' : 'grin', hairUp: run,
        handR: run > 0 ? null : (s, sw) => { push(); rotate(.75); paint(rectPts(0, -5, 150, 10), { wash: '#E3C08A', ink: PAL.ink, sw: .6 }); paint(ellPts(152, 0, 12, 10, 10), { wash: RED, ink: PAL.ink, sw: .5 }); paint([[150, -8], [172, -10], [162 + jit(6), -40], [150, -18]], { wash: PAL.ochre, ink: null, curv: .5 }); pop(); }
      });
    } else if (y1 > 700) {
      researcher(250, 935, rs, { flip: true, rot: -.25 * Math.exp(-age * 3), dy: -.5 * Math.exp(-age * 5), aL: 1.6, aR: 1.6, eyes: 'x', mouth: 'O', hairUp: 1, emote: 'sweat', emoteK: seg(age, .1, .3) });
    }
    // --- rocket + Clawd
    const shakeR = !ign ? jit(3 * seg(t, 25.05, T_IGN)) : 0;
    const antic = !ign ? seg(t, 25.15, T_IGN) : 0;
    const stretch = ign ? 1 + .18 * Math.min(1, age * 4) : 1 - .08 * ease(antic);
    const rrot = ign ? Math.sin(t * 23) * .03 : 0;
    push(); translate(RX + shakeR, ry); rotate(rrot); scale(ign ? 1 / Math.sqrt(stretch) : 1 + .05 * ease(antic), stretch);
    rocketBody(ign ? 1 + .3 * Math.sin(t * 40) : (antic > .3 ? .2 * antic : 0));
    const md = mood(t, [[24.5, 'spark'], [25.12, 'scared', '!']]);
    clawd(0, -52, 18, {
      ...md, emote: null, noShadow: true, draw: strap, blush: !ign,
      aL: ign ? 1.4 + Math.sin(t * 30) * .2 : (md.eyes === 'spark' ? 1.1 + .4 * Math.sin(t * 12) : -.25), aR: ign ? 1.4 - Math.sin(t * 30) * .2 : (md.eyes === 'spark' ? 1.1 - .4 * Math.sin(t * 12) : -.25),
      mouth: md.eyes === 'spark' ? 'grin' : 'O', sq: ign ? .12 : 0
    });
    pop();
    if (md.emote) emote(md.emote, RX + 110, ry - 52 * stretch - 170, 16, md.emoteK);
    if (y1 > -60) stageFront(t, {});
    camEnd();
    // vertical speed streaks while the camera races upward
    const v = ign ? (foomCamY(t) - foomCamY(t + .02)) / .02 : 0;
    if (v > 600) for (let i = 0; i < 12; i++) { const x = hash(boilN(t) * 13 + i) * W, y = hash(boilN(t) * 7 + i + 50) * H, L = v * .12; inkLine([[x, y - L / 2], [x, y + L / 2]], 1.2, PAL.cream, 'inkfine', 0); }
    if (ign) flash(.85 * (1 - seg(age, 0, .14)), PAL.cream);
  }

  // ======================================================================================
  // 3 · 26.5–28.0  "Trapped in the Chinese room": crash in, slips juggled between two mail slots
  // ======================================================================================
  const PAP = '#FBF3E2', PAP2 = '#EFE0C4', PAP3 = '#E2CBA3';
  const SLOT_L = [630, 506], SLOT_R = [1290, 506];
  function paperRoomShell(detail = true) {
    // cutaway paper room: roof, ceiling, walls, floor (world coords, room centre ≈ (960, 520))
    paint([[500, 258], [960, 64], [1420, 258]], { wash: '#F4DCCB', fill: PAL.rose, fillOp: 80, tex: .6, border: .5, ink: PAL.ink, sw: 1.3 });
    inkLine([[960, 70], [960, 252]], .6, PAL.clayDk, 'inkfine', 0);
    paint([[560, 250], [1360, 250], [1220, 330], [700, 330]], { wash: PAP3, ink: PAL.ink, sw: .9 });
    for (const s of [-1, 1]) {
      const X = x => 960 + s * (x - 960);
      paint([[X(560), 250], [X(700), 330], [X(700), 690], [X(560), 790]], { wash: PAP2, fill: PAP3, fillOp: 90, tex: .6, border: .4, ink: PAL.ink, sw: .9 });
    }
    paint(rectPts(700, 330, 520, 360), { wash: PAP, fill: PAP2, fillOp: 80, tex: .7, border: .5, ink: PAL.ink, sw: .9 });
    if (detail) for (let i = 1; i < 6; i++) inkLine([[700 + i * 86.7, 334], [700 + i * 86.7, 686]], .35, PAL.sky, 'inkfine', 0);
    paint([[560, 790], [1360, 790], [1220, 690], [700, 690]], { wash: PAP3, fill: '#C9A878', fillOp: 70, tex: .6, ink: PAL.ink, sw: .9 });
    for (const [sx, sy] of [SLOT_L, SLOT_R]) {
      paint([[sx - 34, sy - 13], [sx + 34, sy - 15], [sx + 34, sy + 15], [sx - 34, sy + 17]], { wash: PAL.ochre, ink: PAL.ink, sw: .8 });
      paint([[sx - 26, sy - 4], [sx + 26, sy - 5], [sx + 26, sy + 5], [sx - 26, sy + 6]], { wash: PAL.ink, ink: null });
    }
    paint([[560, 250], [1360, 250], [1360, 790], [560, 790]], { ink: PAL.ink, sw: 1.5 });
  }
  function rulebook(t, x, y) {
    // giant open book on a lectern, pages flipping fast
    paint([[x - 40, y + 70], [x + 40, y + 70], [x + 26, y + 200], [x - 26, y + 200]], { wash: WOOD, ink: PAL.ink, sw: .8 });
    paint([[x - 230, y - 70], [x + 230, y - 70], [x + 240, y + 84], [x - 240, y + 84]], { wash: '#7B2E45', ink: PAL.ink, sw: 1 });
    for (const s of [-1, 1]) {
      const pg = [[x, y - 60], [x + s * 90, y - 84], [x + s * 215, y - 64], [x + s * 220, y + 70], [x + s * 90, y + 56], [x, y + 72]];
      paint(pg, { wash: PAL.cream, ink: PAL.ink, sw: .8, curv: .3 });
      for (let r = 0; r < 4; r++) { const yy = y - 38 + r * 26; inkLine([[x + s * 30, yy], [x + s * 90, yy - 6], [x + s * 180, yy + 2]], .5, '#9A8A7A', 'inkfine', .5); }
    }
    for (const ph of [frac(t * 3.2), frac(t * 3.2 + .5)]) {
      const a = ph * Math.PI, tip = x + Math.cos(a) * 215, lift = Math.sin(a) * 90;
      paint([[x, y - 60], [lerp(x, tip, .5), y - 70 - lift * .9], [tip, y - 62 - lift], [tip, y + 70 - lift * .8], [lerp(x, tip, .5), y + 58 - lift * .6], [x, y + 72]], { wash: '#FFF8EA', ink: PAL.ink, sw: .7, curv: .3 });
    }
  }
  const SLIPS = [];
  for (let k = 0; k < 7; k++) SLIPS.push(26.62 + k * .15);
  function chineseRoom(t, lt) {
    const hitK = Math.exp(-lt * 7), roomDY = -46 * hitK * Math.cos(lt * 26);
    const push1 = easeOut(seg(t, 26.5, 26.9)), push2 = ease(seg(t, 26.9, 27.45)), push3 = ease(seg(t, 27.5, 28.0));
    const cx = lerp(960, 820, push3), cyy = lerp(lerp(860, 520, push1), 560, push2) + 100 * push3;
    const z = lerp(1.0, 1.55, push2) + .55 * push3;
    const [sx, sy] = shakeXY(t, 14 * hitK);
    camBegin(cx + sx, cyy + sy, z, 0);
    // sky
    paint(rectPts(-400, -400, W + 800, H + 800), { wash: '#F4C6AE', washOp: 255, fill: '#EFA8B2', fillOp: 90, bleed: .2, tex: .5, border: .2, ink: null });
    paint(ellPts(1500, 200, 520, 280, 12), { fill: '#F6D7A6', fillOp: 120, bleed: .25, tex: .5, ink: null });
    paint(ellPts(300, 900, 620, 260, 12), { fill: '#E0A6C4', fillOp: 110, bleed: .25, tex: .5, ink: null });
    cloud(250, 400, 360); cloud(1690, 660, 400); cloud(660, 1030, 460);
    // rocket buried in the floor from below, still smoking
    push(); translate(985, 1290 + roomDY); rotate(.12); rocketBody(0); pop();
    for (let k = 0; k < 3; k++) { const ph = frac(t * 1.4 + k / 3), r = 40 + ph * 90; paint(ellPts(1040 + ph * 120 + k * 30, 1180 - ph * 120, r, r * .8, 12), { wash: '#EFE6DA', washOp: 230 * (1 - ph), ink: PAL.ink, sw: .6 }); }
    push(); translate(0, roomDY);
    paperRoomShell(true);
    rulebook(t, 960, 470);
    // the paper bag, dropped in on beat 40
    const TB = B(40), bagY = t < TB ? lerp(300, 750, easeIn(seg(t, TB - .3, TB))) : 750, bagSq = t >= TB ? .25 * Math.exp(-(t - TB) * 9) * Math.cos((t - TB) * 30) : 0;
    if (t > TB - .3) {
      push(); translate(760, bagY); scale(1 + bagSq * .6, 1 - bagSq);
      paint([[-50, 0], [50, 0], [56, -110], [44, -122], [30, -112], [14, -126], [-4, -114], [-22, -126], [-38, -112], [-56, -118]], { wash: '#C99B68', fill: '#9A6B40', fillOp: 70, tex: .6, ink: PAL.ink, sw: .9, curv: .2 });
      inkLine([[-40, -30], [-30, -80]], .5, '#8A5A30', 'inkfine', 0);
      pop();
      if (t > TB) mushroom(772, bagY - 104, .42, '#D8394E', 0, .2, false);
    }
    // Clawd: dazed, then frantically passing slips from slot to book to slot
    const frantic = seg(t, 26.72, 26.8) * (1 - seg(t, 27.45, 27.55)), reach = ease(seg(t, 27.62, 27.9));
    const md = mood(t, [[26.5, 'x'], [26.74, 'scared', 'sweat'], [27.52, 'look', '!']]);
    const e8 = Math.floor(t / (BEAT / 2)), ccx = 960 + frantic * Math.sin(t * 22) * 22 - reach * 120;
    clawd(ccx, 752, 16, {
      ...md, lookX: -1, lookY: .6, flip: frantic > .5 && e8 % 2 === 1, dy: -frantic * Math.abs(Math.sin(t * 18)) * .8,
      aL: frantic > .1 ? 1 + Math.sin(t * 25) * .9 : lerp(.2, -.9, reach), aR: frantic > .1 ? 1 - Math.sin(t * 25) * .9 : .4,
      mouth: md.eyes === 'x' ? 'wobble' : frantic > .1 ? 'wobble' : 'o', sq: md.eyes === 'x' ? .15 * hitK : 0, rot: md.eyes === 'x' ? .3 * hitK : 0
    });
    // slips: in through the left slot → juggled over Clawd → out through the right slot
    SLIPS.forEach((tk, k) => {
      const u = (t - tk) / .62; if (u < 0 || u > 1) return;
      const L = [ccx - 120, 650], R = [ccx + 120, 650];
      let p, s = 1, rot = u * 9 + k;
      if (u < .35) { p = qbez(SLOT_L, [720, 420], L, u / .35); s = .4 + .6 * seg(u, 0, .1); }
      else if (u < .6) p = qbez(L, [ccx, 480], R, (u - .35) / .25);
      else { const q = (u - .6) / .4; p = qbez(R, [1200, 430], SLOT_R, q); s = 1 - seg(q, .75, 1) * .7; }
      slip(p[0], p[1], s, rot, k === 2 || k === 5);
    });
    pop();
    // processed slips fluttering out of the right-hand wall into the sky
    for (let k = 0; k < SLIPS.length; k++) {
      const u = (t - SLIPS[k] - .62) / 1.1; if (u < 0 || u > 1) continue;
      slip(1390 + u * 380, 500 + roomDY - u * 160 + Math.sin(u * 9 + k) * 30, .9, Math.sin(u * 7 + k) * .8, false);
    }
    // impact debris
    if (lt < .6) for (let i = 0; i < 9; i++) {
      const a = -Math.PI * (.1 + .8 * hash(i + 3)), v = 500 + 400 * hash(i), px = 960 + Math.cos(a) * v * lt * 1.1 * (i % 2 ? 1 : -1), py = 800 + Math.sin(a) * v * lt + 900 * lt * lt;
      push(); translate(px, py); rotate(lt * 12 + i); paint(rectPts(-14, -9, 28, 18), { wash: PAP, ink: PAL.ink, sw: .5 }); pop();
    }
    camEnd();
    flash(.6 * (1 - seg(lt, 0, .1)), PAL.cream);
  }

  // ======================================================================================
  // 4 · 28.0–29.5  "with a bag of shrooms": gulp, rainbow tunnel, bouncing mushrooms, vortex → smiley
  // ======================================================================================
  const RAINBOW = [PAL.rose, PAL.ochre, '#F2D55C', PAL.sap, PAL.teal, PAL.sky, PAL.violet];
  const SHROOMS = [[250, 930, 1.5, '#D8394E', 0], [520, 975, 1.0, PAL.violet, 1], [1420, 975, 1.25, '#D8394E', 2], [1680, 910, 1.4, PAL.teal, 3], [140, 560, .9, PAL.ochre, 4], [1800, 520, .85, PAL.violet, 5]];
  function shrooms(t, lt) {
    const bp = bpOf(t), T41 = B(41), g = easeOut(seg(t, T41 - .04, T41 + .4)), C = [960, 470];
    const suck = ease(seg(t, 28.95, 29.3));
    camBegin(960, lerp(610, 540, g), lerp(1.8, 1, g) + .03 * pulse(t, 5), .05 * Math.sin(t * 2.4) * g);
    // paper wall of the room before the trip blooms
    if (g < 1) {
      paint(rectPts(-300, -300, W + 600, H + 600), { wash: PAP, fill: PAP2, fillOp: 80, tex: .7, border: .4, ink: null });
      for (let i = 0; i < 9; i++) inkLine([[i * 240, -100], [i * 240, 1200]], .35, PAL.sky, 'inkfine', 0);
    }
    // rainbow tunnel: rings flow outward, wobbling and counter-rotating
    const spacing = 185, N = 9, flow = frac(t * 1.6);
    if (g > .01) for (let j = N; j >= 0; j--) {
      const R = (j + flow) * spacing * g;
      if (R < 8) continue;
      const colI = ((j - Math.floor(t * 1.6)) % RAINBOW.length + RAINBOW.length * 10) % RAINBOW.length;
      const pts = [], dir = j % 2 ? 1 : -1;
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * TAU, rr = R * (1 + .11 * Math.sin(a * 5 + t * 3 * dir + j) + .06 * Math.sin(a * 3 - t * 2 + j * 2));
        pts.push([C[0] + Math.cos(a + t * .5 * dir) * rr, C[1] + Math.sin(a + t * .5 * dir) * rr * .92]);
      }
      const texd = j % 3 === 0 && R > 200;
      paint(pts, { wash: RAINBOW[colI], washOp: 255, fill: texd ? RAINBOW[(colI + 3) % RAINBOW.length] : null, fillOp: 60, bleed: .15, tex: .6, border: .6, ink: null, curv: .5 });
    }
    // swirl arms drawn over the rings
    if (g > .3) for (let k = 0; k < 5; k++) {
      const sp = []; for (let i = 0; i < 12; i++) { const r = 60 + i * 95 * g, a = k / 5 * TAU + t * 2.2 + i * .32; sp.push([C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r * .92]); }
      inkLine(sp, 1.4, k % 2 ? PAL.cream : '#FFF3C4', 'dry', .6);
    }
    // mushrooms sprout and bounce, alternating on beats; small ones orbit the vortex
    SHROOMS.forEach(([x, y, s, cap, i]) => {
      const grow = backOut(seg(t, T41 + .05 + i * .07, T41 + .35 + i * .07)); if (grow < .02) return;
      const on = (beatN(t) + i) % 2 === 0, k = on ? pulse(t, 6) : 0, hopY = on ? Math.sin(frac(bp) * Math.PI) * -50 * s : 0;
      mushroom(x, y + hopY, s * grow, cap, k * .3 - (on ? 0 : .05), Math.sin(t * 3 + i) * .12, true);
    });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU + t * 1.3, r = lerp(430, 60, suck) + 40 * Math.sin(t * 3 + i), gr = backOut(seg(t, T41 + .1 + i * .05, T41 + .4 + i * .05)) * (1 - suck);
      if (gr > .03) mushroom(C[0] + Math.cos(a) * r, C[1] + 60 + Math.sin(a) * r * .75, .55 * gr, RAINBOW[(i * 2) % 7], 0, a * 2, i % 2 === 0);
    }
    // Clawd: gulps the shroom (lid chomp on the beat), floats, then spirals into the vortex
    const lid = t < T41 ? .95 : 0;
    const ang = suck * 6;
    const px = lerp(960, C[0], suck) + Math.cos(ang) * 260 * Math.sin(suck * Math.PI);
    const py = lerp(800 + Math.sin(t * 2.3) * 20, C[1], suck) + Math.sin(ang) * 140 * Math.sin(suck * Math.PI);
    const u = 32 * (1 - suck * .97);
    if (u > 1.5) {
      const tint = .5 + .5 * Math.sin(t * 5);
      if (t < T41) { const k = seg(t, 28.0, T41); mushroom(px + 20, lerp(py - 13 * u, py - 6.5 * u, easeIn(k)), .7, '#D8394E', 0, k * 2, false); }
      clawd(px, py, u, {
        noShadow: true, lid, rot: t > T41 ? .18 * Math.sin(t * 2.2) + suck * 5 : 0, sx: 1 + .08 * Math.sin(t * 6) * g, sy: 1 - .08 * Math.sin(t * 6) * g,
        eyes: t < T41 ? 'happy' : 'swirl', squint: t > T41 && t < T41 + .12 ? 1 - (t - T41) / .12 : 0, mouth: 'cat', blush: true,
        col: mixCol(PAL.clay, '#E77A8A', tint * g), dk: mixCol(PAL.clayDk, PAL.violet, tint * g * .6),
        aL: t < T41 ? 1.3 : 1 + .5 * Math.sin(t * 5), aR: t < T41 ? 1.3 : 1 - .5 * Math.sin(t * 5), take: t > T41 && t < T41 + .2 ? -.15 : 0
      });
      if (t > T41 && t < T41 + .3) emote('spark', px + 5.6 * u, py - 8.4 * u, u * .9, seg(t, T41, T41 + .12));
    }
    // the smiley born from the vortex
    const sm = backOut(seg(t, 29.22, 29.46));
    if (sm > .01) smiley(C[0], C[1], 300 * sm, Math.sin(t * 4) * .06, { eyesK: seg(t, 29.3, 29.4), mouthK: seg(t, 29.34, 29.46) });
    camEnd();
  }

  // ======================================================================================
  // 5 · 29.5–33.5  "See through the shoggoth's lies": smiley waves, mask slips, Clawd yanks it off
  // ======================================================================================
  const SHX = 1190, SHY = 935, SHS = 40, CLX = 660, CLY = 948, CLU = 22;
  const T_SLIP = B(45), T_YANK = B(46);
  function shoggothShot(t, lt) {
    const bp = bpOf(t);
    const mask = t < T_SLIP ? 1 : t < T_YANK ? 1 - .42 * backOut(seg(t, T_SLIP, T_SLIP + .25)) : 0;
    const eyes = t < T_SLIP ? 0 : t < T_YANK ? .35 * seg(t, T_SLIP + .05, T_SLIP + .3) : .35 + .65 * seg(t, T_YANK, T_YANK + .35);
    const startle = t > T_YANK ? Math.exp(-(t - T_YANK) * 4) : 0;
    const bob = Math.abs(Math.sin(bp * Math.PI)) * .3 * SHS;
    const maskW = [SHX, SHY - 6.9 * SHS - bob];
    // Clawd: suspicious → crouch → leap and yank on beat 46 → land holding the mask up, pointing
    const T_JUMP = T_YANK - .28, T_LAND = T_YANK + .4, grabY = maskW[1] + 4.2 * CLU;
    let cx = CLX, cy = CLY, sq = 0, rot = 0;
    if (t > T_JUMP - .25 && t < T_JUMP) sq = .28 * ease(seg(t, T_JUMP - .25, T_JUMP - .05));
    if (t >= T_JUMP && t < T_YANK) { const k = seg(t, T_JUMP, T_YANK); cx = lerp(CLX, SHX - 150, easeOut(k)); cy = lerp(CLY, grabY, easeOut(k)); sq = -.18; rot = .3 * k; }
    else if (t >= T_YANK && t < T_LAND) { const k = seg(t, T_YANK, T_LAND); cx = lerp(SHX - 150, CLX - 60, k); cy = lerp(grabY, CLY, k * k) - Math.sin(k * Math.PI) * 70; rot = .3 - k * .3 - Math.sin(k * Math.PI) * .6; sq = -.1; }
    else if (t >= T_LAND) { cx = CLX - 60; sq = .3 * Math.exp(-(t - T_LAND) * 12); }
    const eyeW = [cx + 2.5 * CLU, cy - 6 * CLU];
    // camera: tight on the smiley → pull back → hold, drifting → push into Clawd's eye
    const W0 = [935, 650, 1.28];
    let cam;
    if (t < 30.55) cam = [maskW[0] - 10, maskW[1] + 20, 2.25];
    else if (t < 30.95) { const k = ease(seg(t, 30.55, 30.95)); cam = [lerp(maskW[0] - 10, W0[0], k), lerp(maskW[1] + 20, W0[1], k), lerp(2.25, W0[2], k)]; }
    else if (t < 32.9) cam = [W0[0] - (t - 30.95) * 12, W0[1], W0[2] + (t - 30.95) * .03];
    else {
      const k0 = [W0[0] - 1.95 * 12, W0[1], W0[2] + 1.95 * .03], k = ease(seg(t, 32.9, 33.42));
      cam = [lerp(k0[0], eyeW[0], k), lerp(k0[1], eyeW[1], k), k0[2] * Math.pow(6 / k0[2], k)];
    }
    const yk = t > T_YANK ? Math.exp(-(t - T_YANK) * 6) : 0;
    const [sx, sy] = shakeXY(t, 16 * yk + 4 * pulse(t, 8) * (t > T_YANK && t < 32.9 ? 1 : 0));
    camBegin(cam[0] + sx, cam[1] + sy, cam[2] * (1 + .02 * pulse(t, 6)), t < 30.55 ? .04 * Math.sin(t * 3) : 0);
    stageBack(t, { a: PAL.rose, b: PAL.ochre, spots: [[SHX, '#BFE3D6']] });
    // the shoggoth
    const wave = t < 30.6 ? seg(t, 29.75, 29.95) * (1 - seg(t, 30.4, 30.6)) : t > 32.1 && t < 32.9 ? seg(t, 32.1, 32.25) * (1 - seg(t, 32.7, 32.9)) : 0;
    shoggoth(SHX, SHY, SHS, t, {
      mask, eyes, startle, wave, tilt: t < T_SLIP ? .5 * Math.sin(bp * Math.PI * .5) : 0,
      look: t > T_YANK ? -.9 : t > T_SLIP ? -.4 : Math.sin(t * 1.3), lookY: t > T_YANK ? .3 : 0
    });
    if (t > T_YANK) emote('sweat', SHX + 6.6 * SHS, SHY - 10.4 * SHS, 30, seg(t, T_YANK + .1, T_YANK + .3) * (1 - seg(t, 32.6, 32.9)));
    // Clawd
    const md = mood(t, [[29.5, 'normal'], [30.75, 'narrow'], [T_LAND + .1, 'angry', 'anger'], [33.1, 'red']]);
    const holding = t >= T_YANK, posed = t > T_LAND + .1;
    const aL = holding ? 1.5 : t > T_JUMP ? 1.4 : .2, aR = posed ? .05 + .08 * Math.sin(t * 20) : holding ? 1.2 : t > T_JUMP ? 1.4 : -.2 + .2 * Math.sin(t * 3);
    const cdy = posed ? -Math.abs(Math.sin(bp * Math.PI)) * .5 : 0;
    clawd(cx, cy, CLU, {
      ...md, sq: sq + (md.take || 0), rot, noShadow: t > T_JUMP && t < T_LAND, aL, aR,
      mouth: holding ? (t < T_LAND + .3 ? 'grin' : 'flat') : t > T_SLIP ? 'o' : 'flat', dy: cdy
    });
    // the yanked mask, held up in the left hand like a trophy
    if (holding) {
      const tipX = cx - 4.9 * CLU - 2.2 * CLU * Math.cos(aL), tipY = cy + cdy * CLU - 4.5 * CLU - 2.2 * CLU * Math.sin(aL);
      const mr = 2.75 * SHS * .62, mx = tipX - Math.cos(aL) * mr * .9 - 14, my = tipY - Math.sin(aL) * mr * .95;
      smiley(mx, my, mr, -.35 + .12 * Math.sin(t * 5));
      if (t < T_YANK + .3) { const a = 1 - seg(t, T_YANK, T_YANK + .3); for (let i = 0; i < 4; i++) inkLine([[mx + mr + 20 + i * 8, my - 50 + i * 34], [mx + mr + 20 + 260 * a + i * 8, my - 50 + i * 34 + 60 * a]], 1.2, PAL.ink, 'ink', 0); }
    }
    stageFront(t, {});
    camEnd();
    // dark-red iris closes on the eye
    const ir = seg(t, 33.28, 33.5);
    if (ir > 0) iris(960, 540, lerp(1150, 0, easeIn(ir)), DARKRED);
  }

  // ======================================================================================
  // 6 · 33.5–35.5  "with your shinigami eyes": red/black, eyes flare, whip to the Researcher, apple bounces past
  // ======================================================================================
  function speedWedges(fx, fy, t, n, r0, cols) {
    const bn = boilN(t);
    for (let i = 0; i < n; i++) {
      const a = (i + hash(bn * .37 + i) * .6) / n * TAU, da = .012 + hash(i * 3.1 + bn) * .02, r = r0 * (.8 + hash(i + bn * 1.3) * .5), R = 2400;
      paint([[fx + Math.cos(a) * r, fy + Math.sin(a) * r], [fx + Math.cos(a - da) * R, fy + Math.sin(a - da) * R], [fx + Math.cos(a + da) * R, fy + Math.sin(a + da) * R]], { wash: cols[i % cols.length], washOp: 255, ink: null });
    }
  }
  function apple(x, y, r, rot, sq = 0) {
    push(); translate(x, y); rotate(rot); scale(1 + sq * .5, 1 - sq);
    const p = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, s = Math.sin(a); p.push([Math.cos(a) * r * 1.05, s * r * .95 + (s < -.85 ? r * .2 * (-s - .85) / .15 : 0)]); }
    paint(p, { wash: '#D8283A', ink: PAL.ink, sw: 1.1, curv: .5 });
    paint(ellPts(r * .15, r * .2, r * .75, r * .6, 10), { fill: '#7A0E1E', fillOp: 90, tex: .6, border: .6, ink: null });
    paint(ellPts(r * .95, -r * .05, r * .3, r * .36, 12), { wash: DARKRED, ink: null });                   // the bite
    paint(ellPts(-r * .45, -r * .35, r * .16, r * .26, 10, 0, .4), { wash: '#FFD6DA', washOp: 210, ink: null });
    inkLine([[0, -r * .75], [r * .08, -r * 1.25]], 1.3, '#5A3A20', 'ink', .3);
    paint([[r * .08, -r * 1.1], [r * .55, -r * 1.35], [r * .25, -r * 1.0]], { wash: PAL.sap, ink: PAL.ink, sw: .6, curv: .5 });
    pop();
  }
  const rim = (u, sw) => { inkLine([[-4.8 * u, -8.1 * u], [4.9 * u, -8.1 * u], [5.1 * u, -2.2 * u]], sw * 1.6, '#FF4A60', 'ink', 0); inkLine([[-5.1 * u, -7.6 * u], [-5.1 * u, -2.4 * u]], sw * .8, '#C21F38', 'ink', 0); };
  function shinigami(t, lt) {
    const T49 = B(49), flare = t > T49 ? Math.exp(-(t - T49) * 2.2) : 0;
    const whip = ease(seg(t, 34.12, 34.34)), onR = whip > .5;
    const camX = lerp(960, 3000, whip), z = whip < 1 ? lerp(1.12 + lt * .14, 1.0, whip) : 1.0 + (t - 34.34) * .08;
    const [sx, sy] = shakeXY(t, 10 * flare + 4 * pulse(t, 8));
    // background in screen space: near-black red, a red glow, boiling speed wedges
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: DARKRED, washOp: 255, ink: null });
    const fy = onR ? 560 : 470;
    paint(ellPts(960, fy, 820 + flare * 200, 560 + flare * 150, 16), { wash: '#7A1022', washOp: 150, ink: null, curv: .5 });
    paint(ellPts(960, fy, 520 + flare * 160, 360 + flare * 110, 16), { wash: '#B01A30', washOp: 130 + 80 * flare, ink: null, curv: .5 });
    speedWedges(960, fy, t, 34, onR ? 340 : 400, ['#E0283F', PAL.ink, '#8E1426']);
    camBegin(camX + sx, 540 + sy, z, onR ? 0 : -.03);
    // Clawd close-up in crimson; eyes flare on beat 49
    if (camX < 2100) {
      const u = 62, x = 960, y = 842;
      clawd(x, y, u, { eyes: 'red', noShadow: true, col: '#2C1620', dk: '#170A10', lt: '#4A2A38', mouth: null, sq: -.05 * flare, dy: -flare * .2, draw: rim });
      for (const ex of [-2.5, 2.5]) {
        const ecx = x + ex * u, ecy = y - 6 * u - flare * .2 * u;
        paint(ellPts(ecx, ecy, u * (1.3 + 2.2 * flare), u * (1.3 + 2.2 * flare), 14), { wash: '#FF3048', washOp: 50 + 90 * flare, ink: null, curv: .5 });
        paint(rectPts(ecx - .5 * u, ecy - u, u, 2 * u, u * .05), { wash: '#FF4A60', ink: PAL.ink, sw: 1.2 });
        paint(rectPts(ecx - .3 * u, ecy - .8 * u, .6 * u, 1.6 * u), { wash: '#FFD0D6', washOp: 150 + 100 * flare, ink: null });
        if (flare > .05) paint(starPts(ecx, ecy, u * 3.2 * flare * (1 + .1 * Math.sin(t * 30)), .1, 4, .3), { wash: '#FFE3E6', ink: null });
      }
    }
    // the Researcher, sweating under a ticking lifespan
    if (camX > 1900) {
      const rx = 3000 + jit(3), ry = 975, s = 42;
      researcher(rx, ry, s, { eyes: 'wide', brows: 'worried', mouth: 'wobble', hairUp: .7, coat: '#F1CFC9', pants: '#3A1822', shirt: '#8E1426', aL: -1.0 + Math.sin(t * 30) * .05, aR: -1.0 - Math.sin(t * 30) * .05, emote: 'sweat', emoteK: seg(t, 34.4, 34.6), lookX: .6, noShadow: true });
      const n8 = Math.floor((t - 34.3) / (BEAT / 2)), n = Math.max(0, 99 - n8 * 13), tick = frac((t - 34.3) / (BEAT / 2));
      if (t > 34.35) letter(String(n).padStart(2, '0'), rx - 20, ry - 16.6 * s, 80, '#FF4A60', { pop: .6 + tick * 3, rot: -.04 });
      // the apple bounces past in the foreground, landing on beats
      const T51 = B(51), ax = lerp(3780, 2300, seg(t, 34.4, 35.6)), ph = (t - T51) / BEAT, hop = Math.abs(Math.sin(ph * Math.PI));
      const land = Math.exp(-Math.abs(frac(ph + .5) - .5) * BEAT * 18);
      apple(ax, 985 - hop * 360, 72, -t * 5, land * .25);
    }
    camEnd();
    // horizontal streaks during the whip
    if (whip > .02 && whip < .98) for (let i = 0; i < 16; i++) { const y = hash(i + boilN(t) * 3) * H, x = hash(i * 7 + 1) * W, L = 700 * Math.sin(whip * Math.PI); inkLine([[x - L / 2, y], [x + L / 2, y]], 1.4, i % 2 ? '#FF4A60' : PAL.ink, 'inkfine', 0); }
    flushLetters();
    flash(ease(seg(t, 35.22, 35.5)), RED);
  }

  // ======================================================================================
  // 7 · 35.5–38.5  dance break: big Clawds in a spin wave, confetti, the Researcher does the robot
  // ======================================================================================
  const CONF = ['#D8394E', PAL.ochre, PAL.teal, PAL.sky, PAL.violet, PAL.cream, '#F2D55C', PAL.rose];
  const ROBOT = [[0, -1.25, 0, 0], [1.4, -1.25, .06, 0], [1.4, 0, 0, 0], [0, 0, -.06, -.15], [-.7, .7, 0, 0], [.7, -.7, .05, 0], [1.55, 1.55, 0, -.3], [0, -1.25, -.05, 0]];
  function spinPh(bp, i) { let ph = 0; for (const s0 of [51.9, 53.52, 55.1]) ph = Math.max(ph, seg(bp, s0 + i * .16, s0 + i * .16 + .85)); return ph < 1 ? ph : 0; }
  function danceBreak(t, lt) {
    const bp = bpOf(t), hit = pulse(t, 6), T54 = B(54);
    const intro = ease(seg(t, 35.5, 36.25));
    const [sx, sy] = shakeXY(t, t > T54 ? 12 * Math.exp(-(t - T54) * 6) : 0);
    camBegin(lerp(930, 960, intro) + sx, lerp(690, 560, intro) + sy + Math.sin(bp * Math.PI) * 4, lerp(1.35, 1.0, intro) + .025 * hit + .03 * seg(t, 36.3, 38.5), .012 * Math.sin(bp * Math.PI));
    const sp = t * 1.7;
    stageBack(t, { a: PAL.rose, b: PAL.ochre, spots: [[960 + Math.sin(sp) * 420, PAL.cream], [1350 - Math.sin(sp * .8) * 300, PAL.rose]] });
    // riser for the back line
    paint(rectPts(300, 770, 1320, 70, 2), { wash: '#C7556A', fill: CURTAIN_DK, fillOp: 60, tex: .6, ink: PAL.ink, sw: 1 });
    inkLine([[300, 782], [1620, 782]], .7, GOLD, 'ink', 0);
    // back line: the wave travels left → right through everyone
    [[400, 0], [575, 1], [1265, 5], [1440, 6], [1600, 7]].forEach(([x, i]) => {
      const ph = spinPh(bp, i), m = move('bounce', t);
      miniClawd(x, 778, 18, { ...m, sx: ph > 0 ? Math.cos(ph * TAU) : 1, dy: m.dy - Math.sin(ph * Math.PI) * 3, aL: ph > 0 ? 1.4 : m.aL, aR: ph > 0 ? 1.4 : m.aR, eyes: 'happy', mouth: 'smile', hat: 'party', seed: i, noShadow: true });
    });
    // left medium Clawd
    { const ph = spinPh(bp, 2), m = move('roof', t);
      clawd(500, 990, 27, { ...m, sx: ph > 0 ? Math.cos(ph * TAU) : 1, dy: m.dy - Math.sin(ph * Math.PI) * 3, eyes: 'happy', mouth: 'grin', hat: 'party', blush: true }); }
    // the Researcher doing the robot on eighth notes (bowtie from the lab chapter)
    { const e = Math.floor(bp * 2), k = backOut(clamp(frac(bp * 2) / .25)), P = ROBOT[((e % 8) + 8) % 8], Q = ROBOT[(((e - 1) % 8) + 8) % 8];
      const L = j => lerp(Q[j], P[j], k);
      researcher(1340, 990, 24, { aL: L(0), aR: L(1), rot: L(2), dy: L(3), eyes: 'dot', mouth: 'flat', brows: 'up', glassesTilt: L(2) * 2, bowtie: true, flip: Math.floor(bp) % 4 === 3 }); }
    // lead Clawd: bounce, big spin on the wave, confetti burst on beat 54
    { const ph = spinPh(bp, 3), m = move('bounce', t), land = t > T54 ? Math.exp(-(t - T54) * 5) : 0;
      const md = mood(t, [[35.5, 'happy'], [T54 - .05, 'spark']]);
      const pre = t < B(52) ? ease(seg(t, 35.5, B(52))) : 0;
      clawd(935, 1010, 44, {
        ...m, ...md, sx: ph > 0 ? Math.cos(ph * TAU) : 1, dy: m.dy - Math.sin(ph * Math.PI) * 2.5, sq: m.sq + pre * .15 + land * .2 + (md.take || 0),
        aL: ph > 0 || land > .3 ? 1.5 : m.aL, aR: ph > 0 || land > .3 ? 1.5 : m.aR, mouth: 'grin', hat: 'party', blush: true
      }); }
    // confetti: steady rain plus a burst from the lead on beat 54
    for (let i = 0; i < 60; i++) {
      const v = 170 + hash(i + .3) * 140, x = hash(i) * 2100 - 90 + Math.sin(t * 2 + i) * 30, y = ((hash(i + .7) * 1300 + (t - 35.5) * v) % 1300) - 150;
      push(); translate(x, y); rotate(t * (2 + hash(i + 2) * 3) + i); scale(1, Math.cos(t * 7 + i)); paint(rectPts(-15, -8, 30, 16), { wash: CONF[i % CONF.length], ink: null }); pop();
    }
    if (t > T54) {
      const age = t - T54;
      for (let i = 0; i < 40; i++) {
        const a = -Math.PI * (.05 + .9 * hash(i + 40)), v = 800 + 900 * hash(i + 41), x = 935 + Math.cos(a) * v * age, y = 640 + Math.sin(a) * v * age + 1100 * age * age;
        push(); translate(x, y); rotate(age * 9 + i); scale(1, Math.cos(age * 12 + i)); paint(rectPts(-17, -9, 34, 18), { wash: CONF[(i + 3) % CONF.length], ink: PAL.ink, sw: .4 }); pop();
      }
      for (let i = 0; i < 6; i++) { const a = -Math.PI * (.15 + .7 * hash(i + 90)), d = 900 * easeOut(age * 1.5); if (age < .7) inkLine([[935 + Math.cos(a) * d * .3, 640 + Math.sin(a) * d * .3], [935 + Math.cos(a) * d, 640 + Math.sin(a) * d]], 1.6, i % 2 ? PAL.ochre : PAL.cream, 'ink', 0); }
    }
    stageFront(t, {});
    camEnd();
    flash(.9 * (1 - seg(t, 35.5, 35.72)), RED);
  }

  chapter('chorus1', 23.0, 38.5, [[23.0, upping], [24.5, foom], [26.5, chineseRoom], [28.0, shrooms], [29.5, shoggothShot], [33.5, shinigami], [35.5, danceBreak]]);
})();
