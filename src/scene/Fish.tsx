import { useId, useMemo } from "react";
import type { ReactNode, SVGProps } from "react";
import type { FishKind } from "../data/species";
import { SPECIES } from "../data/species";
import type { CaughtFish, Finish } from "../game/fishgen";
import { finishOf, fishName } from "../game/fishgen";
import { seeded } from "./generators";
import type { Rng } from "./generators";

// All fish face left. <Fish> prints one in two inks for the field guide;
// <SkinnedFish> paints one caught fish with its own generated skin.

interface Art {
  viewBox: string;
  fins: string;
  body: string;
  marks: string;
  belly: string;
  eye: [number, number, number];
  /** Marks are thin lines, not filled shapes. */
  strokedMarks?: boolean;
  /** Whiskers and the like, always drawn as lines. */
  lines?: string;
}

const ART: Record<FishKind, Art> = {
  bass: {
    viewBox: "0 0 260 130",
    fins:
      "M74 38 L84 12 L94 28 L104 8 L114 26 L124 8 L134 28 L142 16 L148 36 Z" +
      "M150 36 L168 18 L186 26 L192 48 Z" +
      "M206 62 L250 28 Q240 64 252 102 L206 74 Z" +
      "M90 92 L84 118 L112 104 Z M160 92 L176 116 L186 88 Z M116 74 L106 98 L134 88 Z",
    body:
      "M14 66 Q18 54 34 46 Q72 28 130 32 Q186 36 214 66 Q186 94 130 98 Q70 102 34 88 Q24 84 12 76 L34 72 Q24 70 14 66 Z",
    belly: "M34 86 Q70 80 130 84 Q176 86 204 72 Q186 94 130 98 Q70 102 34 88 Z",
    marks:
      "M56 62 q14 -8 26 2 q14 -8 26 2 q14 -8 26 0 q14 -6 26 2 q12 -4 24 2 l0 7 q-12 -6 -24 -2 q-12 -8 -26 -2 q-12 -8 -26 -2 q-12 -8 -26 -2 q-12 -8 -26 0 Z" +
      "M62 42 q14 16 2 42 l-3 -1 q10 -24 -3 -40 Z",
    eye: [40, 56, 5.5],
  },
  bluegill: {
    viewBox: "0 0 220 150",
    fins:
      "M52 40 Q86 6 128 20 L146 30 Q170 34 176 56 Z M70 112 Q104 142 140 120 L160 96 Z M172 70 L212 48 Q204 78 212 108 L172 84 Z M84 86 L74 116 L104 98 Z",
    body: "M16 78 Q24 58 46 44 Q96 18 146 40 Q176 56 180 78 Q174 102 142 114 Q92 132 46 110 Q26 98 16 78 Z",
    belly: "M30 98 Q66 94 110 102 Q150 102 178 86 Q170 104 142 114 Q92 132 46 110 Q36 106 30 98 Z",
    marks:
      "M54 58 q16 -6 20 8 q-2 12 -18 10 q-8 -8 -2 -18 Z M92 36 q8 38 3 84 l9 0 q5 -44 -2 -84 Z M122 36 q8 36 3 78 l9 -4 q5 -36 -2 -70 Z M150 46 q6 28 2 60 l8 -5 q3 -26 -2 -50 Z",
    eye: [36, 68, 6],
  },
  catfish: {
    viewBox: "0 0 300 120",
    fins:
      "M120 40 L136 14 L152 40 Z M196 44 L212 34 L222 46 Z M246 58 L294 30 Q284 60 296 92 L246 70 Z M74 78 L52 104 L98 84 Z M150 82 Q190 108 236 78 Z",
    body: "M10 62 Q12 44 38 38 Q70 30 130 36 Q200 40 254 62 Q200 84 130 86 Q70 90 36 82 Q14 76 10 62 Z",
    belly: "M36 82 Q72 72 130 74 Q200 74 246 64 Q200 84 130 86 Q70 90 36 82 Z",
    marks: "M50 58 Q140 52 238 62 l0 2 Q140 56 50 61 Z",
    lines: "M14 56 Q2 44 4 30 M18 66 Q4 78 8 96 M24 70 Q18 86 26 100 M22 50 Q14 38 20 26",
    eye: [34, 52, 3.6],
  },
  gar: {
    viewBox: "0 0 320 90",
    fins:
      "M220 34 L252 16 L256 36 Z M216 58 L248 76 L252 54 Z M268 46 L312 22 Q304 46 314 70 L268 52 Z M122 58 L112 76 L138 62 Z",
    body:
      "M6 46 L72 37 Q100 28 150 28 Q220 28 272 42 L272 52 Q220 66 150 64 Q100 62 72 52 L6 49 Z",
    belly: "M72 52 Q100 54 150 54 Q220 56 272 50 L272 52 Q220 66 150 64 Q100 62 72 52 Z",
    marks:
      "M12 47 l44 -4 M92 40 l10 8 l-10 8 M118 34 l10 12 l-10 12 M146 32 l10 14 l-10 14 M174 32 l10 14 l-10 14 M202 34 l10 12 l-10 12 M230 38 l8 9 l-8 9",
    strokedMarks: true,
    eye: [78, 42, 3.6],
  },
  snook: {
    viewBox: "0 0 310 110",
    fins:
      "M102 30 L114 6 L128 22 L142 8 L156 28 Z M176 30 L196 12 L216 34 Z M252 52 L304 20 Q290 54 304 90 L252 62 Z M176 76 L192 98 L206 74 Z M92 76 L78 98 L112 82 Z",
    body: "M8 60 L30 48 Q60 30 120 28 Q200 28 258 56 Q200 84 120 84 Q60 86 30 72 Q14 68 8 60 Z",
    belly: "M26 70 Q70 66 120 70 Q200 72 250 58 Q200 84 120 84 Q60 86 30 72 Z",
    marks: "M44 52 Q130 46 250 56 l0 3.5 Q130 50 44 56 Z",
    eye: [38, 50, 4.6],
  },
  cichlid: {
    viewBox: "0 0 220 150",
    fins:
      "M46 42 Q84 4 150 22 L176 54 Z M60 110 Q100 146 146 122 L168 92 Z M172 72 L214 38 Q206 78 214 116 L172 84 Z M88 84 L78 116 L108 98 Z",
    body: "M14 76 Q22 56 44 44 Q98 16 148 40 Q178 56 182 78 Q176 102 144 114 Q92 132 44 108 Q26 98 14 76 Z",
    belly: "M28 96 Q66 92 110 100 Q150 100 180 84 Q172 104 144 114 Q92 132 44 108 Q34 104 28 96 Z",
    marks:
      "M70 36 q10 34 4 80 l12 4 q6 -44 -3 -88 Z M102 28 q10 40 4 94 l12 0 q6 -50 -3 -94 Z M134 34 q8 36 3 80 l11 -5 q5 -36 -2 -70 Z",
    eye: [40, 64, 6.5],
  },
  tarpon: {
    viewBox: "0 0 330 130",
    fins:
      "M142 32 L176 20 L240 4 L190 34 Z M268 62 L324 18 Q306 62 324 110 L268 72 Z M170 90 L196 118 L212 88 Z M92 90 L70 116 L112 96 Z",
    body: "M10 52 Q28 58 44 46 Q90 24 170 30 Q240 38 276 66 Q240 92 170 96 Q90 102 46 84 Q30 78 18 62 Z",
    belly: "M46 84 Q90 74 170 76 Q232 76 268 68 Q240 92 170 96 Q90 102 46 84 Z",
    marks:
      "M84 44 q8 8 0 16 q8 8 16 0 q-8 -8 -16 -16 Z M112 40 q8 8 0 16 q8 8 16 0 q-8 -8 -16 -16 Z M140 38 q8 8 0 16 q8 8 16 0 q-8 -8 -16 -16 Z M168 38 q8 8 0 16 q8 8 16 0 q-8 -8 -16 -16 Z M196 42 q8 8 0 16 q8 8 16 0 q-8 -8 -16 -16 Z M224 48 q7 7 0 14 q7 7 14 0 q-7 -7 -14 -14 Z" +
      "M60 40 q14 20 0 44 l-4 -2 q12 -20 -1 -40 Z",
    eye: [38, 54, 6],
  },
  redfish: {
    viewBox: "0 0 290 130",
    fins:
      "M92 34 L104 12 L116 28 L128 12 L140 30 L154 14 L166 36 Z M172 36 L204 24 L222 52 Z M240 62 L284 38 Q278 66 286 96 L240 76 Z M120 94 L108 116 L138 100 Z M194 88 L208 110 L220 84 Z",
    body: "M12 76 Q16 50 44 40 Q100 24 170 34 Q224 44 248 68 Q224 94 170 100 Q100 110 46 94 Q20 88 12 76 Z",
    belly: "M44 92 Q100 82 170 86 Q220 84 242 72 Q224 94 170 100 Q100 110 46 94 Z",
    marks: "M222 50 a9 9 0 1 0 0.1 0 Z M70 48 Q140 42 208 56 l0 2 Q140 46 70 52 Z",
    eye: [42, 60, 5],
  },
  permit: {
    viewBox: "0 0 250 180",
    fins:
      "M104 30 Q136 18 176 4 Q160 30 150 50 Z M104 150 Q136 162 176 176 Q160 150 150 130 Z M176 82 L240 44 Q224 90 240 136 L176 98 Z M82 98 L60 130 L100 112 Z",
    body: "M14 92 Q22 60 56 38 Q104 14 146 46 Q176 68 186 90 Q176 112 146 134 Q104 166 56 142 Q22 124 14 92 Z",
    belly: "M26 122 Q64 116 108 126 Q150 122 182 96 Q176 112 146 134 Q104 166 56 142 Q38 134 26 122 Z",
    marks: "M50 44 Q60 90 52 140 l4 1 Q66 90 54 43 Z",
    eye: [44, 78, 6.5],
  },
  mullet: {
    viewBox: "0 0 260 100",
    fins:
      "M112 24 L128 8 L140 26 Z M170 28 L190 14 L196 34 Z M212 50 L254 22 Q244 50 254 80 L212 58 Z M104 72 L92 92 L122 78 Z M166 72 L180 90 L190 68 Z",
    body: "M12 50 Q14 36 34 30 Q90 16 160 26 Q200 34 220 52 Q200 70 160 74 Q90 82 36 70 Q16 64 12 50 Z",
    belly: "M36 70 Q90 62 160 64 Q200 62 216 54 Q200 70 160 74 Q90 82 36 70 Z",
    marks:
      "M46 38 Q110 30 186 42 l0 3 Q110 34 46 41 Z M46 48 Q110 42 196 50 l0 3 Q110 46 46 51 Z M50 58 Q110 54 190 58 l0 3 Q110 58 50 61 Z",
    eye: [32, 44, 5],
  },
};

