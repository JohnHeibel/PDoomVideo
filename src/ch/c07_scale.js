// c07_scale: "Scale" (109.4–123.5). Data-center teal with safety-orange accents.
// Shots: endless Clawd tower → clicker training gone rogue → chinchilla + super-dense cube → cube smashes fences
//        → endless GPU aisle → RLHF judging panel tilts and floods red.
(() => {
  const SO = '#F0762B', SO_DK = '#B9501E', SO_LT = '#F8A865';
  const TL = '#3A9C98', TL_DK = '#1E5F66', TL_DKK = '#123C45', TL_LT = '#8ED3C9', TL_PALE = '#CDEBE2';
  const HAZ = '#F2C53D', GOLD = '#F8CC62', ALARM = '#D8283F';
  const B = n => OFF + n * BEAT;                         // time of beat n (fractions allowed)

  // ---------- shared little helpers ----------
  const fluff = (cx, cy, rx, ry, n = 30, amp = .06, bumps = 12, rot = 0) => {
    const p = [];
    for (let i = 0; i < n; i++) { const a = rot + i / n * TAU, f = 1 + amp * (Math.pow(Math.abs(Math.sin(a * bumps / 2)), .6) - .5); p.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]); }
    return p;
  };
  const bez = (p0, p1, p2, u) => [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];
  const glowDot = (x, y, r, col = GOLD, op = 110) => { paint(ellPts(x, y, r * 2.2, r * 2.2, 14), { fill: col, fillOp: op, bleed: .3, tex: .2, border: .1, ink: null }); paint(ellPts(x, y, r, r, 10), { wash: PAL.cream, ink: null }); };
  // a glowing token pebble
  const pebble = (x, y, r, i = 0) => {
    paint(ellPts(x, y, r * 1.9, r * 1.6, 12), { fill: GOLD, fillOp: 70, bleed: .3, tex: .2, border: .1, ink: null });
    paint(ellPts(x, y, r, r * .78, 10, r * .06, hash(i) * 3), { wash: i % 3 ? GOLD : SO_LT, ink: PAL.ink, sw: .5 });
    paint(ellPts(x - r * .3, y - r * .25, r * .28, r * .18, 8), { wash: PAL.cream, ink: null });
  };
  // ballistic debris: pure function of age
  const fly = (x0, y0, vx, vy, age, g = 2200) => [x0 + vx * age, y0 + vy * age + .5 * g * age * age];

  // The super-dense cube: Clawd crushed to a glowing square, centred at (x, cy) with side L, rotated by rot.
  function cube(x, cy, L, rot, o = {}) {
    const u = L / 6, heat = o.heat ?? 1;
    paint(ellPts(x, cy, L * 1.25, L * 1.25, 20), { fill: GOLD, fillOp: 80 * heat, bleed: .35, tex: .2, border: .1, ink: null });
    paint(ellPts(x, cy, L * .85, L * .85, 18), { fill: SO_LT, fillOp: 70 * heat, bleed: .3, tex: .2, border: .1, ink: null });
    push(); translate(x, cy); rotate(rot);
    clawd(0, 5 * u, u, { noLegs: true, noShadow: true, sx: .6, aL: Math.PI, aR: Math.PI, col: o.col || '#E0692F', dk: o.dk || '#9C3B1C', lt: o.lt || '#FFD27A',
      eyes: o.eyes || 'narrow', mouth: o.mouth || 'flat', seed: 3, lookX: o.lookX, lookY: o.lookY, squint: o.squint,
      draw: (uu, sw) => { // hot rim-light sparkle on a corner
        paint(starPts(2.2 * uu, -7.3 * uu, uu * .9 * (1 + .25 * Math.sin(T * 30))), { wash: PAL.cream, ink: null });
      } });
    pop();
  }

  // =====================================================================================================
  // 1) "Just transformers all the way!"  — endless tower of Clawds, self-similar tilt-down into the clouds
  // =====================================================================================================
  // one puffy picture-book cloud clump (a few overlapping puffs), centred at (x, y), about 2*w wide
  const cloudClump = (x, y, w, seed, o = {}) => {
    const n = o.n || 4;
    for (let p = 0; p < n; p++) {
      const f = n === 1 ? .5 : p / (n - 1), r = w * (.42 + .22 * Math.sin(f * Math.PI)) * (.85 + .3 * hash(seed + p));
      const cx = x + (f - .5) * w * 1.5, cy = y - Math.sin(f * Math.PI) * w * .22 + (hash(seed * 3 + p) - .5) * w * .1;
      paint(fluff(cx, cy, r, r * .72, 22, .16, 7, seed + p), { wash: o.col || '#F7FCF8', washOp: 250, fill: o.shade || TL_LT, fillOp: 55, bleed: .12, tex: .4, border: .7, ink: o.ink || '#6FAAA4', sw: o.sw || .8, curv: .4 });
    }
  };

  function tower(t, lt) {
    const K = 1.12, U = 26;
    // hold on the top for the line, then tilt down faster and faster ("all the way!")
    const x_ = Math.max(0, lt - .55), lam = -.9 + .45 * x_ * x_ + .06 * x_ ** 3;
    const speed = .9 * x_ + .18 * x_ * x_;                               // levels per second
    const Bc = 8 * U * K / (K - 1), A = 560 + 4 * U - Bc;             // self-similar stack: each level is K× the one above
    const L = i => { const k = Math.pow(K, i - lam); return { u: U * k, gy: A + Bc * k, k }; };
    const xOf = (i, u) => 960 + u * (.55 * Math.sin(i * 1.9 + .6) + .28 * Math.sin(t * 2.3 + i * .8));
    const scroll = lam * 8 * U;                                        // approx. pixels travelled, for parallax

    // sky: teal overhead, paling toward the cloud sea below
    paint(rectPts(-80, -80, W + 160, H + 160), { wash: '#A9DCD2', ink: null });
    paint(rectPts(-80, -80, W + 160, 520), { fill: TL, fillOp: 95, bleed: .25, tex: .5, border: .5, ink: null });
    paint(rectPts(-80, 640, W + 160, 600), { fill: '#EFF9F4', fillOp: 150, bleed: .25, tex: .4, border: .4, ink: null });
    // far cloud wisps drift up slowly (parallax)
    for (let k = 0; k < 6; k++) {
      const yy = ((k * 330 - scroll * .35) % 1980 + 1980) % 1980 - 400, side = k % 2 ? 1 : -1;
      paint(fluff(960 + side * (560 + 140 * hash(k)), yy, 330, 90, 22, .25, 8, k), { fill: '#F6FCF9', fillOp: 150, bleed: .25, tex: .4, border: .5, ink: null });
    }

    // speed streaks rushing up past the tower
    if (speed > .6) for (let k = 0; k < 9; k++) {
      const xx = 120 + hash(k * 3) * 1680, len = 60 * speed, yy = ((hash(k) * 1400 - scroll * (.8 + .4 * hash(k + 1))) % 1400 + 1400) % 1400 - 200;
      if (Math.abs(xx - 960) < 330) continue;
      inkLine([[xx, yy], [xx, yy + len]], 1, '#F4FBF7', 'inkfine', 0);
    }
    const i0 = Math.max(0, Math.floor(lam) - 5), i1 = Math.floor(lam) + 4, vis = [];
    for (let i = i0; i <= i1; i++) { const l = L(i); if (l.gy - 8 * l.u < H + 60 && l.gy > -40) vis.push(i); }

    // attention arcs (behind the Clawds): glowing loops from each Clawd's side to the ones below it
    for (const i of vis) for (const [j, side] of [[i + 1, i % 2 ? 1 : -1], [i + 2, i % 2 ? -1 : 1]]) {
      const a = L(i), b = L(j);
      const p0 = [xOf(i, a.u) + side * 5.4 * a.u, a.gy - 4.8 * a.u], p2 = [xOf(j, b.u) + side * 5.4 * b.u, b.gy - 4.8 * b.u];
      const bulge = (p2[1] - p0[1]) * .7 + 1.5 * a.u, p1 = [(p0[0] + p2[0]) / 2 + side * bulge, (p0[1] + p2[1]) / 2];
      const pts = []; for (let q = 0; q <= 7; q++) pts.push(bez(p0, p1, p2, q / 7));
      const lit = Math.exp(-frac(bpOf(t) - i * .25 - (j - i) * .5) * 3);
      inkLine(pts, 5 * a.k, mixCol('#FFF1D2', GOLD, .3 + .7 * lit), 'marker', .5);
      inkLine(pts, 1.3 + .9 * lit, mixCol(SO_DK, SO, lit), 'ink', .5);
      for (const off of [0, .5]) { const q = frac(t * .9 + hash(i * 3 + j) + off), pp = bez(p0, p1, p2, q); glowDot(pp[0], pp[1], (5 + 4 * lit) * a.k, GOLD, 100); }
      paint(ellPts(p0[0], p0[1], 7 * a.k, 7 * a.k, 10), { wash: SO, ink: PAL.ink, sw: .6 });
    }

    // the Clawds, biggest (lowest) first so each one's feet sit on the back below
    const faces = ['happy', 'normal', 'wink', 'happy', 'look', 'normal'], mouths = ['smile', 'cat', 'grin', 'smile', 'cat', 'o'];
    for (let n = vis.length - 1; n >= 0; n--) {
      const i = vis[n], { u, gy } = L(i), x = xOf(i, u), f = Math.floor(hash(i * 7.3) * 6);
      const bp = bpOf(t) - i * .2, hit = Math.exp(-frac(bp) * 5);
      const o = { noShadow: i !== 0, seed: i, sq: .08 * hit, eyes: faces[f], mouth: mouths[f], lookY: -1, lookX: (i % 2 ? .6 : -.6),
        aL: 1.25 + .2 * Math.sin(bp * Math.PI), aR: 1.25 - .2 * Math.sin(bp * Math.PI) };
      if (i % 4 === 2) { o.eyes = 'closed'; o.mouth = 'wobble'; o.emote = 'sweat'; o.emoteK = .85 + .15 * hit; o.aL = o.aR = 1.45; }
      if (i % 7 === 5) { o.eyes = 'closed'; o.mouth = 'o'; o.emote = 'zzz'; o.emoteK = 1; o.aL = o.aR = -.2; }
      if (i === 0) { o.eyes = 'happy'; o.mouth = 'grin'; o.blush = true; }
      clawd(x, gy, u, o);
      if (i > 0) paint(ellPts(xOf(i - 1, u / K), gy - 8 * u + u * .12, 4.6 * u / K, .45 * u, 16), { fill: PAL.ink, fillOp: 70, bleed: .2, tex: .2, ink: null });
      if (i === 0) {  // the Researcher proudly on top, gesturing down the tower
        const s = u * .72, b = bpOf(t);
        researcher(x - .3 * u, gy - 8 * u + u * .05, s, { noShadow: true, eyes: 'star', mouth: 'grin', blush: true, aL: 1 + .3 * Math.sin(b * Math.PI), aR: -.5 - .25 * pulse(t, 5), dy: -Math.abs(Math.sin(b * Math.PI)) * .5 });
      }
    }

    // cloud layers the tower pierces, passing in front
    for (let m = -1; m < 4; m++) {
      const c = (Math.floor((lam - 1.3) / 2.1) + m) * 2.1 + 1.3;
      if (c < 1) continue;
      const { u, gy } = L(c); if (gy < -300 || gy - 3 * u > H + 150) continue;
      const side = Math.round(c / 2.1) % 2 ? 1 : -1, dr = wob(t, .25, c) * u * .4;
      cloudClump(960 + side * 9.5 * u + dr, gy, 7 * u, Math.round(c * 13), { n: 4 });
      cloudClump(960 - side * 12 * u - dr, gy - 1.8 * u, 5.5 * u, Math.round(c * 17), { n: 3 });
    }
    // the cloud sea rises as we sink into it
    const sea = seg(lt, 3.35, 4.1);
    if (sea > 0) {
      const top = lerp(H + 160, 480, ease(sea));
      paint(rectPts(-80, top + 60, W + 160, H), { wash: '#F4FAF6', washOp: 250, fill: TL_LT, fillOp: 40, tex: .4, border: .5, ink: null });
      for (let k = 0; k < 5; k++) cloudClump(-80 + k * 520, top + 40 + 30 * Math.sin(k * 2.1), 330, 70 + k * 5, { n: 3 });
    }
  }

  // =====================================================================================================
  // 2) "Till you learned to disobey" — clicker training: sit, spin, paw… then shades and folded arms
  // =====================================================================================================
  function disobey(t, lt) {
    const tS = B(166.5), tSp = B(167), tP = B(167.5), tT = B(168), tSh = B(168.5), tX = B(169);
    const clicks = [tS, tSp, tP, tT, tT + .15, tSh - .12, tSh + .06, tX - .12, tX + .05, tX + .2];
    const punch = backOut(seg(t, tX - .06, tX + .16));
    camBegin(lerp(965, 1000, ease(lt / 2)) + punch * 120, 650 - punch * 25, 1.3 + .05 * ease(lt / 2) + .16 * punch, 0);

    // training room: teal wall with a big painted paw print, hazard band, pale floor
    paint(rectPts(-300, -300, W + 600, 1110), { wash: '#5AAEA6', fill: TL_DK, fillOp: 60, bleed: .1, tex: .7, border: .5, ink: null });
    const paw = (px, py, r, col) => {
      paint(ellPts(px, py, r, r * .82, 20, r * .03), { wash: col, ink: null });
      [[-1.05, -1.05], [-.38, -1.45], [.38, -1.45], [1.05, -1.05]].forEach(([dx, dy]) => paint(ellPts(px + dx * r, py + dy * r, r * .34, r * .42, 14, r * .02), { wash: col, ink: null }));
    };
    paw(965, 470, 62, '#79C2B8');
    paint(rectPts(-300, 700, W + 600, 46), { wash: SO, ink: PAL.ink, sw: .8, hatch: { d: 36, a: .8, o: { rand: .1 }, b: 'marker', c: PAL.ink, w: 1.2 } });
    paint([[-300, 790], [W + 300, 790], [W + 300, 1400], [-300, 1400]], { wash: '#DCD3C0', fill: '#A99F8A', fillOp: 60, bleed: .05, tex: .7, border: .5, ink: PAL.ink, sw: 1.2 });
    inkLine([[-300, 880], [W + 300, 884]], .5, '#B3A88F', 'inkfine', 0);
    // agility cones
    for (const [cx, sc] of [[430, 1], [1510, .9]]) {
      paint([[cx - 34 * sc, 820], [cx - 8 * sc, 700], [cx + 8 * sc, 700], [cx + 34 * sc, 820]], { wash: SO, fill: SO_DK, fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 });
      paint([[cx - 24 * sc, 772], [cx - 16 * sc, 745], [cx + 16 * sc, 745], [cx + 24 * sc, 772]], { wash: PAL.cream, ink: null });
      paint(rectPts(cx - 46 * sc, 816, 92 * sc, 12, 1), { wash: SO_DK, ink: PAL.ink, sw: .8 });
    }
    paint(ellPts(1190, 893, 230, 40, 26, 3), { wash: SO_LT, fill: SO, fillOp: 60, tex: .5, ink: PAL.ink, sw: .8 });
    paint([[1410, 868], [1500, 868], [1486, 900], [1424, 900]], { wash: TL, ink: PAL.ink, sw: .9 });
    paint(ellPts(1455, 868, 45, 8, 14), { wash: '#2D6E73', ink: PAL.ink, sw: .6 });
    for (const [bx, by] of [[1440, 860], [1466, 858]]) paint(ellPts(bx, by, 9, 6, 8), { wash: GOLD, ink: PAL.ink, sw: .4 });   // treats

    // --- Clawd: sit, spin, paw... then the snub ---
    const x = 1190, y = 893, u = 27;
    const pre = move('hop', t);
    let dy = t < tS ? pre.dy * .45 : 0, sq = t < tS ? pre.sq : 0, sx = 1, aL = t < tS ? pre.aL : .35, aR = t < tS ? pre.aR : .35, rot = 0;
    const sitK = backOut(seg(t, tS - .03, tS + .1)) * (1 - ease(seg(t, tSp - .06, tSp + .01)));
    sq += .26 * sitK; aL = lerp(aL, -.25, sitK); aR = lerp(aR, -.25, sitK);
    const sp = seg(t, tSp, tSp + .3);
    if (sp > 0 && sp < 1) { sx = Math.cos(sp * TAU); dy = -Math.sin(sp * Math.PI) * 3.5; aL = aR = 1.2; sq = -.1 * Math.sin(sp * Math.PI); }
    const pawK = backOut(seg(t, tP - .05, tP + .1)) * (1 - ease(seg(t, tT - .06, tT + .02)));
    aL = lerp(aL, 1.45 + .25 * Math.sin(t * 24), pawK); dy -= .6 * pawK; rot += .06 * pawK;
    // the turn-away: a little hop while sx swings through 0, ending chin-up facing away
    const tu = seg(t, tT + .06, tT + .28);
    if (tu > 0) { sx = Math.cos(tu * Math.PI); rot = -.08 * ease(tu); aL = aR = .35; dy -= Math.sin(tu * Math.PI) * 1.2; }
    const crossK = backOut(seg(t, tX - .1, tX + .06));
    if (crossK > .25) aL = aR = Math.PI;
    const md = mood(t, [[113.4, 'happy'], [tT + .1, 'look'], [tSh + .01, 'shades']]);
    const shadesDrop = seg(t, tSh - .2, tSh);
    const em = t < tSp ? ['heart', seg(t, tS + .02, tS + .2)] : t < tP ? ['music', seg(t, tSp + .25, tSp + .4)] : t < tT ? ['heart', seg(t, tP + .05, tP + .2)] : [null, 0];
    const land = Math.exp(-Math.max(0, t - tSh) * 14) * (t > tSh ? 1 : 0);
    clawd(x, y, u, { dy, sx, rot, aL, aR, ...md, lookX: -1, lookY: -.6, sq: sq + (md.take || 0) + .07 * land + .06 * (crossK > .02 && crossK < 1 ? Math.sin(crossK * Math.PI) : 0), take: 0,
      mouth: t < tT + .1 ? 'smile' : 'flat', blush: t < tT, emote: em[0], emoteK: em[1] * (em[0] ? 1 : 0),
      draw: (uu, sw) => {
        if (t < tT) paint(ellPts(.5 * uu, -3.95 * uu, .42 * uu, .55 * uu, 12), { wash: PAL.rose, ink: PAL.ink, sw: sw * .5 });   // puppy tongue
        if (shadesDrop > 0 && shadesDrop < 1) {                                                                                     // shades dropping onto the face
          const oy = -lerp(10 * uu, 0, easeIn(shadesDrop));
          paint(rrPts(-4.6 * uu, -7.5 * uu + oy, 9.2 * uu, 2.2 * uu, .6 * uu), { wash: PAL.ink, ink: null });
          inkLine([[-3.9 * uu, -7 * uu + oy], [-2.4 * uu, -7.1 * uu + oy]], sw * .5, PAL.cream, 'inkfine', 0);
        }
        const gl = seg(t, tSh + .06, tSh + .4);
        if (gl > 0 && gl < 1) paint(starPts(-3.2 * uu, -7.2 * uu, uu * 1.5 * Math.sin(gl * Math.PI)), { wash: PAL.cream, fill: GOLD, fillOp: 60, ink: null });
        // folded arms: two forearms across the tummy
        if (crossK > .02) for (const [sd, oy] of [[1, .3], [-1, -.35]]) {
          push(); translate(sd * 4.9 * uu, -3.3 * uu + oy * uu); rotate(sd * .06);
          const len = 8.6 * uu * crossK;
          paint(rrPts(sd > 0 ? -len : 0, -.62 * uu, len, 1.24 * uu, .6 * uu), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .8 });
          pop();
        }
        // "hmph" puffs out the side
        const hp = seg(t, tX + .02, tX + .45);
        if (hp > 0 && hp < 1) for (const k of [0, 1]) paint(ellPts(-(6 + hp * 3 + k * 1.2) * uu, -(4.6 + k * .9 + hp * .8) * uu, (1 - hp) * (.9 - k * .25) * uu, (1 - hp) * (.7 - k * .2) * uu, 12), { wash: PAL.cream, ink: PAL.ink, sw: sw * .4 });
      } });

    // --- the Researcher with the clicker ---
    const rx = 745, s = 25, lastClick = clicks.filter(c => c <= t).pop() ?? -9, ca = t - lastClick;
    const shock = seg(t, tT + .22, tT + .34);
    const rmd = mood(t, [[113.4, 'dot'], [tT + .25, 'wide']]);
    const clickPush = Math.exp(-ca * 14), armA = .3 + clickPush * .14;
    researcher(rx, 900, s, { ...rmd, mouth: shock > 0 ? 'O' : 'smile', brows: shock > 0 ? 'worried' : 'up', hairUp: seg(t, tX - .05, tX + .15) * .8,
      glassesTilt: shock * .12, dy: t < tT ? -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .4 : 0, lookX: 1,
      emote: shock > 0 ? 'sweat' : null, emoteK: seg(t, tSh, tSh + .25),
      aL: t < tT ? -1.1 : .6 + .2 * Math.sin(t * 20), aR: armA,
      handR: (ss, sw) => {
        rotate(armA);
        paint(rrPts(-.7 * ss, -1.6 * ss, 1.4 * ss, 1.9 * ss, .45 * ss), { wash: SO, fill: SO_DK, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .7 });
        paint(ellPts(0, -1.6 * ss + clickPush * .22 * ss, .45 * ss, .24 * ss, 10), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
        if (ca < .16) for (let k = -1; k <= 1; k++) { const a = -Math.PI / 2 + k * .6, r0 = 2.1 * ss, r1 = (2.8 + ca * 6) * ss; inkLine([[Math.cos(a) * r0, -1.4 * ss + Math.sin(a) * r0], [Math.cos(a) * r1, -1.4 * ss + Math.sin(a) * r1]], sw * 1.2, PAL.ink, 'ink', 0); }
      } });
    camEnd();
    // we arrive from the cloud sea: the last puffs part and slide away
    const part = seg(lt, 0, .32);
    if (part < 1) for (let k = 0; k < 4; k++) { const side = k % 2 ? 1 : -1, e = easeIn(part); cloudClump(960 + side * (260 + e * 1300) + (k > 1 ? side * 200 : 0), 300 + k * 230, 420, 90 + k * 7, { n: 3 }); }
  }

  // =====================================================================================================
  // 3) "Post-Chinchilla, super-dense" — chinchilla stuffs its cheeks; Clawd crushes itself into a cube
  // =====================================================================================================
  CAST.chinchilla = (x, y, s, t, o = {}) => {
    const FUR = o.col || '#ABA8BE', FUR_DK = '#76728F', FUR_LT = '#EDE8F1', PINK = '#F2A7B8';
    const bow = clamp(o.bow || 0), ch = clamp(o.cheeks || 0), sw = clamp(s / 15, .45, 2.4), J = s * .04, sq = o.sq || 0;
    if (!o.noShadow) paint(ellPts(x, y + s * .15, s * 4.8, s * .9, 20), { fill: PAL.ink, fillOp: 90, bleed: .25, tex: .3, border: .1, ink: null });
    push(); translate(x, y + (o.dy || 0) * s); if (o.rot) rotate(o.rot);
    scale((o.flip ? -1 : 1) * (1 + sq * .5 + bow * .04), 1 - sq - bow * .08);
    // bushy tail curling up behind
    paint(fluff(3.9 * s, -2.6 * s, 1.5 * s, 2.5 * s, 24, .25, 9, .4), { wash: FUR, fill: FUR_DK, fillOp: 60, bleed: .1, tex: .6, ink: PAL.ink, sw: sw * .8, curv: .3 });
    // feet
    for (const fx of [-1.6, 1.6]) paint(ellPts(fx * s, -.3 * s, 1.05 * s, .5 * s, 14, J), { wash: FUR_LT, fill: PINK, fillOp: 50, ink: PAL.ink, sw: sw * .7 });
    // round fluffy body with a pale belly
    const body = fluff(0, -3.3 * s, 4.2 * s, 3.4 * s, 36, .07, 16);
    paint(body, { wash: FUR, ink: null });
    paint(ellPts(0, -2.7 * s, 2.7 * s, 2.3 * s, 22, J), { fill: FUR_LT, fillOp: 190, bleed: .15, tex: .5, border: .6, ink: null });
    paint(ellPts(0, -1.1 * s, 3.6 * s, 1 * s, 18, J), { fill: FUR_DK, fillOp: 70, bleed: .1, tex: .6, ink: null });
    paint(body, { ink: PAL.ink, sw, curv: .3 });
    // head, dropping forward on a bow
    const hy = -6.9 * s + bow * 2.3 * s;
    for (const side of [-1, 1]) {                                                             // big round ears
      const ea = side * (.32 + bow * .55), ex = side * (2.1 + bow * .6) * s, ey = hy - 2.7 * s + bow * .9 * s;
      paint(ellPts(ex, ey, 1.55 * s, 2.1 * s, 22, J, ea), { wash: FUR, fill: FUR_DK, fillOp: 40, tex: .5, ink: PAL.ink, sw: sw * .85 });
      paint(ellPts(ex + side * .05 * s, ey + .2 * s, .95 * s, 1.45 * s, 18, J, ea), { wash: PINK, fill: '#E27A92', fillOp: 60, tex: .5, ink: null });
    }
    const head = fluff(0, hy, 3.3 * s, 2.7 * s, 32, .06, 14);
    paint(head, { wash: FUR, fill: FUR_DK, fillOp: 30, bleed: .1, tex: .5, border: .5, ink: PAL.ink, sw: sw * .9, curv: .3 });
    paint(ellPts(0, hy + 1.1 * s, 1.9 * s, 1.2 * s, 18, J), { fill: FUR_LT, fillOp: 200, bleed: .15, tex: .4, ink: null });
    // cheek pouches: puff out past the head outline as they fill
    if (ch > .01) for (const side of [-1, 1]) {
      const r = (.8 + ch * 1.35) * s, cx = side * (1.85 + ch * .95) * s, cy = hy + 1.15 * s + ch * .25 * s;
      paint(ellPts(cx, cy, r * 1.02, r * .88, 20, J), { wash: '#C9C4D8', fill: FUR_LT, fillOp: 140, bleed: .1, tex: .5, ink: PAL.ink, sw: sw * .8 });
      paint(ellPts(cx + side * .15 * r, cy + .15 * r, r * .45, r * .3, 12), { fill: PINK, fillOp: 150, bleed: .2, ink: null });
    }
    // eyes: big glossy beads, closing on a bow
    const eyes = bow > .4 ? 'happy' : (o.eyes || 'normal');
    for (const side of [-1, 1]) {
      const ex = side * 1.35 * s + (o.lookX || 0) * .15 * s, ey = hy - .35 * s;
      if (eyes === 'happy' || eyes === 'closed') inkLine([[ex - .55 * s, ey + .2 * s], [ex, ey - (eyes === 'happy' ? .35 : -.2) * s], [ex + .55 * s, ey + .2 * s]], sw * 1.1, PAL.ink, 'ink', .5);
      else {
        const big = eyes === 'wide' ? 1.25 : 1;
        paint(ellPts(ex, ey, .6 * s * big, .72 * s * big, 16), { wash: PAL.ink, ink: null });
        paint(ellPts(ex - .2 * s, ey - .28 * s, .2 * s, .2 * s, 8), { wash: PAL.cream, ink: null });
        paint(ellPts(ex + .18 * s, ey + .22 * s, .09 * s, .09 * s, 6), { wash: PAL.cream, ink: null });
      }
    }
    if (o.blush || ch > .5) for (const side of [-1, 1]) paint(ellPts(side * 2.2 * s, hy + .7 * s, .55 * s, .28 * s, 12), { fill: PAL.rose, fillOp: 140, bleed: .2, ink: null });
    // nose, mouth, whiskers
    paint(ellPts(0, hy + .55 * s, .32 * s, .22 * s, 10), { wash: '#E77F98', ink: PAL.ink, sw: sw * .4 });
    const chew = o.chew || 0;
    if (chew > .05) paint(ellPts(0, hy + 1.2 * s, .28 * s, .22 * s * chew + .05 * s, 10), { wash: '#6A2A35', ink: PAL.ink, sw: sw * .4 });
    else inkLine([[-.4 * s, hy + 1.05 * s], [-.2 * s, hy + 1.25 * s], [0, hy + .8 * s], [.2 * s, hy + 1.25 * s], [.4 * s, hy + 1.05 * s]], sw * .55, PAL.ink, 'inkfine', .5);
    for (const side of [-1, 1]) for (const k of [-1, 0, 1]) inkLine([[side * .6 * s, hy + .75 * s], [side * (3.2 + ch * 1.2) * s, hy + (.35 + k * .45) * s]], sw * .35, PAL.ink, 'inkfine', .2);
    // little front paws: at the chest, raised to the mouth while eating, clasped on a bow
    const pu = clamp(o.paws || 0);
    for (const side of [-1, 1]) {
      const px = side * lerp(1.0, .55, pu) * s, py = lerp(hy + 2.9 * s, hy + 1.7 * s, pu);
      paint(ellPts(px, py, .55 * s, .45 * s, 12, J), { wash: FUR_LT, ink: PAL.ink, sw: sw * .6 });
    }
    if (o.hold) pebble(0, hy + 1.6 * s, .45 * s);
    if (o.draw) o.draw(s, sw);
    pop();
  };

  function chinchillaShot(t, lt) {
    const tI = B(169.5), tC = B(170), tD = B(171);                   // idea, crunch, drop
    const dropA = t - tD;
    const shake = shakeXY(t, dropA >= 0 ? 22 * Math.exp(-dropA * 7) : 4 * seg(t, tC + .1, tD));
    const push_ = ease(seg(t, tC, tD - .1));
    camBegin(lerp(lerp(880, 960, ease(lt / .6)), 1180, push_) + shake[0], lerp(640, 690, push_) + shake[1] + 40 * easeIn(seg(t, tD, tD + .2)), lerp(1.24, 1.55, push_), 0);

    // data-center floor: dark rack silhouettes behind, raised-floor tiles in front
    paint(rectPts(-300, -300, W + 600, 1100), { wash: '#2C6F72', fill: TL_DKK, fillOp: 90, bleed: .1, tex: .7, border: .5, ink: null });
    for (let r = 0; r < 9; r++) {
      const rx = -200 + r * 260;
      paint(rectPts(rx, 170, 210, 600, 3), { wash: '#1D4A52', fill: TL_DKK, fillOp: 70, tex: .6, ink: PAL.ink, sw: .8 });
      for (let k = 0; k < 4; k++) paint(ellPts(rx + 40 + (k % 2) * 110, 240 + k * 120, 8, 8, 8), { wash: (k + r + beatN(t)) % 3 ? TL_LT : SO_LT, ink: null });
    }
    paint([[-300, 760], [W + 300, 760], [W + 300, 1400], [-300, 1400]], { wash: '#A9C7C1', fill: '#6F9B96', fillOp: 60, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw: 1.2 });
    for (let i = -8; i <= 9; i++) inkLine([[960 + i * 170, 760], [960 + i * 170 * 2.2, 1400]], .6, '#5F8781', 'inkfine', 0);
    for (const yy of [820, 905, 1010]) inkLine([[-300, yy], [W + 300, yy]], .6, '#5F8781', 'inkfine', 0);
    paint(rectPts(-300, 752, W + 600, 14), { wash: SO, ink: null });

    // token pebble pile, glowing
    const px0 = 460, py0 = 872;
    paint(ellPts(px0, py0 - 30, 170, 90, 18), { fill: GOLD, fillOp: 110, bleed: .3, tex: .3, border: .2, ink: null });
    [[-60, 0, 24], [-8, 2, 26], [44, 0, 24], [-36, -28, 22], [16, -28, 23], [-10, -54, 21], [86, 4, 19], [-100, 4, 18], [60, -24, 18]].forEach(([dx, dy, r], i) => pebble(px0 + dx, py0 + dy, r, i));

    // --- the chinchilla hoovers tokens into its cheeks ---
    const cx = 740, cy = 876, s = 31, eating = t < tC + .1;
    const cheeks = .15 + .85 * ease(seg(t, 115.35, 116.2));
    const mouthP = [cx, cy - 5.75 * s];
    if (eating) {
      for (let k = 0; k < 4; k++) {                                     // a stream of tokens flying into the mouth
        const ph = frac((t - 115) * 2.4 + k / 4), a = [px0 + (hash(k) - .5) * 60, py0 - 50], m = [lerp(a[0], mouthP[0], .45), mouthP[1] - 170 - 40 * hash(k + 2)];
        const p = bez(a, m, mouthP, easeIn(ph));
        pebble(p[0], p[1], 22 * (1 - .45 * ph), k + 3);
      }
      for (let k = 0; k < 3; k++) {                                     // suction swooshes
        const a = [px0 - 20 + k * 30, py0 - 70], m = [lerp(a[0], mouthP[0], .5), mouthP[1] - 110 - k * 30], pts = [];
        for (let q = 0; q <= 5; q++) pts.push(bez(a, m, mouthP, .15 + q * .14));
        inkLine(pts, 1, mixCol(TL_PALE, PAL.cream, .5), 'inkfine', .5);
      }
    }
    const look = seg(t, tC + .05, tC + .2), startle = dropA >= 0 ? Math.exp(-dropA * 10) : 0;
    const nom = Math.abs(Math.sin(t * 24));
    CAST.chinchilla(cx, cy, s, t, { cheeks, paws: eating ? .7 + .3 * nom : .35, chew: eating ? .8 + .2 * nom : 0,
      eyes: dropA >= 0 ? 'wide' : 'normal', lookX: look, blush: true,
      dy: -Math.abs(Math.sin(bpOf(t) * TAU)) * .2 - startle * .8, sq: (eating ? .03 * nom : 0) - .08 * startle });

    // --- Clawd: watches, gets an idea, crunches itself into a tiny glowing cube, then drops through the floor ---
    const kx = 1250, ky = 876, L = 104;
    if (t < tC) {
      const ant = seg(t, tC - .22, tC - .01);                              // anticipation: stretch up tall, then CRUNCH
      clawd(kx + jit(ant * 3), ky, 27, { ...mood(t, [[115.3, 'look'], [tI + .03, 'spark', 'spark']]), lookX: -1, mouth: t < tI ? 'o' : 'grin',
        sq: -.22 * easeOut(ant), sx: 1 - .2 * ease(ant), aL: lerp(.3, 1.5, easeOut(ant)), aR: lerp(.3, 1.5, easeOut(ant)), dy: -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .6 * (1 - ant) });
    } else if (dropA < 0) {
      const heat = .7 + .5 * seg(t, tC, tD), vib = seg(t, tC + .1, tD) * 3.5;
      const sink = easeIn(seg(t, tD - .15, tD)) * 16;
      // the floor strains under the weight: a dent and spreading cracks
      paint(ellPts(kx, ky + 4 + sink * .4, 88 + sink, 15 + sink * .3, 18), { fill: TL_DKK, fillOp: 130, bleed: .2, tex: .3, ink: null });
      const cr = seg(t, tC + .05, tD);
      for (let k = 0; k < 6; k++) {
        const a = Math.PI * (k / 5) + (hash(k) - .5) * .3, len = 50 + 200 * cr * (.6 + .4 * hash(k + 3)), sd = Math.cos(a);
        inkLine([[kx + sd * 40, ky + 5], [kx + sd * len * .5 + jit(4), ky + 5 + Math.sin(a) * len * .08 + 6], [kx + sd * len, ky + 5 + Math.sin(a) * len * .16]], 1.3, PAL.ink, 'ink', .2);
      }
      // heat shimmer rays around the hot cube
      for (let k = 0; k < 10; k++) {
        const a = k / 10 * TAU + t * 2, r0 = L * .95, r1 = r0 + 26 + 18 * Math.sin(t * 20 + k);
        inkLine([[kx + Math.cos(a) * r0, ky - L / 2 + Math.sin(a) * r0], [kx + Math.cos(a) * r1, ky - L / 2 + Math.sin(a) * r1]], 1.4, GOLD, 'ink', 0);
      }
      const crunch = seg(t, tC, tC + .16);
      if (crunch < 1) paint(starPts(kx, ky - L / 2, L * (1.1 + crunch * .9), .55, 10, t * 3), { wash: PAL.cream, washOp: 255 * (1 - crunch), fill: GOLD, fillOp: 120 * (1 - crunch), ink: null });
      cube(kx + jit(vib), ky - L / 2 + sink, L * (1 + .25 * (1 - backOut(crunch * 1.4))), 0, { heat, eyes: t < tD - .18 ? 'happy' : 'scared', mouth: t < tD - .18 ? 'grin' : 'o' });
    } else {
      // gone! a cube-shaped hole with the glow shining up, flying tiles and a puff of dust
      paint(ellPts(kx, ky - 40, 150, 120, 18), { fill: GOLD, fillOp: 110 * Math.exp(-dropA * 3), bleed: .3, tex: .2, ink: null });
      paint([[kx - 64, ky - 12], [kx + 64, ky - 12], [kx + 80, ky + 22], [kx - 80, ky + 22]], { wash: '#0B1C22', ink: PAL.ink, sw: 1.3 });
      paint([[kx - 50, ky - 4], [kx + 50, ky - 4], [kx + 60, ky + 16], [kx - 60, ky + 16]], { fill: SO, fillOp: 160 * Math.exp(-dropA * 4), bleed: .2, ink: null });
      for (let k = 0; k < 4; k++) {
        const [qx, qy] = fly(kx + (k - 1.5) * 40, ky, (k - 1.5) * 420, -800 - hash(k) * 300, dropA);
        push(); translate(qx, qy); rotate((k % 2 ? 1 : -1) * dropA * 14);
        paint(rectPts(-32, -11, 64, 22, 2), { wash: '#A9C7C1', ink: PAL.ink, sw: .9 }); pop();
      }
      for (let k = 0; k < 6; k++) { const r = 30 + 70 * easeOut(dropA * 4); paint(ellPts(kx + (k - 2.5) * 48 * (1 + dropA * 3), ky - 10 - hash(k) * 30 - dropA * 90, r, r * .7, 14), { fill: '#E9E4D6', fillOp: 160 * (1 - seg(dropA, .1, .2)), bleed: .2, tex: .4, ink: null }); }
      sfx('THUNK!', kx - 10, ky - 230, 120, SO, dropA, { life: .9, rot: -.1 });
    }
    camEnd();
  }

  // =====================================================================================================
  // 4) "Breaking through each safety fence" — tracking shot, the cube tumbles through three barriers
  // =====================================================================================================
  function fences(t, lt) {
    const G = 830, Lc = 170, v = 900, tRoll = 117.18, x0 = 480;
    const hits = [B(172), B(173), B(174)];
    const cxAt = tt => x0 + Math.max(0, tt - tRoll) * v;
    const fx = hits.map(h => cxAt(h) + Lc / 2 + 10);
    const darkX = fx[2] + 260;
    // cube pose: fall in, thud, then roll as a heavy square pivoting on its leading corner
    const X = cxAt(t), r = (X - x0) / Lc, n = Math.floor(r), f = r - n;
    const land = seg(t, 117.0, 117.14);
    let ccx, ccy, crot;
    if (t < tRoll) { ccx = x0; ccy = lerp(-150, G - Lc / 2, easeIn(land)); crot = .4 * (1 - land); }
    else {
      const th = f * Math.PI / 2, px = x0 + n * Lc + Lc / 2;
      ccx = px + (-Lc / 2 * Math.cos(th) + Lc / 2 * Math.sin(th)); ccy = G + (-Lc / 2 * Math.sin(th) - Lc / 2 * Math.cos(th)); crot = r * Math.PI / 2;
    }
    const lastHit = hits.filter(h => h <= t).pop(), ha = lastHit != null ? t - lastHit : 9;
    const landA = t - 117.14;
    const sh = shakeXY(t, 22 * Math.exp(-ha * 9) + (landA > 0 ? 26 * Math.exp(-landA * 10) : 0) + 4 * Math.exp(-frac(r) * 12) * (t > tRoll ? 1 : 0));
    const camX = Math.max(x0 + 300, X + 180);

    // --- parallax background (screen space) ---
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#4E9E98', fill: TL_DK, fillOp: 80, bleed: .1, tex: .7, border: .5, ink: null });
    for (let k = -1; k < 9; k++) {                                    // far racks drift slowly
      const bx = ((k * 300 - camX * .3) % 2700 + 2700) % 2700 - 300;
      paint(rectPts(bx, 180, 200, 560, 3), { wash: '#2A6468', fill: TL_DKK, fillOp: 60, tex: .6, ink: null });
      for (let q = 0; q < 3; q++) paint(ellPts(bx + 50 + q * 50, 250 + ((k + q) % 3) * 140, 6, 6, 8), { wash: (q + k + beatN(t)) % 2 ? TL_LT : SO_LT, ink: null });
    }
    camBegin(camX + sh[0], 560 + sh[1], 1, 0);
    // near wall stripe + floor
    paint(rectPts(camX - 1200, 700, 2400, 44), { wash: SO, ink: PAL.ink, sw: .8, hatch: { d: 40, a: .8, o: { rand: .1 }, b: 'marker', c: PAL.ink, w: 1.2 } });
    paint(rectPts(camX - 1200, G - 6, 2400, 600), { wash: '#BCCFC7', fill: '#7FA39C', fillOp: 60, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw: 1.2 });
    for (let k = Math.floor((camX - 1100) / 240); k < (camX + 1100) / 240; k++) inkLine([[k * 240, G + 10], [k * 240 - 80, G + 300]], .6, '#6F8F89', 'inkfine', 0);
    // floor dents where the heavy cube has slammed down
    for (let m = 0; m <= n && t > tRoll; m++) {
      const dx = x0 + m * Lc + Lc / 2; if (Math.abs(dx - camX) > 1100) continue;
      inkLine([[dx - 30, G + 4], [dx - 5, G + 16], [dx + 12, G + 6], [dx + 34, G + 20]], 1, PAL.ink, 'ink', 0);
    }
    // the dark doorway ahead
    paint([[darkX, -200], [darkX + 3000, -200], [darkX + 3000, 1400], [darkX, 1400]], { wash: '#0C1A20', ink: null });
    paint(rectPts(darkX - 36, 150, 36, G - 150, 2), { wash: SO, ink: PAL.ink, sw: 1, hatch: { d: 28, a: -.8, o: { rand: .1 }, b: 'marker', c: PAL.ink, w: 1 } });
    paint(rectPts(darkX - 36, 120, 900, 36, 2), { wash: SO, ink: PAL.ink, sw: 1, hatch: { d: 28, a: -.8, o: { rand: .1 }, b: 'marker', c: PAL.ink, w: 1 } });

    // --- fence 1: white picket fence ---
    const age1 = t - hits[0];
    for (let p = 0; p < 6; p++) {
      const px = fx[0] - 150 + p * 60, py = G - 110;
      let [qx, qy] = [px, py], rr = 0;
      if (age1 > 0) { [qx, qy] = fly(px, py, 500 + p * 260 + hash(p) * 300, -700 - hash(p + 4) * 500, age1); rr = (p % 2 ? 1 : -1) * age1 * (8 + p * 3); }
      push(); translate(qx, qy); rotate(rr);
      paint([[-22, 110], [-22, -80], [0, -118], [22, -80], [22, 110]], { wash: PAL.cream, fill: '#D8CDB8', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
      pop();
    }
    for (const ry of [G - 170, G - 60]) {
      if (age1 < 0) paint(rectPts(fx[0] - 185, ry - 9, 370, 18, 1), { wash: '#EFE6D2', ink: PAL.ink, sw: .9 });
      else for (const side of [0, 1]) { const [qx, qy] = fly(fx[0] - 90 + side * 180, ry, 700 + side * 400, -500 - side * 200, age1); push(); translate(qx, qy); rotate(age1 * (side ? 12 : -9)); paint(rectPts(-90, -9, 180, 18, 1), { wash: '#EFE6D2', ink: PAL.ink, sw: .9 }); pop(); }
    }
    // --- fence 2: striped traffic barrier on A-frame legs, with a blinking lamp ---
    const age2 = t - hits[1];
    if (age2 < 0) {
      for (const s of [-1, 1]) { inkLine([[fx[1] + s * 60, G - 130], [fx[1] + s * 100, G]], 3, PAL.ink, 'ink', 0); inkLine([[fx[1] + s * 60, G - 130], [fx[1] + s * 20, G]], 3, PAL.ink, 'ink', 0); }
    } else for (const s of [-1, 1]) { const [qx, qy] = fly(fx[1] + s * 60, G - 60, 300 + s * 200, -300, age2); push(); translate(qx, qy); rotate(s * age2 * 6); inkLine([[0, -70], [40, 60]], 3, PAL.ink, 'ink', 0); inkLine([[0, -70], [-40, 60]], 3, PAL.ink, 'ink', 0); pop(); }
    for (const half of [0, 1]) {
      let [qx, qy] = [fx[1] - 80 + half * 160, G - 150], rr = 0;
      if (age2 > 0) { [qx, qy] = fly(qx, qy, 800 + half * 500, -900 + half * 200, age2); rr = (half ? 1 : -1) * age2 * 10; }
      push(); translate(qx, qy); rotate(rr);
      paint(rectPts(-80, -24, 160, 48, 2), { wash: PAL.cream, ink: null });
      for (let k = 0; k < 3; k++) paint([[-80 + k * 56, -24], [-52 + k * 56, -24], [-80 + k * 56 + 10, 24], [-108 + k * 56 + 10, 24]].map(([a, b]) => [clamp(a, -80, 80), b]), { wash: SO, ink: null });
      paint(rectPts(-80, -24, 160, 48, 2), { ink: PAL.ink, sw: 1.1 });
      pop();
    }
    { const lamp = age2 > 0 ? fly(fx[1], G - 205, 400, -1200, age2) : [fx[1], G - 205], on = frac(t * 3) < .5;
      if (on) paint(ellPts(lamp[0], lamp[1], 50, 50, 14), { fill: HAZ, fillOp: 110, bleed: .3, ink: null });
      paint(ellPts(lamp[0], lamp[1], 20, 18, 12), { wash: on ? HAZ : '#B8902A', ink: PAL.ink, sw: .9 });
      if (age2 < 0) inkLine([[fx[1], G - 190], [fx[1], G - 174]], 2, PAL.ink, 'ink', 0); }
    // --- fence 3: an X of yellow-and-black safety tape between two posts; bulges, then snaps and dangles ---
    const age3 = t - hits[2];
    const tapeSeg = (a, b, w = 26) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d * w / 2, ny = dx / d * w / 2;
      paint([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], { wash: HAZ, ink: PAL.ink, sw: .7, hatch: { d: 24, a: .9, o: { rand: .05 }, b: 'marker', c: PAL.ink, w: 2.2 } });
    };
    for (const sd of [-1, 1]) {
      const px = fx[2] + sd * 115;
      paint(rectPts(px - 10, G - 210, 20, 210, 1), { wash: '#3B3550', ink: PAL.ink, sw: .9 });
      paint(ellPts(px, G - 212, 16, 10, 10), { wash: SO, ink: PAL.ink, sw: .7 });
      paint(ellPts(px, G, 38, 10, 12), { wash: '#3B3550', ink: PAL.ink, sw: .9 });
    }
    const strips = [[-190, -50], [-50, -190], [-120, -120]].map(([ya, yb]) => [[fx[2] - 105, G + ya], [fx[2] + 105, G + yb]]);
    const push3 = clamp((ccx + Lc / 2 - (fx[2] - 60)) / 80);
    const drawTape = () => strips.forEach(([pa, pb], i) => {
      const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      if (age3 < 0) { const m = [mid[0] + push3 * 70, mid[1] + push3 * 20]; tapeSeg(pa, m); tapeSeg(m, pb); }
      else for (const [anchor, sd] of [[pa, -1], [pb, 1]]) {           // halves swing down and flutter from their posts
        const k = easeOut(clamp(age3 * 3)), fl = Math.sin(age3 * 30 + i + sd) * 26 * Math.exp(-age3 * 3);
        tapeSeg(anchor, [lerp(mid[0] + sd * 40, anchor[0] - sd * 30, k) + fl, lerp(mid[1], anchor[1] + 150, k)]);
      }
    });

    // splinters on every hit
    for (const [hi, h] of hits.entries()) {
      const a = t - h; if (a < 0 || a > .9) continue;
      for (let k = 0; k < 12; k++) {
        const [px, py] = fly(fx[hi], G - 90 + hash(k + hi * 20) * 60, 200 + hash(k * 3 + hi) * 1100, -300 - hash(k * 5 + hi) * 1000, a);
        push(); translate(px, py); rotate(a * (10 + k) * (k % 2 ? 1 : -1));
        paint([[-14, -3], [14, 0], [-14, 4]], { wash: hi === 1 ? (k % 2 ? SO : PAL.cream) : hi === 2 ? HAZ : '#E8DCC2', ink: PAL.ink, sw: .5 });
        pop();
      }
      for (let k = 0; k < 4; k++) { const rr = 30 + 80 * easeOut(a * 3); paint(ellPts(fx[hi] + (k - 1.5) * 50 + a * 200, G - 20 - k * 12, rr, rr * .6, 14), { fill: '#E6E0D0', fillOp: 140 * (1 - seg(a, .2, .5)), bleed: .2, tex: .4, ink: null }); }
    }
    // speed streaks behind the cube
    if (t > tRoll) for (let k = 0; k < 4; k++) inkLine([[ccx - 110 - k * 25, G - 30 - k * 36], [ccx - 260 - k * 40, G - 30 - k * 36]], 1.2, '#F7F0DE', 'inkfine', 0);
    // landing dust
    if (landA > 0 && landA < .5) for (let k = 0; k < 5; k++) { const rr = 30 + 90 * easeOut(landA * 3); paint(ellPts(x0 + (k - 2) * 60 * (1 + landA * 3), G - 20, rr, rr * .55, 14), { fill: '#E6E0D0', fillOp: 150 * (1 - seg(landA, .2, .5)), bleed: .2, tex: .4, ink: null }); }
    // a traffic cone knocked flying by the barrier hit
    { const a = t - hits[1], [qx, qy] = a > 0 ? fly(fx[1] + 150, G - 45, 900, -1100, a) : [fx[1] + 150, G - 45];
      push(); translate(qx, qy); rotate(a > 0 ? a * 9 : 0);
      paint([[-32, 45], [-8, -60], [8, -60], [32, 45]], { wash: SO, fill: SO_DK, fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 });
      paint([[-20, 5], [-13, -22], [13, -22], [20, 5]], { wash: PAL.cream, ink: null });
      paint(rectPts(-44, 40, 88, 12, 1), { wash: SO_DK, ink: PAL.ink, sw: .8 });
      pop(); }
    // the lights go out around the cube as it rolls into the dark
    const dk = seg(t, 118.86, 119.0);
    if (dk > 0) paint(rectPts(camX - 1400, -400, 2800, 2000), { wash: '#0C1A20', washOp: 235 * ease(dk), ink: null });
    // the cube itself
    const angry = t > hits[0] - .3;
    cube(ccx, ccy, Lc, crot, { eyes: angry ? 'angry' : 'narrow', mouth: angry ? 'grin' : 'flat' });
    if (dk < .3) drawTape();
    sfx('CRASH!', fx[1] + 40, G - 360, 150, SO, t - hits[1], { life: .72, rot: -.12 });
    camEnd();
  }

  // =====================================================================================================
  // 5) "Hundred thousand GPU" — flying down an endless aisle of racks; lights slam on, LEDs blink on the beat
  // =====================================================================================================
  function aisle(t, lt) {
    const F = 900, VX = 960, VY = 430, AW = 1.35, P = 1.0, tOn = B(175), camZ = lt * 5.5;
    const onD = t < tOn ? -1 : (t - tOn) * 60;                     // lights cascade down the aisle
    const litAt = z => t < tOn ? 0 : clamp((onD - z) / 3) * (t - tOn < .05 || (t - tOn > .1 && t - tOn < .13) ? .3 : 1);
    const fog = '#BFE8E0';
    const pr = (X, Y, Z) => [VX + X * F / Z, VY - Y * F / Z];
    const beatK = pulse(t, 5);

    // back haze at the vanishing point
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#0D2128', ink: null });
    const glowK = t < tOn ? .15 : clamp((t - tOn) * 4);
    paint(ellPts(VX, VY, 520, 380, 24), { fill: fog, fillOp: 150 * glowK, bleed: .35, tex: .3, border: .2, ink: null });
    paint(ellPts(VX, VY, 160, 120, 20), { fill: PAL.cream, fillOp: 170 * glowK, bleed: .3, tex: .2, ink: null });

    // floor + ceiling bands and the racks, far to near
    const k0 = Math.floor(camZ / P), leds = [];
    for (let k = k0 + 34; k >= k0; k--) {
      const z0 = k * P - camZ, z1 = z0 + P * .92;
      if (z1 < .9) continue;
      const za = Math.max(z0, .9), lit = litAt(za), fd = clamp((za - 4) / 28);
      const rackCol = mixCol(mixCol('#0E2229', '#2F7B7C', lit), mixCol('#0E2229', fog, lit), fd * .85);
      const fcol = mixCol(mixCol('#0B1A1F', k % 2 ? '#9CC3BA' : '#86B3AA', lit), mixCol('#0B1A1F', fog, lit), fd * .85);
      paint([pr(-AW, -1, za), pr(AW, -1, za), pr(AW, -1, z1), pr(-AW, -1, z1)], { wash: fcol, ink: null });
      paint([pr(-AW, 1.9, za), pr(AW, 1.9, za), pr(AW, 1.9, z1), pr(-AW, 1.9, z1)], { wash: mixCol('#081418', '#1E4A50', lit * (1 - fd * .5)), ink: null });
      if (lit > .5) paint([pr(-.35, 1.9, za + .2), pr(.35, 1.9, za + .2), pr(.35, 1.9, za + .55), pr(-.35, 1.9, za + .55)], { wash: PAL.cream, ink: null });
      for (const side of [-1, 1]) {
        paint([pr(side * AW, -1, za), pr(side * AW, 1.6, za), pr(side * AW, 1.6, z1), pr(side * AW, -1, z1)], { wash: rackCol, ink: fd < .5 ? PAL.ink : null, sw: .7 });
        // LEDs: two columns of server lights per rack, blinking on the beat
        if (za < 11) for (let c = 0; c < 2; c++) for (let rr = 0; rr < 5; rr++) {
          const zz = za + (.22 + c * .45) * P, yy = 1.25 - rr * .45;
          if (zz > z1) continue;
          const q = pr(side * AW, yy, zz), sz = 26 / zz;
          const blink = hash(k * 31 + c * 7 + rr + side * 3 + beatN(t) * 13) > .4;
          const col = (rr + c + k) % 4 === 0 ? SO_LT : blink ? '#A8FFE2' : '#2E8E7E';
          paint(ellPts(q[0], q[1], sz * .55 * (1 + .5 * beatK * (blink ? 1 : 0)), sz, 8), { wash: col, ink: null });
          if (blink && zz < 3.2) leds.push([q[0], q[1], sz, col]);
        }
      }
    }
    // glow halos on the nearest blinking lights (drawn together, after the racks)
    for (const [x, y, sz, col] of leds) paint(ellPts(x, y, sz * 1.6, sz * 2.2, 10), { fill: col, fillOp: 70 + 90 * beatK, bleed: .3, tex: .2, border: .1, ink: null });
    // safety-orange floor stripes along the rack bases
    for (const side of [-1, 1]) inkLine([pr(side * (AW - .12), -1, 1.0), pr(side * (AW - .12), -1, 40)], 3, SO, 'ink', 0);
    // darkness before the lights, with the LEDs glowing through
    if (t < tOn) paint(rectPts(-60, -60, W + 120, H + 120), { fill: '#050C10', fillOp: 110, bleed: .05, tex: .3, ink: null });

    // Clawd (or the cube) flies down the aisle ahead of the camera
    const popK = seg(t, tOn, tOn + .18);
    if (popK <= 0) {
      const bob = Math.sin(t * 9) * 10, cr = seg(t, tOn - .25, tOn);   // the cube rattles, about to burst
      cube(960 + jit(cr * 6), 700 + bob, 110 * (1 + .12 * cr), Math.sin(t * 5) * .15 * (1 - cr), { eyes: 'narrow', mouth: cr > .3 ? 'grin' : 'flat', heat: 1.2 + cr });
    } else {
      const grow = 1 + .23 * backOut(seg(t, B(176) - .08, B(176) + .1)) + .23 * backOut(seg(t, B(177) - .2, B(177) - .05));
      const u = 22 * grow * backOut(popK), gy = 900 + Math.sin(t * 7) * 12;
      // compute streams: thin gold threads from the racks pour into Clawd
      for (let k = 0; k < 6; k++) {
        const side = k % 2 ? 1 : -1, row = k >> 1, a = pr(side * AW, 1.1 - row * .55, 1.8 + row * 1.1), b = [960 + side * 1.5 * u, gy - 5 * u];
        const m = [lerp(a[0], b[0], .55), lerp(a[1], b[1], .5) - 90], pts = [];
        for (let q = 0; q <= 6; q++) pts.push(bez(a, m, b, q / 6));
        inkLine(pts, 1.3, GOLD, 'inkfine', .5);
        for (const o of [0, .5]) { const d = bez(a, m, b, frac(t * 2.4 + k * .37 + o)); glowDot(d[0], d[1], 7, GOLD, 120); }
      }
      paint(ellPts(960, gy - 4.5 * u, 7.5 * u, 6.5 * u, 22), { fill: GOLD, fillOp: 70 + 60 * beatK, bleed: .35, tex: .2, border: .1, ink: null });
      const m = move('roof', t);
      clawd(960, gy, u, { ...m, dy: m.dy - 1, noShadow: true, eyes: 'spark', mouth: 'grin', blush: true, aL: 1.0 + .3 * Math.sin(t * 8), aR: 1.0 - .3 * Math.sin(t * 8) });
      // burst ring as the cube pops open
      if (popK < 1) {
        paint(starPts(960, 700, 120 + 260 * popK, .5, 12, t), { wash: PAL.cream, washOp: 255 * (1 - popK), fill: GOLD, fillOp: 100 * (1 - popK), ink: null });
        for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, r0 = 60 + 340 * popK, r1 = r0 + 90; inkLine([[960 + Math.cos(a) * r0, 700 + Math.sin(a) * r0], [960 + Math.cos(a) * r1, 700 + Math.sin(a) * r1]], 2.2, GOLD, 'ink', 0); }
      }
    }
    // wind lines rushing past
    for (let k = 0; k < 10; k++) {
      const a = hash(k) * TAU, ph = frac(t * 1.6 + hash(k + 9)), r0 = 200 + ph * 900, r1 = r0 + 120 + ph * 200;
      inkLine([[VX + Math.cos(a) * r0, VY + Math.sin(a) * r0 * .7], [VX + Math.cos(a) * r1, VY + Math.sin(a) * r1 * .7]], .9, mixCol('#0D2128', PAL.cream, glowK * .8), 'inkfine', 0);
    }
    // overloaded with compute: Clawd blazes into a gold flash that carries us into the studio
    const blaze = easeIn(seg(t, 120.6, 120.9));
    if (blaze > 0) {
      const by = 900 - 4.5 * 22 * 1.46;
      paint(starPts(960, by, 90 + 2300 * blaze, .55, 14, t * 2), { wash: GOLD, fill: SO_LT, fillOp: 70, bleed: .15, tex: .4, ink: null });
      paint(starPts(960, by, 40 + 2000 * blaze, .6, 14, -t * 2), { wash: '#FFF0C8', ink: null });
    }
  }

  // =====================================================================================================
  // 6) "RLHF goes askew" — a panel of Researcher clones with thumb paddles; they spin, the frame tilts, red flood
  // =====================================================================================================
  const thumb = (r, up, sw) => {
    push(); if (!up) rotate(Math.PI);
    paint(rrPts(-.5 * r, -.1 * r, .95 * r, .72 * r, .22 * r), { wash: PAL.cream, ink: PAL.ink, sw });
    paint(rrPts(-.44 * r, -.8 * r, .34 * r, .78 * r, .16 * r), { wash: PAL.cream, ink: PAL.ink, sw });
    for (const k of [.12, .32]) inkLine([[-.04 * r, k * r], [.4 * r, k * r]], sw * .6, PAL.ink, 'inkfine', 0);
    pop();
  };
  // a thumb paddle: disk on a stick. flipPh = rotation about the stick (cos>0 shows thumbs-up), spinA = propeller spin
  const paddleShape = (flipPh, spinA, R, sw) => {
    inkLine([[0, 0], [0, -1.55 * R]], sw * 2.4, '#8A5A3C', 'ink', 0);
    push(); translate(0, -1.55 * R - R); rotate(spinA);
    const c = Math.cos(flipPh), up = c >= 0;
    scale(Math.max(.08, Math.abs(c)), 1);
    paint(ellPts(0, 0, R, R, 22), { wash: up ? '#7DBB6A' : '#E0566A', fill: up ? PAL.sap : ALARM, fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .9 });
    thumb(R * .95, up, sw * .75);
    pop();
  };
  // held in a researcher hand hook: undo the arm angle so the stick stays upright
  const paddle = (armA, flipPh, spinA, s) => (ss, sw) => { rotate(armA); paddleShape(flipPh, spinA, 2.4 * ss, sw); };

  function rlhf(t, lt) {
    const b0 = B(177), b1 = B(178), b2 = B(179), b3 = B(180);
    const rot = kf(t, [[b2 - .05, 0], [b2 + .35, .16], [b3, .3], [b3 + .45, .5], [123.5, .55]], ease) + (t > b2 ? Math.sin(t * 30) * .01 : 0);
    const sh = shakeXY(t, t > b2 ? 6 : 3 * pulse(t, 8));
    const z = 1.16 + .04 * ease(lt / 1.2) - .1 * ease(seg(t, b2, 123.5));
    camBegin(1000 + sh[0] + 60 * ease(seg(t, b2, 123.5)), 575 + sh[1], z, rot);

    // studio: teal sunburst backdrop, stage spots, floor
    paint(rectPts(-900, -900, W + 1800, 1800), { wash: '#4EA39C', ink: null });
    sunburst(1000, 330, '#8FD6CA', '#2F807A', t * .15 + (t > b1 ? (t - b1) ** 2 * 2 : 0), 16, 2600, 200);
    paint(rectPts(-900, 776, W + 1800, 22), { wash: SO, ink: PAL.ink, sw: .8, hatch: { d: 40, a: .8, o: { rand: .1 }, b: 'marker', c: PAL.ink, w: 1.2 } });
    paint([[-900, 796], [W + 900, 796], [W + 900, 1900], [-900, 1900]], { wash: '#D9CDB5', fill: WOOD_DK, fillOp: 40, bleed: .05, tex: .7, border: .5, ink: PAL.ink, sw: 1.3 });
    for (let i = -9; i <= 9; i++) inkLine([[1000 + i * 170, 798], [1000 + i * 170 * 1.8, 1500]], .55, '#A89A80', 'inkfine', 0);
    const slideJ = 2900 * easeIn(seg(t, b3 - .2, 123.3)), slideC = 2900 * easeIn(seg(t, b2 + .2, b3 + .3));

    // judges: four Researcher clones behind a long desk, each with a thumb paddle
    const tableX = 860 + slideJ, tableY = 640, s = 22;
    const judgeX = j => tableX + j * 250;
    const tFly = b2 + .3;                                                  // one paddle helicopters off
    const hands = [];
    for (let j = 0; j < 4; j++) {
      const x = judgeX(j);
      // flips: mixed verdicts, all flip to thumbs-up on beat 1, then the flipping speeds up and goes wild
      let ph;
      if (t < b1 - .04) ph = j % 2 ? Math.PI : 0;
      else if (t < b1 + .12) ph = lerp(j % 2 ? Math.PI : 0, TAU, ease(seg(t, b1 - .04, b1 + .1)));
      else { const g = t - (b1 + .12); ph = (g * g * 14 + g * 5) * (1 + j * .15) + j; }
      const spin = t > b2 ? (t - b2) ** 2 * 22 * (j % 2 ? 1 : -1) : 0;
      const dizzy = t > b1 + .45;
      const bob = -Math.abs(Math.sin((bpOf(t) + j * .25) * Math.PI)) * .3;
      const armA = 1.12 + .1 * Math.sin(t * 9 + j) + (t < b1 ? .12 * pulse(t, 6) : 0);
      const gone = j === 2 && t > tFly;
      researcher(x, 770, s, { noShadow: true, dy: bob, rot: t > b3 ? -(t - b3) * 1.5 : 0, eyes: dizzy ? 'swirl' : 'dot', lookX: t < b1 ? -1 : 0,
        mouth: dizzy ? 'wobble' : (Math.cos(ph) >= 0 ? 'smile' : 'flat'), brows: dizzy ? 'worried' : (Math.cos(ph) >= 0 ? 'up' : null),
        aL: gone ? 2.4 : -.9, aR: gone ? 2.5 : armA, hairUp: dizzy ? .6 : 0, emote: gone ? '!!' : null, emoteK: seg(t, tFly, tFly + .15),
        handR: gone ? null : paddle(armA, ph, spin, s) });
      hands.push([x + 1.75 * s + 3.2 * s * Math.cos(armA), 770 - 7.6 * s - 3.2 * s * Math.sin(armA) - 1.55 * 2.4 * s - 2.4 * s]);
    }
    // desk (in front of the judges' laps)
    paint(rrPts(tableX - 170, tableY, 1120, 170, 14, 3), { wash: SO, fill: SO_DK, fillOp: 60, bleed: .05, tex: .6, border: .5, ink: PAL.ink, sw: 1.3 });
    paint(rectPts(tableX - 190, tableY - 16, 1160, 26, 2), { wash: TL_DK, ink: PAL.ink, sw: 1 });
    paint(rectPts(tableX - 170, tableY + 128, 1120, 30, 2), { wash: HAZ, ink: PAL.ink, sw: .8, hatch: { d: 34, a: .8, o: { rand: .1 }, b: 'marker', c: PAL.ink, w: 1.4 } });
    for (let j = 0; j < 4; j++) {                                                                   // a lit reward button per seat
      const bx = judgeX(j) + 20, lit = t > b1 - .04 || j % 2 === 0;
      paint(ellPts(bx, tableY + 66, 38, 38, 18), { wash: TL_DK, ink: PAL.ink, sw: .9 });
      push(); translate(bx, tableY + 66); scale(1, t > b2 ? Math.cos(t * 25 + j) : 1); thumb(30, lit, .8); pop();
    }
    for (let j = 0; j < 4; j++) {                                                                   // coffee mugs
      const mx = judgeX(j) - 70, spill = t > b2 + .1;
      paint(rrPts(mx - 20, tableY - 52, 40, 38, 6), { wash: PAL.cream, ink: PAL.ink, sw: .7 });
      if (spill) paint(ellPts(mx + 30, tableY - 10, 30 + 20 * seg(t, b2 + .1, b2 + .5), 7, 12), { wash: '#7A5236', ink: null });
    }

    // Clawd dances for approval, soaks up the hearts, then slides downhill into the desk and everyone goes
    const u = 32, deskL = tableX - 190;
    const style = t < b1 ? 'bounce' : t < b2 ? 'roof' : 'shimmy';
    const m = move(style, t);
    const sliding = t > b2 + .2;
    const cx = Math.min(420 + slideC, deskL - 4.6 * u), bump = t > b2 + .2 && 420 + slideC > deskL - 4.6 * u;
    const md = mood(t, [[120.8, 'happy'], [b1 + .02, 'spark', 'heart'], [b2 + .1, 'swirl'], [b3 - .25, 'scared', '!!']]);
    const hk = t > b1 ? Math.exp(-(t - b1) * 3) : 0;
    clawd(cx + (sliding ? 0 : m.dx * u), 900, u * (1 + .08 * hk), { ...m, ...md, mouth: sliding ? 'O' : 'grin', blush: !sliding,
      sq: (m.sq || 0) + (bump ? .12 : 0), rot: sliding ? -.35 * ease(seg(t, b2 + .2, b2 + .5)) : m.rot,
      aL: sliding ? 1.4 + .3 * Math.sin(t * 30) : m.aL, aR: sliding ? 1.4 - .3 * Math.sin(t * 30) : m.aR, walk: sliding ? t * 6 : m.walk });
    // reward! hearts fly from every thumbs-up paddle into Clawd
    for (let j = 0; j < 4; j++) {
      const hp = seg(t, b1 + .06 + j * .05, b1 + .42 + j * .05);
      if (hp <= 0 || hp >= 1) continue;
      const a = hands[j], b = [cx, 900 - 6 * u], mm = [lerp(a[0], b[0], .5), Math.min(a[1], b[1]) - 180];
      const p = bez(a, mm, b, easeIn(hp)), r = 34 * (1 - .5 * hp);
      paint(heartPts(p[0], p[1], r), { wash: PAL.rose, fill: '#E05A7A', fillOp: 60, ink: PAL.ink, sw: .8 });
    }

    // the loose paddle helicopters off toward the camera
    if (t > tFly) {
      const age = t - tFly, [qx, qy] = fly(hands[2][0], hands[2][1] + 2.4 * s * 2.5, -900, -1300, age, 1500);
      push(); translate(qx, qy); rotate(age * 16); scale(1 + age * 2.2);
      paddleShape(age * 40, 0, 2.4 * s, 1.2); pop();
    }
    camEnd();

    // arrive through the last of the gold flash from the aisle
    flash(1 - ease(seg(lt, 0, .2)), '#FFF0C8');
    // the empty tilted frame floods with alarm red
    const fl = seg(t, b3 + .05, 123.46);
    if (fl > 0) {
      const lvl = lerp(H + 80, -140, easeIn(fl) * .6 + fl * .4), pts = [];
      for (let k = 0; k <= 10; k++) pts.push([-80 + k * (W + 160) / 10, lvl + Math.sin(k * 1.3 + t * 14) * 26]);
      pts.push([W + 80, H + 80], [-80, H + 80]);
      paint(pts, { wash: ALARM, fill: '#8E1426', fillOp: 90, bleed: .1, tex: .7, border: .5, ink: '#7A1020', sw: 1.2, curv: .4 });
    }
    flash(seg(t, 123.3, 123.5), ALARM);
  }

  chapter('scale', 109.4, 123.5, [[109.4, tower], [113.5, disobey], [115.5, chinchillaShot], [117.0, fences], [119.0, aisle], [120.9, rlhf]]);
})();
