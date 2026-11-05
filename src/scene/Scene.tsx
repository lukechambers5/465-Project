import { memo, useMemo } from "react";
import type { Level } from "../data/messages";
import type { BoatPaint } from "../game/catalog";
import { paletteFor } from "./palettes";
import type { Palette } from "./palettes";
import {
  band,
  blades,
  cypress,
  HEIGHT,
  knees,
  mangroveKey,
  prairie,
  seeded,
  shimmers,
  treeline,
  WIDTH,
} from "./generators";

// The world is three stacked SVGs on purpose. The backdrop runs through a
// rough-cut paper filter, which is costly to paint, so it never animates; all
// movement lives in unfiltered layers on top so the filter is only drawn once.

const VIEW = `0 0 ${WIDTH} ${HEIGHT}`;
export const WATERLINE = 470;

/** Flips a shape onto the water, foreshortened, hinged just under the waterline. */
const mirrored = (squash: number, gap = 6) =>
  `translate(0 ${WATERLINE + gap + squash * WATERLINE}) scale(1 ${-squash})`;

function Backdrop({ level, p }: { level: Level; p: Palette }) {
  const art = useMemo(() => {
    const r = seeded(level === "pond" ? 11 : level === "river" ? 29 : 47);
    return {
      sky: [0, 95, 180, 265, 345, 415].map((y, i) => ({
        d: band(r, y, 7 + i, 170),
        fill: p.sky[i],
      })),
      haze: band(r, 400, 5, 200),
      water: [WATERLINE, 520, 585, 665, 755, 850].map((y, i) => ({
        d: band(r, y, 3 + i * 2.2, 190 - i * 8),
        fill: p.water[i],
      })),
      r,
    };
  }, [level, p]);

  const sunAt = level === "pond" ? [1120, 322, 62] : level === "river" ? [660, 138, 38] : [870, 372, 118];

  return (
    <svg className="layer backdrop" viewBox={VIEW} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <filter id="cut" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
        <filter id="cut-fine" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="5" />
        </filter>
      </defs>
      <g filter="url(#cut)">
        {art.sky.map((b, i) => (
          <path key={i} d={b.d} fill={b.fill} />
        ))}
        <circle cx={sunAt[0]} cy={sunAt[1]} r={sunAt[2]} fill={p.sun} />
        {level === "ocean" && <path d={art.haze} fill={p.sky[5]} opacity="0.5" />}
      </g>
      {level === "pond" && <PondDistance p={p} />}
      {level === "river" && <SloughDistance p={p} />}
      {level === "ocean" && <BayDistance p={p} />}
      <g filter="url(#cut)">
        {art.water.map((b, i) => (
          <path key={i} d={b.d} fill={b.fill} />
        ))}
      </g>
      {level === "pond" && <PondReflection p={p} />}
      {level === "river" && <SloughReflection p={p} />}
      {level === "ocean" && <BayReflection p={p} sunX={sunAt[0]} />}
    </svg>
  );
}

function usePondTrees() {
  return useMemo(() => {
    const r = seeded(101);
    return {
      far: treeline(r, WATERLINE + 2, 20, 74, 10, 58) + treeline(r, WATERLINE + 2, 34, 58, 8, 30),
      mid: treeline(r, WATERLINE + 2, 8, 34, 9, 44) + treeline(r, WATERLINE + 2, 6, 20, 6, 22),
      trees: [
        cypress(r, 380, WATERLINE + 4, 300, 0.75),
        cypress(r, 560, WATERLINE + 4, 220, 0.5),
        cypress(r, 690, WATERLINE + 4, 268, 0.62),
        cypress(r, 980, WATERLINE + 4, 240, 0.55),
        cypress(r, 1210, WATERLINE + 4, 340, 0.85),
        cypress(r, 1450, WATERLINE + 4, 290, 0.7),
      ],
      knees: knees(r, 700, WATERLINE + 22, 9, 900),
    };
  }, []);
}

function PondDistance({ p }: { p: Palette }) {
  const a = usePondTrees();
  return (
    <>
      <path d={a.far} fill={p.far} filter="url(#cut-fine)" />
      <g fill={p.mid} filter="url(#cut-fine)">
        <path d={a.mid} />
        {a.trees.map((t, i) => (
          <g key={i}>
            <path d={t.trunk} />
            <path d={t.crown} />
            <path d={t.moss} opacity="0.75" />
          </g>
        ))}
      </g>
    </>
  );
}

