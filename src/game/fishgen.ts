// Every phish you land becomes one unique fish. Like a weapon skin, it has a
// finish, a pattern seed that decides exactly how that finish falls on the body,
// a color shift, and a wear value. Two "Burnt Sunset" fish never look the same.
import type { Level } from "../data/messages";
import { POOLS, SPECIES } from "../data/species";
import type { FishKind } from "../data/species";
import { RARITY } from "./rarity";
import type { Rarity } from "./rarity";

export type PatternKind = "fade" | "camo" | "blotch" | "veins" | "tiger" | "web" | "scales" | "speckle";

export interface Finish {
  name: string;
  pattern: PatternKind;
  /** Base gradient, belly-to-back or nose-to-tail depending on the seed. */
  stops: string[];
  /** Colors laid over the base by the pattern. */
  accents: string[];
  /** Max hue drift in degrees, per fish. Gold stays near gold, camo wanders. */
  drift: number;
  /** Moving light across the body. */
  sheen?: boolean;
}

export const FINISHES: Record<Rarity, Finish[]> = {
  common: [
    { name: "Swamp Camo", pattern: "camo", stops: ["#5e6b3a", "#7d7d4e", "#4a5230"], accents: ["#2f3a22", "#a39a68"], drift: 14 },
    { name: "Mudflat", pattern: "blotch", stops: ["#7a6242", "#94805a", "#5a4630"], accents: ["#3f2f1d", "#ad9a72"], drift: 10 },
    { name: "Tannin Wash", pattern: "fade", stops: ["#c39a57", "#8f6a35", "#54401f"], accents: [], drift: 12 },
    { name: "Driftwood", pattern: "veins", stops: ["#9a9a8c", "#73766e", "#55584f"], accents: ["#32352f", "#c3c3b2"], drift: 16 },
  ],
  rare: [
    { name: "Gulf Stream", pattern: "fade", stops: ["#7fe6e0", "#2a93d6", "#173e9c"], accents: [], drift: 16 },
    { name: "Cobalt Scales", pattern: "scales", stops: ["#3f6fe8", "#2441a8", "#16245f"], accents: ["#9fc0ff"], drift: 14 },
    { name: "Slough Tiger", pattern: "tiger", stops: ["#3a75d8", "#2b57b0", "#1c3a80"], accents: ["#0e1a3f", "#f2a13a"], drift: 12 },
    { name: "Rain Curtain", pattern: "veins", stops: ["#9dc4e8", "#5284c4", "#2d4f8c"], accents: ["#e6f2ff", "#1c3360"], drift: 14 },
  ],
  epic: [
    { name: "Spoonbill Fade", pattern: "fade", stops: ["#ffc2d9", "#f05fa6", "#7b2cc4"], accents: [], drift: 18 },
    { name: "Nightshade Web", pattern: "web", stops: ["#451a78", "#29104d", "#150829"], accents: ["#ee4fd8"], drift: 18 },
    { name: "Glass Minnow", pattern: "speckle", stops: ["#6ff5ea", "#7b6cf0", "#8a23c9"], accents: ["#ffffff", "#ffb4f4"], drift: 22 },
    { name: "Bruised Sky", pattern: "blotch", stops: ["#7d3fd6", "#3f58c8", "#20897f"], accents: ["#e04fd0", "#17123f"], drift: 20 },
  ],
  legendary: [
    { name: "Burnt Sunset", pattern: "fade", stops: ["#ffe36b", "#ff7a2e", "#d11c3a", "#5b0f4a"], accents: [], drift: 12, sheen: true },
    { name: "Hardened Gator", pattern: "blotch", stops: ["#c79a3a", "#7d6a4a", "#2f6fbf"], accents: ["#1e54c4", "#f2c744"], drift: 10, sheen: true },
    { name: "Lava Tiger", pattern: "tiger", stops: ["#ff9b2e", "#e8421c", "#a01212"], accents: ["#190805", "#ffe08a"], drift: 10, sheen: true },
    { name: "Coral Marble", pattern: "veins", stops: ["#ffd8c9", "#ff6d5e", "#b5173d"], accents: ["#fff6ef", "#6a0d2a"], drift: 12, sheen: true },
  ],
  mythic: [
    { name: "Spanish Doubloon", pattern: "scales", stops: ["#fff3b0", "#f2c230", "#a4700d"], accents: ["#fffbe0"], drift: 5, sheen: true },
    { name: "Black Pearl", pattern: "speckle", stops: ["#2a1f55", "#10182f", "#06392f"], accents: ["#62f5ff", "#ff5ee2", "#fff27a"], drift: 28, sheen: true },
    { name: "Aurora Australis", pattern: "fade", stops: ["#6affb0", "#35c8ff", "#8a5cff", "#ff5ccf", "#ffd34d"], accents: [], drift: 40, sheen: true },
    { name: "Ghost Orchid", pattern: "web", stops: ["#ffffff", "#dbeeff", "#f4d4ff"], accents: ["#7f6cff"], drift: 30, sheen: true },
  ],
};

