// clawd.js: the painted Clawd. Same blocky silhouette (10x6 body, four stubby legs, two slit eyes),
// rendered as watercolor + ink. `u` is the body unit (body is 10u wide, 8u tall including legs).
// (x, y) is the point on the ground between the feet.
//
// Body-local coordinates (used by the o.draw / o.armL / o.armR hooks):
//   body spans x -5u..5u, y -8u..-2u; eyes sit at x -3u and 2u (each 1u wide), y -7u..-5u; legs reach y 0.
//   Arms pivot at (±4.9u, -4.5u) and are 2.2u long; o.armL / o.armR are called at the arm TIP in arm space
//   (x runs along the arm, outward), so a held prop just draws around (0, 0).

function clawd(x, y, u, o = {}) {
  const dy = (o.dy || 0) * u, sq = (o.sq || 0) + (o.take || 0);
  const sw = clamp(u / 15, .45, 2.4) * (o.swMul || 1), J = u * .07;
  const col = o.col || PAL.clay, dk = o.dk || PAL.clayDk, lt = o.lt || '#F5B394';

  if (!o.noShadow) {
    const f = 1 - Math.min(.5, Math.abs(o.dy || 0) * .06);
    paint(ellPts(x, y + u * .15, u * 5.6 * f, u * 1 * f, 22), { fill: PAL.ink, fillOp: 90, bleed: .25, tex: .3, border: .1, ink: null });
  }

  push();
  translate(x, y + dy);
  if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));

  // legs (drawn first so the body overlaps their tops)
  if (!o.noLegs) [-4, -2, 1, 3].forEach((lx, i) => {
    let h = 2.2;
    if (o.walk != null) { const ph = Math.sin((o.walk + (i % 2 ? .5 : 0)) * TAU); if (ph > 0) h = 2.2 - ph * .9; }
    paint(rectPts(lx * u, -2.4 * u, u, h * u, J * .6), { wash: dk, washOp: 255, ink: PAL.ink, sw: sw * .8 });
  });

  // arms
  const arm = (side, a, hook) => {
    push(); translate(side * 4.9 * u, -4.5 * u); rotate(side < 0 ? a : -a);
    paint(rectPts(side < 0 ? -2.2 * u : 0, -.5 * u, 2.2 * u, u, J * .6), { wash: col, washOp: 255, fill: dk, fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .8 });
    if (hook) { translate(side * 2.2 * u, 0); if (side < 0) scale(-1, 1); hook(u, sw); }
    pop();
  };
  arm(-1, o.aL ?? .2, o.armL); arm(1, o.aR ?? .2, o.armR);

  const lid = o.lid || 0;
  if (lid > .01) {
    // lunchbox mouth: the top 2.9u of the body hinges open at the back-left corner
    const hy = -5.1 * u;
    paint(rectPts(-5 * u, hy, 10 * u, 3.1 * u, J), { wash: col, washOp: 255, ink: null });
    paint(rectPts(-4.8 * u, -3.8 * u, 9.6 * u, 1.6 * u, J), { fill: dk, fillOp: 120, bleed: .03, tex: .7, border: .5, ink: null });
    paint(rectPts(-4.4 * u, hy - .2 * u, 8.8 * u, 1.3 * u, J * .5), { wash: '#4A1F2A', ink: null });           // throat
    paint(ellPts(0, hy + .6 * u, 2.4 * u, .45 * u, 14), { wash: PAL.rose, ink: null });                         // tongue
    for (let i = 0; i < 6; i++) { const tx = -4.2 * u + i * 1.6 * u; paint([[tx, hy - .1 * u], [tx + 1.3 * u, hy - .1 * u], [tx + .65 * u, hy + .8 * u]], { wash: PAL.cream, ink: PAL.ink, sw: sw * .45 }); }
    paint(rectPts(-5 * u, hy, 10 * u, 3.1 * u, J), { ink: PAL.ink, sw });
    push(); translate(-5 * u, hy); rotate(-lid * 1.25); translate(5 * u, -hy);
    paint(rectPts(-5 * u, -8 * u, 10 * u, 2.9 * u, J), { wash: col, washOp: 255, ink: null });
    paint(ellPts(-1.6 * u, -6.9 * u, 3.2 * u, 1 * u, 16, J), { fill: lt, fillOp: 110, bleed: .15, tex: .8, border: .8, ink: null });
    for (let i = 0; i < 6; i++) { const tx = -4.2 * u + i * 1.6 * u; paint([[tx, hy + .1 * u], [tx + 1.3 * u, hy + .1 * u], [tx + .65 * u, hy - .8 * u]], { wash: PAL.cream, ink: PAL.ink, sw: sw * .45 }); }
    paint(rectPts(-5 * u, -8 * u, 10 * u, 2.9 * u, J), { ink: PAL.ink, sw });
    eyes(u, o, sw);
    hat(u, o.hat, sw);
    pop();
  } else {
    // body: flat base so it reads, a lighter pool up top and a darker settle along the bottom, ink last
    const body = rectPts(-5 * u, -8 * u, 10 * u, 6 * u, J);
    paint(body, { wash: col, washOp: 255, ink: null });
    paint(ellPts(-1.6 * u, -6.4 * u, 3.4 * u, 1.5 * u, 18, J * 2, -.08), { fill: lt, fillOp: 120, bleed: .2, tex: .85, border: .8, ink: null });
    paint(rectPts(-4.8 * u, -3.8 * u, 9.6 * u, 1.6 * u, J), { fill: dk, fillOp: 120, bleed: .03, tex: .7, border: .5, ink: null });
    paint(body, { ink: PAL.ink, sw });

    if (o.blush) for (const bx of [-3.6, 3.6]) paint(ellPts(bx * u, -4.6 * u, u * .8, u * .4, 14), { fill: PAL.rose, fillOp: 150, bleed: .2, ink: null });
    if (o.hat === 'mask') paint([[-5.5 * u, -7.7 * u], [5.5 * u, -7.7 * u], [4.4 * u, -4.7 * u], [.6 * u, -5.4 * u], [-.6 * u, -5.4 * u], [-4.4 * u, -4.7 * u]], { wash: PAL.violet, ink: PAL.ink, sw: sw * .7 });
    eyes(u, o, sw);
    mouth(u, o.mouth, sw);
    hat(u, o.hat, sw);
  }
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 5.4 * u, y + dy - 8.6 * u, u * .9, o.emoteK ?? 1);
}