function PondReflection({ p }: { p: Palette }) {
  const a = usePondTrees();
  return (
    <g
      transform={mirrored(0.6)}
      fill={p.mid}
      opacity="0.4"
      filter="url(#cut)"
    >
      <path d={a.mid} />
      {a.trees.map((t, i) => (
        <g key={i}>
          <path d={t.trunk} />
          <path d={t.crown} />
        </g>
      ))}
    </g>
  );
}

function useSloughShapes() {
  return useMemo(() => {
    const r = seeded(202);
    return {
      far: treeline(r, WATERLINE - 12, 8, 22, 40, 120),
      domes: [
        treeline(r, WATERLINE - 6, 16, 66, 9, 34, 250, 480) + treeline(r, WATERLINE - 6, 10, 34, 7, 18, 235, 500),
        treeline(r, WATERLINE - 6, 12, 46, 9, 30, 1120, 1290) + treeline(r, WATERLINE - 6, 8, 24, 6, 16, 1105, 1310),
      ],
      grass: prairie(r, WATERLINE + 6, 40, 15),
      grass2: prairie(r, WATERLINE + 8, 24, 11),
    };
  }, []);
}

function SloughDistance({ p }: { p: Palette }) {
  const a = useSloughShapes();
  return (
    <>
      <g filter="url(#cut)">
        {/* Rain curtain falling from the base of the storm. */}
        <path d="M960 300 L1420 300 L1370 470 L900 470 Z" fill={p.cloud[3]} opacity="0.5" />
        {/* The thunderhead: stacked flat shapes, lit from the left. */}
        <path
          d="M820 318 C770 300 790 240 860 244 C850 180 930 150 975 190 C985 110 1090 70 1160 118 C1215 70 1320 90 1330 165 C1410 150 1470 210 1430 262 C1500 275 1490 322 1420 322 Z"
          fill={p.cloud[0]}
        />
        <path
          d="M1000 322 C1000 270 1060 250 1098 268 C1110 210 1190 180 1240 214 C1290 180 1360 196 1362 246 C1420 240 1470 280 1430 322 Z"
          fill={p.cloud[1]}
        />
        <path d="M840 304 C960 292 1320 296 1456 308 L1420 334 L816 332 Z" fill={p.cloud[2]} />
      </g>
      <path d={a.far} fill={p.far} filter="url(#cut-fine)" />
      <g fill={p.dome} filter="url(#cut-fine)">
        {a.domes.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <path d={a.grass} fill={p.mid} />
      <path d={a.grass2} fill={p.near} />
    </>
  );
}

function SloughReflection({ p }: { p: Palette }) {
  const a = useSloughShapes();
  return (
    <g
      transform={mirrored(0.8, 10)}
      fill={p.near}
      opacity="0.45"
    >
      <path d={a.grass2} />
    </g>
  );
}

function useBayKeys() {
  return useMemo(() => {
    const r = seeded(303);
    return {
      far: [
        treeline(r, WATERLINE + 1, 7, 18, 20, 44, -40, 330),
        treeline(r, WATERLINE + 1, 6, 15, 18, 40, 1060, 1340),
      ],
      keys: [
        mangroveKey(r, 470, WATERLINE + 10, 300, 58),
        mangroveKey(r, 1230, WATERLINE + 12, 400, 74),
        mangroveKey(r, 1540, WATERLINE + 6, 180, 44),
      ],
    };
  }, []);
}

function BayDistance({ p }: { p: Palette }) {
  const a = useBayKeys();
  return (
    <>
      <g fill={p.far} filter="url(#cut-fine)">
        {a.far.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {a.keys.map((k, i) => (
        <g key={i} filter="url(#cut-fine)">
          <path d={k.roots} fill="none" stroke={p.mid} strokeWidth="2.6" />
          <path d={k.canopy} fill={p.mid} />
        </g>
      ))}
    </>
  );
}

function BayReflection({ p, sunX }: { p: Palette; sunX: number }) {
  const a = useBayKeys();
  const stripes = useMemo(() => {
    const r = seeded(333);
    return Array.from({ length: 18 }, (_, i) => {
      const y = WATERLINE + 8 + i * i * 1.15 + i * 7;
      const w = 110 + i * 15 + r() * 60;
      return { x: sunX - w / 2 + (r() - 0.5) * 40, y, w, h: 5 + i * 0.7 };
    });
  }, [sunX]);
  return (
    <>
      <g
        transform={mirrored(0.55, 8)}
        fill={p.mid}
        opacity="0.5"
        filter="url(#cut)"
      >
        {a.keys.map((k, i) => (
          <path key={i} d={k.canopy} />
        ))}
      </g>
      <g fill={p.glint} opacity="0.62" filter="url(#cut-fine)">
        {stripes.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.h / 2} />
        ))}
      </g>
    </>
  );
}

