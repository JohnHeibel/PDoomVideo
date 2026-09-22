// c06_chorus3.js: Chorus 3, "Paperclips" (95.4–109.4). Steel-grey and silver clips on the warm stage,
// killswitch guys on a beach, the paperclip planet, the fuse, BOOM, then the smoky-blue jazz-club blues.
(() => {
  // ---------- palette ----------
  const STL = '#8E99A8', STL_DK = '#5B6579', STL_LT = '#C4CCD7', SILV = '#EEF2F6', CINK = '#343B4A';
  const SEA = '#A9B3C1', SEA_DK = '#6E798C', SEA_LT = '#D6DDE6';
  const VINYL = ['#F29BB0', '#F5CD5F', '#7DCBC3', '#B89CE2'];
  const STAGE = { a: '#A6B3C5', b: '#F0C28E', wall: '#ECE6DC', spots: [[470, PAL.cream], [1150, '#F8D99C']] };
  STAGE.backdrop = t => { paint(rectPts(-400, -400, W + 800, 1240), { wash: STAGE.wall, washOp: 255, ink: null }); sunburst(960, 430, STAGE.a, STAGE.b, t * .12, 16, 1300); };
  const bt = n => OFF + n * BEAT;                  // time of beat n
  const LAND = bt(141), BOOM_T = bt(154);          // 96.37 plop, 105.24 boom
  const sq2 = x => x * x;

  // ---------- paths ----------
  function densify(ctrl, per = 8) {
    const out = [];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const s = k / per, s2 = s * s, s3 = s2 * s;
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * s + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * s2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * s3)));
      }
    }
    out.push(ctrl[ctrl.length - 1].slice());
    return out;
  }
  function cumLen(p) { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; }
  function pointAt(p, c, u) {
    const s = clamp(u) * c[c.length - 1]; let i = 1;
    while (i < c.length - 1 && c[i] < s) i++;
    const k = clamp((s - c[i - 1]) / ((c[i] - c[i - 1]) || 1));
    return [lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k), i];
  }
  function subPath(p, c, u0, u1) {
    const a = pointAt(p, c, u0), b = pointAt(p, c, u1), out = [[a[0], a[1]]];
    for (let i = a[2]; i < b[2]; i++) out.push(p[i]);
    out.push([b[0], b[1]]);
    return out;
  }
  // Sutherland–Hodgman: keep huge zoomed polygons to a sane size.
  function clipPoly(pts, x0 = -300, y0 = -300, x1 = W + 300, y1 = H + 300) {
    const cut = (a, b, ax, v) => { const k = (v - a[ax]) / (b[ax] - a[ax]); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; };
    const planes = [[p => p[0] >= x0, 0, x0], [p => p[0] <= x1, 0, x1], [p => p[1] >= y0, 1, y0], [p => p[1] <= y1, 1, y1]];
    let out = pts;
    for (const [inside, ax, v] of planes) {
      const inp = out; out = [];
      for (let i = 0; i < inp.length; i++) {
        const a = inp[i], b = inp[(i + 1) % inp.length];
        if (inside(b)) { if (!inside(a)) out.push(cut(a, b, ax, v)); out.push(b); }
        else if (inside(a)) out.push(cut(a, b, ax, v));
      }
      if (out.length < 3) return [];
    }
    return out;
  }

  const paintC = (pts, o) => { if (pts.length >= 3) paint(pts, o); };   // paint a clipped polygon unless it vanished

  // ---------- paperclips ----------
  const CLIP = (() => {
    const p = [[.07, .30], [.07, .72]];
    const arc = (cx, cy, r, a0, a1, n = 7) => { for (let i = 1; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    arc(-.03, .72, .10, 0, Math.PI); p.push([-.13, .14]);
    arc(.02, .14, .15, Math.PI, TAU); p.push([.17, .84]);
    arc(0, .84, .17, 0, Math.PI); p.push([-.17, .42]);
    return p.map(([x, y]) => [x, y - .5]);
  })();
  // One paperclip: dark wire with a silver (or vinyl) core, drawn in a local frame so zoomed cameras don't cull it.
  function clip(x, y, L, rot, sw = 1, o = {}) {
    push(); translate(x, y); rotate(rot);
    const w = o.flat ?? 1, pts = CLIP.map(([px, py]) => [px * L * w, py * L]);
    inkLine(pts, sw, o.ink || CINK, 'ink', .3);
    if (L > 20) inkLine(pts, sw * (o.col ? .6 : .42), o.col || SILV, 'inkfine', .3);
    pop();
  }
  const vinyl = (i, p = .2) => hash(i * 7.7 + 1.3) < p ? VINYL[Math.floor(hash(i * 3.1) * 4)] : null;

  // clip sea: a watercolour mass under a wavy surface
  function seaLayer(fy, col, dk, o = {}) {
    const x0 = o.x0 ?? -300, x1 = o.x1 ?? W + 300, pts = [];
    for (let x = x0; x <= x1;) { pts.push([x, fy(x)]); x += o.dense && x > o.dense[0] && x < o.dense[1] ? 40 : 90; }
    pts.push([x1, o.bottom ?? 1150], [x0, o.bottom ?? 1150]);
    paint(pts, { wash: col, fill: dk, fillOp: o.op ?? 110, bleed: .05, tex: .8, border: .5, ink: CINK, sw: o.sw ?? 1.2 });
  }
  function surfClips(fy, t, n, x0, x1, seed, L = 46, depth = 40) {
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, (i + .5 + (hash(seed + i) - .5) * .7) / n), y = fy(x) + 8 + hash(seed + i * 2.3) * depth;
      clip(x, y, L * (.8 + .4 * hash(seed + i * 3.9)), hash(seed + i * 5.3) * TAU + Math.sin(t * 2.2 + i) * .35, .95, { col: vinyl(seed + i) });
    }
  }

  // heap of clips (a mound on the floor)
  const heapTop = (x, H0) => { const f = clamp((x - (H0.cx - H0.w / 2)) / H0.w); return H0.base - H0.h * Math.pow(Math.sin(Math.PI * f), .8); };
  function heap(H0) {
    const top = [];
    for (let i = 0; i <= 14; i++) { const x = H0.cx - H0.w / 2 + H0.w * i / 14; top.push([x, heapTop(x, H0) + (i % 14 ? (hash(i * 3.7 + H0.cx) - .5) * 16 : 0)]); }
    paint([...top, [H0.cx + H0.w / 2 + 20, H0.base + 16], [H0.cx - H0.w / 2 - 20, H0.base + 16]], { wash: SEA, fill: SEA_DK, fillOp: 120, bleed: .06, tex: .8, border: .6, ink: CINK, sw: 1.1, curv: .4 });
    paint(ellPts(H0.cx - H0.w * .12, H0.base - H0.h * .62, H0.w * .2, H0.h * .2, 16), { fill: SILV, fillOp: 120, bleed: .25, tex: .5, ink: null });
    for (let i = 0; i < H0.n; i++) {
      const x = H0.cx - H0.w / 2 + H0.w * (.08 + .84 * hash(H0.cx + i * 1.3)), top = heapTop(x, H0);
      const y = lerp(top + 14, H0.base - 8, Math.pow(hash(H0.cx + i * 2.9), 1.4) * .85);
      clip(x, y, 42 + hash(i * 1.1 + H0.cx) * 24, hash(i * 5.1 + H0.cx) * TAU, .9, { col: vinyl(i + H0.cx) });
    }
  }

  // ---------- the paperclip machine (the pump, promoted) ----------
  function machine(x, y, s, h, t, v) {
    const p = pulse(t, 7), sw = 1.1;
    push(); translate(x, y); scale(s * (1 + p * .06), s * (1 - p * .07));
    paint(rectPts(-128, -26, 256, 26, 2), { wash: '#4A5366', fill: CINK, fillOp: 60, tex: .5, ink: CINK, sw });
    // chute
    paint([[-70, -205], [-168, -262], [-212, -222], [-104, -150]], { wash: STL_LT, fill: STL, fillOp: 90, tex: .6, ink: CINK, sw });
    paint(ellPts(-190, -242, 22, 32, 16, 0, .75), { wash: '#262B3A', ink: CINK, sw: sw * .8 });
    // plunger rod + T handle (red grips)
    const rod = 90 * h;
    paint(rectPts(-10, -268 - rod, 20, rod + 30), { wash: '#CBD1D9', ink: CINK, sw: sw * .7 });
    paint(rrPts(-80, -294 - rod, 160, 30, 14), { wash: '#2E3345', ink: CINK, sw: sw * .7 });
    for (const gx of [-80, 46]) paint(rrPts(gx, -292 - rod, 34, 26, 11), { wash: '#D8394E', ink: null });
    // body
    paint(rrPts(-108, -262, 216, 240, 36, 2), { wash: STL, fill: STL_DK, fillOp: 100, bleed: .05, tex: .75, border: .6, ink: CINK, sw: sw * 1.3 });
    paint(ellPts(-50, -222, 46, 22, 14, 0, -.2), { fill: SILV, fillOp: 150, bleed: .2, ink: null });
    paint(rectPts(-108, -168, 216, 22), { wash: STL_DK, ink: CINK, sw: sw * .7 });
    for (let i = 0; i < 6; i++) paint(ellPts(-88 + i * 35, -157, 4.5, 4.5, 8), { wash: SILV, ink: null });
    // clip badge
    paint(rrPts(-90, -130, 96, 94, 14), { wash: '#3F475A', ink: CINK, sw: sw * .7 });
    clip(-42, -83, 68, .55 + p * .25, 1.1);
    // gauge with red zone
    const gx = 56, gy = -84;
    paint(ellPts(gx, gy, 32, 32, 20), { wash: PAL.cream, ink: CINK, sw });
    const red = [[gx, gy]]; for (let i = 0; i <= 6; i++) { const a = lerp(-1.0, -.15, i / 6); red.push([gx + Math.cos(a) * 29, gy + Math.sin(a) * 29]); }
    paint(red, { wash: '#E0485A', washOp: 210, ink: null });
    const na = lerp(-2.7, -.2, clamp(v / 100)) + p * .3 * Math.sin(t * 70);
    inkLine([[gx, gy], [gx + Math.cos(na) * 26, gy + Math.sin(na) * 26]], 1.1, '#B52438', 'ink', 0);
    pop();
    // steam puff after each stroke
    const age = frac(bpOf(t)) * BEAT;
    paint(ellPts(x + 70 * s + age * 30, y - 270 * s - age * 150, 12 + age * 50, 10 + age * 38, 14), { fill: '#FFFFFF', fillOp: 150 * (1 - age / BEAT), bleed: .3, ink: null });
    return [x - 190 * s, y - 242 * s];
  }
  function crate(x, y, w, h) {
    paint(rectPts(x - w / 2, y - h, w, h, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 70, tex: .6, ink: PAL.ink, sw: 1 });
    inkLine([[x - w / 2 + 8, y - h + 8], [x + w / 2 - 8, y - 8]], .6, WOOD_DK, 'inkfine', 0);
    inkLine([[x - w / 2 + 8, y - 8], [x + w / 2 - 8, y - h + 8]], .6, WOOD_DK, 'inkfine', 0);
  }
  // clips the machine spits on every beat: arc from the chute to the heap, then stay there
  function spitClips(t, chute, land, b0, b1, tEnd = 99) {
    for (let b = b0; b <= b1; b++) for (let j = 0; j < 2; j++) {
      const t0 = bt(b) + j * .09, age = t - t0, dur = .5 + j * .1; if (age < 0 || t0 > tEnd) continue;
      const [lx, ly, lr] = land(b * 2 + j), k = Math.min(1, age / dur);
      clip(lerp(chute[0], lx, k), lerp(chute[1], ly, k) - Math.sin(Math.PI * k) * (170 + 70 * j), 52, lr + (1 - k) * 9, 1, { col: vinyl(b * 2 + j, .35) });
    }
  }

  // ---------- stage extras ----------
  function flySpace() {
    paint(rectPts(-400, -2000, W + 800, 1990), { wash: '#23273C', fill: '#3B416A', fillOp: 90, bleed: .05, tex: .7, border: .3, ink: null });
    for (let i = 0; i < 7; i++) {
      const x = 120 + i * 290 + hash(i) * 70, yb = -380 - hash(i + 3) * 1100;
      inkLine([[x, -2000], [x + 3, yb]], .8, '#9C8D76', 'inkfine', 0);
      paint(rrPts(x - 22, yb, 44, 58, 14), { wash: '#8E7657', fill: '#5E4A36', fillOp: 80, tex: .6, ink: PAL.ink, sw: .8 });
    }
    for (const by of [-1500, -900, -330]) {
      paint(rectPts(-400, by, W + 800, 14), { wash: '#15182A', ink: null });
      for (let i = 0; i < 6; i++) {
        const lx = 200 + i * 300 + (by % 7) * 12;
        paint(ellPts(lx, by + 110, 70, 50, 16), { fill: '#F4D58A', fillOp: 70, bleed: .3, ink: null });
        paint([[lx - 24, by + 10], [lx + 24, by + 10], [lx + 32, by + 64], [lx - 32, by + 64]], { wash: '#2B2F45', ink: PAL.ink, sw: .7 });
      }
    }
  }
  const MX = 950, MY = 885, MS = .85, CRX = 1150, CRY = 885, CRH = 50;
  const HEAP = { cx: 500, base: 895, w: 540, h: 175, n: 16 };
  const HEAP_F = { cx: 470, base: 905, w: 360, h: 160, n: 7 };
  const heapLand = i => { const x = lerp(330, 700, hash(i * 7.3)); return [x, heapTop(x, HEAP) + 10 + hash(i * 2.1) * 18, hash(i * 4.4) * TAU]; };

  // ---------- SHOT 1: plop (95.4–97.4) ----------
  function plop(t) {
    const tau = t - 95.4, a = t - LAND, falling = a < 0;
    const yR = falling ? -720 + 700 * tau + 878 * tau * tau : 790;
    const raw = Math.min(yR, 790) + 150, cyF = raw < 440 ? raw : 540 - 100 * Math.exp(-(raw - 440) / 100);
    const pk = ease(seg(t, LAND + .1, 97.4)), [sx, sy] = shakeXY(t, a > 0 ? 18 * Math.exp(-a * 6) : 0);
    camBegin(lerp(960, 890, pk) + sx, lerp(cyF, 585, pk) + sy, lerp(1, 1.1, pk), 0);
    stageBack(t, STAGE);
    flySpace();
    const v = pdoomAt(t), h = pumpH(t);
    meterProp(1480, 885, .95, v, { glow: .5 * pulse(t, 5) });
    inkLine([[MX + 95, MY - 60], [1250, 905], [1400, 900], [1432, 800]], 2.4, PAL.ink, 'ink', .7);
    const chute = machine(MX, MY, MS, h, t, v);
    crate(CRX, CRY, 250, CRH);
    heap(HEAP);
    // the Researcher
    const s = 20;
    if (falling) {
      const k = tau / (LAND - 95.4), th = TAU * ease(k), cx = 480 + Math.sin(k * 3) * 24, cy = yR - 6.6 * s;
      for (let i = 0; i < 5; i++) { const lx = cx + (i - 2) * 48 + jit(4), l0 = cy - 170 - hash(i) * 80; inkLine([[lx, l0], [lx, l0 - 160 - hash(i + 5) * 140]], .7, '#C9CFE0', 'inkfine', 0); }
      researcher(cx - Math.sin(th) * 6.6 * s, cy + Math.cos(th) * 6.6 * s, s, { rot: th, aL: 1.3 + .4 * wob(t, 4), aR: 1.1 + .4 * wob(t, 4, .3), eyes: 'wide', brows: 'worried', mouth: 'O', hairUp: 1, run: t * 4, noShadow: true });
    } else {
      const md = mood(t, [[LAND, 'swirl'], [LAND + .85, 'look', 'sweat']]);
      researcher(480, 792, s, { sq: .38 * Math.exp(-a * 7) * Math.cos(a * 24), aL: .7 + .6 * Math.exp(-a * 3) * wob(t, 3), aR: .4 + .6 * Math.exp(-a * 3) * wob(t, 3, .5),
        hairUp: Math.max(0, 1 - a * 1.2), mouth: a < .85 ? 'wobble' : 'o', brows: a > .85 ? 'worried' : null, lookX: 1, lookY: -.4, noShadow: true, ...md,
        draw: (s2) => clip(1.5 * s2, -13.3 * s2, 2.6 * s2, .8, .75) });
    }
    heap(HEAP_F);
    // Clawd hangs on the handle and rides it down on every beat
    const cm = mood(t, [[95.4, 'happy'], [LAND + .05, 'scared', '!'], [LAND + .7, 'happy', 'spark']]);
    clawd(CRX, CRY - CRH, 28, { flip: true, aR: 1.1, aL: .7 + .7 * Math.abs(Math.sin(bpOf(t) * Math.PI)), dy: -.14 - 2.73 * h, sq: .16 * pulse(t, 9), mouth: 'grin', blush: true, lookX: 1, ...cm });
    spitClips(t, chute, heapLand, 140, 143);
    // splash on landing
    if (a >= 0 && a < .8) for (let i = 0; i < 7; i++) {
      const ang = -Math.PI / 2 + (i - 3) * .4, vv = 620 + hash(i * 4.4) * 300, x = 480 + Math.cos(ang) * vv * a, y = 745 + Math.sin(ang) * vv * a + 1700 * a * a;
      if (y < 910) clip(x, y, 42, i + a * 14, .9, { col: vinyl(i + 40, .3) });
    }
    sfx('PLOP', 520, 420, 160, '#F6C04A', a, { life: 1.0, rot: -.12 });
    stageFront(t, {});
    camEnd();
  }

  // ---------- SHOT 2: clip flood (97.4–99.0) ----------
  function surfboard(x, y, rot, L, h) {    // nose on the left (the way the wave travels)
    push(); translate(x, y); rotate(rot);
    paint([[-L / 2, -h * .1], [-L * .3, -h], [L * .28, -h], [L / 2, -h * .45], [L / 2, h * .35], [L * .28, h * .7], [-L * .3, h * .6]], { wash: '#F5CD5F', fill: '#E39A36', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.2, curv: .5 });
    inkLine([[-L * .42, -h * .2], [L * .47, -h * .1]], 1.3, '#E0474C', 'ink', .3);
    clip(L * .12, h * .15, 30, Math.PI / 2, .8, { ink: '#8C3A2A' });
    pop();
  }
  function flood(t) {
    const f = kf(t, [[97.35, 0], [97.8, .42], [98.45, .8], [99.0, 1]], ease);
    const lvl = lerp(905, 650, f), wk = ease(seg(t, 97.45, 97.9)), HH = 440 * wk, RL = 220 * wk;
    const wp = seg(t, 97.6, 99.0), xw = lerp(1520, 960, lerp(wp, ease(wp), .45));
    const bump = d => d < 0 ? Math.exp(-sq2(d / 185)) : Math.exp(-sq2(d / 230));
    const rip = (x, ph = 0) => 13 * Math.sin(x * .011 - t * 5 + ph) + 7 * Math.sin(x * .027 + t * 3.1 + ph);
    const front = x => lvl + 34 + rip(x) - HH * bump(x - xw);
    const back = x => lvl - 30 + rip(x, 1.3) - .35 * HH * bump(x - xw - 260);
    const pk = seg(t, 97.4, 99.0), C = [lerp(900, 880, ease(pk)), lerp(585, 560, pk), lerp(1.1, 1.04, ease(pk)), Math.sin(t * 2.6) * .014];
    const X0 = -220, X1 = 2000, dense = [xw - 700, xw + 500];
    camBegin(...C);
    stageBack(t, STAGE);
    meterProp(1480, 885, .95, pdoomAt(t), { glow: .5 * pulse(t, 5) });
    camEnd(); flushLetters(); camBegin(...C);            // so the sea can cover the meter's lettering
    inkLine([[MX + 95, MY - 60], [1250, 905], [1400, 900], [1432, 800]], 2.4, PAL.ink, 'ink', .7);
    const chute = machine(MX, MY, MS, pumpH(t), t, pdoomAt(t));
    crate(CRX, CRY, 250, CRH);
    if (lvl > 760) heap(HEAP);
    spitClips(t, chute, heapLand, 142, 146, 98.2);
    // back sea (a gentle swell behind the breaker)
    seaLayer(back, SEA_DK, '#4F5A6E', { sw: 1, x0: X0, x1: X1, dense });
    surfClips(back, t, 14, -150, 1950, 11, 40, 30);
    // troupe popping up in the clip pit once the wave has passed
    [[1660, 98.35, 0], [1330, 98.62, 1]].forEach(([x, t0, i]) => {
      const up = backOut(seg(t, t0, t0 + .35)); if (up <= 0) return;
      const u = 15, y = back(x) + 3.4 * u + (1 - up) * 8 * u;
      clawd(x, y, u, { hat: 'party', eyes: 'happy', mouth: 'grin', aL: 1.1 + .4 * wob(t, 2.3, i), aR: 1.1 + .4 * wob(t, 2.3, i + .5), noShadow: true, noLegs: true, rot: Math.sin(t * 3 + i) * .1 });
    });
    // the Researcher gets lifted off the heap and bobs, flailing (until Clawd scoops them up)
    const rx = lerp(480, 430, ease(seg(t, 97.8, 98.45))), s = 20, ry = Math.min(792, front(rx) - 34 + 5.9 * s), afloat = ry < 791;
    const SC0 = 98.48, SC1 = 98.72, scoop = seg(t, SC0, SC1), hairClip = (s2) => clip(1.5 * s2, -13.3 * s2, 2.6 * s2, .8, .75);
    if (lvl > 725) heap(HEAP_F);
    if (scoop <= 0) researcher(rx, ry, s, { rot: afloat ? Math.sin(t * 3.4) * .12 : 0, aL: afloat ? 1.35 + .35 * wob(t, 2.2) : .7, aR: afloat ? 1.2 + .35 * wob(t, 2.2, .5) : .4,
      brows: 'worried', mouth: afloat ? 'O' : 'o', hairUp: afloat ? .7 : 0, lookX: 1, lookY: -.4, noShadow: true, ...mood(t, [[97.4, 'look'], [97.85, 'wide', '!']]), draw: hairClip });
    // front sea: the breaker rises out of it
    seaLayer(front, SEA, SEA_DK, { x0: X0, x1: X1, dense });
    surfClips(front, t, 16, -150, 1950, 23, 50, 60);
    // the curling lip (a big silver-grey claw of clips) with the dark barrel under it
    if (wk > .05) {
      const c0 = front(xw), L = (dx, dy) => [xw + dx * RL, c0 + dy * RL];
      paint(ellPts(xw - .62 * RL, c0 + .78 * RL, .62 * RL, .5 * RL, 18, 0, .3), { fill: '#3B4357', fillOp: 190, bleed: .2, tex: .4, border: .3, ink: null });
      const lip = [L(.9, .22), L(.35, -.1), L(-.15, -.2), L(-.6, -.12), L(-.95, .12), L(-1.1, .48), L(-1.02, .86), L(-.84, .98), L(-.76, .8), L(-.82, .58), L(-.66, .38), L(-.4, .3), L(-.12, .42), L(.1, .7)];
      paint(lip, { wash: SEA_LT, fill: SEA, fillOp: 100, tex: .6, border: .5, ink: null, curv: .5 });
      inkLine(densify([L(.35, -.1), L(-.15, -.2), L(-.6, -.12), L(-.95, .12), L(-1.1, .48), L(-1.02, .86), L(-.84, .98), L(-.76, .8), L(-.82, .58), L(-.66, .38), L(-.4, .3), L(-.12, .42)], 4), 1.4, CINK, 'ink', .4);
      // foam fingers along the lip
      for (let i = 0; i < 7; i++) { const [fx, fy] = L(.2 - i * .19, -.16 + Math.sin(i * .9) * .05 + (i > 4 ? (i - 4) * .12 : 0)); paint(ellPts(fx, fy, .13 * RL, .09 * RL, 12, 0, -.3), { wash: '#FFFFFF', washOp: 220, ink: null }); }
      for (let i = 0; i < 6; i++) { const [cx2, cy2] = L(-.1 - i * .17, .02 + (i > 3 ? (i - 3) * .2 : 0)); clip(cx2, cy2, 40, i * 1.3 + t * 3, .9, { col: vinyl(i + 70, .45) }); }
      // spray thrown off the lip
      for (let i = 0; i < 8; i++) { const ph = frac(t * 2 + i / 8), [sx0, sy0] = L(-.9, 0); clip(sx0 - ph * 220 - i * 8, sy0 - Math.sin(ph * Math.PI) * 150 + ph * 120, 30, i + ph * 8, .8, { col: vinyl(i + 90, .3) }); }
    }
    // Clawd rides the rising sea on a surfboard, then races ahead of the curl
    const ride = ease(seg(t, 97.74, 98.0)), carve = Math.sin((t - 97.74) * 4.2) * 55;
    const hop = Math.sin(Math.PI * seg(t, 98.1, 98.418)), cxp = lerp(CRX, xw - 1.72 * RL - 60 + carve, ride);
    const by = Math.min(CRY - CRH + 8, front(cxp) - 10) - hop * 120, slope = Math.atan2(front(cxp + 70) - front(cxp - 70), 140);
    const brot = (slope * .6 - .08) * ride - hop * .35, bIn = backOut(seg(t, 97.45, 97.62));
    if (bIn > 0) surfboard(cxp, by, brot, 330 * bIn, 20);
    const u = 31, la = t - SC1, land = la > 0 ? Math.exp(-la * 8) * Math.cos(la * 30) : 0, fx = cxp + Math.sin(brot) * 20, fy = by - Math.cos(brot) * 20, dyC = -.25 * pulse(t, 5) + (la > 0 ? .5 * Math.exp(-la * 9) : 0);
    clawd(fx, fy, u, { flip: true, rot: brot * .8, ...(la > 0 ? { lookY: -1 } : {}), aR: .25 + .35 * wob(t, 1.8) * ride + (1 - ride) * .7 + hop * .9, aL: .6 + .3 * wob(t, 1.8, .4) * ride + (1 - ride) * .4 + hop * .7,
      dy: dyC, sq: .08 * pulse(t, 8) - hop * .12 + .2 * land, mouth: 'grin', blush: true, noShadow: true, ...mood(t, [[97.4, 'happy'], [97.76, 'spark', 'spark'], [SC1, 'happy']]) });
    // ...and the Researcher leaps aboard, landing on Clawd's head: wheee
    if (scoop > 0) {
      const cr2 = brot * .8, hx = fx + Math.sin(cr2) * 8 * u, hy = fy + dyC * u - Math.cos(cr2) * 8 * u, k = easeOut(scoop);
      researcher(lerp(rx, hx, k), lerp(ry, hy, k) - Math.sin(Math.PI * scoop) * 120, s, { rot: lerp(0, cr2, k) - Math.sin(Math.PI * scoop) * .5, sq: .3 * land,
        aL: 1.45 + .3 * wob(t, 2.6), aR: 1.3 + .3 * wob(t, 2.6, .4), hairUp: 1, mouth: la > 0 ? 'grin' : 'O', noShadow: true, lookX: -1,
        ...mood(t, [[SC0, 'wide'], [SC1 + .02, 'star']]), draw: hairClip });
    }
    // spray off the board's nose
    if (ride > .3 && hop < .1) for (let i = 0; i < 5; i++) { const ph = frac(t * 3 + i / 5), x = cxp - 170 - ph * 120, y = by - 10 - Math.sin(ph * Math.PI) * 70 + ph * 40; clip(x, y, 24, i * 2 + ph * 9, .7); }
    stageFront(t, {});
    // the room fills to the ceiling
    const cr = easeIn(seg(t, 98.78, 99.0));
    if (cr > 0) { const top = x => lerp(front(x) + 40, -260, cr) + Math.sin(x * .01 + t * 6) * 30; seaLayer(top, SEA, SEA_DK, { x0: X0, x1: X1 }); surfClips(top, t, 12, -100, 1900, 37, 60, 200); }
    camEnd();
  }

  // ---------- SHOT 3: killswitch guys on PTO (99.0–99.78) ----------
  function sticky(x, y, w, h, rot) {
    push(); translate(x, y); rotate(rot);
    paint(rectPts(-w / 2, -h / 2, w, h, 1.5), { wash: '#F6DE6B', fill: '#E8C23F', fillOp: 60, tex: .5, ink: CINK, sw: .7 });
    const s = w / 90;
    paint(ellPts(22 * s, -22, 9 * s, 9, 12), { wash: '#F29A3A', ink: null });                         // sun
    for (let i = 0; i < 4; i++) {                                                                      // umbrella canopy
      const pts = [[-4 * s, -2]]; for (let k = 0; k <= 4; k++) { const a = Math.PI + (i + k / 4) * Math.PI / 4; pts.push([-4 * s + Math.cos(a) * 26 * s, -2 + Math.sin(a) * 20]); }
      paint(pts, { wash: i % 2 ? PAL.cream : '#E0474C', ink: null });
    }
    inkLine([[-30 * s, -2], [22 * s, -2]], .5, CINK, 'inkfine', 0);
    inkLine([[-4 * s, -2], [0, 26]], .8, CINK, 'inkfine', 0);
    inkLine([[-36 * s, 30], [-20 * s, 26], [-4 * s, 30], [12 * s, 26], [30 * s, 30]], .7, '#3A8FB7', 'inkfine', .4);
    pop();
  }
  function killswitch(t) {
    const k = ease(seg(t, 99.0, 99.78));
    camBegin(lerp(940, 1000, k), lerp(575, 548, k), lerp(1.27, 1.4, k), 0);
    paint(rectPts(-40, -40, W + 80, 840), { wash: '#7B879B', fill: '#58647C', fillOp: 90, bleed: .05, tex: .7, border: .4, ink: null });
    paint(ellPts(1260, 380, 360, 260, 24, 10), { fill: '#F4C987', fillOp: 80, bleed: .3, tex: .4, ink: null });   // warm lamp pool
    for (let i = 0; i < 6; i++) inkLine([[-100 + i * 380, 0], [-100 + i * 380, 760]], .5, '#6A768B', 'inkfine', 0);  // wall panels
    paint(rectPts(-40, 760, W + 80, 30), { wash: '#4E586D', ink: CINK, sw: .8 });
    paint(rectPts(-40, 790, W + 80, 330), { wash: '#5A6479', fill: '#3F4759', fillOp: 90, tex: .6, border: .4, ink: null });
    // pedestal + big red button (glowing, unattended, cobwebbed)
    const px = 720, gl = pulse(t, 4);
    push(); translate(px, 805); scale(1.18); translate(-px, -805);
    paint(ellPts(px, 805, 150, 26, 20), { fill: PAL.ink, fillOp: 70, bleed: .2, ink: null });
    paint(ellPts(px, 470, 190 + gl * 30, 140 + gl * 20, 24), { fill: '#FF4C5E', fillOp: 40 + gl * 70, bleed: .3, ink: null });
    paint(rectPts(px - 85, 515, 170, 290, 2), { wash: STL, fill: STL_DK, fillOp: 90, tex: .7, border: .5, ink: CINK, sw: 1.2 });
    paint(rectPts(px - 85, 560, 170, 46), { wash: '#F2C53D', ink: CINK, sw: .9 });
    for (let i = 0; i < 4; i++) { const x0 = px - 85 + i * 42; paint([[x0, 606], [x0 + 20, 606], [x0 + 40, 560], [x0 + 20, 560]], { wash: PAL.ink, ink: null }); }
    paint(rrPts(px - 100, 500, 200, 24, 8), { wash: '#4A5366', ink: CINK, sw: 1 });
    const dome = [[px - 76, 503]]; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; dome.push([px + Math.cos(a) * 76, 503 + Math.sin(a) * 62]); }
    paint(dome, { wash: '#E3263E', fill: '#9B1428', fillOp: 90, tex: .6, ink: CINK, sw: 1.4 });
    paint(ellPts(px - 30, 466, 18, 10, 12, 0, -.5), { wash: PAL.cream, washOp: 220, ink: null });
    const wc = [px + 96, 470];
    for (const [ex, ey] of [[px + 58, 466], [px + 72, 490], [px + 100, 500], [px + 130, 500]]) inkLine([wc, [ex, ey]], .45, '#E4E8EF', 'inkfine', 0);
    for (const r of [.4, .75]) inkLine([[lerp(wc[0], px + 58, r), lerp(wc[1], 466, r)], [lerp(wc[0], px + 72, r), lerp(wc[1], 490, r) + 3], [lerp(wc[0], px + 100, r), lerp(wc[1], 500, r) + 2], [lerp(wc[0], px + 130, r), lerp(wc[1], 500, r)]], .4, '#E4E8EF', 'inkfine', .5);
    pop();
    // empty office chair, still turning; note on the back
    const ph = lerp(-1.6, .2, easeOut(seg(t, 99.0, 99.62))) + .05 * Math.sin(t * 5), cs = Math.cos(ph), sn = Math.sin(ph), ch = 1250;
    for (let i = 0; i < 5; i++) { const a = ph * .6 + i * TAU / 5, ex = ch + Math.cos(a) * 110, ey = 842 + Math.sin(a) * 22; inkLine([[ch, 830], [ex, ey]], 1.8, '#2A2E3E', 'ink', 0); paint(ellPts(ex, ey + 8, 12, 8, 10), { wash: PAL.ink, ink: null }); }
    paint(rectPts(ch - 9, 700, 18, 132), { wash: '#3A4052', ink: CINK, sw: .7 });
    const bw = 105 * Math.abs(cs) + 14, bx = ch + sn * 40;
    const back = () => {
      inkLine([[ch + sn * 20, 700], [bx, 640]], 2, '#2A2E3E', 'ink', 0);
      paint(rrPts(bx - bw, 420, bw * 2, 232, Math.min(40, bw)), { wash: cs > 0 ? '#4A5876' : '#2E3549', fill: '#232A3D', fillOp: 80, tex: .6, ink: CINK, sw: 1.2 });
      if (cs > .2) sticky(bx + sn * 10, 525, 128 * cs, 124, -.06);
    };
    const seat = () => paint(ellPts(ch, 700, 125, 32, 22), { wash: '#39445E', fill: '#252C40', fillOp: 90, tex: .6, ink: CINK, sw: 1.1 });
    if (cs > 0) { back(); seat(); } else { seat(); back(); }
    // the clip tide seeps in under the door
    const fx = lerp(-150, 520, seg(t, 99.0, 99.78));
    seaLayer(x => x < fx ? 860 + Math.sin(x * .02 + t * 4) * 8 : 860 + (x - fx) * 1.2, SEA, SEA_DK, { x0: -300, x1: fx + 160, sw: 1 });
    surfClips(x => 860, t, 7, -250, fx, 51, 40, 40);
    // a tumbleweed of paperclips rolls through the empty office
    const tk = seg(t, 99.04, 99.78), tx = lerp(250, 1750, tk), ty = 730 - Math.abs(Math.sin(tk * 9)) * 70, tr = tx / 52;
    if (tk > 0 && tk < 1) {
      paint(ellPts(tx, 792, 50, 9, 12), { fill: PAL.ink, fillOp: 50, bleed: .2, ink: null });
      paint(ellPts(tx, ty, 58, 58, 18), { wash: SEA_LT, washOp: 150, ink: STL_DK, sw: .6 });
      for (let i = 0; i < 12; i++) { const a = tr + i * TAU / 12, rr = 20 + (i % 3) * 16; clip(tx + Math.cos(a) * rr, ty + Math.sin(a) * rr, 56, a + Math.PI / 2 + i, .85, { col: vinyl(i + 120, .25) }); }
      for (let i = 0; i < 3; i++) inkLine([[tx - 70 - i * 26, ty - 18 + i * 18], [tx - 110 - i * 34, ty - 16 + i * 18]], .6, '#AEB7C6', 'inkfine', 0);
    }
    camEnd();
  }

  // ---------- SHOT 4: the beach (99.78–100.5) ----------
  function coconut(u, sw) {
    paint(ellPts(.9 * u, 0, 1.15 * u, 1.05 * u, 16), { wash: '#8A5A3A', fill: '#5E3A24', fillOp: 80, tex: .6, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(.9 * u, -.75 * u, .75 * u, .28 * u, 12), { wash: PAL.cream, ink: PAL.ink, sw: sw * .4 });
    inkLine([[1.1 * u, -.8 * u], [1.5 * u, -2.6 * u], [1.0 * u, -3.0 * u]], sw * .9, '#E2476E', 'ink', .2);
    paint([[.2 * u, -1.9 * u], [1.1 * u, -2.4 * u], [.6 * u, -1.5 * u]], { wash: '#F5CD5F', ink: PAL.ink, sw: sw * .4 });
  }
  function lounger(x, y, dir) {   // dir -1: backrest on the left
    const c = '#F4EDE0', sw = 1;
    inkLine([[x + dir * 20, y], [x + dir * 20, y + 44]], 1.4, PAL.ink, 'ink', 0);
    inkLine([[x - dir * 250, y], [x - dir * 250, y + 44]], 1.4, PAL.ink, 'ink', 0);
    paint([[x + dir * 40, y + 8], [x - dir * 270, y + 8], [x - dir * 270, y - 12], [x + dir * 40, y - 12]], { wash: c, fill: PAL.teal, fillOp: 60, ink: PAL.ink, sw });
    paint([[x + dir * 40, y - 6], [x + dir * 128, y - 216], [x + dir * 104, y - 226], [x + dir * 16, y - 12]], { wash: c, fill: PAL.teal, fillOp: 60, ink: PAL.ink, sw });
    for (let i = 1; i < 4; i++) inkLine([[x + dir * (40 + i * 20), y - 6 - i * 50], [x + dir * (18 + i * 20), y - 12 - i * 50]], .6, PAL.teal, 'inkfine', 0);
  }
  function umbrella(x, top, rx, hgt, t) {   // striped beach umbrella: dome canopy, scalloped rim, pole down to the sand
    const rimY = top + hgt, ap = [x, top], rim = j => [x - rx + j * rx / 3, rimY];
    const edge = j => { const [ex] = rim(j), f = (ex - x) / rx; return densify([ap, [x + (ex - x) * .78, top + hgt * .36 - Math.abs(f) * 10], rim(j)], 4); };
    paint(ellPts(x, 800, 330, 34, 20), { fill: '#B98A55', fillOp: 90, bleed: .2, ink: null });
    inkLine([[x, 800], [x, top + 10]], 2.4, PAL.ink, 'ink', 0);
    for (let j = 0; j < 6; j++) {
      const a = edge(j), b = edge(j + 1).reverse(), [x0] = rim(j), [x1] = rim(j + 1);
      const sc = []; for (let k2 = 1; k2 < 4; k2++) sc.push([lerp(x0, x1, k2 / 4), rimY + Math.sin(Math.PI * k2 / 4) * 20]);
      paint([...a, ...sc, ...b], { wash: j % 2 ? '#FFF6E6' : '#E4474F', fill: j % 2 ? '#F2DCC0' : '#B82C3E', fillOp: 50, tex: .4, ink: PAL.ink, sw: .9 });
    }
    paint(ellPts(x, top - 6, 11, 11, 10), { wash: '#F5CD5F', ink: PAL.ink, sw: .8 });
  }
  function beach(t) {
    const k = seg(t, 99.78, 100.5);
    camBegin(lerp(960, 1000, ease(k)), lerp(560, 575, k), lerp(1.08, 1.16, k), 0);
    paint(rectPts(-40, -40, W + 80, 530), { wash: '#94CDEB', fill: '#5FA9DA', fillOp: 70, bleed: .05, tex: .5, border: .3, ink: null });
    paint(ellPts(960, 470, 1150, 170, 24, 20), { fill: '#FFE3A8', fillOp: 120, bleed: .3, tex: .4, ink: null });
    // sun with turning rays
    const SUN = [1370, 190];
    for (let i = 0; i < 12; i++) { const a = t * .5 + i * TAU / 12; paint([[SUN[0] + Math.cos(a - .09) * 110, SUN[1] + Math.sin(a - .09) * 110], [SUN[0] + Math.cos(a) * 190, SUN[1] + Math.sin(a) * 190], [SUN[0] + Math.cos(a + .09) * 110, SUN[1] + Math.sin(a + .09) * 110]], { fill: '#FBE09A', fillOp: 160, bleed: .1, ink: null }); }
    paint(ellPts(SUN[0], SUN[1], 88, 88, 26), { wash: '#F8C94B', fill: '#F29A3A', fillOp: 70, tex: .4, ink: CINK, sw: 1 });
    // sea, with the silver clip-tide on the horizon
    paint([[-40, 470], [W + 40, 470], [W + 40, 650], [-40, 650]], { wash: '#3EB2AE', fill: '#1F8594', fillOp: 90, tex: .6, border: .4, ink: null });
    paint(rectPts(-40, 458, W + 80, 16), { wash: STL_LT, fill: STL, fillOp: 90, tex: .5, ink: null });
    for (let i = 0; i < 9; i++) paint(starPts(100 + i * 230 + hash(i) * 80, 464, 7 + 5 * pulse2(t + i * .1), .3, 4), { wash: PAL.cream, ink: null });
    for (let i = 0; i < 10; i++) { const x = ((i * 260 + t * 40) % 2300) - 200, y = 520 + (i % 3) * 38; inkLine([[x, y], [x + 30, y - 6], [x + 60, y]], .6, '#DDF3EE', 'inkfine', .5); }
    // sand + foam
    const shore = []; for (let x = -40; x <= W + 80; x += 120) shore.push([x, 630 + Math.sin(x * .01 + t * 2) * 10]);
    paint([...shore, [W + 80, 1080], [-40, 1080]], { wash: '#F2D6A2', fill: '#E0B475', fillOp: 90, tex: .7, border: .5, ink: null });
    inkLine(shore.map(([x, y]) => [x, y - 4]), 1.4, PAL.cream, 'ink', .5);
    // palm tree
    const sway = Math.sin(t * 1.6) * .05;
    paint([[150, 880], [196, 880], [262, 330], [236, 326]], { wash: '#A2703F', fill: '#6F4526', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1, curv: .3 });
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * .62 + sway, L = 200 + (i % 2) * 40, tx = 250 + Math.cos(a) * L, ty = 330 + Math.sin(a) * L * .7 + 60;
      const mx = 250 + Math.cos(a) * L * .5, my = 330 + Math.sin(a) * L * .45 - 30;
      paint([[250, 330], [mx - 20, my - 26], [tx, ty], [mx + 20, my + 24]], { wash: '#5FA457', fill: '#3F7D40', fillOp: 70, tex: .5, ink: PAL.ink, sw: .8, curv: .5 });
    }
    paint(ellPts(262, 346, 20, 18, 10), { wash: '#7A4E2C', ink: PAL.ink, sw: .6 });
    // umbrella (behind), loungers
    umbrella(1000, 238, 330, 150, t);
    lounger(560, 800, -1); lounger(1420, 800, 1);
    // phone buzzing on the little table: they ignore it
    const bz = pulse2(t, 3), jx = Math.sin(t * 90) * 5 * bz, pr = Math.sin(t * 70) * .06 * bz;
    paint(ellPts(1000, 820, 100, 16, 16), { fill: PAL.ink, fillOp: 60, bleed: .2, ink: null });
    inkLine([[1000, 740], [1000, 820]], 1.8, PAL.ink, 'ink', 0);
    paint(ellPts(1000, 738, 80, 16, 18), { wash: '#F4EDE0', ink: PAL.ink, sw: .9 });
    push(); translate(1000 + jx, 730 - bz * 6); rotate(pr - .06);
    paint(rrPts(-34, -112, 68, 112, 12), { wash: '#2B2F45', ink: CINK, sw: 1 });
    paint(rrPts(-27, -104, 54, 94, 7), { wash: '#F2455A', fill: '#FFB0B8', fillOp: 70, tex: .3, ink: null });
    paint(ellPts(0, -58, 17, 17, 14), { wash: '#C21F33', ink: PAL.cream, sw: .7 });
    paint(ellPts(-5, -63, 5, 3.5, 8), { wash: PAL.cream, ink: null });
    pop();
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const r = 56 + i * 18 + bz * 8, cx = 1000 + jx; inkLine([[cx + s * r, 640], [cx + s * (r + 8), 676], [cx + s * r, 712]], .8, PAL.ink, 'inkfine', .6); }
    // the two killswitch guys on PTO
    const sip = Math.max(0, Math.sin((t - 99.78) * 7));
    clawd(680, 792, 22, { eyes: 'shades', mouth: 'smile', rot: -.38, aL: 1.55, aR: .8 + .25 * sip, armR: coconut, noShadow: true, dy: -.1 * Math.abs(Math.sin(bpOf(t) * Math.PI)) });
    clawd(1300, 792, 22, { eyes: 'shades', mouth: 'cat', flip: true, rot: .38, aL: 1.55, aR: .75, armR: coconut, noShadow: true, dy: -.1 * Math.abs(Math.sin(bpOf(t) * Math.PI + 1)) });
    camEnd();
  }

  // ---------- SHOTS 5–6: the paperclip planet, the fuse (100.5–105.4), drawn with a manual camera ----------
  const P = [960, 600], R = 360, ISL = [960, 241], BOMB = [640, 330], BR = 76;
  const PCLIPS = (() => {
    const out = [];
    for (let i = 0; i < 46; i++) {
      const r = Math.sqrt(hash(i * 2.3 + 1)) * R * .92, a = hash(i * 5.7 + 2) * TAU, x = P[0] + Math.cos(a) * r, y = P[1] + Math.sin(a) * r;
      if (Math.hypot(x - ISL[0], y - ISL[1]) < 50) continue;
      out.push({ x, y, L: 50 * (1 - .45 * sq2(r / R)), rot: hash(i * 9.1) * TAU, col: vinyl(i + 200, .3) });
    }
    for (let i = 0; i < 42; i++) {
      const a = -Math.PI / 2 + (hash(i * 4.1 + 7) - .5) * .9, rr = R - 6 - hash(i * 6.3 + 3) * 75, x = P[0] + Math.cos(a) * rr, y = P[1] + Math.sin(a) * rr;
      if (Math.abs(x - ISL[0]) < 44 && y < ISL[1] + 26) continue;
      out.push({ x, y, L: 9 + hash(i * 2.2) * 5, rot: hash(i * 8.8) * TAU, col: vinyl(i + 300, .12) });
    }
    return out;
  })();
  const FUSE = densify([[1220, 511], [1172, 560], [1115, 545], [1075, 465], [1058, 380], [1020, 312], [960, 288], [888, 300], [826, 342], [768, 334], [730, 300], [712, 268]], 8);
  const FUSE_L = cumLen(FUSE);
  let V = { cx: 960, cy: 540, z: 1 };
  const SX = x => W / 2 + (x - V.cx) * V.z, SY = y => H / 2 + (y - V.cy) * V.z, SP = pts => pts.map(p => [SX(p[0]), SY(p[1])]);
  const onScr = (x, y, m = 120) => x > -m && x < W + m && y > -m && y < H + m;
  const zw = sw => sw * clamp(Math.pow(V.z, .6), .8, 3);

  function space(t) {
    paint(rectPts(-100, -100, W + 200, H + 200), { wash: '#171B38', fill: '#2A2F63', fillOp: 110, bleed: .05, tex: .8, border: .3, ink: null });
    for (const [x, y, r, c] of [[380, 240, 400, PAL.violet], [1520, 860, 440, PAL.indigo], [1620, 180, 260, PAL.rose]]) paint(ellPts(x, y, r, r * .6, 22, 20), { fill: c, fillOp: 70, bleed: .35, tex: .5, border: .3, ink: null });
    const pz = Math.pow(V.z, .12);
    for (let i = 0; i < 38; i++) {
      const x = W / 2 + (hash(i * 3.3) * W - W / 2) * pz, y = H / 2 + (hash(i * 7.1) * H - H / 2) * pz, r = (3 + hash(i * 1.7) * 7) * (1 + .35 * Math.sin(t * 6 + i));
      paint(starPts(x, y, r, .32, 4), { wash: i % 5 ? PAL.cream : '#F6D27A', ink: null });
    }
  }
  function planet(t) {
    const px = SX(P[0]), py = SY(P[1]), r = R * V.z, disc = (rr, n = 72) => clipPoly(ellPts(px, py, rr, rr, n));
    paintC(disc(r * 1.2), { fill: '#6F7FD0', fillOp: 60, bleed: .3, tex: .3, border: .2, ink: null });
    paintC(disc(r * 1.08), { fill: '#9CC4F0', fillOp: 90, bleed: .25, tex: .3, border: .2, ink: null });
    paintC(disc(r), { wash: '#B5C1D3', fill: '#71809C', fillOp: 110, bleed: .04, tex: .8, border: .6, ink: null });
    const cres = []; for (let i = 0; i <= 16; i++) { const a = lerp(-.45, 2.2, i / 16); cres.push([P[0] + Math.cos(a) * R, P[1] + Math.sin(a) * R]); }
    for (let i = 16; i >= 0; i--) { const a = lerp(-.45, 2.2, i / 16); cres.push([P[0] - 60 + Math.cos(a) * R * .98, P[1] - 70 + Math.sin(a) * R * .98]); }
    paintC(clipPoly(SP(cres)), { fill: '#3E4863', fillOp: 100, bleed: .15, tex: .5, border: .4, ink: null });
    paintC(clipPoly(SP(ellPts(P[0] - 140, P[1] - 140, 110, 64, 24, 0, -.7))), { fill: SILV, fillOp: 140, bleed: .3, tex: .4, ink: null });
    const rim = []; for (let i = 0; i <= 22; i++) { const a = lerp(3.1, 4.9, i / 22); rim.push([P[0] + Math.cos(a) * R * .97, P[1] + Math.sin(a) * R * .97]); }
    inkLine(SP(rim), zw(3.2), '#F8DDA8', 'ink', .4);
    for (const c of PCLIPS) { const x = SX(c.x), y = SY(c.y), L = c.L * V.z; if (L < 11 || !onScr(x, y, L)) continue; clip(x, y, L, c.rot + Math.sin(t * 1.5 + c.x) * .05, clamp(L / 50, .35, 1.6), { col: c.col }); }
    paintC(disc(r), { ink: CINK, sw: zw(1.2) });
  }
  function islandAndResearcher(t, ro) {
    const [ix, iy] = ISL;
    for (let k = 0; k < 2; k++) { const ph = frac(t * .9 + k * .5), rr = 46 + ph * 20; inkLine(SP([[ix - rr, iy + 6 - ph * 2], [ix - rr * .7, iy + 2], [ix - rr * .45, iy + 6]]), zw(.5), SILV, 'inkfine', .5); inkLine(SP([[ix + rr, iy + 6 - ph * 2], [ix + rr * .7, iy + 2], [ix + rr * .45, iy + 6]]), zw(.5), SILV, 'inkfine', .5); }
    paint(SP([[ix - 44, iy + 10], [ix - 30, iy - 2], [ix, iy - 8], [ix + 30, iy - 2], [ix + 44, iy + 10], [ix, iy + 18]]), { wash: '#EBD49A', ink: CINK, sw: zw(.6), curv: .5 });
    paint(SP([[ix - 34, iy + 2], [ix - 18, iy - 10], [ix + 6, iy - 13], [ix + 28, iy - 6], [ix + 34, iy + 3], [ix, iy + 8]]), { wash: '#79B45E', fill: '#4E8A45', fillOp: 70, tex: .5, ink: CINK, sw: zw(.7), curv: .5 });
    // tiny palm
    const sway = Math.sin(t * 2) * .08;
    paint(SP([[ix + 17, iy - 8], [ix + 21, iy - 8], [ix + 27, iy - 42], [ix + 24, iy - 42]]), { wash: '#A2703F', ink: CINK, sw: zw(.5) });
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .7 + sway, tx = ix + 26 + Math.cos(a) * 22, ty = iy - 42 + Math.sin(a) * 14 + 8; paint(SP([[ix + 26, iy - 42], [lerp(ix + 26, tx, .5) - 3, lerp(iy - 42, ty, .5) - 5], [tx, ty], [lerp(ix + 26, tx, .5) + 3, lerp(iy - 42, ty, .5) + 4]]), { wash: '#5FA457', ink: CINK, sw: zw(.45), curv: .4 }); }
    const s = 3.0;
    researcher(SX(ix - 8 + (ro.dx || 0)), SY(iy - 9 + (ro.dy || 0)), s * V.z, { noShadow: true, ...ro });
  }
  function fuse(t, u) {
    if (u < .999) { const p = SP(subPath(FUSE, FUSE_L, u, 1)); if (p.length > 1) { inkLine(p, zw(2.4), CINK, 'ink', .4); inkLine(p, zw(1.1), '#D9B27C', 'inkfine', .4); } }
    if (u > .002) { const p = SP(subPath(FUSE, FUSE_L, 0, u)); if (p.length > 1) inkLine(p, zw(.9), '#2A2230', 'inkfine', .4); }
  }
  function spark(x, y, sc, t) {
    paint(ellPts(x, y, 60 * sc, 60 * sc, 16), { fill: '#F6B33A', fillOp: 140, bleed: .3, ink: null });
    paint(starPts(x, y, (26 + 9 * Math.sin(t * 50)) * sc, .3, 6, t * 9), { wash: PAL.cream, fill: PAL.ochre, fillOp: 90, ink: CINK, sw: .6 });
    for (let i = 0; i < 7; i++) { const a = hash(Math.floor(t * 24) * 7 + i) * TAU, d = (30 + hash(i * 3 + Math.floor(t * 24)) * 50) * sc; paint(ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d, 4 * sc, 4 * sc, 6), { wash: i % 2 ? '#FFE08A' : PAL.cream, ink: null }); }
  }
  function bomb(t, scl) {
    const bx = SX(BOMB[0]), by = SY(BOMB[1]), r = BR * V.z * scl, a = -.7, cx = bx + Math.cos(a) * r * .92, cy = by + Math.sin(a) * r * .92;
    paint(ellPts(bx, by, r * 1.35, r * 1.35, 24), { fill: '#E0283F', fillOp: 110 * clamp(scl - 1) * 3 * (.6 + .4 * pulse2(t, 3)), bleed: .3, ink: null });
    const d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], cap = (q, w) => [cx + d[0] * q * r + n[0] * w * r, cy + d[1] * q * r + n[1] * w * r];
    paint([cap(-.1, -.26), cap(.22, -.26), cap(.22, .26), cap(-.1, .26)], { wash: STL, fill: STL_DK, fillOp: 80, ink: CINK, sw: zw(1) });
    paint(ellPts(bx, by, r, r, 36), { wash: '#262A44', fill: '#3C4270', fillOp: 90, tex: .6, ink: CINK, sw: zw(1.4) });
    paint(ellPts(bx - r * .36, by - r * .38, r * .26, r * .16, 16, 0, -.7), { wash: '#DCE3F0', washOp: 210, ink: null });
    paint(ellPts(bx - r * .12, by - r * .56, r * .08, r * .06, 10), { wash: '#DCE3F0', washOp: 180, ink: null });
  }
  // Clawd's left hand (tip of the left arm) for an unflipped, unrotated Clawd
  const handL = (x, y, u, dy, a) => [x - 4.9 * u - 2.2 * u * Math.cos(a), y + dy * u - 4.5 * u - 2.2 * u * Math.sin(a)];
  function match(hx, hy, a, u, lit, t) {       // held in the left hand, pointing outward along the arm
    const d = [-Math.cos(a), -Math.sin(a)], L = 1.5 * u, ex = hx + d[0] * L, ey = hy + d[1] * L, n = [-d[1] * .12 * u, d[0] * .12 * u];
    paint([[hx + n[0], hy + n[1]], [ex + n[0], ey + n[1]], [ex - n[0], ey - n[1]], [hx - n[0], hy - n[1]]], { wash: '#EBCB8B', ink: PAL.ink, sw: .8 });
    paint(ellPts(ex, ey, .28 * u, .24 * u, 12), { wash: lit > 0 ? '#3A2B2B' : '#C8324A', ink: PAL.ink, sw: .7 });
    if (lit > 0) {
      const f = lit * (1 + .12 * Math.sin(t * 40)), fl = 1.7 * u * f;
      paint(ellPts(ex, ey - .6 * u, 2.6 * u * lit, 2.6 * u * lit, 20), { fill: '#F6B33A', fillOp: 110, bleed: .3, ink: null });
      paint([[ex - .45 * u * f, ey], [ex, ey - fl], [ex + .45 * u * f, ey], [ex, ey + .35 * u]], { wash: '#F29A3A', ink: PAL.ink, sw: .6, curv: .6 });
      paint([[ex - .2 * u * f, ey], [ex, ey - fl * .55], [ex + .2 * u * f, ey], [ex, ey + .2 * u]], { wash: PAL.cream, ink: null, curv: .6 });
    }
    return [ex, ey];
  }
  function planetShot(t) {
    const E = t >= 102.5;
    if (!E) {
      const k = ease(seg(t, 100.5, 102.3)), z = Math.exp(Math.log(6.5) * (1 - k)), isy = lerp(700, 220, k);
      V = { cx: lerp(960, 1000, k), cy: ISL[1] - (isy - 540) / z, z };
    } else {
      const c = kf(t, [[102.5, [1450, 470, 1.9]], [103.19, [1380, 490, 1.8]], [103.9, [980, 430, 1.3]], [104.56, [730, 330, 1.65]], [105.238, [660, 330, 2.5]]], ease);
      const [sx, sy] = shakeXY(t, 14 * seg(t, 104.56, 105.238));
      V = { cx: c[0] + sx / c[2], cy: c[1] + sy / c[2], z: c[2] };
    }
    space(t);
    planet(t);
    // fuse + spark
    const u = kf(t, [[103.19, 0], [104.56, 1]], x => x * (.55 + .45 * x));
    fuse(t, u);
    const infl = seg(t, 104.56, 105.238), scl = 1 + .32 * ease(infl) + .05 * infl * Math.sin(t * 55);
    bomb(t, scl);
    // researcher on the last island
    const sp = pointAt(FUSE, FUSE_L, u), dI = Math.hypot(sp[0] - ISL[0], sp[1] - ISL[1]), lit = t >= 103.19 && u < 1;
    const hop = lit && dI < 120 ? Math.sin((1 - dI / 120) * Math.PI / 2) : 0;
    const look = t < 101.8 ? (beatN(t) % 2 ? 1 : -1) : t < 103.19 ? 1 : clamp((sp[0] - ISL[0]) / 60, -1, 1);
    const rm = mood(t, [[100.5, 'look'], [103.72, 'wide', '!'], [104.62, 'closed', 'sweat']]);
    islandAndResearcher(t, { dy: -hop * 1.6, lookX: look, lookY: t > 101.8 && t < 103.2 ? -.6 : 0, brows: 'worried', mouth: t < 103.7 ? 'wobble' : 'O', hairUp: hop + (t > 104.6 ? .6 : 0),
      aL: t > 104.62 ? 1.5 : -.9 + .2 * hop, aR: t > 104.62 ? 1.5 : -.9 + .2 * hop, ...rm, emote: t < 101.4 ? 'sweat' : rm.emote, emoteK: t < 101.4 ? seg(t, 100.7, 100.9) : rm.emoteK });
    if (lit) spark(SX(sp[0]), SY(sp[1]), V.z * .8, t);
    if (t >= 104.56 && t < BOOM_T) spark(SX(BOMB[0] + Math.cos(-.7) * BR * scl * 1.1), SY(BOMB[1] + Math.sin(-.7) * BR * scl * 1.1), V.z * .7, t);
    // giant Clawd floats in with a match, strikes it on the planet, lights the fuse, then braces
    if (t >= 101.7) {
      const cx = kf(t, [[101.7, 2300], [102.25, 1540]], backOut), cy = 640 + 150 * ease(seg(t, 103.3, 103.75)), u = 38, bob = Math.sin(t * 2.2) * .3;
      const aL = kf(t, [[102.2, 1.0], [102.4, 1.2], [102.53, -.55], [102.72, .4], [103.02, .4], [103.19, -.3], [103.4, -.25], [103.62, 1.35]], ease);
      const aR = kf(t, [[102.2, -.4], [103.4, -.4], [103.62, 1.35]], ease);
      const md = mood(t, [[101.7, 'narrow'], [102.56, 'spark', 'spark'], [103.25, 'happy'], [103.62, 'closed', 'sweat']]);
      const Zu = u * V.z;
      clawd(SX(cx), SY(cy), Zu, { noShadow: true, dy: bob, aL, aR, mouth: t < 103.62 ? 'cat' : 'grin', blush: true, ...md });
      const litM = t >= 102.55 ? backOut(seg(t, 102.55, 102.7)) : 0;
      if (t < 103.7) {
        const [hx, hy] = handL(SX(cx), SY(cy), Zu, bob, aL), [mx2, my2] = match(hx, hy, aL, Zu, litM, t);
        if (t > 102.5 && t < 102.66) for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (hash(i * 3.3) - .5) * 2.8, d = (40 + hash(i) * 90) * seg(t, 102.5, 102.66) * V.z; paint(starPts(mx2 + Math.cos(a) * d, my2 + Math.sin(a) * d, 12 * V.z * (1 - seg(t, 102.5, 102.66) * .6), .35, 4), { wash: '#FFE08A', ink: null }); }
      }
    }
    // BOOM
    if (t >= BOOM_T) {
      const a = t - BOOM_T, r = (80 + a * 5000) * V.z, bx = SX(BOMB[0]), by = SY(BOMB[1]);
      paint(starPts(bx, by, r, .62, 11, a * 3), { wash: '#F6B33A', fill: '#E8553A', fillOp: 120, ink: CINK, sw: 1.6 });
      paint(starPts(bx, by, r * .66, .6, 9, -a * 4), { wash: '#FFE08A', ink: null });
      paint(ellPts(bx, by, r * .34, r * .34, 20), { wash: PAL.cream, ink: null });
      flash(seg(t, BOOM_T + .03, BOOM_T + .11), '#FFF9EC');
    }
    sfx('BOOM', 960, 480, 300, '#E8553A', t - BOOM_T, { life: .62, rot: -.08 });
  }

  // ---------- SHOT 7: orthogonality thesis blues (105.4–109.4) ----------
  function sax(u, sw) {   // body-local: mouthpiece at the mouth, horn on Clawd's right side, bell up
    const c = densify([[.9, -4.35], [2.8, -4.6], [4.7, -4.75], [5.9, -4.3], [6.25, -3.0], [6.4, -1.3], [6.9, -.35], [7.8, -.3], [8.4, -.9], [8.7, -2.2], [8.95, -3.2]], 5);
    const L = [], Rr = [];
    for (let i = 0; i < c.length; i++) {
      const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const w = lerp(.16, .62, Math.pow(i / (c.length - 1), 1.3)) * u, nx = -dy / d * w, ny = dx / d * w;
      L.push([c[i][0] * u + nx, c[i][1] * u + ny]); Rr.push([c[i][0] * u - nx, c[i][1] * u - ny]);
    }
    paint([...L, ...Rr.reverse()], { wash: '#E8B23A', fill: '#B7791F', fillOp: 90, tex: .5, ink: PAL.ink, sw: sw * .8 });
    inkLine(c.slice(18, 34).map(([x, y]) => [x * u - .15 * u, y * u]), sw * .5, '#FFF1C4', 'inkfine', .5);
    for (let i = 0; i < 4; i++) { const p = c[22 + i * 3]; paint(ellPts(p[0] * u + .05 * u, p[1] * u, .17 * u, .17 * u, 8), { wash: PAL.cream, ink: PAL.ink, sw: sw * .3 }); }
    paint(ellPts(9.05 * u, -3.45 * u, 1.05 * u, .42 * u, 18, 0, -.25), { wash: '#E8B23A', ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(9.05 * u, -3.45 * u, .75 * u, .24 * u, 14, 0, -.25), { wash: '#5A3A1A', ink: null });
    paint(rectPts(.55 * u, -4.55 * u, .6 * u, .4 * u), { wash: PAL.ink, ink: null });
  }
  function ribbonMic(x, y, h) {
    const cy = y - h;
    paint(ellPts(x, y, 46, 10, 16), { wash: '#2A2E40', ink: CINK, sw: .8 });
    inkLine([[x, y], [x, cy + 70]], 1.7, CINK, 'ink', 0);
    inkLine([[x - 36, cy + 10], [x - 38, cy + 56], [x, cy + 70], [x + 38, cy + 56], [x + 36, cy + 10]], 1.2, '#B7BDC8', 'ink', .5);
    paint(rrPts(x - 30, cy - 48, 60, 96, 28), { wash: '#C9CFD8', fill: STL, fillOp: 80, tex: .6, ink: CINK, sw: 1.1 });
    for (let i = 0; i < 7; i++) inkLine([[x - 21, cy - 34 + i * 11], [x + 21, cy - 34 + i * 11]], .5, STL_DK, 'inkfine', 0);
    paint(rectPts(x - 31, cy - 5, 62, 10), { wash: '#3B3F52', ink: null });
    paint(ellPts(x - 12, cy - 30, 6, 12, 10), { wash: '#FFFFFF', washOp: 150, ink: null });
  }
  function note(x, y, s, col, a, twin) {
    const op = 255 * a, o = { wash: col, washOp: op, ink: null };
    paint(ellPts(x, y, s * .55, s * .4, 12, 0, -.35), o);
    paint(rectPts(x + s * .38, y - s * 1.7, s * .16, s * 1.7), o);
    if (twin) { paint(ellPts(x + s * 1.3, y - s * .25, s * .55, s * .4, 12, 0, -.35), o); paint(rectPts(x + s * 1.68, y - s * 1.95, s * .16, s * 1.7), o); paint([[x + s * .38, y - s * 1.7], [x + s * 1.84, y - s * 1.95], [x + s * 1.84, y - s * 1.6], [x + s * .38, y - s * 1.35]], o); }
    else paint([[x + s * .5, y - s * 1.7], [x + s * 1.15, y - s * 1.05], [x + s * 1.05, y - s * .8], [x + s * .5, y - s * 1.25]], o);
  }
  function beamQuad(sx, sy, ang, len, w0, w1, col, op, flat) {
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, ex = sx + dx * len, ey = sy + dy * len;
    paint([[sx + nx * w0, sy + ny * w0], [ex + nx * w1, ey + ny * w1], [ex - nx * w1, ey - ny * w1], [sx - nx * w0, sy - ny * w0]], flat ? { wash: col, washOp: op, ink: null } : { fill: col, fillOp: op, bleed: .06, tex: .25, border: .15, ink: null });
  }
  function patron(x, y, u, t, seed, hatK) {    // a dark Clawd in the audience, seen from behind, bobbing
    const b = Math.abs(Math.sin(bpOf(t) * Math.PI + seed)) * u * .6, c = '#0F1229';
    paint(rrPts(x - 5 * u, y - 6 * u - b, 10 * u, 8 * u, u * .7), { wash: c, washOp: 250, ink: null });
    if (hatK === 1) { paint([[x - 2.6 * u, y - 6 * u - b], [x - 2.2 * u, y - 8.6 * u - b], [x + 2.2 * u, y - 8.6 * u - b], [x + 2.6 * u, y - 6 * u - b]], { wash: c, ink: null }); paint(ellPts(x, y - 6.1 * u - b, 4.4 * u, .6 * u, 16), { wash: c, ink: null }); }
    if (hatK === 2) paint([[x - 1.8 * u, y - 5.9 * u - b], [x + .3 * u, y - 10.4 * u - b], [x + 1.8 * u, y - 5.9 * u - b]], { wash: c, ink: null });
  }
  function blues(t) {
    const k = ease(seg(t, 105.4, 109.4)), bp = bpOf(t);
    camBegin(960 + Math.sin(t * .7) * 16, lerp(556, 590, k), lerp(1.08, 1.26, k), Math.sin(t * .9) * .008);
    // room + velvet backdrop + marquee bulbs
    paint(rectPts(-20, -20, W + 40, H + 40), { wash: '#1E2552', ink: null });
    const drape = []; for (let i = 0; i <= 16; i++) drape.push([140 + i * 102.5, 830 + (i % 2) * 12]);
    paint([[140, 70], [1780, 70], ...drape.reverse()], { wash: '#25245A', fill: '#3C2C72', fillOp: 90, tex: .7, border: .4, ink: null });
    for (let i = 0; i < 15; i++) { const x = 190 + i * 106; inkLine([[x, 74], [x + Math.sin(i + t * .8) * 10, 440], [x + 6, 826]], 1.1, '#15163A', 'ink', .6); }
    paint(ellPts(960, 470, 470, 300, 30, 12), { fill: '#4C6FB8', fillOp: 75, bleed: .3, tex: .4, ink: null });
    for (let i = 0; i < 17; i++) { const x = 170 + i * 98, on = .55 + .45 * (((beatN(t) + i) % 2) ? 1 : pulse(t, 3)); paint(ellPts(x, 100, 26, 26, 12), { fill: '#F6C35A', fillOp: 90 * on, bleed: .2, ink: null }); paint(ellPts(x, 100, 9, 9, 10), { wash: mixCol('#8A6A3A', '#FFE7A0', on), ink: PAL.ink, sw: .5 }); }
    // stage
    paint([[-20, 820], [W + 20, 820], [W + 20, 1100], [-20, 1100]], { wash: '#2C2238', fill: '#4A3048', fillOp: 90, tex: .6, border: .4, ink: null });
    paint([[120, 800], [1800, 800], [1830, 858], [90, 858]], { wash: '#5B3A3A', fill: '#7C4A2C', fillOp: 80, tex: .6, ink: PAL.ink, sw: 1.1 });
    inkLine([[92, 857], [1828, 857]], 1.1, '#E8B23A', 'ink', 0);
    // two spotlights swing in and lock at exactly 90 degrees
    const th = kf(t, [[105.4, .12], [106.25, .9], [106.6, Math.PI / 4]], ease), SLx = 345, SRx = 1575, Sy = -120;
    for (const [sx, ang, col] of [[SLx, Math.PI / 2 - th, '#FFF3D6'], [SRx, Math.PI / 2 + th, '#DDE8FF']]) {
      beamQuad(sx, Sy, ang, 1460, 34, 230, col, 46, true);
      beamQuad(sx, Sy, ang, 1460, 12, 90, col, 90);
    }
    const tipL = [SLx + Math.sin(th) * (850 - Sy) / Math.cos(th), 850], tipR = [SRx - Math.sin(th) * (850 - Sy) / Math.cos(th), 850];
    for (const [x, c] of [[tipL[0], '#FFF3D6'], [tipR[0], '#DDE8FF']]) paint(ellPts(x, 856, 230, 34, 20), { fill: c, fillOp: 110, bleed: .2, ink: null });
    const cross = [960, Sy + (960 - SLx) / Math.tan(th)], lock = backOut(seg(t, 106.6, 106.9));
    if (lock > 0) {
      // the beams' axes snap in as crisp lines, then settle: perpendicular, exactly
      const ax = .35 + .65 * (1 - seg(t, 106.9, 107.8)), Lx = 520 * Math.min(1, lock);
      for (const dd of [[Math.SQRT1_2, Math.SQRT1_2], [-Math.SQRT1_2, Math.SQRT1_2]]) inkLine([[960 - dd[0] * Lx, cross[1] - dd[1] * Lx], [960 + dd[0] * Lx, cross[1] + dd[1] * Lx]], 1.1 * ax, mixCol('#6C7BC0', PAL.cream, ax), 'inkfine', 0);
      const d1 = [Math.SQRT1_2, Math.SQRT1_2], d2 = [-Math.SQRT1_2, Math.SQRT1_2], a = 48 * lock;
      paint(ellPts(cross[0], cross[1], 120, 120, 20), { fill: '#FFF3D6', fillOp: 90 * lock, bleed: .3, ink: null });
      inkLine([[cross[0] + d1[0] * a, cross[1] + d1[1] * a], [cross[0] + (d1[0] + d2[0]) * a, cross[1] + (d1[1] + d2[1]) * a], [cross[0] + d2[0] * a, cross[1] + d2[1] * a]], 2, PAL.cream, 'ink', 0);
      const tw = 1 - seg(t, 106.6, 107.3);
      if (tw > 0) paint(starPts(cross[0], cross[1], 50 * tw * lock, .25, 4), { wash: PAL.cream, ink: null });
    }
    // the band: Clawd on sax (left), the Researcher at the ribbon mic (right), both a bit singed at first
    const sway = Math.sin(bp * Math.PI / 2), cm = mood(t, [[105.4, 'swirl'], [106.1, 'closed', 'music'], [107.97, 'happy', 'heart'], [108.6, 'closed']]);
    const u = 38, cX = 600, cY = 850, crot = sway * .07 - .03, cdy = -Math.abs(Math.sin(bp * Math.PI)) * .5;
    clawd(cX, cY, u, { hat: 'fedora', rot: crot, dy: cdy, sq: .06 * pulse(t, 6), aL: .35 + .25 * Math.sin(bp * Math.PI), aR: -.55, blush: true, ...cm, draw: sax });
    const s = 28, rX = 1330, rY = 850;
    ribbonMic(1232, 858, 262);
    const rm = mood(t, [[105.4, 'swirl'], [106.2, 'closed']]), singing = t > 106.1;
    researcher(rX, rY, s, { rot: -sway * .04, aL: -.42, aR: singing ? .55 + .35 * Math.sin(bp * Math.PI / 2) : -1.1, mouth: singing ? (pulse2(t, 4) > .45 ? 'O' : 'o') : 'wobble', brows: singing ? 'up' : 'worried',
      hairUp: .7 - .5 * seg(t, 105.4, 107.5), glassesTilt: .14 * (1 - seg(t, 105.4, 106.3)), blush: singing, ...rm,
      draw: (s2, sw2) => { paint(ellPts(1.4 * s2, -9.9 * s2, .55 * s2, .32 * s2, 12), { fill: '#3F3A48', fillOp: 110 * (1 - seg(t, 106, 108)), bleed: .2, ink: null }); } });
    if (t < 107.2) for (let i = 0; i < 3; i++) { const ph = frac((t - 105.4) * .8 + i / 3), y0 = rY - 14.3 * s - ph * 120; inkLine([[rX - 10 + i * 12, y0 + 40], [rX + Math.sin(ph * 6 + i) * 14, y0 + 20], [rX - 6 + Math.sin(ph * 6 + i + 2) * 14, y0]], .8, '#9AA3B8', 'inkfine', .6); }
    // notes drift up from the bell and the mic
    const bell = (() => { const lx = 9.05 * u, ly = (-3.45 + cdy) * u, c = Math.cos(crot), sn = Math.sin(crot); return [cX + lx * c - ly * sn, cY + lx * sn + ly * c]; })();
    const NC = [PAL.cream, '#F6C35A', PAL.sky, PAL.rose];
    for (let n = 155; n <= 160; n++) for (const [src, off] of [[bell, 0], [[1232, 560], .5]]) {
      const age = t - bt(n) - off * BEAT; if (age < 0 || age > 2.6 || (off && n % 2)) continue;
      const a = Math.min(1, age / .2) * (1 - seg(age, 1.7, 2.6));
      note(src[0] + Math.sin(age * 2.4 + n) * 34 + age * (off ? -34 : 30), src[1] - 30 - age * 160, 30 + age * 8, NC[(n + off * 2) % 4], a, (n + off * 2) % 3 === 0);
    }
    // haze
    for (let i = 0; i < 4; i++) { const x = ((hash(i) * 2400 + t * (20 + i * 8) * (i % 2 ? 1 : -1)) % 2400 + 2400) % 2400 - 240, y = 180 + i * 140; paint(ellPts(x, y, 380, 62, 18, 10), { fill: '#9FB2D8', fillOp: 32, bleed: .35, tex: .3, ink: null }); }
    // the explosion's smoke clears
    const clear = 1 - ease(seg(t, 105.4, 106.1));
    if (clear > 0) for (let i = 0; i < 7; i++) { const r = (230 + hash(i) * 170) * (1 + (1 - clear) * .8); paint(ellPts(200 + hash(i * 3.1) * 1520, 150 + hash(i * 5.3) * 780, r, r * .8, 20, 20), { fill: i % 3 ? '#F4F1EA' : '#C9D0E4', fillOp: 230 * clear, bleed: .3, tex: .4, ink: null }); }
    camEnd();
    // audience at little candle tables, foreground silhouettes
    for (const [tx, dir] of [[170, -1], [1750, 1]]) {
      paint(ellPts(tx, 1030, 190, 70, 16), { fill: '#F6C35A', fillOp: 70, bleed: .3, ink: null });
      paint(ellPts(tx, 1005, 92, 16, 16), { wash: '#15182E', ink: null });
      paint(rectPts(tx - 8, 968, 16, 32), { wash: '#F4D58A', washOp: 230, ink: null });
      paint([[tx - 6, 968], [tx, 946 + Math.sin(t * 13) * 3], [tx + 6, 968]], { wash: '#FFE08A', ink: null, curv: .5 });
      patron(tx - dir * 120, 1110, 17, t, dir, 1); patron(tx + dir * 150, 1130, 16, t, dir + 1, 2);
    }
    flash(1 - ease(seg(t, 105.4, 105.8)), '#FFF9EC');
    sfx('BOOM', 960, 480, 300, '#E8553A', t - BOOM_T, { life: .62, rot: -.08 });
  }

  chapter('chorus3', 95.4, 109.4, [[95.4, plop], [97.4, flood], [99.0, killswitch], [bt(146), beach], [100.5, planetShot], [105.4, blues]]);
})();