function mouth(u, m, sw) {
  if (!m) return;
  if (m === 'o') paint(ellPts(0, -4.3 * u, u * .45, u * .5, 12), { wash: PAL.ink, ink: null });
  else if (m === 'O') paint(ellPts(0, -4.1 * u, u * .8, u * .95, 14), { wash: '#4A1F2A', ink: PAL.ink, sw: sw * .6 });
  else if (m === 'smile') inkLine([[-.8 * u, -4.6 * u], [0, -4.1 * u], [.8 * u, -4.6 * u]], sw * .8, PAL.ink, 'ink', .6);
  else if (m === 'grin') paint([[-1.3 * u, -4.8 * u], [1.3 * u, -4.8 * u], [.9 * u, -3.9 * u], [-.9 * u, -3.9 * u]], { wash: '#4A1F2A', ink: PAL.ink, sw: sw * .6, curv: .3 });
  else if (m === 'flat') inkLine([[-.7 * u, -4.4 * u], [.7 * u, -4.4 * u]], sw * .8, PAL.ink, 'ink', 0);
  else if (m === 'wobble') inkLine([[-1 * u, -4.4 * u], [-.5 * u, -4.7 * u], [0, -4.4 * u], [.5 * u, -4.7 * u], [1 * u, -4.4 * u]], sw * .7, PAL.ink, 'ink', .3);
  else if (m === 'cat') inkLine([[-.9 * u, -4.5 * u], [-.45 * u, -4.1 * u], [0, -4.5 * u], [.45 * u, -4.1 * u], [.9 * u, -4.5 * u]], sw * .7, PAL.ink, 'ink', .5);
}

