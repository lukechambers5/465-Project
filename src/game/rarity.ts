import type { Level } from "../data/messages";

export const RARITIES = ["common", "rare", "epic", "legendary", "mythic"] as const;
export type Rarity = (typeof RARITIES)[number];

interface RarityInfo {
  label: string;
  /** Tier color, on dark backgrounds. */
  color: string;
  /** Same tier, dark enough to read on paper. */
  ink: string;
  /** What a fish of this tier sells for before wear, size and trophy. */
  price: number;
  /** Coins for correctly letting a legit message of this tier go. */
  legitPay: [number, number];
  blurb: string;
}

export const RARITY: Record<Rarity, RarityInfo> = {
  common: {
    label: "Common",
    color: "#b4c4cc",
    ink: "#55666e",
    price: 8,
    legitPay: [25, 60],
    blurb: "Typos, fake title, fake address. Wrong on all three counts.",
  },
  rare: {
    label: "Rare",
    color: "#5b86ff",
    ink: "#2c4fb8",
    price: 25,
    legitPay: [40, 90],
    blurb: "One of title, address or text looks right. The others don't.",
  },
  epic: {
    label: "Epic",
    color: "#b45cff",
    ink: "#7a2fc2",
    price: 80,
    legitPay: [70, 140],
    blurb: "State of the art: AI writing, session theft, cloned voices.",
  },
  legendary: {
    label: "Legendary",
    color: "#ff5a3c",
    ink: "#bb2f16",
    price: 300,
    legitPay: [110, 200],
    blurb: "Very real. Hijacked threads and trusted services.",
  },
  mythic: {
    label: "Mythic",
    color: "#ffd34d",
    ink: "#96700a",
    price: 1200,
    legitPay: [170, 250],
    blurb: "Spoofed real senders and hidden payloads. Check the headers.",
  },
};

/** A coin payout from 25 to 250: harder legit messages pay better. */
export function rollLegitPay(rarity: Rarity): number {
  const [lo, hi] = RARITY[rarity].legitPay;
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/** Base chance of each tier by water, in percent. Zero stays zero with any rod. */
const ODDS: Record<Level, Record<Rarity, number>> = {
  pond: { common: 72, rare: 24, epic: 4, legendary: 0, mythic: 0 },
  river: { common: 30, rare: 40, epic: 24, legendary: 5.5, mythic: 0.5 },
  ocean: { common: 8, rare: 22, epic: 38, legendary: 25, mythic: 7 },
};

/** Odds with a rod's luck applied: each tier up gets boosted a little more. */
export function oddsFor(level: Level, luck: number): Record<Rarity, number> {
  const base = ODDS[level];
  const weighted = RARITIES.map((r, tier) => base[r] * Math.pow(1 + luck, tier));
  const total = weighted.reduce((a, b) => a + b, 0);
  return Object.fromEntries(
    RARITIES.map((r, i) => [r, (weighted[i] / total) * 100]),
  ) as Record<Rarity, number>;
}

export function rollRarity(level: Level, luck: number, roll = Math.random()): Rarity {
  const odds = oddsFor(level, luck);
  let point = roll * 100;
  for (const r of RARITIES) {
    point -= odds[r];
    if (point < 0) return r;
  }
  return "common";
}