export interface Wear {
  name: string;
  /** Upper bound on the wear value for this grade. */
  max: number;
  price: number;
}

export const WEARS: Wear[] = [
  { name: "Fresh Catch", max: 0.07, price: 1.5 },
  { name: "Lively", max: 0.15, price: 1.2 },
  { name: "Stringer-Worn", max: 0.38, price: 1 },
  { name: "Waterlogged", max: 0.45, price: 0.85 },
  { name: "Gator-Bit", max: 1, price: 0.7 },
];

export function wearOf(float: number): Wear {
  return WEARS.find((w) => float <= w.max) ?? WEARS[WEARS.length - 1];
}

export interface CaughtFish {
  id: string;
  /** Pattern seed: drives every random choice in how the skin is drawn. */
  seed: number;
  kind: FishKind;
  level: Level;
  rarity: Rarity;
  finish: string;
  /** Wear, 0 is flawless. */
  float: number;
  lbs: number;
  /** About 1 in 25: worth double and marked with a star. */
  trophy: boolean;
  technique: string;
  caughtAt: number;
}

export function finishOf(fish: Pick<CaughtFish, "rarity" | "finish">): Finish {
  return FINISHES[fish.rarity].find((f) => f.name === fish.finish) ?? FINISHES[fish.rarity][0];
}

export function fishName(fish: Pick<CaughtFish, "kind" | "finish">): string {
  return `${fish.finish} ${SPECIES[fish.kind].name}`;
}

/** Sale price: tier base, then wear, then how big it is for its species. */
export function fishValue(fish: CaughtFish): number {
  const [lo, hi] = SPECIES[fish.kind].lbs;
  const sizeBonus = 1 + (0.4 * (fish.lbs - lo)) / (hi - lo);
  const raw = RARITY[fish.rarity].price * wearOf(fish.float).price * sizeBonus * (fish.trophy ? 2 : 1);
  return Math.max(1, Math.round(raw));
}

const pick = <T,>(list: T[], r = Math.random()) => list[Math.floor(r * list.length)];

export function generateFish(level: Level, rarity: Rarity, technique: string): CaughtFish {
  const kind = pick(POOLS[level]);
  const [lo, hi] = SPECIES[kind].lbs;
  // Squared so big fish are the unusual ones.
  const lbs = lo + Math.pow(Math.random(), 2.2) * (hi - lo);
  return {
    id: `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    seed: Math.floor(Math.random() * 1000),
    kind,
    level,
    rarity,
    finish: pick(FINISHES[rarity]).name,
    // Skewed toward the worn middle: truly fresh fish are the prized ones.
    float: Math.pow(Math.random(), 1.4) * 0.8,
    lbs: Math.round(lbs * 10) / 10,
    trophy: Math.random() < 0.04,
    technique,
    caughtAt: Date.now(),
  };
}