function eyes(u, o, sw) {
  const e = o.eyes || 'normal', sqz = clamp(o.squint || 0);
  const blink = e === 'normal' && ((T * .9 + (o.seed || 0) * 1.7) % 3.3) < .12;
  if (sqz > .8) { for (const ex of [-3, 2]) inkLine([[ex * u - .3 * u, -5.9 * u], [ex * u + 1.3 * u, -5.9 * u]], sw, PAL.ink, 'ink', 0); return; }
  if (sqz > 0) { push(); translate(0, -6 * u); scale(1 + sqz * .15, 1 - sqz); translate(0, 6 * u); }
  if (e === 'shades') {
    paint(rrPts(-4.6 * u, -7.5 * u, 9.2 * u, 2.2 * u, .6 * u), { wash: PAL.ink, ink: null });
    inkLine([[-3.9 * u, -7 * u], [-2.4 * u, -7.1 * u]], sw * .5, PAL.cream, 'inkfine', 0);
  } else for (const ex of [-3, 2]) {
    const X = ex * u, Y = -7 * u, cx = X + .5 * u;
    if (e === 'normal' || e === 'look') {
      const lx = e === 'look' ? (o.lookX || 0) * u * .5 : 0, ly = e === 'look' ? (o.lookY || 0) * u * .4 : 0;
      if (blink) inkLine([[X - .2 * u, Y + 1.5 * u], [X + 1.2 * u, Y + 1.5 * u]], sw, PAL.ink, 'ink', 0);
      else {
        paint(rectPts(X + lx, Y + ly, u, 2 * u, u * .04), { wash: PAL.ink, ink: null });
        if (u > 9) paint(ellPts(X + lx + .32 * u, Y + ly + .42 * u, u * .17, u * .24, 10), { wash: PAL.cream, washOp: 230, ink: null });
      }
    } else if (e === 'happy') inkLine([[X - .4 * u, Y + 1.7 * u], [cx, Y + .5 * u], [X + 1.4 * u, Y + 1.7 * u]], sw * 1.3, PAL.ink, 'ink', .2);
    else if (e === 'closed') inkLine([[X - .4 * u, Y + 1.2 * u], [cx, Y + 1.6 * u], [X + 1.4 * u, Y + 1.2 * u]], sw * 1.2, PAL.ink, 'ink', .4);
    else if (e === 'wink') { if (ex < 0) inkLine([[X - .4 * u, Y + 1.7 * u], [cx, Y + .5 * u], [X + 1.4 * u, Y + 1.7 * u]], sw * 1.3, PAL.ink, 'ink', .2); else paint(rectPts(X, Y, u, 2 * u, u * .04), { wash: PAL.ink, ink: null }); }
    else if (e === 'narrow') paint(rectPts(X - .1 * u, Y + .9 * u, 1.2 * u, .7 * u, u * .03), { wash: PAL.ink, ink: null });
    else if (e === 'angry') paint([[X - .2 * u, Y + (ex < 0 ? .3 : 1) * u], [X + 1.2 * u, Y + (ex < 0 ? 1 : .3) * u], [X + 1.2 * u, Y + 2 * u], [X - .2 * u, Y + 2 * u]], { wash: PAL.ink, ink: null });
    else if (e === 'scared') {
      paint(ellPts(cx, Y + u, u * .95, u * 1.15, 16), { wash: PAL.cream, ink: PAL.ink, sw: sw * .6 });
      paint(ellPts(cx + (o.lookX || 0) * u * .3, Y + 1.1 * u, u * .32, u * .42, 10), { wash: PAL.ink, ink: null });
    } else if (e === 'spark') {
      paint(ellPts(cx, Y + u, u * 1.5, u * 1.5, 18), { fill: PAL.ochre, fillOp: 90, bleed: .3, ink: null });
      paint(starPts(cx, Y + u, u * 1.35 * (1 + .12 * Math.sin(T * 14))), { wash: PAL.cream, fill: PAL.ochre, fillOp: 80, ink: PAL.ink, sw: sw * .55 });
    } else if (e === 'red') {
      paint(ellPts(cx, Y + u, u * 1.7, u * 1.7, 18), { fill: '#E0283F', fillOp: 110, bleed: .35, ink: null });
      paint(rectPts(X - .1 * u, Y, 1.2 * u, 2 * u, u * .05), { wash: '#FF2F4A', ink: PAL.ink, sw: sw * .5 });
    } else if (e === 'heart') {
      const hp = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); hp.push([cx + hx * u * .055, Y + u + hy * u * .055]); }
      paint(hp, { wash: '#E2476E', ink: PAL.ink, sw: sw * .5 });
    } else if (e === 'x') {
      inkLine([[X - .3 * u, Y + .2 * u], [X + 1.3 * u, Y + 1.8 * u]], sw, PAL.ink, 'ink', 0);
      inkLine([[X + 1.3 * u, Y + .2 * u], [X - .3 * u, Y + 1.8 * u]], sw, PAL.ink, 'ink', 0);
    } else if (e === 'swirl') {
      const sp = []; for (let k = 0; k < 16; k++) { const a = k * .7 + T * 6 * (ex < 0 ? 1 : -1), r = k * .06 * u; sp.push([cx + Math.cos(a) * r, Y + u + Math.sin(a) * r]); }
      inkLine(sp, sw * .6, PAL.ink, 'inkfine', .6);
    } else if (e === 'dot') paint(ellPts(cx, Y + u, u * .45, u * .55, 12), { wash: PAL.ink, ink: null });
  }
  if (sqz > 0) pop();
}

