import { useEffect, useRef } from "react";
import type { FishKind } from "../data/species";
import type { Bobber, Rod } from "../game/catalog";
import type { CaughtFish } from "../game/fishgen";
import { HEIGHT, WIDTH } from "./generators";
import Fish, { SkinnedFish } from "./Fish";

export type Phase = "idle" | "casting" | "waiting" | "bite" | "landed";

const BUTT = { x: 905, y: 880 };
const ROD_LENGTH = 560;
const REST_ANGLE = -1.98; // radians, up and to the left
const TARGET = { x: 610, y: 640 };
export const CAST_MS = 950;

interface Props {
  phase: Phase;
  /** Set once the fish is decided: which fish, and was it hauled up or let go. */
  landed: { caught: CaughtFish | null; printKind: FishKind; reeled: boolean } | null;
  rod: Rod;
  bobber: Bobber;
}

/**
 * Rod, line and bobber. They run on one requestAnimationFrame loop and write
 * straight to the SVG attributes, because the line has to stay attached to two
 * moving points every frame and that shouldn't re-render React at 60fps.
 */
export default function Tackle({ phase, landed, rod: gear, bobber: bobberPaint }: Props) {
  const rod = useRef<SVGPathElement>(null);
  const rodThin = useRef<SVGPathElement>(null);
  const line = useRef<SVGPathElement>(null);
  const bobber = useRef<SVGGElement>(null);
  const handle = useRef<SVGGElement>(null);
  // Outlives phase changes, so the bobber carries on from wherever it was.
  const bobberPos = useRef({ x: 0, y: 0, ready: false });

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = bobberPos.current;
    const phaseStart = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = now - phaseStart;
      const clock = still ? 0 : now / 1000;

      // Rod angle and bend for the current moment.
      let angle = REST_ANGLE + Math.sin(clock * 0.9) * 0.008;
      let bend = 10;
      if (phase === "casting" && !still) {
        if (t < 280) {
          angle = REST_ANGLE + (t / 280) * 0.62;
          bend = 10 - (t / 280) * 34;
        } else if (t < 480) {
          const k = (t - 280) / 200;
          angle = REST_ANGLE + 0.62 - k * 0.9;
          bend = -24 + k * 74;
        } else {
          const k = Math.min(1, (t - 480) / 420);
          angle = REST_ANGLE - 0.28 * (1 - k);
          bend = 50 * (1 - k) * Math.cos(k * 14) + 10;
        }
      }
      if (phase === "bite") {
        angle = REST_ANGLE - 0.06 + (still ? 0 : Math.sin(clock * 21) * 0.012);
        bend = 54 + (still ? 0 : Math.sin(clock * 17) * 10);
      }

      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const tip = {
        x: BUTT.x + dx * ROD_LENGTH - dy * bend,
        y: BUTT.y + dy * ROD_LENGTH + dx * bend + Math.abs(bend) * 0.8,
      };
      const ctrl = { x: BUTT.x + dx * ROD_LENGTH * 0.62, y: BUTT.y + dy * ROD_LENGTH * 0.62 };
      const third = { x: BUTT.x + dx * ROD_LENGTH * 0.32, y: BUTT.y + dy * ROD_LENGTH * 0.32 };
      rodThin.current?.setAttribute(
        "d",
        `M${BUTT.x} ${BUTT.y} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`,
      );
      // The thick butt section is the first part of that same curve, split at
      // 55%, so the two sections stay one rod however far it bends.
      const k = 0.55;
      const c1 = { x: BUTT.x + (ctrl.x - BUTT.x) * k, y: BUTT.y + (ctrl.y - BUTT.y) * k };
      const c2 = { x: ctrl.x + (tip.x - ctrl.x) * k, y: ctrl.y + (tip.y - ctrl.y) * k };
      const split = { x: c1.x + (c2.x - c1.x) * k, y: c1.y + (c2.y - c1.y) * k };
      rod.current?.setAttribute(
        "d",
        `M${BUTT.x} ${BUTT.y} Q${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${split.x.toFixed(1)} ${split.y.toFixed(1)}`,
      );
      handle.current?.setAttribute(
        "transform",
        `translate(${third.x.toFixed(1)} ${third.y.toFixed(1)}) rotate(${((angle * 180) / Math.PI + 90).toFixed(2)})`,
      );

      // Where the bobber wants to be.
      const hang = { x: tip.x + Math.sin(clock * 1.3) * 7, y: tip.y + 58 };
      if (!pos.ready) {
        pos.x = hang.x;
        pos.y = hang.y;
        pos.ready = true;
      }
      let sag = 8;
      if (phase === "casting" && !still) {
        if (t < 400) {
          pos.x = hang.x + (t / 400) * 14;
          pos.y = hang.y;
        } else {
          const k = Math.min(1, (t - 400) / (CAST_MS - 400));
          const ease = 1 - Math.pow(1 - k, 2);
          pos.x = tip.x + (TARGET.x - tip.x) * ease;
          pos.y = tip.y + (TARGET.y - tip.y) * ease - Math.sin(k * Math.PI) * 170;
          sag = 8 + Math.sin(k * Math.PI) * 64;
        }
      } else if (phase === "casting" || phase === "waiting" || phase === "bite") {
        const bobY = phase === "bite"
          ? TARGET.y + 13 + (still ? 0 : Math.sin(clock * 22) * 5)
          : TARGET.y + (still ? 0 : Math.sin(clock * 2.1) * 2.5);
        pos.x += (TARGET.x - pos.x) * 0.3;
        pos.y += (bobY - pos.y) * 0.3;
        sag = phase === "bite" ? 2 : 30;
      } else {
        // Reeling back in.
        pos.x += (hang.x - pos.x) * (still ? 1 : 0.075);
        pos.y += (hang.y - pos.y) * (still ? 1 : 0.075);
        sag = 4;
      }

      const midX = (tip.x + pos.x) / 2;
      const midY = (tip.y + pos.y) / 2 + sag;
      line.current?.setAttribute(
        "d",
        `M${tip.x.toFixed(1)} ${tip.y.toFixed(1)} Q${midX.toFixed(1)} ${midY.toFixed(1)} ${pos.x.toFixed(1)} ${(pos.y - 10).toFixed(1)}`,
      );
      bobber.current?.setAttribute("transform", `translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`);

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const onWater = phase === "waiting" || phase === "bite";

  return (
    <svg className="layer tackle" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <clipPath id="above-water">
          <rect x="-200" y="-200" width="2000" height={onWater ? TARGET.y + 208 : 1400} />
        </clipPath>
      </defs>

      {onWater && (
        <g
          key={phase}
          className={phase === "bite" ? "rings rings-bite" : "rings"}
          fill="none"
          stroke="#f8f0d4"
        >
          <ellipse cx={TARGET.x} cy={TARGET.y + 8} rx="20" ry="5" />
          <ellipse cx={TARGET.x} cy={TARGET.y + 8} rx="20" ry="5" />
          <ellipse cx={TARGET.x} cy={TARGET.y + 8} rx="20" ry="5" />
        </g>
      )}

      {phase === "bite" && (
        <ellipse className="shadow-fish" cx={TARGET.x + 6} cy={TARGET.y + 44} rx="82" ry="15" fill="#000" opacity="0.32" />
      )}

      {landed && !landed.reeled && (
        <ellipse className="swim-off" cx={TARGET.x} cy={TARGET.y + 40} rx="70" ry="12" fill="#000" opacity="0.32" />
      )}

      <path ref={line} fill="none" stroke="#f6f0dc" strokeWidth="1.5" opacity="0.9" />

      <g clipPath="url(#above-water)">
        <g ref={bobber}>
          <path d="M0 -24 L0 -12" stroke="#f6f0dc" strokeWidth="2.4" />
          <path d="M-12 0 A12 12 0 0 1 12 0 Z" fill={bobberPaint.top} />
          <path d="M-12 0 A12 12 0 0 0 12 0 Z" fill={bobberPaint.bottom} />
          <rect x="-12.5" y="-1.2" width="25" height="2.4" fill="#231a14" />
        </g>
      </g>

      {landed?.reeled && (
        <g className="leap">
          {landed.caught ? (
            <SkinnedFish fish={landed.caught} x={TARGET.x - 95} y={TARGET.y - 70} width={190} height={92} />
          ) : (
            <Fish kind={landed.printKind} x={TARGET.x - 95} y={TARGET.y - 70} width={190} height={92} />
          )}
        </g>
      )}
      {landed?.reeled && (
        <g className="splash" fill="#f8f0d4">
          <circle cx={TARGET.x - 34} cy={TARGET.y - 2} r="4" />
          <circle cx={TARGET.x - 10} cy={TARGET.y - 8} r="3" />
          <circle cx={TARGET.x + 28} cy={TARGET.y - 4} r="4.5" />
          <circle cx={TARGET.x + 48} cy={TARGET.y + 2} r="2.5" />
        </g>
      )}

      {/* Rod: blank and thin tip section, then cork grip and spinning reel. */}
      <path ref={rodThin} fill="none" stroke={gear.blank} strokeWidth="3.4" strokeLinecap="round" />
      <path ref={rod} fill="none" stroke={gear.blank} strokeWidth="6.5" strokeLinecap="round" />
      <g ref={handle}>
        <rect x="-6" y="90" width="12" height="96" rx="5" fill={gear.grip} />
        <path d="M-6 112 H6 M-6 134 H6 M-6 156 H6" stroke="#000" strokeOpacity="0.25" strokeWidth="1.5" />
        <g transform="translate(-4 72)">
          <rect x="-22" y="-14" width="22" height="30" rx="6" fill="#23201c" />
          <rect x="-28" y="-6" width="10" height="14" rx="2" fill={gear.reel} />
          <path d="M-22 16 L-34 26" stroke="#b9ad8e" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