// --- Things that move ------------------------------------------------------

function Bird({ x, y, s, delay, dur, fill }: { x: number; y: number; s: number; delay: number; dur: number; fill: string }) {
  return (
    <g className="bird" style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M-8 0 Q0 -3 8 0 Q0 3 -8 0Z M-8 0 L-22 -2 L-8 1.5Z" fill={fill} />
        <path
          className="wing"
          style={{ animationDelay: `${delay * 0.37}s` }}
          d="M-5 -1 Q-2 -16 8 -24 Q9 -10 5 -1Z"
          fill={fill}
        />
      </g>
    </g>
  );
}

/** Eyes-and-snout gator. `dread` is 0 (far off) to 1 (right beside the boat). */
function Gator({ dread }: { dread: number }) {
  const x = 830 + dread * 170;
  const y = 520 + dread * 225;
  const s = 0.7 + dread * 1.1;
  return (
    <g className="gator" style={{ transform: `translate(${x}px, ${y}px) scale(${s})` }}>
      <g className="gator-bob">
        <path d="M-150 3 Q-40 -4 150 4 Q40 10 -150 3Z" fill="#000" opacity="0.28" />
        <path
          d="M-112 1 C-108 -10 -90 -13 -78 -8 C-62 -5 -40 -6 -20 -9 C-14 -27 14 -27 20 -11 C38 -8 54 -7 76 -3 L84 2 Z"
          fill="#17241b"
        />
        <path d="M100 0 l8 -7 l8 7 M126 1 l7 -6 l7 6 M150 2 l5 -4 l5 4" fill="#17241b" />
        <circle cx="2" cy="-15" r="4.4" fill="#e7c23a" />
        <rect x="1" y="-19" width="2" height="8" fill="#17241b" />
        <circle cx="-92" cy="-8" r="1.8" fill="#000" />
        <path className="gator-wake" d="M-130 8 Q0 2 130 9" stroke="#f3ecd2" strokeWidth="1.6" fill="none" opacity="0.45" />
      </g>
    </g>
  );
}

function Life({ level, dread, p }: { level: Level; dread: number; p: Palette }) {
  const glints = useMemo(() => shimmers(seeded(7), 46, WATERLINE + 12, 860), []);
  const flies = useMemo(() => {
    const r = seeded(77);
    return Array.from({ length: 16 }, () => ({
      x: 300 + r() * 1200,
      y: 380 + r() * 170,
      d: -r() * 8,
      t: 4 + r() * 5,
    }));
  }, []);
  return (
    <svg className="layer" viewBox={VIEW} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g stroke={p.glint} strokeLinecap="round">
        {glints.map((g, i) => (
          <line
            key={i}
            className="glint"
            x1={g.x}
            x2={g.x + g.len}
            y1={g.y}
            y2={g.y}
            strokeWidth={1 + (g.y - WATERLINE) / 170}
            style={{ animationDelay: `${g.delay}s`, animationDuration: `${g.dur}s` }}
          />
        ))}
      </g>

      {level === "pond" && (
        <>
          <g className="mist" fill="#fbf2d4">
            <path d="M-300 452 Q200 432 700 450 T1900 448 L1900 476 Q1100 470 600 478 T-300 474Z" opacity="0.5" />
          </g>
          <g className="mist mist-2" fill="#fbf2d4">
            <path d="M-200 414 Q300 400 800 416 T2000 410 L2000 428 Q1000 436 500 426 T-200 430Z" opacity="0.3" />
          </g>
          <Egret x={1030} y={498} />
          <g fill="#ffe98a">
            {flies.map((f, i) => (
              <circle key={i} className="firefly" cx={f.x} cy={f.y} r="2.4" style={{ animationDelay: `${f.d}s`, animationDuration: `${f.t}s` }} />
            ))}
          </g>
        </>
      )}

      {level === "river" && (
        <>
          <rect className="lightning" x="880" y="150" width="600" height="330" fill="#fffbe6" />
          <Anhinga x={1000} y={WATERLINE + 28} />
        </>
      )}

      {level === "ocean" && (
        <>
          <Bird x={420} y={210} s={1.1} delay={-2} dur={38} fill="#f09aa6" />
          <Bird x={470} y={190} s={0.9} delay={-3.6} dur={38} fill="#f09aa6" />
          <Bird x={380} y={180} s={1} delay={-4.5} dur={38} fill="#f09aa6" />
          <Bird x={330} y={230} s={0.8} delay={-6} dur={38} fill="#f09aa6" />
          <Pelican x={1020} y={590} />
        </>
      )}

      {level !== "ocean" && (
        <>
          <Bird x={300} y={level === "pond" ? 150 : 230} s={1.2} delay={-5} dur={46} fill={p.bird} />
          <Bird x={230} y={level === "pond" ? 186 : 200} s={0.95} delay={-7} dur={46} fill={p.bird} />
        </>
      )}

      <Gator dread={dread} />
    </svg>
  );
}