function hat(u, h, sw) {
  if (!h || h === 'mask') return;
  if (h === 'party') {
    paint([[-1.8 * u, -7.9 * u], [0, -12.8 * u], [1.8 * u, -7.9 * u]], { wash: PAL.rose, fill: PAL.violet, fillOp: 50, ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(0, -12.8 * u, u * .75, u * .75, 12), { wash: PAL.ochre, ink: PAL.ink, sw: sw * .6 });
  } else if (h === 'hard') {
    const d = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; d.push([Math.cos(a) * 3.5 * u, -8 * u + Math.sin(a) * 3.3 * u]); }
    paint(d, { wash: '#F2C53D', ink: PAL.ink, sw: sw * .8 });
    paint(rectPts(-4.9 * u, -8.6 * u, 9.8 * u, .9 * u), { wash: '#F2C53D', ink: PAL.ink, sw: sw * .8 });
  } else if (h === 'crown') {
    paint([[-3 * u, -7.9 * u], [-3 * u, -10.8 * u], [-1.5 * u, -9.3 * u], [0, -11.2 * u], [1.5 * u, -9.3 * u], [3 * u, -10.8 * u], [3 * u, -7.9 * u]], { wash: '#F2C53D', fill: PAL.ochre, fillOp: 90, ink: PAL.ink, sw: sw * .8 });
    for (const gx of [-1.5, 0, 1.5]) paint(ellPts(gx * u, -8.7 * u, u * .3, u * .3, 8), { wash: gx ? PAL.teal : PAL.rose, ink: null });
  } else if (h === 'halo') {
    brush.noFill(); brush.noWash(); brush.noHatch(); brush.set('ink', PAL.ochre, sw * 1.4);
    brush.beginShape(0); for (const p of ellPts(0, -10.4 * u, 3.2 * u, .8 * u, 20)) brush.vertex(p[0], p[1]); brush.endShape(true);
  } else if (h === 'wizard' || h === 'hood') {
    paint([[-3.9 * u, -7.9 * u], [.9 * u, -15 * u], [3.9 * u, -7.9 * u]], { wash: h === 'hood' ? PAL.violet : PAL.indigo, fill: PAL.violet, fillOp: 80, ink: PAL.ink, sw: sw * .8 });
    paint(starPts(.2 * u, -10.6 * u, u * .9, .4, 5), { wash: PAL.ochre, ink: null });
    if (h === 'hood') paint(starPts(-1.2 * u, -8.9 * u, u * .5, .4, 4), { wash: PAL.cream, ink: null });
  } else if (h === 'top') {
    paint(rectPts(-2.6 * u, -12.5 * u, 5.2 * u, 4.3 * u), { wash: PAL.ink, ink: null });
    paint(rectPts(-2.6 * u, -9.4 * u, 5.2 * u, .8 * u), { wash: '#C8324A', ink: null });
    paint(rectPts(-3.9 * u, -8.6 * u, 7.8 * u, .8 * u), { wash: PAL.ink, ink: null });
  } else if (h === 'fedora') {
    paint([[-2.8 * u, -8.3 * u], [-2.3 * u, -10.8 * u], [0, -10.2 * u], [2.3 * u, -10.8 * u], [2.8 * u, -8.3 * u]], { wash: '#3B3550', ink: PAL.ink, sw: sw * .8, curv: .3 });
    paint(rectPts(-2.8 * u, -9.2 * u, 5.6 * u, .8 * u), { wash: '#C8324A', ink: null });
    paint(ellPts(0, -8.2 * u, 4.6 * u, .6 * u, 20), { wash: '#3B3550', ink: PAL.ink, sw: sw * .8 });
  } else if (h === 'band' || h === 'sweatband') {
    paint(rectPts(-5.1 * u, -8.2 * u, 10.2 * u, .95 * u), { wash: h === 'band' ? '#D8394E' : PAL.cream, ink: PAL.ink, sw: sw * .5 });
    if (h === 'sweatband') for (let i = 0; i < 4; i++) inkLine([[-4 * u + i * 2.6 * u, -8.1 * u], [-3.6 * u + i * 2.6 * u, -7.4 * u]], sw * .4, '#D8394E', 'inkfine', 0);
  } else if (h === 'cat') {
    for (const s of [-1, 1]) {
      paint([[s * 4.9 * u, -7.9 * u], [s * 4.3 * u, -11 * u], [s * 1.9 * u, -7.9 * u]], { wash: PAL.clay, ink: PAL.ink, sw: sw * .8 });
      paint([[s * 4.2 * u, -8.1 * u], [s * 4 * u, -10 * u], [s * 2.8 * u, -8.1 * u]], { wash: PAL.rose, ink: null });
    }
    for (const s of [-1, 1]) for (const k of [-.3, .3]) inkLine([[s * 4 * u, -4.7 * u + k * u], [s * 6.4 * u, -4.9 * u + k * 2 * u]], sw * .4, PAL.ink, 'inkfine', 0);
  } else if (h === 'masq') {
    paint([[-5.2 * u, -7.3 * u], [-2.4 * u, -8 * u], [0, -7.1 * u], [2.4 * u, -8 * u], [5.2 * u, -7.3 * u], [4.2 * u, -5.2 * u], [1.4 * u, -5.3 * u], [0, -6 * u], [-1.4 * u, -5.3 * u], [-4.2 * u, -5.2 * u]], { wash: PAL.violet, fill: PAL.rose, fillOp: 60, ink: PAL.ink, sw: sw * .7, curv: .3 });
    for (const ex of [-2.5, 2.5]) paint(ellPts(ex * u, -6.4 * u, 1.1 * u, .6 * u, 12), { wash: PAL.ink, ink: null });
  } else if (h === 'bowtie') {
    paint([[0, -2.9 * u], [-1.5 * u, -3.6 * u], [-1.5 * u, -2.1 * u]], { wash: PAL.rose, ink: PAL.ink, sw: sw * .5 });
    paint([[0, -2.9 * u], [1.5 * u, -3.6 * u], [1.5 * u, -2.1 * u]], { wash: PAL.rose, ink: PAL.ink, sw: sw * .5 });
  }
}

