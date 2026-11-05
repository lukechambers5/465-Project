// Progress lives in this browser's localStorage. Anything unreadable or left
// over from an older version is dropped instead of crashing the game.
import type { Level } from "../data/messages";
import { SPECIES } from "../data/species";
import type { CaughtFish } from "./fishgen";
import { FINISHES } from "./fishgen";
import type { Slot } from "./catalog";
import { RARITIES } from "./rarity";

const KEY = "phish-fishing-save-v1";

export interface Save {
  coins: number;
  fish: CaughtFish[];
  /** Message ids written up in the field guide. */
  guide: number[];
  score: { correct: number; total: number };
  owned: string[];
  equipped: Record<Slot, string>;
  level: Level;
}

export const NEW_SAVE: Save = {
  coins: 0,
  fish: [],
  guide: [],
  score: { correct: 0, total: 0 },
  owned: [],
  equipped: { rod: "cane", bobber: "classic", boat: "army", theme: "classic" },
  level: "pond",
};

function validFish(f: unknown): f is CaughtFish {
  const x = f as CaughtFish;
  return (
    !!x &&
    typeof x.id === "string" &&
    typeof x.seed === "number" &&
    typeof x.float === "number" &&
    typeof x.lbs === "number" &&
    x.kind in SPECIES &&
    RARITIES.includes(x.rarity) &&
    FINISHES[x.rarity].some((fin) => fin.name === x.finish)
  );
}

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return NEW_SAVE;
    const s = JSON.parse(raw) as Partial<Save>;
    return {
      ...NEW_SAVE,
      coins: typeof s.coins === "number" && s.coins >= 0 ? s.coins : 0,
      fish: Array.isArray(s.fish) ? s.fish.filter(validFish) : [],
      guide: Array.isArray(s.guide) ? s.guide.filter((n) => typeof n === "number") : [],
      score: s.score ?? NEW_SAVE.score,
      owned: Array.isArray(s.owned) ? s.owned : [],
      equipped: { ...NEW_SAVE.equipped, ...s.equipped },
      level: s.level === "river" || s.level === "ocean" ? s.level : "pond",
    };
  } catch {
    return NEW_SAVE;
  }
}

export function writeSave(save: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Private window or full storage: the game still plays, it just won't persist.
  }
}