function Egret({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-1 -2 L-5 -40 M6 -2 L4 -40" stroke="#1c2a20" strokeWidth="1.8" />
      <path d="M-22 -48 C-16 -66 14 -68 22 -50 C16 -36 -8 -32 -24 -36 L-44 -24 Z" fill="#fbf6e6" />
      <g className="egret-neck">
        <path
          d="M16 -56 C30 -70 8 -82 14 -98 C18 -112 32 -116 38 -108 L34 -102 C28 -106 24 -104 23 -98 C20 -84 42 -68 24 -48 Z"
          fill="#fbf6e6"
        />
        <path d="M36 -110 L60 -104 L36 -103 Z" fill="#e7b02f" />
      </g>
      <path d="M-30 2 Q5 -3 40 2 Q5 6 -30 2Z" fill="#fbf6e6" opacity="0.3" />
    </g>
  );
}

function Anhinga({ x, y }: { x: number; y: number }) {
  // Drying its wings on a dead snag, the way they do all day.
  return (
    <g transform={`translate(${x} ${y})`} fill="#14211f">
      <path d="M-8 0 C-6 -40 -12 -62 -5 -96 L4 -96 C4 -60 10 -40 12 0 Z" />
      <path d="M-5 -66 L-34 -86 L-30 -92 L-2 -76 Z" />
      <g transform="translate(0 -96)">
        <path d="M-4 0 L-40 -30 L-30 -46 L-4 -22 L6 -44 C10 -44 12 -40 10 -36 L6 0 Z" />
        <path d="M0 -12 L38 -30 L34 -46 L2 -26 Z" />
        <path d="M2 -24 C-6 -44 12 -52 8 -68 C7 -74 12 -78 16 -76 L34 -74 L16 -70 C20 -52 6 -42 8 -24 Z" />
        <path d="M-4 -2 L-14 28 L0 22 L6 2 Z" />
      </g>
    </g>
  );
}

function Pelican({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-13 0 L-13 -82 Q0 -88 13 -82 L13 180 L-13 180 Z" fill="#1a1020" />
      <path d="M-9 -80 L-9 180 M6 -82 L6 180" stroke="#3b2736" strokeWidth="2" />
      <g fill="#20142a">
        <path d="M-40 -96 C-36 -130 6 -146 26 -122 C34 -110 24 -92 6 -86 L-30 -82 L-62 -68 Z" />
        <path d="M14 -128 C6 -148 14 -170 30 -172 C42 -173 46 -164 44 -158 C34 -158 30 -150 34 -132 Z" />
        <path d="M36 -172 L92 -146 L48 -152 Q40 -138 34 -152 Z" fill="#b5533a" />
        <path d="M-2 -86 L-6 -82 M6 -88 L6 -82" stroke="#20142a" strokeWidth="4" />
      </g>
      <circle cx="35" cy="-164" r="2" fill="#ffd98c" />
    </g>
  );
}