// Emotes: little painted reaction marks that pop near a character's head. k = 0..1 pop progress.
function emote(kind, x, y, s, k = 1) {
  const p = backOut(k); if (p < .02) return;
  if (kind === 'zzz') { letter('z', x, y, s * 2, PAL.cream, { pop: k * 3 }); letter('z', x + s * 1.6, y - s * 1.8, s * 1.5, PAL.cream, { pop: k * 3 - .3 }); return; }
  if (kind === '!' || kind === '?' || kind === '!?' || kind === '!!') { letter(kind, x, y, s * 3.4, kind.includes('?') ? PAL.sky : PAL.ochre, { pop: k * 1.5, rot: .12 }); return; }
  push(); translate(x, y); scale(p);
  const sw = clamp(s / 15, .4, 2);
  if (kind === 'sweat') {
    for (const [dx, dy, r] of [[0, 0, 1], [1.6, 1.4, .7]]) paint([[dx * s, (dy - 1.6 * r) * s], [(dx + .9 * r) * s, (dy + .2) * s], [dx * s, (dy + .9 * r) * s], [(dx - .9 * r) * s, (dy + .2) * s]], { wash: PAL.sky, fill: '#FFFFFF', fillOp: 60, ink: PAL.ink, sw: sw * .6, curv: .7 });
  } else if (kind === 'spark') {
    paint(starPts(0, 0, 1.6 * s), { wash: PAL.cream, fill: PAL.ochre, fillOp: 80, ink: PAL.ink, sw: sw * .5 });
    paint(starPts(1.9 * s, 1.2 * s, .8 * s), { wash: PAL.ochre, ink: PAL.ink, sw: sw * .4 });
  } else if (kind === 'heart') {
    paint(heartPts(0, 0, s * 1.8), { wash: '#E2476E', fill: PAL.rose, fillOp: 90, ink: PAL.ink, sw: sw * .6 });
  } else if (kind === 'anger') {
    for (let i = 0; i < 4; i++) { push(); rotate(i * Math.PI / 2 + Math.PI / 4); inkLine([[.4 * s, -.5 * s], [1.3 * s, -.2 * s], [1.3 * s, .4 * s]], sw * .9, '#D8394E', 'ink', .5); pop(); }
  } else if (kind === 'music') {
    paint(ellPts(0, 1.2 * s, .7 * s, .5 * s, 12, 0, -.3), { wash: PAL.ink, ink: null });
    inkLine([[.6 * s, 1.1 * s], [.6 * s, -1.6 * s], [1.6 * s, -1 * s]], sw * .8, PAL.ink, 'ink', 0);
  } else if (kind === 'swirl') {
    const sp = []; for (let i = 0; i < 18; i++) { const a = i * .6 + T * 5, r = i * .09 * s; sp.push([Math.cos(a) * r, Math.sin(a) * r]); } inkLine(sp, sw * .7, PAL.violet, 'inkfine', .6);
  }
  pop();
}
// Heart outline points, centred at (cx, cy), about 2r wide.
function heartPts(cx, cy, r, n = 22) {
  const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; p.push([cx + 16 * Math.pow(Math.sin(a), 3) * r / 16, cy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * r / 16]); } return p;
}