type FishProps = { kind: FishKind; silhouette?: boolean } & SVGProps<SVGSVGElement>;

/** Two-ink print: --ink for body and fins, --ink-2 for the belly, --ink-3 for markings. */
export default function Fish({ kind, silhouette, ...svg }: FishProps) {
  const a = ART[kind];
  const markColor = "var(--ink-3, var(--ink-2))";
  return (
    <svg {...svg} viewBox={a.viewBox} aria-hidden="true">
      <path d={a.fins} fill="var(--ink)" />
      {a.lines && <path d={a.lines} fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />}
      <path d={a.body} fill="var(--ink)" />
      {!silhouette && (
        <>
          <path d={a.belly} fill="var(--ink-2)" />
          <path
            d={a.marks}
            fill={a.strokedMarks ? "none" : markColor}
            stroke={a.strokedMarks ? markColor : "none"}
            strokeWidth={a.strokedMarks ? 2.4 : 0}
            strokeLinecap="round"
          />
          <circle cx={a.eye[0]} cy={a.eye[1]} r={a.eye[2]} fill={markColor} />
          <circle cx={a.eye[0]} cy={a.eye[1]} r={a.eye[2] * 0.5} fill="var(--ink)" />
        </>
      )}
    </svg>
  );
}

// ------------------------------------------------------------ generated skins

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h < 0 ? h + 360 : h, s * 100, l * 100];
}

