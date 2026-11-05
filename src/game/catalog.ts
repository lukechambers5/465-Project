// Everything the Bait Shop sells. First item in each list is what you start with.

export interface Rod {
  id: string;
  name: string;
  price: number;
  blurb: string;
  /** Tilts the rarity odds upward. See oddsFor(). */
  luck: number;
  /** Multiplies how long you wait for a bite. */
  bite: number;
  blank: string;
  grip: string;
  reel: string;
}

export const RODS: Rod[] = [
  { id: "cane", name: "Granddad's Cane Pole", price: 0, blurb: "Bamboo and stubbornness.", luck: 0, bite: 1, blank: "#1a1410", grip: "#b98d55", reel: "#a23c2b" },
  { id: "spinner", name: "Glades Spinner", price: 150, blurb: "A proper reel. Fish notice.", luck: 0.15, bite: 0.9, blank: "#26402f", grip: "#c7a06a", reel: "#d9d2bd" },
  { id: "graphite", name: "Snook Stick Graphite", price: 600, blurb: "Feels every nibble.", luck: 0.35, bite: 0.8, blank: "#23242b", grip: "#30343d", reel: "#3a7bd5" },
  { id: "surf", name: "Silver King Surf Rod", price: 2000, blurb: "Built for things that fight back.", luck: 0.6, bite: 0.7, blank: "#c7ced4", grip: "#1f2a33", reel: "#e8552d" },
  { id: "mangrove", name: "Mangrove Heartwood", price: 7000, blurb: "Carved from a tree that's seen everything.", luck: 1, bite: 0.55, blank: "#7a2a12", grip: "#f2c230", reel: "#ffd34d" },
];

export interface Bobber {
  id: string;
  name: string;
  price: number;
  top: string;
  bottom: string;
}

export const BOBBERS: Bobber[] = [
  { id: "classic", name: "Red & White", price: 0, top: "#c8331f", bottom: "#fbf4e0" },
  { id: "gator", name: "Gator Back", price: 60, top: "#3f6a3a", bottom: "#d9cf8f" },
  { id: "gulf", name: "Gulf Blue", price: 90, top: "#1f7fd1", bottom: "#fff3cf" },
  { id: "flamingo", name: "Yard Flamingo", price: 180, top: "#ff5f9e", bottom: "#ffe1ec" },
  { id: "gold", name: "Pirate's Gold", price: 500, top: "#f2c230", bottom: "#fff3b0" },
];

export interface BoatPaint {
  id: string;
  name: string;
  price: number;
  hull: string;
  rim: string;
  seat: string;
  box: string;
}

export const BOATS: BoatPaint[] = [
  { id: "army", name: "Army Surplus Green", price: 0, hull: "#23362d", rim: "#4c6b4e", seat: "#8a6a3d", box: "#a23c2b" },
  { id: "rust", name: "Honest Rust", price: 120, hull: "#3d2317", rim: "#8c4a26", seat: "#6f5a3e", box: "#3a5b6e" },
  { id: "keywest", name: "Key West Teal", price: 300, hull: "#0e4a4e", rim: "#3fb3a8", seat: "#e8d8ae", box: "#f06a4a" },
  { id: "airboat", name: "Airboat Flames", price: 650, hull: "#16161a", rim: "#e8552d", seat: "#2d2d33", box: "#f2c230" },
  { id: "chrome", name: "Lottery Winner Chrome", price: 1500, hull: "#5b6670", rim: "#dfe6ea", seat: "#1f2a33", box: "#c7ced4" },
];

export interface Theme {
  id: string;
  name: string;
  price: number;
  blurb: string;
  /** Sky-to-water swatch for the shop tag. */
  swatch: string[];
}

export const THEMES: Theme[] = [
  { id: "classic", name: "True to Life", price: 0, blurb: "Each water at its own hour.", swatch: ["#6f9c92", "#eadaa0", "#55694a", "#162822"] },
  { id: "moon", name: "Full Moon", price: 400, blurb: "Everything's out. Everything's watching.", swatch: ["#070d24", "#435e8c", "#1d3056", "#060d1c"] },
  { id: "storm", name: "Hurricane Watch", price: 800, blurb: "That green sky your grandma warned you about.", swatch: ["#2a3531", "#c6c178", "#435742", "#111c17"] },
  { id: "postcard", name: "1958 Postcard", price: 1400, blurb: "Greetings from sunny Florida!", swatch: ["#14a0b5", "#ff8a8a", "#17a0ad", "#043f54"] },
  { id: "redtide", name: "Red Tide", price: 2500, blurb: "The water's wrong today.", swatch: ["#3a1016", "#e89c4c", "#8c2424", "#26090e"] },
];

export type Slot = "rod" | "bobber" | "boat" | "theme";

export const rodById = (id: string) => RODS.find((x) => x.id === id) ?? RODS[0];
export const bobberById = (id: string) => BOBBERS.find((x) => x.id === id) ?? BOBBERS[0];
export const boatById = (id: string) => BOATS.find((x) => x.id === id) ?? BOATS[0];