// Mood timeline with animated changes. keys = [[t0, eyes, emote?], [t1, eyes, emote?], ...].
// Around each change the eyes squash shut, the body does a squash-stretch "take" and the emote pops.
// Spread the result into clawd(): clawd(x, y, u, { ...move(...), ...mood(t, keys) }).
function mood(t, keys) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const [t0, eyes, em] = keys[i], age = t - t0, nextIn = i + 1 < keys.length ? keys[i + 1][0] - t : 9;
  let squint = 0, take = 0;
  if (i > 0 && age < .16) { squint = 1 - age / .16; take = -.14 * Math.sin(age / .16 * Math.PI); }
  if (nextIn < .08) squint = Math.max(squint, 1 - nextIn / .08);
  if (i > 0 && age >= .16 && age < .4) take = .1 * Math.sin((age - .16) / .24 * Math.PI) * (1 - (age - .16) / .24);
  return { eyes, squint, take, emote: em, emoteK: em ? seg(age, .05, .3) * (1 - seg(age, 1.4, 1.7)) : 0 };
}

// Dance moves: return pose offsets in body units, driven by the song's beat.
function move(style, t, seed = 0) {
  const bp = bpOf(t), bi = Math.floor(bp), bf = bp - bi, hit = Math.max(0, 1 - bf * 3.5), s1 = Math.sin(bp * Math.PI), ab = Math.abs(s1);
  const o = { dy: 0, sq: 0, aL: .2, aR: .2, rot: 0, walk: null, sx: 1, dx: 0 };
  if (style === 'mix') style = ['bounce', 'roof', 'sway', 'spin', 'hop', 'wave'][(Math.floor(bp / 8) + seed) % 6];
  switch (style) {
    case 'bounce': o.dy = -ab * 1.6; o.sq = hit * .12; o.aL = .4 + s1; o.aR = .4 - s1; break;
    case 'hop': o.dy = -ab * 4; o.sq = hit * .18; o.aL = o.aR = .3 + ab * 1.1; break;
    case 'roof': o.dy = -ab * 1.2; o.sq = hit * .1; o.aL = o.aR = 1.25 + .3 * Math.sin(bp * TAU); break;
    case 'sway': o.dx = s1 * 3; o.rot = s1 * .12; o.aL = .5 + .6 * s1; o.aR = .5 - .6 * s1; o.sq = hit * .08; break;
    case 'spin': { const ph = (((bi % 4) + 4) % 4 === 3) ? bf : 0; o.sx = Math.cos(ph * TAU); o.dy = -Math.sin(ph * Math.PI) * 3 - ab; o.aL = o.aR = .6 + ph; o.sq = hit * .1; break; }
    case 'wave': o.dy = -ab; o.aL = 1.1 + .5 * Math.sin(bp * TAU * 2); o.aR = -.2; o.sq = hit * .08; break;
    case 'walk': o.walk = bp / 2; o.dy = -ab * .6; o.aL = .3 * s1; o.aR = -o.aL; break;
    case 'run': o.walk = bp * 1.5; o.dy = -Math.abs(Math.sin(bp * TAU)); o.aL = .8 * Math.sin(bp * TAU * 1.5); o.aR = -o.aL; o.rot = -.08; break;
    case 'idle': o.dy = -ab * .5; o.sq = hit * .05; break;
    case 'stomp': o.dy = -Math.max(0, Math.sin(bp * TAU)) * 1.4; o.sq = hit * .2; o.rot = (bi % 2 ? 1 : -1) * .06 * hit; o.aL = o.aR = -.3 + hit * .9; break;
    case 'shimmy': o.dx = Math.sin(bp * TAU * 2) * .6; o.rot = Math.sin(bp * TAU * 2) * .05; o.aL = .9 + .4 * Math.sin(bp * TAU * 2); o.aR = .9 - .4 * Math.sin(bp * TAU * 2); o.dy = -ab * .5; break;
  }
  return o;
}
function dancer(x, y, u, style, t, extra = {}) { const m = move(style, t, extra.seed || 0); clawd(x + m.dx * u, y, u, { ...m, ...extra }); }