/** Moves a color around the wheel; wear also dulls it a little. */
function tint(hex: string, hue: number, wear: number): string {
  const [h, s, l] = hexToHsl(hex);
  return `hsl(${((h + hue + 360) % 360).toFixed(1)} ${(s * (1 - wear * 0.45)).toFixed(1)}% ${(l + (46 - l) * wear * 0.25).toFixed(1)}%)`;
}

function wavyLine(r: Rng, x1: number, y1: number, x2: number, y2: number, amp: number, steps: number) {
  let d = `M${x1.toFixed(1)} ${y1.toFixed(1)}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const cx = x - (x2 - x1) / (steps * 2) + (r() - 0.5) * amp;
    const cy = y - (y2 - y1) / (steps * 2) + (r() - 0.5) * amp;
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

function lumpyBlob(r: Rng, cx: number, cy: number, radius: number) {
  const points = 5 + Math.floor(r() * 4);
  const at = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const rad = radius * (0.55 + r() * 0.7);
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.75];
  });
  let d = `M${((at[0][0] + at[points - 1][0]) / 2).toFixed(1)} ${((at[0][1] + at[points - 1][1]) / 2).toFixed(1)}`;
  at.forEach((p, i) => {
    const q = at[(i + 1) % points];
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`;
  });
  return `${d}Z`;
}

