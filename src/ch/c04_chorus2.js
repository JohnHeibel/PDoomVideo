// src/ch/c04_chorus2.js: Chorus 2, "Bigger Show" (59.0–73.0). Arena with pyro, then space violet and gold.
// The heart bubble pops onto the arena stage, building-sized Clawd works two pumps, the crowned basilisk bursts
// through the floor and gets fed GPUs, Clawd surfs a stock line to the moon, galaxies collapse into the Omega Point,
// a planet-sized GPU overflows its odometer, and the hard-hat crew locks a monster in a vault with no back wall.
(() => {
  const VIO = '#8B62C9', GOLD2 = '#F2B93B', SPACE = '#2A1F4A', DEEP = '#1B1535', LAV = '#EFDDF3';
  const GREEN = '#6DBE45', GREEN_DK = '#3E7D2A';
  const bT = n => OFF + n * BEAT;                       // song time of beat n (beat 87 = 59.53 s)
  const easeIO = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const B_BOOM = bT(90);                               // 61.57: the basilisk bursts out of the floor

  // =====================================================================================================
  // CAST.basilisk(x, y, s, t, o): the crowned basilisk. (x, y) = ground point it rises from, s ~ Clawd's u.
  // At s = 16 it stands ~2.6x Clawd's height. o: rise (0..1+, how far it has emerged), bow (0..1), puppet (0..1),
  // open (jaw 0..1), eyes ('slit' | 'wide' | 'happy' | 'closed'), lids (0..1 sly half-lids), lookX/lookY, blush,
  // lean (body lean, radians), sway (default 1), flip, seed. Returns { hx, hy, mx, my } (head + mouth, world).
  // =====================================================================================================
  const BS = { body: '#4FA57B', dk: '#2C6A53', belly: '#F4DB8E', frill: '#8E5CC0', eye: '#F7D24A', maw: '#5A1F33', tongue: '#E2476E', gold: '#F2C53D' };
  CAST.basilisk = (x, y, s, t, o = {}) => {
    const rise = Math.max(0, o.rise ?? 1), bow = clamp(o.bow || 0), pup = clamp(o.puppet || 0), open = clamp(o.open || 0);
    const sw = clamp(s / 12, .5, 2.6), dir = o.flip ? -1 : 1, N = 12, L = 15 * s * rise, J = open * 2.4;
    const ph = t * 2.3 + (o.seed || 0), sway = (o.sway ?? 1) * (1 - bow * .75);
    // spine: integrate a gently swaying S-curve; bow arches the neck over into a curtsy
    const sp = [[0, 0]], an = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      an.push(sway * .42 * Math.sin(u * 4.4 - 1.3 + Math.sin(ph) * .45) * (1 - .6 * u) + bow * 2.7 * u * u * u + (o.lean || 0) * u);
      if (i) { const a = (an[i - 1] + an[i]) / 2, p = sp[i - 1]; sp.push([p[0] + Math.sin(a) * L / N, p[1] - Math.cos(a) * L / N]); }
    }
    const wid = u => s * (3.1 - 1.35 * u);
    const off = (i, k) => { const w = wid(i / N) * k, a = an[i]; return [sp[i][0] + Math.cos(a) * w, sp[i][1] + Math.sin(a) * w]; };
    const ah = an[N] * .5 + bow * .45;                 // head angle (straightens up relative to the neck)

    push(); translate(x, y); scale(dir, 1);
    if (rise > .03) {
      // back frill: little violet spikes along the -x edge, drawn first so the body overlaps their roots
      for (let i = 2; i < N - 1; i++) {
        const a = an[i], w = wid(i / N), nx = -Math.cos(a), ny = -Math.sin(a), tx = Math.sin(a), ty = -Math.cos(a);
        const bx = sp[i][0] + nx * w * .8, by = sp[i][1] + ny * w * .8, len = s * (1.3 + .25 * Math.sin(i * 1.7));
        paint([[bx - tx * s * .8, by - ty * s * .8], [bx + nx * len + tx * s * .5, by + ny * len + ty * s * .5], [bx + tx * s * .9, by + ty * s * .9]], { wash: BS.frill, fill: PAL.violet, fillOp: 60, ink: PAL.ink, sw: sw * .6 });
      }
      // body tube
      const A = [], B = [];
      for (let i = 0; i <= N; i++) { A.push(off(i, i ? 1 : 1.12)); B.push(off(i, i ? -1 : -1.12)); }
      paint([...A, ...B.reverse()], { wash: BS.body, fill: BS.dk, fillOp: 75, bleed: .06, tex: .7, border: .5, ink: PAL.ink, sw, curv: .35 });
      // belly plates (a cream strip slightly to the +x side, with ridges)
      const bA = [], bB = [];
      for (let i = 0; i <= N - 1; i++) { bA.push(off(i, .64)); bB.push(off(i, -.22)); }
      paint([...bA, ...bB.slice().reverse()], { wash: BS.belly, fill: PAL.ochre, fillOp: 50, tex: .5, ink: null, curv: .35 });
      for (let i = 1; i < N - 1; i++) { const p = off(i, .64), q = off(i, -.22), m = off(i, .21); inkLine([q, [m[0], m[1] + s * .3], p], sw * .45, BS.dk, 'inkfine', .6); }
      // darker scale spots on the back side
      for (const i of [2, 4, 6, 8]) { const p = off(i, -.64); paint(ellPts(p[0], p[1], s * .5, s * .32, 10, 0, an[i]), { wash: BS.dk, washOp: 170, ink: null }); }
      // puppet: a striped sock cuff at the base and cross-stitch seams
      if (pup > .02) {
        const c0 = [off(0, 1.14), off(1, 1.06), off(1, -1.06), off(0, -1.14)];
        paint(c0, { wash: PAL.rose, washOp: 255 * pup, ink: PAL.ink, sw: sw * .7 });
        inkLine([off(0, 1.1), off(0, -1.1)], sw * 1.1, PAL.cream, 'ink', 0);
        if (pup > .3) for (let i = 2; i < N; i += 2) { const p = off(i, -.45), q = off(i + 1, -.45); inkLine([p, q], sw * .35, PAL.cream, 'inkfine', 0); const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; inkLine([[m[0] - s * .35, m[1] - s * .2], [m[0] + s * .35, m[1] + s * .2]], sw * .35, PAL.cream, 'inkfine', 0); }
      }

      // ---------- head ----------
      push(); translate(sp[N][0], sp[N][1]); rotate(ah);
      const S = ([a, b]) => [a * s, b * s];
      if (open > .02) {
        paint([[-3.3, -1.1], [3.3, -1.1], [2.8, .5 + J], [0, 1.05 + J], [-2.8, .5 + J]].map(S), { wash: BS.body, fill: BS.dk, fillOp: 70, ink: PAL.ink, sw, curv: .5 });
        paint([[-2.9, -1.2], [2.9, -1.2], [2.3, J * .82], [0, .32 + J * .86], [-2.3, J * .82]].map(S), { wash: BS.maw, ink: null, curv: .5 });
        paint(ellPts(0, (.15 + J * .72) * s, 1.4 * s, .5 * s, 14), { wash: BS.tongue, ink: null });
      }
      const skull = [[-4.3, -2.4], [-4.1, -3.9], [-3.1, -5.1], [-1.5, -5.7], [0, -5.8], [1.5, -5.7], [3.1, -5.1], [4.1, -3.9], [4.3, -2.4], [3.8, -1.1], [2.6, -.2], [0, .15], [-2.6, -.2], [-3.8, -1.1]].map(S);
      paint(skull, { wash: BS.body, fill: BS.dk, fillOp: 55, bleed: .08, tex: .6, border: .5, ink: PAL.ink, sw, curv: .5 });
      paint(ellPts(-.8 * s, -4.6 * s, 2.2 * s, .8 * s, 14, 0, -.15), { fill: '#8FD1A6', fillOp: 110, bleed: .2, tex: .7, border: .7, ink: null });
      // mouth: a wide smile with two fangs (or the fangs hang over the open maw)
      if (open <= .02) inkLine([[-2.9, -1.25], [-1.4, -.62], [0, -.5], [1.4, -.62], [2.9, -1.25]].map(S), sw * 1.1, PAL.ink, 'ink', .6);
      for (const fx of [-1.05, 1.05]) {
        const y0 = open > .02 ? -.05 : -.6, y1 = open > .02 ? 1.0 : .25;
        paint([[fx - .38, y0], [fx + .38, y0], [fx, y1]].map(S), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
      }
      // forked tongue flick when the mouth is shut
      if (open <= .02 && frac(t * .9 + (o.seed || 0)) < .2) {
        const k = Math.sin(frac(t * .9 + (o.seed || 0)) / .2 * Math.PI), ty = (-.3 + 2.2 * k) * s;
        inkLine([[0, -.4 * s], [.15 * s, ty * .6], [0, ty]], sw * 1.6, BS.tongue, 'ink', .5);
        inkLine([[0, ty], [-.45 * s, ty + .6 * s]], sw * 1.2, BS.tongue, 'ink', 0);
        inkLine([[0, ty], [.45 * s, ty + .6 * s]], sw * 1.2, BS.tongue, 'ink', 0);
      }
      for (const nx of [-.65, .65]) paint(ellPts(nx * s, -1.75 * s, .22 * s, .14 * s, 8), { wash: PAL.ink, ink: null });
      if (o.blush) for (const bx of [-3.0, 3.0]) paint(ellPts(bx * s, -1.75 * s, .85 * s, .42 * s, 12), { fill: PAL.rose, fillOp: 170 * clamp(o.blush), bleed: .2, ink: null });
      // eyes
      const eyes = o.eyes || 'slit';
      for (const ex of [-2.05, 2.05]) {
        const cx = ex * s, cy = -3.4 * s;
        if (eyes === 'happy') { inkLine([[cx - .95 * s, cy + .35 * s], [cx, cy - .65 * s], [cx + .95 * s, cy + .35 * s]], sw * 1.5, PAL.ink, 'ink', .4); continue; }
        if (eyes === 'closed') { inkLine([[cx - .95 * s, cy - .1 * s], [cx, cy + .5 * s], [cx + .95 * s, cy - .1 * s]], sw * 1.4, PAL.ink, 'ink', .4); continue; }
        paint(ellPts(cx, cy, 1.15 * s, 1.25 * s, 18), { wash: BS.eye, fill: PAL.ochre, fillOp: 70, ink: PAL.ink, sw: sw * .8 });
        const lx = (o.lookX || 0) * .42 * s, ly = (o.lookY || 0) * .4 * s;
        if (eyes === 'wide') paint(ellPts(cx + lx, cy + ly, .55 * s, .62 * s, 12), { wash: PAL.ink, ink: null });
        else paint(ellPts(cx + lx, cy + ly, .26 * s, .92 * s, 12), { wash: PAL.ink, ink: null });
        paint(ellPts(cx + lx + .32 * s, cy + ly - .48 * s, .2 * s, .2 * s, 8), { wash: PAL.cream, ink: null });
        const lid = eyes === 'wide' ? 0 : (o.lids ?? .45);
        if (lid > .02) {
          const inner = ex < 0 ? 1 : -1, yO = cy - 1.3 * s + lid * 1.0 * s, yI = cy - 1.3 * s + lid * 1.9 * s;
          const pO = [cx - inner * 1.35 * s, yO], pI = [cx + inner * 1.35 * s, yI];
          paint([[pO[0], cy - 1.9 * s], [pI[0], cy - 1.9 * s], pI, pO], { wash: BS.body, ink: null });
          inkLine([pO, pI], sw * 1.1, PAL.ink, 'ink', 0);
        }
      }
      // the little crown, jauntily tilted
      push(); translate(.45 * s, -5.3 * s); rotate(.24);
      paint([[-1.7, .25], [-1.85, -2.0], [-.9, -1.0], [0, -2.45], [.9, -1.0], [1.85, -2.0], [1.7, .25]].map(S), { wash: BS.gold, fill: PAL.ochre, fillOp: 90, ink: PAL.ink, sw: sw * .8 });
      for (const [gx, gc] of [[-1.0, PAL.teal], [0, PAL.rose], [1.0, PAL.teal]]) paint(ellPts(gx * s, -.5 * s, .28 * s, .28 * s, 8), { wash: gc, ink: null });
      for (const [px, py] of [[-1.85, -2.0], [0, -2.45], [1.85, -2.0]]) paint(ellPts(px * s, py * s, .27 * s, .27 * s, 8), { wash: PAL.cream, ink: PAL.ink, sw: sw * .4 });
      pop();
      pop(); // head

      // puppet rig: a wooden control bar on strings, held by a stagehand's orange hands reaching in from above
      if (pup > .02) {
        const hx = sp[N][0], hy = sp[N][1], by = hy - 11 * s - (1 - pup) * 60 * s, bx = hx + Math.sin(t * 2.3) * s * .6;
        const tip = (lx, ly) => [hx + lx * Math.cos(ah) - ly * Math.sin(ah), hy + lx * Math.sin(ah) + ly * Math.cos(ah)];
        for (const [a, b] of [[[bx - 4.2 * s, by], tip(-3.6, -3.4 * 1)], [[bx + 4.2 * s, by], tip(3.6, -3.4)], [[bx, by], sp[N >> 1]], [[bx - 1.2 * s, by], tip(0, -5.8)]]) inkLine([a, b], sw * .35, PAL.cream, 'inkfine', 0);
        paint(rectPts(bx - 5 * s, by - .45 * s, 10 * s, .9 * s, s * .05), { wash: WOOD, fill: WOOD_DK, fillOp: 70, ink: PAL.ink, sw: sw * .7 });
        paint(rectPts(bx - .45 * s, by - 2.6 * s, .9 * s, 5.2 * s, s * .05), { wash: WOOD, fill: WOOD_DK, fillOp: 70, ink: PAL.ink, sw: sw * .7 });
        for (const side of [-1, 1]) {
          const ax = bx + side * 3.4 * s;
          paint(rectPts(ax - .9 * s, by - 60 * s, 1.8 * s, 59.2 * s), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 50, ink: PAL.ink, sw: sw * .7 });
          paint(rrPts(ax - 1.25 * s, by - 1.1 * s, 2.5 * s, 2.0 * s, .7 * s), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 60, ink: PAL.ink, sw: sw * .7 });
        }
      }
    }
    pop();
    // world-space head and mouth positions for the caller (GPU offerings aim at the mouth)
    const my = (.4 + J * .6) * s, hx = x + dir * sp[N][0], hy = y + sp[N][1];
    return { hx, hy, mx: hx - dir * my * Math.sin(ah), my: hy + my * Math.cos(ah), top: hy - 7 * s };
  };

  // =====================================================================================================
  // Arena kit: the chorus stage, bigger. Violet-and-gold sunburst, sweeping beams, pyro jets, a crowd.
  // =====================================================================================================
  function arenaBack(t) { stageBack(t, { a: VIO, b: GOLD2, wall: LAV }); }
  function beams(t) {
    const cols = [VIO, GOLD2, PAL.rose, PAL.cream];
    for (let i = 0; i < 4; i++) {
      const x0 = 330 + i * 420, a = Math.sin(t * 1.4 + i * 1.9) * .5, len = 1050, w = 150;
      const ex = x0 + Math.sin(a) * len, ey = 120 + Math.cos(a) * len;
      paint([[x0 - 18, 120], [x0 + 18, 120], [ex + w, ey], [ex - w, ey]], { fill: cols[i], fillOp: 42, bleed: .05, tex: .2, border: .1, ink: null });
    }
  }
  // flame envelope: shoots up right on the beat, then dies away
  const jetEnv = (t, ph = 0) => { const f = frac(bpOf(t) - ph); return f < .07 ? f / .07 : Math.exp(-(f - .07) * 3.4); };
  function pyro(x, y, h, t, w = 60, seed = 0) {
    paint(rectPts(x - w * .55, y - 26, w * 1.1, 30, 2), { wash: '#4A4458', ink: PAL.ink, sw: .8 });
    if (h < 10) return;
    const flame = (sc, hh, col, fcol, ink) => {
      const L = [], R = [], n = 9;
      for (let i = 0; i <= n; i++) {
        const a = i / n, ww = w * sc * Math.pow(1 - a, .75) * (1 + .6 * Math.sin(a * Math.PI)), xo = Math.sin(a * 6 + t * 26 + seed) * w * .35 * a;
        L.push([x + xo - ww, y - 24 - a * hh]); R.push([x + xo + ww, y - 24 - a * hh]);
      }
      paint([...L, ...R.reverse()], { wash: col, washOp: 235, fill: fcol, fillOp: fcol ? 80 : 0, bleed: .15, tex: .4, border: .3, ink: ink ? PAL.ink : null, sw: .9, curv: .5 });
    };
    flame(1, h, '#E8553A', PAL.rose, true);
    flame(.62, h * .78, PAL.ochre, '#F7D24A', false);
    flame(.3, h * .52, PAL.cream, null, false);
    for (let i = 0; i < 5; i++) {
      const ph = frac(t * 1.7 + hash(i + seed * 7)), sx = x + (hash(i * 3 + seed) - .5) * w * 2.4 + Math.sin(t * 9 + i) * 10, sy = y - 24 - h * (.7 + ph * .6);
      paint(ellPts(sx, sy, 7 * (1 - ph) + 2, 7 * (1 - ph) + 2, 8), { wash: i % 2 ? GOLD2 : PAL.cream, ink: null });
    }
  }
  // stage valance across the top of the frame (screen space)
  function valanceTop(y0 = 100) {
    const v = [[-80, -60], [W + 80, -60]];
    for (let i = 12; i >= 0; i--) { v.push([i * 160 + 80, y0 + 26 + jit(2)]); v.push([i * 160, y0]); }
    paint(v, { wash: CURTAIN, washOp: 255, fill: CURTAIN_DK, fillOp: 110, bleed: .05, tex: .7, border: .6, ink: PAL.ink, sw: 1.5 });
    const fr = []; for (let i = 0; i <= 24; i++) fr.push([i * 80, y0 + (i % 2 ? 14 : 4)]);
    inkLine(fr, 1.2, GOLD, 'ink', .3);
  }
  // the proscenium, scaled up: a bigger arena than the chorus-1 stage
  function bigFront(t) { push(); translate(960, 0); scale(1.25); translate(-960, 0); stageFront(t, {}); pop(); }
  // audience silhouettes along the bottom (screen space), bobbing on the beat, a few glow sticks
  function crowd(t, y0 = 1015, col = '#2A1F4A') {
    const pts = [[-40, 1120]], sticks = [];
    for (let i = 0; i < 20; i++) {
      const x = (i + .5) * (W / 20) + (hash(i) - .5) * 40, bob = pulse(t - hash(i + 3) * .08, 5) * 14, hy = y0 + hash(i + 7) * 34 - bob, r = 30 + hash(i + 11) * 12;
      pts.push([x - r * 1.7, hy + r * 2.2]);
      if (hash(i + 19) < .5) {
        const ax = x - r * 1.2 + Math.sin(bpOf(t) * Math.PI + i) * 14, ay = hy - r * 2.6 - bob;
        pts.push([x - r * 1.35, hy + r * .9], [ax - 9, ay], [ax + 9, ay - 3], [x - r * .95, hy + r * .7]);
        if (i % 3 === 0) sticks.push([ax, ay, i]);
      }
      for (let k = 0; k <= 6; k++) { const a = Math.PI + k / 6 * Math.PI; pts.push([x + Math.cos(a) * r, hy + Math.sin(a) * r * 1.1]); }
      pts.push([x + r * 1.7, hy + r * 2.2]);
    }
    pts.push([W + 40, 1120]);
    paint(pts, { wash: col, washOp: 255, ink: null });
    for (const [ax, ay, i] of sticks) inkLine([[ax - 12, ay - 30], [ax + 8, ay + 4]], 2.2, [GREEN, PAL.rose, GOLD2][i % 3], 'ink', 0);
  }

  // =====================================================================================================
  // The heart bubble pop (59.0–59.8): pink film tears open from a puncture, spraying droplets and shreds.
  // =====================================================================================================
  const FILM = '#F4A9C6', FILM_DK = '#DE6F98';
  function bubblePop(lt) {
    const k = lt / .36, P = [960, 470];
    if (k > 2.4) return;
    const R = k <= 0 ? 0 : 1700 * Math.pow(Math.min(k, 1.2), 1.4);
    if (k < 1.12) {
      if (R < 18) paint(rectPts(-60, -60, W + 120, H + 120), { wash: FILM, ink: null });
      else {
        const hole = [];
        for (let i = 0; i < 34; i++) { const a = i / 34 * TAU, rr = R * (.84 + .24 * hash(i * 7.3) + .05 * Math.sin(a * 9)); hole.push([P[0] + Math.cos(a) * rr, P[1] + Math.sin(a) * rr * .9]); }
        irisShape(hole, FILM);
        inkLine([...hole, hole[0]], 2.6, FILM_DK, 'ink', .3);
      }
      // iridescent sheen + the window highlight, only where film remains
      const sheen = [[360, 230, 300, PAL.cream, 150], [1560, 260, 330, PAL.violet, 70], [300, 880, 320, PAL.sky, 80], [1640, 880, 300, GOLD2, 70]];
      for (const [x, y, r, c, op] of sheen) if (Math.hypot(x - P[0], y - P[1]) - r * .8 > R * 1.12) paint(ellPts(x, y, r, r * .7, 20, 12), { fill: c, fillOp: op, bleed: .25, tex: .5, border: .4, ink: null });
      if (Math.hypot(330 - P[0], 210 - P[1]) - 150 > R * 1.1) {
        paint([[190, 330], [230, 220], [330, 150], [450, 130], [360, 185], [280, 250], [235, 330]], { wash: PAL.cream, washOp: 220, ink: null, curv: .6 });
        paint(ellPts(470, 190, 26, 20, 10), { wash: PAL.cream, washOp: 230, ink: null });
      }
      if (k < .4) paint(starPts(P[0], P[1], 40 + 380 * k, .3, 8, .2), { wash: PAL.cream, washOp: 255 * (1 - k / .4), ink: FILM_DK, sw: 1 });
    }
    // droplets flung off the retreating rim
    if (k > .04 && lt < .8) for (let i = 0; i < 40; i++) {
      const a = hash(i * 3.7) * TAU, d = R * (.72 + .3 * hash(i + 50)) + lt * 700 * hash(i + 90), r = (6 + 13 * hash(i + 20)) * (1 - lt / .8);
      const x = P[0] + Math.cos(a) * d, y = P[1] + Math.sin(a) * d * .9 + 600 * lt * lt;
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
      paint(ellPts(x, y, r, r * 1.1, 10), { wash: FILM, ink: FILM_DK, sw: .5 });
      if (r > 8) paint(ellPts(x - r * .3, y - r * .35, r * .28, r * .22, 6), { wash: PAL.cream, ink: null });
    }
    // curly shreds of film
    if (k > .1 && lt < 1.0) for (let j = 0; j < 10; j++) {
      const a = (j + hash(j)) / 10 * TAU, d = Math.min(R, 900) * .8 + 420 * lt, x = P[0] + Math.cos(a) * d, y = P[1] + Math.sin(a) * d * .8 + 1300 * lt * lt;
      push(); translate(x, y); rotate(hash(j * 5) * TAU + lt * (hash(j + 2) - .5) * 14); scale(1 - lt * .5);
      paint([[-50, -6], [-20, -22], [25, -18], [55, 4], [20, -4], [-18, -2]], { wash: FILM, fill: PAL.violet, fillOp: 40, ink: FILM_DK, sw: .7, curv: .5 });
      pop();
    }
  }

  // =====================================================================================================
  // Shot 1 · 59.0–60.45 · "I'm upping my P(doom)": low-angle, building-sized Clawd works two pumps at once.
  // =====================================================================================================
  function shotPump(t, lt) {
    const h = pumpH(t), hit = pulse(t, 5);
    const [sx, sy] = shakeXY(t, 9 * hit);
    camBegin(960 + sx - lt * 14, 425 + sy - lt * 26, 1.02 + lt * .04, -.028);
    arenaBack(t);
    beams(t);
    [[260, 0], [700, .5], [1300, .5], [1740, 0]].forEach(([x, ph], i) => pyro(x, 804, 600 * jetEnv(t, ph), t, 58, i));
    const GY = 910, PS = 1.2, v = pdoomAt(t);
    meterProp(205, GY, 1.2, v, { glow: .2 + .8 * hit });
    pumpProp(470, GY, PS, h, [205, GY - 110]);
    pumpProp(1530, GY, PS, h, [260, GY - 100]);
    // Clawd's hands ride the pump handles
    const U = 80, dy = -h * .25, sq = (1 - h) * .07;
    const handleY = GY - (257 + 150 * h) * PS, pivY = GY + dy * U - 4.5 * U * (1 - sq);
    const aa = Math.asin(clamp((pivY - handleY) / (2.2 * U), -1, 1));
    const md = mood(t, [[59, 'happy'], [59.95, 'spark', 'spark']]);
    clawd(1000, GY, U, { dy, sq, aL: aa, aR: aa, mouth: 'grin', blush: true, ...md, take: md.take * .6 });
    // for scale: the tiny Researcher cheering at Clawd's feet
    researcherDancer(1255, GY - 40, 8.5, 'hop', t, { eyes: 'star', mouth: 'grin', aL: 1.2 + .3 * hit, aR: 1.2 + .3 * hit, noShadow: true });
    // big foreground jets at the stage lip
    pyro(80, 1010, 820 * jetEnv(t), t, 90, 11);
    pyro(1845, 1010, 820 * jetEnv(t), t, 90, 12);
    camEnd();
    valanceTop(96);
    crowd(t);
    flushLetters();                                   // meter lettering belongs under the bubble film
    bubblePop(lt);
  }

  // =====================================================================================================
  // Shot 2 · 60.45–62.94 · "I hear the basilisk boom": rumble, BOOM, planks fly, everyone falls, GPU offerings.
  // =====================================================================================================
  function mound(x, y, k, t) {
    const hgt = 95 * k * k * (1 + .35 * Math.sin(t * 43)) + 6 * k, w = 190 + 90 * k, pts = [];
    for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push([x - w + u * 2 * w, y + 8 - Math.pow(Math.sin(u * Math.PI), 1.4) * hgt]); }
    pts.push([x + w, y + 34], [x - w, y + 34]);
    paint(pts, { wash: WOOD, fill: WOOD_DK, fillOp: 70, tex: .7, ink: PAL.ink, sw: 1, curv: .4 });
    for (let i = 0; i < 8; i++) {
      if (k < i / 11) continue;
      const a = (i + .5) / 8 * Math.PI, sgn = i % 2 ? 1 : -1, len = (90 + 190 * hash(i)) * clamp(k * 1.5 - i / 11), p = [[x + sgn * 20, y - hgt * .5]];
      for (let q = 1; q <= 4; q++) p.push([x + sgn * 20 + Math.cos(a) * len * q / 4 * 1.7 + (q % 2 ? 10 : -10), y - hgt * .5 + Math.abs(Math.sin(a)) * len * q / 4 * .35 + (q % 2 ? -6 : 6)]);
      inkLine(p, 1.3, PAL.ink, 'ink', 0);
    }
    for (let i = 0; i < 4; i++) { const ph = frac(t * 2.6 + hash(i)), px = x + (hash(i + 4) - .5) * w * 1.7; paint(ellPts(px, y - 10 - ph * 110 - hgt * .5, 26 + 40 * ph, 20 + 26 * ph, 12, 4), { wash: '#EFE3CF', washOp: 200 * (1 - ph) * k, ink: null }); }
  }
  const holePts = (x, y, rx, ry, jag) => { const p = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, r = 1 + jag * (hash(i * 3.1) - .3); p.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]); } return p; };
  function holeBack(x, y) {
    for (let i = 0; i < 6; i++) { const a = Math.PI + (i + .5) / 6 * Math.PI, px = x + Math.cos(a) * 190, py = y + Math.sin(a) * 50; paint([[px - 16, py + 6], [px + 16, py + 6], [px + Math.cos(a) * 30 + 8, py - 40 - 20 * hash(i)], [px + Math.cos(a) * 30 - 6, py - 30]], { wash: WOOD, fill: WOOD_DK, fillOp: 60, ink: PAL.ink, sw: .8 }); }
    paint(holePts(x, y, 200, 52, .18), { wash: '#2B1A22', fill: VIO, fillOp: 60, ink: PAL.ink, sw: 1.2 });
  }
  function holeFront(x, y) {
    const p = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI - i / 10 * Math.PI; p.push([x + Math.cos(a) * 214, y + Math.sin(a) * 64 + 6]); }
    for (let i = 10; i >= 0; i--) { const a = Math.PI - i / 10 * Math.PI; p.push([x + Math.cos(a) * 120, y + Math.sin(a) * 18 + 10 - (i % 2 ? 16 : 0)]); }
    paint(p, { wash: WOOD, fill: WOOD_DK, fillOp: 70, tex: .7, ink: PAL.ink, sw: 1 });
  }
  function planks(x, y, a) {
    if (a < 0 || a > 1.6) return;
    for (let i = 0; i < 12; i++) {
      const vx = (hash(i * 3.3) - .5) * 1900, vy = -(900 + 900 * hash(i * 5.1)), px = x + vx * a, py = y - 30 + vy * a + 1900 * a * a;
      if (py > 1300) continue;
      push(); translate(px, py); rotate(hash(i) * TAU + a * (hash(i * 2.2) - .5) * 18); scale(1 + a * 1.3 * hash(i * 7.7));
      paint(rectPts(-62, -13, 124, 26, 2), { wash: WOOD, ink: PAL.ink, sw: .9 });
      inkLine([[-50, -3], [48, -4]], .4, WOOD_DK, 'inkfine', 0);
      pop();
    }
  }
  function dust(x, y, a) {
    if (a < 0 || a > 1.4) return;
    for (let i = 0; i < 6; i++) {
      const ang = Math.PI + (i + .5) / 6 * Math.PI, d = 120 + 260 * easeOut(a / .9), r = (70 + 60 * hash(i)) * (.6 + easeOut(a / .8));
      paint(ellPts(x + Math.cos(ang) * d * 1.3, y + Math.sin(ang) * d * .35 - 20 - 90 * a, r, r * .7, 16, r * .22), { wash: i % 2 ? '#E4D0AC' : '#EFDFC4', washOp: 190 * Math.pow(1 - a / 1.4, 1.3), ink: null });
    }
  }
  // a little graphics card: black board, green edge, two fans, gold contacts
  function gpuCard(x, y, sc, rot) {
    push(); translate(x, y); rotate(rot); scale(sc);
    paint(rrPts(-38, -19, 76, 38, 6), { wash: '#2E2C38', ink: PAL.ink, sw: .8 });
    paint(rectPts(-38, -19, 76, 8), { wash: GREEN, ink: null });
    for (const fx of [-17, 17]) paint(ellPts(fx, 4, 11, 11, 10), { wash: '#5D5B72', ink: PAL.cream, sw: .4 });
    paint(rectPts(-24, 19, 44, 6), { wash: GOLD, ink: null });
    pop();
  }
  function crate(x, y) {
    for (let i = 0; i < 3; i++) gpuCard(x - 40 + i * 40, y - 70 - (i % 2) * 10, 1, -.3 + i * .3);
    paint(rectPts(x - 80, y - 70, 160, 70, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 70, tex: .6, ink: PAL.ink, sw: 1 });
    inkLine([[x - 80, y - 36], [x + 80, y - 36]], .6, WOOD_DK, 'inkfine', 0);
  }
  const TP = .17, THROW0 = 62.02, FLY = .4;              // the frantic GPU-throwing rhythm
  function shotBasilisk(t, lt) {
    const a = t - B_BOOM, rumble = seg(t, 60.45, B_BOOM), BX = 900, BY = 880;
    const shake = a < 0 ? 2 + 11 * rumble * rumble : 26 * Math.exp(-a * 3.2);
    const [sx, sy] = shakeXY(t, shake);
    const pushIn = a < 0 ? 0 : ease(seg(a, .3, 1.36));
    camBegin(960 + sx - 70 * pushIn, 540 + sy - 70 * pushIn, 1 + (a < 0 ? .03 * rumble : .08 * Math.exp(-a * 5) + .1 * pushIn), 0);
    arenaBack(t);
    beams(t);
    if (a < 0) [[300, 0], [1640, .5]].forEach(([x, ph], i) => pyro(x, 804, 380 * jetEnv(t, ph) * (1 - rumble), t, 50, i));
    if (a < 0) mound(BX, BY, rumble, t); else holeBack(BX, BY);

    // meter, pump and Clawd on the right; the pump topples at the BOOM
    const knock = a < 0 ? 0 : backOut(seg(a, .03, .3));
    meterProp(1575, 905, .85, pdoomAt(t), { glow: a > 0 ? 0 : .4 * pulse(t, 5) });
    const h = t < 60.95 ? pumpH(t) : lerp(pumpH(60.95), .6, ease(seg(t, 60.95, 61.2)));
    push(); translate(1420, 905); rotate(knock * 1.25); pumpProp(0, 0, .8, h, a < 0 ? [155, -70] : null); pop();
    const cm = mood(t, [[60.45, 'happy'], [60.95, 'look'], [61.25, 'scared', 'sweat'], [B_BOOM + .04, 'x'], [B_BOOM + .6, 'swirl']]);
    clawd(1245 + 50 * knock, 905, 26, {
      ...cm, lookX: -.6, lookY: 1, mouth: a < 0 ? (t < 60.95 ? 'grin' : 'wobble') : 'O',
      aL: a < 0 ? (t < 60.95 ? 1.3 - h * .9 : .2) : 1.2 + .4 * Math.sin(t * 20), aR: a < 0 ? (t < 60.95 ? 1.3 - h * .9 : -.3) : 1.3 + .4 * Math.sin(t * 22),
      rot: knock * 1.5, dy: a < 0 ? -jit(.15) * rumble : -.8 * Math.max(0, Math.sin(seg(a, .3, .6) * Math.PI)), walk: a > .3 ? t * 5 : null
    });

    // the Researcher: startled, knocked flat, bounces up sitting and pelts the basilisk with GPUs
    const RX = 450, RY = 915, RS = 17;
    crate(305, RY);
    const tp = (t - THROW0) / TP, j = Math.floor(tp), ph = frac(tp), throwing = t >= THROW0;
    let rrot = 0, sit = false, aL = -1.2, aR = -1.2, eyes = 'wide', hairUp = rumble, holding = false;
    if (a < 0) { aL = -1.0 + .3 * rumble; aR = -1.0 + .3 * rumble; eyes = 'look'; }
    else if (a < .4) { rrot = -1.45 * easeOut(seg(a, .06, .22)); aL = aR = 1.2; hairUp = 1; eyes = a < .1 ? 'wide' : 'x'; }
    else { rrot = lerp(-1.45, 0, backOut(seg(a, .4, .56))); sit = true; hairUp = 1; aL = .6 + .6 * Math.sin(t * 17); }
    let handL = null, handR = null;
    if (throwing) {
      // alternate hands: one winds back low holding a card while the other flings up and out
      const swing = ph < .45 ? lerp(-.3, -1.0, ease(ph / .45)) : ph < .65 ? lerp(-1.0, 1.6, easeOut((ph - .45) / .2)) : lerp(1.6, -.3, ease((ph - .65) / .35));
      const other = ph < .45 ? lerp(1.2, .6, ph / .45) : lerp(.6, 1.2, (ph - .45) / .55), card = () => gpuCard(12, 0, .6, .4);
      if (j % 2) { aL = swing; aR = other; if (ph < .45) handL = card; } else { aR = swing; aL = other; if (ph < .45) handR = card; }
      eyes = 'wide';
    }
    researcher(RX, RY, RS, { rot: rrot, sit, dy: sit ? .9 : 0, aL, aR, eyes, lookX: .8, lookY: a < 0 ? 1 : -.6, brows: 'worried', mouth: a < 0 ? 'wobble' : 'O', hairUp, glassesTilt: a > 0 ? .15 * Math.sin(t * 13) : 0, handL, handR, emote: a < 0 && t > 61 ? '!' : throwing ? 'sweat' : null, emoteK: a < 0 ? seg(t, 61, 61.2) : 1 });

    // the basilisk rises: menacing hiss first, then delighted by the offerings
    let head = null;
    if (a >= 0) {
      const rise = backOut(seg(a, 0, .32)), roar = a < .7, happy = t > THROW0 + .45 * TP + FLY;
      const arr0 = THROW0 + .45 * TP + FLY, dArr = Math.abs(frac((t - arr0) / TP + .5) - .5) * TP; // time to the nearest GPU arrival
      const chomp = t > arr0 - .05 ? clamp(dArr / .05) : 1;
      head = CAST.basilisk(BX, BY, 30, t, {
        rise, open: roar ? .95 * seg(a, .05, .2) : throwing ? .8 * chomp : .2, eyes: happy ? 'happy' : roar ? 'slit' : 'wide', lids: .6,
        lookX: -.6, lookY: .3, lean: -.18 * seg(a, .6, 1), blush: happy ? 1 : 0, sway: .8 + .6 * seg(a, 0, 1)
      });
      if (happy) emote('heart', head.hx + 150, head.hy - 170, 26, seg(t, THROW0 + .7, THROW0 + .9));
      holeFront(BX, BY);
    }
    planks(BX, BY, a);
    dust(BX, BY, a);
    // GPU offerings in flight
    if (head) for (let k = Math.max(0, j - 3); k <= j; k++) {
      const tr = THROW0 + k * TP + .45 * TP, f = (t - tr) / FLY;
      if (f < 0 || f >= 1) continue;
      const x0 = RX + 55, y0 = RY - 150, x = lerp(x0, head.mx, f), y = lerp(y0, head.my, f) - 260 * 4 * f * (1 - f);
      gpuCard(x, y, 1.25 - .35 * f, k * 1.3 + f * 9);
    }
    bigFront(t);
    camEnd();
    crowd(t, 1030 + (a > 0 ? 30 * Math.exp(-a * 3) : 0));
    if (a >= 0) { flash(.45 * (1 - a / .1), '#FFF1D0'); sfx('BOOM', 1390, 245, 230, '#F7C948', a, { life: 1.1, rot: -.12 }); }
  }

  // =====================================================================================================
  // Shot 3 · 62.94–64.5 · "NVDA to the moon": the stock line rockets off its chart, Clawd surfs it to the moon.
  // =====================================================================================================
  const MOON = [4200, -2600], MR = 460;
  const STOCK = (() => {
    const P = [[150, 800], [240, 780], [310, 815], [390, 770], [470, 795], [550, 745], [630, 775], [710, 720], [790, 752], [870, 700], [950, 730], [1010, 748],
      [1070, 690], [1150, 540], [1260, 380], [1400, 170], [1560, -20], [1700, -170], [1950, -420], [2150, -700], [2400, -930], [2650, -1260], [2900, -1500],
      [3150, -1830], [3400, -2060], [3620, -2330], [MOON[0] - MR * .94, MOON[1] + MR * .34]];
    const pts = [], per = 8;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const s = k / per, s2 = s * s, s3 = s2 * s, f = (a, b, c, d) => .5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s2 + (-a + 3 * b - 3 * c + d) * s3);
        pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    pts.push(P[P.length - 1]);
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, len: cum[cum.length - 1], dip: cum[11 * per] };
  })();
  function atL(L) {
    const { pts, cum } = STOCK; L = clamp(L, 0, STOCK.len);
    let i = 1; while (i < cum.length - 1 && cum[i] < L) i++;
    const f = (L - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]), a = pts[i - 1], b = pts[i];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  function cloud(x, y, s) {
    const pts = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI, r = 1 + .24 * Math.abs(Math.sin(i * 1.35 + x * .01)); pts.push([x + Math.cos(a) * 190 * s * r, y + Math.sin(a) * 88 * s * r]); }
    pts.push([x + 170 * s, y + 26 * s], [x - 170 * s, y + 26 * s]);
    paint(pts, { wash: PAL.cream, washOp: 245, fill: PAL.sky, fillOp: 70, bleed: .1, tex: .5, border: .5, ink: PAL.ink, sw: .9, curv: .6 });
  }
  const CLOUDS = [[1560, -250, 1.1, 0], [2080, -560, 1.35, 1], [1760, -900, 1.0, 0], [2560, -1060, 1.4, 0], [2330, -1420, 1.15, 1], [3060, -1560, 1.2, 0], [2800, -1980, 1.0, 0], [3380, -1880, .95, 1]];
  function moonFlag(x, y, k, t) {
    if (k <= 0) return;
    const drop = (1 - easeIn(clamp(k * 3))) * -260;
    push(); translate(x, y + drop); rotate(.18);
    inkLine([[0, 0], [0, -190]], 2.4, PAL.ink, 'ink', 0);
    const wv = Math.sin(t * 9) * 8;
    paint([[0, -188], [120, -178 + wv], [118, -110 + wv], [0, -118]], { wash: PAL.cream, fill: PAL.sky, fillOp: 40, ink: PAL.ink, sw: 1, curv: .3 });
    // an up-and-to-the-right arrow: the only thing worth putting on a flag
    inkLine([[22, -130 + wv * .6], [52, -150 + wv * .8], [70, -140 + wv * .8], [98, -172 + wv]], 3, GREEN, 'ink', 0);
    paint([[104, -178 + wv], [80, -172 + wv], [100, -156 + wv]], { wash: GREEN, ink: null });
    pop();
  }
  function shotMoon(t, lt) {
    const tL = 63.12, tH = 63.98, T_FLAG = bT(94);   // launch, hit the moon, plant the flag (64.30)
    const L = t < tL ? lerp(STOCK.dip - 40, STOCK.dip, ease(seg(t, 62.94, tL))) : lerp(STOCK.dip, STOCK.len, easeIO(seg(t, tL, tH)));
    const tip = atL(L), follow = ease(seg(t, tL + .02, tL + .3)), endK = ease(seg(t, tH - .12, 64.22)), out = ease(seg(t, 64.32, 64.5));
    let cx = lerp(960, tip[0] + 90, follow), cy = lerp(540, tip[1] - 60, follow);
    cx = lerp(cx, MOON[0] - 60, endK); cy = lerp(cy, MOON[1] - 230, endK);
    cy = lerp(cy, MOON[1] - 120, out);
    const zoom = lerp(lerp(lerp(1, .8, follow), .95, endK), .52, out);
    const alt = clamp((-900 - cy) / 1500);
    // sky: blue, deepening into violet space as we climb
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: mixCol(mixCol(PAL.sky, '#6A68B8', clamp(alt * 1.6)), SPACE, clamp(alt * 1.4 - .4)), ink: null });
    paint(ellPts(500, 300, 900, 500, 20, 20), { fill: alt < .5 ? PAL.cream : VIO, fillOp: 70, bleed: .3, tex: .5, border: .4, ink: null });
    if (alt > .35) for (let i = 0; i < 36; i++) {
      const x = frac(hash(i) - cx * .00006) * W, y = frac(hash(i + 40) + cy * .00008) * H, r = 2 + 4 * hash(i + 80);
      paint(starPts(x, y, r * 2.2, .35, 4), { wash: i % 5 ? PAL.cream : GOLD2, washOp: 255 * clamp((alt - .35) * 3), ink: null });
    }
    camBegin(cx, cy, zoom, 0);
    // the chart the line escapes from
    if (cy > -900) {
      paint(rectPts(110, 90, 1700, 880, 4), { wash: PAL.cream, fill: PAL.sky, fillOp: 35, tex: .5, border: .4, ink: PAL.ink, sw: 1.4 });
      for (let i = 1; i < 13; i++) inkLine([[110 + i * 130, 96], [110 + i * 130, 964]], .5, '#9CC7C3', 'inkfine', 0);
      for (let i = 1; i < 8; i++) inkLine([[116, 90 + i * 110], [1804, 90 + i * 110]], .5, '#9CC7C3', 'inkfine', 0);
      inkLine([[150, 110], [150, 930], [1790, 930]], 1.8, PAL.ink, 'ink', 0);
    }
    const fwd = t >= tL && t < tH;
    for (const [x, y, s, front] of CLOUDS) if (!front) cloud(x, y, s);
    // the line: a thick green ribbon with a glow while it rockets
    const L0 = Math.max(0, L - 4200), rib = [], ribB = [];
    for (let l = L0; l <= L; l += 26) { const [x, y, an] = atL(l), nx = Math.sin(an), ny = -Math.cos(an); rib.push([x + nx * 11, y + ny * 11]); ribB.push([x - nx * 11, y - ny * 11]); }
    if (fwd && follow > .5) { const g = []; for (let l = Math.max(STOCK.dip + 300, L - 900); l <= L - 80; l += 60) { const [x, y] = atL(l); g.push([x, y]); } if (g.length > 2) inkLine(g, 5, '#B7E39A', 'dry', .5); }
    if (rib.length > 1) paint([...rib, ...ribB.reverse()], { wash: GREEN, fill: GREEN_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    const d = [Math.cos(tip[2]), Math.sin(tip[2])], n = [-d[1], d[0]];
    paint([[tip[0] + d[0] * 46, tip[1] + d[1] * 46], [tip[0] + n[0] * 30 - d[0] * 8, tip[1] + n[1] * 30 - d[1] * 8], [tip[0] - n[0] * 30 - d[0] * 8, tip[1] - n[1] * 30 - d[1] * 8]], { wash: GREEN, fill: GREEN_DK, fillOp: 60, ink: PAL.ink, sw: 1 });
    // speed streaks along the line
    if (fwd && follow > .2) for (let i = 0; i < 9; i++) { const o = (hash(i) - .5) * 700, bk = 200 + 500 * frac(hash(i + 9) + t * 3); inkLine([[tip[0] + n[0] * o - d[0] * bk, tip[1] + n[1] * o - d[1] * bk], [tip[0] + n[0] * o - d[0] * (bk + 260), tip[1] + n[1] * o - d[1] * (bk + 260)]], 1, PAL.cream, 'inkfine', 0); }
    // the moon, with the arrow stuck in its side
    if (cy < -1500) {
      const hitA = t - tH, wob = hitA > 0 ? Math.sin(hitA * 40) * 16 * Math.exp(-hitA * 6) : 0, mx = MOON[0] + wob, my = MOON[1];
      paint(ellPts(mx, my, MR * 1.3, MR * 1.3, 26, 10), { fill: PAL.cream, fillOp: 60, bleed: .3, ink: null });
      paint(ellPts(mx, my, MR, MR, 36, 3), { wash: '#F3E3B0', fill: '#D9C27A', fillOp: 80, bleed: .08, tex: .7, border: .5, ink: PAL.ink, sw: 1.6 });
      for (const [ox, oy, r] of [[-.35, -.2, .2], [.3, .25, .16], [.1, -.5, .1], [-.1, .45, .12], [.5, -.25, .09]]) paint(ellPts(mx + ox * MR, my + oy * MR, r * MR, r * MR * .8, 14, 2), { wash: '#E2CD8E', fill: '#B99E5E', fillOp: 70, ink: PAL.ink, sw: .7 });
      if (hitA > 0 && hitA < .5) for (let i = 0; i < 6; i++) { const a = Math.PI * .75 + i * .22, e = [MOON[0] - MR * .94, MOON[1] + MR * .34], r0 = 30 + 160 * easeOut(hitA / .3); paint(starPts(e[0] + Math.cos(a) * r0, e[1] + Math.sin(a) * r0, 22 * (1 - hitA / .5), .4, 4), { wash: GOLD2, ink: null }); }
      moonFlag(MOON[0] + 110, MOON[1] - MR + 6, (t - (T_FLAG - .12)) / .12 * .34, t);
      if (t > T_FLAG) { const fa = t - T_FLAG; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .5, r0 = 40 + 140 * easeOut(fa / .3); paint(starPts(MOON[0] + 110 + Math.cos(a) * r0, MOON[1] - MR + Math.sin(a) * r0 * .6 - 30, 26 * (1 - clamp(fa / .3)), .4, 4), { wash: i % 2 ? GOLD2 : PAL.cream, ink: PAL.ink, sw: .5 }); } }
    }
    // Clawd: rides the tip, then backflips off onto the moon's crown
    const jump = seg(t, tH + .02, T_FLAG - .05);
    if (jump <= 0) {
      const p = atL(L - 58), up = [Math.sin(p[2]), -Math.cos(p[2])];
      const crouch = t < tL ? .2 * seg(t, 63.0, tL) : .0, stretch = t >= tL ? -.16 * (1 - seg(t, tL, tL + .2)) : 0;
      clawd(p[0] + up[0] * 10, p[1] + up[1] * 10, 20, { rot: clamp(p[2], -1.0, .25), sq: crouch + stretch, aL: t < tL ? .2 : 1.4, aR: t < tL ? -.2 : .5, eyes: t < tL ? 'normal' : 'spark', mouth: t < tL ? 'o' : 'O', blush: true, noShadow: true });
    } else {
      const p = atL(STOCK.len - 58), top = [MOON[0] - 20, MOON[1] - MR + 4], k = easeOut(jump);
      const land = t > T_FLAG - .05, sq = land ? .22 * Math.exp(-(t - T_FLAG + .05) * 9) : -.1;
      clawd(lerp(p[0], top[0], k), lerp(p[1], top[1], k) - 330 * Math.sin(jump * Math.PI), 20, { rot: land ? 0 : lerp(p[2], 0, k) - TAU * ease(jump), sq, aL: land ? 1.3 : 1.1, aR: land ? .9 : 1.1, eyes: land ? 'happy' : 'spark', mouth: 'grin', blush: true, noShadow: !land });
    }
    for (const [x, y, s, front] of CLOUDS) if (front) cloud(x, y, s);
    camEnd();
  }

  // =====================================================================================================
  // Shot 4 · 64.5–66.0 · "The Omega Point's coming soon": galaxies spiral into one blinding point.
  // =====================================================================================================
  const GAL = Array.from({ length: 8 }, (_, i) => ({ a0: i / 8 * TAU + hash(i) * .5, r0: 440 + hash(i + 3) * 440, size: 70 + hash(i + 5) * 60, cols: [[VIO, GOLD2, PAL.cream], [PAL.rose, PAL.sky, PAL.cream], [PAL.teal, GOLD2, PAL.cream]][i % 3], spin: hash(i + 9) * TAU }));
  function galaxy(x, y, r, spin, cols, sx = 1, sy = .55, tilt = 0) {
    push(); translate(x, y); rotate(tilt); scale(sx, sy);
    paint(ellPts(0, 0, r, r, 18), { fill: cols[0], fillOp: 120, bleed: .3, tex: .4, border: .3, ink: null });
    for (const arm of [0, Math.PI]) {
      const pts = []; for (let k = 0; k <= 9; k++) { const a = spin + arm + k * .5, rr = r * (.1 + k * .095); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
      inkLine(pts, clamp(r / 45, .8, 3), cols[1], 'ink', .7);
    }
    paint(ellPts(0, 0, r * .26, r * .26, 14), { wash: cols[2], fill: cols[1], fillOp: 90, ink: null });
    pop();
  }
  function shotOmega(t, lt) {
    const k = seg(t, 64.5, 65.88), C = [960, 380], flare = easeIn(seg(t, 65.5, 65.98));
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: DEEP, fill: SPACE, fillOp: 170, tex: .6, border: .3, ink: null });
    camBegin(960, 540, 1 + .12 * ease(k), .25 * ease(k));
    // the vortex: dry-brush spiral arms winding in
    for (let b = 0; b < 5; b++) {
      const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16, a = b * TAU / 5 + u * 4.2 + t * 1.3, r = 1300 * Math.pow(1 - u, 1.4) + 30; pts.push([C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r * .8]); }
      inkLine(pts, b % 2 ? 1.3 : 2.2, [VIO, GOLD2, PAL.rose, '#7FB2E5', VIO][b], 'dry', .7);
    }
    // stars streaming inward along the spiral
    for (let j = 0; j < 44; j++) {
      const p = frac(hash(j) + (t - 64.5) * .5 * (1 + hash(j + 1))), r = 1250 * Math.pow(1 - p, 1.3), a = hash(j + 2) * TAU + p * 3 + t * .9;
      const x = C[0] + Math.cos(a) * r, y = C[1] + Math.sin(a) * r * .8, x2 = C[0] + Math.cos(a - .12) * (r + 60), y2 = C[1] + Math.sin(a - .12) * (r + 60) * .8;
      inkLine([[x2, y2], [x, y]], 1.2, j % 4 ? PAL.cream : GOLD2, 'inkfine', 0);
    }
    // galaxies, faster and more stretched the closer they get
    for (const g of GAL) {
      const f = 1 - Math.pow(easeIn(k), .8), r = g.r0 * f;
      if (r < 30) continue;
      const a = g.a0 + (t - 64.5) * .9 + 3.2 * k * k, x = C[0] + Math.cos(a) * r, y = C[1] + Math.sin(a) * r * .8;
      galaxy(x, y, g.size * (.5 + .5 * f), g.spin + t * 2.5, g.cols, 1 + 2.2 * (1 - f), .5 * (.6 + .4 * f), a + Math.PI / 2);
    }
    // the point itself
    const gr = 26 + 50 * k + 10 * pulse(t, 4);
    for (const [m, op] of [[4, 30], [2.6, 45], [1.7, 70]]) paint(ellPts(C[0], C[1], gr * m, gr * m, 24), { wash: m > 3 ? GOLD2 : '#FFE9A8', washOp: op, ink: null });
    if (flare > 0) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .6, l = 200 + 1500 * flare; paint([[C[0], C[1]], [C[0] + Math.cos(a - .05) * l, C[1] + Math.sin(a - .05) * l], [C[0] + Math.cos(a + .05) * l, C[1] + Math.sin(a + .05) * l]], { fill: PAL.cream, fillOp: 110, bleed: .1, tex: .2, ink: null }); }
    paint(ellPts(C[0], C[1], gr + 900 * flare * flare, gr + 900 * flare * flare, 22), { wash: '#FFF6DE', fill: GOLD2, fillOp: 60, ink: null });
    // Clawd, floating in awe with arms wide
    const md = mood(t, [[64.5, 'happy'], [65.25, 'spark', 'spark']]);
    clawd(960, 915 - 20 * wob(t, .7), 27, { ...md, mouth: 'O', blush: true, aL: .55 + .18 * Math.sin(t * 3), aR: .55 + .18 * Math.sin(t * 3 + .5), rot: .09 * Math.sin(t * 1.8), noShadow: true });
    camEnd();
    flash(Math.pow(flare, 1.6) * 1.05, '#FFF6DE');
  }

  // =====================================================================================================
  // Shot 5 · 66.0–70.0 · "One E thirty flops a second": the planet-sized GPU. Its odometer rolls over and the
  // zeros pour out like gumballs. The floating meter dings at 61%. Then the camera drops back to Earth.
  // =====================================================================================================
  const TOP = [[470, 430], [1450, 430], [1640, 690], [280, 690]];
  const FANS = [[740, 558], [1180, 558]];
  const ROLL = bT(100);                                  // 68.39: 9,999,999 rolls over
  const surfY = z => lerp(430, 690, z), leftX = z => lerp(470, 280, z), rightX = z => lerp(1450, 1640, z);
  const odoTotal = t => t >= ROLL ? 1e7 : Math.pow(10, 7 * Math.pow(seg(t, 66.6, ROLL), 1.6)) - 1;
  const fanSpin = t => 1.2 * (t - 66) + 7 * Math.pow(clamp(t - 66.8, 0, 1.6), 2) + (t > 68.4 ? 18 * (t - 68.4) : 0);
  // gumball zeros: deterministic 2.5D bounce across the card's top face (x, depth z, height h)
  function gumball(i, t) {
    const ts = ROLL + .08 + i * .028; if (t < ts) return null;
    let x = 1290, z = .04, h = 120, vx = -520 + 1100 * hash(i * 1.7), vz = .25 + .6 * hash(i * 2.9), vh = 120 + 330 * hash(i * 4.3);
    const dt = 1 / 60, n = Math.floor((t - ts) / dt);
    for (let s = 0; s < n; s++) {
      x += vx * dt; z += vz * dt; vh -= 1500 * dt; h += vh * dt;
      const onTop = z <= 1 && x > leftX(z) && x < rightX(z);
      if (onTop && h < 0 && vh < 0) { h = 0; vh = -vh * .62; vx *= .9; }
    }
    const zz = Math.min(z, 1.05);
    return [x, surfY(Math.min(z, 1)) - h, 24 + 16 * hash(i * 6.1), zz, (t - ts) * (hash(i) - .5) * 14];
  }
  const GUMCOLS = [PAL.rose, GOLD2, PAL.sky, GREEN, VIO, PAL.clayLt, PAL.teal];
  function drawZero(x, y, r, col, rot) {
    paint(ellPts(x, y, r * .68, r, 14, 0, rot), { wash: col, fill: PAL.cream, fillOp: 40, ink: PAL.ink, sw: .8 });
    paint(ellPts(x, y, r * .27, r * .56, 10, 0, rot), { wash: '#2B2440', ink: PAL.ink, sw: .5 });
    paint(ellPts(x - r * .45, y - r * .5, r * .14, r * .2, 6, 0, rot), { wash: PAL.cream, ink: null });
  }
  function fanGalaxy(fx, fy, t, j) {
    paint(ellPts(fx, fy, 232, 104, 30), { wash: '#1E1B2B', ink: PAL.ink, sw: 1.4 });
    paint(ellPts(fx, fy, 214, 92, 28), { fill: SPACE, fillOp: 200, bleed: .05, tex: .5, border: .3, ink: GREEN, sw: 1.1 });
    push(); translate(fx, fy); scale(1, .43);
    const sp = fanSpin(t) * (j ? -1 : 1), cols = j ? [PAL.rose, PAL.sky] : [VIO, GOLD2];
    paint(ellPts(0, 0, 190, 190, 20), { fill: cols[0], fillOp: 110, bleed: .3, tex: .4, ink: null });
    for (let arm = 0; arm < 3; arm++) {
      const pts = []; for (let k = 0; k <= 9; k++) { const a = sp + arm * TAU / 3 + k * .45, rr = 18 + k * 19; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
      inkLine(pts, 2.4, arm === 1 ? PAL.cream : cols[1], 'ink', .7);
    }
    paint(ellPts(0, 0, 44, 44, 14), { wash: PAL.cream, fill: GOLD2, fillOp: 90, ink: PAL.ink, sw: .6 });
    pop();
  }
  function shotGPU(t, lt) {
    const reveal = easeOut(seg(t, 66.0, 67.0)), zoom = lerp(3.4, 1, reveal), cx = lerp(FANS[0][0], 960, reveal), cy = lerp(FANS[0][1], 520, reveal);
    const hum = seg(t, 67.2, ROLL), rolled = t - ROLL, drop = easeIn(seg(t, 69.84, 70.0));
    const [sx, sy] = shakeXY(t, 5 * hum * hum + (rolled > 0 ? 18 * Math.exp(-rolled * 4) : 0));
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: DEEP, fill: SPACE, fillOp: 160, tex: .6, border: .3, ink: null });
    const cam = () => camBegin(cx + sx, cy + sy + drop * 1100, zoom, 0);
    cam();
    for (let i = 0; i < 40; i++) paint(starPts(hash(i) * 2400 - 240, hash(i + 50) * 1400 - 160, 5 + 7 * hash(i + 9), .35, 4), { wash: i % 4 ? PAL.cream : GOLD2, ink: null });
    paint(ellPts(900, 300, 900, 380, 20, 20), { fill: VIO, fillOp: 60, bleed: .3, tex: .4, ink: null });
    // Earth and its moon, for scale: tiny next to the card
    paint(ellPts(190, 230, 70, 70, 18), { fill: PAL.sky, fillOp: 80, bleed: .3, ink: null });
    paint(ellPts(190, 230, 40, 40, 18), { wash: '#4E8FD1', ink: PAL.ink, sw: .8 });
    paint([[168, 208], [196, 204], [206, 226], [186, 246], [172, 236]], { wash: PAL.sap, ink: null, curv: .5 });
    paint(ellPts(262, 186, 10, 10, 10), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
    // the card: front face with gold contact fingers, then the top face
    paint([[280, 690], [1640, 690], [1640, 770], [280, 770]], { wash: '#262430', fill: VIO, fillOp: 40, tex: .6, ink: PAL.ink, sw: 1.4 });
    inkLine([[282, 704], [1638, 704]], 2.2, GREEN, 'ink', 0);
    const comb = [[520, 770]]; for (let i = 0; i < 26; i++) { const x = 530 + i * 30; comb.push([x, 770], [x, 800], [x + 20, 800], [x + 20, 770]); } comb.push([1320, 770]);
    paint(comb, { wash: GOLD, fill: PAL.ochre, fillOp: 60, ink: PAL.ink, sw: .6 });
    paint(TOP, { wash: '#34323F', fill: VIO, fillOp: 45, bleed: .05, tex: .7, border: .5, ink: PAL.ink, sw: 1.4 });
    inkLine([TOP[3], TOP[2], TOP[1]], 2, GREEN, 'ink', 0);
    for (let i = 1; i < 9; i++) { const z = i / 9; inkLine([[leftX(z) + 30, surfY(z)], [leftX(z) + 110, surfY(z)]], .6, '#5C5A70', 'inkfine', 0); inkLine([[rightX(z) - 110, surfY(z)], [rightX(z) - 30, surfY(z)]], .6, '#5C5A70', 'inkfine', 0); }
    // heat haze while it works
    if (hum > 0) for (let i = 0; i < 7; i++) { const x = 420 + i * 170, ph = frac(t * 1.6 + hash(i)), y = 470 - ph * 150; inkLine([[x, y], [x + 14 * Math.sin(t * 9 + i), y - 30], [x, y - 60]], 1.3 * hum, '#F08A5D', 'inkfine', .6); }
    FANS.forEach(([fx, fy], j) => fanGalaxy(fx, fy, t, j));

    // odometer: a scoreboard of seven digit wheels standing on the back edge
    const OX = 665, OY = 285, WW = 74, WH = 96, GAP = 12;
    paint([[1284, 262], [1320, 238], [1320, 382], [1284, 406]], { wash: '#1E1B2B', ink: PAL.ink, sw: 1 });
    paint(rectPts(640, 262, 644, 144, 2), { wash: '#2E2C38', fill: GOLD2, fillOp: 30, tex: .5, ink: PAL.ink, sw: 1.3 });
    paint([[700, 406], [730, 406], [722, 440], [708, 440]], { wash: '#1E1B2B', ink: PAL.ink, sw: .8 });
    paint([[1190, 406], [1220, 406], [1212, 440], [1198, 440]], { wash: '#1E1B2B', ink: PAL.ink, sw: .8 });
    const tot = odoTotal(t), tot2 = odoTotal(t + .02);
    for (let i = 0; i < 7; i++) {
      const x = OX + i * (WW + GAP), mid = x + WW / 2;
      paint(rectPts(x, OY, WW, WH), { wash: PAL.cream, fill: '#D8CDB8', fillOp: 90, tex: .4, ink: PAL.ink, sw: .8 });
      const div = Math.pow(10, 6 - i), p = tot / div, rate = (tot2 - tot) / div / .02;
      if (rolled > 0) {
        const r = clamp(rolled / .12);          // every wheel rolls 9 → 0 together
        if (r < 1) letter('9', mid, OY + WH / 2 - r * 44, 76, PAL.ink, { ink: false, alpha: 1 - r });
        letter('0', mid, OY + WH / 2 + (1 - r) * 44, 76, PAL.ink, { ink: false, alpha: r });
      } else if (rate > 14) {
        for (let g = 0; g < 3; g++) letter(String(Math.floor(hash(i * 7 + g + Math.floor(t * 24) * 3) * 10)), mid + jit(3), OY + WH / 2 + (g - 1) * 30, 70, PAL.ink, { ink: false, alpha: .3 });
        for (let g = 0; g < 3; g++) inkLine([[x + 14 + g * 22, OY + 12], [x + 14 + g * 22, OY + WH - 12]], .5, '#8A8398', 'inkfine', 0);
      } else {
        const dgt = Math.floor(p) % 10, r = frac(p), rr = r > .8 ? (r - .8) / .2 : 0;
        letter(String(dgt), mid, OY + WH / 2 - rr * 44, 76, PAL.ink, { ink: false, alpha: 1 - rr });
        if (rr > 0) letter(String((dgt + 1) % 10), mid, OY + WH / 2 + (1 - rr) * 44, 76, PAL.ink, { ink: false, alpha: rr });
      }
    }
    // the carried "1" has nowhere to go: it pops out of the left end and tumbles away
    camEnd(); flushLetters(); cam();
    // bezel strips over the rolling digits, and window glints
    paint(rectPts(640, 262, 644, 23), { wash: '#2E2C38', ink: null });
    paint(rectPts(640, OY + WH, 644, 406 - OY - WH), { wash: '#2E2C38', ink: null });
    paint(rectPts(640, 262, 644, 144, 1), { ink: GOLD, sw: 1.4 });
    // the carried "1" (painted, not lettered) pops out of the left end and tumbles off into space
    if (rolled > 0 && rolled < 1.3) {
      const k = rolled, ox = 640 - 780 * k, oy = 310 - 620 * k + 380 * k * k, sc = 130 * (1 + .25 * Math.exp(-k * 8) * Math.sin(k * 40)) * backOut(seg(k, 0, .12)), ro = -1.6 * k;
      const ONE = [[.05, -.5], [.17, -.5], [.17, .36], [.33, .36], [.33, .5], [-.33, .5], [-.33, .36], [-.07, .36], [-.07, -.2], [-.27, -.1], [-.33, -.23]];
      const pts = ONE.map(([ux, uy]) => [ox + (ux * Math.cos(ro) - uy * Math.sin(ro)) * sc, oy + (ux * Math.sin(ro) + uy * Math.cos(ro)) * sc]);
      if (sc > 2) paint(pts, { wash: GOLD2, fill: PAL.ochre, fillOp: 60, tex: .3, ink: PAL.ink, sw: 1.1, curv: .05 });
      for (let i = 1; i <= 3; i++) { const kk = Math.max(0, k - i * .035); inkLine([[640 - 780 * kk + 40, 310 - 620 * kk + 380 * kk * kk], [ox + 30, oy]], .8, GOLD2, 'inkfine', 0); }
    }
    // the overflow hatch flips open on the right end of the scoreboard
    const hatch = rolled > 0 ? backOut(seg(rolled, 0, .15)) : 0;
    push(); translate(1284, 300); rotate(-hatch * 1.9); paint(rectPts(0, -40, 36, 80), { wash: GOLD, fill: PAL.ochre, fillOp: 60, ink: PAL.ink, sw: .9 }); pop();

    // Clawd dances on the card, stares at the counter, then frolics in the gumball flood
    const cm = mood(t, [[66, 'happy'], [67.7, 'look'], [ROLL, 'scared', '!'], [ROLL + .5, 'happy', 'music'], [bT(102), 'spark', 'spark']]);
    const hop = move(t < ROLL ? 'hop' : 'bounce', t);
    const drawC = () => clawd(1470, 655, 21, { ...hop, ...cm, lookX: -1, lookY: -.8, mouth: t < ROLL ? 'smile' : t < ROLL + .5 ? 'O' : 'grin', blush: true, aL: t > ROLL + .5 ? 1.4 : hop.aL, aR: t > ROLL + .5 ? 1.2 : hop.aR });
    // gumballs, far ones first; Clawd sits at depth ~.87 on the card, so nearer balls pass in front of him
    let cDone = false;
    if (rolled > .05) {
      const gs = []; for (let i = 0; i < 52; i++) { const g = gumball(i, t); if (g && g[1] < 1300 && g[0] > -100 && g[0] < 2100) gs.push([...g, i]); }
      gs.sort((p, q) => p[3] - q[3]);
      for (const [x, y, r, z, rot, i] of gs) { if (!cDone && z > .87) { drawC(); cDone = true; } drawZero(x, y, r * lerp(.85, 1.3, clamp(z)), GUMCOLS[i % GUMCOLS.length], rot); }
    }
    if (!cDone) drawC();
    // the floating P(doom) meter, which dings when it hits 61%
    const DING = bT(102), da = t - DING, pop2 = da > 0 ? Math.exp(-da * 7) : 0, my = 820 + 12 * wob(t, .6);
    if (da > 0 && da < .7) for (let r = 0; r < 3; r++) { const rr = 60 + 260 * easeOut(clamp((da - r * .08) / .5)); paint(ellPts(1790, my - 55, rr, rr, 26), { ink: GOLD2, sw: 1.6 * (1 - da / .7) }); }
    meterProp(1790, my, .6 * (1 + .12 * pop2), pdoomAt(t), { glow: .3 + pop2 });
    camEnd();
    flash(Math.pow(1 - seg(t, 66.0, 66.3), 1.5), '#FFF6DE');
    if (drop > 0) for (let i = 0; i < 16; i++) { const x = hash(i) * W, y = hash(i + 5) * H; inkLine([[x, y - 260 * drop], [x, y + 260 * drop]], 1.2, i % 2 ? LAV : GOLD2, 'inkfine', 0); }
  }

  // =====================================================================================================
  // Shot 6 · 70.0–73.0 · "That was safe enough, we reckoned": hard-hat Clawds slam a vault on a glowing monster
  // and high-five. The camera orbits round the back: no back wall. The monster waves.
  // =====================================================================================================
  const BW = 640, BH = 400, BD = 480, DR = 165, DCY = -205;           // box width/height/depth, door radius/centre
  function monster(x, y, k, t, o = {}) {
    paint(ellPts(x, y - 170 * k, 300 * k, 250 * k, 24, 10), { fill: GOLD2, fillOp: 100, bleed: .3, tex: .3, ink: null });
    const body = [];
    for (let i = 0; i <= 22; i++) {
      const a = Math.PI + i / 22 * Math.PI; body.push([x + Math.cos(a) * 150 * k, y - 150 * k + Math.sin(a) * 170 * k]);
    }
    for (let i = 0; i <= 8; i++) body.push([x + (150 - i * 37.5) * k, y - (i % 2 ? 0 : 22) * k + Math.sin(t * 8 + i) * 4 * k]);
    // arms: the left one rests, the right one waves
    const wave = o.wave ? Math.sin(t * 13) * .55 : 0;
    const armL = [[x - 135 * k, y - 120 * k], [x - 205 * k, y - 70 * k], [x - 215 * k, y - 20 * k]];
    const armR = [[x + 135 * k, y - 130 * k], [x + 200 * k, y - (190 + 60 * o.wave) * k], [x + (215 + 60 * wave) * k, y - (250 + 90 * (o.wave || 0)) * k]];
    for (const ar of [armL, armR]) { inkLine(ar, 11 * k, PAL.ink, 'ink', .6); inkLine(ar, 8 * k, '#B97BE6', 'ink', .6); paint(ellPts(ar[2][0], ar[2][1], 24 * k, 24 * k, 12), { wash: '#B97BE6', ink: PAL.ink, sw: .8 * k }); }
    paint(body, { wash: '#B97BE6', fill: '#8B4FC9', fillOp: 90, bleed: .1, tex: .6, border: .5, ink: PAL.ink, sw: 1.2 * k, curv: .4 });
    paint(ellPts(x - 40 * k, y - 240 * k, 70 * k, 40 * k, 14), { fill: '#E7C3F5', fillOp: 140, bleed: .2, ink: null });
    for (const s of [-1, 1]) paint([[x + s * 60 * k, y - 300 * k], [x + s * 95 * k, y - 360 * k], [x + s * 100 * k, y - 290 * k]], { wash: GOLD2, ink: PAL.ink, sw: .7 * k });
    // three eyes
    for (const [ex, ey, er] of [[-70, -215, 26], [0, -240, 36], [70, -215, 26]]) {
      if (o.happy) inkLine([[x + (ex - er * .8) * k, y + (ey + 6) * k], [x + ex * k, y + (ey - er * .6) * k], [x + (ex + er * .8) * k, y + (ey + 6) * k]], 1.6 * k, PAL.ink, 'ink', .4);
      else { paint(ellPts(x + ex * k, y + ey * k, er * k, er * 1.1 * k, 14), { wash: PAL.cream, ink: PAL.ink, sw: .7 * k }); paint(ellPts(x + (ex + 5) * k, y + (ey + 4) * k, er * .45 * k, er * .5 * k, 10), { wash: PAL.ink, ink: null }); }
    }
    // grin
    const my = y - 140 * k;
    paint([[x - 80 * k, my], [x + 80 * k, my], [x + 50 * k, my + 50 * k], [x - 50 * k, my + 50 * k]], { wash: '#5A1F33', ink: PAL.ink, sw: .8 * k, curv: .5 });
    for (let i = 0; i < 4; i++) paint([[x + (-60 + i * 40) * k, my + 2 * k], [x + (-40 + i * 40) * k, my + 2 * k], [x + (-50 + i * 40) * k, my + 20 * k]], { wash: PAL.cream, ink: null });
    if (o.blush) for (const s of [-1, 1]) paint(ellPts(x + s * 110 * k, y - 160 * k, 26 * k, 14 * k, 10), { fill: PAL.rose, fillOp: 170, ink: null });
  }
  function shotVault(t, lt) {
    const SLAM = bT(103), HF = bT(104);                // 70.44 slam, 71.12 high-five
    const arrive = easeOut(seg(t, 70.0, 70.28)), sa = t - SLAM;
    const phi = 2.55 * easeIO(seg(t, 71.3, 72.4));
    const psi = t < SLAM ? 1.25 * (1 - easeIn(seg(t, 70.08, SLAM))) : 0;   // door open angle
    const [sx, sy] = shakeXY(t, sa > 0 ? 18 * Math.exp(-sa * 6) : 0);
    const c = Math.cos(phi), s = Math.sin(phi), GYv = 700, TILT = .27, F = 1600;
    const P = (X, Y, Z) => { const xr = X * c - Z * s, zr = X * s + Z * c, f = F / (F + zr); return [960 + xr * f, GYv + (Y - zr * TILT) * f, zr, f]; };
    camBegin(960 + sx, 540 + sy - 760 * (1 - arrive), 1, 0);
    // dusk sky, a skyline that slides as we orbit, and the yard
    const hz = GYv - TILT * F;
    // dusk bands: deep violet overhead, rose, then a gold glow on the horizon
    paint(rectPts(-100, -900, W + 200, hz + 560), { wash: '#43347E', ink: null });
    paint(rectPts(-100, hz - 400, W + 200, 260), { wash: '#B0619A', washOp: 190, ink: null });
    paint(rectPts(-100, hz - 190, W + 200, 200), { wash: '#F2B04F', ink: null });
    for (let i = 0; i < 14; i++) { const sx2 = hash(i * 7.7) * W, sy2 = hz - 480 - hash(i * 3.1) * 700; paint(starPts(sx2, sy2, 7 + 5 * hash(i), .45, 4, 0), { wash: PAL.cream, ink: null }); }
    const wrap = (x0, span) => ((x0 - phi * 700) % span + span) % span - 300;
    { const sxp = wrap(1350, 2600); paint(ellPts(sxp, hz - 20, 150, 150, 26), { wash: '#FFD98A', ink: null }); }
    for (let i = 0; i < 18; i++) {
      const x = wrap(i * 190, 3420), hh = 70 + 130 * hash(i * 3.3), bw = 120 + 40 * hash(i * 1.9);
      if (x < -200 || x > W + 60) continue;
      paint(rectPts(x, hz - hh, bw, hh + 8), { wash: '#2E2458', ink: null });
      for (let wi = 0; wi < 3; wi++) if (hash(i * 5 + wi) > .35) paint(rectPts(x + 18 + wi * (bw - 36) / 3, hz - hh + 22 + 38 * (wi % 2), 16, 20), { wash: '#FFD36B', ink: null });
    }
    paint(rectPts(-100, hz, W + 200, 1900), { wash: '#CDB6C8', ink: null });
    paint(rectPts(-60, hz, W + 120, 1150 - hz), { fill: '#9C84A8', fillOp: 55, tex: .7, border: .4, ink: null });
    for (let i = -6; i <= 6; i++) { const a = P(i * 260, 0, -760), b = P(i * 260, 0, 1400); inkLine([a, b].map(p => [p[0], p[1]]), .5, '#9A83A6', 'inkfine', 0); }

    // shadow and the vault box, drawn back to front
    const q = pts3 => pts3.map(([X, Y, Z]) => { const p = P(X, Y, Z); return [p[0], p[1]]; });
    const hx = BW / 2, hd = BD / 2;
    paint(q([[-hx - 40, 0, -hd - 30], [hx + 40, 0, -hd - 30], [hx + 40, 0, hd + 30], [-hx - 40, 0, hd + 30]]), { fill: PAL.ink, fillOp: 70, bleed: .2, tex: .3, ink: null });
    paint(q([[-hx, 0, -hd], [hx, 0, -hd], [hx, 0, hd], [-hx, 0, hd]]), { wash: '#56607A', fill: '#B97BE6', fillOp: 40, ink: PAL.ink, sw: 1 });
    const faces = [
      { id: 'front', pts: [[-hx, 0, -hd], [hx, 0, -hd], [hx, -BH, -hd], [-hx, -BH, -hd]], n: [0, -1] },
      { id: 'left', pts: [[-hx, 0, hd], [-hx, 0, -hd], [-hx, -BH, -hd], [-hx, -BH, hd]], n: [-1, 0] },
      { id: 'right', pts: [[hx, 0, -hd], [hx, 0, hd], [hx, -BH, hd], [hx, -BH, -hd]], n: [1, 0] }
    ].map(f => { const z = f.pts.reduce((acc, p) => acc + P(...p)[2], 0) / 4, facing = f.n[0] * s + f.n[1] * c < 0; return { ...f, z, facing }; }).sort((a, b) => b.z - a.z);
    const mon = P(0, 0, 40), crewFirst = c < 0;
    const crew = () => drawCrew(t, P, SLAM, HF, psi);
    if (crewFirst) crew();
    let monDone = false;
    const drawMon = () => { if (monDone) return; monDone = true; if (c < .2) monster(mon[0], mon[1], mon[3] * .95, t, { wave: t > 71.7, happy: t > 72.35, blush: true }); };
    for (const f of faces) {
      if (!monDone && f.z < mon[2]) drawMon();
      const col = f.facing ? '#8E9DB3' : '#4F5870';
      paint(q(f.pts), { wash: col, fill: f.facing ? '#5E6B85' : '#2E3448', fillOp: 70, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw: 1.3 });
      if (f.facing) for (const [X, Y] of [[-.44, -.06], [.44, -.06], [-.44, -.94], [.44, -.94]]) { const p = f.id === 'front' ? P(X * BW, Y * BH, -hd - 1) : P(f.id === 'left' ? -hx - 1 : hx + 1, Y * BH, X * BD); paint(ellPts(p[0], p[1], 7 * p[3], 7 * p[3], 8), { wash: '#C9D2DE', ink: PAL.ink, sw: .5 }); }
      if (f.id === 'front') drawDoor(t, P, psi, f.facing, SLAM);
    }
    drawMon();
    paint(q([[-hx, -BH, -hd], [hx, -BH, -hd], [hx, -BH, hd], [-hx, -BH, hd]]), { wash: '#A4B1C4', fill: '#5E6B85', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.2 });
    if (!crewFirst) crew();
    camEnd();
    if (sa > 0) sfx('CLANK', 960, 190, 170, '#F2C53D', sa, { life: .7, rot: -.06 });
    if (arrive < 1) for (let i = 0; i < 16; i++) { const x = hash(i) * W, y = hash(i + 5) * H, l = 300 * (1 - arrive); inkLine([[x, y - l], [x, y + l]], 1.2, i % 2 ? LAV : GOLD2, 'inkfine', 0); }
  }
  function drawDoor(t, P, psi, facing, SLAM) {
    const hd = BD / 2, cp = [];
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; cp.push([Math.cos(a) * DR, DCY + Math.sin(a) * DR]); }
    const onWall = pts => pts.map(([dx, dy]) => { const p = P(dx, dy, -hd - 1); return [p[0], p[1]]; });
    // swung door: rotate about the hinge on the left edge of the doorway
    const sw = (dx, dy, dz = 0) => { const lx = dx + DR; return P(-DR + lx * Math.cos(psi) - dz * Math.sin(psi), dy, -hd - 1 - lx * Math.sin(psi) - dz * Math.cos(psi)); };
    if (!facing) { paint(onWall(cp), { wash: '#6B7690', ink: PAL.ink, sw: 1 }); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, p = P(Math.cos(a) * 120, DCY + Math.sin(a) * 120, -hd + 1); paint(ellPts(p[0], p[1], 8 * p[3], 8 * p[3], 8), { wash: '#C9D2DE', ink: PAL.ink, sw: .5 }); } return; }
    if (psi > .01) {
      // the open doorway: glowing, with the monster's face filling it
      paint(onWall(cp), { wash: '#6A3F98', fill: GOLD2, fillOp: 110, bleed: .2, tex: .4, ink: PAL.ink, sw: 1.2 });
      const cc = P(0, DCY, -hd), k = cc[3];
      for (const [ex, ey, er] of [[-60, -40, 22], [0, -62, 30], [60, -40, 22]]) { paint(ellPts(cc[0] + ex * k, cc[1] + ey * k, er * k, er * 1.1 * k, 12), { wash: PAL.cream, ink: PAL.ink, sw: .7 }); paint(ellPts(cc[0] + (ex - 6) * k, cc[1] + (ey + 4) * k, er * .45 * k, er * .5 * k, 10), { wash: PAL.ink, ink: null }); }
      paint([[cc[0] - 70 * k, cc[1] + 20 * k], [cc[0] + 70 * k, cc[1] + 20 * k], [cc[0] + 30 * k, cc[1] + 70 * k], [cc[0] - 30 * k, cc[1] + 70 * k]], { wash: '#5A1F33', ink: PAL.ink, sw: .8, curv: .5 });
      // door edge (thickness) then the door face
      const rim = cp.map(([dx, dy]) => sw(dx, dy, 34)), face = cp.map(([dx, dy]) => sw(dx, dy, 0));
      paint(rim.map(p => [p[0], p[1]]), { wash: '#6B7690', ink: PAL.ink, sw: 1 });
      paint(face.map(p => [p[0], p[1]]), { wash: '#B8C2CC', fill: '#7F8AA0', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.3 });
      return;
    }
    // shut: glow leaks from the seam, then bolts, rings and the spinning wheel
    const sa = t - SLAM, leak = .5 + .5 * Math.sin(t * 9);
    paint(onWall(cp.map(([x, y]) => [x * 1.1, DCY + (y - DCY) * 1.1])), { fill: GOLD2, fillOp: 90 * leak + (sa < .3 ? 120 * (1 - sa / .3) : 0), bleed: .25, tex: .3, ink: null });
    paint(onWall(cp), { wash: '#B8C2CC', fill: '#7F8AA0', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.4 });
    paint(onWall(cp.map(([x, y]) => [x * .76, DCY + (y - DCY) * .76])), { ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, p = P(Math.cos(a) * 142, DCY + Math.sin(a) * 142, -BD / 2 - 2); paint(ellPts(p[0], p[1], 8 * p[3], 8 * p[3], 8), { wash: '#E3E8EE', ink: PAL.ink, sw: .5 }); }
    const spin = sa > 0 ? 2.4 * TAU * easeOut(seg(sa, .05, .65)) : 0, hub = P(0, DCY, -BD / 2 - 3);
    for (let i = 0; i < 3; i++) { const a = spin + i / 3 * TAU, e = P(Math.cos(a) * 88, DCY + Math.sin(a) * 88, -BD / 2 - 3), e2 = P(-Math.cos(a) * 88, DCY - Math.sin(a) * 88, -BD / 2 - 3); inkLine([[e[0], e[1]], [e2[0], e2[1]]], 2.6, PAL.ink, 'ink', 0); paint(ellPts(e[0], e[1], 12 * e[3], 12 * e[3], 8), { wash: GOLD, ink: PAL.ink, sw: .5 }); paint(ellPts(e2[0], e2[1], 12 * e[3], 12 * e[3], 8), { wash: GOLD, ink: PAL.ink, sw: .5 }); }
    paint(ellPts(hub[0], hub[1], 26 * hub[3], 26 * hub[3], 12), { wash: GOLD, fill: PAL.ochre, fillOp: 70, ink: PAL.ink, sw: .8 });
    const dial = P(95, DCY - 95, -BD / 2 - 3);
    paint(ellPts(dial[0], dial[1], 26 * dial[3], 26 * dial[3], 12), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
    const da = -spin * 1.7; inkLine([[dial[0], dial[1]], [dial[0] + Math.cos(da) * 20, dial[1] + Math.sin(da) * 20]], 1, PAL.ink, 'ink', 0);
  }
  // the hard-hat crew: two shovers and a wheel-spinner, then a high-five
  function drawCrew(t, P, SLAM, HF, psi) {
    const hd = BD / 2, sa = t - SLAM, hf = t - HF;
    const on = (f, out) => { const lx = f * 2 * DR, X = -DR + lx * Math.cos(psi), Z = -hd - lx * Math.sin(psi); return [X - Math.sin(psi) * out, Z - Math.cos(psi) * out]; };
    const shove = t < SLAM;
    const pA = shove ? on(.95, 120) : [lerp(on(.95, 120)[0], -345, ease(seg(sa, .1, .6))), lerp(on(.95, 120)[1], -hd - 150, ease(seg(sa, .1, .6)))];
    const pB = shove ? on(.45, 120) : [lerp(on(.45, 120)[0], -110, ease(seg(sa, .1, .6))), lerp(on(.45, 120)[1], -hd - 150, ease(seg(sa, .1, .6)))];
    const pC = [lerp(330, 210, ease(seg(t, 70.0, SLAM + .1))), -hd - 120];
    const five = hf > -.2 && hf < .45, jumpK = five ? Math.sin(clamp((hf + .2) / .65) * Math.PI) : 0;
    const dance = t > HF + .45 ? move('roof', t) : null;
    const face = mood(t, [[70, 'narrow'], [SLAM + .05, 'happy', 'sweat'], [HF, 'happy', 'spark']]);
    const crew = [
      { p: pA, o: shove ? { rot: .35, walk: t * 3, aL: .2, aR: .1, eyes: 'narrow', mouth: 'flat' } : dance ? { ...dance, ...face, mouth: 'grin' } : { dy: -2.2 * jumpK, aR: five ? 1.25 + .2 * jumpK : .3, aL: .2, ...face, mouth: 'grin', rot: .1 * jumpK } },
      { p: pB, o: shove ? { rot: .3, walk: t * 3 + .3, aL: .1, aR: .2, eyes: 'narrow', mouth: 'flat', sq: .05 } : dance ? { ...dance, ...face, mouth: 'grin', seed: 1 } : { dy: -2.2 * jumpK, aL: five ? 1.25 + .2 * jumpK : .3, aR: .2, ...face, mouth: 'grin', rot: -.1 * jumpK } },
      { p: pC, o: sa > 0 && sa < .7 ? { aL: .9 + .3 * Math.sin(t * 30), aR: .2, eyes: 'narrow', mouth: 'smile' } : t < SLAM ? { aL: 1.1, aR: 1.1, eyes: 'normal', mouth: 'o' } : dance ? { ...move('hop', t), eyes: 'happy', mouth: 'grin' } : { aL: .4, aR: .4, eyes: 'happy', mouth: 'smile' } }
    ].map(m => ({ ...m, pr: P(m.p[0], 0, m.p[1]) })).sort((a, b) => b.pr[2] - a.pr[2]);
    for (const m of crew) clawd(m.pr[0], m.pr[1], 18 * m.pr[3], { hat: 'hard', blush: true, ...m.o });
    if (hf > 0 && hf < .5) { const a = P((pA[0] + pB[0]) / 2, -175, (pA[1] + pB[1]) / 2 - 10); paint(starPts(a[0], a[1], (30 + 140 * easeOut(hf / .25)) * (1 - hf / .5), .35, 8, hf * 2), { wash: PAL.cream, fill: GOLD2, fillOp: 90, ink: PAL.ink, sw: .8 }); }
  }

  chapter('chorus2', 59.0, 73.0, [[59.0, shotPump], [60.45, shotBasilisk], [bT(92), shotMoon], [64.5, shotOmega], [66.0, shotGPU], [70.0, shotVault]]);
})();
