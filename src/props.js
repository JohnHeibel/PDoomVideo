// props.js: the recurring theatre set and the P(doom) meter + pump. All in world coordinates of a 1920x1080 frame.
//
// Stage layout: backdrop above y 800, wooden floor from y 800 down, side curtains at the frame edges, valance on top.
//   stageBack(t, o)  → backdrop (default: rotating watercolor sunburst) + floor. Draw characters/props after it.
//   stageFront(t, o) → side curtains + valance, drawn last so they frame everything.
//   o: { a, b } sunburst colours · backdrop: fn(t) replaces the sunburst · floor colour · curtain: 0 open → 1 closed
//      · alarm: 0..1 red siren wash · spots: [[x, colour], ...] spotlight cones hitting the floor at x.
// meterProp(x, y, s, v, o): standing thermometer, base on the floor at (x, y); s = 1 is ~560px tall. v = percent.
//   o: { cracked 0..1, glow, label (default 'P(DOOM)') }. Sets METER_SHOWN so the corner meter overlay hides.
// pumpProp(x, y, s, h): bicycle pump on the floor at (x, y), handle height h (0 down .. 1 up), hose runs to hoseTo [x, y].
// pumpH(t): handle height driven by the beat; the down-stroke lands exactly on each beat.

const CURTAIN = '#B8323F', CURTAIN_DK = '#7A1C2B', GOLD = '#E8B23A', WOOD = '#B87A4B', WOOD_DK = '#7C4A2C';
let METER_SHOWN = false;

function sunburst(cx, cy, a, b, rot = 0, n = 16, r = 2200, op = 120) {
  for (let i = 0; i < n; i++) {
    const a0 = rot + i * TAU / n, a1 = a0 + TAU / n * .62;
    paint([[cx, cy], [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]], { fill: i % 2 ? a : b, fillOp: op, bleed: .2, tex: .5, border: .4, ink: null });
  }
}

function stageBack(t, o = {}) {
  if (o.backdrop) o.backdrop(t);
  else {
    paint(rectPts(-400, -400, W + 800, 1240), { wash: o.wall || '#F6E3C8', washOp: 255, ink: null });
    sunburst(960, 430, o.a || PAL.rose, o.b || PAL.ochre, t * .12);
  }
  // floor with slightly converging planks
  const fl = o.floor || WOOD;
  paint([[-400, 800 + jit(3)], [W / 2, 796 + jit(3)], [W + 400, 800 + jit(3)], [W + 400, 1500], [-400, 1500]], { wash: fl, washOp: 255, fill: WOOD_DK, fillOp: 60, bleed: .05, tex: .8, border: .6, ink: PAL.ink, sw: 1.3 });
  for (let i = -9; i <= 9; i++) { const x0 = 960 + i * 150; inkLine([[x0, 802], [960 + i * 150 * 1.7, 1500]], .55, WOOD_DK, 'inkfine', 0); }
  for (const yy of [880, 990]) inkLine([[-400, yy], [W + 400, yy + jit(2)]], .45, WOOD_DK, 'inkfine', 0);
  if (o.spots) for (const [sx, col] of o.spots) spotlight(sx, col || PAL.cream);
}

function spotlight(x, col = PAL.cream, top = -60) {
  paint([[x - 90, top], [x + 90, top], [x + 260, 860], [x - 260, 860]], { fill: col, fillOp: 50, bleed: .05, tex: .2, border: .1, ink: null });
  paint(ellPts(x, 860, 270, 55, 24), { fill: col, fillOp: 90, bleed: .1, tex: .2, ink: null });
}

function stageFront(t, o = {}) {
  const k = clamp(o.curtain || 0);
  const drape = (side) => {
    const edge = side < 0 ? lerp(250, 985, k) : lerp(1670, 935, k), outer = side < 0 ? -80 : W + 80;
    const tie = k < .05, pts = [];
    // inner edge: gathered at y 560 when tied back, straight when drawn
    for (let i = 0; i <= 10; i++) {
      const y = -20 + i * 112, gather = tie ? Math.sin(clamp(y / 1100) * Math.PI) * 0 + (y > 380 && y < 740 ? -Math.sin((y - 380) / 360 * Math.PI) * 120 : 0) : 0;
      pts.push([edge + side * gather + Math.sin(i * 1.7 + t * 2) * 6, y]);
    }
    pts.push([outer, 1130], [outer, -20]);
    if (side > 0) pts.reverse();
    paint(pts, { wash: CURTAIN, washOp: 255, fill: CURTAIN_DK, fillOp: 90, bleed: .05, tex: .8, border: .7, ink: PAL.ink, sw: 1.5 });
    // folds
    const w = Math.abs(edge - outer), nf = Math.max(3, Math.round(w / 90));
    for (let f = 1; f < nf; f++) {
      const fx = lerp(outer, edge, f / nf), top = [];
      for (let i = 0; i <= 6; i++) { const y = i * 185, g = tie && y > 380 && y < 740 ? -Math.sin((y - 380) / 360 * Math.PI) * 120 * f / nf : 0; top.push([fx + side * g + Math.sin(i + f) * 8, y]); }
      inkLine(top, .8, CURTAIN_DK, 'inkfine', .5);
    }
    if (tie) { const ty = 560; paint(rrPts(edge - side * 120 - 40, ty - 16, 80, 32, 14), { wash: GOLD, ink: PAL.ink, sw: .8 }); }
  };
  drape(-1); drape(1);
  // valance with scallops and gold fringe
  const v = [[-80, -40], [W + 80, -40]];
  for (let i = 12; i >= 0; i--) { const x = i * 160; v.push([x + 80, 118 + jit(2)]); v.push([x, 92]); }
  paint(v, { wash: CURTAIN, washOp: 255, fill: CURTAIN_DK, fillOp: 110, bleed: .05, tex: .7, border: .6, ink: PAL.ink, sw: 1.5 });
  const fr = []; for (let i = 0; i <= 24; i++) fr.push([i * 80, i % 2 ? 106 : 96]);
  inkLine(fr, 1.2, GOLD, 'ink', .3);
  if (o.alarm) paint(rectPts(-400, -400, W + 800, H + 800), { fill: '#E0283F', fillOp: 110 * clamp(o.alarm), bleed: .02, tex: .5, border: .2, ink: null });
}

