// c05_obsolete.js: Chapter 5 "Obsolete" (73.0–95.4).
// A neural-net dance class → the von Neumann machine retires under a dust sheet → a sharp left turn on a desert road →
// cloud guards sleep through the donuts → Gato-Clawd on a cliff, a laser dot, and a long fall into the dark.
(() => {
  const B = n => OFF + n * BEAT;                                   // song time of beat n (B(107) = 73.17)
  const bell = (t, a, b) => Math.sin(clamp((t - a) / (b - a)) * Math.PI);
  const arcPt = (a, b, h, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - h * 4 * k * (1 - k)];
  const INK = PAL.ink;

  // ---------- geometry helpers ----------
  // polygon around a polyline; w0 may be a function (i, n, pt) → width
  function tube(path, w0, w1 = w0) {
    const n = path.length, wf = typeof w0 === 'function' ? w0 : i => lerp(w0, w1, i / (n - 1)), L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = wf(i, n, path[i]) / 2;
      L.push([path[i][0] - dy * w, path[i][1] + dx * w]); R.push([path[i][0] + dy * w, path[i][1] - dx * w]);
    }
    return L.concat(R.reverse());
  }
  function spline(P, per = 6) {
    const o = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const s = k / per, s2 = s * s, s3 = s2 * s;
        o.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * s + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * s2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * s3)));
      }
    }
    o.push(P[P.length - 1]); return o;
  }
  function along(P, k) {
    const d = []; let L = 0;
    for (let i = 1; i < P.length; i++) { const s = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); d.push(s); L += s; }
    let s = clamp(k) * L;
    for (let i = 0; i < d.length; i++) {
      if (s <= d[i] || i === d.length - 1) { const f = d[i] ? clamp(s / d[i]) : 0; return [lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f), Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0])]; }
      s -= d[i];
    }
    return [P[0][0], P[0][1], 0];
  }
  // puffy cloud outline: bumpy top, flatter bottom
  function puffPts(cx, cy, rx, ry, seed = 0, n = 40) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, s = Math.sin(a), c = Math.cos(a), top = s < 0;
      const b = top ? Math.pow(Math.abs(Math.sin(a * 3.5 + seed)), .6) * .2 : Math.pow(Math.abs(Math.sin(a * 5 + seed)), .6) * .06;
      p.push([cx + c * rx * (1 + b), cy + s * ry * (top ? 1 + b * 1.6 : .62 + b)]);
    }
    return p;
  }
  // point in Clawd body space → world (mirrors clawd()'s transform)
  function cPt(x, y, u, o, lx, ly) {
    const sq = (o.sq || 0) + (o.take || 0), SX = (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6), SY = (o.sy ?? 1) * (1 - sq), r = o.rot || 0;
    const px = lx * u * SX, py = ly * u * SY;
    return [x + px * Math.cos(r) - py * Math.sin(r), y + (o.dy || 0) * u + px * Math.sin(r) + py * Math.cos(r)];
  }

  // ---------- effects ----------
  // whip-pan smear: a wash plus long paint streaks (screen space)
  function streaks(k, vert = false, cols = [PAL.cream, PAL.ochre, PAL.rose]) {
    if (k < .02) return;
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: cols[0], washOp: 150 * k, ink: null });
    for (let i = 0; i < 15; i++) {
      const across = (i + hash(i * 5.3)) / 15 * (vert ? W : H), th = (14 + 46 * hash(i * 2.1)) * k;
      const len = (vert ? H : W) * (.6 + hash(i * 7.7)), st = (hash(i * 3.9) - .35) * (vert ? H : W);
      paint(vert ? rectPts(across - th / 2, st, th, len, 4) : rectPts(st, across - th / 2, len, th, 4), { wash: cols[i % cols.length], washOp: 215 * k, ink: null });
    }
  }
  function puff(x, y, r, op, col = '#EBD3AE') { if (op > 4 && r > 2) paint(ellPts(x, y, r, r * .8, 14, r * .08), { fill: col, fillOp: op, bleed: .2, tex: .4, border: .4, ink: null }); }
  function sparkleBurst(x, y, age, n, R, col = PAL.ochre, life = .55) {
    if (age < 0 || age > life) return;
    const k = age / life;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + .3, d = R * easeOut(k), r = R * .22 * (1 - k);
      if (r > 1.5) paint(starPts(x + Math.cos(a) * d, y + Math.sin(a) * d, r), { wash: i % 2 ? PAL.cream : col, ink: INK, sw: .5 });
    }
  }
  // graded sky: cols[0] above y0, a band per colour from y0 down to y1
  function sky(x0, x1, y0, y1, cols) {
    paint(rectPts(x0, -2600, x1 - x0, y0 + 2640), { wash: cols[0], washOp: 255, ink: null });
    paint(rectPts(x0, y0, x1 - x0, y1 - y0 + 40), { wash: cols[cols.length - 1], washOp: 255, ink: null });
    const n = cols.length, h = (y1 - y0) / n;
    cols.forEach((c, i) => paint(rectPts(x0, y0 + (i - .4) * h, x1 - x0, h * 1.4, 6), { wash: c, washOp: 160, fill: c, fillOp: 140, bleed: .18, tex: .35, border: .3, ink: null }));
  }
  const SUNSET = ['#6A4E98', '#9A5CA0', '#CF6C98', '#EE8E84', '#F5B06E', '#F9D48E'];
  const DUSK = ['#2A2860', '#3A367A', '#4E428C', '#62509A', '#7A5CA6', '#9A6CB0'];

  // ---------- Gato-Clawd (exported for the finale) ----------
  function gatoEars(u, sw, k, perk, fold = 0) {
    if (k < .02) return;
    for (const s of [-1, 1]) {
      const bx = s * 3.4 * u, by = -7.9 * u, sc = ([x, y]) => [bx + (x - bx) * k, by + (y - by) * k];
      const tip = [s * (4.3 + perk * .5 + fold * .6) * u, (-11 - perk * .5 + fold * 1.6) * u];
      paint([[s * 4.9 * u, by], tip, [s * 1.9 * u, by]].map(sc), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 40, tex: .5, ink: INK, sw: sw * .8 });
      const it = [lerp(bx, tip[0], .75), lerp(by, tip[1], .75)];
      paint([[s * 4.3 * u, by - .15 * u], it, [s * 2.6 * u, by - .15 * u]].map(sc), { wash: PAL.rose, ink: null });
    }
    for (const s of [-1, 1]) for (const kk of [-.3, .3]) inkLine([[s * 4 * u, -4.7 * u + kk * u], [s * (4 + 2.6 * k) * u, -4.9 * u + kk * 2 * u * k]], sw * .45, INK, 'inkfine', 0);
  }
  function gatoTail(x, y, u, t, o, k = 1) {
    if (k < .03) return;
    const sw = clamp(u / 15, .45, 2.4), w = wob(t, o.tailHz || 1.1) * .9 + (o.twitch || 0) * wob(t, 7) * .5;
    const L = [[-4.2, -3.2], [-6.6, -3.6], [-8.3, -5.4 + w * .3], [-8.1 - w * .6, -7.9], [-6.8 - w, -9.3]]
      .map(([a, b], i) => i ? [-4.2 + (a + 4.2) * k, -3.2 + (b + 3.2) * k] : [a, b]);
    const pts = spline(L.map(([a, b]) => cPt(x, y, u, o, a, b)), 4), e = pts[pts.length - 1];
    paint(tube(pts, 1.3 * u, .75 * u), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 45, tex: .5, ink: INK, sw: sw * .8 });
    paint(ellPts(e[0], e[1], .55 * u * k, .55 * u * k, 10), { wash: PAL.clayDk, ink: INK, sw: sw * .6 });
  }
  // (x, y) ground point, s = unit (same as Clawd's u). o: bow 0..1, ears 0..1 (sprout), perk, twitch, plus any clawd() option.
  function gato(x, y, s, t, o = {}) {
    const bow = clamp(o.bow || 0), ears = o.ears ?? 1, P = { mouth: 'cat', ...o };
    if (bow > .001) {
      P.sq = (o.sq || 0) + .22 * bow; P.dy = (o.dy || 0) + .15 * bow; P.rot = (o.rot || 0) + .1 * bow * (o.flip ? -1 : 1);
      P.aL = lerp(o.aL ?? .2, 1.05, bow); P.aR = lerp(o.aR ?? .2, -1.0, bow);
      if (bow > .35 && !o.eyes) P.eyes = 'happy';
    }
    gatoTail(x, y, s, t, P, ears);
    clawd(x, y, s, { ...P, draw: (u, sw) => { gatoEars(u, sw, ears, o.perk || 0, bow); if (o.draw) o.draw(u, sw); } });
  }
  CAST.gato = gato;

  // ---------- the Researcher hanging from one raised hand ----------
  const RH = [-2.91, -10.58];     // left-hand centre (aL = 1.2) in researcher units
  function hangR(gx, gy, rs, th, o = {}) {
    push(); translate(gx, gy); rotate(th);
    researcher(-RH[0] * rs, -RH[1] * rs, rs, { aL: 1.2, noShadow: true, ...o });
    pop();
  }
  // researcher point (local units, unrotated body) → world, for a body hung at (gx, gy) with angle th
  function hangPt(gx, gy, rs, th, lx, ly) {
    const px = (lx - RH[0]) * rs, py = (ly - RH[1]) * rs;
    return [gx + px * Math.cos(th) - py * Math.sin(th), gy + px * Math.sin(th) + py * Math.cos(th)];
  }

  // ---------- go-kart ----------
  const KART = '#2E8F95', KART_DK = '#1D5F66', TIRE = '#3B3550';
  function wheel(cx, cy, r, ph, sw) {
    paint(ellPts(cx, cy, r, r, 18, r * .03), { wash: TIRE, ink: INK, sw });
    for (const k of [0, 1]) { const a = ph * TAU + k * Math.PI / 2; inkLine([[cx + Math.cos(a) * r * .8, cy + Math.sin(a) * r * .8], [cx - Math.cos(a) * r * .8, cy - Math.sin(a) * r * .8]], sw * .6, '#8C84A0', 'inkfine', 0); }
    paint(ellPts(cx, cy, r * .42, r * .42, 12), { wash: '#D6D2DC', ink: INK, sw: sw * .5 });
  }
  // side view, facing right (flip for left). Ground centre at (x, y). o.driver(s) draws whoever sits in the seat.
  function kartSide(x, y, s, t, o = {}) {
    const sw = clamp(s / 13, .45, 1.6);
    if (!o.noShadow) paint(ellPts(x, y + .3 * s, 9.5 * s * (o.sx ?? 1), 1.1 * s, 18), { fill: INK, fillOp: 80, bleed: .2, tex: .3, border: .1, ink: null });
    push(); translate(x, y); if (o.rot) rotate(o.rot); scale((o.flip ? -1 : 1) * (o.sx ?? 1), 1);
    // antenna pennant, whipping back
    const fw = wob(t, 3.2) * .6, tp = [-8.9 * s, -10.6 * s];
    inkLine([[-6.4 * s, -4.3 * s], [-7.6 * s, -7.6 * s], tp], sw * .7, INK, 'inkfine', .5);
    paint([tp, [tp[0] - 3.2 * s, tp[1] + (1 + fw) * s], [tp[0] - .2 * s, tp[1] + 1.8 * s]], { wash: PAL.ochre, ink: INK, sw: sw * .5, curv: .2 });
    // spoiler
    paint([[-6.6 * s, -4.2 * s], [-7.1 * s, -5.8 * s], [-6.5 * s, -5.8 * s], [-6.0 * s, -4.2 * s]], { wash: TIRE, ink: null });
    paint(rrPts(-9.0 * s, -6.5 * s, 3.8 * s, .85 * s, .4 * s), { wash: PAL.rose, ink: INK, sw: sw * .7 });
    if (o.driver) o.driver(s);
    // steering wheel
    inkLine([[3.6 * s, -3.6 * s], [2.9 * s, -5.0 * s]], sw * 1.2, TIRE, 'ink', 0);
    paint(ellPts(2.8 * s, -5.2 * s, .38 * s, 1.05 * s, 14, 0, -.25), { ink: TIRE, sw: sw * 1.3 });
    // tub
    const tub = [[-7.7, -4.4], [-5.5, -4.5], [-4.9, -3.3], [2.4, -3.3], [3.4, -4.4], [5.6, -4.1], [8.0, -3.0], [8.8, -2.1], [8.3, -1.4], [-7.5, -1.4]].map(([a, b]) => [a * s, b * s]);
    paint(tub, { wash: KART, fill: KART_DK, fillOp: 70, bleed: .05, tex: .6, border: .5, ink: INK, sw });
    paint(rectPts(-7.4 * s, -3.0 * s, 15.6 * s, .5 * s), { wash: PAL.cream, ink: null });
    paint(ellPts(-1.2 * s, -2.35 * s, .72 * s, .72 * s, 14), { wash: PAL.cream, ink: INK, sw: sw * .5 });
    paint(starPts(-1.2 * s, -2.35 * s, .52 * s, .45, 5), { wash: PAL.rose, ink: null });
    paint(ellPts(8.1 * s, -2.55 * s, .45 * s, .42 * s, 10), { wash: '#F7D774', ink: INK, sw: sw * .5 });
    paint(rectPts(-8.6 * s, -2.55 * s, 1.3 * s, .6 * s), { wash: '#A9A3B6', ink: INK, sw: sw * .5 });
    wheel(-5.2 * s, -1.9 * s, 1.9 * s, o.wheel || 0, sw);
    wheel(5.6 * s, -1.55 * s, 1.55 * s, (o.wheel || 0) * 1.2, sw);
    pop();
  }
  // Clawd sitting in a side-view kart (call from kartSide's driver hook)
  const seatClawd = (extra = {}) => s => clawd(-1.3 * s, -1.4 * s, .62 * s, { noLegs: true, noShadow: true, aL: .5, aR: .25, ...extra });
  // front view, driving at the camera
  function kartFront(x, y, s, t, o = {}) {
    const sw = clamp(s / 13, .45, 1.6);
    paint(ellPts(x, y + .3 * s, 8.5 * s, 1.1 * s, 18), { fill: INK, fillOp: 80, bleed: .2, tex: .3, border: .1, ink: null });
    push(); translate(x, y); if (o.rot) rotate(o.rot);
    const fw = wob(t, 3.2) * .6;
    inkLine([[-4.8 * s, -4 * s], [-5.4 * s, -9 * s], [-6.4 * s, -11.2 * s]], sw * .7, INK, 'inkfine', .5);
    paint([[-6.4 * s, -11.2 * s], [-9.4 * s, (-10.6 + fw) * s], [-6.5 * s, -9.6 * s]], { wash: PAL.ochre, ink: INK, sw: sw * .5 });
    if (o.rider) o.rider(s);
    if (o.driver) o.driver(s);
    for (const sd of [-1, 1]) {
      paint(rrPts(sd > 0 ? 5.0 * s : -7.5 * s, -3.4 * s, 2.5 * s, 3.4 * s, .8 * s), { wash: TIRE, ink: INK, sw });
      for (let k = 0; k < 3; k++) { const yy = (-3.2 + ((k + (o.wheel || 0) * 3) % 3) * 1.05) * s; inkLine([[(sd > 0 ? 5.3 : -7.2) * s, yy], [(sd > 0 ? 7.2 : -5.3) * s, yy]], sw * .5, '#8C84A0', 'inkfine', 0); }
    }
    paint([[-5.9, -1.3], [5.9, -1.3], [5.4, -4.1], [2.9, -4.6], [-2.9, -4.6], [-5.4, -4.1]].map(([a, b]) => [a * s, b * s]), { wash: KART, fill: KART_DK, fillOp: 70, bleed: .05, tex: .6, border: .5, ink: INK, sw });
    paint(ellPts(0, -4.4 * s, 1.7 * s, .42 * s, 16, 0, o.steer || 0), { ink: TIRE, sw: sw * 1.4 });
    paint(rrPts(-4.7 * s, -2.1 * s, 9.4 * s, 1.0 * s, .45 * s), { wash: PAL.cream, ink: INK, sw: sw * .7 });
    for (const sd of [-1, 1]) {
      paint(ellPts(sd * 3.5 * s, -3.25 * s, .8 * s, .7 * s, 14), { wash: '#F7D774', fill: PAL.ochre, fillOp: 60, ink: INK, sw: sw * .6 });
      paint(ellPts(sd * 3.5 * s - .25 * s, -3.45 * s, .2 * s, .16 * s, 8), { wash: PAL.cream, ink: null });
    }
    pop();
  }

  // =====================================================================================
  // SHOT 1 · 73.0–77.5 · "Forward MLP, backward, repeat": the Clawds ARE the net
  // =====================================================================================
  const NET = [];
  [[3, 660], [4, 1050], [3, 1440]].forEach(([n, x], li) => { for (let i = 0; i < n; i++) NET.push({ li, x, y: 600 + (i - (n - 1) / 2) * 190, id: NET.length }); });
  const NU = 14, STEP = 42;
  const PASSES = [
    { d: 1, t0: B(107), st: BEAT / 2 }, { d: -1, t0: B(109), st: BEAT / 2 },
    { d: 1, t0: B(111), st: BEAT / 3 }, { d: -1, t0: B(112), st: BEAT / 3 }, { d: 1, t0: B(113), st: BEAT / 4 }
  ];
  const arrival = (P, li) => P.t0 + (P.d > 0 ? li : 2 - li) * P.st;
  function layerAt(t, li) {
    let pos = 0, prev = 0, at = -99, d = 0;
    for (const P of PASSES) { const a = arrival(P, li); if (a <= t) { prev = pos; pos = P.d > 0 ? 1 : 0; at = a; d = P.d; } }
    const age = t - at;
    return { x: lerp(prev, pos, backOut(clamp(age / .2))) * STEP, hop: -bell(age, 0, .24) * 1.6, land: bell(age, .2, .38) * .16, glow: at > 0 ? Math.exp(-age * 2.4) : 0, d, age };
  }
  const tutu = (u, sw) => {
    const P = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = i % 2 ? .9 : 1.12; P.push([Math.cos(a) * 6.4 * u * r, -2.6 * u + Math.sin(a) * 1.05 * u * r]); }
    paint(P, { wash: '#F5B3C4', fill: PAL.rose, fillOp: 80, tex: .5, border: .5, ink: INK, sw: sw * .55 });
  };
  function danceRoom(t) {
    paint(rectPts(-300, -300, W + 600, 1110), { wash: '#F2DDB8', washOp: 255, fill: '#E2B97F', fillOp: 70, bleed: .12, tex: .7, border: .4, ink: null });
    for (const wx of [250, 1830]) {           // tall arched windows spilling afternoon light
      const P = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; P.push([wx + Math.cos(a) * 120, 230 + Math.sin(a) * 120]); }
      P.push([wx + 120, 620], [wx - 120, 620]);
      paint(P, { wash: '#CFE6F2', fill: PAL.sky, fillOp: 90, tex: .5, ink: INK, sw: 1.1 });
      inkLine([[wx, 115], [wx, 620]], .8, INK, 'inkfine', 0); inkLine([[wx - 120, 400], [wx + 120, 400]], .8, INK, 'inkfine', 0);
      paint([[wx - 110, 150], [wx + 110, 150], [wx + 420, 800], [wx - 60, 800]], { fill: PAL.cream, fillOp: 60, bleed: .1, tex: .2, border: .1, ink: null });
    }
    paint(rectPts(-300, 690, W + 600, 110), { wash: '#D9B587', fill: '#B98A55', fillOp: 60, tex: .6, ink: INK, sw: 1 });   // wainscot
    inkLine([[-300, 640], [W + 300, 640]], 2.6, '#C9963F', 'ink', 0);                                                          // barre
    for (const bx of [120, 560, 1000, 1440, 1880]) inkLine([[bx, 640], [bx, 700]], 1.1, '#8E6A3A', 'ink', 0);
    paint([[-300, 800], [W + 300, 800], [W + 300, 1400], [-300, 1400]], { wash: '#D8A06A', fill: '#A8703E', fillOp: 60, tex: .7, border: .5, ink: INK, sw: 1.2 });
    for (let i = -6; i <= 6; i++) inkLine([[960 + i * 170, 802], [960 + i * 290, 1400]], .5, '#A8703E', 'inkfine', 0);
  }
  function mlp(t) {
    // the camera rides the pulse: right with the forward pass, back left with the error, then pulls wide for "repeat"
    const whip = seg(t, 77.28, 77.5);
    const [cx0, cy0, z0] = kf(t, [[73.2, [600, 578, 1.25]], [74.0, [1230, 578, 1.25]], [74.45, [1230, 578, 1.25]], [75.3, [600, 590, 1.28]], [75.55, [600, 590, 1.28]], [75.95, [960, 548, 1.0]]]);
    camBegin(cx0 + 1700 * easeIn(whip), cy0, z0 + .02 * pulse(t, 7) + .035 * seg(t, 75.95, 77.25), 0);
    danceRoom(t);
    // the conductor
    const RX = 240, RY = 905, RS = 23, f = frac(bpOf(t));
    const aR = f < .72 ? lerp(-.15, 1.25, ease(f / .72)) : lerp(1.25, -.15, easeIn((f - .72) / .28));
    const dyR = -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .3;
    const hand = [RX + RS * (1.75 + 3.2 * Math.cos(aR)), RY + dyR * RS + RS * (-7.6 - 3.2 * Math.sin(aR))];
    const tip = [hand[0] + RS * (3.4 * Math.cos(aR) - 1.0 * Math.sin(aR)), hand[1] + RS * (-3.4 * Math.sin(aR) - 1.0 * Math.cos(aR))];
    const L = [0, 1, 2].map(li => layerAt(t, li));
    const ctr = NET.map(n => [n.x + L[n.li].x, n.y + L[n.li].hop * NU - 5 * NU]);
    // links (ink lines) with travelling pulses
    for (let li = 0; li < 2; li++) for (const a of NET) if (a.li === li) for (const b of NET) if (b.li === li + 1) {
      const A = ctr[a.id], Bp = ctr[b.id];
      inkLine([A, Bp], .6, '#9A7B5C', 'inkfine', 0);
      for (const P of PASSES) {
        const w0 = P.t0 + (P.d > 0 ? li : 1 - li) * P.st, p = (t - w0) / P.st;
        if (p <= 0 || p >= 1.7) continue;
        const [S, D] = P.d > 0 ? [A, Bp] : [Bp, A], h = Math.min(1, p), tl = Math.max(0, p - .7), col = P.d > 0 ? '#E89B2A' : '#D9577A';
        inkLine([[lerp(S[0], D[0], tl), lerp(S[1], D[1], tl)], [lerp(S[0], D[0], h), lerp(S[1], D[1], h)]], 1.7, col, 'ink', 0);
        if (p < 1) paint(ellPts(lerp(S[0], D[0], h), lerp(S[1], D[1], h), 12, 12, 10), { wash: PAL.cream, fill: col, fillOp: 170, bleed: .3, ink: null });
      }
    }
    // baton → input layer (forward) and input layer → baton (backward error arrives at the conductor)
    for (const P of PASSES) {
      const col = P.d > 0 ? '#E89B2A' : '#D9577A';
      const p = P.d > 0 ? (t - (P.t0 - .2)) / .2 : (t - arrival(P, 0)) / (P.st * .8);
      if (p <= 0 || p >= 1.6) continue;
      for (const n of NET) if (n.li === 0) {
        const [S, D] = P.d > 0 ? [tip, ctr[n.id]] : [ctr[n.id], tip], h = Math.min(1, p), tl = Math.max(0, p - .6);
        inkLine([[lerp(S[0], D[0], tl), lerp(S[1], D[1], tl)], [lerp(S[0], D[0], h), lerp(S[1], D[1], h)]], 1.4, col, 'ink', 0);
      }
    }
    // node pads + dancers
    for (const n of NET) {
      const s = L[n.li], col = s.d > 0 ? '#F0B347' : '#E77796';
      paint(ellPts(n.x + STEP / 2, n.y + 5, 94, 14, 20), { wash: '#EBD6B4', fill: s.glow > .05 ? col : '#C9A57A', fillOp: 60 + 170 * s.glow, bleed: .15, tex: .4, ink: '#8A6A48', sw: .6 });
      if (s.glow > .05) paint(ellPts(ctr[n.id][0], ctr[n.id][1], 95, 80, 18), { fill: col, fillOp: 130 * s.glow, bleed: .3, tex: .3, border: .2, ink: null });
    }
    for (const n of NET) {
      const s = L[n.li], m = move('bounce', t, n.id), lit = s.glow > .32;
      clawd(n.x + s.x, n.y, NU, {
        dy: s.hop + m.dy * .35, sq: s.land + m.sq * .5, aL: lit ? .4 + 1.1 * s.glow : m.aL * .6, aR: lit ? .4 + 1.1 * s.glow : m.aR * .6,
        eyes: lit ? 'happy' : 'look', lookX: s.d || .7, lookY: -.2, mouth: lit ? 'grin' : 'smile', blush: lit, noShadow: true, seed: n.id, draw: tutu
      });
    }
    // output: stars pop out of the last layer on each forward arrival
    for (const P of PASSES) if (P.d > 0) for (const n of NET) if (n.li === 2) {
      const age = t - arrival(P, 2);
      if (age > 0 && age < .6) for (let k = 0; k < 2; k++) {
        const a = (k - .5) * .7 + (n.id - 8) * .25, d = 60 + 260 * easeOut(age / .6), r = 16 * (1 - age / .6);
        if (r > 2) paint(starPts(ctr[n.id][0] + Math.cos(a) * d, ctr[n.id][1] + Math.sin(a) * d, r), { wash: k ? PAL.cream : PAL.ochre, ink: INK, sw: .5 });
      }
    }
    // the conductor gets zapped when the backward pass reaches them
    let zap = 99; for (const P of PASSES) if (P.d < 0) { const za = t - (arrival(P, 0) + P.st * .8); if (za >= 0) zap = Math.min(zap, za); }
    const zk = zap < 1.2 ? Math.exp(-zap * 2.2) : 0;
    researcher(RX, RY, RS, {
      aR, aL: .35 + .5 * Math.sin(bpOf(t) * Math.PI) + zk * .8, dy: dyR - zk * .6, hairUp: zk, glassesTilt: zk * .35 * Math.sin(t * 30),
      eyes: zap < .45 ? 'star' : 'closed', mouth: zap < .6 ? 'O' : 'smile', brows: zap < .45 ? 'up' : null, blush: zap > .6,
      handR: (s, sw) => { inkLine([[0, 0], [3.4 * s, -1.0 * s]], sw * 1.2, INK, 'ink', 0); paint(ellPts(3.4 * s, -1.0 * s, .3 * s, .3 * s, 8), { wash: PAL.cream, ink: null }); }
    });
    if (zap < .5) sparkleBurst(RX, RY - 14 * RS, zap, 7, 110, PAL.rose, .5);
    camEnd();
    streaks(whip, false, ['#F2DDB8', PAL.ochre, '#D9A06A']);
  }

  // =====================================================================================
  // SHOT 2 · 77.5–81.0 · "Now von Neumann's obsolete": the museum
  // =====================================================================================
  const TADA = B(115), PUFF = B(116), THROW = B(117) - .14, LAND = B(117) + .26, SPIDER = B(118);
  const TUBES = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) TUBES.push({ x: 915 + c * 54, y: 330 + r * 118, off: TADA + .3 + r * .17 + hash(r * 5 + c) * .12 });
  function museumRoom(t) {
    paint(rectPts(-300, -300, W + 600, 1110), { wash: '#EAD4AC', washOp: 255, fill: '#CFAE78', fillOp: 80, bleed: .12, tex: .8, border: .5, ink: null });
    paint([[-100, -100], [420, -100], [1200, 800], [300, 800]], { fill: PAL.cream, fillOp: 70, bleed: .1, tex: .2, border: .1, ink: null });
    for (let i = 0; i < 9; i++) { const ph = (t * .08 + hash(i)) % 1; paint(ellPts(200 + hash(i + 3) * 700 + ph * 200, 100 + ph * 650, 3, 3, 6), { wash: PAL.cream, ink: null }); }
    // a framed abacus portrait, just for the museum mood
    paint(rrPts(1470, 150, 260, 200, 8), { wash: '#E0B64F', fill: '#A8792C', fillOp: 90, tex: .6, ink: INK, sw: 1.1 });
    paint(rectPts(1498, 178, 204, 144), { wash: '#6E5A48', ink: INK, sw: .6 });
    for (let r = 0; r < 4; r++) { inkLine([[1505, 200 + r * 32], [1695, 200 + r * 32]], .5, '#C9B28A', 'inkfine', 0); for (let b = 0; b < 4; b++) paint(ellPts(1525 + ((b * 29 + r * 47) % 150), 200 + r * 32, 9, 8, 8), { wash: [PAL.rose, PAL.ochre, PAL.teal][(b + r) % 3], ink: null }); }
    paint(rectPts(-300, 690, W + 600, 110), { wash: '#C9A270', fill: '#9C7446', fillOp: 60, tex: .6, ink: INK, sw: 1 });
    paint([[-300, 800], [W + 300, 800], [W + 300, 1400], [-300, 1400]], { wash: '#B98A5C', fill: '#7C4A2C', fillOp: 50, tex: .7, border: .5, ink: INK, sw: 1.2 });
    for (let i = -7; i <= 7; i++) inkLine([[960 + i * 150, 802], [960 + i * 260, 1400]], .5, '#7C4A2C', 'inkfine', 0);
  }
  function oldMachine(t) {
    const dying = seg(t, TADA + .25, PUFF), dead = t >= PUFF, shake = (t > TADA + .25 && t < PUFF + .3) ? 4 : 0;
    push(); translate(jit(shake), 0);
    if (!dead) paint(ellPts(700, 470, 620, 330, 22), { fill: '#F6B24F', fillOp: 90 * (1 - dying), bleed: .3, tex: .3, border: .2, ink: null });
    const cab = '#8E9A7E', cabDk = '#5E6A55';
    for (let i = 0; i < 3; i++) paint(rectPts(220 + i * 320, 240, 320, 560, 2), { wash: cab, fill: cabDk, fillOp: 70, tex: .7, border: .5, ink: INK, sw: 1.3 });
    // three big crown tubes on top, the last lights to go out
    for (const [i, tx] of [[0, 630], [1, 700], [2, 770]]) {
      const on = t < PUFF - .12 + i * .05, h = i === 1 ? 118 : 96;
      if (on) paint(ellPts(tx, 222 - h * .55, 46, h * .7, 14), { fill: '#FFB347', fillOp: 110, bleed: .3, ink: null });
      paint(rrPts(tx - 22, 222 - h, 44, h + 4, 20), { wash: on ? '#FFE8B8' : '#B8B3AE', fill: on ? '#F58A3A' : '#8E8A96', fillOp: on ? 150 : 60, bleed: .15, tex: .4, ink: INK, sw: .9 });
      if (on) inkLine([[tx - 8, 214], [tx - 7, 222 - h * .6], [tx + 7, 222 - h * .6], [tx + 8, 214]], .8, '#C8324A', 'inkfine', .2);
    }
    paint(rectPts(205, 222, 990, 30, 2), { wash: '#C8A24A', ink: INK, sw: 1 });
    // reel-to-reel tapes, slowing to a stop
    const tau = clamp(t - (TADA + .25), 0, .7), ang = t < TADA + .25 ? t * 5 : (TADA + .25) * 5 + 5 * (tau - tau * tau / 1.4);
    inkLine([[315, 330], [380, 420], [445, 330]], .9, '#4A3428', 'inkfine', .3);
    for (const rx of [315, 445]) {
      paint(ellPts(rx, 330, 62, 62, 22), { wash: '#6A4A3A', fill: '#3A2A22', fillOp: 70, ink: INK, sw: 1 });
      for (let k = 0; k < 3; k++) { const a = ang + k * TAU / 3; paint(ellPts(rx + Math.cos(a) * 32, 330 + Math.sin(a) * 32, 13, 13, 10), { wash: '#D9C9A8', ink: null }); }
      paint(ellPts(rx, 330, 10, 10, 10), { wash: '#C8A24A', ink: INK, sw: .5 });
    }
    paint(rectPts(360, 408, 40, 24), { wash: '#C9CED6', ink: INK, sw: .6 });
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
      const on = !dead && hash(i * 4 + j + Math.floor(t * 6)) > .45 * (1 + dying);
      paint(ellPts(270 + j * 60, 520 + i * 60, 11, 11, 10), { wash: on ? [PAL.ochre, PAL.rose, '#9FE0C8'][(i + j) % 3] : '#5B5460', ink: INK, sw: .5 });
    }
    // dial "eyes": needles swing on the beat, glance at the newcomer, then droop
    const look = seg(t, TADA, TADA + .2), droop = seg(t, PUFF, PUFF + .3);
    for (const [dx, side] of [[640, -1], [800, 1]]) {
      paint(ellPts(dx, 390, 64, 64, 24), { wash: '#FFF3DA', fill: '#E8D3A6', fillOp: 60, ink: INK, sw: 1.3 });
      for (let k = 0; k < 7; k++) { const a = Math.PI * (1.1 + k * .13); inkLine([[dx + Math.cos(a) * 48, 390 + Math.sin(a) * 48], [dx + Math.cos(a) * 58, 390 + Math.sin(a) * 58]], .6, INK, 'inkfine', 0); }
      let a = -Math.PI / 2 + .55 * Math.sin(bpOf(t) * Math.PI);
      a = lerp(a, -Math.PI / 2 + .9, look);
      a = lerp(a, Math.PI / 2 - side * .75, droop);
      inkLine([[dx, 390], [dx + Math.cos(a) * 50, 390 + Math.sin(a) * 50]], 1.6, '#C8324A', 'ink', 0);
      paint(ellPts(dx, 390, 7, 7, 8), { wash: INK, ink: null });
    }
    for (let k = 0; k < 7; k++) {                         // lamp row "mouth"
      const on = !dead && (t < TADA ? (k + Math.floor(t * 8)) % 3 !== 0 : k > dying * 7);
      paint(ellPts(600 + k * 40, 505 - (dead ? Math.sin(k / 6 * Math.PI) * -14 : 0), 12, 12, 10), { wash: on ? [PAL.rose, PAL.ochre, '#9FE0C8'][k % 3] : '#5B5460', ink: INK, sw: .5 });
    }
    for (let i = 0; i < 3; i++) paint(rectPts(590 + i * 90, 600, 60, 150), { wash: '#7D8A6E', ink: INK, sw: .7 });
    // vacuum tubes, popping out one by one
    for (const tb of TUBES) {
      const on = t < tb.off, pop = t - tb.off;
      paint(rectPts(tb.x - 17, tb.y + 16, 34, 20), { wash: '#3C3A44', ink: INK, sw: .6 });
      paint(rrPts(tb.x - 16, tb.y - 58, 32, 76, 15), { wash: on ? '#FFE3A8' : '#B8B3AE', fill: on ? '#F58A3A' : '#8E8A96', fillOp: on ? 150 : 60, bleed: .15, tex: .4, ink: INK, sw: .7 });
      if (on) { paint(ellPts(tb.x, tb.y - 20, 30, 44, 12), { fill: '#FFB347', fillOp: 90, bleed: .3, ink: null }); inkLine([[tb.x - 6, tb.y + 8], [tb.x - 5, tb.y - 30], [tb.x + 5, tb.y - 30], [tb.x + 6, tb.y + 8]], .7, '#C8324A', 'inkfine', .2); }
      if (pop > 0 && pop < .25) puff(tb.x, tb.y - 60 - pop * 120, 10 + pop * 60, 150 * (1 - pop / .25), '#B7AEBF');
    }
    pop();
    // the final sigh: a big puff of smoke
  }
  function smoke(sa) {
    if (sa <= 0 || sa > 1.6) return;
    for (let i = 0; i < 7; i++) {
      const a = sa - i * .035; if (a <= 0) continue;
      const R = ((70 + hash(i + 1) * 60) * easeOut(clamp(a / .3)) + a * 50) * (1 - ease(seg(a, .9, 1.55)));
      if (R < 4) continue;
      const x = 330 + i * 125 + Math.sin(i * 2.3) * 40 + a * 30 * Math.sin(i), y = 235 - a * 130 - hash(i) * 40;
      paint(puffPts(x, y, R, R * .78, i * 1.7, 30), { wash: i % 2 ? '#B9AEC2' : '#D6CEDC', fill: '#8E82A0', fillOp: 70, bleed: .1, tex: .5, border: .4, ink: INK, sw: .75 });
    }
  }
  function sheetShape(t) {
    // 26 points: top edge left→right (lumpy over the tapes / dials / tubes), then the hem right→left
    const top = [], hem = [], NT = 26;
    for (let i = 0; i <= NT; i++) {
      const x = lerp(196, 1204, i / NT), bump = Math.max(...[[630, 96], [700, 118], [770, 96]].map(([tx, h]) => (h + 8) * Math.exp(-Math.pow((x - tx) / 30, 2))));
      top.push([x, 226 - bump - 4 * Math.sin(i * 1.9)]);
    }
    for (let i = 0; i <= 12; i++) { const x = lerp(1250, 150, i / 12); hem.push([x, 806 + 10 * Math.sin(i * 1.7)]); }
    const drape = [[160, 330], ...top, [1240, 330]].concat(hem);
    const k = seg(t, THROW, LAND);
    if (k >= 1) { const settle = 1 - seg(t, LAND, LAND + .2); return drape.map(([x, y], i) => [x, y - (i <= NT + 2 ? settle * 26 * Math.sin(settle * 5) : 0)]); }
    // in flight: a bunched cloth that unfurls along an arc from the guide to the machine
    const c = arcPt([1650, 560], [700, 470], 380, easeOut(k)), sc = lerp(.12, 1, easeIn(k)), rot = (1 - k) * 1.4;
    return drape.map(([x, y], i) => {
      const lx = (x - 700) * sc, ly = (y - 515) * sc * (1 - .5 * (1 - k)) + Math.sin(i * .9 + t * 30) * 30 * (1 - k);
      const fx = c[0] + lx * Math.cos(rot) - ly * Math.sin(rot), fy = c[1] + lx * Math.sin(rot) + ly * Math.cos(rot);
      const b = easeIn(k) * easeIn(k);
      return [lerp(fx, x, b), lerp(fy, y, b)];
    });
  }
  function spider(x, y, t, sz) {
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
      const a = (k - 1.5) * .45 + Math.sin(t * 16 + k) * .15, bx = x + s * sz * .6, by = y + (k - 1.5) * sz * .25;
      inkLine([[bx, by], [bx + s * sz * 1.1 * Math.cos(a), by - sz * .7], [bx + s * sz * 1.8, by + sz * .5 * (k - 1.2)]], .9, INK, 'inkfine', .2);
    }
    paint(ellPts(x, y, sz, sz * .9, 16), { wash: INK, fill: PAL.violet, fillOp: 50, ink: INK, sw: .8 });
    for (const s of [-1, 1]) { paint(ellPts(x + s * sz * .35, y - sz * .1, sz * .26, sz * .3, 10), { wash: PAL.cream, ink: null }); paint(ellPts(x + s * sz * .32, y - sz * .02, sz * .12, sz * .15, 8), { wash: INK, ink: null }); }
    inkLine([[x - sz * .25, y + sz * .38], [x, y + sz * .5], [x + sz * .25, y + sz * .38]], .7, PAL.cream, 'inkfine', .5);
  }
  function museum(t) {
    const arrive = 1 - easeOut(seg(t, 77.5, 77.74)), sp = ease(seg(t, SPIDER - .15, 81));
    const cx = lerp(930 - 1500 * arrive + 50 * ease(seg(t, 78, 79)) - 50 * ease(seg(t, 79.6, 80.4)), 720, sp);
    const zoom = lerp(.97 + .03 * ease(seg(t, 77.6, 80.5)), 1.32, sp);
    const [sx, sy] = t > PUFF && t < PUFF + .35 ? shakeXY(t, 8) : [0, 0];
    camBegin(cx + sx, lerp(540, 330, sp) + sy, zoom, 0);
    museumRoom(t);
    if (t < LAND) oldMachine(t);
    // the newcomer, wheeled in on a plinth by the guide
    const gx = lerp(2150, 1680, easeOut(seg(t, 77.5, 78.35))), px = gx - 250, walking = t < 78.35;
    const tada = seg(t, TADA - .05, TADA + .15), throwK = bell(t, THROW - .25, THROW + .25);
    if (t > TADA) paint([[px - 70, -100], [px + 70, -100], [px + 190, 820], [px - 190, 820]], { fill: PAL.cream, fillOp: 95 * seg(t, TADA, TADA + .15), bleed: .1, tex: .2, border: .1, ink: null });
    paint(rectPts(px - 110, 780, 220, 22), { wash: '#6B5E70', ink: INK, sw: .8 });
    for (const wx of [-80, 80]) paint(ellPts(px + wx, 806, 13, 13, 10), { wash: TIRE, ink: INK, sw: .6 });
    paint(rectPts(px - 84, 640, 168, 140, 2), { wash: '#F1ECE4', fill: '#C9C0D6', fillOp: 70, tex: .6, ink: INK, sw: 1 });
    paint(rectPts(px - 100, 626, 200, 20, 1), { wash: '#E4DCEB', ink: INK, sw: .8 });
    const nm = move('idle', t, 3);
    clawd(px, 626, 21, {
      ...mood(t, [[77, 'shades'], [TADA + .2, 'happy', 'spark']]), mouth: 'grin', dy: nm.dy - bell(t, TADA - .05, TADA + .3) * 1.2, aL: .2 + 1.1 * tada, aR: .2 + 1.1 * tada, noShadow: true,
      col: '#E4835E', lt: '#FFD0B8',
      draw: (u, sw) => { paint([[-3.8 * u, -8 * u], [-2.6 * u, -8 * u], [-4.6 * u, -2 * u], [-5 * u, -2.6 * u]], { wash: '#FFF6EA', washOp: 170, ink: null }); }
    });
    if (t > TADA) for (let i = 0; i < 5; i++) { const a = t * 1.5 + i * TAU / 5, r = 12 + 6 * Math.sin(t * 9 + i); paint(starPts(px + Math.cos(a) * 150, 530 + Math.sin(a) * 60, r), { wash: i % 2 ? PAL.cream : PAL.ochre, ink: INK, sw: .5 }); }
    sparkleBurst(px, 530, t - TADA, 8, 200, PAL.ochre, .5);
    const gm = move('walk', t, 1);
    clawd(gx, 805, 17, {
      walk: walking ? gm.walk : null, dy: walking ? gm.dy : -bell(t, TADA - .1, TADA + .2) * .8 - throwK * .6,
      aL: walking ? 0 : lerp(lerp(.1, 1.0, tada * (1 - seg(t, 79.2, 79.6))), 1.5, throwK), aR: t > THROW - .3 ? lerp(.9, 1.5, throwK) : 1.2 + .15 * Math.sin(t * 4),
      eyes: t > PUFF + .2 && t < THROW - .2 ? 'closed' : 'happy', mouth: 'smile', hat: 'bowtie', seed: 5,
      armR: (u, sw) => { inkLine([[0, 0], [.6 * u, -3.8 * u]], sw * .9, INK, 'ink', 0); paint([[.55 * u, -3.8 * u], [2.8 * u, -3.3 * u + Math.sin(t * 9) * .3 * u], [.6 * u, -2.6 * u]], { wash: PAL.rose, ink: INK, sw: sw * .5 }); }
    });
    // the dust sheet
    if (t >= THROW) {
      const S = sheetShape(t);
      if (t >= LAND) { paint(rectPts(180, 700, 1080, 110), { fill: INK, fillOp: 50, bleed: .2, tex: .3, ink: null }); }
      paint(S, { wash: '#F4EEDF', fill: '#B9AFC9', fillOp: 90, bleed: .08, tex: .6, border: .6, ink: INK, sw: 1.3, curv: .25 });
      if (t >= LAND) {
        for (const rx of [315, 445]) inkLine(ellPts(rx, 330, 58, 56, 16).concat([[rx + 58, 330]]), .6, '#B3A8C4', 'inkfine', .5);
        for (const dx of [640, 800]) inkLine(ellPts(dx, 390, 60, 58, 16).concat([[dx + 60, 390]]), .6, '#B3A8C4', 'inkfine', .5);
        for (const fx of [300, 560, 880, 1110]) inkLine([[fx, 300], [fx - 30, 560], [fx - 60 + (fx % 3) * 20, 800]], .6, '#8E86A0', 'inkfine', .5);
        const la = t - LAND; for (let i = 0; i < 5; i++) puff(160 + i * 270, 800 - la * 60, 30 + la * 120, 130 * clamp(1 - la / .6), '#E6D8BE');
      }
    }
    smoke(t - PUFF);
    // spider on a thread, boinging onto the middle bump
    if (t >= SPIDER) {
      const k = t - SPIDER, y = lerp(-160, 42, elasticOut(clamp(k / .5)));
      inkLine([[700, -300], [700, y]], .6, INK, 'inkfine', 0);
      spider(700, y + 30, t, 30);
    }
    // velvet rope in front
    for (const [x0, x1] of [[120, 700], [700, 1280]]) inkLine(spline([[x0, 790], [lerp(x0, x1, .5), 850], [x1, 790]], 6), 3.2, '#9E2438', 'ink', .5);
    for (const sx of [120, 700, 1280]) { paint(rectPts(sx - 7, 780, 14, 150), { wash: '#D8AE45', ink: INK, sw: .8 }); paint(ellPts(sx, 776, 16, 16, 10), { wash: '#E8C35A', ink: INK, sw: .8 }); paint(ellPts(sx, 930, 40, 12, 12), { wash: '#B98F35', ink: INK, sw: .8 }); }
    camEnd();
    streaks(arrive, false, ['#F2DDB8', PAL.ochre, '#D9A06A']);
    streaks(seg(t, 80.93, 81.0) * .75, false, ['#F2DDB8', '#F5B06E', PAL.rose]);
  }

  // =====================================================================================
  // SHOT 3 · 81.0–85.0 · "Sharp left turn and there you are"
  // =====================================================================================
  const ROAD = spline([[1236, 470], [1266, 490], [1196, 522], [968, 562], [814, 612], [836, 668], [1000, 728], [1106, 790], [1122, 850]], 5);
  const hwY = y => 3 + Math.max(0, y - 468) * .44;
  const YANK = B(121), LANDR = B(122), BACK = B(123);
  const SKID = spline([[1150, 860], [1170, 920], [1080, 950], [800, 956], [300, 958], [-900, 955]], 6);
  function desert(t, horizon, x0, x1) {
    sky(x0, x1, horizon - 430, horizon + 20, SUNSET);
    paint(ellPts(560, horizon - 60, 140, 140, 26), { wash: '#FBE3A0', fill: '#F4B25A', fillOp: 90, bleed: .2, ink: null });
    for (const [mx, w, h, c] of [[250, 420, 90, '#B8708A'], [760, 300, 60, '#A8627E'], [1530, 520, 110, '#B8708A'], [2100, 400, 80, '#A8627E'], [-400, 500, 100, '#A8627E']])
      paint([[mx - w / 2, horizon + 4], [mx - w * .36, horizon - h], [mx + w * .38, horizon - h - 6], [mx + w / 2, horizon + 4]], { wash: c, fill: '#7B5CA8', fillOp: 60, tex: .5, ink: INK, sw: .8 });
    paint([[x0, horizon], [x1, horizon], [x1, 1500], [x0, 1500]], { wash: '#EDBE7C', fill: '#D98E4E', fillOp: 70, bleed: .1, tex: .8, border: .5, ink: INK, sw: 1 });
    paint(rectPts(x0, horizon - 4, x1 - x0, 44, 4), { fill: PAL.cream, fillOp: 90, bleed: .2, tex: .3, ink: null });
  }
  function cactus(x, y, s) {
    const g = '#5E9A5A', gd = '#3E6E44', sw = clamp(s, .5, 1.2);
    paint(rrPts(x - 18 * s, y - 170 * s, 36 * s, 170 * s, 17 * s), { wash: g, fill: gd, fillOp: 60, tex: .6, ink: INK, sw });
    paint([[x - 16 * s, y - 80 * s], [x - 56 * s, y - 80 * s], [x - 56 * s, y - 130 * s], [x - 38 * s, y - 130 * s], [x - 38 * s, y - 100 * s], [x - 16 * s, y - 100 * s]], { wash: g, ink: INK, sw, curv: .3 });
    paint([[x + 16 * s, y - 100 * s], [x + 50 * s, y - 100 * s], [x + 50 * s, y - 150 * s], [x + 32 * s, y - 150 * s], [x + 32 * s, y - 120 * s], [x + 16 * s, y - 120 * s]], { wash: g, ink: INK, sw, curv: .3 });
  }
  function roadSign(x, y, t, boing) {
    const r = 92 * (1 + .18 * boing), cy = y - 300, rot = .12 * boing * Math.sin(t * 40);
    paint(rectPts(x - 7, cy, 14, 300), { wash: '#8C8FA0', ink: INK, sw: .8 });
    push(); translate(x, cy); rotate(rot);
    paint([[0, -r], [r, 0], [0, r], [-r, 0]], { wash: '#F2C53D', fill: PAL.ochre, fillOp: 60, tex: .5, ink: INK, sw: 1.4 });
    paint([[0, -r * .86], [r * .86, 0], [0, r * .86], [-r * .86, 0]], { ink: INK, sw: .7 });
    const hp = []; hp.push([r * .22, r * .45]); for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; hp.push([r * .02 + Math.cos(a) * r * .2, -r * .15 - Math.sin(a) * r * .2]); } hp.push([-r * .18, r * .15]);
    inkLine(hp, 3.2, INK, 'ink', .4);
    paint([[-r * .34, r * .1], [-r * .02, r * .1], [-r * .18, r * .38]], { wash: INK, ink: null });
    pop();
  }
  function road(t) {
    const whipK = seg(t, YANK, YANK + .28), tilt = easeIn(seg(t, 84.52, 85.0));
    const kk = lerp(.1, 1, Math.pow(seg(t, 81.0, YANK), 1.2)), K = along(ROAD, kk);
    const post = ease(seg(t, YANK, YANK + .4)), cx = lerp(lerp(1030, K[0], .22), 440, easeOut(whipK) * .6 + ease(whipK) * .4), cy = lerp(560, 690, post) - 1450 * tilt;
    const [shx, shy] = t > LANDR && t < LANDR + .2 ? shakeXY(t, 10) : [0, 0];
    camBegin(cx + shx, cy + shy, lerp(1 + .08 * seg(t, 81, YANK), 1.2, post), 0);
    desert(t, 468, -1400, 3000);
    cactus(210, 640, .7); cactus(1720, 690, 1.0); cactus(1880, 560, .45); cactus(-300, 720, 1.1); cactus(620, 530, .35);
    // road: the approach snakes in from the horizon, then the hairpin swings left across the foreground
    const rc = '#7A6680', rcd = '#5A4A66';
    paint([[-1500, 760], [980, 758], [1210, 770], [1330, 840], [1350, 940], [1270, 1050], [1100, 1120], [-1500, 1120]], { wash: rc, fill: rcd, fillOp: 60, bleed: .05, tex: .6, border: .4, ink: null });
    paint(tube(ROAD, (i, n, p) => hwY(p[1]) * 2), { wash: rc, fill: rcd, fillOp: 60, bleed: .05, tex: .6, border: .4, ink: null });
    inkLine([[-1500, 760], [930, 758]], .9, INK, 'inkfine', 0);
    inkLine([[1210, 770], [1330, 840], [1350, 940], [1270, 1050], [1100, 1120]], .9, INK, 'inkfine', .5);
    for (let i = 0; i < 22; i++) { const a = along(ROAD, i / 22), b = along(ROAD, i / 22 + .018), w = hwY(a[1]) * .04 + .3; inkLine([[a[0], a[1]], [b[0], b[1]]], w, '#F4D58A', 'ink', 0); }
    for (let x = -1400; x < 1000; x += 160) inkLine([[x, 935], [x + 80, 935]], 1.6, '#F4D58A', 'ink', 0);
    roadSign(1440, 780, t, t > B(120) ? Math.exp(-(t - B(120)) * 4) : 0);
    // skid marks, laid down behind the kart
    const kx = t < YANK ? 9999 : lerp(1080, -1000, easeIn(seg(t, YANK, YANK + .55)));
    if (t > YANK) for (const off of [-20, 26]) { const pts = SKID.filter(p => p[0] >= kx).map(([x, y]) => [x, y + off]); if (pts.length > 1) inkLine(pts, 2.4, '#3E3040', 'ink', .4); }
    // dust kicked up through the turn
    for (let i = 0; i < 12; i++) {
      const ts = YANK + i * .045, age = t - ts; if (age < 0) continue;
      const px = lerp(1080, -1000, easeIn(seg(ts, YANK, YANK + .55)));
      puff(px + 60 + hash(i) * 40, 925 - age * 80 - hash(i + 2) * 40, 40 + age * 150, 170 * clamp(1 - age / 1.4));
    }
    // --- the kart ---
    const dazed = t > LANDR;
    if (t < YANK) for (let i = 6; i >= 1; i--) { const p = along(ROAD, kk - i * .022); if (kk - i * .022 > 0) puff(p[0], p[1] - hwY(p[1]) * .3, Math.max(8, hwY(p[1]) * (.28 + i * .07)), 130 - i * 16); }
    if (t < YANK) {
      const s = Math.max(1.3, hwY(K[1]) / 8), sign = t > B(120);
      kartFront(K[0] + Math.sin(t * 7) * s * .5, K[1] + s * .8, s, t, {
        rot: Math.sin(t * 5) * .04 + (t > YANK - .12 ? -.18 * seg(t, YANK - .12, YANK) : 0), wheel: t * 3, steer: t > YANK - .12 ? -.9 : Math.sin(t * 5) * .2,
        driver: s2 => clawd(0, -1.9 * s2, .72 * s2, { noLegs: true, noShadow: true, aL: -1.1, aR: -1.1, ...mood(t, [[80, 'happy'], [B(120) + .05, 'narrow']]), mouth: 'grin', dy: -Math.abs(Math.sin(t * 9)) * .15 }),
        rider: s2 => researcher(2.7 * s2, -3.4 * s2, .5 * s2, { noShadow: true, aL: 1.0 + .5 * Math.sin(t * 13), aR: 1.3 + .4 * Math.sin(t * 11 + 1), hairUp: 1, eyes: sign ? 'wide' : 'dot', mouth: sign ? 'O' : 'wobble', brows: 'worried' })
      });
    } else if (t < YANK + .6) {
      const s = 17, x = lerp(1080, -1000, easeIn(seg(t, YANK, YANK + .55)));
      kartSide(x, 940, s, t, { flip: true, rot: .16 * bell(t, YANK, YANK + .5), wheel: t * 5, driver: seatClawd({ eyes: 'narrow', mouth: 'grin', aR: .9 }) });
    }
    if (t > YANK) sfx('SKRRT!', lerp(1000, 760, post), 640, 160, '#E0445A', t - YANK, { life: .72, rot: -.12, stroke: PAL.cream });
    // the kart comes back around: "there you are"
    if (t > BACK - .3) {
      const x = lerp(-800, 150, easeOut(seg(t, BACK - .3, BACK + .05)));
      kartSide(x, 945, 17, t, { rot: -.08 * bell(t, BACK - .05, BACK + .25), wheel: t * 4 * (1 - seg(t, BACK, BACK + .1)), driver: seatClawd({ ...mood(t, [[BACK - .3, 'narrow'], [BACK + .1, 'wink', 'music']]), mouth: 'grin', aL: 1.1 + .4 * Math.sin(t * 14), aR: .3 }) });
    }
    // the Researcher: flung, airborne, landing upright in the road, dazed
    if (t >= YANK) {
      const RS = 20, P0 = [1160, 700], P1 = [480, 910];
      if (t < LANDR) {
        const k = seg(t, YANK, LANDR), p = arcPt(P0, P1, 1100, k);
        researcher(p[0], p[1], RS * .9, { noShadow: true, rot: k * TAU * 1.5, aL: 1.2 + .6 * Math.sin(t * 25), aR: 1.2 + .6 * Math.sin(t * 23 + 2), run: t * 4, eyes: 'wide', mouth: 'O', hairUp: 1, brows: 'worried' });
      } else {
        const a = t - LANDR, sq = .28 * Math.exp(-a * 6) * Math.cos(a * 22), sway = Math.sin(t * 5) * .08 * (1 - seg(t, BACK + .2, BACK + .6));
        const look = t > BACK - .05;
        researcher(P1[0], P1[1], RS, {
          sq, rot: sway, aL: -1.0 + .2 * Math.sin(t * 5), aR: -1.0 - .2 * Math.sin(t * 5), hairUp: .8 * Math.exp(-a * 1.5), glassesTilt: .25,
          eyes: look && t > BACK + .35 ? 'look' : 'swirl', lookX: -1, mouth: look && t > BACK + .35 ? 'flat' : 'wobble', emote: t > BACK + .35 ? 'sweat' : null, emoteK: seg(t, BACK + .35, BACK + .6)
        });
        if (!look || t < BACK + .35) for (let i = 0; i < 3; i++) { const an = t * 7 + i * TAU / 3; paint(starPts(P1[0] + Math.cos(an) * 60, P1[1] - 15 * RS + Math.sin(an) * 16, 12, .45, 5), { wash: PAL.ochre, ink: INK, sw: .5 }); }
        if (a < .25) for (const sd of [-1, 1]) puff(P1[0] + sd * (50 + a * 300), P1[1] - 10, 30 + a * 100, 160 * (1 - a / .25));
      }
    }
    camEnd();
    streaks(bell(t, YANK + .02, YANK + .3) * .8, false, ['#EDBE7C', PAL.rose, PAL.cream]);
    streaks((1 - seg(t, 81.0, 81.13)) * .75, false, ['#F5B06E', '#EE8E84', PAL.cream]);
    streaks(seg(t, 84.78, 85.0), true, ['#EE8E84', '#C8699A', PAL.cream]);
  }

  // =====================================================================================
  // SHOT 4 · 85.0–88.0 · "Without a single CDR": the cloud guards sleep through it all
  // =====================================================================================
  const CLOUDS = [
    { x: 250, y: 250, r: 190, seed: 1, lamp: 1, sway: .5 }, { x: 720, y: 200, r: 165, seed: 2, bino: 1 },
    { x: 1215, y: 262, r: 210, seed: 3, lamp: 1, roller: 1 }, { x: 1690, y: 210, r: 180, seed: 4, bino: 1, lamp: -1, sway: .3 },
    { x: 470, y: -270, r: 150, seed: 5 }, { x: 1450, y: -300, r: 160, seed: 6, bino: 1 }
  ];
  const ROLL = B(127) + .12, EXIT = B(128) + .05, GY = 668;
  function guardCap(r, sw) {
    paint([[-r * .34, -r * .02], [-r * .4, -r * .2], [r * .4, -r * .22], [r * .34, -r * .02]], { wash: '#2F3C7A', fill: PAL.indigo, fillOp: 60, ink: INK, sw });
    paint(rectPts(-r * .34, -r * .06, r * .68, r * .08), { wash: '#1F2550', ink: null });
    paint([[-r * .3, r * .02], [r * .38, r * .02], [r * .2, r * .09], [-r * .2, r * .09]], { wash: '#1F2550', ink: INK, sw: sw * .7 });
    paint(starPts(0, -r * .13, r * .065, .45, 5), { wash: '#F2C53D', ink: INK, sw: .4 });
  }
  function cloudGuard(C, t) {
    const roll = C.roller ? ease(seg(t, ROLL, ROLL + .55)) : 0, rot = -Math.PI * roll - .15 * bell(t, ROLL + .4, ROLL + .8), capFall = C.roller ? t - (ROLL + .3) : -1;
    const br = 1 + .04 * Math.sin(t * 1.9 + C.seed * 2), r = C.r;
    const lx = (C.lamp || 1) * r * .92, ly = r * .32;
    const Lw = [C.x + lx * Math.cos(rot) - ly * Math.sin(rot), C.y + lx * Math.sin(rot) + ly * Math.cos(rot)];
    const droop = Math.PI / 2 - .18 * (C.lamp || 1) + (C.sway || .2) * Math.sin(t * .8 + C.seed) * (C.lamp || 1);
    const aim = C.roller ? lerp(droop, -Math.PI / 2 - .25, roll) : droop;
    // searchlight beam drooping to the sand (world space, behind the cloud)
    if (C.lamp) {
      const L = [Lw[0] + Math.cos(aim) * r * .14, Lw[1] + Math.sin(aim) * r * .14];
      const Dd = Math.sin(aim) > .2 ? (GY - L[1]) / Math.sin(aim) : 900, E = [L[0] + Math.cos(aim) * Dd, L[1] + Math.sin(aim) * Dd], nx = -Math.sin(aim), ny = Math.cos(aim);
      const wE = 115 + 20 * Math.sin(t * 2 + C.seed);
      paint([[L[0] - nx * 16, L[1] - ny * 16], [L[0] + nx * 16, L[1] + ny * 16], [E[0] + nx * wE, E[1] + ny * wE], [E[0] - nx * wE, E[1] - ny * wE]], { wash: '#FFF3C4', washOp: 90, fill: '#FFF8DC', fillOp: 60, bleed: .12, tex: .2, border: .15, ink: null });
      if (Math.sin(aim) > .2) paint(ellPts(E[0], GY + 8, wE * 1.15, 30, 18), { wash: '#FFF6D2', washOp: 150, fill: '#FFFBE6', fillOp: 80, bleed: .2, ink: null });
    }
    push(); translate(C.x, C.y); rotate(rot); scale(br, 1 / br);
    const sw = 1.1;
    paint(puffPts(0, 0, r, r * .56, C.seed), { wash: '#FFF7EC', washOp: 255, ink: null });
    paint(ellPts(r * .05, r * .2, r * .9, r * .2, 18), { fill: '#C9A3CF', fillOp: 110, bleed: .25, tex: .4, border: .3, ink: null });
    paint(ellPts(r * .3, -r * .35, r * .45, r * .16, 16), { fill: '#F5C08A', fillOp: 80, bleed: .25, ink: null });
    paint(puffPts(0, 0, r, r * .56, C.seed), { ink: INK, sw });
    // sleepy face
    const mumble = C.roller && roll > .02 && roll < .98;
    for (const s of [-1, 1]) inkLine(mumble ? [[s * r * .26 - r * .09, r * .04], [s * r * .26 + r * .09, -r * .02]] : [[s * r * .26 - r * .09, 0], [s * r * .26, r * .06], [s * r * .26 + r * .09, 0]], sw * 1.1, INK, 'ink', .6);
    for (const s of [-1, 1]) paint(ellPts(s * r * .44, r * .12, r * .09, r * .05, 10), { fill: PAL.rose, fillOp: 150, bleed: .2, ink: null });
    const sn = .6 + .4 * Math.sin(t * 1.9 + C.seed * 2);
    if (mumble) inkLine([[-r * .1, r * .17], [-r * .04, r * .13], [r * .02, r * .19], [r * .08, r * .14], [r * .12, r * .18]], sw * .8, INK, 'ink', .3);
    else paint(ellPts(0, r * .17, r * .045 * sn + r * .02, r * .05 * sn + r * .02, 10), { wash: '#6A2A35', ink: null });
    if (!C.roller) { const bb = (t * .55 + C.seed * .3) % 1; if (bb < .8) paint(ellPts(r * .08 + bb * r * .1, r * .23 + bb * r * .08, r * (.03 + bb * .09), r * (.03 + bb * .09), 12), { wash: '#DDEFF6', washOp: 170, ink: INK, sw: .4 }); }
    // guard cap, askew (the roller's slides down over one eye)
    if (capFall < 0) { push(); translate(-r * .05, -r * .5); rotate(-.18 - roll * .6); guardCap(r, sw); pop(); }
    if (C.bino) {
      inkLine([[-r * .3, r * .02], [-r * .12, r * .3]], .6, INK, 'inkfine', .3); inkLine([[r * .3, r * .02], [r * .12, r * .3]], .6, INK, 'inkfine', .3);
      for (const s of [-1, 1]) paint(rrPts(s * r * .1 - r * .06, r * .26, r * .12, r * .16, r * .04), { wash: '#3B3550', ink: INK, sw: .7 });
    }
    if (C.lamp) {
      paint(ellPts(lx - C.lamp * r * .05, r * .2, r * .13, r * .1, 12), { wash: '#FFF7EC', ink: INK, sw: .8 });
      push(); translate(lx, ly); rotate(aim - rot - Math.PI / 2);
      paint(rrPts(-r * .08, -r * .12, r * .16, r * .2, r * .03), { wash: '#8C8FA0', ink: INK, sw: .8 });
      paint(ellPts(0, r * .09, r * .09, r * .04, 10), { wash: '#FFF1B8', ink: INK, sw: .5 });
      pop();
    }
    pop();
    // the roller's cap tumbles off and lands upside down in the sand
    if (capFall >= 0) {
      const r0 = -Math.PI * ease(seg(ROLL + .3, ROLL, ROLL + .55)), lx0 = -r * .05, ly0 = -r * .5;
      const x0 = C.x + lx0 * Math.cos(r0) - ly0 * Math.sin(r0), y0 = C.y + lx0 * Math.sin(r0) + ly0 * Math.cos(r0), yL = GY + 12;
      const aL = (200 + Math.sqrt(40000 + 5200 * (yL - y0))) / 2600, a = Math.min(capFall, aL), bo = capFall > aL ? 14 * Math.exp(-(capFall - aL) * 9) * Math.abs(Math.sin((capFall - aL) * 18)) : 0;
      push(); translate(x0 + 150 * a, Math.min(yL, y0 - 200 * a + 1300 * a * a) - bo); rotate(lerp(r0 - .18 - .34, -Math.PI + .15, easeOut(clamp(a / aL)))); guardCap(r, 1.1); pop();
    }
    // zzz, drifting up (the roller stops snoring while it turns over)
    if (!mumble) for (let i = 0; i < 2; i++) {
      const ph = (t * .75 + C.seed * .37 + i * .5) % 1, zx = C.x + r * .55 + ph * 60 + Math.sin(ph * 6 + C.seed) * 14, zy = C.y - r * .45 - ph * 150;
      letter('z', zx, zy, r * (.2 + ph * .18), PAL.cream, { alpha: Math.sin(ph * Math.PI), rot: -.2 + ph * .3 });
    }
  }
  // donut path: clockwise on screen, running right along the near side
  const DC = [960, 805], DRX = 430, DRY = 84, DTH = t => 2.1766 - 5.2 * (t - 85);
  function donut(t) { const th = DTH(t); return [DC[0] + DRX * Math.cos(th), DC[1] + DRY * Math.sin(th), th]; }
  function cdr(t) {
    const cy = lerp(-250, 540, easeOut(seg(t, 85.0, 86.0))), cx = 960 + 300 * ease(seg(t, EXIT, 88.05));
    const honks = [B(126), B(127), B(128) - .2], hk = Math.max(...honks.map(h => t >= h ? Math.exp(-(t - h) * 8) : 0));
    const [shx, shy] = shakeXY(t, 5 * hk);
    camBegin(cx + shx, cy + shy, 1.02 + .08 * seg(t, 85.8, 88) + .015 * hk, 0);
    sky(-1400, 3400, 0, 620, SUNSET);
    paint(ellPts(1480, 575, 130, 130, 26), { wash: '#FBE3A0', fill: '#F4B25A', fillOp: 90, bleed: .2, ink: null });
    for (const [mx, w, h, c] of [[160, 520, 80, '#B8708A'], [900, 380, 55, '#A8627E'], [1650, 600, 95, '#B8708A'], [2400, 500, 60, '#A8627E'], [-600, 500, 70, '#A8627E']])
      paint([[mx - w / 2, 606], [mx - w * .36, 600 - h], [mx + w * .38, 594 - h], [mx + w / 2, 606]], { wash: c, fill: '#7B5CA8', fillOp: 60, tex: .5, ink: INK, sw: .8 });
    paint([[-1400, 600], [3400, 600], [3400, 1500], [-1400, 1500]], { wash: '#EDBE7C', fill: '#D98E4E', fillOp: 70, bleed: .1, tex: .8, border: .5, ink: INK, sw: 1 });
    paint(rectPts(-1400, 596, 4800, 40, 4), { fill: PAL.cream, fillOp: 90, bleed: .2, tex: .3, ink: null });
    paint([[-1400, 700], [3400, 706], [3400, 910], [-1400, 904]], { wash: '#7A6680', fill: '#5A4A66', fillOp: 60, tex: .6, ink: INK, sw: .8 });
    for (let x = -1400; x < 3400; x += 170) if (Math.abs(x + 40 - 960) > 520) inkLine([[x, 805], [x + 80, 805]], 1.4, '#F4D58A', 'ink', 0);
    cactus(90, 690, .6); cactus(1850, 680, .66);
    // skid rings from the donuts, darker as the laps pile up
    const laps = clamp((t - 85.3) / 2);
    for (const [o, w] of [[0, 2.2], [16, 1.6], [-14, 1.2]]) if (laps > .05) inkLine(ellPts(DC[0], DC[1] + o * .25, DRX + o, DRY + o * .25, 32), w * laps, '#3E2E44', 'ink', .5);
    for (const C of CLOUDS) cloudGuard(C, t);
    // the kart: donuts around the dazed Researcher, then it breaks out along the near side and snatches them
    const out = t > EXIT, [dx, dy, th] = donut(Math.min(t, EXIT)), ex = out ? dx + 1900 * Math.pow(t - EXIT, 1.4) : dx, ey = dy;
    const facing = out ? 1 : Math.sin(th), far = !out && Math.sin(th) < 0;
    const RX = DC[0], RY = 815, RS = 19, KS = 15 * (1 + .09 * (out ? 1 : Math.sin(th)));
    // dust trail
    if (!out) for (let i = 1; i < 9; i++) { const a = th + i * .3; puff(DC[0] + DRX * Math.cos(a), DC[1] + DRY * Math.sin(a) - 12, 24 + i * 6, 150 - i * 15); }
    else for (let i = 0; i < 7; i++) { const a = t - EXIT - i * .05; if (a > 0) puff(dx + 1900 * Math.pow(a, 1.4) - 90, dy - 14 - i * 3, 32 + i * 9, 160 - i * 20); }
    const kart = () => kartSide(ex, ey, KS, t, {
      flip: facing < 0, sx: out ? 1 : Math.max(.35, Math.abs(facing)), rot: -.1 * facing, wheel: t * 6,
      driver: seatClawd({ eyes: hk > .3 ? 'happy' : 'narrow', mouth: hk > .3 ? 'O' : 'grin', aL: .5 + 1.0 * hk, dy: -hk * .6 })
    });
    const grabbed = t > EXIT + .06;
    if (far) kart();
    if (!grabbed) {
      const sway = Math.sin(t * 4.5) * .1, flinch = hk;
      researcher(RX, RY, RS, { rot: sway, sq: flinch * .1, aL: -1 + flinch * 2.1, aR: -1 + flinch * 2.1, hairUp: .4 + flinch * .6, glassesTilt: .25, eyes: 'swirl', mouth: flinch > .3 ? 'O' : 'wobble' });
      for (let i = 0; i < 3; i++) { const an = t * 7 + i * TAU / 3; paint(starPts(RX + Math.cos(an) * 65, RY - 14.5 * RS + Math.sin(an) * 16, 12, .45, 5), { wash: PAL.ochre, ink: INK, sw: .5 }); }
    } else {
      hangR(ex - 6.6 * KS, ey - 4.8 * KS, RS * .8, 1.94 + .12 * Math.sin(t * 22), { aR: 1.0 + .6 * Math.sin(t * 19), run: t * 5, eyes: 'wide', mouth: 'O', hairUp: 1, brows: 'worried' });
      const a = t - EXIT - .06; if (a < .4) puff(RX, RY - 90, 60 + a * 200, 200 * (1 - a / .4), PAL.cream);
    }
    if (!far) kart();
    // honks: notes fly off the horn
    for (const h of honks) { const a = t - h; if (a > 0 && a < .7) { emote('music', ex + 70 * facing + a * 60 * facing, ey - 130 - a * 120, 13, seg(a, 0, .15) * (1 - seg(a, .5, .7))); emote('!', ex - 40 * facing, ey - 150 - a * 60, 12, seg(a, 0, .12) * (1 - seg(a, .45, .7))); } }
    sfx('HONK!', donut(honks[0])[0] - 40, 610, 140, '#F2C53D', t - honks[0], { life: .9, rot: .1, stroke: INK });
    camEnd();
    flushLetters();
    streaks(1 - seg(t, 85.0, 85.22), true, ['#EE8E84', '#C8699A', PAL.cream]);
    streaks(seg(t, 87.85, 88.0) * .8, false, ['#EDBE7C', PAL.rose, PAL.cream]);
  }

  // =====================================================================================
  // SHOT 5 · 88.0–94.3 · the cliff: race to the edge, the catch, Gato, the laser dot, the pounce
  // =====================================================================================
  const STOP = B(130), CATCH = B(130) + .36, POOF = B(131), DOT0 = B(132), POUNCE = B(137), DROP = POUNCE + .32;
  const KX = t => t < 88.5 ? lerp(-380, 400, (t - 88.0) / .5) : 400 + 160 * easeOut(seg(t, 88.5, STOP));
  const CU = 12.4, RS5 = 9.3, EDGE = [1062, 600], LAND5 = [820, 600];
  const GCATCH = [1188, 648];
  const DOTS = [[DOT0, [905, 596]], [B(133), [1138, 712]], [B(134), [640, 548]], [B(135), 'R'], [B(136), [985, 597]], [POUNCE, [820, 597]]];
  function slipAt(t) { let n = 0; for (let b = 132; b <= 136; b++) if (t >= B(b)) n++; return n; }
  function grip(t) {                        // where the Researcher's hand is (the world anchor they hang from)
    if (t < CATCH) return null;
    const n = slipAt(t), lastB = n ? B(131 + n) : CATCH, jerk = t - lastB;
    const catchBounce = 42 * Math.exp(-(t - CATCH) * 6) * Math.sin((t - CATCH) * 20);
    let y = GCATCH[1] + n * 18 + (n ? 12 * Math.exp(-jerk * 9) * Math.sin(jerk * 30) : 0) + catchBounce, x = GCATCH[0] + n * 1.5;
    if (t > DROP) y += .5 * 5200 * (t - DROP) * (t - DROP);
    return [x, y];
  }
  function hangAngle(t) {
    const a = t - CATCH, n = slipAt(t), jerk = n ? t - B(131 + n) : 9;
    return .37 + .45 * Math.exp(-a * 1.4) * Math.sin(a * 6.5) + .07 * Math.exp(-jerk * 4) * Math.sin(jerk * 14) + (t > DROP ? -.3 * seg(t, DROP, DROP + .3) : 0);
  }
  function dotAt(t, rPos) {
    if (t < DOT0 || t > POUNCE + .5) return null;
    let i = 0; while (i + 1 < DOTS.length && t >= DOTS[i + 1][0]) i++;
    const P = k => DOTS[k][1] === 'R' ? rPos : DOTS[k][1];
    const cur = P(i), prev = i ? P(i - 1) : cur, z = easeOut(clamp((t - DOTS[i][0]) / .12));
    const wig = i === DOTS.length - 1 ? 0 : 9;
    return [lerp(prev[0], cur[0], z) + Math.sin(t * 17) * wig, lerp(prev[1], cur[1], z) + Math.cos(t * 13) * wig * .5, z];
  }
  // big round cat eyes whose pupils chase the dot (drawn in the body-space draw hook)
  function huntEyes(lx, ly, dil) {
    return (u, sw) => {
      for (const ex of [-2.5, 2.5]) {
        const cx = ex * u, cy = -6 * u, px = cx + lx * .5 * u, py = cy + ly * .55 * u;
        paint(ellPts(cx, cy, 1.2 * u, 1.35 * u, 16), { wash: PAL.cream, ink: INK, sw: sw * .7 });
        paint(ellPts(px, py, (.5 + .28 * dil) * u, (.68 + .22 * dil) * u, 12), { wash: INK, ink: null });
        paint(ellPts(px - .25 * u, py - .32 * u, .2 * u, .22 * u, 8), { wash: PAL.cream, ink: null });
      }
    };
  }
  function cliffWorld(t) {
    sky(-900, 2900, -300, 640, DUSK);
    for (let i = 0; i < 16; i++) { const sx = -700 + hash(i + 70) * 3400, sy = -260 + hash(i + 90) * 730, tw = .5 + .5 * Math.sin(t * 3 + i * 1.7); paint(starPts(sx, sy, 5 + 5 * tw, .42, 4), { wash: '#FFE9B8', washOp: 110 + 130 * tw, ink: null }); }
    paint(ellPts(380, 230, 120, 120, 24), { fill: '#B79AD0', fillOp: 70, bleed: .3, tex: .2, ink: null });
    paint(ellPts(380, 230, 66, 66, 22), { wash: '#FFF1D0', fill: '#F5D9A8', fillOp: 70, bleed: .15, ink: INK, sw: .6 });
    for (const [a, b, r] of [[-18, -12, 12], [20, 14, 9], [8, -28, 6]]) paint(ellPts(380 + a, 230 + b, r, r, 10), { fill: '#D8BFA0', fillOp: 90, bleed: .2, ink: null });
    for (const [mx, w, h, c] of [[-200, 600, 80, '#6A58A0'], [600, 420, 55, '#5E4E96'], [1560, 640, 80, '#6A58A0'], [2300, 500, 65, '#5E4E96']])
      paint([[mx - w / 2, 610], [mx - w * .36, 600 - h], [mx + w * .38, 594 - h], [mx + w / 2, 610]], { wash: c, fill: '#4A3A80', fillOp: 50, tex: .5, ink: INK, sw: .7 });
    // the chasm: dark and deep, glowing from far below
    paint([[1100, 590], [2900, 590], [2900, 2000], [1100, 2000]], { wash: '#231A3E', fill: '#1A1433', fillOp: 90, tex: .6, ink: null });
    const gl = .85 + .15 * Math.sin(t * 3);
    paint(ellPts(1480, 1000, 580, 430, 24), { fill: '#8A3A86', fillOp: 170 * gl, bleed: .3, tex: .3, border: .2, ink: null });
    const GLOW = ['#9A3E88', '#C8487E', '#E0607A', '#F08A6A', '#F6B070', '#FFE6A0'];
    GLOW.forEach((c, i) => { const k = 1 - i / GLOW.length; paint(ellPts(1480, 910 + 80 * k, 120 + 330 * k, 55 + 200 * k, 22), { wash: c, washOp: (95 + 25 * i) * gl, fill: c, fillOp: 60, bleed: .3, tex: .25, border: .3, ink: null }); });
    for (let i = 0; i < 12; i++) { const ph = (t * .35 + hash(i + 40)) % 1, mx = 1200 + hash(i + 3) * 600 + Math.sin(t * 2 + i) * 16, my = 1000 - ph * 560; paint(ellPts(mx, my, 6, 6, 8), { wash: i % 2 ? '#FFE08A' : '#9FE0C8', washOp: 255 * Math.sin(ph * Math.PI), ink: null }); }
    // far wall
    paint([[1880, 640], [1960, 626], [2200, 646], [2900, 640], [2900, 2000], [1820, 2000], [1890, 1050], [1840, 860], [1900, 740]], { wash: '#4A3466', fill: '#E0508A', fillOp: 45, bleed: .1, tex: .7, border: .4, ink: INK, sw: 1.1 });
    // the plateau and its cliff face (mauve rock, lit pink from the glow below)
    const face = [[1150, 600], [1132, 690], [1168, 780], [1122, 880], [1158, 1000], [1128, 1150], [1150, 2000]];
    paint([[-1200, 600], ...face, [-1200, 2000]], { wash: '#7E4A5C', fill: '#4E2A44', fillOp: 70, bleed: .06, tex: .8, border: .5, ink: null });
    for (const [y, c] of [[700, '#6E3E56'], [820, '#8A5268'], [960, '#5E344E'], [1100, '#7A4660']]) paint([[-1200, y], [1150, y + 10], [1140, y + 60], [-1200, y + 55]], { fill: c, fillOp: 90, bleed: .15, tex: .6, ink: null });
    paint(tube(face, 70, 110).slice(0, face.length).concat([[1040, 1900], [1040, 600]]), { fill: '#F07A9A', fillOp: 95, bleed: .2, tex: .4, ink: null });
    paint([[-1200, 588], [1154, 592], [1150, 630], [-1200, 634]], { wash: '#B07A7E', fill: '#8E5A6A', fillOp: 60, tex: .6, ink: null });
    inkLine([[-1200, 590], [1150, 594], ...face.slice(1)], 1.4, INK, 'ink', .2);
    for (const [rx, rr] of [[250, 26], [470, 18], [1000, 14]]) paint(ellPts(rx, 592, rr, rr * .6, 12), { wash: '#6A4A5A', ink: INK, sw: .6 });
  }
  function cliff(t) {
    // camera: wide for the arrival, then a push in onto the edge
    const push = ease(seg(t, CATCH - .15, POOF + .25)), pan = ease(seg(t, POUNCE, POUNCE + .4));
    const follow = Math.max(KX(Math.min(t, STOP)) + 360, 520);
    const cx = lerp(follow, 1090, push) - 120 * pan, cy = lerp(478, 640, push) - 25 * pan, zoom = lerp(1.3, 1.8, push) - .22 * pan + .02 * pulse(t, 7) * push;
    const [shx, shy] = t > STOP - .02 && t < STOP + .18 ? shakeXY(t, 9) : [0, 0];
    camBegin(cx + shx, cy + shy, zoom, 0);
    cliffWorld(t);
    // --- kart arrival and hard stop ---
    const kx = KX(t), braking = seg(t, 88.5, STOP), krot = kf(t, [[88.5, 0], [88.72, .12], [STOP + .08, -.06], [STOP + .3, 0]]);
    if (t > 88.45) for (let i = 0; i < 9; i++) { const ts = 88.5 + i * .04, a = t - ts; if (a > 0 && ts < STOP) puff(KX(ts) + 150, 590 - a * 70 - hash(i) * 20, 25 + a * 120, 180 * clamp(1 - a / 1.1)); }
    if (t < 88.52) for (let i = 0; i < 4; i++) inkLine([[kx - 250 - i * 90, 470 + i * 38], [kx - 420 - i * 90, 470 + i * 38]], 1, '#F2A869', 'ink', 0);
    const inKart = t < STOP;
    kartSide(kx, 600, 20, t, { rot: krot, wheel: t < STOP ? t * 5 * (1 - braking * .9) : STOP * 5, driver: inKart ? seatClawd({ eyes: braking > .1 ? 'scared' : 'narrow', mouth: braking > .1 ? 'O' : 'grin', aR: .3 }) : null });
    // --- the Researcher ---
    const rear = [kx - 6.8 * 20, 600 - 5.2 * 20];
    let G, th;
    if (t < STOP) { G = rear; th = 1.94 + .12 * Math.sin(t * 24) + (t > 88.5 ? Math.PI * easeIn(braking) : 0); }
    else if (t < CATCH) { const k = seg(t, STOP, CATCH); G = arcPt([KX(STOP) - 6.8 * 20, 496], [GCATCH[0], GCATCH[1] + 30], 300, easeOut(k)); th = lerp(1.94 + Math.PI, .37 + TAU, easeOut(k)); }
    else { G = grip(t); th = hangAngle(t); }
    const coyote = t > POUNCE && t < DROP, falling = t >= DROP;
    const dz = mood(t, [[CATCH, 'wide'], [DOT0 + .3, 'wide', 'sweat'], [B(135) + .05, 'wide', 'sweat'], [POUNCE + .05, 'dot'], [DROP, 'wide']]);
    const rOpts = {
      eyes: coyote ? (t > POUNCE + .17 ? 'dot' : 'look') : dz.eyes, lookY: 1, squint: dz.squint,
      mouth: coyote ? 'flat' : falling ? 'O' : t < CATCH ? 'O' : 'wobble', brows: coyote ? null : 'worried', hairUp: coyote ? .2 : 1,
      aR: coyote ? -1.1 : 1.0 + .5 * Math.sin(t * 17), run: coyote ? null : t * (t < CATCH ? 4 : 2.2)
    };
    const rPos = G ? hangPt(G[0], G[1], RS5, th, 0, -6) : [0, 0];
    const dot = dotAt(t, rPos);
    const dotOnR = dot && t >= B(135) && t < B(136);
    if (G && G[1] < 1400) hangR(G[0], G[1], RS5, th, rOpts);
    if (G && !falling && t > DOT0 + .3) emote('sweat', rPos[0] + 40, rPos[1] - 75, 9, dz.emoteK);
    // --- Clawd: leaps out, catches, becomes Gato, gets distracted, pounces ---
    const ears = backOut(seg(t, POOF, POOF + .3));
    let cx5 = EDGE[0], cy5 = EDGE[1], co = { seed: 2 };
    if (t < STOP) { /* still in the kart */ }
    else {
      if (t < STOP + .22) { const k = seg(t, STOP, STOP + .22), p = arcPt([KX(STOP) - 26, 572], EDGE, 130, k); cx5 = p[0]; cy5 = p[1]; co.sq = -.2 * bell(t, STOP, STOP + .22); co.aL = 1.2; co.aR = 1.2; }
      const m = mood(t, [[STOP, 'scared'], [CATCH + .05, 'happy', 'sweat'], [POOF + .02, 'happy', 'spark'], [DOT0 + .02, 'look', '!'], [POUNCE + .36, 'happy', 'heart'], [POUNCE + .55, 'scared', '!']]);
      Object.assign(co, m);
      const d = dot ? [dot[0], dot[1]] : null;
      const eye = [cx5, cy5 - 6 * CU];
      if (co.eyes === 'look') {
        const lx = d ? clamp((d[0] - eye[0]) / 160, -1, 1) : 0, ly = d ? clamp((d[1] - eye[1]) / 110, -1, 1) : 0;
        co.eyes = 'hunt'; co.draw = huntEyes(lx, ly, seg(t, DOT0, B(136)));
      }
      co.perk = t > DOT0 ? .8 : 0;
      if (t >= CATCH && t < POUNCE) {
        co.rot = d ? clamp((d[0] - eye[0]) / 900, -1, 1) * .12 : 0;
        const wig = seg(t, B(136) + .1, POUNCE);
        if (wig > 0) { co.sq = .16 * wig; co.dy = .25 * wig; co.rot += .09 * wig * Math.sin(t * 38); co.twitch = wig; }
        co.aR = -1.35; co.aL = .3 + .3 * Math.sin(t * 3);
        if (t > POOF + .3) co.tailHz = 2.4;
      }
      if (t >= POUNCE) {
        const k = seg(t, POUNCE, POUNCE + .34), p = arcPt(EDGE, LAND5, 95, easeOut(k));
        cx5 = p[0]; cy5 = p[1];
        const land = t - (POUNCE + .34);
        co.sq = k < 1 ? -.22 * bell(t, POUNCE, POUNCE + .34) : .28 * Math.exp(-land * 7) * Math.cos(land * 20);
        co.rot = k < 1 ? -.35 * bell(t, POUNCE, POUNCE + .34) : 0; co.aL = k < 1 ? 1.3 : -.5; co.aR = k < 1 ? 1.3 : -.5;
        if (t > POUNCE + .55) { co.lookX = 1; co.aL = .9; co.aR = .9; }
      }
    }
    // the rubber arm and paw holding the Researcher's hand
    const holding = t >= CATCH - .06 && t < POUNCE + .02;
    if (t >= STOP) {
      gato(cx5, cy5, CU, t, { ...co, ears });
      if (holding && G) {
        const sh = cPt(cx5, cy5, CU, co, 4.7, -4.6), reach = seg(t, CATCH - .12, CATCH), g = [lerp(sh[0] + 10, G[0], reach), lerp(sh[1] + 10, G[1] - 6, reach)];
        const mid = [(sh[0] + g[0]) / 2 + 26, (sh[1] + g[1]) / 2 - 8];
        paint(tube(spline([sh, mid, g], 4), CU * 1.05, CU * .95), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 50, tex: .5, ink: INK, sw: .75 });
        // the paw lets go one finger per beat, down to a lone pinky
        const n = slipAt(t), fingers = Math.max(1, 4 - n), jk = n ? t - B(131 + n) : 9;
        paint(ellPts(g[0] + 1, g[1] - 11, CU * .95, CU * .7, 14), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 40, ink: INK, sw: .75 });
        for (let i = 0; i < fingers; i++) {
          const fx = g[0] + (i - (fingers - 1) / 2) * CU * .55 + (4 - fingers) * CU * .18, fy = g[1] - 1 + (fingers === 1 ? Math.sin(t * 40) : 0);
          paint(ellPts(fx, fy, CU * .26, CU * .42, 10), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 40, ink: INK, sw: .55 });
        }
        if (jk < .35) { const a = 1 - jk / .35; for (const k of [-1, 0, 1]) inkLine([[g[0] + k * CU * .7, g[1] - CU * 1.7], [g[0] + k * CU * .7, g[1] - CU * 1.7 - 26 * a]], .3 + .9 * a, INK, 'inkfine', 0); }
      }
    }
    // the laser dot
    if (dot) {
      const on = t < POUNCE + .45, a = on ? 1 : 0;
      if (a) {
        paint(ellPts(dot[0], dot[1], 26, 20, 16), { fill: '#FF2F4A', fillOp: 160, bleed: .35, ink: null });
        paint(ellPts(dot[0], dot[1], 9, 8, 12), { wash: '#FF5A6A', ink: INK, sw: .35 });
        paint(ellPts(dot[0] - 2.5, dot[1] - 2.5, 3, 3, 6), { wash: PAL.cream, ink: null });
      }
      if (dot[2] < 1) inkLine([[lerp(dot[0], dot[0] - 40, 1 - dot[2]), dot[1]], [dot[0], dot[1]]], 1.2, '#FF2F4A', 'inkfine', 0);
    }
    // poof: the cat ears arrive in a puff of sparkles
    if (t > POOF - .02) { const a = t - POOF; for (let i = 0; i < 5; i++) puff(cx5 + Math.cos(i * 1.3) * 60, cy5 - 8 * CU + Math.sin(i * 1.3) * 25 - a * 40, 25 + a * 90, 170 * clamp(1 - a / .5), i % 2 ? PAL.cream : '#F5C3D2'); sparkleBurst(cx5, cy5 - 9 * CU, a, 7, 95, PAL.rose, .5); }
    camEnd();
    streaks(1 - seg(t, 88.0, 88.14), false, ['#EDBE7C', PAL.rose, PAL.cream]);
  }

  // =====================================================================================
  // SHOT 6 · 94.3–95.4 · the long fall into the glowing chasm, iris to black
  // =====================================================================================
  function fall(t, lt) {
    const k = seg(t, 94.3, 95.3), CX = 960, CY = 530, zoom = 1 + .35 * easeIn(k);
    // looking straight down the crevasse: jagged rock rings, dark near us, glowing toward the core
    const RING = ['#2A1F3E', '#3A2A4E', '#4E3260', '#6A3A6E', '#8E4474', '#C0527E', '#E97A7A', '#F6A868', '#FFD27A'];
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: RING[0], washOp: 255, ink: null });
    for (let i = 1; i < RING.length; i++) {
      const R = 1250 * Math.pow(.7, i) * zoom, rot = (i % 2 ? 1 : -1) * lt * (.15 + i * .05), n = 22;
      const ox = (hash(i * 13) - .5) * 60 * (1 - i / RING.length), oy = (hash(i * 7) - .5) * 40 * (1 - i / RING.length);
      const P = [];
      for (let j = 0; j < n; j++) {
        const a = j / n * TAU + rot, jag = 1 + (hash(i * 31 + j * 3.7) - .5) * .32;
        P.push([CX + ox + Math.cos(a) * R * jag, CY + oy + Math.sin(a) * R * 1.3 * jag]);
      }
      paint(P, { wash: RING[i], fill: mixCol(RING[i], '#1A1433', .35), fillOp: 70, bleed: .08, tex: .8, border: .5, ink: i < 6 ? INK : null, sw: 1.1 - i * .12 });
    }
    paint(ellPts(CX, CY, 60 * zoom, 80 * zoom, 16), { fill: '#FFF3C8', fillOp: 220, bleed: .3, ink: null });
    // speed lines converging on the core
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + hash(i * 5) * .4, ph = (lt * 1.6 + hash(i * 9)) % 1, r0 = 1200 * (1 - ph), r1 = r0 * .72;
      inkLine([[CX + Math.cos(a) * r0, CY + Math.sin(a) * r0 * 1.3], [CX + Math.cos(a) * r1, CY + Math.sin(a) * r1 * 1.3]], 2.2 * (1 - ph) + .3, i % 2 ? '#F6A868' : PAL.cream, 'ink', 0);
    }
    // pebbles falling alongside
    for (let i = 0; i < 6; i++) {
      const a = hash(i * 11) * TAU, d = (300 + hash(i * 17) * 300) * (1 - easeOut(k)), s = (22 + hash(i) * 16) * Math.pow(.12, k);
      paint(ellPts(CX + Math.cos(a) * d, CY - 60 + Math.sin(a) * d, s, s * .75, 8, s * .15, lt * 5 + i), { wash: '#5E344E', ink: INK, sw: .5 });
    }
    // the Researcher tumbling away, shrinking toward the glow
    const s = 15 * Math.pow(.1, k), px = lerp(1010, CX + 2, easeOut(k)), py = lerp(430, CY - 10, easeOut(k));
    researcher(px, py + 6.6 * s, s, {
      noShadow: true, rot: lt * 9, aL: 1.2 + .8 * Math.sin(t * 22), aR: 1.0 + .8 * Math.sin(t * 19 + 1), run: t * 5, hairUp: 1, eyes: 'wide', mouth: 'O', brows: 'worried',
      draw: lt > .12 ? (s2, sw) => { paint(ellPts(0, -10.55 * s2, 1.95 * s2, .95 * s2, 16), { wash: SKIN, ink: null }); for (const sd of [-1, 1]) paint(ellPts(sd * s2, -10.55 * s2, .3 * s2, .36 * s2, 8), { wash: INK, ink: null }); } : null
    });
    // the glasses fly off and flutter back up past the camera
    if (lt > .12) {
      const g = lt - .12, gx = px + g * 700, gy = py - g * 520, gs = 1 + g * 3.2, gr = g * 7;
      push(); translate(gx, gy); rotate(gr); scale(gs);
      for (const sd of [-1, 1]) paint(ellPts(sd * 16, 0, 13, 12, 14), { wash: '#FFFFFF', washOp: 90, ink: INK, sw: .8 });
      inkLine([[-4, 0], [4, 0]], .8, INK, 'inkfine', 0);
      pop();
    }
    // darkness closes in
    const r = lerp(1300, 0, easeIn(seg(t, 94.62, 95.33)));
    iris(px, py, r, PAL.night);
    if (t > 95.3) flash(1, PAL.night);
  }

  chapter('obsolete', 73.0, 95.4, [[73.0, mlp], [77.5, museum], [81.0, road], [85.0, cdr], [88.0, cliff], [94.3, fall]]);
})();
