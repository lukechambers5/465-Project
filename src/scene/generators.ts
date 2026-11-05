// Seeded shape generators for the scenery. Everything organic (tree crowns,
// sawgrass, moss) comes from here so nothing looks mirrored or copy-pasted,
// while the seed keeps the landscape identical between renders.

export type Rng = () => number;

export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number) => v.toFixed(1);
const between = (r: Rng, lo: number, hi: number) => lo + r() * (hi - lo);

export const WIDTH = 1600;
export const HEIGHT = 900;

/** A horizontal band with a gently wandering top edge, filled to the bottom. */
export function band(r: Rng, y: number, wobble: number, step = 140): string {
  let d = `M-40 ${HEIGHT + 40} L-40 ${n(y + between(r, -wobble, wobble))}`;
  for (let x = -40; x < WIDTH + 40; ) {
    const w = between(r, step * 0.6, step * 1.5);
    d += ` Q${n(x + w / 2)} ${n(y + between(r, -wobble * 2, wobble * 2))} ${n(x + w)} ${n(y + between(r, -wobble, wobble))}`;
    x += w;
  }
  return `${d} L${WIDTH + 40} ${HEIGHT + 40} Z`;
}

/** Rounded hardwood-hammock crowns sitting on a baseline. */
export function treeline(
  r: Rng,
  baseY: number,
  minH: number,
  maxH: number,
  minW = 28,
  maxW = 90,
  from = -40,
  to = WIDTH + 40,
): string {
  let d = `M${from} ${baseY} L${from} ${n(baseY - minH / 2)}`;
  let x = from;
  while (x < to) {
    const w = between(r, minW, maxW);
    const h = between(r, minH, maxH);
    const dip = baseY - between(r, minH * 0.25, minH * 0.7);
    d += ` C${n(x + w * 0.05)} ${n(baseY - h * 1.25)} ${n(x + w * 0.95)} ${n(baseY - h * 1.25)} ${n(x + w)} ${n(dip)}`;
    x += w;
  }
  return `${d} L${to} ${baseY} Z`;
}

/** A clump of sawgrass: thin tapered blades that lean away from the centre. */
export function blades(
  r: Rng,
  cx: number,
  base: number,
  count: number,
  height: number,
  spread: number,
  width = 4,
): string {
  let d = "";
  for (let i = 0; i < count; i++) {
    const x0 = cx + (r() - 0.5) * spread * 0.45;
    const lean = (x0 - cx) * 1.3 + (r() - 0.5) * spread * 0.5;
    const tip = x0 + lean;
    const h = height * between(r, 0.5, 1);
    const w = width * between(r, 0.6, 1.15);
    d +=
      `M${n(x0 - w)} ${base} ` +
      `Q${n(x0 + lean * 0.15 - w * 0.5)} ${n(base - h * 0.62)} ${n(tip)} ${n(base - h)} ` +
      `Q${n(x0 + lean * 0.3 + w)} ${n(base - h * 0.55)} ${n(x0 + w)} ${base}Z`;
  }
  return d;
}

/** A long run of marsh, as one path, for a mid-distance prairie of grass. */
export function prairie(r: Rng, base: number, height: number, density: number): string {
  let d = "";
  for (let x = -30; x < WIDTH + 30; x += between(r, density * 0.5, density * 1.5)) {
    d += blades(r, x, base, 5, height * between(r, 0.65, 1.1), 40, 2.6);
  }
  return d;
}

export interface Cypress {
  trunk: string;
  crown: string;
  moss: string;
}

function blob(x: number, y: number, rx: number, ry: number): string {
  return `M${n(x - rx)} ${n(y)}a${n(rx)} ${n(ry)} 0 1 0 ${n(rx * 2)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-rx * 2)} 0Z`;
}

function mossStrand(r: Rng, x: number, y: number, len: number): string {
  const sway = (r() - 0.5) * 14;
  const w = between(r, 1.6, 3.4);
  return (
    `M${n(x - w)} ${n(y)} Q${n(x + sway - w * 0.3)} ${n(y + len * 0.5)} ${n(x + sway * 0.5)} ${n(y + len)} ` +
    `Q${n(x + sway + w * 0.5)} ${n(y + len * 0.45)} ${n(x + w)} ${n(y)}Z`
  );
}

