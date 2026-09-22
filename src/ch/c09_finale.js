// c09_finale: the curtain call (140.5–156.6), crimson and gold. The whole cast runs on, bows down the line, the
// P(doom) meter gets pumped into a balloon and POPS, one last dance, then the house curtain drops with the title
// painted on it. The only lettering is that title and the small "created by" line.
(() => {
  const B = n => OFF + n * BEAT;
  const GY = 930, CRIMSON = '#C23B4E', HEAD = '#2A1F33';
  const CONF = [PAL.rose, PAL.ochre, PAL.sky, PAL.sap, PAL.violet, PAL.cream, GOLD];

  // ---------- the lineup ----------
  const LINE = [
    { k: 'shog', x: 350, s: 12.5, from: -1, ta: B(206.5) },
    { k: 'chin', x: 555, s: 13.5, from: -1, ta: B(207.5) },
    { k: 'syd', x: 745, s: 13, from: -1, ta: B(208.5) },
    { k: 'res', x: 922, s: 14, from: 0, ta: B(209) },
    { k: 'clawd', x: 1112, s: 17, from: 0, ta: B(209) },
    { k: 'gato', x: 1318, s: 13, from: 1, ta: B(208) },
    { k: 'bas', x: 1525, s: 12, from: 1, ta: B(207) },
  ];
  const IDLE = { dy: 0, sq: 0, aL: .3, aR: .3, rot: 0, sx: 1, dx: 0, walk: null };

  // A crowned basilisk, used only if the chorus-2 chapter didn't export one.
  function basiliskFallback(x, y, s, t, o = {}) {
    const b = clamp(o.bow || 0), sw = clamp(s / 15, .45, 2.4), G = '#5FA56B', GD = '#2F6B45', sq = o.sq || 0;
    if (!o.noShadow) paint(ellPts(x, y + s * .1, s * 5.6, s * .9, 18), { fill: PAL.ink, fillOp: 80, bleed: .2, tex: .3, border: .1, ink: null });
    push(); translate(x, y + (o.dy || 0) * s); if (o.rot) rotate(o.rot); scale((o.flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
    paint(ellPts(0, -1.5 * s, 5.4 * s, 1.7 * s, 24), { wash: G, fill: GD, fillOp: 70, tex: .6, ink: PAL.ink, sw });
    paint(ellPts(.3 * s, -3.9 * s, 4.3 * s, 1.45 * s, 24), { wash: G, fill: GD, fillOp: 60, tex: .6, ink: PAL.ink, sw });
    for (let k = -3; k <= 3; k++) inkLine([[k * 1.2 * s, -.6 * s], [k * 1.25 * s + .3 * s, -2.4 * s]], sw * .5, GD, 'inkfine', .3);
    const hx = lerp(.6, 2.6, b) * s, hy = lerp(-9.2, -6.2, b) * s;
    paint([[-1.1 * s, -4.6 * s], [1.3 * s, -4.6 * s], [hx + 1 * s, hy + .6 * s], [hx - 1.2 * s, hy + .8 * s]], { wash: G, fill: GD, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .9, curv: .4 });
    push(); translate(hx, hy); rotate(b * .6);
    paint(ellPts(0, 0, 2.7 * s, 2 * s, 22), { wash: G, fill: '#8FCB8C', fillOp: 70, tex: .5, ink: PAL.ink, sw });
    paint([[-1.6 * s, -1.6 * s], [-1.6 * s, -3.4 * s], [-.6 * s, -2.4 * s], [.3 * s, -3.7 * s], [1.1 * s, -2.4 * s], [1.9 * s, -3.4 * s], [1.9 * s, -1.6 * s]], { wash: '#F2C53D', fill: PAL.ochre, fillOp: 80, ink: PAL.ink, sw: sw * .7 });
    for (const ex of [-.9, 1.1]) {
      if (b > .35 || o.eyes === 'happy') inkLine([[ex * s - .45 * s, -.2 * s], [ex * s, -.7 * s], [ex * s + .45 * s, -.2 * s]], sw * 1.2, PAL.ink, 'ink', .5);
      else { paint(ellPts(ex * s, -.4 * s, .62 * s, .75 * s, 14), { wash: '#FFFDF3', ink: PAL.ink, sw: sw * .6 }); paint(ellPts(ex * s + .12 * s, -.3 * s, .3 * s, .42 * s, 10), { wash: PAL.ink, ink: null }); }
    }
    paint(ellPts(-1.6 * s, .6 * s, .45 * s, .25 * s, 10), { fill: PAL.rose, fillOp: 150, bleed: .2, ink: null });
    if (b < .3 && Math.sin(t * 9) > .2) inkLine([[.4 * s, 1.5 * s], [.6 * s, 2.5 * s], [.2 * s, 2.9 * s], [.6 * s, 2.5 * s], [1 * s, 2.9 * s]], sw * .8, '#D8394E', 'ink', 0);
    pop(); pop();
  }

  // draw one cast member in pose p = { m: move-ish offsets, bow 0..1, flip, eyes, mouth, arms override, hairUp, emote, emoteK }
  function who(c, x, y, t, p = {}) {
    const m = p.m || IDLE, b = clamp(p.bow || 0), s = c.s;
    const aL = p.aL ?? m.aL, aR = p.aR ?? m.aR;
    const common = { dy: m.dy, sq: m.sq, rot: m.rot, sx: m.sx, flip: p.flip, walk: m.walk, emote: p.emote, emoteK: p.emoteK };
    switch (c.k) {
      case 'clawd':
        clawd(x + m.dx * s, y, s, { ...common, hat: 'top', blush: true, eyes: b > .3 ? 'happy' : p.eyes || 'happy', mouth: p.mouth || 'smile',
          rot: m.rot + b * .15, dy: m.dy + b * .5, sy: 1 - .24 * b, aL: lerp(aL, -1.1, b), aR: lerp(aR, -1.1, b), ...(p.x || {}) }); break;
      case 'res':
        researcher(x + m.dx * s, y, s, { dy: m.dy * .8, sq: m.sq + .2 * b, rot: m.rot * .6, flip: p.flip, run: p.run, bowtie: true, blush: true,
          eyes: b > .3 ? 'closed' : p.eyes || 'dot', mouth: p.mouth || 'grin', brows: p.brows, hairUp: p.hairUp || 0,
          aL: lerp(p.aL ?? (m.aL - 1.25), -.55, b), aR: lerp(p.aR ?? (m.aR - 1.25), -.55, b), emote: p.emote, emoteK: p.emoteK, ...(p.x || {}) }); break;
      case 'syd':
        if (CAST.sydney) CAST.sydney(x + m.dx * s, y, s, t, { ...common, bow: b, aL, aR, ...(p.x || {}) });
        else clawd(x + m.dx * s, y, s, { ...common, col: '#E27A92', eyes: 'heart', blush: true, rot: m.rot + b * .15, sy: 1 - .24 * b, aL: lerp(aL, -1.1, b), aR: lerp(aR, -1.1, b) });
        break;
      case 'gato':
        if (CAST.gato) CAST.gato(x + m.dx * s, y, s, t, { ...common, bow: b, aL, aR, ...(p.x || {}) });
        else clawd(x + m.dx * s, y, s, { ...common, hat: 'cat', eyes: b > .3 ? 'happy' : 'dot', rot: m.rot + b * .15, sy: 1 - .24 * b, aL: lerp(aL, -1.1, b), aR: lerp(aR, -1.1, b) });
        break;
      case 'shog':
        if (CAST.shoggoth) { const { eyes, ...px } = p.x || {}; CAST.shoggoth(x + m.dx * s, y - Math.max(0, -m.dy) * s * .4, s, t, { bow: b, mask: 1, wave: p.wave || 0, flip: p.flip, ...px }); }
        else basiliskFallback(x, y, s, t, { bow: b, ...m });
        break;
      case 'chin':
        if (CAST.chinchilla) CAST.chinchilla(x + m.dx * s, y, s, t, { bow: b, dy: m.dy * .8, sq: m.sq, rot: m.rot, eyes: b > .3 ? 'happy' : p.eyes || 'happy', flip: p.flip, ...(p.x || {}) });
        else clawd(x, y, s, { ...common, col: '#ABA8BE', dk: '#76728F', lt: '#EDE8F1', eyes: 'happy' });
        break;
      case 'bas':
        (CAST.basilisk || basiliskFallback)(x + m.dx * s, y, s, t, { bow: b, dy: m.dy, sq: m.sq, rot: m.rot, flip: p.flip, ...(p.x || {}) }); break;
    }
  }

  // ---------- set pieces ----------
  function house(t, o = {}) {
    stageBack(t, {
      spots: o.spots,
      backdrop: tt => {
        paint(rectPts(-400, -400, W + 800, 1240), { wash: '#F6E3C8', washOp: 255, ink: null });
        sunburst(960, 430, CRIMSON, GOLD, tt * (o.spin || .12), 16, 1300, o.burstOp || 120);
      }
    });
    // footlights along the stage lip
    for (let i = 0; i < 11; i++) {
      const fx = 110 + i * 170, on = .6 + .4 * pulse(t + i * .05, 3);
      paint(ellPts(fx, 1040, 46, 14, 14), { fill: '#FFE7A8', fillOp: 110 * on, bleed: .25, tex: .2, ink: null });
      paint(rrPts(fx - 22, 1030, 44, 20, 8), { wash: GOLD, ink: PAL.ink, sw: .7 });
    }
  }
  // audience silhouettes in the front row, screen space (call after camEnd)
  function audience(t, cheer = 0) {
    const bp = bpOf(t);
    for (let i = 0; i < 12; i++) {
      const x = -30 + i * 176 + hash(i + 70) * 40, bob = Math.abs(Math.sin((bp + hash(i) * .5) * Math.PI)) * (4 + 12 * cheer);
      const y = 1098 - bob + (i % 2) * 20, r = 74 + hash(i + 71) * 26;
      if (cheer > .15 && i % 3 !== 1) for (const sd of [-1, 1]) {
        const a = -Math.PI / 2 + sd * (.45 + .25 * Math.sin(bp * TAU + i)), L = r * 1.5 * cheer;
        const sx = x + sd * r * .7, sy = y - r * .1;
        inkLine([[sx, sy], [sx + Math.cos(a) * L * .6, sy + Math.sin(a) * L * .6], [sx + Math.cos(a) * L, sy + Math.sin(a) * L]], 5.5, HEAD, 'marker', .4);
        paint(ellPts(sx + Math.cos(a) * L, sy + Math.sin(a) * L, 16, 16, 10), { wash: HEAD, ink: null });
      }
      paint(ellPts(x, y, r, r * 1.05, 18), { wash: HEAD, fill: PAL.violet, fillOp: 45, tex: .4, border: .3, ink: null });
      inkLine([[x - r * .7, y - r * .72], [x, y - r * 1.04], [x + r * .7, y - r * .72]], .7, GOLD, 'inkfine', .6);
    }
  }
  function puff(x, y, age, dir = 1) {
    if (age < 0 || age > .5) return;
    for (let k = 0; k < 3; k++) {
      const r = (18 + k * 8) * (.4 + easeOut(age / .5)), op = 170 * (1 - age / .5);
      paint(ellPts(x - dir * (20 + k * 34) * easeOut(age / .4), y - 8 - k * 6, r, r * .75, 12), { fill: '#EADBC4', fillOp: op, bleed: .15, tex: .3, ink: null });
    }
  }
  // falling confetti in screen space, starting at t0
  function confettiRain(t, t0, n = 44) {
    if (t < t0) return;
    for (let i = 0; i < n; i++) {
      const ti = t0 + hash(i + 300) * 1.1; if (t < ti) continue;
      const age = t - ti, v = 230 + hash(i + 301) * 220, span = 1200;
      const y = -40 + (age * v) % span, x = hash(i + 302) * 2040 - 60 + Math.sin(age * 2.2 + i) * 50;
      push(); translate(x, y); rotate(age * (2 + hash(i) * 4) + i); scale(Math.cos(age * 7 + i), 1);
      paint(rectPts(-11, -6, 22, 12), { wash: CONF[i % CONF.length], ink: null });
      pop();
    }
  }
  // roses thrown from the audience, landing at the cast's feet (world space)
  const FLOWERS = Array.from({ length: 18 }, (_, i) => {
    const c = LINE[(i * 3) % 7], tl = B(210.4 + i * .19) + .55;
    return { tl, x1: c.x + (hash(i + 90) - .5) * 110, y1: GY + 18 + hash(i + 91) * 40, x0: c.x + (hash(i + 92) - .5) * 500, r: (hash(i + 93) - .5) * 2.4, col: i % 3 ? '#D8394E' : PAL.rose };
  });
  function rose(x, y, rot, col, s = 1) {
    push(); translate(x, y); rotate(rot); scale(s);
    inkLine([[0, 0], [4, 26], [2, 52]], 1.1, '#3E7A3A', 'ink', .5);
    paint([[3, 30], [18, 20], [8, 38]], { wash: PAL.sap, ink: null });
    paint(ellPts(0, -6, 17, 15, 14), { wash: col, fill: '#8E1F33', fillOp: 70, tex: .5, ink: PAL.ink, sw: .7 });
    inkLine([[-6, -8], [2, -13], [7, -5], [0, 0]], .7, '#8E1F33', 'inkfine', .6);
    pop();
  }
  function flowers(t) {
    for (const f of FLOWERS) {
      const a = (t - (f.tl - .55)) / .55; if (a < 0) continue;
      if (a < 1) rose(lerp(f.x0, f.x1, a), lerp(1250, f.y1, a) - Math.sin(a * Math.PI) * 330, a * 9 + f.r, f.col);
      else rose(f.x1, f.y1, Math.PI / 2 + f.r * .3, f.col, .95);
    }
  }
  // trapdoor at centre stage: hole + (optional) front lip drawn after whoever rises out of it
  const HX = 1020, HY = 950;
  function trapHole(open) {
    if (open < .02) return;
    const rx = 250 * open, ry = 50 * open;
    paint(rectPts(HX - rx, HY - 120 * open, rx * 2, 120 * open, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 60, tex: .6, ink: PAL.ink, sw: 1 });
    paint(ellPts(HX, HY, rx, ry, 28), { wash: '#2A1A22', ink: PAL.ink, sw: 1.2 });
  }
  function trapLip(open) {
    if (open < .02) return;
    const rx = 250 * open, ry = 50 * open, lip = [];
    for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; lip.push([HX + Math.cos(a) * rx, HY + Math.sin(a) * ry]); }
    paint([...lip, [HX - rx - 40, 1400], [HX + rx + 40, 1400]], { wash: WOOD, fill: WOOD_DK, fillOp: 60, bleed: .05, tex: .8, border: .6, ink: null });
    inkLine(lip, 1.1, PAL.ink, 'ink', .4);
  }
  function burstConfetti(x, y, age, n = 18, v0 = 600, up = -Math.PI / 2, spread = 2.6) {
    if (age < 0 || age > 2.2) return;
    for (let i = 0; i < n; i++) {
      const a = up + (hash(i + 7) - .5) * spread, v = v0 * (.6 + hash(i + 8) * .8), drag = 1 - Math.exp(-age * 3);
      push(); translate(x + Math.cos(a) * v * drag / 3, y + Math.sin(a) * v * drag / 3 + 180 * age * age); rotate(age * 8 + i); scale(Math.cos(age * 9 + i), 1);
      paint(rectPts(-11, -6, 22, 12), { wash: CONF[i % CONF.length], ink: null });
      pop();
    }
  }

  // =================================================================================================
  // 140.5 · Places! The cast runs on from both wings and skids into a line; the Researcher and Clawd
  // pop up together through the trapdoor, just like Clawd did at the very start.
  // =================================================================================================
  function runOn(t, lt, dur) {
    camBegin(960, 722, 1.28 + .03 * ease(lt / dur), 0);
    house(t, { spots: [[520, PAL.cream], [1400, PAL.cream]] });
    const tr = B(209), open = easeOut(seg(t, tr - .45, tr - .3)) * (1 - easeOut(seg(t, 143.05, 143.35)));
    trapHole(open);
    const rise = seg(t, tr - .25, tr + .12);
    for (const c of LINE) {
      if (c.from === 0) {
        if (rise <= 0) continue;
        const y = lerp(GY + 330, GY, backOut(rise)), m = rise < 1 ? { ...IDLE, sq: -.2, aL: 1.2, aR: 1.2 } : { ...move('bounce', t), dx: 0 };
        who(c, c.x, y, t, { m, eyes: c.k === 'res' ? 'star' : 'happy', aL: c.k === 'res' && rise >= 1 ? .9 : undefined, aR: c.k === 'res' && rise >= 1 ? .9 : undefined, x: { noShadow: rise < 1 } });
        continue;
      }
      const run = seg(t, c.ta - .7, c.ta);
      if (run <= 0) continue;
      const x = lerp(c.from < 0 ? -260 : 2180, c.x, easeOut(run)), age = t - c.ta;
      let m;
      if (run < 1) m = { ...move('run', t), dx: 0, rot: .1 * -c.from };
      else m = { ...move('bounce', t + c.x * .001), dx: 0, sq: .28 * (1 - elasticOut(age / .45)) + move('bounce', t).sq };
      who(c, x, GY, t, { m, flip: c.from > 0 && run < 1, x: { eyes: run < 1 ? 'happy' : undefined } });
      if (run >= 1) puff(x, GY, age, -c.from);
    }
    trapLip(open);
    if (rise > 0) burstConfetti(HX, GY - 120, t - tr, 20, 900);
    stageFront(t, {});
    camEnd();
    audience(t, .15 + .5 * seg(t, tr, tr + .3));
  }

  // =================================================================================================
  // 143.4 · The bow ripples down the line, the camera riding along it; roses fly in from the house.
  // Then a pull-out and one big bow all together.
  // =================================================================================================
  const tb = i => B(210 + i * .4), GB = B(213);
  const bowAt = (t, t0, hold = .28) => ease(seg(t, t0, t0 + .22)) * (1 - ease(seg(t, t0 + .22 + hold, t0 + .5 + hold)));
  function bows(t, lt, dur) {
    const keys = LINE.map((c, i) => [tb(i), clamp(c.x, 560, 1380)]);
    let cx = kf(t, keys), cy = GY - 200, z = 1.8;
    const out = ease(seg(t, B(212.55), B(213)));
    cx = lerp(cx, 960, out); cy = lerp(cy, 722, out); z = lerp(z, 1.3, out);
    camBegin(cx, cy, z, 0);
    house(t, { spots: [[cx, PAL.cream]] });
    LINE.forEach((c, i) => {
      const b = Math.max(bowAt(t, tb(i)), bowAt(t, GB, .3)), m = { ...move('idle', t + i * .1), dx: 0 };
      const done = t > tb(i) + .6;
      who(c, c.x, GY, t, { m, bow: b, eyes: 'happy', wave: c.k === 'shog' ? seg(t, tb(0) + .6, tb(0) + .9) * (1 - seg(t, GB - .2, GB)) : 0,
        aL: c.k === 'clawd' || c.k === 'syd' || c.k === 'gato' ? (done && t < GB ? 1.2 + .2 * Math.sin(t * 14) : .3) : undefined,
        emote: done ? (c.k === 'res' ? 'heart' : c.k === 'clawd' ? 'spark' : undefined) : undefined, emoteK: seg(t, tb(i) + .5, tb(i) + .75) });
    });
    flowers(t);
    stageFront(t, {});
    camEnd();
    confettiRain(t, GB - .2, 36);
    audience(t, .7);
  }

  // =================================================================================================
  // 146.1 · Encore: Clawd bounces on the pump handle one last time… the meter swells into a balloon… POP.
  // The P(doom) sign flutters down; the Researcher and Clawd look at each other and grin.
  // =================================================================================================
  const TP = B(217);
  function balloonMeter(x, y, s, inf, t) {
    const col = '#D8394E', sw = clamp(1.3 * s, .5, 2.2), trem = inf > .95 && t < TP ? Math.sin(t * 70) * .03 : 0;
    const bw = 76 * (1 + 4.7 * inf) * (1 + trem), bh = 440 * (1 + .12 * inf) * (1 - trem), top = -110 - bh + 30;
    push(); translate(x, y); scale(s);
    paint(rectPts(-110, -30, 220, 30, 3), { wash: WOOD, fill: WOOD_DK, fillOp: 70, tex: .6, ink: PAL.ink, sw });
    paint(rectPts(-12, -80, 24, 55), { wash: WOOD_DK, ink: PAL.ink, sw: sw * .7 });
    paint(rrPts(-bw / 2, top, bw, bh, Math.min(bw, bh) / 2 * .98, 2), { wash: col, washOp: 240, fill: '#8E1F33', fillOp: 40 + 40 * inf, tex: .6, border: .5, ink: PAL.ink, sw });
    inkLine([[-bw * .3, top + bh * .12], [-bw * .38, top + bh * .3], [-bw * .34, top + bh * .5]], 1 + 2 * inf, '#FFFFFF', 'ink', .6);
    if (inf > .6) for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k - 1) * .5; inkLine([[Math.cos(a) * bw * .44, top + bh / 2 + Math.sin(a) * bh * .46], [Math.cos(a) * bw * .5, top + bh / 2 + Math.sin(a) * bh * .52]], .8, PAL.ink, 'inkfine', 0); }
    paint(ellPts(0, -92, 70, 70, 26, 2), { wash: col, washOp: 245, fill: PAL.ink, fillOp: 25, ink: PAL.ink, sw });
    paint(rrPts(-120, top - 90, 240, 70, 12, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 60, tex: .6, ink: PAL.ink, sw });
    pop();
    letter('P(DOOM)', x, y + (top - 55) * s, 46 * s, PAL.cream);
    return [x, y + (top + bh / 2) * s, bw * s, bh * s, y + (top - 55) * s];
  }
  function encore(t, lt, dur) {
    const bp = bpOf(t), n = Math.floor(bp - 214), f = frac(bp);
    const inf = t >= TP ? 1 : clamp((Math.max(0, n) + easeOut(clamp(f * 3))) / 3);
    const popped = t >= TP, age = t - TP;
    const [sx, sy] = popped ? shakeXY(t, 26 * (1 - seg(age, 0, .45))) : inf > .95 ? shakeXY(t, 3) : [0, 0];
    camBegin(1030 + sx, 640 - 50 * inf * (popped ? 1 - seg(age, 0, .6) : 1) + sy, 1.28 + .08 * inf, 0);
    house(t, { spots: [[1330, popped ? PAL.cream : '#FFD2C4'], [640, PAL.cream]] });
    flowers(t);
    // the Researcher, ears covered, then (after the pop) arms up in relief
    const R = LINE[3], relief = seg(t, TP + .35, TP + .55);
    const rm = popped ? { ...move('bounce', t), dx: 0, sq: .3 * (1 - elasticOut(age / .5)) } : { ...IDLE, dy: -Math.abs(Math.sin(bp * Math.PI)) * .3, sq: .05 * pulse(t) };
    researcher(640, GY, 14.5, { ...rm, dy: rm.dy * .8, bowtie: true, blush: popped && relief > 0, brows: popped ? undefined : 'worried',
      eyes: !popped ? (inf > .7 ? 'closed' : 'wide') : relief > 0 ? 'star' : 'swirl', mouth: !popped ? 'wobble' : relief > 0 ? 'grin' : 'O',
      hairUp: popped ? 1 - seg(age, .3, .9) : .3 * inf, aL: popped ? lerp(1.3, 1.25 + .3 * Math.sin(t * 12), relief) : 1.3, aR: popped ? lerp(1.3, 1.25 - .3 * Math.sin(t * 12), relief) : 1.3,
      emote: popped ? undefined : 'sweat', emoteK: seg(t, 146.3, 146.6) });
    // pump + Clawd riding the handle down on every beat
    const PX = 1010, PS = 1.05, h = popped ? .15 : pumpH(t);
    const [mx, my, mw, mh, signY] = popped ? [1330, GY - 104, 0, 0, 0] : balloonMeter(1330, GY, .95, inf, t);
    pumpProp(PX, GY, PS, h, [1330 - 55, GY - 88]);
    if (!popped) {
      const hop = Math.sin(f * Math.PI) * (f < .78 ? 1 : 0), cyy = GY - (270 + 150 * h) * PS;
      clawd(PX, cyy - hop * 40, 13, { hat: 'top', noShadow: true, sq: .25 * pulse(t, 9) - .1 * hop, aL: 1.1 + .3 * hop, aR: 1.1 + .3 * hop, eyes: bp > 216.3 ? 'narrow' : 'happy', mouth: bp > 216.3 ? 'grin' : 'smile', blush: true });
    } else {
      // blown clean off the pump: tumbles back, lands on its bottom, looks over at the Researcher, grins
      const a = seg(age, 0, .45), x = lerp(PX, PX - 170, easeOut(a)), y = lerp(GY - 290 * PS, GY, a) - Math.sin(a * Math.PI) * 170;
      const md = mood(t, [[TP, 'x'], [TP + .5, 'look'], [TP + .62, 'happy', 'heart']]);
      clawd(x, y, 13, { ...md, hat: 'top', rot: (1 - a) * -2.2, sq: a >= 1 ? .3 * (1 - elasticOut((age - .45) / .4)) : 0, lookX: -1, aL: a >= 1 ? 1.25 : 1.4, aR: a >= 1 ? 1.25 : 1.4, mouth: age < .5 ? 'O' : 'grin', blush: age > .5 });
      // what's left of the meter: the stand and a limp scrap
      push(); translate(1330, GY); scale(.95);
      paint(rectPts(-110, -30, 220, 30, 3), { wash: WOOD, fill: WOOD_DK, fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.2 });
      paint(rectPts(-12, -80, 24, 55), { wash: WOOD_DK, ink: PAL.ink, sw: .9 });
      paint([[-22, -80], [22, -80], [30, -120], [10, -104], [0, -140], [-12, -106], [-34, -118]], { wash: '#D8394E', ink: PAL.ink, sw: .9 });
      pop();
      // the burst
      const cy = GY - 380;
      if (age < .22) paint(starPts(1330, cy, 260 + 900 * easeOut(age / .22), .5, 12, age * 2), { wash: PAL.cream, fill: GOLD, fillOp: 90, ink: PAL.ink, sw: 1.4 });
      if (age < .45) paint(ellPts(1330, cy, 300 + 1300 * easeOut(age / .45), 260 + 1100 * easeOut(age / .45), 30), { fill: '#FFF3C8', fillOp: 160 * (1 - age / .45), bleed: .2, tex: .2, ink: null });
      for (let i = 0; i < 9; i++) {                        // rubber tatters
        const an = hash(i + 400) * TAU, v = 700 + hash(i + 401) * 600;
        push(); translate(1330 + Math.cos(an) * v * age, cy + Math.sin(an) * v * age + 900 * age * age); rotate(age * 10 * (hash(i) - .5) + an);
        paint([[-18, -8], [14, -12], [22, 4], [-4, 12], [-20, 6]], { wash: '#D8394E', ink: PAL.ink, sw: .6, curv: .5 });
        pop();
      }
      burstConfetti(1330, cy, age, 40, 1500, -Math.PI / 2, TAU);
      // the sign flips up and flutters down
      const sa = seg(age, 0, 1.4), sgx = 1330 + 160 * sa + Math.sin(age * 5) * 60 * sa, sgy = lerp(GY - 700, GY - 20, easeIn(sa)) - Math.sin(sa * Math.PI) * 260;
      const srot = Math.sin(age * 6) * .5 * (1 - sa) + sa * .1;
      push(); translate(sgx, sgy); rotate(srot); paint(rrPts(-114, -35, 228, 70, 12, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.2 }); pop();
      letter('P(DOOM)', sgx, sgy, 44, PAL.cream, { rot: srot });
    }
    stageFront(t, {});
    camEnd();
    if (popped) { flash(.8 * (1 - seg(age, 0, .12))); confettiRain(t, TP + .15, 40); }
    audience(t, popped ? .9 : .1 + .2 * inf);
  }

  // =================================================================================================
  // 148.8 · Finale dance: a hop ripples down the line, confetti cannons fire, everyone jumps… ta-da!
  // =================================================================================================
  function finale(t, lt, dur) {
    const bp = bpOf(t), bounce = pulse(t, 5);
    camBegin(960, 716 - bounce * 6, 1.27 + .025 * bounce + .03 * ease(lt / dur), 0);
    const sw = Math.sin(t * 2.4) * 520;
    house(t, { spin: .7, burstOp: 150, spots: [[960 + sw, PAL.cream], [960 - sw, '#FFD2C4']] });
    // confetti cannons in the wings
    const CF = B(220);
    for (const sd of [-1, 1]) {
      const cx = sd < 0 ? 250 : 1670, kick = t > CF ? Math.exp(-(t - CF) * 8) : 0;
      push(); translate(cx - sd * kick * 20, 900); rotate(sd * -.7);
      paint(rrPts(-34, -120, 68, 140, 14, 2), { wash: GOLD, fill: PAL.ochre, fillOp: 90, ink: PAL.ink, sw: 1.1 });
      paint(ellPts(0, -120, 34, 10, 14), { wash: PAL.ink, ink: null });
      pop();
      if (t > CF) {
        const age = t - CF;
        for (let k = 0; k < 4; k++) {
          const len = clamp(age / .5), pts = [], ang = -Math.PI / 2 - sd * (.55 + k * .12), v = 900 + k * 110;
          for (let q = 0; q <= 10; q++) {
            const u = q / 10 * len * 1.3, d = 1 - Math.exp(-u * 2.5);
            pts.push([cx + sd * 40 + Math.cos(ang) * v * d * .9 + Math.sin(u * 9 + k) * 12, 800 + Math.sin(ang) * v * d * .9 + 400 * u * u + Math.cos(u * 7 + k) * 8]);
          }
          inkLine(pts, 3, CONF[k % CONF.length], 'marker', .6);
        }
        burstConfetti(cx + sd * 60, 780, age, 22, 1200, -Math.PI / 2 - sd * .7, 1.2);
      }
    }
    flowers(t);
    LINE.forEach((c, i) => {
      let m, aL, aR, eyes = 'happy';
      if (bp < 220) { m = { ...move('hop', t - i * BEAT * .14), dx: 0 }; }
      else if (bp < 221) { m = { ...move('roof', t), dx: 0 }; }
      else if (bp < 221.5) { const j = seg(bp, 221, 221.5); m = { ...IDLE, dy: -Math.sin(j * Math.PI) * 6, sq: j < .15 ? .2 : -.1 }; aL = aR = 1.35; }
      else { const age = t - B(221.5); m = { ...IDLE, sq: .3 * (1 - elasticOut(age / .45)), dy: 0 }; aL = aR = 1.3; }
      const ta = bp >= 221.5;
      who(c, c.x, GY, t, { m, aL: c.k === 'res' && aL != null ? 1.3 : aL, aR: c.k === 'res' && aR != null ? 1.3 : aR, eyes, mouth: 'grin',
        wave: c.k === 'shog' ? 1 : 0, emote: ta ? 'spark' : undefined, emoteK: seg(t, B(221.5), B(221.5) + .25), x: c.k === 'clawd' ? { blush: true } : undefined });
    });
    stageFront(t, {});
    camEnd();
    confettiRain(t, 148.5, 50);
    audience(t, 1);
  }

  // =================================================================================================
  // 151.6 · The house curtain drops with a thump. The title is painted on it, then the credit line.
  // Clawd sneaks one last peek and wave through the split, and everything fades back to paper.
  // =================================================================================================
  const TD = B(222);
  function houseCurtain(t, hemY, split, sy0, sy1) {
    // two halves meeting at x 960; `split` pushes the inner edges apart between y sy0..sy1 (a peek hole)
    for (const sd of [-1, 1]) {
      const pts = [];
      const outer = sd < 0 ? -120 : W + 120;
      pts.push([outer, -60]);
      for (let i = 0; i <= 14; i++) {
        const y = lerp(-60, hemY, i / 14), bump = split > 0 && y > sy0 ? Math.sin(clamp((y - sy0) / (sy1 - sy0)) * Math.PI * .5) * split : 0;
        pts.push([960 + sd * (bump + Math.sin(i * 1.3 + t * 2) * 4), y]);
      }
      for (let i = 0; i <= 10; i++) { const x = lerp(960, outer, i / 10); pts.push([x, hemY + Math.sin(i * 2.1) * 10 + (i % 2) * 12]); }
      paint(pts, { wash: CURTAIN, washOp: 255, fill: CURTAIN_DK, fillOp: 90, bleed: .05, tex: .8, border: .7, ink: PAL.ink, sw: 1.5 });
      for (let f = 1; f < 7; f++) {
        const fx = lerp(960, outer, f / 7), fl = [];
        for (let i = 0; i <= 6; i++) fl.push([fx + Math.sin(i * 1.4 + f) * 10, lerp(40, hemY - 20, i / 6)]);
        inkLine(fl, .9, CURTAIN_DK, 'inkfine', .5);
      }
      const fr = []; for (let i = 0; i <= 12; i++) { const x = lerp(960 + sd * split * .2, outer, i / 12); fr.push([x, hemY - 14 + (i % 2) * 10]); }
      inkLine(fr, 2.2, GOLD, 'ink', .3);
    }
  }
  function curtainFall(t, lt, dur) {
    const a = seg(t, TD, TD + .42), land = t - (TD + .42);
    let hemY = lerp(-80, 1010, easeIn(a));
    if (land > 0) hemY = 1010 - Math.abs(Math.sin(land * 9)) * 26 * Math.exp(-land * 6);
    const [sx, sy] = land > 0 ? shakeXY(t, 14 * Math.exp(-land * 7)) : [0, 0];
    camBegin(960 + sx, 610 + sy, 1.12 + .05 * ease(seg(t, TD + .5, 156.6)), 0);
    house(t, { spots: [[960, PAL.cream]] });
    if (hemY < 1000) {                                     // the cast holding the ta-da pose until the curtain covers them
      flowers(t);
      LINE.forEach(c => who(c, c.x, GY, t, { m: { ...IDLE, dy: -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .3 }, aL: 1.3, aR: 1.3, eyes: 'happy', mouth: 'grin', wave: c.k === 'shog' ? 1 : 0 }));
    }
    // Clawd's peek through the split, stage-left of centre
    const pk = ease(seg(t, 153.55, 153.85)) * (1 - ease(seg(t, 154.75, 155.0))), split = 175 * pk;
    if (pk > .01) {
      paint([[960 - split * .3, 690], [960 + split * .3, 690], [960 + split * 1.1, 1012], [960 - split * 1.1, 1012]], { wash: '#2A1A22', ink: null });
      const wave = Math.sin((t - 153.6) * 16);
      clawd(960 - 30 + 80 * pk, 1010, 20, { hat: 'top', rot: .22 * pk, eyes: t > 154.1 && t < 154.35 ? 'wink' : 'happy', mouth: 'grin', blush: true, noShadow: true, aL: -.2, aR: 1.1 + .45 * wave });
    }
    houseCurtain(t, hemY, split, 690, 1010);
    if (land > 0) {                                        // dust off the hem as it lands
      for (let k = 0; k < 8; k++) puff(140 + k * 235, 1010, land * .8 - hash(k) * .05, k % 2 ? 1 : -1);
      letter("I'M UPPING MY", 960, 300, 96, GOLD, { pop: seg(t, TD + .7, TD + 1.0) * 1.5, rot: -.03 });
      letter('P(DOOM)', 960, 480, 240, PAL.cream, { pop: seg(t, TD + .95, TD + 1.3) * 1.5, rot: -.03 + Math.sin(bpOf(t) * Math.PI) * .012, stroke: CURTAIN_DK });
      letter('created by Claude Opus 5.5', 960, 690, 50, GOLD, { pop: seg(t, 153.0, 153.35) * 1.5, font: '800 50px "Shantell Sans", sans-serif' });
    }
    stageFront(t, {});
    camEnd();
    audience(t, .8 * (1 - seg(t, 154, 155.5)));
    flushLetters();
    flash(ease(seg(t, 155.0, 156.35)), PAL.paper);
  }

  chapter('finale', 140.5, DUR + 1, [[140.5, runOn], [B(210), bows], [B(214), encore], [B(218), finale], [TD, curtainFall]]);
})();
