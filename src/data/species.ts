// The fish themselves. What you hook depends on the water; what it's worth
// depends on the rarity of the phish it carried. See game/fishgen.ts.
import type { Level } from "./messages";

export type FishKind =
  | "bass"
  | "bluegill"
  | "catfish"
  | "gar"
  | "snook"
  | "cichlid"
  | "tarpon"
  | "redfish"
  | "permit"
  | "mullet";

export interface Species {
  name: string;
  latin: string;
  /** Size range in pounds. */
  lbs: [number, number];
}

export const SPECIES: Record<FishKind, Species> = {
  bass: { name: "Largemouth Bass", latin: "Micropterus salmoides", lbs: [1, 11] },
  bluegill: { name: "Bluegill", latin: "Lepomis macrochirus", lbs: [0.3, 2] },
  catfish: { name: "Walking Catfish", latin: "Clarias batrachus", lbs: [1, 7] },
  gar: { name: "Florida Gar", latin: "Lepisosteus platyrhincus", lbs: [1, 9] },
  snook: { name: "Common Snook", latin: "Centropomus undecimalis", lbs: [3, 30] },
  cichlid: { name: "Mayan Cichlid", latin: "Mayaheros urophthalmus", lbs: [0.5, 3] },
  tarpon: { name: "Silver King Tarpon", latin: "Megalops atlanticus", lbs: [30, 180] },
  redfish: { name: "Redfish", latin: "Sciaenops ocellatus", lbs: [4, 40] },
  permit: { name: "Permit", latin: "Trachinotus falcatus", lbs: [8, 45] },
  mullet: { name: "Honest Mullet", latin: "Mugil cephalus", lbs: [1, 6] },
};

/** What's swimming in each water. */
export const POOLS: Record<Level, FishKind[]> = {
  pond: ["bass", "bluegill", "catfish"],
  river: ["gar", "snook", "cichlid"],
  ocean: ["tarpon", "redfish", "permit"],
};

const GUIDE_FISH: FishKind[] = [...POOLS.pond, ...POOLS.river, ...POOLS.ocean];

/** A stable illustration for a technique's field-guide plate. */
export function guideFishFor(technique: string): FishKind {
  let h = 0;
  for (const c of technique) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GUIDE_FISH[h % GUIDE_FISH.length];
}

export const WATERS: Record<Level, { name: string; hint: string }> = {
  pond: { name: "Gator Hole", hint: "easy water" },
  river: { name: "Shark River Slough", hint: "moving water" },
  ocean: { name: "Florida Bay", hint: "open water" },
};