function meterColor(v) { return v < 40 ? PAL.sap : v < 75 ? PAL.ochre : '#D8394E'; }
function meterProp(x, y, s, v, o = {}) {
  METER_SHOWN = true;
  const col = meterColor(v), sw = clamp(1.3 * s, .5, 2.2);
  push(); translate(x, y); scale(s);
  // stand
  paint(rectPts(-110, -30, 220, 30, 3), { wash: WOOD, fill: WOOD_DK, fillOp: 70, tex: .6, ink: PAL.ink, sw });
  paint(rectPts(-12, -80, 24, 55), { wash: WOOD_DK, ink: PAL.ink, sw: sw * .7 });
  // tube + bulb
  paint(rrPts(-38, -520, 76, 440, 38, 2), { wash: PAL.cream, washOp: 255, ink: PAL.ink, sw });
  const hh = 390 * clamp(v / 100);
  if (hh > 14) paint(rrPts(-24, -110 - hh, 48, hh + 30, 22, 1.5), { wash: col, washOp: 235, fill: PAL.ink, fillOp: 30, tex: .6, ink: null });
  paint(ellPts(0, -92, 70, 70, 26, 2), { wash: col, washOp: 245, fill: PAL.ink, fillOp: 25, ink: PAL.ink, sw });
  if (o.glow) paint(ellPts(0, -92, 120, 120, 26, 6), { fill: col, fillOp: 90 * o.glow, bleed: .3, ink: null });
  inkLine([[-22, -490], [-22, -160]], .9, '#FFFFFF', 'inkfine', 0);
  for (let q = 1; q < 10; q++) inkLine([[-38, -110 - 390 * q / 10], [q % 5 ? -24 : -12, -110 - 390 * q / 10]], .7, PAL.ink, 'inkfine', 0);
  if (o.cracked) for (let c = 0; c < 3 * o.cracked; c++) {
    const cy = -300 - c * 60, p = [[-38, cy]]; for (let k = 1; k < 5; k++) p.push([-38 + k * 19, cy + (k % 2 ? -18 : 14) + jit(4)]);
    inkLine(p, 1, PAL.ink, 'inkfine', 0);
  }
  // sign
  paint(rrPts(-120, -610, 240, 70, 12, 2), { wash: WOOD, fill: WOOD_DK, fillOp: 60, tex: .6, ink: PAL.ink, sw });
  pop();
  letterAt(o.label || 'P(DOOM)', x, y - 575 * s, 46 * s, PAL.cream);
  letterAt((v >= 99.5 ? v.toFixed(1) : Math.floor(v)) + '%', x, y - 92 * s, 40 * s, PAL.cream);
}
// letter() in local world coordinates (goes through the camera like any other letter)
function letterAt(txt, x, y, size, col, o = {}) { letter(txt, x, y, size, col, o); }

function pumpH(t) { const f = frac(bpOf(t)); return f < .78 ? ease(f / .78) : 1 - easeIn((f - .78) / .22); }
function pumpProp(x, y, s, h, hoseTo) {
  const sw = clamp(1.2 * s, .5, 2);
  if (hoseTo) inkLine([[x + 30 * s, y - 20 * s], [lerp(x, hoseTo[0], .5), y + 30 * s], [hoseTo[0], hoseTo[1]]], 2.2 * s, PAL.ink, 'ink', .7);
  push(); translate(x, y); scale(s);
  paint(rectPts(-70, -18, 140, 18, 2), { wash: '#556070', ink: PAL.ink, sw });
  const rod = 150 * h;
  paint(rectPts(-6, -240 - rod, 12, rod + 30), { wash: '#C9CED6', ink: PAL.ink, sw: sw * .6 });
  paint(rrPts(-60, -270 - rod, 120, 26, 12), { wash: PAL.ink, ink: null });
  paint(rrPts(-32, -240, 64, 222, 14, 2), { wash: PAL.teal, fill: PAL.sky, fillOp: 70, tex: .6, ink: PAL.ink, sw });
  inkLine([[-18, -225], [-18, -40]], .8, '#FFFFFF', 'inkfine', 0);
  pop();
}