function Front({ level, p, boat }: { level: Level; p: Palette; boat: BoatPaint }) {
  const art = useMemo(() => {
    const r = seeded(level === "pond" ? 503 : level === "river" ? 607 : 709);
    const clump = (cx: number, base: number, count: number, h: number, spread: number, w = 6) => ({
      d: blades(r, cx, base, count, h, spread, w),
      x: cx,
      base,
    });
    if (level === "river") {
      return {
        grass: [
          clump(330, 930, 30, 300, 180, 7),
          clump(1460, 930, 34, 380, 230, 8),
          clump(1190, 940, 22, 210, 170, 6),
          clump(560, 940, 14, 130, 150, 5),
        ],
        tree: null,
        pads: [] as { x: number; y: number; s: number }[],
        knees: "",
      };
    }
    if (level === "pond") {
      return {
        grass: [clump(1390, 930, 20, 190, 170, 6), clump(380, 930, 14, 130, 150, 5)],
        tree: cypress(r, 1490, 860, 980, 2.1),
        pads: [
          { x: 470, y: 720, s: 1.1 },
          { x: 560, y: 770, s: 1.5 },
          { x: 690, y: 730, s: 0.9 },
          { x: 1160, y: 700, s: 1.1 },
          { x: 1240, y: 760, s: 1.6 },
          { x: 1090, y: 620, s: 0.62 },
          { x: 440, y: 610, s: 0.6 },
        ],
        knees: knees(r, 1290, 830, 7, 240),
      };
    }
    return { grass: [clump(1490, 930, 12, 120, 150, 5)], tree: null, pads: [], knees: "" };
  }, [level]);

  const nearInk = p.near;
  return (
    <svg className="layer" viewBox={VIEW} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {art.tree && (
        <g fill={nearInk}>
          <path d={art.tree.trunk} />
          <path d={art.tree.crown} />
          <path className="moss" d={art.tree.moss} />
        </g>
      )}
      {art.knees && <path d={art.knees} fill={nearInk} />}
      {art.pads.map((pad, i) => (
        <g key={i} className="pad" style={{ animationDelay: `${-i * 1.3}s` }}>
          <g transform={`translate(${pad.x} ${pad.y}) scale(${pad.s})`}>
            <path d="M0 0 L-3 -13 A36 13 0 1 0 8 -12.6 Z" fill="#2f5f40" />
            <path d="M0 0 L-3 -13 M0 0 L-26 -5 M0 0 L24 -6 M0 0 L-14 8 M0 0 L16 8" stroke="#7fa768" strokeWidth="0.9" />
            {i % 3 === 0 && (
              <g transform="translate(18 -2)">
                <path d="M0 0 L-9 -7 L-4 -6 L-5 -13 L-1 -8 L1 -15 L3 -8 L7 -13 L6 -6 L10 -7 Z" fill="#f8efd6" />
                <circle cx="0.5" cy="-3" r="2.2" fill="#e8b92e" />
              </g>
            )}
          </g>
        </g>
      ))}
      {art.grass.map((c, i) => (
        <path
          key={i}
          className="sway"
          d={c.d}
          fill={p.grass[i % 2]}
          style={{
            transformOrigin: `${c.x}px ${c.base}px`,
            animationDelay: `${-i * 1.7}s`,
          }}
        />
      ))}
      <Boat paint={boat} />
    </svg>
  );
}

/** You: sitting in the stern of an old green jon boat, looking up over the bow. */
function Boat({ paint }: { paint: BoatPaint }) {
  return (
    <g>
      <path d="M396 910 C470 830 620 758 800 742 C980 758 1130 830 1204 910 Z" fill={paint.hull} />
      <path d="M430 910 C500 842 640 782 800 766 C960 782 1100 842 1170 910 Z" fill="#14201b" />
      <path d="M396 910 C470 830 620 758 800 742 C980 758 1130 830 1204 910 L1170 910 C1100 842 960 782 800 766 C640 782 500 842 430 910 Z" fill={paint.rim} />
      <path d="M452 868 C530 806 650 768 800 752" stroke="#30483a" strokeWidth="2" strokeDasharray="1 16" strokeLinecap="round" fill="none" />
      <path d="M1148 868 C1070 806 950 768 800 752" stroke="#30483a" strokeWidth="2" strokeDasharray="1 16" strokeLinecap="round" fill="none" />
      <path d="M545 844 Q800 806 1055 844 L1072 868 Q800 830 528 868 Z" fill={paint.seat} />
      <path d="M528 868 Q800 830 1072 868 L1072 876 Q800 838 528 876 Z" fill="#5c4526" />
      {/* Tackle box on the seat. */}
      <g transform="translate(975 836) rotate(4)">
        <rect x="0" y="-30" width="96" height="46" fill={paint.box} />
        <rect x="0" y="-30" width="96" height="14" fill="#fff" opacity="0.14" />
        <rect x="40" y="-22" width="16" height="10" fill="#e4d6ae" />
        <path d="M30 -30 Q48 -44 66 -30" stroke="#2a2019" strokeWidth="4" fill="none" />
      </g>
    </g>
  );
}

export const Scene = memo(function Scene({
  level,
  dread,
  theme,
  boat,
}: {
  level: Level;
  dread: number;
  theme: string;
  boat: BoatPaint;
}) {
  const p = paletteFor(level, theme);
  return (
    <>
      <Backdrop level={level} p={p} />
      <Life level={level} dread={dread} p={p} />
      <Front level={level} p={p} boat={boat} />
    </>
  );
});

export const Grain = memo(function Grain() {
  return <div className="grain" aria-hidden="true" />;
});