function patternLayer(r: Rng, finish: Finish, accents: string[], W: number, H: number, blurId: string): ReactNode {
  const acc = () => accents[Math.floor(r() * accents.length)];
  switch (finish.pattern) {
    case "camo":
      return Array.from({ length: 18 }, (_, i) => (
        <path key={i} d={lumpyBlob(r, r() * W, r() * H, H * (0.1 + r() * 0.16))} fill={acc()} opacity="0.85" />
      ));
    case "blotch":
      return (
        <g filter={`url(#${blurId})`}>
          {Array.from({ length: 16 }, (_, i) => (
            <ellipse
              key={i}
              cx={r() * W}
              cy={r() * H}
              rx={H * (0.12 + r() * 0.26)}
              ry={H * (0.06 + r() * 0.14)}
              fill={acc()}
              opacity="0.85"
            />
          ))}
        </g>
      );
    case "veins":
      return Array.from({ length: 9 }, (_, i) => {
        const y = r() * H;
        return (
          <path
            key={i}
            d={wavyLine(r, -10, y, W + 10, y + (r() - 0.5) * H * 0.9, H * 0.36, 7)}
            fill="none"
            stroke={acc()}
            strokeWidth={0.8 + r() * 3.4}
            opacity="0.72"
          />
        );
      });
    case "tiger": {
      const count = 7 + Math.floor(r() * 6);
      return Array.from({ length: count }, (_, i) => {
        const x = (W * (i + r() * 0.7)) / count;
        const tilt = (r() - 0.5) * H * 0.5;
        const w = 3 + r() * (W / count) * 0.42;
        const left = wavyLine(r, x, -6, x + tilt, H + 6, H * 0.14, 3);
        const back = wavyLine(r, x + tilt + w, H + 6, x + w * 0.6, -6, H * 0.14, 3).replace(/^M[^Q]+/, ` L${(x + tilt + w).toFixed(1)} ${H + 6} `);
        return <path key={i} d={`${left}${back}Z`} fill={i % 5 === 4 ? accents[accents.length - 1] : accents[0]} opacity="0.9" />;
      });
    }
    case "web": {
      const ox = W * (0.2 + r() * 0.6);
      const oy = H * (0.2 + r() * 0.6);
      const spokes = 12 + Math.floor(r() * 7);
      const reach = Math.max(W, H);
      const lines: ReactNode[] = [];
      const start = r() * Math.PI;
      for (let i = 0; i < spokes; i++) {
        const a = start + (i / spokes) * Math.PI * 2;
        lines.push(<line key={`s${i}`} x1={ox} y1={oy} x2={ox + Math.cos(a) * reach} y2={oy + Math.sin(a) * reach} />);
      }
      for (let ring = 1; ring < 9; ring++) {
        const rad = ring * H * 0.17;
        let d = "";
        for (let i = 0; i <= spokes; i++) {
          const a = start + (i / spokes) * Math.PI * 2;
          const x = ox + Math.cos(a) * rad;
          const y = oy + Math.sin(a) * rad;
          const mid = a - Math.PI / spokes;
          d += i === 0
            ? `M${x.toFixed(1)} ${y.toFixed(1)}`
            : ` Q${(ox + Math.cos(mid) * rad * 0.82).toFixed(1)} ${(oy + Math.sin(mid) * rad * 0.82).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        lines.push(<path key={`r${ring}`} d={d} fill="none" />);
      }
      return (
        <g stroke={accents[0]} strokeWidth="1.15" opacity="0.8">
          {lines}
        </g>
      );
    }
    case "scales": {
      const size = H * (0.075 + r() * 0.05);
      const out: ReactNode[] = [];
      let row = 0;
      for (let y = -size; y < H + size; y += size * 0.85, row++) {
        for (let x = -size + (row % 2) * size; x < W + size; x += size * 2) {
          out.push(
            <path
              key={`${row}-${x}`}
              d={`M${(x - size).toFixed(1)} ${y.toFixed(1)} A${size.toFixed(1)} ${size.toFixed(1)} 0 0 0 ${(x + size).toFixed(1)} ${y.toFixed(1)}`}
              fill="none"
              stroke={accents[0]}
              strokeWidth="1.1"
              opacity={(0.2 + r() * 0.65).toFixed(2)}
            />,
          );
        }
      }
      return out;
    }
    case "speckle":
      return (
        <>
          <g filter={`url(#${blurId})`}>
            {Array.from({ length: 5 }, (_, i) => (
              <circle key={i} cx={r() * W} cy={r() * H} r={H * (0.1 + r() * 0.16)} fill={acc()} opacity="0.5" />
            ))}
          </g>
          {Array.from({ length: 110 }, (_, i) => (
            <circle key={i} cx={r() * W} cy={r() * H} r={0.5 + Math.pow(r(), 3) * 2.8} fill={acc()} opacity={(0.45 + r() * 0.55).toFixed(2)} />
          ))}
        </>
      );
    default:
      return null;
  }
}

interface SkinnedProps extends SVGProps<SVGSVGElement> {
  fish: CaughtFish;
}

export function SkinnedFish({ fish, ...svg }: SkinnedProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const a = ART[fish.kind];
  const [, , W, H] = a.viewBox.split(" ").map(Number);
  const finish = finishOf(fish);

  const skin = useMemo(() => {
    // Same seed and finish always draws the same fish, as in saved games.
    const r = seeded(fish.seed * 7919 + fish.finish.length * 131 + 17);
    const hue = (r() * 2 - 1) * finish.drift;
    const stops = finish.stops.map((c) => tint(c, hue, fish.float));
    const accents = finish.accents.map((c) => tint(c, hue, fish.float));
    const along = r() < 0.5;
    const flip = r() < 0.5;
    const skew = (r() - 0.5) * 0.5;
    const axis = along
      ? { x1: flip ? W : 0, x2: flip ? 0 : W, y1: H * (0.5 - skew), y2: H * (0.5 + skew) }
      : { x1: W * (0.5 - skew), x2: W * (0.5 + skew), y1: flip ? H : 0, y2: flip ? 0 : H };
    const pattern = patternLayer(r, finish, accents.length ? accents : stops, W, H, `${uid}b`);

    // Wear: nicks and scrapes, more and longer as the float climbs.
    const scratches = Array.from({ length: Math.round(fish.float * 46) }, () => {
      const x = r() * W;
      const y = r() * H;
      const len = 4 + r() * 22 * (0.4 + fish.float);
      const ang = -0.5 + r();
      return `M${x.toFixed(1)} ${y.toFixed(1)} L${(x + Math.cos(ang) * len).toFixed(1)} ${(y + Math.sin(ang) * len).toFixed(1)}`;
    }).join(" ");
    const chips = fish.float > 0.3
      ? Array.from({ length: Math.round((fish.float - 0.3) * 16) }, () => lumpyBlob(r, r() * W, r() * H, 2 + r() * 5)).join(" ")
      : "";
    return { stops, axis, pattern, scratches, chips };
  }, [fish.seed, fish.finish, fish.float, finish, W, H, uid]);

  const label = `${fishName(fish)}, ${SPECIES[fish.kind].latin}`;
  return (
    <svg {...svg} viewBox={a.viewBox} role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${uid}g`} gradientUnits="userSpaceOnUse" {...skin.axis}>
          {skin.stops.map((c, i) => (
            <stop key={i} offset={i / (skin.stops.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <path d={a.body} />
        </clipPath>
        <filter id={`${uid}b`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={H * 0.055} />
        </filter>
      </defs>

      <path d={a.fins} fill={`url(#${uid}g)`} />
      <path d={a.fins} fill="#000" opacity="0.3" />
      {a.lines && <path d={a.lines} fill="none" stroke="#141210" strokeWidth="2" strokeLinecap="round" />}
      <path d={a.body} fill={`url(#${uid}g)`} />

      <g clipPath={`url(#${uid}c)`}>
        {skin.pattern}
        <path d={a.belly} fill="#fff" opacity="0.15" />
        <path
          d={a.marks}
          fill={a.strokedMarks ? "none" : "#000"}
          stroke={a.strokedMarks ? "#000" : "none"}
          strokeWidth={a.strokedMarks ? 2.2 : 0}
          opacity="0.26"
        />
        {skin.scratches && <path d={skin.scratches} stroke="#efe7cf" strokeWidth="0.8" opacity="0.5" />}
        {skin.chips && <path d={skin.chips} fill="#2a2520" opacity="0.5" />}
        {finish.sheen && (
          <rect className="fish-sheen" x={-W * 0.4} y={-H} width={W * 0.16} height={H * 3} fill="#fff" opacity="0.4" transform={`rotate(18 0 ${H / 2})`} />
        )}
      </g>

      <path d={a.body} fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="1.1" />
      <circle cx={a.eye[0]} cy={a.eye[1]} r={a.eye[2]} fill="#f4eac8" />
      <circle cx={a.eye[0]} cy={a.eye[1]} r={a.eye[2] * 0.55} fill="#111" />
    </svg>
  );
}