/** Bald cypress: a flared buttress, a thin spire, flat sparse layers, and moss. */
export function cypress(r: Rng, x: number, base: number, h: number, girth = 1): Cypress {
  const top = base - h;
  const flare = 42 * girth;
  const neck = 9 * girth;
  let trunk =
    `M${n(x - flare)} ${base} C${n(x - neck * 1.6)} ${n(base - h * 0.08)} ${n(x - neck * 1.1)} ${n(base - h * 0.3)} ${n(x - neck * 0.35)} ${n(top)} ` +
    `L${n(x + neck * 0.35)} ${n(top)} C${n(x + neck * 1.1)} ${n(base - h * 0.3)} ${n(x + neck * 1.6)} ${n(base - h * 0.08)} ${n(x + flare)} ${base}Z`;
  let crown = "";
  let moss = "";
  const tiers = Math.round(4 + h / 110);
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const y = top + h * 0.03 + t * h * 0.52;
    const dir = i % 2 === 0 ? 1 : -1;
    const reach = (28 + t * 95) * girth * between(r, 0.75, 1.2);
    const endX = x + dir * reach;
    const endY = y - between(r, 6, 22);
    const wid = 2.6 * girth;
    trunk +=
      `M${n(x)} ${n(y + wid)} Q${n(x + dir * reach * 0.5)} ${n(y + wid * 0.5)} ${n(endX)} ${n(endY)} ` +
      `Q${n(x + dir * reach * 0.5)} ${n(y - wid * 1.2)} ${n(x)} ${n(y - wid)}Z`;
    const pads = Math.round(2 + reach / 34);
    for (let p = 0; p < pads; p++) {
      const k = (p + 0.5) / pads;
      const px = x + dir * reach * k + between(r, -8, 8);
      const py = y + (endY - y) * k + between(r, -11, 3);
      crown += blob(px, py, between(r, 13, 26) * girth, between(r, 5, 10) * girth);
    }
    const strands = Math.round(reach / 15);
    for (let s = 0; s < strands; s++) {
      if (r() < 0.25) continue;
      const k = r();
      moss += mossStrand(
        r,
        x + dir * reach * k,
        y + (endY - y) * k + 3,
        between(r, 22, 90) * girth,
      );
    }
  }
  return { trunk, crown, moss };
}

export function knees(r: Rng, x: number, base: number, count: number, spread: number): string {
  let d = "";
  for (let i = 0; i < count; i++) {
    const kx = x + (r() - 0.5) * spread;
    const h = between(r, 12, 42);
    const w = between(r, 6, 13);
    d += `M${n(kx - w)} ${base} C${n(kx - w * 0.5)} ${n(base - h * 0.7)} ${n(kx - w * 0.2)} ${n(base - h)} ${n(kx)} ${n(base - h)} C${n(kx + w * 0.3)} ${n(base - h)} ${n(kx + w * 0.5)} ${n(base - h * 0.6)} ${n(kx + w)} ${base}Z`;
  }
  return d;
}

/** Mangrove key: a low, lumpy canopy on a cage of arching prop roots. */
export function mangroveKey(r: Rng, x: number, base: number, w: number, h: number) {
  // A big irregular mass with a layer of small lumps over it, tapering at both ends.
  const left = x - w / 2;
  const right = x + w / 2;
  const canopy =
    treeline(r, base - h * 0.2, h * 0.3, h * 0.72, 12, 44, left + w * 0.12, right - w * 0.12) +
    treeline(r, base - h * 0.2, h * 0.12, h * 0.42, 7, 20, left, right) +
    treeline(r, base - h * 0.2, h * 0.5, h, 9, 26, x - w * 0.22, x + w * 0.16);
  let roots = "";
  const rootTop = base - h * 0.28;
  for (let rx = x - w / 2 + 6; rx < x + w / 2 - 6; rx += between(r, 9, 20)) {
    const land = rx + between(r, -24, 24);
    roots += `M${n(rx)} ${n(rootTop)} Q${n((rx + land) / 2 + between(r, -14, 14))} ${n(rootTop + (base - rootTop) * 0.25)} ${n(land)} ${base} `;
  }
  return { canopy, roots };
}

export interface Shimmer {
  x: number;
  y: number;
  len: number;
  delay: number;
  dur: number;
}

/** Glints on the water, longer and more spread out the nearer they are. */
export function shimmers(r: Rng, count: number, top: number, bottom: number): Shimmer[] {
  return Array.from({ length: count }, () => {
    const depth = Math.pow(r(), 1.4);
    return {
      x: between(r, 0, WIDTH),
      y: top + depth * (bottom - top),
      len: 16 + depth * 90 * between(r, 0.4, 1),
      delay: -between(r, 0, 9),
      dur: between(r, 4, 9),
    };
  });
}
