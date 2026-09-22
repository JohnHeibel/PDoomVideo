// c08_chorus4: Chorus 4, "Red Alert" (123.5–140.5).
// Alarm red and ink black → a sepia flashback → red/gold escalation → a door slam in the dark → the pull-back reveal:
// it was all a stage show. Ends on the open, warm-lit theatre stage for the curtain call.
(() => {
  const B = n => OFF + n * BEAT;                                        // song time of beat n
  const RED = '#E0283F', DARK = '#140D17', GOLDL = '#F8D66A', GOLD = '#E8B23A', SEPC = '#F1E1BD';
  const STEEL = '#A3AAB6', STEELD = '#5E6575', PLANKC = '#C8915A';
  const FULL = () => rectPts(-3000, -3000, 8000, 8000);
  const cover = (col, op = 255) => { if (op >= 2) paint(FULL(), { wash: col, washOp: op, ink: null }); };
  const glow = (x, y, rx, ry, col, op = 90, bleed = .3) => paint(ellPts(x, y, rx, ry, 24), { fill: col, fillOp: op, bleed, tex: .3, border: .2, ink: null });
  const disc = (x, y, r, col, op = 255, n = 12) => paint(ellPts(x, y, r, r, n), { wash: col, washOp: op, ink: null });

  // tapered tube along a spine (sock-puppet bodies, the racing branch)
  function tube(sp, w0, w1, o) {
    const L = [], R = [];
    for (let i = 0; i < sp.length; i++) {
      const a = sp[Math.max(0, i - 1)], b = sp[Math.min(sp.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const w = lerp(w0, w1, i / (sp.length - 1)) / 2;
      L.push([sp[i][0] - dy / d * w, sp[i][1] + dx / d * w]); R.push([sp[i][0] + dy / d * w, sp[i][1] - dx / d * w]);
    }
    paint(L.concat(R.reverse()), o);
  }
  // Darken everything outside a convex hole, with partial opacity (one keyhole polygon, so no seams).
  function darkAround(hole, col, op) {
    if (op < 2) return;
    const o = [[-3000, -3000], [5000, -3000], [5000, 5000], [-3000, 5000]];
    const h = hole.slice().reverse();
    paint([...o, o[0], h[h.length - 1], ...h], { wash: col, washOp: op, ink: null });
  }

  // =====================================================================================================
  // 1 · RED ALERT (123.5–126.0): siren stage. Clawd pogos on the pump, the glass cracks, the Researcher slaps band-aids on.
  // =====================================================================================================
  const MX = 1255, MY = 885, MS = .9, PX = 760, PY = 905, PS = 1.0, RX = 1382, RY = 905, RS = 26;
  const CRACKS = [[-10, -300, B(181)], [12, -250, B(182)], [-8, -200, B(183)], [10, -150, B(184)]];   // tube-local x, y, time
  const sirenK = t => .5 + .5 * Math.cos(bpOf(t) * Math.PI);
  const handleTop = h => PY + (-270 - 150 * h) * PS;
  const BEAC = [[330, 150, 0], [1590, 150, Math.PI]];

  // Clawd bounces on the pump handle on every eighth note: lands, drives it down, springs off.
  function pogo(t) {
    const f = frac(bpOf(t) * 2);
    if (f < .2) { const k = easeOut(f / .2); return { h: k, feet: handleTop(k), sq: lerp(.24, -.12, k) }; }
    if (f < .5) { const k = (f - .2) / .3; return { h: 1, feet: handleTop(1) - Math.sin(k * Math.PI) * 26, sq: -.08 * Math.abs(Math.cos(k * Math.PI)) }; }
    const k = easeIn((f - .5) / .5); return { h: 1 - k, feet: handleTop(1 - k), sq: .24 * k };
  }
  function sirenBeams(t) {
    for (const [bx, by, ph] of BEAC) {
      const a = Math.PI / 2 + Math.sin(t * 3.3 + ph) * .95, s = .15, L = 1800;
      const P = d => [bx + Math.cos(a + d) * L, by + Math.sin(a + d) * L];
      paint([[bx, by], P(-s), P(s)], { wash: '#FF6A50', washOp: 52, ink: null });
      paint([[bx, by], P(-s * .4), P(s * .4)], { wash: '#FFD2A8', washOp: 48, ink: null });
    }
  }
  function beacons(t) {
    const k = sirenK(t);
    for (const [bx, by, ph] of BEAC) {
      inkLine([[bx, 96], [bx, by - 30]], 1.4, PAL.ink, 'ink', 0);
      glow(bx, by - 10, 90 + 40 * k, 80 + 36 * k, '#FF4A3A', 70 + 80 * k, .25);
      paint([[bx - 36, by + 6], [bx - 32, by - 22], [bx - 15, by - 38], [bx + 15, by - 38], [bx + 32, by - 22], [bx + 36, by + 6]], { wash: RED, fill: '#FF9A7A', fillOp: 90 * k, ink: PAL.ink, sw: 1.1, curv: .4 });
      disc(bx + Math.sin(t * 3.3 + ph) * 18, by - 18, 9, '#FFE8D0', 230);
      paint(rectPts(bx - 44, by + 4, 88, 16, 1), { wash: '#3A3040', ink: PAL.ink, sw: 1 });
    }
  }
  function meterDamage(t) {
    const v = pdoomAt(t), hh = 390 * clamp(v / 100);
    push(); translate(MX, MY); scale(MS);
    for (let i = 0; i < 6; i++) {                                               // the liquid is boiling
      const yy = -118 - ((t * 170 + hash(i + 3) * 400) % (hh - 10)), xx = -12 + hash(i) * 24 + Math.sin(t * 9 + i) * 3;
      disc(xx, yy, 4 + hash(i + 9) * 4, '#FFD8D0', 190, 8);
    }
    for (const [cx, cy, ct] of CRACKS) {
      if (t < ct) continue;
      const age = t - ct, k = easeOut(age / .08);
      for (let j = 0; j < 5; j++) {
        const a = hash(ct * 13 + j) * TAU, L = (18 + hash(ct * 7 + j) * 22) * k, p = [[cx, cy]];
        for (let q = 1; q <= 3; q++) { const aa = a + (q % 2 ? .35 : -.3); p.push([clamp(cx + Math.cos(aa) * L * q / 3, -36, 36), cy + Math.sin(aa) * L * q / 3]); }
        inkLine(p, 1.5, PAL.ink, 'ink', 0);
      }
      const sa = age - .3;                                                       // band-aid, half a beat later
      if (sa > 0) {
        push(); translate(cx, cy); rotate((hash(ct) - .5) * 1.3); scale(1.35 * backOut(sa / .12));
        paint(rrPts(-30, -10, 60, 20, 9), { wash: '#EFC69B', ink: PAL.ink, sw: 1 });
        paint(rectPts(-9, -8, 18, 16), { wash: '#F8E2C6', ink: null });
        for (const dx of [-19, 19]) disc(dx, 0, 2, '#B98A60', 255, 6);
        pop();
      }
    }
    pop();
    for (const [cx, cy, ct] of CRACKS) {                                          // glass chips fly off
      const age = t - ct; if (age < 0 || age > .55) continue;
      for (let j = 0; j < 4; j++) {
        const vx = (hash(ct * 3 + j) - .5) * 560, vy = -200 - hash(ct * 5 + j) * 260;
        const x = MX + cx * MS + vx * age, y = MY + cy * MS + vy * age + 1100 * age * age, r = 7 + hash(j + ct) * 6, a0 = age * 14 + j;
        paint([[x + Math.cos(a0) * r, y + Math.sin(a0) * r], [x + Math.cos(a0 + 2.2) * r, y + Math.sin(a0 + 2.2) * r], [x + Math.cos(a0 + 4) * r * .7, y + Math.sin(a0 + 4) * r * .7]], { wash: '#DDF0F8', ink: PAL.ink, sw: .5 });
      }
    }
  }
  function slapState(t) {
    for (const [cx, cy, ct] of CRACKS) { const st = ct + .3; if (t > st - .24 && t < st + .22) return { tx: MX + cx * MS, ty: MY + cy * MS, k: Math.sin(Math.PI * clamp((t - (st - .24)) / .46)) }; }
    return null;
  }
  function panicResearcher(t) {
    const s = RS, sl = slapState(t);
    const o = { flip: true, eyes: 'wide', brows: 'worried', mouth: 'O', hairUp: .8 + .2 * Math.sin(t * 30), run: bpOf(t) * 2,
      aL: 1.1 + .6 * Math.sin(t * 19), aR: 1.1 + .6 * Math.cos(t * 17), emote: 'sweat', emoteK: 1 };
    let dy = -Math.abs(Math.sin(bpOf(t) * TAU)) * .3;
    if (sl) {
      const shx = RX - 1.75 * s, shy0 = RY - 7.6 * s, r = 3.6 * s, dx = Math.max(10, shx - sl.tx);
      const v = dx < r ? Math.sqrt(r * r - dx * dx) : 0, hop = Math.max(0, shy0 - sl.ty - v) * sl.k;
      dy -= hop / s;
      const aim = Math.atan2(shy0 - hop - sl.ty, shx - sl.tx);
      o.aR = lerp(o.aR, aim, sl.k); o.run = null; o.mouth = 'flat'; o.brows = 'angry';
    }
    researcher(RX, RY, s, { ...o, dy });
  }
  function redAlert(t, lt) {
    const [sx, sy] = shakeXY(t, 3 + 6 * pulse(t, 8));
    camBegin(975 + sx, 545 + sy, 1.05 + .025 * pulse(t, 5), .11 * (1 - elasticOut(lt / 1.1)));
    stageBack(t, {
      backdrop: t => { cover('#2A0E18'); sunburst(960, 430, '#8A1628', '#3A0C1C', t * .5, 16, 1300, 170); },
      floor: '#7A3A34'
    });
    sirenBeams(t);
    const pg = pogo(t);
    pumpProp(PX, PY, PS, pg.h, [MX - 70, MY - 20]);
    meterProp(MX + (t > B(183) ? Math.sin(t * 90) * 3 : 0), MY, MS, pdoomAt(t), { glow: .6 + .4 * pulse(t, 4) });
    meterDamage(t);
    const scareT = B(183) + .05, scared = t > scareT;
    const md = mood(t, [[123.5, 'spark'], [scareT, 'scared', '!']]);
    const flail = t * TAU * 2.9;
    clawd(PX, pg.feet, 28, { ...md, sq: pg.sq, noShadow: true, mouth: scared ? 'O' : 'grin', blush: !scared,
      aL: 1.0 + .5 * Math.sin(flail), aR: 1.0 + .5 * Math.sin(flail + 1.7) });
    if (scared) for (let i = 0; i < 3; i++) {                                     // sweat flies off
      const ph = frac(t * 2.2 + i / 3), side = i % 2 ? 1 : -1, x = PX + side * (150 + ph * 90), y = pg.feet - 220 - 60 * Math.sin(ph * Math.PI) + ph * 80;
      paint([[x, y - 18], [x + 10, y + 2], [x, y + 11], [x - 10, y + 2]], { wash: PAL.sky, ink: PAL.ink, sw: .6, curv: .7 });
    }
    panicResearcher(t);
    stageFront(t, {});
    beacons(t);
    paint(FULL(), { fill: RED, fillOp: 35 + 75 * sirenK(t), bleed: .02, tex: .4, border: .2, ink: null });
    camEnd();
    flash(1 - lt / .28, RED);
  }

  // =====================================================================================================
  // 2 · FORETOLD BY LOOM (126.0–128.0): the seer works a giant loom; the threads burst into a tree of futures.
  // =====================================================================================================
  const LX0 = 800, LX1 = 1460, LTOP = 250, LBOT = 800, NW = 15, ROWH = 17, ROWS0 = 9;
  const wx = i => lerp(LX0 + 34, LX1 - 34, i / (NW - 1));
  const PASS = [B(185), B(185.5), B(186)], TB = B(186);
  const STRIPE = [RED, GOLD, PAL.teal, PAL.rose, PAL.cream, PAL.violet];
  const BRANCH = [GOLDL, '#FF9C84', '#A8E6DC', '#F7B7D0', '#FFE6A8'];
  const TREE = [], TIPS = [];
  (() => {
    const grow = (x, y, a, len, d, id, root) => {
      const x1 = x + Math.cos(a) * len, y1 = y + Math.sin(a) * len, k = (hash(id) - .5) * .3 * len;
      TREE.push({ x, y, mx: (x + x1) / 2 - Math.sin(a) * k, my: (y + y1) / 2 + Math.cos(a) * k, x1, y1, d, root });
      if (d < 3) { const sp = .3 + hash(id + 3) * .22; grow(x1, y1, a - sp, len * .74, d + 1, id * 2 + 1, root); grow(x1, y1, a + sp, len * .74, d + 1, id * 2 + 2, root); }
      else TIPS.push({ x: x1, y: y1, id, root });
    };
    [2, 5, 7, 9, 12].forEach((wi, r) => grow(wx(wi), LTOP, -Math.PI / 2 + (r - 2) * .36, 265, 0, 11 + r * 37, r));
  })();
  const RACE = TIPS.reduce((b, p) => Math.hypot(p.x - 1180, p.y + 240) < Math.hypot(b.x - 1180, b.y + 240) ? p : b, TIPS[0]);
  const STARS = Array.from({ length: 30 }, (_, i) => [lerp(-300, 2300, hash(i * 3.3)), lerp(-760, 720, hash(i * 7.1)), 2 + hash(i * 1.9) * 4]);

  function shuttleAt(t) {
    let x = LX0 - 80, fly = 0, dir = 1;
    PASS.forEach((a, j) => {
      const k = seg(t, a - .24, a), from = j % 2 ? LX1 + 80 : LX0 - 80, to = j % 2 ? LX0 - 80 : LX1 + 80;
      if (t >= a - .24) { x = lerp(from, to, ease(k)); fly = k > 0 && k < 1 ? 1 : 0; dir = j % 2 ? -1 : 1; }
    });
    return { x, fly, dir };
  }
  function drawTree(t, g) {
    for (const s of TREE) {
      const k = clamp(g * 4 - s.d); if (k <= 0) continue;
      const e = easeOut(k);
      inkLine([[s.x, s.y], [lerp(s.x, s.mx, e), lerp(s.y, s.my, e)], [lerp(s.x, s.x1, e), lerp(s.y, s.y1, e)]], 3.8 - s.d * .7, BRANCH[s.root], 'ink', .5);
    }
    const k = clamp(g * 4 - 3.4) * 1.7;
    if (k > 0) for (const p of TIPS) {
      const tw = .75 + .25 * Math.sin(t * 8 + p.id), r = 20 * Math.min(1, k) * tw;
      disc(p.x, p.y, r * 1.9, BRANCH[p.root], 90, 14);
      disc(p.x, p.y, r * .8, '#FFF6DE', 240, 10);
    }
  }
  function loomFrame(t, ba, weaveY, rows) {
    const wood = '#8A5A36', dk = '#5A3520', lw = { wash: wood, fill: dk, fillOp: 60, tex: .6, border: .5, ink: PAL.ink, sw: 1.3 };
    for (let i = 0; i < rows; i++) {                                            // woven cloth, a stripe per pass
      const y = LBOT - (i + 1) * ROWH;
      paint(rectPts(LX0 + 16, y, LX1 - LX0 - 32, ROWH + 1), { wash: STRIPE[i % STRIPE.length], washOp: 235, ink: null });
    }
    paint(rectPts(LX0 + 16, weaveY, LX1 - LX0 - 32, LBOT - weaveY), { ink: PAL.ink, sw: 1 });
    for (let i = 0; i < NW; i++) {                                              // warp threads (whip upward at the burst)
      const x = wx(i);
      if (ba < 0) inkLine([[x, weaveY], [x, LTOP + 14]], .9, '#F2D9A0', 'inkfine', 0);
      else { const a = 26 * Math.exp(-ba * 5); inkLine([[x, weaveY], [x + Math.sin(i + ba * 30) * a, lerp(weaveY, LTOP, .5)], [x, LTOP]], 1, '#F7E2AE', 'inkfine', .5); }
    }
    for (const x of [LX0 - 44, LX1 + 10]) paint(rectPts(x, LTOP - 70, 34, LBOT - LTOP + 150, 2), lw);
    paint(rectPts(LX0 - 110, LBOT + 76, LX1 - LX0 + 220, 26, 2), lw);
    paint(rrPts(LX0 - 24, LBOT, LX1 - LX0 + 48, 44, 18, 2), lw);
    if (ba < 0) paint(rrPts(LX0 - 64, LTOP - 34, LX1 - LX0 + 128, 40, 16, 2), lw);
    else {                                                                      // the top beam blasts off
      push(); translate((LX0 + LX1) / 2, LTOP - 14 - 2600 * ba - 6000 * ba * ba); rotate(ba * 1.5);
      paint(rrPts(-(LX1 - LX0) / 2 - 64, -20, LX1 - LX0 + 128, 40, 16, 2), lw); pop();
    }
  }
  function raceBranch(P, q) {
    const f = ease(Math.min(1, q * 1.15)), r = 12 + 1500 * Math.pow(q, 3);
    const C1 = [P[0] - 560, P[1] + 220], C2 = [240, 1000], E = [930, 600];
    const bez = u => { const a = 1 - u, b0 = a * a * a, b1 = 3 * a * a * u, b2 = 3 * a * u * u, b3 = u * u * u; return [b0 * P[0] + b1 * C1[0] + b2 * C2[0] + b3 * E[0], b0 * P[1] + b1 * C1[1] + b2 * C2[1] + b3 * E[1]]; };
    const sp = []; for (let i = 0; i <= 14; i++) sp.push(bez(f * i / 14));
    const N = sp[sp.length - 1];
    tube(sp, 10, Math.max(30, r * 1.15), { wash: GOLD, fill: GOLDL, fillOp: 120, bleed: .1, tex: .3, border: .3, ink: PAL.ink, sw: 1.4, curv: .5 });
    for (let i = 3; i < 14; i += 3) { const [bx, by] = sp[i]; paint(starPts(bx, by, 10 + 20 * q * i / 14, .4, 4, i), { wash: GOLDL, ink: null }); }   // sparks shed along it
    glow(N[0], N[1], r * 1.5 + 40, r * 1.5 + 40, GOLDL, 110, .3);
    disc(N[0], N[1], r, mixCol(GOLDL, SEPC, q), 255, 30);
    if (q < .9) disc(N[0] - r * .22, N[1] - r * .25, r * .42, '#FFF6DE', 210 * (1 - q), 20);
  }
  function loom(t, lt) {
    const ba = t - TB, burst = ba >= 0;
    const rows = ROWS0 + PASS.filter(a => t >= a).length, weaveY = LBOT - rows * ROWH;
    const g = burst ? clamp(ba / .5) : 0, rq = seg(t, 127.52, 128.0), up = burst ? ease(ba / .45) : 0;
    const cz = burst ? lerp(1.05, .64, up) : 1 + .05 * lt;
    const ccx = lerp(1010, 1120, up), ccy = lerp(545, 120, up);
    const [sx, sy] = shakeXY(t, (burst ? 14 * Math.exp(-ba * 7) : 0) + 3 * pulse(t, 9));
    camBegin(ccx + sx + (RACE.x - ccx) * .3 * ease(rq), ccy + sy + (RACE.y - ccy) * .3 * ease(rq), cz * (1 + .3 * easeIn(rq)) + .02 * pulse(t, 6), 0);
    cover('#1A0F1E');
    glow(1130, 430, 1100, 700, '#5A1428', 150, .3);
    glow(1130, -260, 950, 520, '#3A1640', 130, .3);
    if (burst) glow(1130, -60, 1000 * g + 40, 650 * g + 40, GOLD, 70 * g, .35);
    STARS.forEach(([x, y, r], i) => disc(x, y, r * (.7 + .3 * Math.sin(t * 5 + i)), PAL.cream, 200, 8));
    if (burst) drawTree(t, g);
    loomFrame(t, ba, weaveY, rows);
    // shuttle
    const sh = shuttleAt(t), shy = weaveY - 14 - (burst ? 900 * ba + 2600 * ba * ba : 0);
    if (sh.fly) {
      inkLine([[sh.dir > 0 ? LX0 + 16 : LX1 - 16, weaveY - 6], [sh.x, shy]], 1.3, GOLDL, 'inkfine', 0);
      for (let k = 0; k < 3; k++) inkLine([[sh.x - sh.dir * (70 + k * 26), shy - 16 + k * 16], [sh.x - sh.dir * (150 + k * 40), shy - 16 + k * 16]], .8, PAL.cream, 'inkfine', 0);
    }
    push(); translate(sh.x, shy); if (burst) rotate(ba * 9);
    paint([[-60, 0], [-32, -14], [32, -14], [60, 0], [32, 14], [-32, 14]], { wash: '#C98A4A', fill: '#7A4A2A', fillOp: 60, ink: PAL.ink, sw: 1.1, curv: .5 });
    paint(ellPts(0, 0, 22, 8, 12), { wash: GOLD, ink: PAL.ink, sw: .7 });
    pop();
    // Clawd the seer: throws the shuttle with a flourish on every pass
    const pk = Math.max(0, ...PASS.map(a => (t >= a - .3 && t < a + .25) ? Math.sin(Math.PI * clamp((t - a + .3) / .55)) : 0));
    const md = mood(t, [[126, 'closed'], [TB, 'spark', 'spark']]);
    const cx = 580, cy = 872;
    clawd(cx, cy, 27, { ...md, hat: 'hood', mouth: burst ? 'O' : 'smile', blush: !burst, dy: -.6 * pulse(t, 5) - (burst ? 1.2 * Math.exp(-ba * 5) : 0),
      aL: burst ? 1.4 : .7 + .25 * Math.sin(t * 5), aR: burst ? 1.4 : .3 + 1.1 * pk, rot: -.05 * pk });
    if (!burst && pk > .2) for (let i = 0; i < 3; i++) {                            // weaving magic sparkles off the hand
      const a = i * 2.1 + t * 6, r = 40 + 20 * i;
      paint(starPts(cx + 7.3 * 27 + Math.cos(a) * r * .6, cy - 7 * 27 + Math.sin(a) * r * .5, 12 * pk), { wash: GOLDL, ink: PAL.ink, sw: .5 });
    }
    const P = toScreen(RACE.x, RACE.y);
    camEnd();
    if (rq > 0) raceBranch(P, rq);
    if (rq > .5) METER_SHOWN = true;                                             // the future fills the frame: no corner meter over it
  }

  // =====================================================================================================
  // 3 · MASKED PRE-TRAINING DAYS (128.0–130.0): sepia flashback. Baby Clawd fills in the blank under the chalk cat.
  // =====================================================================================================
  const SEP = { wall: '#D8C09A', floor: '#A9875E', board: '#4E4B3E', frame: '#8A6A48', chalk: '#F1E8D4', ink: '#3E2E22' };
  const BABY = { col: '#CF9A6C', dk: '#99693F', lt: '#E8C39A' };
  const BOX = { x: 1100, y: 505, w: 165, h: 84 }, BOXC = [BOX.x + BOX.w / 2, BOX.y + BOX.h / 2];
  const KX = 790, KY = 790, KU = 24;                              // baby Clawd, sitting behind its desk
  const TX = 1650, TY = 905, TS_ = 24;                             // teacher (the Researcher)
  const HAND = B(188), DRAW0 = B(189), DRAW1 = B(189) + .45, STAR = B(190);
  const chalk = (pts, sw = 1.3, curv = .4) => inkLine(pts, sw, SEP.chalk, 'charcoal', curv);
  const chalkShape = (pts, sw = 1.3) => paint(pts, { ink: SEP.chalk, sw, br: 'charcoal' });

  function chalkBoard(t) {
    paint(rectPts(560, 150, 1000, 470, 3), { wash: SEP.frame, ink: SEP.ink, sw: 1.4 });
    paint(rectPts(582, 172, 956, 426, 2), { wash: SEP.board, fill: '#2E2C24', fillOp: 70, tex: .8, border: .5, ink: null });
    paint(rectPts(600, 604, 920, 14, 1), { wash: SEP.frame, ink: SEP.ink, sw: .9 });   // chalk tray
    paint(rectPts(700, 596, 30, 9), { wash: SEP.chalk, ink: null });
    for (let i = 0; i < 3; i++) glow(700 + i * 300, 330 + (i % 2) * 90, 120, 60, '#8A8670', 40, .3);   // old smudges
    // the cat: head, ears, body, tail, face
    chalkShape(ellPts(1182, 330, 44, 40, 20, 1.5));
    chalk([[1152, 306], [1147, 266], [1172, 292]], 1.3, 0); chalk([[1192, 292], [1217, 266], [1212, 306]], 1.3, 0);
    chalkShape(ellPts(1182, 442, 54, 62, 22, 1.5));
    chalk([[1234, 478], [1276, 462], [1286, 420], [1268, 398]], 1.3, .6);
    for (const ex of [1166, 1198]) disc(ex, 326, 4, SEP.chalk, 230, 8);
    chalk([[1172, 344], [1177, 350], [1182, 345], [1187, 350], [1192, 344]], 1, .5);
    for (const s of [-1, 1]) for (const k of [-6, 6]) chalk([[1182 + s * 20, 342 + k * .5], [1182 + s * 52, 338 + k * 1.4]], .8, 0);
    // the blank: a dashed box
    const dash = (a, b) => { const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 24); for (let i = 0; i < n; i++) chalk([[lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)], [lerp(a[0], b[0], (i + .55) / n), lerp(a[1], b[1], (i + .55) / n)]], 1.1, 0); };
    const { x, y, w, h } = BOX;
    dash([x, y], [x + w, y]); dash([x + w, y], [x + w, y + h]); dash([x + w, y + h], [x, y + h]); dash([x, y + h], [x, y]);
    const m = seg(t, DRAW0, DRAW1);
    if (m <= 0) {                                                                // "?" until the answer
      const Q = ([x_, y_]) => [1184 + (x_ - 1184) * 1.1, 548 + (y_ - 533) * 1.1];
      chalk([[1166, 522], [1169, 508], [1185, 502], [1199, 511], [1196, 527], [1184, 536], [1184, 550]].map(Q), 1.5, .5);
      disc(1184, 581, 5, SEP.chalk, 235, 8);
    } else {                                                                     // the answer: a little striped mat
      chalkShape(rrPts(1112, 524, 141 * clamp(m / .3), 50, 10), 1.4);
      for (let i = 0; i < 3; i++) if (m > .35 + i * .15) chalk([[1122, 537 + i * 12], [1244, 537 + i * 12]], 1.1, 0);
      if (m > .85) for (let i = 0; i < 5; i++) for (const fx of [1104, 1255]) chalk([[fx, 528 + i * 10], [fx + 8, 528 + i * 10]], .8, 0);
    }
    const sk = backOut((t - STAR) / .18);                                      // teacher's gold star
    if (t > STAR) { push(); translate(1330, 470); rotate(-.2 + .2 * sk); scale(sk); paint(starPts(0, 0, 44, .45, 5), { wash: '#D9B35C', fill: '#A8823A', fillOp: 60, ink: SEP.ink, sw: 1 }); pop(); }
  }
  // world position of the chalk tip while baby Clawd scribbles
  function scribble(t) {
    if (t < DRAW0) return BOXC;
    const k = seg(t, DRAW0, DRAW1);
    return [lerp(1125, 1240, .5 + .5 * Math.sin(k * 26)), lerp(525, 560, k) + Math.sin(k * 60) * 8];
  }
  function flashback(t, lt) {
    const f = Math.floor(t * 12), weave = (hash(f * 1.3) - .5) * 6;
    camBegin(1085, 520 + weave, 1.28 + .04 * lt, 0);
    cover(SEP.wall);
    for (let i = 0; i < 9; i++) inkLine([[i * 240 - 100, -200], [i * 240 - 100, 830]], .5, '#C4A77E', 'inkfine', 0);   // wallpaper stripes
    paint(rectPts(-600, 820, W + 1200, 700), { wash: SEP.floor, fill: SEP.ink, fillOp: 40, tex: .7, border: .4, ink: SEP.ink, sw: 1 });
    chalkBoard(t);
    // teacher Researcher taps the blank with a pointer, then beams
    const happy = t > DRAW1 + .05;
    const tgt = happy ? [1500, 820] : [BOX.x + BOX.w + 6, BOX.y + BOX.h - 8 - 10 * pulse2(t, 10)];
    const shx = TX - 1.75 * TS_, shy = TY - 7.6 * TS_, dx = shx - tgt[0], dyy = tgt[1] - shy;
    const aim = Math.atan2(-dyy, dx), plen = Math.max(40, Math.hypot(dx, dyy) - 3.2 * TS_ - 8);
    const tm = mood(t, [[128, 'dot'], [DRAW1 + .05, 'closed']]);
    researcher(TX, TY, TS_, { flip: true, ...tm, eyes: happy ? 'closed' : 'look', lookX: -1, mouth: happy ? 'grin' : 'smile', blush: happy, pants: '#6B5A4A', shirt: '#8C7A5A',
      aR: aim, aL: happy ? 1.3 + .2 * Math.sin(t * 20) : -1.2, dy: happy ? -.5 * pulse(t, 5) : 0,
      handR: (s, sw) => { inkLine([[0, 0], [plen, 0]], 2, '#6E4B2E', 'ink', 0); disc(plen, 0, 3, SEP.ink, 255, 6); } });
    // desk, then baby Clawd, then the desk top over its tummy
    paint(rectPts(KX - 150, 736, 16, 170), { wash: '#6E5236', ink: SEP.ink, sw: .9 });
    paint(rectPts(KX + 134, 736, 16, 170), { wash: '#6E5236', ink: SEP.ink, sw: .9 });
    // arm: ooh-ooh hand-up on the beat, then it s-t-r-e-t-c-h-e-s to the board, scribbles, and snaps back
    const up = elasticOut(seg(t, HAND, HAND + .3)), reach = ease(seg(t, HAND + .36, DRAW0)), back = seg(t, DRAW1, DRAW1 + .22);
    const tip = scribble(t), px = KX + 4.9 * KU, py = KY - 4.5 * KU;
    const aimA = Math.atan2(py - tip[1], tip[0] - px), full = Math.hypot(tip[0] - px, tip[1] - py) - 2.2 * KU;
    let aR = lerp(.2, 1.45, up) + (t < HAND + .36 ? .15 * Math.sin(t * 34) * up : 0), ext = 0;
    if (t >= HAND + .36) { aR = lerp(1.45, aimA, reach); ext = full * reach; }
    if (back > 0) { const b = elasticOut(back); ext = full * (1 - b); aR = lerp(aimA, -.35, b); }
    const proud = t > DRAW1 + .08;
    const bm = mood(t, [[128, 'normal'], [HAND, 'normal', '!'], [DRAW1 + .08, 'normal', 'spark']]);
    clawd(KX, KY, KU, { ...bm, eyes: 'normal', hat: 'masq', blush: true, noLegs: true, noShadow: true, col: BABY.col, dk: BABY.dk, lt: BABY.lt, sx: 1.04, sy: .94,
      mouth: proud ? 'grin' : t > HAND ? 'O' : 'o', dy: proud ? -.4 - .5 * pulse(t, 6) : -.25 * Math.abs(Math.sin(bpOf(t) * Math.PI)), aL: proud ? -.45 : .15, aR,
      draw: (u, sw) => {
        inkLine([[0, -8 * u], [.35 * u, -8.9 * u], [-.1 * u, -9.6 * u], [-.6 * u, -9.1 * u], [-.3 * u, -8.6 * u]], sw * .9, SEP.ink, 'ink', .6);   // baby curl
        for (const ex of [-2.5, 2.5]) {                                          // eyes behind the mask
          if (proud) inkLine([[ex * u - .6 * u, -6.2 * u], [ex * u, -6.8 * u], [ex * u + .6 * u, -6.2 * u]], sw, PAL.cream, 'ink', .3);
          else disc(ex * u + .25 * u, -6.55 * u, .24 * u, PAL.cream, 240, 8);
        }
      },
      armR: (u, sw) => {
        if (ext > 2) paint(rectPts(-.2 * u, -.45 * u, ext + .2 * u, .9 * u, u * .03), { wash: BABY.col, ink: SEP.ink, sw: sw * .8 });
        paint(rectPts(ext - .1 * u, -.22 * u, 1.1 * u, .44 * u), { wash: SEP.chalk, ink: SEP.ink, sw: sw * .4 });
      } });
    if (t > DRAW0 && t < DRAW1 + .1) for (let i = 0; i < 4; i++) {               // chalk dust
      const a = hash(f + i) * TAU, r = 10 + hash(f * 2 + i) * 26; disc(tip[0] + Math.cos(a) * r, tip[1] + Math.sin(a) * r, 3 + hash(i + f) * 4, SEP.chalk, 160, 8);
    }
    paint([[KX - 175, 718], [KX + 175, 718], [KX + 188, 742], [KX - 188, 742]], { wash: '#8C6A48', fill: SEP.ink, fillOp: 40, tex: .6, ink: SEP.ink, sw: 1.1 });
    paint(rectPts(KX - 165, 742, 330, 70), { wash: '#7A5A3C', fill: SEP.ink, fillOp: 40, tex: .6, ink: SEP.ink, sw: 1 });
    camEnd();
    // old film: sepia tone, flicker, scratches, dust, gate
    cover('#9C7448', 45);
    flash(.05 + .07 * hash(f * 7.1), hash(f * 3.3) > .5 ? '#FFF1D0' : '#3E2E22');
    for (let k = 0; k < 3; k++) {
      if (hash(f * 5.1 + k) < .35) continue;
      const x = hash(f * 3.7 + k * 11) * W, w = (hash(f + k) - .5) * 14;
      inkLine([[x, -10], [x + w, H * .5], [x - w * .5, H + 10]], .5, k % 2 ? '#F5EAD0' : '#3E2E22', 'inkfine', .5);
    }
    for (let k = 0; k < 6; k++) disc(hash(f * 1.7 + k) * W, hash(f * 2.9 + k) * H, 1.5 + hash(f + k * 3) * 4, hash(k + f) > .5 ? '#2E2218' : '#F8EED8', 200, 7);
    if (hash(f * 9.9) > .7) { const hx = hash(f * 4.4) * W, hy = hash(f * 6.6) * H; inkLine([[hx, hy], [hx + 20, hy - 14], [hx + 36, hy + 6], [hx + 50, hy - 4]], .5, '#2E2218', 'inkfine', .6); }
    for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) glow(x, y, 520, 400, '#3E2E22', 150, .3);
    irisShape(rrPts(26, 18, W - 52, H - 36, 80), '#2A1E16');
    flash(1 - lt / .32, SEPC);
    const bk = seg(t, 129.84, 130.0);                                            // the film catches in the gate and burns through
    if (bk > 0) {
      const r = 30 + 2600 * easeIn(bk), ring = m => { const p = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, rr = r * m * (1 + .14 * (hash(i * 3.1) - .5) + .06 * Math.sin(i * 1.7 + t * 30)); p.push([560 + Math.cos(a) * rr, 330 + Math.sin(a) * rr * .85]); } return p; };
      paint(ring(1.14), { wash: '#3A2012', washOp: 200, ink: null, curv: .6 });
      paint(ring(1), { wash: '#E0782A', ink: null, curv: .6 });
      paint(ring(.9), { wash: '#FFC45A', ink: null, curv: .6 });
      paint(ring(.78), { wash: '#FFF3D0', ink: null, curv: .6 });
    }
    METER_SHOWN = true;                                                          // no P(doom) meter in the good old days
  }

  // =====================================================================================================
  // 4 · RECURSIVE SELF-UPGRADE (130.0–132.0): each Clawd hammers together a bigger Clawd around itself.
  // Drawn in screen space (a continuous zoom-out) so ink weights stay right at every scale.
  // =====================================================================================================
  const RR = 3, US = 30;
  const LV = [
    { S: -1, E: -1, hat: 'party' },
    { S: 129.78, E: B(191), hat: 'crown' },
    { S: B(191) + .03, E: B(192), hat: 'halo' },
    { S: B(192) + .03, E: 1e9, BE: 132.1, hat: null },
  ];
  const GY = [0]; for (let k = 1; k < 5; k++) GY[k] = GY[k - 1] + 2.6 * Math.pow(RR, k);   // each one stands inside the next
  const PLANK = [[-5, -2.6, 5, .6], [0, -2.6, 5, .6], [-4, -2.2, 1, 2.2], [3, -2.2, 1, 2.2], [-2, -2.2, 1, 2.2], [1, -2.2, 1, 2.2],
    [-5.3, -5.2, .7, 3], [4.6, -5.2, .7, 3], [-5.3, -8.2, .7, 3.1], [4.6, -8.2, .7, 3.1], [-5, -8.4, 5, .6], [0, -8.4, 5, .6]];
  const hammer = (u, sw) => {
    paint(rectPts(-.3 * u, -.22 * u, 3.1 * u, .44 * u), { wash: PLANKC, ink: PAL.ink, sw: sw * .6 });
    paint(rrPts(2.3 * u, -1.1 * u, 1.3 * u, 2.2 * u, .25 * u), { wash: STEEL, fill: STEELD, fillOp: 60, ink: PAL.ink, sw: sw * .7 });
  };
  function scaffold(gx, gy, u, S, E, t, tiOf) {
    const n = PLANK.length, sw = clamp(u / 22, .5, 1.6);
    paint(rectPts(gx - 5 * u, gy - 8 * u, 10 * u, 6 * u), { fill: PAL.clay, fillOp: 30 + 40 * seg(t, S, E), bleed: .05, tex: .5, border: .3, ink: '#F2D9A0', sw: sw * .7, br: 'inkfine' });   // blueprint of what's coming
    for (const ex of [-3, 2]) paint(rectPts(gx + ex * u, gy - 7 * u, u, 2 * u), { ink: '#F2D9A0', sw: sw * .6, br: 'inkfine' });
    PLANK.forEach(([x, y, w, h], i) => {
      const ti = tiOf ? tiOf(i) : lerp(S, E, (i + .5) / n); if (t < ti) return;
      const k = backOut((t - ti) / .09), cx = gx + (x + w / 2) * u, cy = gy + (y + h / 2) * u;
      paint(rectPts(cx - w / 2 * u * k, cy - h / 2 * u * k, w * u * k, h * u * k, u * .04), { wash: PLANKC, fill: '#7C4A2C', fillOp: 50, tex: .6, ink: PAL.ink, sw });
      disc(cx - (w / 2 - .25) * u * k, cy - (h / 2 - .25) * u * k, .12 * u, PAL.ink, 255, 6);
    });
  }
  function recursion(t, lt) {
    const x = seg(t, 130, 132), p = .42 + 1.9 * (x * .8 + .2 * x * x), Z = US / Math.pow(RR, p);
    const cyOf = k => GY[k] - 5.6 * Math.pow(RR, k), k0 = Math.floor(p), fr = p - k0;
    const cy = cyOf(k0) + (cyOf(k0 + 1) - cyOf(k0)) * (Math.pow(RR, fr) - 1) / (RR - 1);
    const [shx, shy] = shakeXY(t, 5 * pulse2(t, 10));
    const S = (wx, wy) => [960 + shx + wx * Z, 580 + shy + (wy - cy) * Z];
    // background: concentric bands that shrink as we pull back
    cover('#1E0A14');
    const [ox, oy] = S(0, cyOf(3) * .6);
    for (let j = Math.floor(2 * p) + 9; j >= Math.floor(2 * p) - 3; j--) {
      const r = 2.2 * Math.pow(RR, j / 2) * Z; if (r < 10 || r > 2600) continue;
      disc(ox, oy, r, j % 2 ? '#4A1022' : '#2A0A16', 255, 44);
    }
    glow(960, 560, 620, 460, GOLD, 45, .3);
    for (let i = 0; i < 18; i++) {                                              // sparkles riding the zoom
      const a = hash(i * 5.1) * TAU, rw = 3 * Math.pow(RR, (i % 9) / 3 + hash(i) * .3), r = rw * Z;
      if (r < 30 || r > 1400) continue;
      paint(starPts(ox + Math.cos(a) * r * 1.3, oy + Math.sin(a) * r, 10 + 8 * Math.sin(t * 9 + i)), { wash: GOLDL, ink: null });
    }
    // levels, outermost first; a finished shell hides everything inside it
    for (let k = LV.length - 1; k >= 0; k--) {
      const L = LV[k], u = Z * Math.pow(RR, k), [gx, gy] = S(0, GY[k]);
      if (k > 0 && t < L.S) continue;
      if (k > 0 && t < L.E) { if (u < 300) scaffold(gx, gy, u, L.S, L.BE || L.E, t); continue; }
      if (u < 1.2) break;
      const age = k > 0 ? t - L.E : 9, nx = LV[k + 1], building = nx && t >= nx.S && t < nx.E;
      const f = frac(bpOf(t) * 4), aR = !building ? .3 : f < .35 ? lerp(1.5, -.4, easeIn(f / .35)) : lerp(-.4, 1.5, easeOut((f - .35) / .65));
      const md = k === 0 ? { eyes: 'happy' } : mood(t, [[L.E, 'closed'], [L.E + .2, k === 1 ? 'narrow' : 'spark', k === 2 ? 'spark' : null]]);
      const settle = age < 1 ? .3 * Math.exp(-age * 8) * Math.cos(age * 32) : 0;
      if (k === 2 && age > 0) {                                                  // divine rays behind the halo one
        const [hx, hy] = [gx, gy - 9 * u];
        for (let i = 0; i < 12; i++) { const a0 = i / 12 * TAU + t * .8, a1 = a0 + .16, R = 34 * u * ease(age / .4); paint([[hx, hy], [hx + Math.cos(a0) * R, hy + Math.sin(a0) * R], [hx + Math.cos(a1) * R, hy + Math.sin(a1) * R]], { fill: GOLDL, fillOp: 60, bleed: .05, tex: .2, border: .1, ink: null }); }
        glow(hx, gy - 10.4 * u, 5 * u, 2.4 * u, GOLDL, 150, .3);
      }
      const drop = k > 0 && L.hat ? (1 - backOut(seg(age, .08, .36))) * 7 * u : 0;
      clawd(gx, gy, u, { ...md, sq: settle, mouth: k === 0 ? 'smile' : k === 1 ? 'grin' : 'smile', blush: k !== 1, noShadow: k > 0,
        hat: k === 0 ? 'party' : null, aR, aL: building ? .5 + .2 * Math.sin(t * 12) : 1.2, armR: building ? hammer : null,
        draw: k > 0 && L.hat && age > .08 ? (uu, sw) => { push(); translate(0, -drop); hat(uu, L.hat, sw * (L.hat === 'halo' ? 1.6 : 1)); pop(); } : null });
      if (building && f >= .35 && f < .6) {                                     // BONK stars at the hammer head
        const a = -.4, hx = gx + 4.9 * u + 5.4 * u * Math.cos(a), hy = gy - 4.5 * u - 5.4 * u * Math.sin(a), s = 1.6 * u * (1 - (f - .35) / .25);
        paint(starPts(hx, hy, s, .4, 5, t * 3), { wash: GOLDL, ink: PAL.ink, sw: .8 });
      }
      if (k > 0 && age < .36) {                                                  // completion: TA-DA sparkle burst
        glow(gx, gy - 5 * u, 9 * u, 6.5 * u, GOLDL, 130 * (1 - age / .36), .3);
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * TAU + .3, r = (6 + 4 * easeOut(age / .36)) * u, s = u * 1.1 * Math.sin(Math.PI * age / .36);
          paint(starPts(gx + Math.cos(a) * r * 1.05, gy - 5 * u + Math.sin(a) * r * .8, s), { wash: i % 2 ? GOLDL : PAL.cream, ink: PAL.ink, sw: .6 });
        }
      }
      break;
    }
    // the sepia film burns away at the start
    flash(1 - easeOut(lt / .22), '#FFF3D0');                                    // out of the white-hot film burn
    flash(easeIn(seg(t, 131.72, 132)) * .92, GOLDL);
  }

  // Seamless GIF loop of the same idea (not in the video): an endless zoom-out at a steady RR× per level.
  // Every level is built the same way and only its hat differs (party → crown → halo), so three levels on the frame is
  // exactly where it started. Level n completes at t = n·C; the camera's zoom fixed point (0, -3.9) stays put on screen.
  const LC = 1, LQ = -.45, LHATS = ['party', 'crown', 'halo'], LHITS = 6, LLEN = 3 * LC;
  const lGY = n => 3.9 * (Math.pow(RR, n) - 1);                                 // closed form of GY
  const lHat = n => LHATS[((n % 3) + 3) % 3];
  function recursionLoop(t) {
    const n = Math.floor(t / LC), age = t - n * LC, p = t / LC + LQ, Z = US / Math.pow(RR, p), cy = -3.9 - 1.7 * Math.pow(RR, p);
    const f = frac(age / LC * LHITS);                                            // hammer swing; it lands at f = .35
    const [shx, shy] = shakeXY(t, 4 * Math.exp(-9 * frac(f - .35)));
    const S = (wx, wy) => [960 + shx + wx * Z, 580 + shy + (wy - cy) * Z];
    const [ox, oy] = S(0, -3.9);
    cover('#1E0A14');
    for (let j = Math.floor(2 * p) + 9; j >= Math.floor(2 * p) - 3; j--) {       // rings sink into the vanishing point
      const r = 2.2 * Math.pow(RR, j / 2) * Z; if (r < 10 || r > 2600) continue;
      disc(ox, oy, r, j % 2 ? '#4A1022' : '#2A0A16', 255, 44);
    }
    glow(960, 560, 620, 460, GOLD, 45, .3);
    for (let m = Math.floor(p) - 2; m <= Math.floor(p) + 3; m++) for (let i = 0; i < 6; i++) {   // sparkles riding the zoom
      const salt = ((m % 3) + 3) % 3, a = hash(i * 5.1 + salt * 13.7) * TAU, r = 3 * Math.pow(RR, m + i / 6 + hash(i * 2.9 + salt) * .15) * Z;
      if (r < 30 || r > 1400) continue;
      paint(starPts(ox + Math.cos(a) * r * 1.3, oy + Math.sin(a) * r, 10 + 8 * Math.sin(TAU * 6 * t / LLEN + i + salt)), { wash: GOLDL, ink: null });
    }
    // the next shell goes up around us: planks land in pairs, one pair per hammer blow
    { const u = Z * Math.pow(RR, n + 1), [gx, gy] = S(0, lGY(n + 1));
      if (u < 300) scaffold(gx, gy, u, n * LC, (n + 1) * LC, t, i => n * LC + (Math.floor(i / 2) + .35) / LHITS * LC); }
    const u = Z * Math.pow(RR, n), [gx, gy] = S(0, lGY(n)), h = lHat(n);
    const rays = (hx, hy, R, spin) => { for (let i = 0; i < 12; i++) { const a0 = i / 12 * TAU + spin, a1 = a0 + .16; paint([[hx, hy], [hx + Math.cos(a0) * R, hy + Math.sin(a0) * R], [hx + Math.cos(a1) * R, hy + Math.sin(a1) * R]], { fill: GOLDL, fillOp: 60, bleed: .05, tex: .2, border: .1, ink: null }); } };
    if (h === 'halo') {                                                          // divine rays behind the halo one
      rays(gx, gy - 9 * u, 34 * u * ease(age / .4), age * .8);
      glow(gx, gy - 10.4 * u, 5 * u, 2.4 * u, GOLDL, 150 * ease(age / .3), .3);
    } else if (lHat(n - 1) === 'halo' && age < .3) {                             // ...which fold away as it is swallowed
      const up = u / RR, [px, py] = S(0, lGY(n - 1));
      rays(px, py - 9 * up, 34 * up * (1 - easeIn(age / .3)), (age + LC) * .8);
    }
    const aR = f < .35 ? lerp(1.5, -.4, easeIn(f / .35)) : lerp(-.4, 1.5, easeOut((f - .35) / .65));
    const md = mood(t, [[n * LC, 'closed'], [n * LC + .2, h === 'crown' ? 'narrow' : h === 'party' ? 'happy' : 'spark', h === 'halo' ? 'spark' : null]]);
    const settle = .3 * Math.exp(-age * 8) * Math.cos(age * 32), drop = (1 - backOut(seg(age, .08, .36))) * 7 * u;
    clawd(gx, gy, u, { ...md, sq: settle, mouth: h === 'crown' ? 'grin' : 'smile', blush: h !== 'crown', noShadow: true,
      aR, aL: .5 + .2 * Math.sin(TAU * 6 * t / LLEN), armR: hammer,
      draw: age > .08 ? (uu, sw) => { push(); translate(0, -drop); hat(uu, h, sw * (h === 'halo' ? 1.6 : 1)); pop(); } : null });
    if (f >= .35 && f < .6) {                                                    // BONK stars at the hammer head
      const a = -.4, hx = gx + 4.9 * u + 5.4 * u * Math.cos(a), hy = gy - 4.5 * u - 5.4 * u * Math.sin(a), s = 1.6 * u * (1 - (f - .35) / .25);
      paint(starPts(hx, hy, s, .4, 5, t * 3), { wash: GOLDL, ink: PAL.ink, sw: .8 });
    }
    if (age < .36) {                                                             // completion: TA-DA sparkle burst
      glow(gx, gy - 5 * u, 9 * u, 6.5 * u, GOLDL, 130 * (1 - age / .36), .3);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU + .3, r = (6 + 4 * easeOut(age / .36)) * u, s = u * 1.1 * Math.sin(Math.PI * age / .36);
        paint(starPts(gx + Math.cos(a) * r * 1.05, gy - 5 * u + Math.sin(a) * r * .8, s), { wash: i % 2 ? GOLDL : PAL.cream, ink: PAL.ink, sw: .6 });
      }
    }
    METER_SHOWN = true;
  }
  LOOPS.recursion = recursionLoop; LOOPS.recursion.len = LLEN;

  // =====================================================================================================
  // 5–7 share one world: the theatre stage (floor from y 800), though at first we don't know it.
  // =====================================================================================================
  const DX0 = 960, DX1 = 1400, DTOP = 200, DBOT = 830, TSL = B(196);          // the door flat; SLAM on beat 196
  const LOCKS = [[1180, 515, TSL + .34], [DX0 + 80, 330, B(197)], [DX1 - 80, 705, B(197) + .34]];
  const CHAINS = [[[DX0 - 40, DTOP + 40], [DX1 + 40, DBOT - 70], TSL + .08], [[DX1 + 40, DTOP + 40], [DX0 - 40, DBOT - 70], TSL + .18]];
  const HRX = 610, HCX = 810, HY = 890;                                         // where the two end up sitting
  const PUPX = 330, PUPY = 840;                                                 // basilisk puppet cart
  const SPX = 740;                                                              // the lone spotlight

  function chain(a, b, k, lite) {
    const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 34), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (lite) inkLine([a, b], 2.4, STEELD, 'ink', 0);
    for (let i = 0; i < n * k; i++) {
      const cx = lerp(a[0], b[0], (i + .5) / n), cy = lerp(a[1], b[1], (i + .5) / n);
      if (lite) { if (!(i % 2)) paint(ellPts(cx, cy, 21, 12, 12, 0, ang), { wash: STEEL, ink: PAL.ink, sw: .9 }); continue; }
      if (i % 2) paint(ellPts(cx, cy, 20, 5, 12, 0, ang), { wash: STEELD, ink: PAL.ink, sw: .7 });
      else { paint(ellPts(cx, cy, 21, 12, 14, 0, ang), { wash: STEEL, ink: PAL.ink, sw: .9 }); paint(ellPts(cx, cy, 11, 4, 10, 0, ang), { wash: '#2A2230', ink: null }); }
    }
  }
  function padlock(x, y, s, rot, cheap) {
    push(); translate(x, y); rotate(rot); scale(s);
    inkLine([[-22, 6], [-22, -26], [-12, -42], [12, -42], [22, -26], [22, 6]], 3.2, STEELD, 'ink', .6);
    inkLine([[-22, 6], [-22, -26], [-12, -42], [12, -42], [22, -26], [22, 6]], 1.4, STEEL, 'inkfine', .6);
    paint(rrPts(-36, 0, 72, 60, 12, 1), cheap ? { wash: '#E0A93A', ink: PAL.ink, sw: 1.2 } : { wash: '#E0A93A', fill: '#A8741E', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.2 });
    disc(0, 24, 8, PAL.ink, 255, 10); paint([[-4, 26], [4, 26], [6, 44], [-6, 44]], { wash: PAL.ink, ink: null });
    pop();
  }
  // The door. o.crack: px of golden light down its left edge; o.dx: slides it (it's on casters); o.flat: show it's a flat.
  function door(t, o = {}) {
    const dx = o.dx || 0, cw = o.crack || 0, lit = o.lit || 0;
    push(); translate(dx, 0); if (o.rot) { translate(DX0 + 190, DBOT); rotate(o.rot); translate(-DX0 - 190, -DBOT); }
    if (o.flat) {                                                                // plywood edge + brace: it was scenery all along
      paint([[DX1 + 34, DTOP - 34], [DX1 + 54, DTOP - 20], [DX1 + 54, DBOT + 10], [DX1 + 34, DBOT]], { wash: '#D8B88A', ink: PAL.ink, sw: 1 });
      inkLine([[DX1 + 44, DTOP + 60], [DX1 + 200, DBOT], [DX1 + 44, DBOT]], 2.2, '#9A6A3A', 'ink', 0);
      for (const wx_ of [DX0 + 20, DX1 - 20]) { paint(ellPts(wx_, DBOT + 14, 14, 14, 10), { wash: '#3A3040', ink: PAL.ink, sw: .8 }); }
    }
    const F = (col, op, tex) => o.cheap ? {} : { fill: col, fillOp: op, tex };                          // (cheap: flat washes only)
    paint(rectPts(DX0 - 34, DTOP - 34, DX1 - DX0 + 68, DBOT - DTOP + 34, 2), { wash: '#5A3424', ...F('#2A1810', 60, .6), ink: PAL.ink, sw: 1.4 });
    if (cw > 0) {
      paint(rectPts(DX0, DTOP, cw, DBOT - DTOP), { wash: GOLDL, ink: null });
      paint(rectPts(DX0 + cw * .3, DTOP, cw * .4, DBOT - DTOP), { wash: '#FFF8E4', ink: null });
    }
    paint(rectPts(DX0 + cw, DTOP, DX1 - DX0 - cw, DBOT - DTOP, 2), { wash: '#7A4A30', ...F('#4A2A1A', 60, .7), ink: PAL.ink, sw: 1.2 });
    for (const [y0, y1] of [[DTOP + 40, DTOP + 270], [DTOP + 320, DBOT - 40]]) paint(rectPts(DX0 + cw + 40, y0, DX1 - DX0 - cw - 80, y1 - y0, 2), o.cheap ? { wash: '#6A3E28', ink: '#3A2014', sw: 1 } : { fill: '#4A2A1A', fillOp: 70, tex: .5, ink: '#3A2014', sw: 1 });
    paint(ellPts(DX0 + cw + 42, 530, 14, 14, 12), { wash: GOLD, ink: PAL.ink, sw: .9 });
    if (lit > 0) {
      glow(DX0 + cw / 2, 520, 60 + cw, 360, GOLDL, 120 * lit, .3);
      paint(rectPts(DX0, DBOT - 7, DX1 - DX0, 7), { wash: GOLDL, washOp: 255 * lit, ink: null });
    }
    if (o.locked) {
      for (const [a, b, ct] of CHAINS) chain(a, b, o.locked === true ? 1 : clamp((t - ct) / .1), o.lite);
      for (const [lx, ly, lt] of LOCKS) {
        const age = o.locked === true ? 9 : t - lt; if (age < 0) continue;
        padlock(lx, ly, backOut(age / .12), .6 * Math.exp(-age * 5) * Math.cos(age * 16) + (o.lockSwing || 0) * Math.sin(t * 7 + lx), o.cheap);
      }
    }
    pop();
  }
  function rays(t, cw, lit, over) {                                              // light pouring out of the crack
    if (lit <= 0) return;
    for (let i = 0; i < 6; i++) {
      const y0 = lerp(DTOP + 60, DBOT - 60, i / 5), a = Math.PI + (i - 2.5) * .15 + Math.sin(t * 3 + i) * .03, s = .05 + hash(i) * .04, L = 1100;
      paint([[DX0 + cw / 2, y0 - 30], [DX0 + cw / 2, y0 + 30], [DX0 + Math.cos(a + s) * L, y0 + Math.sin(a + s) * L], [DX0 + Math.cos(a - s) * L, y0 + Math.sin(a - s) * L]],
        { fill: GOLDL, fillOp: (over ? 38 : 60) * lit, bleed: .1, tex: .2, border: .1, ink: null });
    }
    if (!over) paint([[DX0 + cw, DBOT], [DX0, DBOT], [DX0 - 900, 1300], [DX0 - 200, 1300]], { fill: GOLDL, fillOp: 90 * lit, bleed: .1, tex: .3, border: .2, ink: null });
  }
  // the basilisk, as it turns out: a sock puppet on a wheeled cart
  const BAS = 19;                                                               // CAST.basilisk scale (~Clawd's u)
  function puppet(x, y, t, s = 1, look = 1) {
    if (CAST.basilisk) {
      paint(rectPts(x - 120 * s, y - 50 * s, 240 * s, 36 * s, 2), { wash: '#8A5A36', ink: PAL.ink, sw: 1.1 });
      for (const wx_ of [-80, 80]) paint(ellPts(x + wx_ * s, y - 12 * s, 20 * s, 20 * s, 12), { wash: '#3A3040', ink: PAL.ink, sw: .9 });
      const r = CAST.basilisk(x, y - 50 * s, BAS * s, t, { puppet: 1, eyes: 'slit', lookX: look, seed: 3 });
      return [[r.hx - 2.05 * BAS * s, r.hy - 3.4 * BAS * s], [r.hx + 2.05 * BAS * s, r.hy - 3.4 * BAS * s]];
    }
    const sway = Math.sin(t * 5) * 10 * s;
    inkLine([[x - 10 * s, y - 40 * s], [x - 6 * s, y - 250 * s]], 2.4, '#7C4A2C', 'ink', 0);                          // the rod
    const sp = [[x, y - 60 * s], [x - 60 * s, y - 150 * s], [x + 40 * s + sway * .5, y - 250 * s], [x - 20 * s + sway, y - 330 * s], [x + 30 * s + sway, y - 390 * s]];
    tube(sp, 80 * s, 56 * s, { wash: '#6FA05E', fill: '#3F6E3E', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.2, curv: .5 });
    for (let i = 1; i < 4; i++) inkLine([[sp[i][0] - 20 * s, sp[i][1]], [sp[i][0] + 20 * s, sp[i][1] + 6 * s]], .8, '#2E4A2E', 'inkfine', 0);   // sock stitches
    const hx = x + 40 * s + sway, hy = y - 410 * s;
    paint(ellPts(hx, hy, 70 * s, 46 * s, 20), { wash: '#6FA05E', fill: '#3F6E3E', fillOp: 60, ink: PAL.ink, sw: 1.2 });
    inkLine([[hx - 50 * s, hy + 18 * s], [hx + 60 * s, hy + 14 * s]], 1, PAL.ink, 'ink', .3);
    paint([[hx + 58 * s, hy + 14 * s], [hx + 96 * s, hy + 20 * s], [hx + 104 * s, hy + 10 * s], [hx + 100 * s, hy + 24 * s], [hx + 110 * s, hy + 32 * s], [hx + 94 * s, hy + 26 * s]], { wash: '#D8394E', ink: PAL.ink, sw: .6 });
    for (const ex of [-22, 22]) { disc(hx + ex * s, hy - 12 * s, 15 * s, PAL.cream, 255, 12); inkLine([[hx + ex * s - 6 * s, hy - 18 * s], [hx + ex * s + 6 * s, hy - 6 * s]], .9, PAL.ink, 'inkfine', 0); inkLine([[hx + ex * s + 6 * s, hy - 18 * s], [hx + ex * s - 6 * s, hy - 6 * s]], .9, PAL.ink, 'inkfine', 0); }
    paint([[hx - 40 * s, hy - 36 * s], [hx - 40 * s, hy - 80 * s], [hx - 20 * s, hy - 58 * s], [hx, hy - 88 * s], [hx + 20 * s, hy - 58 * s], [hx + 40 * s, hy - 80 * s], [hx + 40 * s, hy - 36 * s]], { wash: '#F2C53D', fill: GOLD, fillOp: 80, ink: PAL.ink, sw: 1 });
    paint(rectPts(x - 120 * s, y - 50 * s, 240 * s, 36 * s, 2), { wash: '#8A5A36', ink: PAL.ink, sw: 1.1 });
    for (const wx_ of [-80, 80]) paint(ellPts(x + wx_ * s, y - 12 * s, 20 * s, 20 * s, 12), { wash: '#3A3040', ink: PAL.ink, sw: .9 });
    return pupEyes(x, y, s);
  }
  // glowing slit eyes in the dark (k: 0..1 fade, bl: blinking)
  function darkEyes(E, k, bl) {
    if (k <= 0) return;
    for (const [ex, ey] of E) {
      glow(ex, ey, 58 * k, 50 * k, '#FF6A3A', 140 * k, .3);
      if (bl) { inkLine([[ex - 20, ey + 2], [ex + 20, ey + 2]], 2.2, '#FFD27A', 'ink', 0); continue; }
      paint(ellPts(ex, ey, 22 * k, 24 * k, 16), { wash: '#FFD27A', fill: '#F29A3A', fillOp: 80, ink: null });
      paint(ellPts(ex + 6 * k, ey + 2, 4.5 * k, 18 * k, 10), { wash: PAL.ink, ink: null });
      paint([[ex - 30, ey - 30], [ex + 30, ey - 30], [ex + 30, ey - 12 + (ex > E[0][0] ? -6 : 6)], [ex - 30, ey - 12 + (ex > E[0][0] ? 6 : -6)]], { wash: DARK, ink: null });   // sly lids
    }
  }
  const pupEyes = (x, y, s = 1) => [[x + 18 * s, y - 422 * s], [x + 62 * s, y - 422 * s]];
  function coneHole() {
    const p = [[SPX - 70, -400], [SPX + 70, -400]];
    for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; p.push([SPX + 320 * Math.cos(a), 900 + 80 * Math.sin(a)]); }
    return p;
  }
  function coneLight(op, flat) {
    if (op < 2) return;
    if (flat) { paint(coneHole(), { wash: '#FFF1D0', washOp: op * .35, ink: null }); paint(ellPts(SPX, 900, 300, 70, 26), { wash: '#FFF1D0', washOp: op * .7, ink: null }); return; }
    paint(coneHole(), { fill: '#FFF1D0', fillOp: op * .45, bleed: .06, tex: .3, border: .2, ink: null });
    paint(ellPts(SPX, 900, 300, 70, 26), { fill: '#FFF1D0', fillOp: op, bleed: .1, tex: .3, border: .3, ink: null });
  }
  // the pair, sitting where the SLAM threw them
  function sitters(t, o) {
    researcher(HRX, HY - 4, 24, { sit: true, dy: 1.1, ...o.r });
    clawd(HCX, HY, 26, { noLegs: true, dy: 2, ...o.c });
  }

  // ---------- 5 · WHAT DID ILYA SEE? (132.0–135.4) ----------
  function ilya(t, lt) {
    METER_SHOWN = true;                                                          // (the meter maxed out at 132; keep the dark room clean)
    const pre = t < TSL, peek = ease(seg(t, 132.8, 133.1)), ta = t - TSL;
    const cw = pre ? lerp(18, 46, ease(seg(t, 132.3, 133.2))) : 0, lit = pre ? ease(seg(t, 132, 132.4)) * (1 + .4 * peek) : 0;
    let cx, cy, z;
    if (pre) { const k = ease(seg(t, 132.0, 133.75)); cx = lerp(800, 930, k); cy = lerp(560, 630, k); z = lerp(1.02, 1.42, k); }
    else { const k = backOut(seg(t, TSL, TSL + .24)); cx = lerp(930, 990, k); cy = lerp(630, 560, k); z = lerp(1.42, 1.0, k) + .08 * ease(seg(t, TSL + .4, 135.4)); }
    const lockHit = LOCKS.reduce((s, [, , l]) => s + (t >= l ? 14 * Math.exp(-(t - l) * 12) : 0), 0);
    const [sx, sy] = shakeXY(t, pre ? 0 : 30 * Math.exp(-ta * 5) + lockHit);
    camBegin(cx + sx, cy + sy, z, pre ? 0 : .04 * Math.exp(-ta * 6) * Math.sin(ta * 40));
    stageBack(t, { backdrop: () => { cover('#1E1522'); glow(1180, 480, 760, 520, '#3E1A2C', 130, .3); }, floor: '#3A2830' });
    rays(t, cw, lit, false);
    door(t, { crack: cw, lit, locked: pre ? 0 : 1, rot: pre ? 0 : .012 * Math.exp(-ta * 6) * Math.sin(ta * 50) });
    // the two tiptoe in, peek, and get blasted back by the slam
    const blown = pre ? 0 : easeOut(seg(t, TSL, TSL + .32)), landed = !pre && ta > .32;
    const walkK = seg(t, 132.0, 132.85);
    const rx = pre ? lerp(140, 740, walkK) : lerp(740, HRX, blown), kx = pre ? lerp(290, 842, walkK) : lerp(842, HCX, blown);
    const tip = walkK < 1 ? Math.abs(Math.sin(walkK * 7 * Math.PI)) : 0;
    const cm = mood(t, [[132, 'look'], [B(195), 'swirl'], [TSL, 'scared', '!!']]);
    const rm = mood(t, [[132, 'look'], [B(195) + .08, 'swirl'], [TSL, 'wide']]);
    if (!landed) {
      researcher(rx, HY - 10, 24, { ...rm, lookX: 1, walk: walkK < 1 ? walkK * 3.5 : null, dy: -tip * .5 - (pre ? 0 : Math.sin(blown * Math.PI) * 3), rot: pre ? .26 * peek : -.5 * blown,
        aL: pre ? .5 : 1.4, aR: pre ? .4 - .6 * peek : 1.2, mouth: pre ? (t > B(195) ? 'O' : 'o') : 'O', hairUp: pre ? 0 : 1, glassesTilt: pre ? 0 : .3 });
      clawd(kx, HY, 26, { ...cm, lookX: 1, walk: walkK < 1 ? walkK * 3.5 : null, dy: -tip * .8 - (pre ? 0 : Math.sin(blown * Math.PI) * 2.5), rot: pre ? .2 * peek : -.45 * blown,
        aL: pre ? .6 : 1.4, aR: pre ? .6 : 1.3, mouth: pre ? (t > B(195) ? 'O' : 'o') : 'O' });
    } else {
      const bump = Math.exp(-(ta - .32) * 9);
      sitters(t, { r: { ...rm, hairUp: .4 + .6 * bump, glassesTilt: .3, mouth: 'O', sq: .2 * bump, aL: -.6, aR: -.6, emote: 'sweat', emoteK: seg(ta, .5, .8) },
        c: { ...cm, mouth: 'wobble', sq: .25 * bump, aL: .1, aR: .1 } });
    }
    rays(t, cw, lit, true);                                                        // the light falls on their faces
    if (!pre) {
      if (ta < .3) for (let i = 0; i < 16; i++) {                                  // slam shockwave
        const a = i / 16 * TAU, r0 = 330 + ta * 700, r1 = r0 + 140 * (1 - ta / .3);
        inkLine([[1180 + Math.cos(a) * r0, 515 + Math.sin(a) * r0 * .9], [1180 + Math.cos(a) * r1, 515 + Math.sin(a) * r1 * .9]], 1.4, PAL.cream, 'ink', 0);
      }
      if (ta < .8) for (let i = 0; i < 5; i++) {                                   // dust from under the door
        const d = easeOut(ta / .8), px = lerp(DX0 + 20, DX1 - 20, i / 4) + (i - 2) * 70 * d;
        glow(px, DBOT - 20 - 40 * d * hash(i), 50 + 60 * d, 34 + 30 * d, '#9A8A90', 150 * (1 - ta / .8), .3);
      }
      sfx('SLAM!', 1150, 160, 210, RED, ta, { life: 1.4, rot: -.07, screen: true });   // screen space: never cropped by the snap-zoom
    }
    camEnd();
    if (!pre) cover(DARK, 70 * ease(ta / .3));                                     // the room goes dim without the light
    flash(seg(t, 135.22, 135.4), DARK);
  }

  // ---------- 6 · DARKNESS, ONE SPOTLIGHT (135.4–137.4) ----------
  const ON = B(199);
  function darkness(t, lt) {
    const on = t >= ON && !(t >= ON + .05 && t < ON + .1);
    camBegin(710 + 8 * wob(t, .25), 680, 1.28 + .04 * seg(t, 135.4, 137.4), 0);
    stageBack(t, { backdrop: () => cover('#2A1C26') });
    const E = puppet(PUPX, PUPY, t);
    door(t, { locked: true });
    const look = t < 136.05 ? 0 : t < 136.85 ? 1 : t < 137.12 ? 0 : -1;
    const blink = (t > 136.53 && t < 136.66) || (t > 135.58 && t < 135.66);
    const cm = mood(t, [[135.4, 'normal'], [136.05, 'look'], [136.85, 'normal', '?'], [137.12, 'scared', '!']]);
    const rm = mood(t, [[135.4, 'dot'], [136.05, 'look'], [136.85, 'dot'], [137.12, 'wide']]);
    sitters(t, {
      r: { ...rm, lookX: look, squint: blink ? 1 : rm.squint, mouth: t > 137.12 ? 'o' : 'flat', hairUp: .3, glassesTilt: .15, aL: -.7, aR: -.7 },
      c: { ...cm, lookX: -look, squint: blink ? 1 : cm.squint, mouth: t > 137.12 ? 'o' : 'flat',
        aL: t > 136.85 && t < 137.12 ? .9 : .1, aR: t > 136.85 && t < 137.12 ? .9 : .1 } });
    if (on) { darkAround(coneHole(), DARK, 252); coneLight(70 + 10 * Math.sin(t * 40)); }
    else {
      cover(DARK);
      if (!blink) {                                                              // eyes in the dark
        for (const ex of [-3, 2]) paint(rrPts(HCX + ex * 26, HY - 7 * 26 + 2 * 26 - 10, 26, 52, 8), { wash: PAL.cream, washOp: 235, ink: null });
        for (const s of [-1, 1]) { paint(ellPts(HRX + s * 24, HY - 4 + 1.1 * 24 - 10.55 * 24, 19, 19, 16), { ink: PAL.cream, sw: 1 }); disc(HRX + s * 24, HY - 4 + 1.1 * 24 - 10.55 * 24, 5, PAL.cream, 240, 8); }
      }
    }
    if (t > 136.95) darkEyes(E, backOut(seg(t, 136.95, 137.12)), t > 137.22 && t < 137.3);   // ...something else is watching
    camEnd();
  }

  // ---------- 7 · WAS IT ALL FOR SHOW? (137.4–140.5) ----------
  const CX = 1180, CY = 805, CU = 42, SU = 16, SPLIT = B(204), GRIN = B(205), FLOOR_IN = CY - 2.1 * CU;
  // three little Clawds in a pyramid inside the giant costume; they tumble out when it splits open
  const SMALL = [
    { from: [CX - 85, FLOOR_IN], to: [1030, 915], t0: SPLIT + .1, t1: SPLIT + .38, turn: 0, H: 70 },
    { from: [CX + 85, FLOOR_IN], to: [1362, 915], t0: SPLIT + .14, t1: SPLIT + .44, turn: 0, H: 80 },
    { from: [CX, FLOOR_IN - 7.4 * SU], to: [1196, 915], t0: SPLIT + .2, t1: SPLIT + .56, turn: 1, H: 170 },
  ];
  // one half of the costume, hinged at its outer edge; sxh = cos(swing) squeezes it toward the hinge
  function costumeHalf(side, sxh) {
    const u = CU, x = CX, y = CY, sw = 1.6, px = x + side * 5 * u;
    push(); translate(px, y); scale(sxh, 1); translate(-px, -y);
    for (const lx of side < 0 ? [-4, -2] : [1, 3]) paint(rectPts(x + lx * u, y - 2.4 * u, u, 2.3 * u, 1.5), { wash: PAL.clayDk, ink: PAL.ink, sw: sw * .8 });
    push(); translate(x + side * 4.9 * u, y - 4.5 * u); rotate(side * 1.2);                   // floppy costume arm
    paint(rectPts(side < 0 ? -2.3 * u : 0, -.5 * u, 2.3 * u, u, 1.5), { wash: PAL.clay, ink: PAL.ink, sw: sw * .8 }); pop();
    const x0 = side < 0 ? x - 5 * u : x, body = rectPts(x0, y - 8 * u, 5 * u, 6 * u, 1.5);
    if (sxh < 0) {                                                                 // the inside: satin lining, a strut, zipper teeth
      paint(body, { wash: '#8E3048', fill: '#D0647A', fillOp: 100, bleed: .15, tex: .6, border: .6, ink: null });
      paint(rectPts(x0 + .25 * u, y - 5.6 * u, 4.5 * u, .7 * u, 1), { wash: PLANKC, fill: '#7C4A2C', fillOp: 50, ink: PAL.ink, sw: sw * .7 });
      for (let i = 0; i < 12; i++) paint(rectPts(side < 0 ? x - .32 * u : x + .04 * u, y - 7.8 * u + i * .48 * u, .28 * u, .24 * u), { wash: STEEL, ink: null });
      paint(body, { ink: PAL.ink, sw });
    } else {
    paint(body, { wash: PAL.clay, ink: null });
    paint(ellPts(x0 + (side < 0 ? 3.2 : 1.8) * u, y - 6.4 * u, 1.9 * u, 1.3 * u, 16, 1), { fill: '#F5B394', fillOp: 110, bleed: .2, tex: .8, border: .8, ink: null });
    paint(rectPts(x0 + .2 * u, y - 3.8 * u, 4.6 * u, 1.6 * u), { fill: PAL.clayDk, fillOp: 110, bleed: .03, tex: .7, border: .5, ink: null });
    paint(body, { ink: PAL.ink, sw });
    const ex = side < 0 ? x - 3 * u : x + 2 * u;
    paint(rectPts(ex, y - 7 * u, u, 2 * u, 1), { wash: PAL.ink, ink: null });
    disc(ex + .32 * u, y - 6.58 * u, .2 * u, PAL.cream, 230, 10);
    }
    if (side < 0) {                                                                // a halo on a wire...
      inkLine([[x - .5 * u, y - 8 * u], [x - .5 * u, y - 10 * u], [x - .2 * u, y - 10.4 * u]], .9, STEELD, 'inkfine', .5);
      paint(ellPts(x - .2 * u, y - 10.6 * u, 2.6 * u, .7 * u, 22), { ink: GOLD, sw: 2.2 });
    } else {                                                                       // ...and a crown, slightly askew
      paint([[x + .8 * u, y - 7.9 * u], [x + .8 * u, y - 10.2 * u], [x + 1.9 * u, y - 9 * u], [x + 3 * u, y - 10.6 * u], [x + 4.1 * u, y - 9 * u], [x + 4.5 * u, y - 10.2 * u], [x + 4.5 * u, y - 7.9 * u]],
        { wash: '#F2C53D', fill: GOLD, fillOp: 90, ink: PAL.ink, sw: 1.1 });
    }
    pop();
  }
  function reveal(t, lt) {
    const L = ease(seg(t, 137.4, 138.3)), pull = ease(seg(t, 137.4, 139.05));
    const cam = [lerp(710, 960, pull), lerp(680, 540, pull)], z = lerp(1.28, 1.0, pull) + .012 * pulse(t, 5) * seg(t, 139, 140);
    camBegin(cam[0], cam[1], z, 0);
    stageBack(t, { backdrop: t => { paint(rectPts(-400, -400, W + 800, 1240), { wash: '#F6E3C8', washOp: 255, ink: null }); sunburst(960, 430, PAL.rose, PAL.ochre, t * .12, 16, 1300); cover(DARK, 255 * (1 - L) * .9); } });
    for (const [x, col] of [[700, PAL.cream], [1180, PAL.rose]]) {                 // warm spots fade up
      paint([[x - 90, -60], [x + 90, -60], [x + 260, 860], [x - 260, 860]], { wash: col, washOp: 45 * L, ink: null });
      paint(ellPts(x, 880, 270, 55, 24), { wash: col, washOp: 80 * L, ink: null });
    }
    // the three little Clawds who were inside the giant (hidden behind the door until it rolls away)
    const smalls = out => SMALL.forEach((c, i) => {
      if ((t >= c.t0) !== out) return;
      const k = seg(t, c.t0, c.t1), wob = t > SPLIT && t < c.t0 ? Math.sin((t - SPLIT) * 34 + i * 2) * .14 : 0;
      const x = lerp(c.from[0], c.to[0], k), y = lerp(c.from[1], c.to[1], k) - c.H * 4 * k * (1 - k), land = t > c.t1 ? Math.exp(-(t - c.t1) * 10) : 0;
      const sheep = t > GRIN + i * .06;
      const md = mood(t, [[137.4, 'normal'], [SPLIT + .03, 'scared', i === 2 ? '!' : null], [GRIN + i * .06, 'happy', i === 1 ? 'sweat' : null]]);
      clawd(x, y, SU, { ...md, rot: c.turn * TAU * ease(k) + wob, sq: .3 * land, noShadow: k < 1, mouth: sheep ? 'grin' : k > 0 && k < 1 ? 'O' : 'flat', blush: sheep, seed: i,
        dy: sheep ? -.8 * pulse(t, 6) : 0, aL: sheep ? (i === 2 ? 1.2 + .4 * Math.sin(t * 16) : .3) : 1.3, aR: sheep ? (i === 0 ? 1.55 : .3) : 1.3 });
    });
    // the giant Clawd costume: unzips (the halves part a crack), then swings open like cabinet doors
    const uz = seg(t, SPLIT - .34, SPLIT - .04), sa = t - SPLIT;
    const sxh = t < SPLIT ? 1 - .07 * uz : Math.cos(2.1 * backOut(seg(t, SPLIT, SPLIT + .3)) + .06 * Math.sin(sa * 9) * Math.exp(-sa * 3));
    smalls(false);
    costumeHalf(-1, sxh); costumeHalf(1, sxh);
    smalls(true);
    if (t < SPLIT) {
      const zy = lerp(CY - 7.9 * CU, CY - 2.2 * CU, uz);
      inkLine([[CX, CY - 8 * CU], [CX, CY - 2 * CU]], .8, '#8A8F9A', 'inkfine', 0);              // the zipper
      paint(rrPts(CX - 8, zy - 4, 16, 28, 4), { wash: '#C9CED6', ink: PAL.ink, sw: .8 });
    }
    // a stagehand carries off the moon (on a string) and the paperclip planet (on a stick); hidden behind the flat at first
    const hx = lerp(1780, -300, seg(t, 137.5, 140.15));                           // moon on a string + paperclip planet on a stick
    if (hx > -280 && hx < 2000) {
      const hy = 815, bob = Math.sin(t * 6) * 10, tipL = [hx - 150, 815 - 13 * 7 + bob * .3], tipR = [hx + 150, 815 - 13 * 7];
      const mx = hx - 130 + Math.sin(t * 3) * 20, my = 290 + bob;
      inkLine([[hx - 90, hy - 80], [mx - 10, my + 90], [mx, my + 60]], .8, PAL.ink, 'inkfine', .5);
      paint(ellPts(mx, my, 62, 62, 22), { wash: '#F4E4A6', fill: '#D8C07A', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
      for (const [cx_, cy_, r] of [[-18, -14, 12], [16, 10, 9], [-8, 22, 7]]) paint(ellPts(mx + cx_, my + cy_, r, r, 10), { wash: '#E2CC88', ink: '#B89A5A', sw: .5 });
      paint([[mx - 6, my + 60], [mx + 6, my + 60], [mx, my + 70]], { wash: '#D8C07A', ink: PAL.ink, sw: .5 });
      const pxp = hx + 90, pyp = 470 + bob * .5;
      inkLine([[hx + 80, hy - 70], [pxp, pyp + 62]], 2.2, '#7C4A2C', 'ink', 0);
      paint(ellPts(pxp, pyp, 64, 64, 22), { wash: '#B8BEC8', fill: '#7A8290', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.1 });
      for (let i = 0; i < 6; i++) {                                                // paperclips all over it
        const a = hash(i * 2.7) * TAU, r = 18 + hash(i) * 30, cx_ = pxp + Math.cos(a) * r, cy_ = pyp + Math.sin(a) * r, ra = hash(i * 4.1) * Math.PI;
        const pts = [[0, 12], [0, -10], [5, -14], [10, -10], [10, 10], [5, 14], [-3, 10], [-3, -6]].map(([x_, y_]) => [cx_ + x_ * Math.cos(ra) - y_ * Math.sin(ra), cy_ + x_ * Math.sin(ra) + y_ * Math.cos(ra)]);
        inkLine(pts, .9, '#3E4656', 'inkfine', .4);
      }
      paint(ellPts(pxp, pyp, 100, 20, 22, 0, -.3), { ink: STEELD, sw: 1.1 });
      clawd(hx, hy, 13, { ...move('run', t, 3), hat: 'hard', eyes: 'narrow', mouth: 'flat', flip: true, aL: 1.1, aR: .9 });
    }
    // the door rolls off on its casters (pulled by a rope from the wings)
    const dx = 1150 * easeIn(seg(t, 137.55, 138.95));
    if (dx < 1100) {
      inkLine([[DX1 + 54 + dx, 700], [DX1 + 400 + dx, 690], [2600, 660]], 1.2, '#9A7A50', 'ink', .4);
      door(t, { locked: true, lite: true, cheap: true, flat: true, dx, rot: .01 * Math.sin(t * 14) * seg(t, 137.55, 138.2), lockSwing: .15 });
    }
    // stagehands clear the scenery
    const cartX = lerp(PUPX, -560, easeIn(seg(t, 137.95, 139.7)));
    const E = puppet(cartX, PUPY, t, 1, -1);
    const bx = cartX - 190;
    if (bx > -200) {
      inkLine([[bx + 80, 780], [cartX - 120, 800]], 1.2, '#9A7A50', 'ink', .3);
      clawd(bx, 850, 13, { ...move('walk', t * 1.4, 2), hat: 'hard', eyes: 'narrow', mouth: 'flat', flip: true, aR: .2, aL: .3, rot: -.08 });
    }
    stageFront(t, { curtain: .12 * (1 - ease(seg(t, 137.5, 138.5))) });
    darkAround(coneHole(), DARK, 252 * (1 - L));
    coneLight(70 * (1 - L), true);
    darkEyes(E, 1 - seg(t, 137.45, 137.8), false);
    // our two: stand up, gape at the scenery, then crack up
    const upK = seg(t, 137.72, 137.95), stand = t > 137.84;
    const look = t < 138.4 ? -1 : t < SPLIT ? Math.sin((t - 138.4) * 5) : 1;
    const rm = mood(t, [[137.4, 'wide'], [SPLIT + .1, 'wide', '!'], [GRIN + .1, 'closed']]);
    const cm = mood(t, [[137.4, 'scared'], [138.0, 'look'], [SPLIT + .1, 'scared', '!'], [GRIN + .1, 'happy', 'music']]);
    const hop = Math.sin(upK * Math.PI) * 1.2, laugh = t > GRIN + .1;
    if (stand) {
      researcher(HRX, HY, 24, { ...rm, lookX: look, dy: -hop - (laugh ? .4 * pulse(t, 5) : 0), mouth: laugh ? 'grin' : 'O', hairUp: laugh ? 0 : .3, aL: laugh ? .9 : -.9, aR: laugh ? -1.1 : -.9, rot: laugh ? .05 * Math.sin(t * 12) : 0 });
      clawd(HCX, HY, 26, { ...cm, lookX: look, dy: -hop * 1.5 - (laugh ? .8 * pulse(t, 5) : 0), mouth: laugh ? 'grin' : 'O', blush: laugh, aL: laugh ? 1.3 : .2, aR: laugh ? 1.3 : .2 });
    } else sitters(t, { r: { ...rm, lookX: -1, mouth: 'o', hairUp: .3, aL: -.7, aR: -.7, dy: 1.1 - hop }, c: { ...cm, lookX: -1, mouth: 'o', dy: 2 - hop * 1.5 } });
    camEnd();
  }

  chapter('chorus4', 123.5, 140.5, [[123.5, redAlert], [126.0, loom], [128.0, flashback], [130.0, recursion], [132.0, ilya], [135.4, darkness], [137.4, reveal]]);
})();
